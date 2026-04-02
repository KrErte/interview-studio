import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth-api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaymentApiService, PricingTier } from '../../core/services/payment-api.service';
import { ExitIntentComponent } from '../../shared/exit-intent/exit-intent.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ExitIntentComponent],
  template: `
    <!-- Sticky CTA bar -->
    @if (showStickyCta) {
      <div class="fixed top-[57px] left-0 right-0 z-40 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-4 shadow-md animate-fade-in">
        <span class="text-sm font-medium hidden sm:inline">{{ 'landing.heroStickyCta' | translate }}</span>
        <span class="text-sm font-medium sm:hidden">{{ 'landing.heroStickyCtaMobile' | translate }}</span>
        <a routerLink="/session/new" class="px-4 py-1 text-xs font-bold bg-white text-red-600 hover:bg-stone-100 transition-colors">
          {{ 'landing.heroStickyCtaBtn' | translate }}
        </a>
      </div>
    }

    <!-- Hero Section — LIVE Interactive -->
    <section class="min-h-[calc(100vh-57px)] flex flex-col justify-center px-6 border-b border-stone-200 relative overflow-hidden">
      <span class="absolute top-[110px] right-[17%] text-xl text-stone-200 rotate-12 pointer-events-none select-none hidden lg:block">✦</span>
      <span class="absolute bottom-[180px] left-[5%] text-sm text-stone-200 -rotate-6 pointer-events-none select-none hidden lg:block">◆</span>

      <div class="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 lg:gap-16 items-center py-16 md:py-24">

        <!-- LEFT: Text + Interactive Input -->
        <div class="space-y-6">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 leading-[1.02] tracking-tight">
            {{ 'landing.heroHeadline1' | translate }}<br>
            {{ 'landing.heroHeadline2' | translate }} <span class="text-red-600">{{ 'landing.heroHeadline3' | translate }}</span>
          </h1>

          <p class="text-base sm:text-lg text-stone-600 leading-relaxed max-w-md">
            {{ 'landing.heroSubtext1' | translate }} <strong class="text-stone-900">{{ jobsAtRisk }}% {{ 'landing.heroSubtext2' | translate }}</strong> {{ 'landing.heroSubtext3' | translate }}
            <em class="text-stone-500 not-italic">{{ 'landing.heroSubtext4' | translate }}</em>
          </p>

          <!-- Inline role input with auto-type -->
          <div class="pt-1">
            <label class="text-xs text-stone-500 uppercase tracking-widest mb-2 block">{{ 'landing.heroInputLabel' | translate }}</label>
            <div class="flex gap-0">
              <div class="relative flex-1">
                <input
                  #heroInput
                  type="text"
                  [(ngModel)]="heroRole"
                  (ngModelChange)="onRoleType($event)"
                  (keydown.enter)="goWithRole()"
                  (focus)="stopAutoType()"
                  class="w-full px-5 py-4 border border-stone-300 border-r-0 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none text-base"
                  [placeholder]="autoTypePlaceholder"
                >
                <!-- Live assessment count -->
                @if (!heroRole) {
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span class="text-[11px] text-stone-400">{{ liveCount }} {{ 'landing.heroLiveToday' | translate }}</span>
                  </div>
                }
              </div>
              <button
                (click)="goWithRole()"
                class="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors whitespace-nowrap animate-cta-pulse"
              >
                {{ 'landing.heroInputBtn' | translate }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              @for (role of quickRoles; track role) {
                <button
                  (click)="selectQuickRole(role)"
                  class="px-3 py-1.5 text-xs border border-stone-200 text-stone-500 hover:border-red-600 hover:text-red-600 hover:bg-red-50 transition-all bg-white"
                >
                  {{ role }}
                </button>
              }
            </div>
          </div>

          <!-- Trust -->
          <div class="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 pt-1">
            <span>{{ 'landing.heroTrustFree' | translate }}</span><span>·</span><span>{{ 'landing.heroTrust3min' | translate }}</span><span>·</span><span>{{ 'landing.heroTrustNoAccount' | translate }}</span><span>·</span><span>{{ 'landing.heroTrustPrivate' | translate }}</span>
          </div>
        </div>

        <!-- RIGHT: LIVE Product preview mock -->
        <div class="relative hidden md:block">
          <div class="relative border bg-white shadow-sm overflow-hidden transition-all duration-500"
            [class]="previewRiskLevel === 'HIGH' ? 'border-red-300' : previewRiskLevel === 'LOW' ? 'border-emerald-300' : 'border-amber-300'">
            <!-- Card header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
              <div>
                <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">Risk Assessment</div>
                <div class="text-sm font-semibold text-stone-900 transition-all">{{ previewRole }}</div>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold transition-all duration-500"
                [class]="previewRiskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : previewRiskLevel === 'LOW' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
              >{{ previewRiskLevel }} RISK</span>
            </div>

            <!-- Score block — animated -->
            <div class="px-5 pt-5 pb-4">
              <div class="flex items-end gap-3 mb-3">
                <span class="text-6xl font-black leading-none transition-all duration-700"
                  [class]="previewRiskLevel === 'HIGH' ? 'text-red-600' : previewRiskLevel === 'LOW' ? 'text-emerald-600' : 'text-amber-600'"
                >{{ previewScore }}%</span>
                <span class="text-stone-400 text-sm pb-1">automation risk</span>
              </div>
              <div class="h-2 bg-stone-100 mb-1 overflow-hidden">
                <div class="h-2 transition-all duration-700 ease-out"
                  [style.width.%]="previewScore"
                  [class]="previewRiskLevel === 'HIGH' ? 'bg-gradient-to-r from-amber-400 to-red-600' : previewRiskLevel === 'LOW' ? 'bg-gradient-to-r from-emerald-300 to-emerald-500' : 'bg-gradient-to-r from-stone-300 via-amber-400 to-amber-500'"></div>
              </div>
              <div class="flex justify-between text-[10px] text-stone-400">
                <span>Low</span><span>High</span>
              </div>
            </div>

            <!-- Action items -->
            <div class="px-5 pb-5 space-y-2">
              <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Your 30-Day Plan</div>
              <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100">
                <span class="text-stone-900 text-xs mt-0.5 shrink-0 font-bold">→</span>
                <span class="text-xs text-stone-600 leading-relaxed">{{ previewAction1 }}</span>
              </div>
              <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100">
                <span class="text-stone-900 text-xs mt-0.5 shrink-0 font-bold">→</span>
                <span class="text-xs text-stone-600 leading-relaxed">{{ previewAction2 }}</span>
              </div>
              <div class="relative">
                <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100 blur-sm select-none">
                  <span class="text-stone-300 text-xs mt-0.5 shrink-0 font-bold">→</span>
                  <span class="text-xs text-stone-300">Unlock your personalized career pivot strategy</span>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-[10px] text-stone-500 bg-white border border-stone-200 px-2 py-0.5 font-medium">+ 5 more in full plan</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating urgency badge -->
          <div class="absolute -top-3 -right-3 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold -rotate-1 animate-cta-pulse">
            ⚠ {{ 'landing.actThisMonth' | translate }}
          </div>

          <!-- Floating social proof -->
          <div class="absolute -bottom-4 -left-4 px-4 py-2.5 bg-white border border-stone-200 shadow-md transition-all duration-500">
            <div class="text-[10px] text-stone-400 mb-0.5">{{ 'landing.othersInField' | translate }}</div>
            <div class="text-sm font-black text-stone-900">{{ previewPeerRisk }}% <span class="text-xs font-normal" [class]="previewRiskLevel === 'HIGH' ? 'text-red-600' : previewRiskLevel === 'LOW' ? 'text-emerald-600' : 'text-amber-600'">↑ {{ 'landing.atHighRisk' | translate }}</span></div>
          </div>
        </div>
      </div>

      <!-- Mobile preview card — compact version -->
      <div class="md:hidden mb-8 mx-auto max-w-sm w-full">
        <div class="border bg-white shadow-sm p-4 flex items-center gap-4 transition-all duration-500"
          [class]="previewRiskLevel === 'HIGH' ? 'border-red-200' : previewRiskLevel === 'LOW' ? 'border-emerald-200' : 'border-amber-200'">
          <!-- Score circle -->
          <div class="relative w-16 h-16 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke-width="4" class="text-stone-100" stroke="currentColor"/>
              <circle cx="32" cy="32" r="28" fill="none" stroke-width="4"
                [attr.stroke]="previewRiskLevel === 'HIGH' ? '#dc2626' : previewRiskLevel === 'LOW' ? '#16a34a' : '#d97706'"
                stroke-linecap="square"
                [attr.stroke-dasharray]="176"
                [attr.stroke-dashoffset]="176 - (176 * previewScore / 100)"
                class="transition-all duration-700"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-sm font-black" [class]="previewRiskLevel === 'HIGH' ? 'text-red-600' : previewRiskLevel === 'LOW' ? 'text-emerald-600' : 'text-amber-600'">{{ previewScore }}%</span>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-xs text-stone-400 mb-0.5">{{ previewRole }}</div>
            <div class="text-sm font-bold"
              [class]="previewRiskLevel === 'HIGH' ? 'text-red-600' : previewRiskLevel === 'LOW' ? 'text-emerald-600' : 'text-amber-600'"
            >{{ previewRiskLevel }} RISK</div>
            <div class="text-[10px] text-stone-400 mt-0.5">{{ 'landing.heroMobilePreviewHint' | translate }}</div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-[49%] -translate-x-1/2 animate-bounce hidden md:block">
        <svg class="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Stats Bar — with animated counters -->
    <section class="border-b border-stone-200 bg-stone-100">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200">
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">{{ animatedJobs }}M</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsJobsDisplaced' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-red-600">{{ animatedPercent }}%</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsJobsAtRisk' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">{{ animatedNew }}M</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsNewRoles' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">3 min</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsTimeToKnow' | translate }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-24 px-6 border-b border-stone-200">
      <div class="max-w-6xl mx-auto">
        <div class="mb-14">
          <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{{ 'landing.howItWorks' | translate }}</div>
          <h2 class="text-3xl md:text-4xl font-black text-stone-900">{{ 'landing.howItWorksSubtitle' | translate }}</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-0 border border-stone-200">
          <div class="p-7 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">01</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step1Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step1Desc' | translate }}</p>
          </div>
          <div class="p-8 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">02</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step2Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step2Desc' | translate }}</p>
          </div>
          <div class="p-8">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">03</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step3Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step3Desc' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Role Risk Database -->
    <section class="py-24 px-6 border-b border-stone-200 bg-stone-50">
      <div class="max-w-6xl mx-auto">
        <div class="mb-14">
          <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{{ 'landing.riskDatabase' | translate }}</div>
          <h2 class="text-2xl md:text-3xl font-black text-stone-900">{{ 'landing.riskDatabaseSubtitle' | translate }}</h2>
          <p class="text-stone-500 mt-2 max-w-xl">{{ 'landing.riskDatabaseDesc' | translate }}</p>
        </div>

        <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
          @for (role of riskRoles; track role.name) {
            <button
              (click)="selectQuickRole(role.name)"
              class="group p-5 border bg-white text-left transition-all hover:border-stone-900 hover:shadow-md hover:-translate-y-0.5"
              [class]="role.level === 'HIGH' ? 'border-red-200' : role.level === 'MEDIUM' ? 'border-amber-200' : 'border-emerald-200'"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-bold text-stone-900 group-hover:text-red-600 transition-colors">{{ role.name }}</span>
                <span class="text-[10px] font-bold px-2 py-0.5"
                  [class]="role.level === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : role.level === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                >{{ role.level }}</span>
              </div>
              <div class="h-1 bg-stone-100 mb-2">
                <div class="h-1 transition-all"
                  [style.width.%]="role.risk"
                  [class]="role.level === 'HIGH' ? 'bg-red-500' : role.level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'"></div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-stone-400">{{ role.risk }}% {{ 'landing.riskDatabaseRisk' | translate }}</span>
                <span class="text-xs text-stone-400 group-hover:text-red-600 transition-colors font-medium">{{ 'landing.riskDatabaseCheck' | translate }} →</span>
              </div>
            </button>
          }
        </div>

        <p class="text-xs text-stone-400">{{ 'landing.riskDatabaseFooter' | translate }}</p>
      </div>
    </section>

    <!-- Pricing Teaser -->
    <section class="py-24 px-6 border-b border-stone-200">
      <div class="max-w-4xl mx-auto">
        <div class="mb-10">
          <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{{ 'landing.simplePricing' | translate }}</div>
          <h2 class="text-3xl font-black text-stone-900 mb-2">{{ 'landing.startFree' | translate }}</h2>
          <p class="text-stone-500 max-w-2xl">{{ 'landing.pricingDesc' | translate }}</p>
        </div>

        <div class="grid sm:grid-cols-3 border border-stone-200 mb-8">
          <div class="p-6 border-b sm:border-b-0 sm:border-r border-stone-200">
            <div class="text-xs text-stone-400 uppercase tracking-widest mb-3">Free</div>
            <div class="text-3xl font-black text-stone-900 mb-1">{{ 'landing.priceFree' | translate }}</div>
            <div class="text-sm text-stone-500">{{ 'landing.priceFreeDesc' | translate }}</div>
          </div>
          <div class="p-6 border-b sm:border-b-0 sm:border-r border-stone-200 bg-stone-50">
            <div class="text-xs text-stone-400 uppercase tracking-widest mb-3">Starter</div>
            <div class="text-3xl font-black text-stone-900 mb-1">{{ starterPrice() }}<span class="text-base font-normal text-stone-400"> once</span></div>
            <div class="text-sm text-stone-500">{{ 'landing.priceStarterDesc' | translate }}</div>
          </div>
          <div class="p-6">
            <div class="text-xs text-red-600 uppercase tracking-widest mb-3 font-bold">Pro</div>
            <div class="text-3xl font-black text-stone-900 mb-1">{{ proPrice() }}<span class="text-base font-normal text-stone-400">/yr</span></div>
            <div class="text-sm text-stone-500">{{ 'landing.priceProDesc' | translate }}</div>
          </div>
        </div>

        <a routerLink="/pricing" class="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-red-600 transition-colors">
          {{ 'landing.viewPlans' | translate }} →
        </a>
      </div>
    </section>

    <!-- Final CTA — with urgency -->
    <section class="py-24 px-6 bg-stone-900 relative overflow-hidden">
      <!-- Animated grid background -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 40px 40px;"></div>
      </div>
      <div class="max-w-3xl mx-auto relative">
        <div class="text-[10px] text-stone-500 uppercase tracking-widest mb-4">CareerRisk Index</div>
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4">{{ 'landing.finalCta' | translate }}</h2>
        <p class="text-stone-400 mb-8 max-w-xl">{{ 'landing.finalCtaDesc' | translate }}</p>
        <div class="flex flex-col sm:flex-row gap-4 items-start">
          <a
            routerLink="/session/new"
            class="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all cursor-pointer animate-cta-pulse hover:scale-105"
          >
            {{ 'landing.startFreeAssessment' | translate }}
          </a>
          <div class="flex items-center gap-2 text-stone-500 text-sm py-4">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {{ liveCount }} {{ 'landing.heroLiveToday' | translate }}
          </div>
        </div>
      </div>
    </section>

    <app-exit-intent />
  `,
  styles: [`
    @keyframes fadeIn {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes ctaPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
    }
    .animate-cta-pulse { animation: ctaPulse 2s infinite; }
  `]
})
export class LandingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('heroInput') heroInput!: ElementRef<HTMLInputElement>;

  showStickyCta = false;
  jobsAtRisk = 47;
  heroRole = '';

  // Live preview state
  previewRole = 'Marketing Manager';
  previewScore = 71;
  previewRiskLevel = 'HIGH';
  previewPeerRisk = 68;
  previewAction1 = 'Reposition as AI-augmented marketer, not traditional';
  previewAction2 = 'Get certified in prompt engineering this month';

  // Auto-type effect
  autoTypePlaceholder = '';
  private autoTypeRoles = ['Marketing Manager', 'Accountant', 'Paralegal', 'Software Engineer', 'HR Manager', 'Data Analyst', 'Financial Analyst', 'Registered Nurse'];
  private autoTypeIndex = 0;
  private autoTypeCharIndex = 0;
  private autoTypeTimer: any;
  private autoTypeActive = true;

  // Animated counters
  animatedJobs = '0.0';
  animatedPercent = 0;
  animatedNew = '0.0';
  private statsAnimated = false;
  private statsObserver: IntersectionObserver | null = null;

  // Live counter
  liveCount = 0;

  private readonly paymentApi = inject(PaymentApiService);
  private readonly translate = inject(TranslateService);
  readonly starterPrice = signal('€7.49');
  readonly proPrice = signal('€14.99');

  private readonly cdr = inject(ChangeDetectorRef);

  quickRoles = ['Software Engineer', 'Marketing Manager', 'Data Analyst', 'Accountant', 'HR Manager', 'Paralegal'];

  riskRoles = [
    { name: 'Accountant', risk: 82, level: 'HIGH' },
    { name: 'Paralegal', risk: 79, level: 'HIGH' },
    { name: 'Content Writer', risk: 76, level: 'HIGH' },
    { name: 'Marketing Manager', risk: 71, level: 'HIGH' },
    { name: 'HR Manager', risk: 67, level: 'HIGH' },
    { name: 'Data Analyst', risk: 61, level: 'MEDIUM' },
    { name: 'Software Engineer', risk: 34, level: 'MEDIUM' },
    { name: 'Registered Nurse', risk: 12, level: 'LOW' },
    { name: 'Electrician', risk: 8, level: 'LOW' },
  ];

  // Role -> preview data mapping
  private rolePreviewData: Record<string, { score: number; level: string; peer: number; a1: string; a2: string }> = {
    'marketing manager': { score: 71, level: 'HIGH', peer: 68, a1: 'Reposition as AI-augmented marketer, not traditional', a2: 'Get certified in prompt engineering this month' },
    'accountant': { score: 82, level: 'HIGH', peer: 74, a1: 'Learn AI-assisted audit tools before Q3', a2: 'Pivot toward advisory roles away from bookkeeping' },
    'content writer': { score: 76, level: 'HIGH', peer: 71, a1: 'Specialize in strategy, not just content production', a2: 'Build a portfolio of AI-augmented content workflows' },
    'software engineer': { score: 34, level: 'MEDIUM', peer: 28, a1: 'Focus on system design and architecture skills', a2: 'Learn AI/ML integration to stay ahead of copilots' },
    'data analyst': { score: 61, level: 'MEDIUM', peer: 55, a1: 'Move from reporting to predictive analytics', a2: 'Learn to build AI models, not just query data' },
    'project manager': { score: 52, level: 'MEDIUM', peer: 46, a1: 'Develop technical fluency in your domain', a2: 'Focus on stakeholder management AI can not do' },
    'ux designer': { score: 43, level: 'MEDIUM', peer: 38, a1: 'Master AI-native design patterns and tools', a2: 'Shift to research and strategy from wireframing' },
    'nurse': { score: 12, level: 'LOW', peer: 8, a1: 'Your role has strong human-contact protection', a2: 'Consider specializing to increase earning potential' },
    'registered nurse': { score: 12, level: 'LOW', peer: 8, a1: 'Your role has strong human-contact protection', a2: 'Consider specializing to increase earning potential' },
    'electrician': { score: 8, level: 'LOW', peer: 5, a1: 'Physical skilled trades are highly automation-resistant', a2: 'Add smart home / EV charging expertise for premium rates' },
    'teacher': { score: 28, level: 'MEDIUM', peer: 22, a1: 'Integrate AI tools into your teaching methods', a2: 'Focus on mentoring and social-emotional skills' },
    'paralegal': { score: 79, level: 'HIGH', peer: 73, a1: 'AI is already drafting contracts and reviewing docs faster', a2: 'Pivot toward litigation strategy and client advisory' },
    'hr manager': { score: 67, level: 'HIGH', peer: 61, a1: 'AI is automating screening, scheduling, and onboarding', a2: 'Focus on culture strategy and employee experience' },
    'financial analyst': { score: 72, level: 'HIGH', peer: 65, a1: 'AI models are replacing manual financial modeling', a2: 'Move into strategic advisory and stakeholder communication' },
    'customer service rep': { score: 88, level: 'HIGH', peer: 82, a1: 'Chatbots are replacing 80% of routine support queries', a2: 'Upskill to customer success or account management' },
    'graphic designer': { score: 69, level: 'HIGH', peer: 62, a1: 'AI image tools are disrupting production design work', a2: 'Specialize in brand strategy and creative direction' },
  };

  constructor(private auth: AuthService, private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.showStickyCta = window.scrollY > 600;
  }

  ngOnInit(): void {
    this.paymentApi.getPricing().subscribe(tiers => {
      const symbol = tiers[0]?.currency === 'EUR' ? '€' : '$';
      const starter = tiers.find(t => t.id === 'STARTER');
      const pro = tiers.find(t => t.id === 'ARENA_PRO');
      if (starter) this.starterPrice.set(symbol + starter.price.toFixed(2));
      if (pro) this.proPrice.set(symbol + pro.price.toFixed(2));
      this.cdr.markForCheck();
    });

    // Generate believable live count based on time of day
    const hour = new Date().getHours();
    const base = hour >= 9 && hour <= 20 ? 40 + Math.floor(Math.random() * 30) : 12 + Math.floor(Math.random() * 15);
    this.liveCount = base;

    // Slowly increment
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.liveCount++;
        this.cdr.markForCheck();
      }
    }, 15000);

    this.startAutoType();
  }

  ngAfterViewInit(): void {
    // Observe stats section for scroll-triggered animation
    const statsSection = document.querySelector('.bg-stone-100');
    if (statsSection) {
      this.statsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateCounters();
        }
      }, { threshold: 0.5 });
      this.statsObserver.observe(statsSection);
    }
  }

  ngOnDestroy(): void {
    if (this.autoTypeTimer) clearTimeout(this.autoTypeTimer);
    if (this.statsObserver) this.statsObserver.disconnect();
  }

  // --- Auto-type placeholder ---
  private startAutoType(): void {
    this.autoTypeCharIndex = 0;
    this.typeNextChar();
  }

  private typeNextChar(): void {
    if (!this.autoTypeActive) return;
    const role = this.autoTypeRoles[this.autoTypeIndex];

    if (this.autoTypeCharIndex <= role.length) {
      this.autoTypePlaceholder = role.substring(0, this.autoTypeCharIndex) + '|';
      this.autoTypeCharIndex++;
      this.autoTypeTimer = setTimeout(() => this.typeNextChar(), 80 + Math.random() * 40);
    } else {
      // Pause at full word, then erase
      this.autoTypePlaceholder = role;
      this.autoTypeTimer = setTimeout(() => this.eraseChars(), 2000);
    }
  }

  private eraseChars(): void {
    if (!this.autoTypeActive) return;
    const role = this.autoTypeRoles[this.autoTypeIndex];

    if (this.autoTypeCharIndex > 0) {
      this.autoTypeCharIndex--;
      this.autoTypePlaceholder = role.substring(0, this.autoTypeCharIndex) + '|';
      this.autoTypeTimer = setTimeout(() => this.eraseChars(), 30);
    } else {
      this.autoTypeIndex = (this.autoTypeIndex + 1) % this.autoTypeRoles.length;
      this.autoTypeTimer = setTimeout(() => this.typeNextChar(), 400);
    }
  }

  stopAutoType(): void {
    this.autoTypeActive = false;
    if (this.autoTypeTimer) clearTimeout(this.autoTypeTimer);
    this.autoTypePlaceholder = '';
  }

  // --- Live preview updates ---
  onRoleType(value: string): void {
    this.updatePreview(value);
  }

  selectQuickRole(role: string): void {
    this.heroRole = role;
    this.stopAutoType();
    this.updatePreview(role);
    // Delay navigation so user sees the preview update
    setTimeout(() => this.goWithRole(), 600);
  }

  private updatePreview(role: string): void {
    const key = role.trim().toLowerCase();
    const data = this.rolePreviewData[key];

    if (data) {
      this.previewRole = role;
      this.previewScore = data.score;
      this.previewRiskLevel = data.level;
      this.previewPeerRisk = data.peer;
      this.previewAction1 = data.a1;
      this.previewAction2 = data.a2;
    } else if (role.trim().length > 2) {
      // Generate deterministic score from string hash
      const hash = this.simpleHash(key);
      const score = 25 + (hash % 55);
      this.previewRole = role;
      this.previewScore = score;
      this.previewRiskLevel = score >= 65 ? 'HIGH' : score >= 35 ? 'MEDIUM' : 'LOW';
      this.previewPeerRisk = Math.max(5, score - 8 + (hash % 12));
      this.previewAction1 = 'Analyze your specific skill gaps for this role';
      this.previewAction2 = 'Get a personalized 30-day action plan';
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
  }

  // --- Animated counters ---
  private animateCounters(): void {
    const duration = 1500;
    const frames = 40;
    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      const progress = this.easeOut(frame / frames);
      this.animatedJobs = (83.4 * progress).toFixed(1);
      this.animatedPercent = Math.round(47 * progress);
      this.animatedNew = (96.2 * progress).toFixed(1);
      this.cdr.markForCheck();
      if (frame >= frames) clearInterval(interval);
    }, duration / frames);
  }

  private easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  goWithRole(): void {
    const role = this.heroRole.trim();
    if (role) {
      this.router.navigate(['/session/new'], { queryParams: { role } });
    } else {
      this.router.navigate(['/session/new']);
    }
  }

  startAssessment(): void {
    this.router.navigateByUrl('/start');
  }
}
