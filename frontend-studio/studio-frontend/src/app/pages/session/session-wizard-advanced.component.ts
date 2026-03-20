import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdvancedData {
  role: string;
  experience: string;
  urgency: string;
  workExamples: string;
  blocker: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-session-wizard-advanced',
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
        <div class="flex items-center gap-3">
          <span class="text-xs bg-teal-900/60 text-teal-400 px-2.5 py-1 rounded-full border border-teal-800/50">Advanced Mode</span>
          <span class="text-xs text-slate-600">Samm {{ step }} / 5</span>
        </div>
      </nav>

      <!-- PROGRESS BAR -->
      <div class="h-1 bg-slate-800">
        <div class="h-1 bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
             [style.width]="(step / 5 * 100) + '%'"></div>
      </div>

      <div class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="w-full max-w-lg">

          <!-- STEP 1 — Roll -->
          <div *ngIf="step === 1" class="animate-fadein">
            <p class="text-xs text-teal-400 uppercase tracking-widest mb-3">Samm 1 / 5</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Millisele rollile kandideerid?</h2>
            <p class="text-slate-400 text-sm mb-8">Kirjuta täpne ametinimetus.</p>
            <input
              type="text"
              [(ngModel)]="data.role"
              placeholder="nt. Senior Software Engineer, Product Manager..."
              class="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-base outline-none transition"
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
            <p class="text-xs text-teal-400 uppercase tracking-widest mb-3">Samm 2 / 5</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Millal viimati töötasid selles rollis?</h2>
            <p class="text-slate-400 text-sm mb-8">Ajaline vahe mõjutab skoori kõige rohkem.</p>
            <div class="flex flex-col gap-3">
              <button *ngFor="let opt of experienceOptions"
                (click)="data.experience = opt.value; next()"
                [class]="'flex items-center gap-4 w-full text-left rounded-xl px-5 py-4 border transition-all ' +
                  (data.experience === opt.value
                    ? 'border-teal-500 bg-teal-950/50 text-white'
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

          <!-- STEP 3 — Kiirus -->
          <div *ngIf="step === 3" class="animate-fadein">
            <p class="text-xs text-teal-400 uppercase tracking-widest mb-3">Samm 3 / 5</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Kui kiiresti vajad tööd?</h2>
            <p class="text-slate-400 text-sm mb-8">Kiireloomulisus mõjutab soovituste prioriteete.</p>
            <div class="flex flex-col gap-3">
              <button *ngFor="let opt of urgencyOptions"
                (click)="data.urgency = opt.value; next()"
                [class]="'flex items-center gap-4 w-full text-left rounded-xl px-5 py-4 border transition-all ' +
                  (data.urgency === opt.value
                    ? 'border-teal-500 bg-teal-950/50 text-white'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-300 hover:text-white')"
              >
                <span class="text-xl">{{ opt.icon }}</span>
                <p class="font-semibold text-sm">{{ opt.label }}</p>
              </button>
            </div>
          </div>

          <!-- STEP 4 — Näited -->
          <div *ngIf="step === 4" class="animate-fadein">
            <p class="text-xs text-teal-400 uppercase tracking-widest mb-3">Samm 4 / 5</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Kirjelda hiljutisi töökogemusi</h2>
            <p class="text-slate-400 text-sm mb-8">Konkreetsed näited parandavad analüüsi kvaliteeti. Võib olla ka märksõnad.</p>
            <textarea
              [(ngModel)]="data.workExamples"
              placeholder="nt. Juhtisin 5-liikmelist tiimi, käivitasin uue toote 3 kuuga, kasvasin MAU 40%..."
              rows="5"
              class="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm outline-none transition resize-none"
            ></textarea>
            <p class="text-xs text-slate-600 mt-2">Võid ka vahele jätta — kliki "Edasi"</p>
          </div>

          <!-- STEP 5 — Blokeerija -->
          <div *ngIf="step === 5" class="animate-fadein">
            <p class="text-xs text-teal-400 uppercase tracking-widest mb-3">Samm 5 / 5</p>
            <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Mis sind praegu kõige rohkem pidurdab?</h2>
            <p class="text-slate-400 text-sm mb-8">Vali peamine takistus.</p>
            <div class="flex flex-col gap-3">
              <button *ngFor="let opt of blockerOptions"
                (click)="data.blocker = opt.value; submit()"
                [class]="'flex items-center gap-4 w-full text-left rounded-xl px-5 py-4 border transition-all ' +
                  (data.blocker === opt.value
                    ? 'border-teal-500 bg-teal-950/50 text-white'
                    : 'border-slate-700 bg-slate-900 hover:border-slate-500 text-slate-300 hover:text-white')"
              >
                <span class="text-xl">{{ opt.icon }}</span>
                <p class="font-semibold text-sm">{{ opt.label }}</p>
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

            <!-- Step 1 next -->
            <button *ngIf="step === 1"
              (click)="next()"
              [disabled]="!data.role.trim()"
              class="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
              Edasi
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <!-- Step 4 — textarea, manual next -->
            <button *ngIf="step === 4"
              (click)="next()"
              class="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all">
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
export class SessionWizardAdvancedComponent {
  step = 1;

  data: AdvancedData = {
    role: '',
    experience: '',
    urgency: '',
    workExamples: '',
    blocker: ''
  };

  roleExamples = ['Software Engineer', 'Product Manager', 'Data Analyst', 'Marketing Manager', 'UX Designer'];

  experienceOptions = [
    { value: 'current', icon: '✅', label: 'Hetkel töötan selles rollis', hint: null },
    { value: 'lt6',     icon: '🕐', label: 'Vähem kui 6 kuud tagasi',     hint: 'Hiljutine kogemus' },
    { value: '6to18',   icon: '📅', label: '6–18 kuud tagasi',             hint: 'Mõningane lõhe' },
    { value: 'gt18',    icon: '⏳', label: 'Rohkem kui 18 kuud tagasi',    hint: 'Pikem paus' },
    { value: 'never',   icon: '🔄', label: 'Ei ole kunagi töötanud',       hint: 'Karjäärimuutus' },
  ];

  urgencyOptions = [
    { value: 'asap',    icon: '🔥', label: 'Võimalikult kiiresti (2-4 nädalat)' },
    { value: '1to3',    icon: '📆', label: '1–3 kuu jooksul' },
    { value: '3to6',    icon: '🗓️', label: '3–6 kuu jooksul' },
    { value: 'exploring', icon: '🔍', label: 'Uurin võimalusi, pole kiiret' },
  ];

  blockerOptions = [
    { value: 'no_interviews',  icon: '📭', label: 'CV ei too intervjuukutseid' },
    { value: 'fail_interview', icon: '😬', label: 'Intervjuul jään hätta' },
    { value: 'career_switch',  icon: '🔀', label: 'Karjääripöörde tegemine' },
    { value: 'dont_know',      icon: '🧭', label: 'Ei tea, milliseid rolle sihtida' },
    { value: 'salary',         icon: '💰', label: 'Palgaläbirääkimised' },
  ];

  constructor(private router: Router) {}

  next(): void {
    if (this.step < 5) this.step++;
  }

  back(): void {
    if (this.step > 1) this.step--;
  }

  submit(): void {
    const session = this.buildSession();
    sessionStorage.setItem('session_' + session.id, JSON.stringify(session));
    localStorage.setItem('session_full_' + session.id, JSON.stringify(session));

    // Save to history
    const raw = localStorage.getItem('interview_history');
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({
      id: session.id,
      role: session.role,
      score: session.score,
      verdict: session.verdict,
      createdAt: session.createdAt,
      paid: session.paid,
      mode: 'advanced'
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
      urgency: this.data.urgency,
      workExamples: this.data.workExamples,
      blocker: this.data.blocker,
      challenge: this.data.blocker,
      score,
      verdict,
      createdAt: new Date().toISOString(),
      paid: false,
      mode: 'advanced'
    };
  }

  private calculateScore(): number {
    const { experience, urgency, workExamples, blocker } = this.data;

    let base = 0;
    if (experience === 'current') base = 80;
    else if (experience === 'lt6')    base = 72;
    else if (experience === '6to18')  base = 50;
    else if (experience === 'gt18')   base = 26;
    else if (experience === 'never')  base = 16;

    // Work examples boost
    const examplesLen = workExamples.trim().length;
    const examplesBoost = examplesLen > 100 ? 8 : examplesLen > 30 ? 4 : 0;

    // Urgency modifier — urgent + weak = worse
    let urgencyMod = 0;
    if (urgency === 'asap' && base < 50) urgencyMod = -6;
    else if (urgency === 'exploring') urgencyMod = +3;

    // Blocker modifier
    let blockerMod = 0;
    if (blocker === 'career_switch') blockerMod = -10;
    else if (blocker === 'no_interviews') blockerMod = -5;
    else if (blocker === 'fail_interview') blockerMod = -3;
    else if (blocker === 'salary') blockerMod = +4;

    const roleHash = this.hashStr(this.data.role.toLowerCase().trim()) % 11 - 5;

    return Math.min(98, Math.max(5, base + examplesBoost + urgencyMod + blockerMod + roleHash));
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
