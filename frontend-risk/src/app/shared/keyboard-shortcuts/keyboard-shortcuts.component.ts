import { Component, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-keyboard-shortcuts',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center" (click)="close()">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-white">Keyboard Shortcuts</h2>
            <button (click)="close()" class="text-slate-500 hover:text-white transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-3">
            @for (shortcut of shortcuts; track shortcut.key) {
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-300">{{ shortcut.label }}</span>
                <kbd class="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">{{ shortcut.key }}</kbd>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class KeyboardShortcutsComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly analytics = inject(AnalyticsService);

  open = signal(false);

  shortcuts = [
    { key: '?', label: 'Show this help' },
    { key: '/ or Ctrl+K', label: 'Open command palette' },
    { key: 'Esc', label: 'Close any modal' },
    { key: 'n', label: 'New session' },
    { key: 'h', label: 'Go to history' },
  ];

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.isInputFocused()) return;

    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.open.set(!this.open());
      this.analytics.trackEvent('shortcut_used', { key: '?' });
    } else if (event.key === 'Escape' && this.open()) {
      this.close();
    } else if (event.key === 'n' && !this.open() && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.analytics.trackEvent('shortcut_used', { key: 'n' });
      this.router.navigateByUrl('/session/new');
    } else if (event.key === 'h' && !this.open() && !event.ctrlKey && !event.metaKey) {
      if (this.auth.isAuthenticated()) {
        event.preventDefault();
        this.analytics.trackEvent('shortcut_used', { key: 'h' });
        this.router.navigateByUrl('/history');
      }
    }
  }

  close() {
    this.open.set(false);
  }

  private isInputFocused(): boolean {
    const el = document.activeElement;
    return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
  }
}
