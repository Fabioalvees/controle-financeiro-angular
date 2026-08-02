import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { colorFor } from '../../models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stack">
      <div class="card">
        <div class="label">Categorias e limites</div>
        <div class="row" *ngFor="let c of data.categories()">
          <span class="dot" [style.background]="colorFor(c.name, data.categories())"></span>
          <span class="name">{{ c.name }}</span>
          <span class="prefix">R$</span>
          <input
            class="num-input"
            inputmode="decimal"
            [ngModel]="c.budget || ''"
            (ngModelChange)="data.updateCategoryBudget(c.name, toNum($event))"
            placeholder="0"
          />
          <button class="trash" (click)="removeCategory(c.name)">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="new-row">
          <input class="line-input" [(ngModel)]="newCat" placeholder="nova categoria" />
          <input class="line-input small" inputmode="decimal" [(ngModel)]="newCatBudget" placeholder="limite" />
          <button class="add-btn" (click)="addCategory()">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>

      <div class="card">
        <div class="label">Cartões e limites</div>
        <div class="row" *ngFor="let c of data.cards()">
          <svg class="card-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--ink-soft)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>
          <span class="name">{{ c.name }}</span>
          <span class="prefix">R$</span>
          <input
            class="num-input"
            inputmode="decimal"
            [ngModel]="c.limit || ''"
            (ngModelChange)="data.updateCardLimit(c.name, toNum($event))"
            placeholder="0"
          />
          <button class="trash" (click)="removeCard(c.name)">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
        <div class="new-row">
          <input class="line-input" [(ngModel)]="newCard" placeholder="novo cartão" />
          <input class="line-input small" inputmode="decimal" [(ngModel)]="newCardLimit" placeholder="limite" />
          <button class="add-btn" (click)="addCard()">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stack { display: flex; flex-direction: column; gap: 16px; }
    .card { background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); margin-bottom: 12px; }
    .row { display: flex; align-items: center; gap: 8px; padding: 4px 0; }
    .dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
    .card-icon { flex-shrink: 0; }
    .name { flex: 1; font-size: 14px; color: var(--ink); }
    .prefix { font-size: 14px; color: var(--ink-soft); }
    .num-input {
      width: 64px; background: transparent; border: none; border-bottom: 1px solid var(--rule);
      outline: none; text-align: right; font-size: 14px; color: var(--ink); font-family: var(--mono);
    }
    .trash { color: var(--ink-soft); flex-shrink: 0; }
    .new-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--rule); }
    .line-input {
      flex: 1; background: transparent; border: none; border-bottom: 1px solid var(--rule);
      outline: none; font-size: 14px; padding-bottom: 4px; color: var(--ink);
    }
    .line-input.small { flex: 0 0 80px; text-align: right; }
    .add-btn {
      background: var(--stamp); color: var(--paper-raised); border-radius: 999px;
      padding: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
  `],
})
export class CategoriasComponent {
  colorFor = colorFor;
  newCat = '';
  newCatBudget = '';
  newCard = '';
  newCardLimit = '';

  constructor(public data: DataService) {}

  toNum(v: string): number {
    return Number(String(v).replace(',', '.')) || 0;
  }

  addCategory(): void {
    if (!this.newCat.trim()) return;
    this.data.addCategory(this.newCat, this.toNum(this.newCatBudget));
    this.newCat = '';
    this.newCatBudget = '';
  }

  removeCategory(name: string): void {
    if (this.data.isCategoryInUse(name) && !confirm(`"${name}" tem lançamentos. Remover mesmo assim?`)) return;
    this.data.removeCategory(name);
  }

  addCard(): void {
    if (!this.newCard.trim()) return;
    this.data.addCard(this.newCard, this.toNum(this.newCardLimit));
    this.newCard = '';
    this.newCardLimit = '';
  }

  removeCard(name: string): void {
    if (this.data.isCardInUse(name) && !confirm(`"${name}" tem lançamentos. Remover mesmo assim?`)) return;
    this.data.removeCard(name);
  }
}
