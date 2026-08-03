import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { colorFor, fmtBRL } from '../../models';

@Component({
  selector: 'app-resumo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stack">
      <!-- CARTEIRA -->
      <div class="card balance-card">
        <!-- Saldo da carteira -->
        <div class="balance-top">
          <div>
            <div class="label light">Saldo da carteira</div>
            <div class="balance" [style.color]="data.saldo() >= 0 ? '#8FD1B5' : '#E39C93'">
              {{ fmtBRL(data.saldo()) }}
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#C9C4B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/>
            <path d="M21 12H16a2 2 0 0 0 0 4h5v-4Z"/>
          </svg>
        </div>
        <div class="balance-row">
          <span class="light">Receita total</span>
          <span class="mono strong-light">{{ fmtBRL(data.totalReceita()) }}</span>
        </div>
        <div class="balance-row">
          <span class="light">Gasto à vista/pix</span>
          <span class="mono strong-light">{{ fmtBRL(data.gastoImediato()) }}</span>
        </div>
        <p class="note">Compras no cartão de crédito não descontam o saldo aqui — elas contam pro limite do cartão, abaixo.</p>

        <div class="balance-divider"></div>

        <!-- Crédito disponível -->
        <div class="balance-top">
          <div>
            <div class="label light">Crédito disponível</div>
            <div class="balance" style="color:#8FD1B5">
              {{ fmtBRL(data.creditoDisponivel()) }}
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#C9C4B8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>
          </svg>
        </div>
        <div class="balance-row">
          <span class="light">Limite total</span>
          <span class="mono strong-light">{{ fmtBRL(data.totalLimiteCredito()) }}</span>
        </div>
        <div class="balance-row">
          <span class="light">Usado no cartão</span>
          <span class="mono strong-light">{{ fmtBRL(data.totalUsadoCredito()) }}</span>
        </div>
      </div>

      <!-- GASTO POR CARTAO -->
      <div class="card">
        <div class="label">Gasto por cartão</div>
        <div class="detail-list">
          <div *ngFor="let c of data.byCard()">
            <div class="dotted">
              <span class="mono">
                {{ c.name }}
                <span class="due" *ngIf="c.dueDay">· vence dia {{ c.dueDay }}</span>
              </span>
              <span class="dots"></span>
              <span class="mono">{{ fmtBRL(c.total) }}</span>
            </div>
            <ng-container *ngIf="c.limit > 0">
              <div class="progress">
                <div class="progress-fill" [style.width.%]="pct(c.total, c.limit)" [style.background]="'var(--good)'"></div>
              </div>
              <div class="progress-note" [style.color]="c.total > c.limit ? 'var(--stamp)' : 'var(--ink-soft)'">
                disponível: {{ fmtBRL(availLimit(c.total, c.limit)) }}
              </div>
            </ng-container>
          </div>
          <p class="empty" *ngIf="!data.byCard().length">Nenhum cartão cadastrado ainda.</p>
        </div>
      </div>

      <!-- GASTO POR CATEGORIA (grafico) -->
      <div class="card">
        <div class="label">Gasto por categoria</div>
        <ng-container *ngIf="chartData().length; else emptyChart">
          <div class="bars">
            <div class="bar-col" *ngFor="let c of chartData()">
              <div class="bar-track">
                <div class="bar-fill" [style.height.%]="barHeight(c.total)" [style.background]="colorFor(c.name, data.categories())"></div>
              </div>
              <div class="bar-label">{{ c.name }}</div>
              <div class="bar-value mono">{{ fmtBRL(c.total) }}</div>
            </div>
          </div>
        </ng-container>
        <ng-template #emptyChart>
          <p class="empty">Nenhum lançamento ainda.</p>
        </ng-template>
      </div>

      <!-- DETALHE POR CATEGORIA -->
      <div class="card">
        <div class="label">Detalhe por categoria</div>
        <div class="detail-list">
          <div *ngFor="let c of data.byCategory()">
            <div class="dotted">
              <span class="mono">{{ c.name }}</span>
              <span class="dots"></span>
              <span class="mono">{{ fmtBRL(c.total) }}</span>
            </div>
            <ng-container *ngIf="c.budget > 0">
              <div class="progress">
                <div class="progress-fill" [style.width.%]="pct(c.total, c.budget)" [style.background]="c.total > c.budget ? 'var(--stamp)' : colorFor(c.name, data.categories())"></div>
              </div>
              <div class="progress-note" [style.color]="c.total > c.budget ? 'var(--stamp)' : 'var(--ink-soft)'">
                {{ c.total > c.budget ? ('estourou o limite de ' + fmtBRL(c.budget)) : ('restam ' + fmtBRL(c.budget - c.total) + ' de ' + fmtBRL(c.budget)) }}
              </div>
            </ng-container>
          </div>
          <p class="empty" *ngIf="!data.byCategory().length">Nenhuma categoria cadastrada ainda.</p>
        </div>
        <div class="perforation"></div>
        <div class="dotted total">
          <span class="mono strong">TOTAL GASTO</span>
          <span class="dots"></span>
          <span class="mono strong">{{ fmtBRL(data.totalGasto()) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stack { display: flex; flex-direction: column; gap: 16px; }
    .card { background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 10px; padding: 16px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); margin-bottom: 8px; }
    .balance-card { background: var(--ink); }
    .balance-top { display: flex; align-items: flex-start; justify-content: space-between; }
    .light { color: #C9C4B8; }
    .balance { font-size: 30px; font-weight: 700; font-family: var(--mono); margin-top: 4px; }
    .balance-row {
      display: flex; align-items: center; justify-content: space-between; margin-top: 10px;
      padding-top: 10px; border-top: 1px solid #4A453D; font-size: 14px;
    }
    .strong-light { color: #F6F4EE; font-weight: 600; }
    .note { font-size: 11px; color: #9B958A; margin: 10px 0 0; line-height: 1.4; }
    .mono { font-family: var(--mono); }
    .strong { font-weight: 700; }

    .balance-divider { height: 1px; background: #4A453D; margin: 16px 0 4px; }

    .due { color: var(--ink-soft); font-weight: 400; font-size: 11px; }

    .bars { display: flex; align-items: flex-end; gap: 10px; height: 160px; overflow-x: auto; padding-top: 8px; }
    .bar-col { display: flex; flex-direction: column; align-items: center; min-width: 52px; height: 100%; justify-content: flex-end; }
    .bar-track { flex: 1; width: 24px; display: flex; align-items: flex-end; }
    .bar-fill { width: 100%; border-radius: 4px 4px 0 0; min-height: 2px; }
    .bar-label { font-size: 10px; color: var(--ink-soft); margin-top: 6px; text-align: center; max-width: 60px; }
    .bar-value { font-size: 10px; color: var(--ink); margin-top: 2px; }
    .empty { font-size: 14px; text-align: center; color: var(--ink-soft); padding: 24px 0; }

    .detail-list { display: flex; flex-direction: column; gap: 12px; }
    .dotted { display: flex; align-items: baseline; gap: 8px; }
    .dotted .mono { color: var(--ink); font-weight: 500; }
    .dotted.total .mono { font-size: 15px; }
    .dots { flex: 1; border-bottom: 1px dotted var(--rule); margin-bottom: 3px; }
    .progress { height: 6px; border-radius: 999px; overflow: hidden; background: var(--rule); margin-top: 6px; }
    .progress-fill { height: 100%; border-radius: 999px; }
    .progress-note { font-size: 11px; margin-top: 2px; }
    .perforation {
      height: 10px; margin: 10px 0;
      background-image: radial-gradient(circle, var(--paper) 2.2px, transparent 2.3px);
      background-size: 14px 14px; background-position: center;
    }
  `],
})
export class ResumoComponent {
  fmtBRL = fmtBRL;
  colorFor = colorFor;

  constructor(public data: DataService) {}

  chartData() {
    return this.data.byCategory().filter((c) => c.total > 0);
  }

  barHeight(total: number): number {
    const max = Math.max(...this.chartData().map((c) => c.total), 1);
    return Math.max(4, (total / max) * 100);
  }

  pct(value: number, max: number): number {
    return max > 0 ? Math.min(100, (value / max) * 100) : 0;
  }

  availLimit(total: number, limit: number): number {
    return Math.max(0, limit - total);
  }
}