import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectorRef, HostListener } from '@angular/core';
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
    <!-- Sticky CTA bar — appears after scrolling past hero -->
    @if (showStickyCta) {
      <div class="fixed top-[57px] left-0 right-0 z-40 bg-red-600 text-white py-2 px-4 flex items-center justify-center gap-4 shadow-md animate-fade-in">
        <span class="text-sm font-medium hidden sm:inline">{{ 'landing.heroStickyCta' | translate }}</span>
        <span class="text-sm font-medium sm:hidden">{{ 'landing.heroStickyCtaMobile' | translate }}</span>
        <a routerLink="/session/new" class="px-4 py-1 text-xs font-bold bg-white text-red-600 hover:bg-stone-100 transition-colors">
          {{ 'landing.heroStickyCtaBtn' | translate }}
        </a>
      </div>
    }

    <!-- Hero Section — Interactive Role Input -->
    <section class="min-h-[calc(100vh-57px)] flex flex-col justify-center px-6 border-b border-stone-200 relative overflow-hidden">
      <span class="absolute top-[110px] right-[17%] text-xl text-stone-200 rotate-12 pointer-events-none select-none hidden lg:block">✦</span>
      <span class="absolute bottom-[180px] left-[5%] text-sm text-stone-200 -rotate-6 pointer-events-none select-none hidden lg:block">◆</span>

      <div class="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center py-24">

        <!-- LEFT: Text + Interactive Input -->
        <div class="space-y-7">
          <h1 class="text-5xl md:text-6xl font-black text-stone-900 leading-[1.02] tracking-tight">
            {{ 'landing.heroHeadline1' | translate }}<br>
            {{ 'landing.heroHeadline2' | translate }} <span class="text-red-600">{{ 'landing.heroHeadline3' | translate }}</span>
          </h1>

          <p class="text-lg text-stone-600 leading-relaxed max-w-md">
            {{ 'landing.heroSubtext1' | translate }} <strong class="text-stone-900">{{ jobsAtRisk }}% {{ 'landing.heroSubtext2' | translate }}</strong> {{ 'landing.heroSubtext3' | translate }}
            <em class="text-stone-500 not-italic">{{ 'landing.heroSubtext4' | translate }}</em>
          </p>

          <!-- Inline role input — type and go -->
          <div class="pt-1">
            <label class="text-xs text-stone-500 uppercase tracking-widest mb-2 block">{{ 'landing.heroInputLabel' | translate }}</label>
            <div class="flex gap-0">
              <input
                type="text"
                [(ngModel)]="heroRole"
                (keydown.enter)="goWithRole()"
                [placeholder]="'landing.heroInputPlaceholder' | translate"
                class="flex-1 px-5 py-4 border border-stone-300 border-r-0 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none text-base"
              >
              <button
                (click)="goWithRole()"
                class="px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors whitespace-nowrap"
              >
                {{ 'landing.heroInputBtn' | translate }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              @for (role of quickRoles; track role) {
                <button
                  (click)="heroRole = role; goWithRole()"
                  class="px-3 py-1.5 text-xs border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors bg-white"
                >
                  {{ role }}
                </button>
              }
            </div>
          </div>

          <!-- Trust — plain text -->
          <div class="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 pt-1">
            <span>{{ 'landing.heroTrustFree' | translate }}</span><span>·</span><span>{{ 'landing.heroTrust3min' | translate }}</span><span>·</span><span>{{ 'landing.heroTrustNoAccount' | translate }}</span><span>·</span><span>{{ 'landing.heroTrustPrivate' | translate }}</span>
          </div>
        </div>

        <!-- RIGHT: Product preview mock -->
        <div class="relative hidden md:block">
          <div class="relative border border-stone-300 bg-white shadow-sm overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
              <div>
                <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">Risk Assessment</div>
                <div class="text-sm font-semibold text-stone-900">Marketing Manager</div>
              </div>
              <span class="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold border border-red-200">HIGH RISK</span>
            </div>
            <div class="px-5 pt-5 pb-4">
              <div class="flex items-end gap-3 mb-3">
                <span class="text-6xl font-black text-red-600 leading-none">71%</span>
                <span class="text-stone-400 text-sm pb-1">automation risk</span>
              </div>
              <div class="h-1.5 bg-stone-100 mb-1">
                <div class="h-1.5 bg-gradient-to-r from-stone-300 via-amber-400 to-red-600 w-[71%]"></div>
              </div>
              <div class="flex justify-between text-[10px] text-stone-400">
                <span>Low</span><span>High</span>
              </div>
            </div>
            <div class="px-5 pb-5 space-y-2">
              <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Your 30-Day Plan</div>
              <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100">
                <span class="text-stone-900 text-xs mt-0.5 shrink-0 font-bold">→</span>
                <span class="text-xs text-stone-600 leading-relaxed">Reposition as AI-augmented marketer, not traditional</span>
              </div>
              <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100">
                <span class="text-stone-900 text-xs mt-0.5 shrink-0 font-bold">→</span>
                <span class="text-xs text-stone-600 leading-relaxed">Get certified in prompt engineering this month</span>
              </div>
              <div class="relative">
                <div class="flex items-start gap-2.5 p-2.5 bg-stone-50 border border-stone-100 blur-sm select-none">
                  <span class="text-stone-300 text-xs mt-0.5 shrink-0 font-bold">→</span>
                  <span class="text-xs text-stone-300">Pivot to product marketing to cut risk by 31%</span>
                </div>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-[10px] text-stone-500 bg-white border border-stone-200 px-2 py-0.5 font-medium">+ 5 more in full plan</span>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute -top-3 -right-3 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold -rotate-1">
            ⚠ {{ 'landing.actThisMonth' | translate }}
          </div>
          <div class="absolute -bottom-4 -left-4 px-4 py-2.5 bg-white border border-stone-200 shadow-md">
            <div class="text-[10px] text-stone-400 mb-0.5">{{ 'landing.othersInField' | translate }}</div>
            <div class="text-sm font-black text-stone-900">68% <span class="text-red-600 text-xs font-normal">↑ {{ 'landing.atHighRisk' | translate }}</span></div>
          </div>
        </div>

      </div>

      <div class="absolute bottom-8 left-[49%] -translate-x-1/2 animate-bounce">
        <svg class="w-5 h-5 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Stats Bar — editorial data strip -->
    <section class="border-b border-stone-200 bg-stone-100">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200">
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">83.4M</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsJobsDisplaced' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-red-600">47%</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsJobsAtRisk' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">96.2M</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsNewRoles' | translate }}</div>
          </div>
          <div class="py-6 px-4 text-center">
            <div class="text-3xl font-black text-stone-900">3 min</div>
            <div class="text-xs text-stone-500 mt-1">{{ 'landing.statsTimeToKnow' | translate }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works — editorial numbered list -->
    <section class="py-24 px-6 border-b border-stone-200">
      <div class="max-w-6xl mx-auto">
        <div class="mb-14">
          <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{{ 'landing.howItWorks' | translate }}</div>
          <h2 class="text-3xl md:text-4xl font-black text-stone-900">{{ 'landing.howItWorksSubtitle' | translate }}</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-0 border border-stone-200">
          <!-- Step 1 -->
          <div class="p-7 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">01</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step1Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step1Desc' | translate }}</p>
          </div>

          <!-- Step 2 -->
          <div class="p-8 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">02</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step2Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step2Desc' | translate }}</p>
          </div>

          <!-- Step 3 -->
          <div class="p-8">
            <div class="text-5xl font-black text-stone-100 mb-4 leading-none">03</div>
            <h3 class="text-lg font-bold text-stone-900 mb-3">{{ 'landing.step3Title' | translate }}</h3>
            <p class="text-stone-500 text-sm leading-relaxed">{{ 'landing.step3Desc' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Role Risk Database — interactive grid replaces fake testimonials -->
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
              (click)="heroRole = role.name; goWithRole()"
              class="group p-5 border bg-white text-left transition-all hover:border-stone-900 hover:shadow-sm"
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
                <span class="text-xs text-stone-400 group-hover:text-stone-900 transition-colors">{{ 'landing.riskDatabaseCheck' | translate }} →</span>
              </div>
            </button>
          }
        </div>

        <div class="flex items-center gap-4">
          <p class="text-xs text-stone-400">{{ 'landing.riskDatabaseFooter' | translate }}</p>
        </div>
      </div>
    </section>

    <!-- Pricing Teaser — editorial table style -->
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
            <div class="text-3xl font-black text-stone-900 mb-1">{{ starterPrice() }}<span class="text-base font-normal text-stone-400">/mo</span></div>
            <div class="text-sm text-stone-500">{{ 'landing.priceStarterDesc' | translate }}</div>
          </div>
          <div class="p-6">
            <div class="text-xs text-red-600 uppercase tracking-widest mb-3 font-bold">Pro</div>
            <div class="text-3xl font-black text-stone-900 mb-1">{{ proPrice() }}<span class="text-base font-normal text-stone-400">/mo</span></div>
            <div class="text-sm text-stone-500">{{ 'landing.priceProDesc' | translate }}</div>
          </div>
        </div>

        <a routerLink="/pricing" class="inline-flex items-center gap-2 text-sm font-bold text-stone-900 hover:text-red-600 transition-colors">
          {{ 'landing.viewPlans' | translate }} →
        </a>
      </div>
    </section>

    <!-- Final CTA — editorial inverse block -->
    <section class="py-24 px-6 bg-stone-900">
      <div class="max-w-3xl mx-auto">
        <div class="text-[10px] text-stone-500 uppercase tracking-widest mb-4">CareerRisk Index</div>
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4">{{ 'landing.finalCta' | translate }}</h2>
        <p class="text-stone-400 mb-8 max-w-xl">{{ 'landing.finalCtaDesc' | translate }}</p>
        <a
          routerLink="/session/new"
          class="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors cursor-pointer"
        >
          {{ 'landing.startFreeAssessment' | translate }}
        </a>
      </div>
    </section>

    <app-exit-intent />
  `,
  styles: [`
    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
    @keyframes fadeIn {
      from { transform: translateY(-100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  showStickyCta = false;
  jobsAtRisk = 47;
  meterProgress = 5;
  displayScore = 5;
  needleAngle = -81;
  heroRole = '';

  private readonly paymentApi = inject(PaymentApiService);
  private readonly translate = inject(TranslateService);
  readonly starterPrice = signal('€7.49');
  readonly proPrice = signal('€14.99');

  private animationInterval: any;

  private readonly cdr = inject(ChangeDetectorRef);

  // Quick role suggestions shown under the input
  quickRoles = ['Software Engineer', 'Marketing Manager', 'Data Analyst', 'Project Manager', 'Accountant', 'Teacher'];

  // Role risk database — replaces fake testimonials
  riskRoles = [
    { name: 'Marketing Manager', risk: 71, level: 'HIGH' },
    { name: 'Accountant', risk: 82, level: 'HIGH' },
    { name: 'Content Writer', risk: 76, level: 'HIGH' },
    { name: 'Software Engineer', risk: 34, level: 'MEDIUM' },
    { name: 'Data Analyst', risk: 61, level: 'MEDIUM' },
    { name: 'Project Manager', risk: 52, level: 'MEDIUM' },
    { name: 'UX Designer', risk: 43, level: 'MEDIUM' },
    { name: 'Nurse', risk: 12, level: 'LOW' },
    { name: 'Electrician', risk: 8, level: 'LOW' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.showStickyCta = window.scrollY > 600;
  }

  ngOnInit(): void {
    // Load pricing from API for dynamic currency
    this.paymentApi.getPricing().subscribe(tiers => {
      const symbol = tiers[0]?.currency === 'EUR' ? '€' : '$';
      const starter = tiers.find(t => t.id === 'STARTER');
      const pro = tiers.find(t => t.id === 'ARENA_PRO');
      if (starter) this.starterPrice.set(symbol + starter.price.toFixed(2));
      if (pro) this.proPrice.set(symbol + pro.price.toFixed(2));
      this.cdr.markForCheck();
    });

    // Animate the meter on load — no delay so 0% never flashes
    this.animateMeter();

  }

  ngOnDestroy(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
  }

  private animateMeter(): void {
    const targetScore = 42;
    const duration = 2000;
    const steps = 60;
    const increment = targetScore / steps;
    let current = 0;

    this.animationInterval = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(this.animationInterval);
      }
      this.meterProgress = current;
      this.displayScore = Math.round(current);
      this.needleAngle = -90 + (current * 1.8); // -90 to 90 range
    }, duration / steps);
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
