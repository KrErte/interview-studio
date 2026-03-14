import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionApiService, SessionResponse } from '../../core/services/session-api.service';

@Component({
  selector: 'app-share-report',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      @if (!loading() && !session()) {
        <div class="text-center py-20">
          <div class="text-5xl mb-4">🔗</div>
          <h1 class="text-2xl font-bold text-white mb-2">Report not found</h1>
          <p class="text-slate-400 mb-6">This shared report link may be invalid or expired.</p>
          <a routerLink="/" class="inline-block px-6 py-3 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">
            Go to homepage
          </a>
        </div>
      }

      @if (!loading() && session()) {
        <!-- Shared report header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-400 mb-4">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Shared Report
          </div>

          <div class="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border mb-4"
            [class]="session()!.status === 'RED' ? 'border-red-500/50 bg-red-500/10' : session()!.status === 'GREEN' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-amber-500/50 bg-amber-500/10'">
            <div class="w-4 h-4 rounded-full"
              [class]="session()!.status === 'RED' ? 'bg-red-500' : session()!.status === 'GREEN' ? 'bg-emerald-500' : 'bg-amber-500'"></div>
            <span class="text-lg font-bold text-white">
              {{ session()!.status === 'RED' ? 'High Risk' : session()!.status === 'GREEN' ? 'Low Risk' : 'Medium Risk' }}
            </span>
          </div>

          <h1 class="text-3xl font-bold text-white mt-4">{{ session()!.targetRole }}</h1>
        </div>

        <!-- Blockers -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 mb-6">
          <h2 class="text-lg font-bold text-white mb-4">Key Findings</h2>
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

        <!-- CTA -->
        <div class="text-center mt-10">
          <p class="text-slate-400 mb-4">Want your own career assessment?</p>
          <a routerLink="/session/new"
            class="inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
            Start Free Assessment
          </a>
        </div>
      }
    </div>
  `
})
export class ShareReportComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionApi = inject(SessionApiService);

  loading = signal(true);
  session = signal<SessionResponse | null>(null);

  ngOnInit() {
    const shareId = this.route.snapshot.paramMap.get('shareId') || '';
    if (shareId) {
      this.sessionApi.getSharedSession(shareId).subscribe({
        next: (s) => { this.session.set(s); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    } else {
      this.loading.set(false);
    }
  }
}
