import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionApiService, SessionResponse } from '../../core/services/session-api.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-share-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-stone-200 border-t-stone-900 animate-spin"></div>
        </div>
      }

      @if (!loading() && !session()) {
        <div class="text-center py-20">
          <h1 class="text-2xl font-bold text-stone-900 mb-2">Report not found</h1>
          <p class="text-stone-500 mb-6">This shared report link may be invalid or expired.</p>
          <a routerLink="/" class="inline-block px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors">
            Go to homepage
          </a>
        </div>
      }

      @if (!loading() && session()) {
        <!-- Shared badge -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 bg-stone-50 text-xs text-stone-500 mb-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Shared Career Risk Report
          </div>

          <!-- Risk ring -->
          <div class="flex justify-center mb-5">
            <div class="relative w-36 h-36">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10" class="text-stone-200" stroke="currentColor"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10"
                  [attr.stroke]="riskColor()"
                  stroke-linecap="square"
                  [attr.stroke-dasharray]="314"
                  [attr.stroke-dashoffset]="314 - (314 * riskPercent() / 100)"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-stone-900">{{ riskPercent() }}%</span>
                <span class="text-[10px] text-stone-400 uppercase tracking-wider">Risk Score</span>
              </div>
            </div>
          </div>

          <div class="inline-flex items-center gap-3 px-6 py-3 border mb-4"
            [class]="statusClasses()">
            <div class="w-4 h-4" [class]="dotClass()"></div>
            <span class="text-xl font-bold">{{ statusLabel() }}</span>
          </div>

          <h1 class="text-3xl font-black text-stone-900 mt-4">{{ session()!.targetRole }}</h1>
        </div>

        <!-- Blockers -->
        <div class="border border-stone-200 bg-white p-6 mb-6">
          <h2 class="text-lg font-bold text-stone-900 mb-4">Key Findings</h2>
          <div class="space-y-3">
            @for (blocker of session()!.blockers; track blocker) {
              <div class="flex items-start gap-3 p-3 bg-stone-50 border border-stone-100">
                <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm text-stone-700">{{ blocker }}</span>
              </div>
            }
          </div>
        </div>

        <!-- CTA -->
        <div class="border-2 border-red-200 bg-gradient-to-b from-red-50 to-white p-8 text-center">
          <h2 class="text-2xl font-black text-stone-900 mb-2">Is YOUR career at risk from AI?</h2>
          <p class="text-stone-500 mb-6 max-w-md mx-auto">This person checked their risk. 47% of jobs are at high automation risk. Find out where you stand — free, in 3 minutes.</p>
          <a routerLink="/session/new"
            class="inline-block px-8 py-4 bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition-colors">
            Check My Career Risk — Free
          </a>
          <div class="flex items-center justify-center gap-4 mt-4 text-xs text-stone-400">
            <span>Free</span><span>·</span><span>3 minutes</span><span>·</span><span>No account needed</span>
          </div>
        </div>
      }
    </div>
  `
})
export class ShareReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionApi = inject(SessionApiService);
  private readonly seo = inject(SeoService);

  loading = signal(true);
  session = signal<SessionResponse | null>(null);

  ngOnInit() {
    const shareId = this.route.snapshot.paramMap.get('shareId') || '';
    if (shareId) {
      this.sessionApi.getSharedSession(shareId).subscribe({
        next: (s) => {
          this.session.set(s);
          this.loading.set(false);
          this.seo.updateMeta({
            title: `${s.targetRole} — ${this.riskPercent()}% AI Risk | CareerRisk`,
            description: `This ${s.targetRole} has a ${this.riskPercent()}% automation risk score. Check your own career risk — free in 3 minutes.`,
            url: `https://careerrisk.ee/share/${shareId}`
          });
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }

  riskPercent(): number {
    const s = this.session()?.status;
    const blockers = this.session()?.blockers?.length ?? 0;
    if (s === 'RED') return Math.min(95, 72 + blockers * 4);
    if (s === 'GREEN') return Math.max(10, 22 - blockers * 3);
    return Math.min(68, 44 + blockers * 4);
  }

  riskColor(): string {
    const s = this.session()?.status;
    if (s === 'RED') return '#dc2626';
    if (s === 'GREEN') return '#16a34a';
    return '#d97706';
  }

  statusClasses(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'border-red-300 bg-red-50 text-red-700';
    if (s === 'GREEN') return 'border-green-300 bg-green-50 text-green-700';
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  dotClass(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'bg-red-600';
    if (s === 'GREEN') return 'bg-green-600';
    return 'bg-amber-500';
  }

  statusLabel(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'High Risk';
    if (s === 'GREEN') return 'Low Risk';
    return 'Medium Risk';
  }
}
