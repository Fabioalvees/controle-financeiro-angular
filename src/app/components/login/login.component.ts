import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="card">
        <div class="eyebrow">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--stamp)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/>
            <path d="M8 8h8M8 12h8M8 16h4"/>
          </svg>
          <span>Controle de Contas</span>
        </div>
        <h1 class="title">{{ mode() === 'signin' ? 'Entrar' : 'Criar conta' }}</h1>

        <div class="stack">
          <div>
            <label class="label">E-mail</label>
            <input class="line-input" type="email" [(ngModel)]="email" placeholder="voce@email.com" />
          </div>
          <div>
            <label class="label">Senha</label>
            <input class="line-input" type="password" [(ngModel)]="password" placeholder="mín. 6 caracteres" />
          </div>

          <p class="error" *ngIf="supabase.authError()">{{ supabase.authError() }}</p>

          <button class="submit" [disabled]="busy()" (click)="submit()">
            {{ busy() ? 'Aguarde…' : (mode() === 'signin' ? 'Entrar' : 'Criar conta') }}
          </button>

          <button class="switch" (click)="toggleMode()">
            {{ mode() === 'signin' ? 'Ainda não tem conta? Criar uma' : 'Já tem conta? Entrar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .card { width: 100%; max-width: 22rem; background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 12px; padding: 24px; }
    .eyebrow { display: flex; align-items: center; gap: 8px; color: var(--stamp); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .14em; }
    .title { font-family: var(--serif); font-size: 24px; font-weight: 700; color: var(--ink); margin: 8px 0 20px; }
    .stack { display: flex; flex-direction: column; gap: 14px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); }
    .line-input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--rule); outline: none; margin-top: 4px; padding-bottom: 4px; font-size: 16px; color: var(--ink); }
    .error { color: var(--stamp); font-size: 13px; margin: 0; }
    .submit { width: 100%; padding: 12px; border-radius: 10px; font-weight: 600; background: var(--stamp); color: var(--paper-raised); }
    .submit:disabled { opacity: .6; }
    .switch { font-size: 13px; color: var(--ink-soft); text-decoration: underline; text-align: center; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  mode = signal<'signin' | 'signup'>('signin');
  busy = signal(false);

  constructor(public supabase: SupabaseService) {}

  toggleMode(): void {
    this.mode.set(this.mode() === 'signin' ? 'signup' : 'signin');
    this.supabase.authError.set(null);
  }

  async submit(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) return;
    this.busy.set(true);
    if (this.mode() === 'signin') {
      await this.supabase.signIn(this.email.trim(), this.password);
    } else {
      await this.supabase.signUp(this.email.trim(), this.password);
    }
    this.busy.set(false);
  }
}
