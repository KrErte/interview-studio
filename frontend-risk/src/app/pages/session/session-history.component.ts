import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SessionApiService, SessionSummary } from '../../core/services/session-api.service';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-stone-900">Session History</h1>
          <p class="text-stone-500 mt-1">Your past career assessments</p>
        </div>
        <a routerLink="/session/new"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
          New Session
        </a>
      </div>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-stone-300 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      @if (!loading() && sessions().length === 0) {
        <div class="text-center py-16">
          <div class="text-5xl mb-4">📋</div>
          <h2 class="text-xl font-bold text-stone-900 mb-2">No sessions yet</h2>
          <p class="text-stone-500 mb-6">Start your first career assessment to see it here</p>
          <a routerLink="/session/new"
            class="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold">
            Start Assessment
          </a>
        </div>
      }

      @if (!loading() && sessions().length > 0) {
        <div class="space-y-3">
          @for (s of sessions(); track s.id) {
            <a [routerLink]="['/session', s.id]"
              class="block p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-md transition-all group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-3 h-3 rounded-full"
                    [class]="s.status === 'RED' ? 'bg-red-500' : s.status === 'GREEN' ? 'bg-emerald-500' : 'bg-amber-500'"></div>
                  <div>
                    <div class="font-semibold text-stone-900 group-hover:text-emerald-600 transition-colors">{{ s.targetRole }}</div>
                    <div class="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>{{ s.mode === 'ADVANCED' ? 'Advanced' : 'Quick' }}</span>
                      <span>{{ formatDate(s.createdAt) }}</span>
                      @if (s.paid) {
                        <span class="text-emerald-600">Full plan</span>
                      }
                    </div>
                  </div>
                </div>
                <svg class="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `
})
export class SessionHistoryComponent implements OnInit {
  private readonly sessionApi = inject(SessionApiService);

  loading = signal(true);
  sessions = signal<SessionSummary[]>([]);

  ngOnInit() {
    this.sessionApi.getHistory().subscribe({
      next: (s) => { this.sessions.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
