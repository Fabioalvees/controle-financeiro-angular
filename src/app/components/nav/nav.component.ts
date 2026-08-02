import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabId } from '../../models';

interface NavItem {
  id: TabId;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <button
          *ngFor="let item of items"
          class="nav-btn"
          [class.active]="active === item.id"
          (click)="tabChange.emit(item.id)"
        >
          <span class="icon" [innerHTML]="icons[item.icon]"></span>
          {{ item.label }}
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--paper-raised);
      border-top: 1px solid var(--rule);
    }
    .nav-inner {
      max-width: 28rem;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
    }
    .nav-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 0;
      font-size: 11px;
      color: var(--ink-soft);
      font-weight: 500;
    }
    .nav-btn.active {
      color: var(--stamp);
      font-weight: 700;
    }
    .icon svg { width: 18px; height: 18px; }
  `],
})
export class NavComponent {
  @Input() active: TabId = 'lancar';
  @Output() tabChange = new EventEmitter<TabId>();

  items: NavItem[] = [
    { id: 'lancar', label: 'Lançar', icon: 'plus' },
    { id: 'resumo', label: 'Resumo', icon: 'chart' },
    { id: 'categorias', label: 'Categorias', icon: 'tag' },
    { id: 'lancamentos', label: 'Lançamentos', icon: 'list' },
  ];

  icons: Record<string, string> = {
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l3.59-3.59a2 2 0 0 0 0-2.83Z"/><circle cx="7.5" cy="7.5" r="1"/></svg>`,
    list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
  };
}
