import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionApiService, SessionResponse } from '../../core/services/session-api.service';
import { AuthService } from '../../core/auth/auth-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-session-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      @if (!loading() && session()) {
        <!-- Status Badge + Risk Score -->
        <div class="text-center mb-8">
          <!-- Risk Score Ring -->
          <div class="flex justify-center mb-5">
            <div class="relative w-36 h-36">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10" class="text-slate-800" stroke="currentColor"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10"
                  [attr.stroke]="riskColor()"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="314"
                  [attr.stroke-dashoffset]="314 - (314 * riskPercent() / 100)"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-white">{{ riskPercent() }}%</span>
                <span class="text-[10px] text-slate-500 uppercase tracking-wider">Risk Score</span>
              </div>
            </div>
          </div>
          <div class="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border mb-4"
            [class]="statusClasses()">
            <div class="w-4 h-4 rounded-full" [class]="dotClass()"></div>
            <span class="text-xl font-bold">{{ statusLabel() }}</span>
          </div>
          <h1 class="text-3xl font-bold text-white mt-4">{{ session()!.targetRole }}</h1>
          <p class="text-slate-400 mt-1">{{ session()!.mode === 'ADVANCED' ? 'Advanced' : 'Quick' }} Assessment</p>
        </div>

        <!-- Blockers -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 mb-6">
          <h2 class="text-lg font-bold text-white mb-4">Key Blockers</h2>
          <div class="space-y-3">
            @for (blocker of session()!.blockers; track blocker) {
              <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50">
                <svg class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm text-slate-300">{{ blocker }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Teaser Action -->
        <div class="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 mb-6">
          <h2 class="text-lg font-bold text-emerald-400 mb-2">Your First Action</h2>
          <p class="text-slate-300">{{ session()!.teaserAction }}</p>
        </div>

        <!-- Paid Content OR Upgrade CTA -->
        @if (session()!.paid) {

          <!-- Mock Interview CTA -->
          <div class="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-cyan-950/40 p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-bold text-white mb-1">Practice your interview</h2>
                <p class="text-sm text-slate-400 mb-3">
                  5 questions tailored to your blockers. Each question targets a specific gap we identified — with live AI feedback.
                </p>
                <a [routerLink]="['/session', session()!.id, 'mock-interview']"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-all">
                  Start Mock Interview
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- 30-Day Plan -->
          @if (session()!.plan?.length) {
            <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 mb-6">
              <h2 class="text-lg font-bold text-white mb-4">30-Day Action Plan</h2>
              <div class="space-y-4">
                @for (item of session()!.plan; track item.title) {
                  <div class="flex gap-4 p-4 rounded-xl bg-slate-800/50">
                    <div class="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <span class="text-sm font-bold text-emerald-400">W{{ item.week }}</span>
                    </div>
                    <div>
                      <div class="font-semibold text-white">{{ item.title }}</div>
                      <div class="text-sm text-slate-400 mt-1">{{ item.description }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- CV Rewrite Bullets -->
          @if (session()!.cvRewriteBullets?.length) {
            <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 mb-6">
              <h2 class="text-lg font-bold text-white mb-4">CV Rewrite Suggestions</h2>
              <ul class="space-y-2">
                @for (bullet of session()!.cvRewriteBullets; track bullet) {
                  <li class="flex items-start gap-2 text-sm text-slate-300">
                    <svg class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ bullet }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Roles to Avoid -->
          @if (session()!.rolesToAvoid?.length) {
            <div class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-6">
              <h2 class="text-lg font-bold text-red-400 mb-4">Roles to Avoid</h2>
              <ul class="space-y-2">
                @for (role of session()!.rolesToAvoid; track role) {
                  <li class="flex items-start gap-2 text-sm text-slate-300">
                    <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ role }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Pivot Suggestion -->
          @if (session()!.pivotSuggestion) {
            <div class="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-6 mb-6">
              <h2 class="text-lg font-bold text-purple-400 mb-2">Pivot Suggestion</h2>
              <p class="text-slate-300">{{ session()!.pivotSuggestion }}</p>
            </div>
          }
        } @else {
          <!-- Contextual Upgrade Messaging -->
          <div class="rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-8 mb-6">
            <div class="text-center mb-6">
              <div class="text-4xl mb-4">🔒</div>
              <h2 class="text-xl font-bold text-white mb-2">{{ upgradeTitle() }}</h2>
              <p class="text-slate-400">{{ upgradeMessage() }}</p>
            </div>

            <!-- Dual CTA -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <a routerLink="/pricing"
                class="block px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
                <div class="text-slate-900 font-bold">Starter</div>
                <div class="text-slate-800 text-sm">&euro;7.99/mo &mdash; Full roadmap + tracking</div>
              </a>
              <a routerLink="/pricing"
                class="block px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-center shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
                <div class="text-white font-bold">Pro</div>
                <div class="text-purple-100 text-sm">&euro;15.99/mo &mdash; 8 AI tools + unlimited</div>
              </a>
            </div>

            <!-- Locked Feature Previews -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-center opacity-60 blur-[1px]">
                <div class="text-lg mb-1">🧠</div>
                <div class="text-xs text-slate-400">Career Mentor</div>
              </div>
              <div class="rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-center opacity-60 blur-[1px]">
                <div class="text-lg mb-1">🎭</div>
                <div class="text-xs text-slate-400">Interview Sim</div>
              </div>
              <div class="rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-center opacity-60 blur-[1px]">
                <div class="text-lg mb-1">📄</div>
                <div class="text-xs text-slate-400">PDF Export</div>
              </div>
              <div class="rounded-xl border border-slate-800 bg-slate-800/30 p-3 text-center opacity-60 blur-[1px]">
                <div class="text-lg mb-1">📊</div>
                <div class="text-xs text-slate-400">Salary Data</div>
              </div>
            </div>
          </div>
        }

        <!-- Share Button -->
        @if (session()!.shareId) {
          <div class="flex items-center justify-center gap-4 mt-8">
            <button (click)="copyShareLink()"
              class="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {{ copied() ? 'Link copied!' : 'Share result' }}
            </button>
            <a routerLink="/session/new"
              class="px-6 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">
              New assessment
            </a>
          </div>
        }
      }
    </div>
  `
})
export class SessionResultComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionApi = inject(SessionApiService);
  private readonly analytics = inject(AnalyticsService);

  loading = signal(true);
  session = signal<SessionResponse | null>(null);
  copied = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.sessionApi.getSession(id).subscribe({
        next: (s) => { this.session.set(s); this.loading.set(false); },
        error: () => {
          // Try sessionStorage fallback for guest sessions
          const cached = sessionStorage.getItem('lastSession');
          if (cached) {
            this.session.set(JSON.parse(cached));
          }
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  /** Deterministic risk % from status + blocker count for slight variation. */
  riskPercent(): number {
    const s = this.session()?.status;
    const blockers = this.session()?.blockers?.length ?? 0;
    if (s === 'RED') return Math.min(95, 72 + blockers * 4);
    if (s === 'GREEN') return Math.max(10, 22 - blockers * 3);
    return Math.min(68, 44 + blockers * 4);
  }

  riskColor(): string {
    const s = this.session()?.status;
    if (s === 'RED') return '#ef4444';
    if (s === 'GREEN') return '#10b981';
    return '#f59e0b';
  }

  statusClasses(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'border-red-500/50 bg-red-500/10';
    if (s === 'GREEN') return 'border-emerald-500/50 bg-emerald-500/10';
    return 'border-amber-500/50 bg-amber-500/10';
  }

  dotClass(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'bg-red-500';
    if (s === 'GREEN') return 'bg-emerald-500';
    return 'bg-amber-500';
  }

  statusLabel(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'High Risk \u2014 Significant gaps detected';
    if (s === 'GREEN') return 'Low Risk \u2014 Strong alignment';
    return 'Medium Risk \u2014 Some areas need work';
  }

  upgradeTitle(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'You need a plan \u2014 urgently';
    if (s === 'GREEN') return 'You\'re close \u2014 get the edge';
    return 'Unlock your full action plan';
  }

  upgradeMessage(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'Your assessment shows significant gaps. Get a full 30-day roadmap with step-by-step tasks, AI career tools, and interview prep to close those gaps fast.';
    if (s === 'GREEN') return 'You have strong alignment! Unlock your full plan to refine your positioning, optimize your CV, and practice with AI interview simulation.';
    return 'Get your complete 30-day action plan, task tracking, session history, shareable reports, and 8 AI-powered career tools.';
  }

  copyShareLink() {
    const shareId = this.session()?.shareId;
    if (!shareId) return;
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      this.analytics.trackEvent('share_created', { sessionId: this.session()?.id });
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
