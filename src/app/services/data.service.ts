import { Injectable, computed, effect, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cartao, Categoria, Renda, Transacao, PIX } from '../models';

function mapTx(row: any): Transacao {
  return {
    id: row.id,
    desc: row.description,
    amount: Number(row.amount),
    category: row.category,
    card: row.card,
    installments: row.installments,
    date: row.tx_date,
    createdAt: Date.parse(row.created_at),
  };
}
function mapCategory(row: any): Categoria & { id: string } {
  return { id: row.id, name: row.name, budget: Number(row.budget) };
}
function mapCard(row: any): Cartao & { id: string } {
  return {
    id: row.id,
    name: row.name,
    limit: Number(row.card_limit),
    dueDay: row.due_day ?? null,
  };
}
function mapIncome(row: any): Renda {
  return {
    id: row.id,
    desc: row.description,
    amount: Number(row.amount),
    date: row.income_date,
    createdAt: Date.parse(row.created_at),
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly transactions = signal<(Transacao & { id: string })[]>([]);
  readonly categories = signal<(Categoria & { id: string })[]>([]);
  readonly cards = signal<(Cartao & { id: string })[]>([]);
  readonly incomes = signal<Renda[]>([]);
  readonly loading = signal(true);

  readonly totalReceita = computed(() =>
    this.incomes().reduce((s, r) => s + Number(r.amount || 0), 0)
  );

  readonly totalGasto = computed(() =>
    this.transactions().reduce((s, t) => s + Number(t.amount || 0), 0)
  );

  // Pix desconta o saldo na hora. Cartão de crédito não — mexe só no limite do cartão.
  readonly gastoImediato = computed(() =>
    this.transactions()
      .filter((t) => t.card === PIX)
      .reduce((s, t) => s + Number(t.amount || 0), 0)
  );

  readonly saldo = computed(() => this.totalReceita() - this.gastoImediato());

  readonly byCategory = computed(() =>
    this.categories().map((c) => ({
      ...c,
      total: this.transactions()
        .filter((t) => t.category === c.name)
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    }))
  );

  readonly byCard = computed(() =>
    this.cards().map((c) => ({
      ...c,
      total: this.transactions()
        .filter((t) => t.card === c.name)
        .reduce((s, t) => s + Number(t.amount || 0), 0),
    }))
  );

  // Soma apenas cartões com limite definido (limite > 0).
  readonly totalLimiteCredito = computed(() =>
    this.byCard().reduce((s, c) => s + (c.limit > 0 ? c.limit : 0), 0)
  );

  readonly totalUsadoCredito = computed(() =>
    this.byCard().reduce((s, c) => s + (c.limit > 0 ? c.total : 0), 0)
  );

  readonly creditoDisponivel = computed(() =>
    Math.max(0, this.totalLimiteCredito() - this.totalUsadoCredito())
  );

  private get uid(): string {
    return this.supabase.user()!.id;
  }
  private get db() {
    return this.supabase.client;
  }

  constructor(private supabase: SupabaseService) {
    effect(
      () => {
        const user = this.supabase.user();
        if (user) {
          this.loadAll();
        } else {
          this.transactions.set([]);
          this.categories.set([]);
          this.cards.set([]);
          this.incomes.set([]);
        }
      },
      { allowSignalWrites: true }
    );
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    const [txRes, catRes, cardRes, incomeRes] = await Promise.all([
      this.db.from('transactions').select('*').order('created_at', { ascending: false }),
      this.db.from('categories').select('*').order('created_at', { ascending: true }),
      this.db.from('cards').select('*').order('created_at', { ascending: true }),
      this.db.from('incomes').select('*').order('created_at', { ascending: false }),
    ]);

    this.transactions.set((txRes.data ?? []).map(mapTx) as any);
    this.categories.set((catRes.data ?? []).map(mapCategory) as any);
    this.cards.set((cardRes.data ?? []).map(mapCard) as any);
    this.incomes.set((incomeRes.data ?? []).map(mapIncome));

    this.loading.set(false);
  }

  // ---- transactions ----
  async addTransaction(tx: Omit<Transacao, 'id' | 'createdAt'>): Promise<void> {
    const { data, error } = await this.db
      .from('transactions')
      .insert({
        user_id: this.uid,
        description: tx.desc,
        amount: tx.amount,
        category: tx.category,
        card: tx.card,
        installments: tx.installments,
        tx_date: tx.date,
      })
      .select()
      .single();
    if (error || !data) return console.error(error);
    this.transactions.update((prev) => [mapTx(data) as any, ...prev]);
  }

  async updateTransaction(tx: Transacao & { id: string }): Promise<void> {
    const { error } = await this.db
      .from('transactions')
      .update({
        description: tx.desc,
        amount: tx.amount,
        category: tx.category,
        card: tx.card,
        installments: tx.installments,
        tx_date: tx.date,
      })
      .eq('id', tx.id);
    if (error) return console.error(error);
    this.transactions.update((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
  }

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await this.db.from('transactions').delete().eq('id', id);
    if (error) return console.error(error);
    this.transactions.update((prev) => prev.filter((t) => t.id !== id));
  }

  // ---- incomes ----
  async addIncome(desc: string, amount: number, date: string): Promise<void> {
    if (!desc.trim() || !(amount > 0)) return;
    const { data, error } = await this.db
      .from('incomes')
      .insert({ user_id: this.uid, description: desc.trim(), amount, income_date: date })
      .select()
      .single();
    if (error || !data) return console.error(error);
    this.incomes.update((prev) => [mapIncome(data), ...prev]);
  }

  async deleteIncome(id: string): Promise<void> {
    const { error } = await this.db.from('incomes').delete().eq('id', id);
    if (error) return console.error(error);
    this.incomes.update((prev) => prev.filter((r) => r.id !== id));
  }

  // ---- categories ----
  async addCategory(name: string, budget: number): Promise<void> {
    if (!name.trim()) return;
    if (this.categories().some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) return;
    const { data, error } = await this.db
      .from('categories')
      .insert({ user_id: this.uid, name: name.trim(), budget: budget || 0 })
      .select()
      .single();
    if (error || !data) return console.error(error);
    this.categories.update((prev) => [...prev, mapCategory(data) as any]);
  }

  async removeCategory(name: string): Promise<void> {
    const cat = this.categories().find((c) => c.name === name);
    if (!cat) return;
    const { error } = await this.db.from('categories').delete().eq('id', (cat as any).id);
    if (error) return console.error(error);
    this.categories.update((prev) => prev.filter((c) => c.name !== name));
  }

  async updateCategoryBudget(name: string, budget: number): Promise<void> {
    const cat = this.categories().find((c) => c.name === name);
    if (!cat) return;
    const { error } = await this.db
      .from('categories')
      .update({ budget: budget || 0 })
      .eq('id', (cat as any).id);
    if (error) return console.error(error);
    this.categories.update((prev) =>
      prev.map((c) => (c.name === name ? { ...c, budget: budget || 0 } : c))
    );
  }

  // ---- cards ----
  async addCard(name: string, limit: number, dueDay: number | null): Promise<void> {
    if (!name.trim()) return;
    if (this.cards().some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) return;
    const { data, error } = await this.db
      .from('cards')
      .insert({
        user_id: this.uid,
        name: name.trim(),
        card_limit: limit || 0,
        due_day: dueDay,
      })
      .select()
      .single();
    if (error || !data) return console.error(error);
    this.cards.update((prev) => [...prev, mapCard(data) as any]);
  }

  async removeCard(name: string): Promise<void> {
    const card = this.cards().find((c) => c.name === name);
    if (!card) return;
    const { error } = await this.db.from('cards').delete().eq('id', (card as any).id);
    if (error) return console.error(error);
    this.cards.update((prev) => prev.filter((c) => c.name !== name));
  }

  async updateCardLimit(name: string, limit: number): Promise<void> {
    await this.patchCard(name, { card_limit: limit || 0 }, { limit: limit || 0 });
  }

  async updateCardDueDay(name: string, dueDay: number | null): Promise<void> {
    await this.patchCard(name, { due_day: dueDay }, { dueDay });
  }

  private async patchCard(name: string, dbPatch: any, localPatch: Partial<Cartao>): Promise<void> {
    const card = this.cards().find((c) => c.name === name);
    if (!card) return;
    const { error } = await this.db.from('cards').update(dbPatch).eq('id', (card as any).id);
    if (error) return console.error(error);
    this.cards.update((prev) => prev.map((c) => (c.name === name ? { ...c, ...localPatch } : c)));
  }

  isCategoryInUse(name: string): boolean {
    return this.transactions().some((t: Transacao) => t.category === name);
  }
  isCardInUse(name: string): boolean {
    return this.transactions().some((t: Transacao) => t.card === name);
  }
}