import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface HistorySession {
  id: string;
  role: string;
  score: number;
  verdict: 'RED' | 'YELLOW' | 'GREEN';
  createdAt: string;
  paid: boolean;
  shareId?: string;
  mode?: 'simple' | 'advanced';
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-session-history',
  template: `
    <div class="min-h-screen bg-[#0a0f1a] text-white font-sans">

      <!-- NAV -->
      <nav class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <a routerLink="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <span class="text-xs font-bold text-white">IS</span>
          </div>
          <span class="font-semibold text-slate-100 text-sm tracking-wide">Interview Studio</span>
        </a>
        <div class="flex gap-3 items-center">
          <span class="text-xs text-slate-500">{{ userName }}</span>
          <button (click)="logout()" class="text-xs text-slate-500 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-slate-800">
            Logi välja
          </button>
        </div>
      </nav>

      <div class="max-w-2xl mx-auto px-6 py-12">

        <!-- HEADER -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl font-bold text-white">Seansi ajalugu</h1>
            <p class="text-slate-500 text-sm mt-1">{{ sessions.length }} seanssi salvestatud</p>
          </div>
          <a routerLink="/session/new"
            class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            Uus analüüs
          </a>
        </div>

        <!-- EMPTY STATE -->
        <div *ngIf="sessions.length === 0" class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="text-slate-400 font-semibold mb-2">Ajalugu on tühi</p>
          <p class="text-slate-600 text-sm mb-6">Alusta oma esimese analüüsiga</p>
          <a routerLink="/session/new"
            class="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition">
            Alusta analüüsi
          </a>
        </div>

        <!-- SESSION LIST -->
        <div *ngIf="sessions.length > 0" class="flex flex-col gap-3">
          <div *ngFor="let s of sessions"
            class="group relative flex items-center gap-4 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl px-5 py-4 transition cursor-pointer"
            (click)="openSession(s)">

            <!-- Score ring mini -->
            <div class="relative w-12 h-12 flex-shrink-0">
              <svg class="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#1e293b" stroke-width="4"/>
                <circle cx="20" cy="20" r="16" fill="none"
                  [attr.stroke]="getColor(s.verdict)"
                  stroke-width="4"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="100.5"
                  [attr.stroke-dashoffset]="100.5 * (1 - s.score / 100)"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-xs font-bold text-white">{{ s.score }}</span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-white text-sm truncate">{{ s.role }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs font-semibold" [style.color]="getColor(s.verdict)">{{ getLabel(s.verdict) }}</span>
                <span class="text-slate-700">·</span>
                <span class="text-xs text-slate-500">{{ formatDate(s.createdAt) }}</span>
                <span *ngIf="s.mode === 'advanced'" class="text-xs bg-teal-900/60 text-teal-400 px-1.5 py-0.5 rounded border border-teal-800/50">Advanced</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                (click)="$event.stopPropagation(); shareSession(s)"
                class="p-2 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-white transition"
                title="Kopeeri jagamislink">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                </svg>
              </button>
              <button
                (click)="$event.stopPropagation(); deleteSession(s.id)"
                class="p-2 rounded-lg hover:bg-red-900/40 text-slate-500 hover:text-red-400 transition"
                title="Kustuta">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <!-- Paid badge -->
            <span *ngIf="s.paid"
              class="flex-shrink-0 text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded border border-amber-700/40">
              Full plan
            </span>
          </div>
        </div>

        <!-- SHARE TOAST -->
        <div *ngIf="toastVisible"
          class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
          Jagamislink kopeeritud!
        </div>

      </div>
    </div>
  `
})
export class SessionHistoryComponent implements OnInit {
  sessions: HistorySession[] = [];
  toastVisible = false;

  get userName(): string {
    return this.auth.getCurrentUserName() || this.auth.getCurrentUserEmail() || '';
  }

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    const raw = localStorage.getItem('interview_history');
    if (raw) {
      const all: HistorySession[] = JSON.parse(raw);
      this.sessions = all.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  openSession(s: HistorySession): void {
    // Re-inject into sessionStorage so result page can read it
    const fullRaw = localStorage.getItem('session_full_' + s.id);
    if (fullRaw) {
      sessionStorage.setItem('session_' + s.id, fullRaw);
    }
    this.router.navigate(['/session', s.id]);
  }

  shareSession(s: HistorySession): void {
    const shareId = s.shareId || s.id;
    // Save share data
    const fullRaw = localStorage.getItem('session_full_' + s.id);
    if (fullRaw) {
      localStorage.setItem('share_' + shareId, fullRaw);
    }
    const url = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(url).then(() => this.showToast());
  }

  deleteSession(id: string): void {
    const raw = localStorage.getItem('interview_history');
    if (!raw) return;
    const all: HistorySession[] = JSON.parse(raw);
    const updated = all.filter(s => s.id !== id);
    localStorage.setItem('interview_history', JSON.stringify(updated));
    localStorage.removeItem('session_full_' + id);
    this.loadSessions();
  }

  showToast(): void {
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 2500);
  }

  logout(): void {
    this.auth.logout();
  }

  getColor(v: string): string {
    if (v === 'GREEN') return '#34d399';
    if (v === 'YELLOW') return '#fbbf24';
    return '#f87171';
  }

  getLabel(v: string): string {
    if (v === 'GREEN') return 'INTERVIEW READY';
    if (v === 'YELLOW') return 'NEEDS WORK';
    return 'HIGH RISK';
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('et-EE', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
