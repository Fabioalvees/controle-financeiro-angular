import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  readonly user = signal<User | null>(null);
  readonly authReady = signal(false);
  readonly authError = signal<string | null>(null);

  constructor() {
    this.client.auth.getSession().then(({ data }) => {
      this.user.set(data.session?.user ?? null);
      this.authReady.set(true);
    });
    this.client.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    this.authError.set(null);
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) this.authError.set(traduzErro(error.message));
  }

  async signUp(email: string, password: string): Promise<void> {
    this.authError.set(null);
    const { error } = await this.client.auth.signUp({ email, password });
    if (error) this.authError.set(traduzErro(error.message));
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}

function traduzErro(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('User already registered')) return 'Já existe uma conta com esse e-mail.';
  if (msg.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.includes('Unable to validate email address')) return 'E-mail inválido.';
  return msg;
}
