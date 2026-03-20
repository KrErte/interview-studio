import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface SessionData {
  id: string;
  role: string;
  experience: string;
  challenge: string;
  score: number;
  verdict: 'RED' | 'YELLOW' | 'GREEN';
  createdAt: string;
  paid: boolean;
}

interface Blocker {
  icon: string;
  title: string;
  desc: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-session-result',
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
        <div class="flex gap-3">
          <a routerLink="/session/new"
            class="text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-slate-800">
            Uus analüüs
          </a>
          <a routerLink="/history"
            class="text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-slate-800">
            Ajalugu
          </a>
          <a routerLink="/register"
            class="text-sm bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-md font-medium transition">
            Salvesta tulemused
          </a>
        </div>
      </nav>

      <div class="max-w-2xl mx-auto px-6 py-12">

        <!-- ROLE LABEL -->
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

        <!-- BLOCKERS (Free — 3 items) -->
        <div class="mb-8">
          <h2 class="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Peamised takistused</h2>
          <div class="flex flex-col gap-3">
            <div *ngFor="let b of blockers.slice(0, 3)"
              class="flex gap-4 bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
              <span class="text-xl mt-0.5">{{ b.icon }}</span>
              <div>
                <p class="font-semibold text-sm text-white mb-0.5">{{ b.title }}</p>
                <p class="text-xs text-slate-500 leading-relaxed">{{ b.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- TEASER / UPSELL -->
        <div class="relative rounded-2xl border border-amber-700/50 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-6 mb-8 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-600/10 blur-3xl pointer-events-none"></div>

          <!-- Blurred preview -->
          <div class="mb-4">
            <p class="text-xs text-amber-400 uppercase tracking-widest mb-3 font-semibold">30-päeva tegevusplaan</p>
            <div class="space-y-2">
              <div *ngFor="let item of planTeaser"
                class="flex items-center gap-3 blur-sm select-none opacity-60">
                <div class="w-5 h-5 rounded-full border border-slate-600 flex-shrink-0"></div>
                <span class="text-sm text-slate-300">{{ item }}</span>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-700/50 pt-5 text-center">
            <p class="text-sm text-slate-300 mb-1 font-semibold">Ava täielik 30-päeva plaan</p>
            <p class="text-xs text-slate-500 mb-4">CV ümberkirjutussoovitused · Rollid, mida vältida · Pivot-soovitus</p>
            <button
              (click)="unlock()"
              class="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/20">
              Ava täielik plaan — €9,99
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </button>
            <p class="text-xs text-slate-600 mt-2">Ühekordne makse · Kehtib selle seansi kohta</p>
          </div>
        </div>

        <!-- SAVE TO ACCOUNT CTA -->
        <div class="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5 text-center">
          <p class="text-sm text-slate-300 font-semibold mb-1">Salvesta tulemused oma kontole</p>
          <p class="text-xs text-slate-500 mb-4">Ajalugu · Jagamislink · Edasijõudmine</p>
          <div class="flex gap-3 justify-center">
            <a routerLink="/register"
              class="text-sm bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-lg transition font-medium">
              Registreeru tasuta
            </a>
            <a routerLink="/login"
              class="text-sm text-slate-400 hover:text-white px-5 py-2.5 rounded-lg transition">
              Logi sisse
            </a>
          </div>
        </div>

      </div>
    </div>

    <ng-template #notFound>
      <div class="min-h-screen bg-[#0a0f1a] text-white flex flex-col items-center justify-center gap-4">
        <p class="text-slate-400">Seanssi ei leitud.</p>
        <a routerLink="/session/new" class="text-emerald-400 hover:underline text-sm">Alusta uuesti</a>
      </div>
    </ng-template>
  `
})
export class SessionResultComponent implements OnInit {
  session: SessionData | null = null;
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
    if (this.session.verdict === 'GREEN')
      return 'Hea positsioneering. Põhifookus peaks olema CV optimeerimisel ja läbirääkimistel.';
    if (this.session.verdict === 'YELLOW')
      return 'Kogemus on olemas, aga esitlemine vajab tööd. Struktuurne plaan aitab.';
    return 'Praegune profiil ei konkursi veel. Repositioneerimine on vajalik enne kandideerimist.';
  }

  get blockers(): Blocker[] {
    if (!this.session) return [];
    const { experience, challenge, verdict } = this.session;

    const pool: Blocker[] = [];

    if (experience === 'gt18' || experience === 'never') {
      pool.push({
        icon: '⏳',
        title: 'Kogemuste lõhe CV-s',
        desc: 'Pikk paus selles rollis tõstab punase lipu. Vaja on lõhe selgitust ja käimasolevaid projekte.'
      });
    }
    if (experience === '6to18') {
      pool.push({
        icon: '📅',
        title: 'Kogemus vajab ajakohastamist',
        desc: '6–18 kuud on piisavalt pikk, et intervjueerija kahtlustab — vaja on tugevat selgitust.'
      });
    }
    if (challenge === 'no_interviews') {
      pool.push({
        icon: '📭',
        title: 'CV ei läbi ATS-filtrit',
        desc: 'Enamik CV-sid filtreeritakse algoritmidega enne inimsilma. Märksõnad ja formaat on kriitilised.'
      });
    }
    if (challenge === 'fail_interview') {
      pool.push({
        icon: '😬',
        title: 'Vastuste struktuur puudub',
        desc: 'STAR-meetodit järgimata jäävad tugevad kogemused varjatuks. Harjuta suunatud vastuseid.'
      });
    }
    if (challenge === 'career_switch') {
      pool.push({
        icon: '🔀',
        title: 'Karjäärimuutuse narratiiv puudub',
        desc: 'Tööandjad palkavad kandideerimisel kindlust. Selge "miks" lugu on kohustuslik.'
      });
    }
    if (challenge === 'dont_know') {
      pool.push({
        icon: '🧭',
        title: 'Sihtmärk on ebaselge',
        desc: 'Ilma fookuseta kandideerijad saavad vastuseid harvemini. Sihtimine on esimene samm.'
      });
    }

    // Fill up to 4 with generic blockers based on verdict
    if (verdict === 'RED' || pool.length < 3) {
      pool.push({
        icon: '📝',
        title: 'CV põhisõnumid on nõrgad',
        desc: 'Tugev CV räägib mõõdetavatest tulemustest, mitte ülesannetest. Numbrid ja mõju on kohustuslikud.'
      });
      pool.push({
        icon: '🔗',
        title: 'LinkedIn profiil vajab optimeerimist',
        desc: 'Üle 70% värbamisotsustest tehakse LinkedIn-i põhjal. Profiil peab kinnitama CV-d.'
      });
      pool.push({
        icon: '🎯',
        title: 'Kandideerimise prioriteetide puudumine',
        desc: 'Massväljaastumised vähendavad isikupärast lähenemist. 5 õiget rakendust on parem kui 50 juhuslikku.'
      });
    }

    return pool;
  }

  get planTeaser(): string[] {
    return [
      'Nädal 1: CV ümberkirjutus + ATS optimeerimine',
      'Nädal 2: 5 sihitud kandideerimist + võrgustiku aktiveerimine',
      'Nädal 3: Intervjuu harjutamine (STAR vastused)',
      'Nädal 4: Järelkontrollid + palgaläbirääkimised',
      'CV ümberkirjutuse mall sinu rollile',
      '3 rolli, mida tasub vältida praegu',
    ];
  }

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const raw = sessionStorage.getItem('session_' + id);
      if (raw) {
        this.session = JSON.parse(raw);
      }
    }
  }

  unlock(): void {
    // Stripe stub — navigeeri pricing lehele
    this.router.navigate(['/pricing']);
  }
}
