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
          <a routerLink="/" class="text-lg font-bold text-white hover:text-emerald-400 transition-colors">
            CareerRisk
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
            <a routerLink="/" class="text-gray-400 hover:text-white text-sm">New Check</a>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-8">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-emerald-500"></div>
              <p class="text-gray-400 mt-4">Analyzing your profile...</p>
            </div>
          </div>
        } @else if (error()) {
          <div class="max-w-md mx-auto text-center py-20">
            <div class="text-red-400 mb-4">{{ error() }}</div>
            <a routerLink="/" class="text-emerald-400 hover:text-emerald-300">Start a new check</a>
          </div>
        } @else if (session()) {
          <div class="max-w-3xl mx-auto">
            <!-- Status header -->
            <div class="text-center mb-10">
              <p class="text-gray-500 text-sm mb-4 uppercase tracking-wider">Your interview readiness for</p>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-6">{{ session()!.targetRole }}</h1>

              <!-- Status badge — big and impactful -->
              <div class="inline-flex flex-col items-center">
                <div
                  class="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl"
                  [class]="statusClasses()"
                >
                  {{ session()!.status }}
                </div>
                <p class="mt-3 text-sm font-medium" [class]="statusTextClass()">
                  {{ statusMessage() }}
                </p>
              </div>

              <p class="text-gray-600 text-xs mt-6 max-w-sm mx-auto">
                Based on market fit signals — not your skills or intelligence.
              </p>
            </div>

            <!-- Blockers — always visible, creates "oh shit" moment -->
            <div class="mb-10">
              <h2 class="text-xl font-semibold text-white mb-2">Why you're {{ session()!.status === 'GREEN' ? 'not there yet' : 'stuck' }}</h2>
              <p class="text-gray-500 text-sm mb-4">These are holding you back right now.</p>
              <div class="space-y-3">
                @for (blocker of session()!.blockers; track blocker; let i = $index) {
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-3 items-start">
                    <span class="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                      [class]="i === 0 ? 'bg-red-600/20 text-red-400' : i === 1 ? 'bg-amber-600/20 text-amber-400' : 'bg-gray-800 text-gray-400'">
                      {{ i + 1 }}
                    </span>
                    <span class="text-gray-300">{{ blocker }}</span>
                  </div>
                }
              </div>
            </div>

            @if (!session()!.paid) {
              <!-- Teaser action — shows first step clearly -->
              <div class="mb-8">
                <h2 class="text-xl font-semibold text-white mb-4">Your first move</h2>
                <div class="bg-gray-900 border border-emerald-800/30 rounded-lg p-5">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="bg-emerald-600/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">DAY 1</span>
                  </div>
                  <p class="text-white font-medium">{{ session()!.teaserAction }}</p>
                </div>
              </div>

              <!-- Blurred preview of what's behind the paywall -->
              <div class="mb-8 relative">
                <div class="space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <span class="bg-emerald-600/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">DAY 3</span>
                    <p class="text-white font-medium mt-2">Rewrite your CV summary to match the exact keywords hiring managers search for</p>
                  </div>
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <span class="bg-emerald-600/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">DAY 7</span>
                    <p class="text-white font-medium mt-2">Apply to 5 specific companies with your rewritten materials</p>
                  </div>
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <span class="bg-emerald-600/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">DAY 14</span>
                    <p class="text-white font-medium mt-2">Follow up sequence and interview preparation framework</p>
                  </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center bg-gray-950/40">
                  <div class="bg-gray-900/95 border border-gray-700 rounded-xl p-6 text-center shadow-2xl max-w-sm">
                    <p class="text-emerald-400 font-bold text-lg mb-1">6 more steps locked</p>
                    <p class="text-gray-500 text-sm">Including CV rewrites, roles to avoid, and your full 30-day plan</p>
                  </div>
                </div>
              </div>

              <!-- Payment CTA — emotional, urgent -->
              <div class="bg-gradient-to-br from-emerald-950/50 via-gray-900 to-gray-900 border border-emerald-800/40 rounded-2xl p-8 text-center mb-8">
                <p class="text-gray-400 text-sm mb-2">You know the problem now.</p>
                <h3 class="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Get the fix.
                </h3>
                <p class="text-gray-400 mb-6 max-w-md mx-auto">
                  Your complete 30-day action plan, CV rewrite suggestions, and roles to avoid — personalized for <strong class="text-white">{{ session()!.targetRole }}</strong>.
                </p>

                <button
                  (click)="pay()"
                  [disabled]="paying()"
                  class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white font-bold px-12 py-4 rounded-xl transition-all text-lg shadow-xl shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {{ paying() ? 'Processing...' : 'Unlock Full Plan — €9.99' }}
                </button>

                <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-5 text-sm text-gray-500">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    24h money-back guarantee
                  </span>
                  <span>One-time payment</span>
                  <span>No subscription</span>
                </div>
              </div>

              <!-- Cost comparison — make €9.99 feel tiny -->
              <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8">
                <h4 class="text-white font-medium mb-4 text-center">What's one month of wrong applications costing you?</h4>
                <div class="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p class="text-red-400 text-2xl font-bold">€3,000+</p>
                    <p class="text-gray-500 text-xs mt-1">Average lost salary per month<br>of extended job search</p>
                  </div>
                  <div>
                    <p class="text-emerald-400 text-2xl font-bold">€9.99</p>
                    <p class="text-gray-500 text-xs mt-1">Your personalized plan<br>to stop wasting time</p>
                  </div>
                </div>
              </div>
            } @else {
              <!-- PAID CONTENT -->

              <!-- 30-Day Plan -->
              <div class="mb-10">
                <h2 class="text-xl font-semibold text-white mb-2">Your 30-Day Action Plan</h2>
                <p class="text-gray-500 text-sm mb-4">Follow each step. Track your progress. See results.</p>
                <div class="space-y-3">
                  @for (action of session()!.plan; track action.day) {
                    <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
                      <div class="flex items-center gap-3 mb-2">
                        <span class="bg-emerald-600/20 text-emerald-400 text-sm font-bold px-2.5 py-0.5 rounded">
                          Day {{ action.day }}
                        </span>
                      </div>
                      <p class="text-white font-medium mb-1">{{ action.action }}</p>
                      <p class="text-gray-500 text-sm flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                        {{ action.outcome }}
                      </p>
                    </div>
                  }
                </div>
              </div>

              <!-- CV Rewrite Suggestions -->
              @if (session()!.cvRewriteBullets?.length) {
                <div class="mb-10">
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
                <div class="mb-10">
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
                <div class="mb-10">
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
                    No more guessing — every day has a clear action and outcome.
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
                New Check
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

      <!-- Footer -->
      <footer class="border-t border-gray-800 py-8">
        <div class="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4 text-sm text-gray-600">
          <div class="flex flex-wrap justify-center gap-6">
            <a routerLink="/pricing" class="hover:text-gray-400 transition-colors">Pricing</a>
            <a routerLink="/privacy" class="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a routerLink="/terms" class="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="mailto:hello&#64;careerrisk.ee" class="hover:text-gray-400 transition-colors">Contact</a>
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <span>&copy; 2024 CareerRisk.ee</span>
            <span>&bull;</span>
            <span>Made in Estonia</span>
          </div>
        </div>
      </footer>
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
      case 'RED': return 'bg-red-600 text-white shadow-red-900/50';
      case 'YELLOW': return 'bg-yellow-500 text-gray-900 shadow-yellow-900/50';
      case 'GREEN': return 'bg-emerald-600 text-white shadow-emerald-900/50';
      default: return 'bg-gray-600 text-white';
    }
  }

  statusTextClass(): string {
    const status = this.session()?.status;
    switch (status) {
      case 'RED': return 'text-red-400';
      case 'YELLOW': return 'text-yellow-400';
      case 'GREEN': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  }

  statusMessage(): string {
    const status = this.session()?.status;
    switch (status) {
      case 'RED': return 'High risk — significant gaps to address';
      case 'YELLOW': return 'Moderate risk — some fixes needed';
      case 'GREEN': return 'Good position — minor optimizations left';
      default: return '';
    }
  }

  loadSession(): void {
    if (!this.sessionId) return;

    this.loading.set(true);
    this.error.set(null);

    this.studioApi.getFullSession(this.sessionId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.analytics.pageView(`/session/${this.sessionId}`, 'Session View');
        this.analytics.track('result_viewed', { sessionId: session.id, status: session.status, paid: session.paid });
      },
      error: (err) => {
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
