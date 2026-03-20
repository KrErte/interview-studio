import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SharedSession {
  id: string;
  role: string;
  score: number;
  verdict: 'RED' | 'YELLOW' | 'GREEN';
  createdAt: string;
  paid: boolean;
  mode?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-session-share',
  template: `
    <div class="min-h-screen bg-[#0a0f1a] text-white font-sans" *ngIf="session; else notFound">

      <!-- NAV -->
      <nav class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <a routerLink="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <span class="text-xs font-bold text-white">IS</span>
          </div>
          <span class="font-semibold text-slate-100 text-sm tracking-wide">Interview Studio</span>
        </a>
        <a routerLink="/session/new"
          class="text-sm bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-4 py-1.5 rounded-md transition">
          Analüüsi ennast
        </a>
      </nav>

      <div class="max-w-xl mx-auto px-6 py-12">

        <!-- SHARED BADGE -->
        <div class="flex items-center gap-2 mb-6">
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          <span class="text-xs text-slate-500">Jagatud intervjuuanalüüs</span>
        </div>

        <p class="text-xs text-slate-500 uppercase tracking-widest mb-2">Analüüs rollile</p>
        <h1 class="text-2xl font-bold text-white mb-8">{{ session.role }}</h1>

        <!-- SCORE RING -->
        <div class="flex flex-col items-center mb-10">
          <div class="relative w-36 h-36 mb-4">
            <svg class="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1e293b" stroke-width="10"/>
              <circle cx="60" cy="60" r="52" fill="none"
                [attr.stroke]="verdictColor"
                stroke-width="10"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="dashOffset"
                style="transition: stroke-dashoffset 1s ease-out;"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-white">{{ session.score }}%</span>
              <span class="text-xs font-semibold mt-0.5" [style.color]="verdictColor">{{ verdictLabel }}</span>
            </div>
          </div>
          <p class="text-slate-400 text-sm text-center max-w-xs">{{ verdictMessage }}</p>
        </div>

        <!-- META -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 mb-8 flex items-center justify-between text-sm text-slate-400">
          <span>{{ formatDate(session.createdAt) }}</span>
          <span *ngIf="session.mode === 'advanced'" class="text-xs bg-teal-900/60 text-teal-400 px-2 py-0.5 rounded border border-teal-800/50">Advanced Mode</span>
        </div>

        <!-- CTA -->
        <div class="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-center">
          <p class="text-sm font-semibold text-slate-200 mb-1">Analüüsi oma valmisolekut</p>
          <p class="text-xs text-slate-500 mb-5">Tasuta · Ilma registreerimiseta · 60 sekundiga</p>
          <a routerLink="/session/new"
            class="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20">
            Alusta oma analüüsi
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

      </div>
    </div>

    <ng-template #notFound>
      <div class="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-2">
          <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-slate-400 font-semibold">Jagamislinki ei leitud</p>
        <p class="text-slate-600 text-sm">Link võib olla aegunud või kustutatud</p>
        <a routerLink="/" class="text-emerald-400 hover:underline text-sm mt-2">Tagasi avalehele</a>
      </div>
    </ng-template>
  `
})
export class SessionShareComponent implements OnInit {
  session: SharedSession | null = null;
  readonly circumference = 2 * Math.PI * 52;

  get dashOffset(): number {
    if (!this.session) return this.circumference;
    return this.circumference * (1 - this.session.score / 100);
  }

  get verdictColor(): string {
    if (!this.session) return '#64748b';
    if (this.session.verdict === 'GREEN') return '#34d399';
    if (this.session.verdict === 'YELLOW') return '#fbbf24';
    return '#f87171';
  }

  get verdictLabel(): string {
    if (!this.session) return '';
    if (this.session.verdict === 'GREEN') return 'INTERVIEW READY';
    if (this.session.verdict === 'YELLOW') return 'NEEDS WORK';
    return 'HIGH RISK';
  }

  get verdictMessage(): string {
    if (!this.session) return '';
    if (this.session.verdict === 'GREEN') return 'Hea positsioneering. Põhifookus peaks olema CV optimeerimisel ja läbirääkimistel.';
    if (this.session.verdict === 'YELLOW') return 'Kogemus on olemas, aga esitlemine vajab tööd. Struktuurne plaan aitab.';
    return 'Praegune profiil ei konkureeri veel. Repositioneerimine on vajalik enne kandideerimist.';
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const shareId = this.route.snapshot.paramMap.get('shareId');
    if (shareId) {
      const raw = localStorage.getItem('share_' + shareId);
      if (raw) {
        this.session = JSON.parse(raw);
      }
    }
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('et-EE', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
