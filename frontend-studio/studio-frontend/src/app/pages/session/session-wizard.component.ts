import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface WizardData {
  role: string;
  experience: string;
  challenge: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-session-wizard',
  template: `
    <div class="min-h-screen bg-[#0a0f1a] text-white font-sans flex flex-col">

      <!-- NAV -->
      <nav class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <a routerLink="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <span class="text-xs font-bold text-white">IS</span>
          </div>
          <span class="font-semibold text-slate-100 text-sm tracking-wide">Interview Studio</span>
        </a>
        <span class="text-xs text-slate-600">Samm {{ step }} / 3</span>
      </nav>

      <!-- PROGRESS BAR -->
      <div class="h-1 bg-slate-800">
        <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
             [style.width]="(step / 3 * 100) + '%'"></div>
      </div>

      <!-- CONTENT -->
      <div class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-lg">

          <!-- STEP 1 — Roll -->
          <div *ngIf="step === 1" class="animate-fadein">
            <p class="text-xs text-emerald-400 uppercase tracking-widest mb-3">Samm 1 / 3</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Millisele rollile kandideerid?</h2>
            <p class="text-slate-400 text-sm mb-8">Kirjuta täpne ametinimetus — see mõjutab analüüsi täpsust.</p>

            <input
              type="text"
              [(ngModel)]="data.role"
              placeholder="nt. Senior Software Engineer, Product Manager..."
              class="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-base outline-none transition"
              (keyup.enter)="data.role.trim() && next()"
              autofocus
            />

            <div class="mt-3 flex flex-wrap gap-2">
              <button *ngFor="let r of roleExamples" (click)="data.role = r"
                class="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700/50">
                {{ r }}
              </button>
            </div>
          </div>

          <!-- STEP 2 — Kogemus -->
          <div *ngIf="step === 2" class="animate-fadein">
            <p class="text-xs text-emerald-400 uppercase tracking-widest mb-3">Samm 2 / 3</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Millal viimati töötasid selles rollis?</h2>
            <p class="text-slate-400 text-sm mb-8">Oluline on aus vastus — analüüs on deterministlik.</p>

            <div class="flex flex-col gap-3">
              <button *ngFor="let opt of experienceOptions"
                (click)="data.experience = opt.value; next()"
                [class]="'flex items-center gap-4 w-full text-left rounded-xl px-5 py-4 border transition-all ' +
                  (data.experience === opt.value
                    ? 'border-emerald-500 bg-emerald-950/50 text-white'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-300 hover:text-white')"
              >
                <span class="text-xl">{{ opt.icon }}</span>
                <div>
                  <p class="font-semibold text-sm">{{ opt.label }}</p>
                  <p *ngIf="opt.hint" class="text-xs text-slate-500 mt-0.5">{{ opt.hint }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- STEP 3 — Takistus -->
          <div *ngIf="step === 3" class="animate-fadein">
            <p class="text-xs text-emerald-400 uppercase tracking-widest mb-3">Samm 3 / 3</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Mis on sinu peamine takistus?</h2>
            <p class="text-slate-400 text-sm mb-8">Vali see, mis sind praegu kõige rohkem pidurdab.</p>

            <div class="flex flex-col gap-3">
              <button *ngFor="let opt of challengeOptions"
                (click)="data.challenge = opt.value; submit()"
                [class]="'flex items-center gap-4 w-full text-left rounded-xl px-5 py-4 border transition-all ' +
                  (data.challenge === opt.value
                    ? 'border-emerald-500 bg-emerald-950/50 text-white'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-300 hover:text-white')"
              >
                <span class="text-xl">{{ opt.icon }}</span>
                <div>
                  <p class="font-semibold text-sm">{{ opt.label }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- NAV BUTTONS -->
          <div class="flex items-center justify-between mt-8">
            <button *ngIf="step > 1" (click)="back()"
              class="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Tagasi
            </button>
            <div *ngIf="step === 1" class="flex-1"></div>

            <button *ngIf="step === 1"
              (click)="next()"
              [disabled]="!data.role.trim()"
              class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
              Edasi
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
    .animate-fadein { animation: fadein 0.25s ease-out; }
  `]
})
export class SessionWizardComponent {
  step = 1;

  data: WizardData = {
    role: '',
    experience: '',
    challenge: ''
  };

  roleExamples = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Marketing Manager', 'UX Designer'];

  experienceOptions = [
    { value: 'current',    icon: '✅', label: 'Hetkel töötan selles rollis',  hint: 'Aktiivselt selles ametis' },
    { value: 'lt6',        icon: '🕐', label: 'Vähem kui 6 kuud tagasi',       hint: 'Hiljutine kogemus' },
    { value: '6to18',      icon: '📅', label: '6–18 kuud tagasi',              hint: 'Mõningane lõhe' },
    { value: 'gt18',       icon: '⏳', label: 'Rohkem kui 18 kuud tagasi',     hint: 'Pikem paus' },
    { value: 'never',      icon: '🔄', label: 'Ei ole kunagi töötanud selles rollis', hint: 'Karjäärimuutus' },
  ];

  challengeOptions = [
    { value: 'no_interviews',  icon: '📭', label: 'CV ei too intervjuukutseid' },
    { value: 'fail_interview', icon: '😬', label: 'Intervjuul jään hätta' },
    { value: 'dont_know',      icon: '🧭', label: 'Ei tea, kuhu kandideerida' },
    { value: 'career_switch',  icon: '🔀', label: 'Karjääripöörde tegemine' },
    { value: 'salary',         icon: '💰', label: 'Palga läbirääkimised' },
  ];

  constructor(private router: Router) {}

  next(): void {
    if (this.step === 1 && this.data.role.trim()) {
      this.step = 2;
    }
  }

  back(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    const session = this.buildSession();
    sessionStorage.setItem('session_' + session.id, JSON.stringify(session));
    localStorage.setItem('session_full_' + session.id, JSON.stringify(session));

    // Save to history (all sessions, guest + auth)
    const raw = localStorage.getItem('interview_history');
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({
      id: session.id,
      role: session.role,
      score: session.score,
      verdict: session.verdict,
      createdAt: session.createdAt,
      paid: session.paid,
      mode: 'simple'
    });
    localStorage.setItem('interview_history', JSON.stringify(history));

    this.router.navigate(['/session', session.id]);
  }

  private buildSession() {
    const id = this.generateId();
    const score = this.calculateScore();
    const verdict = score >= 70 ? 'GREEN' : score >= 45 ? 'YELLOW' : 'RED';

    return {
      id,
      role: this.data.role,
      experience: this.data.experience,
      challenge: this.data.challenge,
      score,
      verdict,
      createdAt: new Date().toISOString(),
      paid: false
    };
  }

  private calculateScore(): number {
    const { experience, challenge } = this.data;

    // Base score from experience
    let base = 0;
    if (experience === 'current') base = 82;
    else if (experience === 'lt6')    base = 74;
    else if (experience === '6to18')  base = 52;
    else if (experience === 'gt18')   base = 28;
    else if (experience === 'never')  base = 18;

    // Challenge modifier
    let mod = 0;
    if (challenge === 'career_switch') mod = -10;
    else if (challenge === 'no_interviews') mod = -5;
    else if (challenge === 'fail_interview') mod = -3;
    else if (challenge === 'salary') mod = +5;

    // Role-based determinism (hash of role string for consistency)
    const roleHash = this.hashStr(this.data.role.toLowerCase().trim()) % 11 - 5; // -5..+5

    return Math.min(98, Math.max(5, base + mod + roleHash));
  }

  private hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
}
