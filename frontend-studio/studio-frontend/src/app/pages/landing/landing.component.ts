import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-landing',
  template: `
    <div class="min-h-screen bg-[#0a0f1a] text-white font-sans">

      <!-- NAV -->
      <nav class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <span class="text-xs font-bold text-white">IS</span>
          </div>
          <span class="font-semibold text-slate-100 text-sm tracking-wide">Interview Studio</span>
        </div>
        <div class="flex gap-3">
          <a routerLink="/login" class="text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-slate-800">Sign in</a>
          <a routerLink="/register" class="text-sm bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-md font-medium transition">Get started free</a>
        </div>
      </nav>

      <!-- HERO -->
      <div class="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">

        <!-- Social proof ticker -->
        <div class="inline-flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-full px-4 py-1.5 text-xs text-slate-400 mb-8">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span><strong class="text-slate-200">1 247</strong> kandidaati analüüsitud sel nädalal</span>
        </div>

        <h1 class="text-4xl sm:text-5xl font-bold leading-tight mb-5 text-white">
          Kas oled tööintervjuuks
          <br>
          <span class="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">päriselt valmis?</span>
        </h1>
        <p class="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          60 sekundiga saad teada, mis sind takistab — ja täpselt mida teha.
          Ilma registreerimiseta.
        </p>

        <!-- MAIN CTA -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            (click)="startQuick()"
            class="group relative inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30 hover:scale-[1.02]"
          >
            <span>Alusta tasuta — 60 sekundit</span>
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <a
            routerLink="/login"
            class="inline-flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-base transition-all duration-200"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Logi sisse (salvesta ajalugu)
          </a>
        </div>
        <p class="text-xs text-slate-600">Ei nõua registreerimist · Tulemused 60 sekundiga · Hinne on deterministlik</p>
      </div>

      <!-- SCORE PREVIEW — 3 tüüpi tulemust -->
      <div class="max-w-4xl mx-auto px-6 pb-16">
        <p class="text-center text-xs text-slate-600 uppercase tracking-widest mb-6">Millist tulemust sa saad?</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <!-- RED -->
          <div class="relative rounded-2xl border border-red-900/60 bg-gradient-to-b from-red-950/60 to-[#0a0f1a] p-5 overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-red-700/10 blur-2xl"></div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <span class="text-red-400 text-xs font-bold">!</span>
              </div>
              <span class="text-red-400 font-semibold text-sm">HIGH RISK</span>
            </div>
            <div class="text-2xl font-bold text-white mb-1">23%</div>
            <p class="text-xs text-slate-400 mb-3">Interview Readiness Score</p>
            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-1.5 bg-gradient-to-r from-red-600 to-red-400 rounded-full" style="width: 23%"></div>
            </div>
            <p class="text-xs text-slate-500 mt-3 leading-relaxed">Viimane asjakohane kogemus > 18 kuud tagasi. Vajad kiiret repositioneerimist.</p>
          </div>

          <!-- YELLOW -->
          <div class="relative rounded-2xl border border-amber-800/60 bg-gradient-to-b from-amber-950/40 to-[#0a0f1a] p-5 overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-700/10 blur-2xl"></div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <span class="text-amber-400 text-xs font-bold">~</span>
              </div>
              <span class="text-amber-400 font-semibold text-sm">NEEDS WORK</span>
            </div>
            <div class="text-2xl font-bold text-white mb-1">56%</div>
            <p class="text-xs text-slate-400 mb-3">Interview Readiness Score</p>
            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" style="width: 56%"></div>
            </div>
            <p class="text-xs text-slate-500 mt-3 leading-relaxed">Kogemus on olemas, aga halvasti esitletud. Saad 30-päeva plaani.</p>
          </div>

          <!-- GREEN -->
          <div class="relative rounded-2xl border border-emerald-800/60 bg-gradient-to-b from-emerald-950/40 to-[#0a0f1a] p-5 overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-700/10 blur-2xl"></div>
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <span class="text-emerald-400 text-xs font-bold">✓</span>
              </div>
              <span class="text-emerald-400 font-semibold text-sm">INTERVIEW READY</span>
            </div>
            <div class="text-2xl font-bold text-white mb-1">84%</div>
            <p class="text-xs text-slate-400 mb-3">Interview Readiness Score</p>
            <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div class="h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style="width: 84%"></div>
            </div>
            <p class="text-xs text-slate-500 mt-3 leading-relaxed">Hea positsioneering. Fookus CV ja läbirääkimistel.</p>
          </div>

        </div>
      </div>

      <!-- HOW IT WORKS -->
      <div class="max-w-3xl mx-auto px-6 pb-20">
        <p class="text-center text-xs text-slate-600 uppercase tracking-widest mb-8">Kuidas see töötab</p>
        <div class="flex flex-col sm:flex-row gap-2 sm:gap-0 relative">
          <!-- connector line (desktop) -->
          <div class="hidden sm:block absolute top-5 left-[calc(16.66%+12px)] right-[calc(16.66%+12px)] h-px bg-slate-800 z-0"></div>

          <div *ngFor="let step of steps; let i = index" class="flex-1 flex flex-col items-center text-center relative z-10 px-3">
            <div class="w-10 h-10 rounded-full bg-slate-900 border-2 flex items-center justify-center mb-3 text-sm font-bold"
              [class]="i === 0 ? 'border-emerald-500 text-emerald-400' : i === 1 ? 'border-amber-500 text-amber-400' : 'border-teal-500 text-teal-400'">
              {{ i + 1 }}
            </div>
            <p class="text-sm font-semibold text-slate-200 mb-1">{{ step.title }}</p>
            <p class="text-xs text-slate-500 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>

      <!-- LOSS AVERSION FOOTER CTA -->
      <div class="border-t border-slate-800/60 bg-slate-900/30">
        <div class="max-w-3xl mx-auto px-6 py-12 text-center">
          <p class="text-slate-500 text-xs mb-2">Kandidaadid, kes jätsid analüüsi vahele, said 34% vähem intervjuukutseid.</p>
          <button
            (click)="startQuick()"
            class="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-amber-500/20"
          >
            Kontrolli oma valmisolekut — tasuta
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
          <p class="text-xs text-slate-700 mt-3">60 sekundit · Ei nõua e-maili · Tulemus kohe</p>
        </div>
      </div>

    </div>
  `
})
export class LandingComponent {
  steps = [
    { title: '3 küsimust', desc: 'Roll, kogemus, peamine takistus. Rohkem ei küsita.' },
    { title: 'Kohene analüüs', desc: 'Deterministlik skoor — RED, YELLOW või GREEN.' },
    { title: '30-päeva plaan', desc: 'Täpsed sammud, mida täna teha. Kohandatud sinu profiiliga.' },
  ];

  constructor(private router: Router) {}

  startQuick(): void {
    this.router.navigate(['/session/new']);
  }
}
