import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Transacao, colorFor, fmtBRL } from '../../models';
import { EditModalComponent } from '../edit-modal/edit-modal.component';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, EditModalComponent],
  template: `
    <div class="stack">
      <div class="filters">
        <button
          class="chip"
          [style.background]="filter() === 'Todas' ? 'var(--ink)' : 'transparent'"
          [style.color]="filter() === 'Todas' ? 'var(--paper-raised)' : 'var(--ink-soft)'"
          (click)="filter.set('Todas')"
        >Todas</button>
        <button
          *ngFor="let c of data.categories()"
          class="chip"
          [style.background]="filter() === c.name ? colorFor(c.name, data.categories()) : 'transparent'"
          [style.borderColor]="filter() === c.name ? colorFor(c.name, data.categories()) : 'var(--rule)'"
          [style.color]="filter() === c.name ? 'var(--paper-raised)' : 'var(--ink-soft)'"
          (click)="filter.set(c.name)"
        >{{ c.name }}</button>
      </div>

      <div class="card" *ngIf="filtered().length === 0">
        <p class="empty">Nada por aqui ainda. Lance seu primeiro gasto na aba "Lançar".</p>
      </div>

      <div class="card" *ngIf="filtered().length > 0">
        <div class="tx-row" *ngFor="let t of filtered()">
          <span class="dot" [style.background]="colorFor(t.category, data.categories())"></span>
          <div class="tx-info">
            <div class="tx-desc">{{ t.desc }}</div>
            <div class="tx-meta">
              {{ formatDate(t.date) }} · {{ t.category }} · {{ t.card }}<ng-container *ngIf="t.installments > 1"> · {{ t.installments }}x</ng-container>
            </div>
          </div>
          <div class="tx-amount mono">{{ fmtBRL(t.amount) }}</div>
          <button class="icon-btn" (click)="editing.set(t)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button class="icon-btn" (click)="data.deleteTransaction(t.id)">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <app-edit-modal
      *ngIf="editing() as tx"
      [tx]="tx"
      [categories]="data.categories()"
      [cards]="data.cards()"
      (close)="editing.set(null)"
      (save)="onSave($event)"
    ></app-edit-modal>
  `,
  styles: [`
    .stack { display: flex; flex-direction: column; gap: 16px; }
    .filters { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .chip { padding: 6px 12px; border-radius: 999px; font-size: 14px; white-space: nowrap; border: 1px solid var(--rule); background: transparent; color: var(--ink-soft); flex-shrink: 0; }
    .card { background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; }
    .empty { font-size: 14px; text-align: center; color: var(--ink-soft); padding: 32px 0; }
    .tx-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--rule); }
    .tx-row:last-child { border-bottom: none; }
    .dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
    .tx-info { flex: 1; min-width: 0; }
    .tx-desc { font-size: 14px; font-weight: 500; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tx-meta { font-size: 11px; color: var(--ink-soft); }
    .tx-amount { font-size: 14px; font-weight: 600; color: var(--ink); flex-shrink: 0; }
    .icon-btn { color: var(--ink-soft); flex-shrink: 0; }
    .mono { font-family: var(--mono); }
  `],
})
export class LancamentosComponent {
  filter = signal('Todas');
  editing = signal<Transacao | null>(null);
  colorFor = colorFor;
  fmtBRL = fmtBRL;

  constructor(public data: DataService) {}

  filtered(): Transacao[] {
    return this.data
      .transactions()
      .filter((t) => this.filter() === 'Todas' || t.category === this.filter())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  onSave(tx: Transacao): void {
    this.data.updateTransaction(tx);
    this.editing.set(null);
  }
}
