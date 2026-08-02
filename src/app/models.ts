export interface Categoria {
  name: string;
  budget: number;
}

export interface Cartao {
  name: string;
  limit: number;
  dueDay: number | null; // dia de vencimento da fatura
}

export interface Transacao {
  id: string;
  desc: string;
  amount: number;
  category: string;
  card: string;
  installments: number;
  date: string; // ISO yyyy-mm-dd
  createdAt: number;
}

export interface Renda {
  id: string;
  desc: string;
  amount: number;
  date: string;
  createdAt: number;
}

export type TabId = 'lancar' | 'resumo' | 'categorias' | 'lancamentos';

export const PIX = 'Pix';

export const CAT_COLORS = [
  '#A5332A', '#3B6B57', '#B4791E', '#3D5A80',
  '#7A4B6E', '#556B2F', '#8A5A2B', '#4B4640',
];

export function colorFor(name: string, list: { name: string }[]): string {
  const i = Math.max(0, list.findIndex((c) => c.name === name));
  return CAT_COLORS[i % CAT_COLORS.length];
}

export function fmtBRL(n: number): string {
  return (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}