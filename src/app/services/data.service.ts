import { Injectable, computed, effect, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cartao, Categoria, Meta, Transacao } from '../models';

const DEFAULT_CATEGORIES = [
  { name: 'Mercado', budget: 900 },
  { name: 'Diversão', budget: 400 },
  { name: 'Padaria', budget: 0 },
  { name: 'Pix', budget: 0 },
  { name: 'Roupas/Brinquedos', budget: 0 },
  { name: 'Contas Fixas', budget: 0 },
  { name: 'Outros', budget: 0 },
];

const DEFAULT_CARDS = [
  { name: 'Cartão Fabio', limit: 2600 },
  { name: 'Cartão Extra', limit: 0 },
  { name: 'Pix', limit: 0 },
];

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
function mapCategory(row: any): Categoria {
  return { name: row.name, budget: Number(row.budget) } as any;
}
function mapCard(row: any): Cartao {
  return { name: row.name, limit: Number(row.card_limit) } as any;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly transactions = signal<(Transacao & { id: string })[]>([]);
  readonly categories = signal<(Categoria & { id: string })[]>([]);
  readonly cards = signal<(Cartao & { id: string })[]>([]);
  readonly meta = signal<Meta>({ salario: 0 });
  readonly loading = signal(true);

  readonly totalGasto = computed(() =>
    this.transactions().reduce((s, t) => s + Number(t.amount || 0), 0)
  );
  readonly saldo = computed(() => Number(this.meta().salario || 0) - this.totalGasto());

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

  private get uid(): string {
    return this.supabase.user()!.id;
  }
  private get db() {
    return this.supabase.client;
  }

  constructor(private supabase: SupabaseService) {
    effect(() => {
      const user = this.supabase.user();
      if (user) {
        this.loadAll();
      } else {
        this.transactions.set([]);
        this.categories.set([]);
        this.cards.set([]);
        this.meta.set({ salario: 0 });
      }
    });
  }

  private async loadAll(): Promise<void> {
    this.loading.set(true);
    const [txRes, catRes, cardRes, metaRes] = await Promise.all([
      this.db.from('transactions').select('*').order('created_at', { ascending: false }),
      this.db.from('categories').select('*').order('created_at', { ascending: true }),
      this.db.from('cards').select('*').order('created_at', { ascending: true }),
      this.db.from('meta').select('*').eq('user_id', this.uid).maybeSingle(),
    ]);

    this.transactions.set((txRes.data ?? []).map(mapTx) as any);

    let categories = (catRes.data ?? []).map((r: any) => ({ ...mapCategory(r), id: r.id }));
    if (categories.length === 0) {
      const seeded = await this.db
        .from('categories')
        .insert(DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: this.uid })))
        .select();
      categories = (seeded.data ?? []).map((r: any) => ({ ...mapCategory(r), id: r.id }));
    }
    this.categories.set(categories as any);

    let cards = (cardRes.data ?? []).map((r: any) => ({ ...mapCard(r), id: r.id }));
    if (cards.length === 0) {
      const seeded = await this.db
        .from('cards')
        .insert(DEFAULT_CARDS.map((c) => ({ name: c.name, card_limit: c.limit, user_id: this.uid })))
        .select();
      cards = (seeded.data ?? []).map((r: any) => ({ ...mapCard(r), id: r.id }));
    }
    this.cards.set(cards as any);

    if (metaRes.data) {
      this.meta.set({ salario: Number(metaRes.data.salario) });
    } else {
      await this.db.from('meta').insert({ user_id: this.uid, salario: 2250 });
      this.meta.set({ salario: 2250 });
    }

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
    this.categories.update((prev) => [...prev, { ...mapCategory(data), id: data.id } as any]);
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
  async addCard(name: string, limit: number): Promise<void> {
    if (!name.trim()) return;
    if (this.cards().some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) return;
    const { data, error } = await this.db
      .from('cards')
      .insert({ user_id: this.uid, name: name.trim(), card_limit: limit || 0 })
      .select()
      .single();
    if (error || !data) return console.error(error);
    this.cards.update((prev) => [...prev, { ...mapCard(data), id: data.id } as any]);
  }

  async removeCard(name: string): Promise<void> {
    const card = this.cards().find((c) => c.name === name);
    if (!card) return;
    const { error } = await this.db.from('cards').delete().eq('id', (card as any).id);
    if (error) return console.error(error);
    this.cards.update((prev) => prev.filter((c) => c.name !== name));
  }

  async updateCardLimit(name: string, limit: number): Promise<void> {
    const card = this.cards().find((c) => c.name === name);
    if (!card) return;
    const { error } = await this.db
      .from('cards')
      .update({ card_limit: limit || 0 })
      .eq('id', (card as any).id);
    if (error) return console.error(error);
    this.cards.update((prev) =>
      prev.map((c) => (c.name === name ? { ...c, limit: limit || 0 } : c))
    );
  }

  // ---- meta ----
  async setSalario(v: number): Promise<void> {
    this.meta.update((m) => ({ ...m, salario: v || 0 }));
    const { error } = await this.db.from('meta').upsert({ user_id: this.uid, salario: v || 0 });
    if (error) console.error(error);
  }

  isCategoryInUse(name: string): boolean {
    return this.transactions().some((t: Transacao) => t.category === name);
  }
  isCardInUse(name: string): boolean {
    return this.transactions().some((t: Transacao) => t.card === name);
  }
}
