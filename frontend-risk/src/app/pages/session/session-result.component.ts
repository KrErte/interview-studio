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
        <!-- Status Badge -->
        <div class="text-center mb-8">
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
          <!-- Upgrade CTA -->
          <div class="rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-8 text-center mb-6">
            <div class="text-4xl mb-4">🔒</div>
            <h2 class="text-xl font-bold text-white mb-2">Unlock your full plan</h2>
            <p class="text-slate-400 mb-6">Get your complete 30-day action plan, CV rewrite suggestions, roles to avoid, and pivot strategy.</p>
            <a routerLink="/pricing"
              class="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
              View Plans
            </a>
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
    if (s === 'RED') return 'High Risk — Significant gaps detected';
    if (s === 'GREEN') return 'Low Risk — Strong alignment';
    return 'Medium Risk — Some areas need work';
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
