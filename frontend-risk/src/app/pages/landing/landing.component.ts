import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Animated Background Grid -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
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

    <!-- Hero Section -->
    <section class="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <!-- Live Stats Bar -->
      <div class="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-xs text-slate-400">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{{ liveAssessments | number }} assessments today</span>
        </div>
        <div class="hidden sm:block h-3 w-px bg-slate-700"></div>
        <div class="hidden sm:flex items-center gap-2">
          <span class="text-amber-400">⚡</span>
          <span>{{ jobsAtRisk }}% of jobs disrupted by 2030</span>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-5xl mx-auto text-center space-y-8">
        <!-- Brand -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm">
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-sm font-medium text-emerald-300">CAREER DISRUPTION INDEX™</span>
        </div>

        <!-- Headline -->
        <h1 class="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
          Will AI Replace
          <span class="relative inline-block">
            <span class="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400">Your Career?</span>
            <span class="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 blur-2xl"></span>
          </span>
        </h1>

        <!-- Subheadline -->
        <p class="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Get your personalized <span class="text-white font-semibold">Disruption Risk Score</span> in 3 minutes.
          Based on real market data, AI advancement trends, and your unique skill profile.
        </p>

        <!-- Risk Meter Preview -->
        <div class="flex justify-center py-6">
          <div class="relative w-64 h-32">
            <svg class="w-full h-full" viewBox="0 0 200 100">
              <!-- Background arc -->
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="currentColor"
                stroke-width="12"
                class="text-slate-800"
              />
              <!-- Gradient arc -->
              <defs>
                <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="50%" stop-color="#eab308" />
                  <stop offset="100%" stop-color="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                stroke="url(#riskGradient)"
                stroke-width="12"
                stroke-dasharray="251.2"
                [attr.stroke-dashoffset]="251.2 - (meterProgress * 2.512)"
                class="transition-all duration-1000"
              />
              <!-- Needle -->
              <g [style.transform]="'rotate(' + (needleAngle) + 'deg)'" style="transform-origin: 100px 90px" class="transition-all duration-1000">
                <line x1="100" y1="90" x2="100" y2="30" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <circle cx="100" cy="90" r="6" fill="white"/>
              </g>
            </svg>
            <div class="absolute inset-x-0 bottom-0 text-center">
              <span class="text-3xl font-bold text-white">{{ displayScore }}%</span>
              <span class="block text-xs text-slate-500 mt-1">Average Risk Score</span>
            </div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            (click)="startAssessment()"
            class="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-lg font-bold text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300"
          >
            <span class="flex items-center gap-3">
              Calculate My Risk Score
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <a
            routerLink="/login"
            class="px-6 py-4 rounded-xl text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
          >
            Already have results? Sign in
          </a>
        </div>

        <!-- Trust Indicators -->
        <div class="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm text-slate-500">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>Free assessment</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <span>Data never shared</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            <span>Personalized roadmap</span>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-6 bg-slate-900/50">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p class="text-slate-400 max-w-2xl mx-auto">Three steps to understand your career's future and build a defense strategy</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">01</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Upload Your Profile</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Share your CV or describe your role. Our AI analyzes your skills against 10,000+ job market data points.</p>
          </div>

          <!-- Step 2 -->
          <div class="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">02</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Get Your Risk Analysis</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Receive a detailed breakdown of automation risk, AI replacement probability, and market demand trends for your role.</p>
          </div>

          <!-- Step 3 -->
          <div class="group relative p-8 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all duration-300">
            <div class="absolute -top-4 left-8 px-3 py-1 bg-emerald-500 rounded-full text-sm font-bold text-slate-900">03</div>
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">Build Your Roadmap</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Get a personalized 90-day action plan with specific skills to learn, certifications to pursue, and career pivots to consider.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-24 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">85M</div>
            <div class="text-sm text-slate-500 mt-2">Jobs displaced by 2025</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">47%</div>
            <div class="text-sm text-slate-500 mt-2">Of US jobs at high risk</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">97M</div>
            <div class="text-sm text-slate-500 mt-2">New roles emerging</div>
          </div>
          <div>
            <div class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">3 min</div>
            <div class="text-sm text-slate-500 mt-2">To know your risk</div>
          </div>
        </div>
      </div>
    </section>

    <!-- For Employers Section -->
    <section class="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div class="max-w-6xl mx-auto">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm mb-6">
              <span>For Employers</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
              Future-Proof Your Workforce
            </h2>
            <p class="text-slate-400 mb-6 leading-relaxed">
              Don't wait until your best people are obsolete. Get AI-powered insights into your team's
              skill gaps, automation risk, and upskilling ROI.
            </p>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-3 text-slate-300">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Workforce risk analytics dashboard
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                AI-powered upskilling recommendations
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                ROI tracking on training investments
              </li>
              <li class="flex items-center gap-3 text-slate-300">
                <svg class="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                HRIS & LMS integrations
              </li>
            </ul>
            <div class="flex gap-4">
              <a routerLink="/pricing" class="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors">
                View Pricing
              </a>
              <a routerLink="/business" class="px-6 py-3 border border-slate-700 text-slate-300 rounded-lg font-semibold hover:border-slate-500 hover:text-white transition-colors">
                Book Demo
              </a>
            </div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-semibold text-white">Workforce Risk Overview</h3>
              <span class="text-xs text-slate-500">Demo Data</span>
            </div>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span class="text-slate-400">Engineering</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="w-1/3 h-full bg-emerald-500 rounded-full"></div>
                  </div>
                  <span class="text-emerald-400 font-mono text-sm">32%</span>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span class="text-slate-400">Marketing</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="w-3/4 h-full bg-red-500 rounded-full"></div>
                  </div>
                  <span class="text-red-400 font-mono text-sm">76%</span>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span class="text-slate-400">Finance</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="w-1/2 h-full bg-amber-500 rounded-full"></div>
                  </div>
                  <span class="text-amber-400 font-mono text-sm">54%</span>
                </div>
              </div>
              <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span class="text-slate-400">Sales</span>
                <div class="flex items-center gap-3">
                  <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="w-2/5 h-full bg-amber-500 rounded-full"></div>
                  </div>
                  <span class="text-amber-400 font-mono text-sm">41%</span>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-2xl font-bold text-white">4.2x</div>
                <div class="text-xs text-slate-500">Avg. Upskill ROI</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-emerald-400">$340K</div>
                <div class="text-xs text-slate-500">Est. Annual Savings</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-purple-400">89%</div>
                <div class="text-xs text-slate-500">Assessment Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-24 px-6 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
      <div class="max-w-3xl mx-auto text-center relative z-10">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Don't Wait Until It's Too Late</h2>
        <p class="text-slate-400 mb-8">The workforce is changing faster than ever. Know where you stand and take control of your career future.</p>
        <button
          type="button"
          (click)="startAssessment()"
          class="px-10 py-5 bg-white rounded-xl text-lg font-bold text-slate-900 shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300"
        >
          Start Free Assessment →
        </button>
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
  liveAssessments = 1247;
  jobsAtRisk = 47;
  meterProgress = 0;
  displayScore = 0;
  needleAngle = -90;

  private animationInterval: any;
  private counterInterval: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Animate the meter on load
    setTimeout(() => {
      this.animateMeter();
    }, 500);

    // Simulate live assessments counter
    this.counterInterval = setInterval(() => {
      this.liveAssessments += Math.floor(Math.random() * 3);
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
