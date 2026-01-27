import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudioApiService, SessionSummary } from '../../core/services/studio-api.service';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-400">{{ user()?.email }}</span>
            <button (click)="logout()" class="text-gray-400 hover:text-white">Logout</button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-8">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h1 class="text-2xl font-bold text-white">Session History</h1>
            <a
              routerLink="/session/new"
              class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              New Session
            </a>
          </div>

          @if (loading()) {
            <div class="flex items-center justify-center py-20">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-emerald-500"></div>
            </div>
          } @else if (sessions().length === 0) {
            <div class="text-center py-20">
              <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-white mb-2">No sessions yet</h2>
              <p class="text-gray-400 mb-6">Start your first session to see your history here.</p>
              <a
                routerLink="/session/new"
                class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Your First Session
              </a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (session of sessions(); track session.id) {
                <a
                  [routerLink]="['/session', session.id]"
                  class="block bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg p-4 transition-colors"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <!-- Status badge -->
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                        [class]="statusClasses(session.status)"
                      >
                        {{ session.status || '?' }}
                      </div>
                      <div>
                        <h3 class="font-medium text-white">{{ session.targetRole }}</h3>
                        <p class="text-gray-500 text-sm">{{ formatDate(session.createdAt) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      @if (session.paid) {
                        <span class="bg-emerald-600/20 text-emerald-400 text-xs px-2 py-1 rounded">Full Plan</span>
                      } @else {
                        <span class="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded">Free Preview</span>
                      }
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  loading = signal(true);
  sessions = signal<SessionSummary[]>([]);

  constructor(
    private studioApi: StudioApiService,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  user = this.authService.user;

  ngOnInit(): void {
    this.analytics.pageView('/history', 'Session History');
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.studioApi.getSessionHistory().subscribe({
      next: (sessions) => {
        this.sessions.set(sessions);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.loading.set(false);
      },
    });
  }

  statusClasses(status: string | null): string {
    switch (status) {
      case 'RED': return 'bg-red-600 text-white';
      case 'YELLOW': return 'bg-yellow-500 text-gray-900';
      case 'GREEN': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
