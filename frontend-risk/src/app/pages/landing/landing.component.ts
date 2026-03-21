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
    <!-- Animated Background Grid -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
      <div class="absolute inset-0 opacity-20" style="background-image:
        linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: gridMove 20s linear infinite;">
      </div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    </div>

    <!-- Hero Section — Split Screen -->
    <section class="min-h-screen flex flex-col justify-center px-6 relative overflow-hidden">
      <!-- Decorative accents -->
      <span class="absolute top-[138px] right-[18%] text-2xl text-emerald-400/30 rotate-12 pointer-events-none select-none hidden lg:block">✦</span>
      <span class="absolute bottom-[220px] left-[6%] text-sm text-cyan-400/20 -rotate-6 pointer-events-none select-none hidden lg:block">◆</span>

      <div class="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center py-24">

        <!-- LEFT: Text + CTA -->
        <div class="space-y-7">
          <!-- Live pill -->
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{{ liveAssessments | number }} {{ 'landing.liveAssessments' | translate }}</span>
            <span class="text-slate-700">·</span>
            <span class="text-amber-400">⚡</span>
            <span>{{ jobsAtRisk }}% {{ 'landing.jobsDisrupted' | translate }}</span>
          </div>

          <!-- Headline — left-aligned, tighter -->
          <h1 class="text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
            {{ 'landing.headline' | translate }}<br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{{ 'landing.headlineHighlight' | translate }}</span>
          </h1>

          <!-- Subheadline — shorter -->
          <p class="text-lg text-slate-400 leading-relaxed max-w-md">
            Get your personal <strong class="text-white font-semibold">Disruption Risk Score</strong> in 3 minutes. Real market data, not guesswork.
          </p>

          <!-- CTA -->
          <div class="flex flex-row gap-3 pt-1">
            <a
              routerLink="/session/new"
              class="group whitespace-nowrap px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex items-center gap-2"
            >
              {{ 'landing.ctaPrimary' | translate }}
              <svg class="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              routerLink="/start"
              class="whitespace-nowrap px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 transition-all cursor-pointer flex items-center"
            >
              {{ 'landing.ctaSecondary' | translate }}
            </a>
          </div>

          <!-- Trust -->
          <div class="flex flex-row flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500 pt-1">
            <span class="flex items-center gap-1.5 whitespace-nowrap"><span class="text-emerald-500">✓</span> {{ 'landing.trustFree' | translate }}</span>
            <span class="flex items-center gap-1.5 whitespace-nowrap"><span class="text-emerald-500">✓</span> {{ 'landing.trustPrivacy' | translate }}</span>
            <span class="flex items-center gap-1.5 whitespace-nowrap"><span class="text-emerald-500">✓</span> {{ 'landing.trustRoadmap' | translate }}</span>
          </div>
        </div>

        <!-- RIGHT: Product preview mock -->
        <div class="relative hidden md:block">
          <!-- Glow behind card -->
          <div class="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-3xl"></div>

          <!-- Main result card -->
          <div class="relative rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden">
            <!-- Card header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Your Assessment</div>
                <div class="text-sm font-semibold text-white">Senior Frontend Developer</div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/20">MEDIUM RISK</span>
            </div>

            <!-- Score block -->
            <div class="px-5 pt-5 pb-4">
              <div class="flex items-end gap-3 mb-3">
                <span class="text-6xl font-black text-white leading-none">{{ displayScore }}%</span>
                <span class="text-slate-500 text-sm pb-1">automation risk</span>
              </div>
              <!-- Progress bar -->
              <div class="h-1.5 bg-slate-800 rounded-full mb-1">
                <div
                  class="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 transition-all duration-1000"
                  [style.width.%]="meterProgress"
                ></div>
              </div>
              <div class="flex justify-between text-[10px] text-slate-600">
                <span>Low</span><span>High</span>
              </div>
            </div>

            <!-- Action items -->
            <div class="px-5 pb-5 space-y-2">
              <div class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Top Actions This Month</div>
              <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60">
                <span class="text-emerald-400 text-xs mt-0.5 shrink-0">→</span>
                <span class="text-xs text-slate-300 leading-relaxed">Learn TypeScript & Node.js to expand into backend roles</span>
              </div>
              <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/60">
                <span class="text-emerald-400 text-xs mt-0.5 shrink-0">→</span>
                <span class="text-xs text-slate-300 leading-relaxed">Build 2 AI-integrated projects for portfolio by April</span>
              </div>
              <div class="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/30 opacity-50">
                <span class="text-slate-600 text-xs mt-0.5 shrink-0">→</span>
                <span class="text-xs text-slate-500">5 more actions in full plan...</span>
              </div>
            </div>
          </div>

          <!-- Floating badge top-right -->
          <div class="absolute -top-3 -right-3 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-900 text-[11px] font-bold shadow-lg shadow-emerald-500/30 rotate-1">
            Updated today
          </div>

          <!-- Floating mini stat bottom-left -->
          <div class="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 shadow-xl">
            <div class="text-[10px] text-slate-500 mb-0.5">Avg. score in your field</div>
            <div class="text-lg font-black text-white">38% <span class="text-emerald-400 text-xs font-normal">↓ safer than most</span></div>
          </div>
        </div>

      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-[49%] -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-6 bg-slate-900/50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ 'landing.howItWorks' | translate }}</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">{{ 'landing.howItWorksSubtitle' | translate }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="group relative p-7 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">01</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{{ 'landing.step1Title' | translate }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ 'landing.step1Desc' | translate }}</p>
          </div>

          <!-- Step 2 -->
          <div class="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">02</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{{ 'landing.step2Title' | translate }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ 'landing.step2Desc' | translate }}</p>
          </div>

          <!-- Step 3 -->
          <div class="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">03</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">{{ 'landing.step3Title' | translate }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ 'landing.step3Desc' | translate }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ 'landing.testimonials' | translate }}</h2>
          <p class="text-slate-400">{{ 'landing.testimonialsSubtitle' | translate }}</p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-16">
          <!-- Testimonial 1 -->
          <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/30 transition-colors">
            <div class="flex items-center gap-1 text-amber-400 mb-4">
              <svg *ngFor="let s of [1,2,3,4,5]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed mb-4 italic">
              "{{ 'landing.testimonial1Text' | translate }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-900">KT</div>
              <div>
                <div class="text-sm font-semibold text-white">{{ 'landing.testimonial1Name' | translate }}</div>
                <div class="text-xs text-slate-500">{{ 'landing.testimonial1Role' | translate }}</div>
              </div>
            </div>
          </div>

          <!-- Testimonial 2 -->
          <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/30 transition-colors">
            <div class="flex items-center gap-1 text-amber-400 mb-4">
              <svg *ngFor="let s of [1,2,3,4]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed mb-4 italic">
              "{{ 'landing.testimonial2Text' | translate }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-slate-900">MJ</div>
              <div>
                <div class="text-sm font-semibold text-white">{{ 'landing.testimonial2Name' | translate }}</div>
                <div class="text-xs text-slate-500">{{ 'landing.testimonial2Role' | translate }}</div>
              </div>
            </div>
          </div>

          <!-- Testimonial 3 -->
          <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/30 transition-colors">
            <div class="flex items-center gap-1 text-amber-400 mb-4">
              <svg *ngFor="let s of [1,2,3,4,5]" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed mb-4 italic">
              "{{ 'landing.testimonial3Text' | translate }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-xs font-bold text-slate-900">AL</div>
              <div>
                <div class="text-sm font-semibold text-white">{{ 'landing.testimonial3Name' | translate }}</div>
                <div class="text-xs text-slate-500">{{ 'landing.testimonial3Role' | translate }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- As Seen In -->
        <div class="text-center">
          <p class="text-xs text-slate-600 uppercase tracking-widest mb-4">{{ 'landing.trustedBy' | translate }}</p>
          <div class="flex flex-wrap items-center justify-center gap-8 text-slate-700">
            <span class="text-lg font-bold tracking-tight">TechCrunch</span>
            <span class="text-base font-bold tracking-tight">WIRED</span>
            <span class="text-lg font-bold tracking-tight">Postimees</span>
            <span class="text-sm font-bold tracking-tight">Startup Estonia</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Teaser -->
    <section class="py-24 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/5 mb-6">
          <span class="text-sm font-medium text-blue-300">{{ 'landing.simplePricing' | translate }}</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">{{ 'landing.startFree' | translate }}</h2>
        <p class="text-slate-400 mb-8 max-w-2xl mx-auto">
          {{ 'landing.pricingDesc' | translate }}
        </p>
        <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
          <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div class="text-2xl font-bold text-slate-300">{{ 'landing.priceFree' | translate }}</div>
            <div class="text-xs text-slate-500 mt-1">{{ 'landing.priceFreeDesc' | translate }}</div>
          </div>
          <div class="rounded-xl border border-emerald-500/50 bg-slate-900/50 p-5 shadow-lg shadow-emerald-500/5">
            <div class="text-2xl font-bold text-white">&euro;7.99/{{ 'pricing.perMonth' | translate }}</div>
            <div class="text-xs text-emerald-400 mt-1">{{ 'landing.priceStarterDesc' | translate }}</div>
          </div>
          <div class="rounded-xl border border-purple-500/50 bg-slate-900/50 p-5 shadow-lg shadow-purple-500/5">
            <div class="text-2xl font-bold text-white">&euro;15.99/{{ 'pricing.perMonth' | translate }}</div>
            <div class="text-xs text-purple-400 mt-1">{{ 'landing.priceProDesc' | translate }}</div>
          </div>
        </div>
        <a
          routerLink="/pricing"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/10 transition-all"
        >
          {{ 'landing.viewPlans' | translate }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">83.4M</div>
            <div class="text-sm text-slate-500 mt-2">{{ 'landing.statsJobsDisplaced' | translate }}</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">47%</div>
            <div class="text-sm text-slate-500 mt-2">{{ 'landing.statsJobsAtRisk' | translate }}</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">96.2M</div>
            <div class="text-sm text-slate-500 mt-2">{{ 'landing.statsNewRoles' | translate }}</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">3 min</div>
            <div class="text-sm text-slate-500 mt-2">{{ 'landing.statsTimeToKnow' | translate }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
      <div class="max-w-3xl mx-auto text-center relative z-20">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">{{ 'landing.finalCta' | translate }}</h2>
        <p class="text-slate-400 mb-8">{{ 'landing.finalCtaDesc' | translate }}</p>
        <a
          routerLink="/session/new"
          class="inline-block px-10 py-5 bg-white rounded-xl text-lg font-bold text-slate-900 shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300 cursor-pointer"
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
