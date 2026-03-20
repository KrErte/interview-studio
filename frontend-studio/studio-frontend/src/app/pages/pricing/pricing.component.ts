import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-pricing',
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
        <div class="flex gap-3">
          <a routerLink="/login" class="text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-md hover:bg-slate-800">Sign in</a>
          <a routerLink="/register" class="text-sm bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-1.5 rounded-md font-medium transition">Get started free</a>
        </div>
      </nav>

      <div class="max-w-3xl mx-auto px-6 py-16 text-center">
        <p class="text-xs text-emerald-400 uppercase tracking-widest mb-3 font-semibold">Hinnakiri</p>
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Lihtne, aus hind</h1>
        <p class="text-slate-400 text-base mb-12 max-w-md mx-auto">Analüüs on tasuta. Täielik tegevusplaan on ühekordne makse — ilma tellimuseta.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">

          <!-- FREE -->
          <div class="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-7 text-left">
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-4">Tasuta</p>
            <div class="text-3xl font-bold text-white mb-1">€0</div>
            <p class="text-slate-500 text-sm mb-6">Igavesti tasuta</p>
            <ul class="space-y-3 mb-8">
              <li *ngFor="let item of freeFeatures" class="flex items-start gap-3 text-sm text-slate-300">
                <svg class="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                {{ item }}
              </li>
            </ul>
            <a routerLink="/session/new"
              class="block text-center border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white px-5 py-3 rounded-xl text-sm transition font-medium">
              Alusta tasuta
            </a>
          </div>

          <!-- PAID -->
          <div class="relative rounded-2xl border border-amber-600/60 bg-gradient-to-br from-amber-950/40 to-slate-900/60 p-7 text-left overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-600/10 blur-2xl pointer-events-none"></div>
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs text-amber-400 uppercase tracking-widest font-semibold">Täielik plaan</p>
              <span class="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">Populaarseim</span>
            </div>
            <div class="text-3xl font-bold text-white mb-1">€9<span class="text-xl">,99</span></div>
            <p class="text-slate-500 text-sm mb-6">Ühekordne makse seansi kohta</p>
            <ul class="space-y-3 mb-8">
              <li *ngFor="let item of paidFeatures" class="flex items-start gap-3 text-sm text-slate-300">
                <svg class="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
                {{ item }}
              </li>
            </ul>

            <!-- Stripe stub banner -->
            <div class="bg-amber-950/60 border border-amber-700/40 rounded-lg px-4 py-3 mb-4 text-center">
              <p class="text-xs text-amber-400 font-semibold">Maksesüsteem tulekul</p>
              <p class="text-xs text-slate-500 mt-0.5">Stripe integratsioon on töös</p>
            </div>

            <button disabled
              class="w-full text-center bg-amber-400/50 text-slate-700 font-bold px-5 py-3 rounded-xl text-sm cursor-not-allowed">
              Osta €9,99 — peagi saadaval
            </button>
          </div>

        </div>

        <!-- FAQ -->
        <div class="mt-16 text-left max-w-lg mx-auto">
          <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 text-center">KKK</h2>
          <div class="space-y-5">
            <div *ngFor="let q of faqs">
              <p class="text-sm font-semibold text-white mb-1">{{ q.q }}</p>
              <p class="text-xs text-slate-500 leading-relaxed">{{ q.a }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class PricingComponent {
  freeFeatures = [
    'Interview Readiness Score',
    '3 peamist takistust',
    'Deterministlik analüüs',
    'Ei nõua registreerimist',
  ];

  paidFeatures = [
    'Kõik tasuta funktsioonid',
    'Täielik 30-päeva tegevusplaan',
    'CV ümberkirjutussoovitused',
    'Rollid, mida praegu vältida',
    'Pivot-soovitus (vajadusel)',
    'Jagamislink (pärast registreerumist)',
  ];

  faqs = [
    {
      q: 'Kas peab registreeruma?',
      a: 'Ei. Analüüs ja tasuta tulemused töötavad ilma kontota. Konto on vajalik ainult ajaloo salvestamiseks ja jagamiseks.'
    },
    {
      q: 'Kas makse on ühekordne?',
      a: 'Jah. €9,99 on ühekordne makse selle konkreetse seansi kohta. Igakuist tasu ei ole.'
    },
    {
      q: 'Kuidas skoor arvutatakse?',
      a: 'Skoor on deterministlik — sama sisend annab alati sama tulemuse. Kasutame kogemuse ajalugu, rolli asjakohasust ja põhitakistust.'
    },
    {
      q: 'Kas saan tulemusi jagada?',
      a: 'Pärast konto loomist saad genereerida jagamislingi, mida tööandjaga jagada.'
    },
  ];
}
