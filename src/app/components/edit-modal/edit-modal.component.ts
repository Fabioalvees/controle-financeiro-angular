import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transacao, colorFor } from '../../models';
import { Categoria, Cartao } from '../../models';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="sheet" (click)="$event.stopPropagation()">
        <div class="header">
          <span class="title">Editar lançamento</span>
          <button (click)="close.emit()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--ink-soft)" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="stack">
          <input class="line-input" [(ngModel)]="form.desc" />
          <input class="amount-input" inputmode="decimal" [ngModel]="form.amount" (ngModelChange)="form.amount = toNum($event)" />
          <div class="chips">
            <button
              *ngFor="let c of categories"
              class="chip"
              [style.background]="form.category === c.name ? colorFor(c.name, categories) : 'transparent'"
              [style.borderColor]="form.category === c.name ? colorFor(c.name, categories) : 'var(--rule)'"
              [style.color]="form.category === c.name ? 'var(--paper-raised)' : 'var(--ink-soft)'"
              (click)="form.category = c.name"
            >{{ c.name }}</button>
          </div>
          <div class="chips">
            <button
              *ngFor="let c of cards"
              class="chip"
              [style.background]="form.card === c.name ? 'var(--ink)' : 'transparent'"
              [style.borderColor]="form.card === c.name ? 'var(--ink)' : 'var(--rule)'"
              [style.color]="form.card === c.name ? 'var(--paper-raised)' : 'var(--ink-soft)'"
              (click)="form.card = c.name"
            >{{ c.name }}</button>
          </div>
          <button class="save-btn" (click)="save.emit(form)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            Salvar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-end; justify-content: center; background: rgba(42,38,34,0.5); }
    .sheet { width: 100%; max-width: 28rem; background: var(--paper-raised); border-radius: 16px 16px 0 0; padding: 16px; padding-bottom: 24px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .title { font-weight: 600; color: var(--ink); }
    .stack { display: flex; flex-direction: column; gap: 12px; }
    .line-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--rule); outline: none; font-size: 16px; padding-bottom: 4px; color: var(--ink); }
    .amount-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--rule); outline: none; font-size: 24px; font-weight: 700; padding-bottom: 4px; color: var(--ink); font-family: var(--mono); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip { padding: 6px 12px; border-radius: 999px; font-size: 14px; border: 1px solid var(--rule); background: transparent; }
    .save-btn { width: 100%; padding: 12px; border-radius: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--good); color: var(--paper-raised); }
  `],
})
export class EditModalComponent {
  @Input() set tx(value: Transacao) {
    this.form = { ...value };
  }
  @Input() categories: Categoria[] = [];
  @Input() cards: Cartao[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Transacao>();

  form!: Transacao;
  colorFor = colorFor;

  toNum(v: string): number {
    return Number(String(v).replace(',', '.')) || 0;
  }
}
