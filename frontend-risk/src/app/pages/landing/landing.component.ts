import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth-api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <!-- Hero Section — Editorial Split Screen -->
    <section class="min-h-[calc(100vh-57px)] flex flex-col justify-center px-6 border-b border-stone-200 relative overflow-hidden">
      <!-- Subtle editorial texture -->
      <span class="absolute top-[110px] right-[17%] text-xl text-stone-200 rotate-12 pointer-events-none select-none hidden lg:block">✦</span>
      <span class="absolute bottom-[180px] left-[5%] text-sm text-stone-200 -rotate-6 pointer-events-none select-none hidden lg:block">◆</span>

      <div class="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center py-24">

        <!-- LEFT: Text + CTA -->
        <div class="space-y-7">
          <!-- Live social proof — editorial style -->
          <div class="flex items-center gap-2 text-xs text-stone-500 border-l-2 border-red-600 pl-3">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span><strong class="text-stone-900">{{ liveAssessments | number }}</strong> people checked their risk today</span>
          </div>

          <!-- Headline — fear + doubt, editorial weight -->
          <h1 class="text-5xl md:text-6xl font-black text-stone-900 leading-[1.02] tracking-tight">
            Your job is<br>
            probably <span class="text-red-600">fine.</span>
          </h1>

          <!-- Subheadline -->
          <p class="text-lg text-stone-600 leading-relaxed max-w-md">
            But <strong class="text-stone-900">{{ jobsAtRisk }}% of roles</strong> like yours are already being automated.
            Find out where you stand — <em class="text-stone-500 not-italic">before your employer does.</em>
          </p>

          <!-- CTA — editorial buttons, sharp corners -->
          <div class="flex flex-row gap-3 pt-1">
            <a
              routerLink="/session/new"
              class="whitespace-nowrap px-6 py-3 bg-red-600 hover:bg-red-700 text-sm font-bold text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              Check my risk →
            </a>
            <a
              routerLink="/start"
              class="whitespace-nowrap px-5 py-3 text-sm font-medium text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-900 transition-colors cursor-pointer flex items-center"
            >
              How it works
            </a>
          </div>

          <!-- Trust — plain text, no icons -->
          <div class="flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 pt-1">
            <span>Free</span><span>·</span><span>3 min</span><span>·</span><span>No account needed</span><span>·</span><span>Results are private</span>
          </div>
        </div>

        <!-- RIGHT: Product preview mock — HIGH RISK to trigger fear -->
        <div class="relative hidden md:block">

          <!-- Main result card — editorial white -->
          <div class="relative border border-stone-300 bg-white shadow-sm overflow-hidden">
            <!-- Card header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200 bg-stone-50">
              <div>
                <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">Risk Assessment</div>
                <div class="text-sm font-semibold text-stone-900">Marketing Manager</div>
              </div>
              <span class="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold border border-red-200">HIGH RISK</span>
            </div>

            <!-- Score block -->
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

            <!-- Action items — last one blurred/locked -->
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
              <!-- Blurred paywall tease -->
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

          <!-- Floating urgency badge — editorial red label -->
          <div class="absolute -top-3 -right-3 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold -rotate-1">
            ⚠ Act this month
          </div>

          <!-- Floating social proof — white card -->
          <div class="absolute -bottom-4 -left-4 px-4 py-2.5 bg-white border border-stone-200 shadow-md">
            <div class="text-[10px] text-stone-400 mb-0.5">Others in your field</div>
            <div class="text-sm font-black text-stone-900">68% <span class="text-red-600 text-xs font-normal">↑ at high risk</span></div>
          </div>
        </div>

      </div>

      <!-- Scroll Indicator -->
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

    <!-- Testimonials — editorial quote style -->
    <section class="py-24 px-6 border-b border-stone-200 bg-stone-50">
      <div class="max-w-6xl mx-auto">
        <div class="mb-14">
          <div class="text-[10px] text-stone-400 uppercase tracking-widest mb-3">{{ 'landing.testimonials' | translate }}</div>
          <h2 class="text-2xl font-black text-stone-900">{{ 'landing.testimonialsSubtitle' | translate }}</h2>
        </div>

        <div class="grid md:grid-cols-3 gap-0 border border-stone-200 bg-white mb-14">
          <!-- Testimonial 1 -->
          <div class="p-6 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="flex items-center gap-0.5 text-amber-500 mb-4">
              <svg *ngFor="let s of [1,2,3,4,5]" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-stone-700 text-sm leading-relaxed mb-5 italic">
              "{{ 'landing.testimonial1Text' | translate }}"
            </p>
            <div class="flex items-center gap-3 pt-4 border-t border-stone-100">
              <div class="w-8 h-8 bg-stone-900 flex items-center justify-center text-xs font-bold text-white shrink-0">KT</div>
              <div>
                <div class="text-sm font-semibold text-stone-900">{{ 'landing.testimonial1Name' | translate }}</div>
                <div class="text-xs text-stone-400">{{ 'landing.testimonial1Role' | translate }}</div>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 — 4 stars -->
          <div class="p-6 border-b md:border-b-0 md:border-r border-stone-200">
            <div class="flex items-center gap-0.5 text-amber-500 mb-4">
              <svg *ngFor="let s of [1,2,3,4]" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-stone-700 text-sm leading-relaxed mb-5 italic">
              "{{ 'landing.testimonial2Text' | translate }}"
            </p>
            <div class="flex items-center gap-3 pt-4 border-t border-stone-100">
              <div class="w-9 h-9 bg-stone-800 flex items-center justify-center text-xs font-bold text-white shrink-0">MJ</div>
              <div>
                <div class="text-sm font-semibold text-stone-900">{{ 'landing.testimonial2Name' | translate }}</div>
                <div class="text-xs text-stone-400">{{ 'landing.testimonial2Role' | translate }}</div>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="p-6">
            <div class="flex items-center gap-0.5 text-amber-500 mb-4">
              <svg *ngFor="let s of [1,2,3,4,5]" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-stone-700 text-sm leading-relaxed mb-5 italic">
              "{{ 'landing.testimonial3Text' | translate }}"
            </p>
            <div class="flex items-center gap-3 pt-4 border-t border-stone-100">
              <div class="w-8 h-8 bg-stone-700 flex items-center justify-center text-xs font-bold text-white shrink-0">AL</div>
              <div>
                <div class="text-sm font-semibold text-stone-900">{{ 'landing.testimonial3Name' | translate }}</div>
                <div class="text-xs text-stone-400">{{ 'landing.testimonial3Role' | translate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- As Seen In -->
        <div>
          <p class="text-[10px] text-stone-400 uppercase tracking-widest mb-5">{{ 'landing.trustedBy' | translate }}</p>
          <div class="flex flex-wrap items-center gap-8 text-stone-300">
            <span class="text-lg font-bold tracking-tight">TechCrunch</span>
            <span class="text-base font-bold tracking-tight">WIRED</span>
            <span class="text-lg font-bold tracking-tight">Postimees</span>
            <span class="text-sm font-bold tracking-tight">Startup Estonia</span>
          </div>
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
            <div class="text-3xl font-black text-stone-900 mb-1">&euro;7.99<span class="text-base font-normal text-stone-400">/mo</span></div>
            <div class="text-sm text-stone-500">{{ 'landing.priceStarterDesc' | translate }}</div>
          </div>
          <div class="p-6">
            <div class="text-xs text-red-600 uppercase tracking-widest mb-3 font-bold">Pro</div>
            <div class="text-3xl font-black text-stone-900 mb-1">&euro;15.99<span class="text-base font-normal text-stone-400">/mo</span></div>
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
  `,
  styles: [`
    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  liveAssessments = 1243;
  jobsAtRisk = 47;
  meterProgress = 5;
  displayScore = 5;
  needleAngle = -81;

  private animationInterval: any;
  private counterInterval: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Animate the meter on load — no delay so 0% never flashes
    this.animateMeter();

    // Simulate live assessments counter
    this.counterInterval = setInterval(() => {
      if (Math.random() > 0.3) this.liveAssessments += Math.floor(Math.random() * 4) + 1;
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.counterInterval) clearInterval(this.counterInterval);
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

  startAssessment(): void {
    // Guide users through skill assessment questionnaire first
    this.router.navigateByUrl('/start');
  }
}
