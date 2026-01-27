import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudioApiService, SessionResponse } from '../../core/services/studio-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-session-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
          <div class="flex items-center gap-4">
            @if (session()?.shareId && session()?.paid) {
              <button
                (click)="copyShareLink()"
                class="text-gray-400 hover:text-white text-sm flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
                {{ copied() ? 'Copied!' : 'Share' }}
              </button>
            }
            <a routerLink="/" class="text-gray-400 hover:text-white text-sm">New Session</a>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-8">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-emerald-500"></div>
              <p class="text-gray-400 mt-4">Loading your assessment...</p>
            </div>
          </div>
        } @else if (error()) {
          <div class="max-w-md mx-auto text-center py-20">
            <div class="text-red-400 mb-4">{{ error() }}</div>
            <a routerLink="/" class="text-emerald-400 hover:text-emerald-300">Start a new session</a>
          </div>
        } @else if (session()) {
          <div class="max-w-3xl mx-auto">
            <!-- Header with status -->
            <div class="text-center mb-8">
              <h1 class="text-3xl font-bold text-white mb-4">Your Assessment</h1>
              <p class="text-gray-400 mb-6">{{ session()!.targetRole }}</p>

              <!-- Status badge -->
              <div
                class="inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold"
                [class]="statusClasses()"
              >
                {{ session()!.status }}
              </div>

              <p class="text-gray-500 text-sm mt-4 max-w-md mx-auto">
                This measures market fit for your target role — not your skills or intelligence.
              </p>
            </div>

            <!-- Blockers -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-white mb-4">Your Top Blockers</h2>
              <p class="text-gray-500 text-sm mb-4">
                Address these to improve your interview chances.
              </p>
              <div class="space-y-3">
                @for (blocker of session()!.blockers; track blocker; let i = $index) {
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-3">
                    <span class="flex-shrink-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-sm text-gray-400">
                      {{ i + 1 }}
                    </span>
                    <span class="text-gray-300">{{ blocker }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Teaser / First action -->
            @if (!session()!.paid) {
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-white mb-4">Your First Action</h2>
                <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <p class="text-gray-300 mb-4">{{ session()!.teaserAction }}</p>
                  <div class="relative">
                    <p class="text-gray-400 blur-sm select-none">
                      The full action plan includes 7 specific steps across 30 days, tailored to your situation.
                      Each step has clear outcomes so you know exactly what success looks like.
                    </p>
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="bg-gray-950/90 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
                        Unlock full plan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Payment CTA -->
              <div class="bg-gradient-to-r from-emerald-900/30 to-blue-900/30 border border-emerald-800/50 rounded-xl p-6 text-center">
                <h3 class="text-xl font-semibold text-white mb-2">Get Your Complete 30-Day Plan</h3>
                <p class="text-gray-400 mb-6">
                  Specific actions, CV suggestions, roles to target (and avoid).
                </p>
                <button
                  (click)="pay()"
                  [disabled]="paying()"
                  class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  {{ paying() ? 'Processing...' : 'Unlock Full Plan — €9.99' }}
                </button>
                <p class="text-gray-500 text-sm mt-3">One-time purchase. Instant access.</p>
              </div>
            } @else {
              <!-- Paid content -->

              <!-- 30-Day Plan -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-white mb-4">Your 30-Day Action Plan</h2>
                <div class="space-y-3">
                  @for (action of session()!.plan; track action.day) {
                    <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="bg-emerald-600/20 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded">
                          Day {{ action.day }}
                        </span>
                      </div>
                      <p class="text-white font-medium mb-1">{{ action.action }}</p>
                      <p class="text-gray-500 text-sm">→ {{ action.outcome }}</p>
                    </div>
                  }
                </div>
              </div>

              <!-- CV Rewrite Suggestions -->
              @if (session()!.cvRewriteBullets?.length) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4">CV Rewrite Suggestions</h2>
                  <div class="space-y-2">
                    @for (bullet of session()!.cvRewriteBullets; track bullet) {
                      <div class="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-2">
                        <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-300">{{ bullet }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Roles to Avoid -->
              @if (session()!.rolesToAvoid?.length) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4">Roles to Avoid</h2>
                  <div class="space-y-2">
                    @for (role of session()!.rolesToAvoid; track role) {
                      <div class="bg-red-900/20 border border-red-800/50 rounded-lg p-3 flex gap-2">
                        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-red-300">{{ role }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Pivot Suggestion -->
              @if (session()!.pivotSuggestion) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4">Consider a Pivot</h2>
                  <div class="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                    <p class="text-blue-300">{{ session()!.pivotSuggestion }}</p>
                  </div>
                </div>
              }

              <!-- Success metrics -->
              <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 class="text-lg font-semibold text-white mb-4">After 30 Days</h3>
                <ul class="space-y-2 text-gray-300">
                  <li class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    You should have interviews — or a clear signal of what's blocking you.
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    Your CV + profile will be aligned to your target role.
                  </li>
                  <li class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    You'll know exactly what to do next — no more guessing.
                  </li>
                </ul>
              </div>
            }

            <!-- Actions -->
            <div class="mt-8 flex flex-wrap gap-4 justify-center">
              <a
                routerLink="/"
                class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                New Session
              </a>
              @if (isAuthenticated()) {
                <a
                  routerLink="/history"
                  class="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  View History
                </a>
              }
            </div>
          </div>
        }
      </main>
    </div>
  `,
})
export class SessionViewComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  session = signal<SessionResponse | null>(null);
  paying = signal(false);
  copied = signal(false);

  private sessionId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studioApi: StudioApiService,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.sessionId = parseInt(id, 10);
        this.loadSession();
      } else {
        this.error.set('Invalid session ID');
        this.loading.set(false);
      }
    });
  }

  statusClasses(): string {
    const status = this.session()?.status;
    switch (status) {
      case 'RED': return 'bg-red-600 text-white';
      case 'YELLOW': return 'bg-yellow-500 text-gray-900';
      case 'GREEN': return 'bg-emerald-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  }

  loadSession(): void {
    if (!this.sessionId) return;

    this.loading.set(true);
    this.error.set(null);

    // Try to get full session first, fall back to free version
    this.studioApi.getFullSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.analytics.pageView(`/session/${this.sessionId}`, 'Session View');
        this.analytics.track('result_viewed', { sessionId: session.id, status: session.status, paid: session.paid });
      },
      error: (err) => {
        // If 402 (payment required), get free version
        if (err.status === 402) {
          this.loadFreeSession();
        } else {
          this.error.set('Failed to load session');
          this.loading.set(false);
        }
      },
    });
  }

  private loadFreeSession(): void {
    if (!this.sessionId) return;

    this.studioApi.getSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.analytics.pageView(`/session/${this.sessionId}`, 'Session View');
        this.analytics.track('result_viewed', { sessionId: session.id, status: session.status, paid: false });
      },
      error: () => {
        this.error.set('Failed to load session');
        this.loading.set(false);
      },
    });
  }

  pay(): void {
    if (!this.sessionId || this.paying()) return;

    this.paying.set(true);
    this.analytics.track('payment_initiated', { sessionId: this.sessionId });

    this.studioApi.payForSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.paying.set(false);
        this.analytics.track('payment_completed', { sessionId: session.id });
      },
      error: (err) => {
        this.paying.set(false);
        console.error('Payment failed:', err);
        // Show error to user
      },
    });
  }

  copyShareLink(): void {
    const shareId = this.session()?.shareId;
    if (!shareId) return;

    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      this.analytics.track('share_clicked', { sessionId: this.sessionId });
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
