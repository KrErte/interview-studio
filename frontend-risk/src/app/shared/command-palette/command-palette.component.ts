import { Component, HostListener, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';
import { TierService } from '../../core/services/tier.service';
import { AnalyticsService } from '../../core/services/analytics.service';

interface PaletteItem {
  label: string;
  description: string;
  path: string;
  icon: string;
  requiresAuth?: boolean;
  requiresTier?: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" (click)="close()">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl" (click)="$event.stopPropagation()">
          <!-- Search -->
          <div class="flex items-center gap-3 p-4 border-b border-slate-800">
            <svg class="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input #searchInput type="text" [(ngModel)]="query" (ngModelChange)="filterItems()"
              placeholder="Type a command..."
              class="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm">
            <kbd class="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-500">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-72 overflow-y-auto p-2">
            @for (item of filtered(); track item.path) {
              <button (click)="navigate(item.path)"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-slate-800 transition-colors group">
                <span class="text-lg">{{ item.icon }}</span>
                <div class="flex-1">
                  <div class="text-sm font-medium text-white group-hover:text-emerald-300">{{ item.label }}</div>
                  <div class="text-xs text-slate-500">{{ item.description }}</div>
                </div>
              </button>
            }
            @if (filtered().length === 0) {
              <div class="text-center py-8 text-slate-500 text-sm">No results found</div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class CommandPaletteComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly tierService = inject(TierService);
  private readonly analytics = inject(AnalyticsService);

  open = signal(false);
  query = '';

  private items: PaletteItem[] = [
    { label: 'New Quick Session', description: 'Start a 3-question assessment', path: '/session/new', icon: '⚡' },
    { label: 'New Advanced Session', description: '5-question deep assessment', path: '/session/new/advanced', icon: '🔬', requiresAuth: true },
    { label: 'Session History', description: 'View past assessments', path: '/history', icon: '📋', requiresAuth: true },
    { label: 'Skill Assessment', description: 'Detailed skill evaluation', path: '/start', icon: '📝' },
    { label: 'Job X-Ray', description: 'Analyze a job posting', path: '/tools/job-analyzer', icon: '🔍' },
    { label: 'Pricing', description: 'View plans and pricing', path: '/pricing', icon: '💰' },
    { label: 'Career Assessment', description: 'Full career risk analysis', path: '/careerrisk', icon: '📊' },
    { label: 'Interview Room', description: 'Practice mock interviews', path: '/arena/interview', icon: '🎭', requiresTier: 'PROFESSIONAL' },
    { label: 'Salary Dojo', description: 'Negotiation practice', path: '/arena/negotiation', icon: '💸', requiresTier: 'PROFESSIONAL' },
    { label: 'Brutal Truth', description: 'Honest career feedback', path: '/arena/truth', icon: '🪞', requiresTier: 'PROFESSIONAL' },
    { label: 'Stress Test', description: 'Career stress scenarios', path: '/arena/stress-test', icon: '🔬', requiresTier: 'PROFESSIONAL' },
  ];

  filtered = signal<PaletteItem[]>(this.items);

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Ctrl+K or Cmd+K or / (when not in input)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    } else if (event.key === '/' && !this.isInputFocused()) {
      event.preventDefault();
      this.toggle();
    } else if (event.key === 'Escape' && this.open()) {
      this.close();
    }
  }

  toggle() {
    if (this.open()) {
      this.close();
    } else {
      this.open.set(true);
      this.query = '';
      this.filterItems();
      this.analytics.trackEvent('command_palette_opened');
    }
  }

  close() {
    this.open.set(false);
  }

  filterItems() {
    const q = this.query.toLowerCase().trim();
    let available = this.items.filter(item => {
      if (item.requiresAuth && !this.auth.isAuthenticated()) return false;
      if (item.requiresTier && !this.tierService.isAtLeast(item.requiresTier as any)) return false;
      return true;
    });

    if (q) {
      available = available.filter(item =>
        item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }

    this.filtered.set(available);
  }

  navigate(path: string) {
    this.close();
    this.router.navigateByUrl(path);
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
  }
}
