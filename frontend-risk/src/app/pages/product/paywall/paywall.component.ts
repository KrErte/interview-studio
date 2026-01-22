import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaywallService, PlanType, PaywallVariant } from '../../../core/paywall/paywall.service';

@Component({
  selector: 'app-paywall',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Soft Paywall - Preview with blur -->
    @if (variant === 'soft') {
      <div class="relative">
        <div class="blur-md pointer-events-none">
          <ng-content></ng-content>
        </div>
        <div class="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div class="text-center p-8 max-w-md">
            <div class="text-5xl mb-4">{{ icon }}</div>
            <h3 class="text-2xl font-bold text-white mb-3">{{ title }}</h3>
            <p class="text-slate-400 mb-6">{{ description }}</p>
            <button
              (click)="onUnlock()"
              class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg">
              {{ ctaText }}
            </button>
            <p class="text-xs text-slate-500 mt-3">{{ subtext }}</p>
          </div>
        </div>
      </div>
    }

    <!-- Hard Paywall - Full block -->
    @if (variant === 'hard') {
      <div class="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-8">
        <div class="text-center max-w-lg">
          <div class="text-6xl mb-6">{{ icon }}</div>
          <h2 class="text-3xl font-black text-white mb-4">{{ title }}</h2>
          <p class="text-lg text-slate-400 mb-8">{{ description }}</p>

          <div class="bg-slate-800/50 rounded-xl p-6 mb-8">
            <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'What you\'ll unlock:' : 'Mida sa avad:' }}</div>
            <ul class="space-y-2 text-left">
              @for (feature of features; track feature) {
                <li class="flex items-center gap-2 text-slate-300">
                  <span class="text-emerald-400">✓</span>
                  {{ feature }}
                </li>
              }
            </ul>
          </div>

          <button
            (click)="onUnlock()"
            class="w-full px-8 py-5 bg-white text-slate-900 font-bold text-lg rounded-xl hover:scale-105 transition-transform shadow-2xl mb-4">
            {{ ctaText }}
          </button>

          <p class="text-sm text-slate-500">{{ subtext }}</p>
        </div>
      </div>
    }

    <!-- Report Paywall - One-time purchase focus -->
    @if (variant === 'report') {
      <div class="bg-gradient-to-r from-emerald-900/20 to-purple-900/20 border border-emerald-500/30 rounded-2xl p-8">
        <div class="flex items-start gap-6">
          <div class="text-5xl flex-shrink-0">{{ icon }}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-bold text-white">{{ title }}</h3>
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">{{ lang() === 'en' ? 'ONE-TIME' : 'ÜHEKORDNE' }}</span>
            </div>
            <p class="text-slate-400 mb-4">{{ description }}</p>

            <div class="flex items-center gap-4">
              <button
                (click)="onUnlock()"
                class="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors flex items-center gap-2">
                <span>🔓</span>
                <span>{{ ctaText }}</span>
              </button>
              <div class="text-sm text-slate-500">
                {{ subtext }}
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class PaywallComponent {
  @Input() variant: PaywallVariant = 'soft';
  @Input() icon: string = '🔒';
  @Input() title: string = 'Unlock Full Access';
  @Input() description: string = 'Get the complete analysis and actionable insights.';
  @Input() ctaText: string = 'Unlock Now — €14.99';
  @Input() subtext: string = '30-day access • Instant delivery';
  @Input() features: string[] = [];
  @Input() targetPlan: PlanType = 'report';

  @Output() unlock = new EventEmitter<PlanType>();

  lang = signal<'en' | 'et'>('en');

  constructor(private paywall: PaywallService) {}

  onUnlock(): void {
    this.unlock.emit(this.targetPlan);
  }
}


// Pricing Section Component
@Component({
  selector: 'app-pricing-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-16 px-6">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'Stop Guessing. Start Winning.' : 'Lõpeta Arvamine. Hakka Võitma.' }}
          </h2>
          <p class="text-slate-400 max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'One report could be the difference between another rejection and your dream offer.'
              : 'Üks raport võib olla vahe järjekordse tagasilükkamise ja sinu unistuste pakkumise vahel.' }}
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <!-- One-time Report -->
          <div class="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 relative">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-slate-900 text-sm font-bold rounded-full">
              {{ lang() === 'en' ? 'MOST POPULAR' : 'POPULAARSEIM' }}
            </div>

            <div class="text-center mb-6">
              <h3 class="text-xl font-bold text-white mb-2">{{ lang() === 'en' ? 'Interview Readiness Report' : 'Intervjuuvalmiduse Raport' }}</h3>
              <div class="flex items-end justify-center gap-1">
                <span class="text-5xl font-black text-white">€14.99</span>
                <span class="text-slate-400 mb-2">{{ lang() === 'en' ? 'one-time' : 'ühekordne' }}</span>
              </div>
            </div>

            <ul class="space-y-3 mb-8">
              @for (feature of reportFeatures(); track feature) {
                <li class="flex items-center gap-2 text-slate-300">
                  <span class="text-emerald-400">✓</span>
                  {{ lang() === 'en' ? feature.en : feature.et }}
                </li>
              }
            </ul>

            <button
              (click)="selectPlan('report')"
              class="w-full py-4 bg-emerald-500 text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-colors">
              {{ lang() === 'en' ? 'Get My Report' : 'Saa Oma Raport' }}
            </button>

            <p class="text-center text-xs text-slate-500 mt-3">
              {{ lang() === 'en' ? 'Valid for 30 days • PDF export included' : 'Kehtib 30 päeva • PDF eksport kaasas' }}
            </p>
          </div>

          <!-- Monthly Pro -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div class="text-center mb-6">
              <h3 class="text-xl font-bold text-white mb-2">{{ lang() === 'en' ? 'Active Interview Mode' : 'Aktiivne Intervjuurežiim' }}</h3>
              <div class="flex items-end justify-center gap-1">
                <span class="text-5xl font-black text-white">€9.99</span>
                <span class="text-slate-400 mb-2">{{ lang() === 'en' ? '/month' : '/kuu' }}</span>
              </div>
            </div>

            <ul class="space-y-3 mb-8">
              @for (feature of proFeatures(); track feature) {
                <li class="flex items-center gap-2 text-slate-300">
                  <span class="text-purple-400">✓</span>
                  {{ lang() === 'en' ? feature.en : feature.et }}
                </li>
              }
            </ul>

            <button
              (click)="selectPlan('pro')"
              class="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
              {{ lang() === 'en' ? 'Start Pro' : 'Alusta Pro' }}
            </button>

            <p class="text-center text-xs text-slate-500 mt-3">
              {{ lang() === 'en' ? 'Cancel anytime • No commitment' : 'Tühista igal ajal • Pole kohustust' }}
            </p>
          </div>
        </div>

        <!-- Guarantee -->
        <div class="mt-12 text-center">
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/50 rounded-full">
            <span class="text-2xl">🛡️</span>
            <span class="text-slate-300">
              {{ lang() === 'en'
                ? '100% Money-Back Guarantee if you don\'t land more interviews within 30 days'
                : '100% Raha Tagasi Garantii kui sa ei saa rohkem intervjuusid 30 päeva jooksul' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PricingSectionComponent {
  lang = signal<'en' | 'et'>('en');

  reportFeatures = signal([
    { en: 'Complete Interview Failure Autopsy', et: 'Täielik Intervjuu Läbikukkumise Lahkamine' },
    { en: 'Recruiter Mirror View', et: 'Värbaja Peeglivaade' },
    { en: 'Confidence vs Reality Analysis', et: 'Enesekindlus vs Reaalsus Analüüs' },
    { en: 'Full 72-Hour Action Plan', et: 'Täielik 72-Tunnine Tegevusplaan' },
    { en: 'Salary negotiation intel', et: 'Palgaläbirääkimiste info' },
    { en: 'PDF export', et: 'PDF eksport' }
  ]);

  proFeatures = signal([
    { en: 'Everything in Report', et: 'Kõik mis Raportis' },
    { en: 'Unlimited interview simulations', et: 'Piiramatud intervjuu simulatsioonid' },
    { en: 'Real-time market salary data', et: 'Reaalajas turuhinna andmed' },
    { en: 'Weekly skill gap updates', et: 'Iganädalased oskuslünga uuendused' },
    { en: 'Priority support', et: 'Prioriteetne tugi' }
  ]);

  selectPlan(plan: PlanType): void {
    console.log('Selected plan:', plan);
    // Navigate to checkout or open modal
  }
}
