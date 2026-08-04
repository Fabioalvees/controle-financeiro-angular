import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Transacao, colorFor, fmtBRL } from '../../models';
import { EditModalComponent } from '../edit-modal/edit-modal.component';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, EditModalComponent],
  template: `
    <div class="stack">
      <div class="filters">
        <div class="filter-field">
          <label class="filter-label">Categoria</label>
          <select class="filter-select" [(ngModel)]="categoryFilter">
            <option value="Todas">Todas</option>
            <option *ngFor="let c of data.categories()" [value]="c.name">{{ c.name }}</option>
          </select>
        </div>
        <div class="filter-field">
          <label class="filter-label">Cartão</label>
          <select class="filter-select" [(ngModel)]="cardFilter">
            <option value="Todos">Todos</option>
            <option value="Pix">Pix</option>
            <option *ngFor="let c of data.cards()" [value]="c.name">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div class="card" *ngIf="filtered().length === 0">
        <p class="empty">Nada por aqui com esse filtro.</p>
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
    .filters { display: flex; gap: 10px; }
    .filter-field { flex: 1; min-width: 0; }
    .filter-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); display: block; margin-bottom: 3px; }
    .filter-select {
      width: 100%; background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 8px;
      padding: 8px 10px; font-size: 13px; color: var(--ink); outline: none;
    }
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
  categoryFilter = 'Todas';
  cardFilter = 'Todos';
  editing = signal<Transacao | null>(null);
  colorFor = colorFor;
  fmtBRL = fmtBRL;

  constructor(public data: DataService) {}

  filtered(): Transacao[] {
    return this.data
      .transactions()
      .filter((t) => this.categoryFilter === 'Todas' || t.category === this.categoryFilter)
      .filter((t) => this.cardFilter === 'Todos' || t.card === this.cardFilter)
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