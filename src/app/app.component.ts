import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './components/nav/nav.component';
import { LancarComponent } from './components/lancar/lancar.component';
import { ResumoComponent } from './components/resumo/resumo.component';
import { CategoriasComponent } from './components/categorias/categorias.component';
import { LancamentosComponent } from './components/lancamentos/lancamentos.component';
import { LoginComponent } from './components/login/login.component';
import { SupabaseService } from './services/supabase.service';
import { DataService } from './services/data.service';
import { TabId } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavComponent,
    LancarComponent,
    ResumoComponent,
    CategoriasComponent,
    LancamentosComponent,
    LoginComponent,
  ],
  template: `
    <ng-container *ngIf="supabase.authReady(); else splash">
      <app-login *ngIf="!supabase.user()"></app-login>

      <div class="page" *ngIf="supabase.user()">
        <div class="container">
          <header class="header">
            <div class="header-top">
              <div class="eyebrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--stamp)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/>
                  <path d="M8 8h8M8 12h8M8 16h4"/>
                </svg>
                <span>Controle de Contas</span>
              </div>
              <button class="logout" (click)="supabase.signOut()">Sair</button>
            </div>
            <div class="account" *ngIf="supabase.user() as u">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--ink-soft)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>{{ u.email }}</span>
            </div>
            <h1 class="month">{{ monthLabel }}</h1>
          </header>

          <p class="syncing" *ngIf="data.loading()">Sincronizando…</p>

          <app-lancar *ngIf="tab() === 'lancar'"></app-lancar>
          <app-resumo *ngIf="tab() === 'resumo'"></app-resumo>
          <app-categorias *ngIf="tab() === 'categorias'"></app-categorias>
          <app-lancamentos *ngIf="tab() === 'lancamentos'"></app-lancamentos>
        </div>

        <app-nav [active]="tab()" (tabChange)="tab.set($event)"></app-nav>
      </div>
    </ng-container>

    <ng-template #splash>
      <div class="splash">Abrindo o caderno de contas…</div>
    </ng-template>
  `,
  styles: [`
    .page { min-height: 100vh; padding-bottom: 96px; }
    .container { max-width: 28rem; margin: 0 auto; padding: 24px 16px 0; }
    .header { margin-bottom: 16px; }
    .header-top { display: flex; align-items: center; justify-content: space-between; }
    .eyebrow {
      display: flex; align-items: center; gap: 8px; color: var(--stamp);
      font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .14em;
    }
    .logout {
      font-size: 12px; color: var(--stamp); font-weight: 600; text-decoration: underline;
      padding: 4px 8px;
    }
    .account {
      display: flex; align-items: center; gap: 6px; margin-top: 6px;
      font-size: 12px; color: var(--ink-soft);
    }
    .month {
      font-family: var(--serif); font-size: 26px; font-weight: 700; color: var(--ink);
      margin: 4px 0 0; text-transform: capitalize;
    }
    .syncing { font-size: 12px; color: var(--ink-soft); margin: 0 0 12px; }
    .splash { min-height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--ink-soft); font-size: 14px; }
  `],
})
export class AppComponent {
  tab = signal<TabId>('lancar');
  monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  constructor(public supabase: SupabaseService, public data: DataService) {}
}