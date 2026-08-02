import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { colorFor, todayISO } from '../../models';

@Component({
  selector: 'app-lancar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="stack">
      <div class="card">
        <label class="label">Valor</label>
        <div class="amount-row">
          <span class="prefix">R$</span>
          <input
            class="amount-input"
            inputmode="decimal"
            placeholder="0,00"
            [(ngModel)]="amountStr"
          />
        </div>
      </div>

      <div class="card">
        <label class="label">Descrição</label>
        <input
          class="line-input"
          placeholder="ex: roupa infantil, ifood, gasolina…"
          [(ngModel)]="desc"
        />
      </div>

      <div class="card">
        <label class="label">Categoria</label>
        <div class="chips">
          <button
            *ngFor="let c of data.categories()"
            class="chip"
            [class.active]="category === c.name"
            [style.background]="category === c.name ? colorFor(c.name, data.categories()) : 'transparent'"
            [style.borderColor]="category === c.name ? colorFor(c.name, data.categories()) : 'var(--rule)'"
            [style.color]="category === c.name ? 'var(--paper-raised)' : 'var(--ink-soft)'"
            (click)="category = c.name"
          >
            {{ c.name }}
          </button>
        </div>
      </div>

      <div class="card">
        <label class="label">Cartão / forma</label>
        <div class="chips">
          <button
            *ngFor="let c of data.cards()"
            class="chip"
            [class.active]="card === c.name"
            [style.background]="card === c.name ? 'var(--ink)' : 'transparent'"
            [style.borderColor]="card === c.name ? 'var(--ink)' : 'var(--rule)'"
            [style.color]="card === c.name ? 'var(--paper-raised)' : 'var(--ink-soft)'"
            (click)="card = c.name"
          >
            {{ c.name }}
          </button>
        </div>
      </div>

      <div class="card two-col">
        <div>
          <label class="label">Parcelas</label>
          <input class="line-input" type="number" min="1" [(ngModel)]="installments" />
        </div>
        <div>
          <label class="label">Data</label>
          <input class="line-input" type="date" [(ngModel)]="date" />
        </div>
      </div>

      <button class="submit" [disabled]="!isValid()" (click)="submit()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Lançar gasto
      </button>
    </div>
  `,
  styles: [`
    .stack { display: flex; flex-direction: column; gap: 16px; }
    .card { background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); }
    .amount-row { display: flex; align-items: baseline; gap: 4px; margin-top: 4px; }
    .prefix { color: var(--ink-soft); font-size: 20px; font-family: var(--mono); }
    .amount-input {
      width: 100%; background: transparent; border: none; outline: none;
      font-size: 36px; font-weight: 700; color: var(--ink); font-family: var(--mono);
    }
    .line-input {
      width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--rule);
      outline: none; margin-top: 4px; padding-bottom: 4px; font-size: 16px; color: var(--ink);
    }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .chip {
      padding: 6px 12px; border-radius: 999px; font-size: 14px; white-space: nowrap;
      border: 1px solid var(--rule); background: transparent; color: var(--ink-soft);
      transition: background .15s, color .15s, border-color .15s;
    }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .submit {
      width: 100%; padding: 14px; border-radius: 10px; font-weight: 600;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--stamp); color: var(--paper-raised);
    }
    .submit:disabled { background: var(--rule); color: var(--ink-soft); cursor: not-allowed; }
  `],
})
export class LancarComponent {
  amountStr = '';
  desc = '';
  category = '';
  card = '';
  installments = 1;
  date = todayISO();

  colorFor = colorFor;

  constructor(public data: DataService) {
    this.category = data.categories()[0]?.name ?? '';
    this.card = data.cards()[0]?.name ?? '';
  }

  isValid(): boolean {
    return Number(this.amountStr.replace(',', '.')) > 0 && !!this.desc.trim() && !!this.category && !!this.card;
  }

  submit(): void {
    if (!this.isValid()) return;
    this.data.addTransaction({
      amount: Number(this.amountStr.replace(',', '.')),
      desc: this.desc.trim(),
      category: this.category,
      card: this.card,
      installments: Number(this.installments) || 1,
      date: this.date,
    });
    this.amountStr = '';
    this.desc = '';
    this.installments = 1;
  }
}
