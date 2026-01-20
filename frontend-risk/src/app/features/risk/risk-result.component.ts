import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RiskStateService } from './risk-state.service';
import { RiskAssessmentResult } from './risk.model';

@Component({
  selector: 'app-risk-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto" *ngIf="result; else missing">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-4">
          <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs text-emerald-300 font-semibold">ANALYSIS COMPLETE</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Your Career Disruption Report</h1>
        <p class="text-slate-400">Based on your profile, skills, and market trends</p>
      </div>

      <!-- Main Risk Display -->
      <div class="grid lg:grid-cols-5 gap-6 mb-10">
        <!-- Risk Score Circle - Large -->
        <div class="lg:col-span-2 flex flex-col items-center justify-center p-8 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div class="relative w-56 h-56">
            <!-- Background circle -->
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="currentColor"
                stroke-width="8"
                class="text-slate-800"
              />
              <!-- Risk arc -->
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                [attr.stroke]="getRiskColor()"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="264"
                [attr.stroke-dashoffset]="264 - (animatedScore * 2.64)"
                class="transition-all duration-1000"
              />
            </svg>
            <!-- Center content -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-6xl font-black" [class]="getRiskTextColor()">{{ animatedScore }}</span>
              <span class="text-sm text-slate-500 -mt-1">out of 100</span>
            </div>
          </div>

          <!-- Risk Level Label -->
          <div
            class="mt-6 px-5 py-2 rounded-full text-sm font-bold"
            [class]="getRiskBadgeClass()"
          >
            {{ getRiskLevel() }} DISRUPTION RISK
          </div>

          <!-- Confidence -->
          <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Confidence: {{ result.confidence }}
          </div>
        </div>

        <!-- Breakdown Cards -->
        <div class="lg:col-span-3 space-y-4">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Factors</h3>

          <div *ngFor="let item of result.breakdown; let i = index" class="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  [class]="getFactorBgColor(item.score)"
                >
                  <svg class="w-5 h-5" [class]="getFactorIconColor(item.score)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="getFactorIcon(i)" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">{{ item.label }}</p>
                  <p class="text-xs text-slate-500">{{ item.details }}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-lg font-bold" [class]="getScoreColor(item.score)">{{ item.score }}</span>
                <span class="text-xs text-slate-600">/100</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-1000"
                [class]="getProgressBarColor(item.score)"
                [style.width.%]="animatedBreakdown[i]"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Cards Row -->
      <div class="grid md:grid-cols-2 gap-6 mb-10">
        <!-- Recommendations -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Recommended Actions</h3>
              <p class="text-xs text-slate-500">Priority steps to reduce your risk</p>
            </div>
          </div>

          <div class="space-y-3">
            <div
              *ngFor="let rec of result.recommendations; let i = index"
              class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                [class]="i === 0 ? 'bg-emerald-500 text-slate-900' : 'bg-slate-700 text-slate-300'"
              >
                {{ i + 1 }}
              </div>
              <p class="text-sm text-slate-300">{{ rec }}</p>
            </div>
          </div>
        </div>

        <!-- Industry Comparison -->
        <div class="p-6 rounded-2xl border border-slate-800 bg-slate-900/70">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">How You Compare</h3>
              <p class="text-xs text-slate-500">Your position relative to others</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Industry Average -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-slate-400">Industry Average</span>
                <span class="text-slate-300 font-semibold">52%</span>
              </div>
              <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full w-[52%] bg-slate-600 rounded-full"></div>
              </div>
            </div>

            <!-- Your Score -->
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-white font-semibold">Your Score</span>
                <span [class]="getRiskTextColor()" class="font-bold">{{ result.riskPercent }}%</span>
              </div>
              <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  [class]="getProgressBarColor(result.riskPercent)"
                  [style.width.%]="result.riskPercent"
                ></div>
              </div>
            </div>

            <!-- Comparison Message -->
            <div class="p-3 rounded-lg" [class]="getComparisonBg()">
              <p class="text-sm" [class]="getComparisonText()">
                {{ getComparisonMessage() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Section -->
      <div class="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 mb-10">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-white">Your 90-Day Transformation Roadmap</h3>
              <p class="text-sm text-slate-400">Follow this plan to reduce your disruption risk</p>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400">Days 1-30</span>
              <span class="text-xs text-slate-500">Foundation</span>
            </div>
            <p class="text-sm text-slate-300">Begin AI tool adoption in your daily workflow. Start one online course in a high-demand skill.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-cyan-500/20 text-cyan-400">Days 31-60</span>
              <span class="text-xs text-slate-500">Acceleration</span>
            </div>
            <p class="text-sm text-slate-300">Complete certification. Build 2-3 portfolio projects showcasing your new skills. Network with industry leaders.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400">Days 61-90</span>
              <span class="text-xs text-slate-500">Transformation</span>
            </div>
            <p class="text-sm text-slate-300">Apply for AI-enhanced roles. Propose AI initiatives at work. Establish yourself as a bridge between AI and your domain.</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          (click)="downloadReport()"
          class="px-6 py-3 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Full Report
        </button>
        <button
          (click)="startOver()"
          class="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          Take New Assessment
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- No Result State -->
    <ng-template #missing>
      <div class="max-w-md mx-auto text-center py-20">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white mb-3">No Assessment Yet</h2>
        <p class="text-slate-400 mb-8">Complete the Career Disruption Scanner to see your personalized risk report.</p>
        <button
          (click)="router.navigateByUrl('/risk')"
          class="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all"
        >
          Start Assessment
        </button>
      </div>
    </ng-template>
  `
})
export class RiskResultComponent implements OnInit, OnDestroy {
  result: RiskAssessmentResult | null | undefined;
  animatedScore = 0;
  animatedBreakdown: number[] = [];
  private animationInterval: any;

  private factorIcons = [
    'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    'M13 10V3L4 14h7v7l9-11h-7z',
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  ];

  constructor(private state: RiskStateService, public router: Router) {}

  ngOnInit(): void {
    this.result = this.state.snapshot.result;

    if (this.result) {
      this.animatedBreakdown = this.result.breakdown.map(() => 0);
      setTimeout(() => this.animateResults(), 300);
    }
  }

  ngOnDestroy(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
  }

  private animateResults(): void {
    if (!this.result) return;

    const target = this.result.riskPercent;
    const duration = 1500;
    const steps = 60;
    let currentStep = 0;

    this.animationInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      this.animatedScore = Math.round(target * eased);
      this.animatedBreakdown = this.result!.breakdown.map(item =>
        Math.round(item.score * eased)
      );

      if (currentStep >= steps) {
        clearInterval(this.animationInterval);
      }
    }, duration / steps);
  }

  getRiskColor(): string {
    if (!this.result) return '#10b981';
    const score = this.result.riskPercent;
    if (score < 30) return '#10b981'; // emerald
    if (score < 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  }

  getRiskTextColor(): string {
    if (!this.result) return 'text-emerald-400';
    const score = this.result.riskPercent;
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-amber-400';
    return 'text-rose-400';
  }

  getRiskBadgeClass(): string {
    if (!this.result) return 'bg-emerald-500/20 text-emerald-400';
    const score = this.result.riskPercent;
    if (score < 30) return 'bg-emerald-500/20 text-emerald-400';
    if (score < 60) return 'bg-amber-500/20 text-amber-400';
    return 'bg-rose-500/20 text-rose-400';
  }

  getRiskLevel(): string {
    if (!this.result) return 'LOW';
    const score = this.result.riskPercent;
    if (score < 30) return 'LOW';
    if (score < 60) return 'MODERATE';
    return 'HIGH';
  }

  getScoreColor(score: number): string {
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-amber-400';
    return 'text-rose-400';
  }

  getProgressBarColor(score: number): string {
    if (score < 30) return 'bg-emerald-500';
    if (score < 60) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  getFactorBgColor(score: number): string {
    if (score < 30) return 'bg-emerald-500/20';
    if (score < 60) return 'bg-amber-500/20';
    return 'bg-rose-500/20';
  }

  getFactorIconColor(score: number): string {
    if (score < 30) return 'text-emerald-400';
    if (score < 60) return 'text-amber-400';
    return 'text-rose-400';
  }

  getFactorIcon(index: number): string {
    return this.factorIcons[index % this.factorIcons.length];
  }

  getComparisonBg(): string {
    if (!this.result) return 'bg-slate-800/50';
    const diff = this.result.riskPercent - 52;
    if (diff < -10) return 'bg-emerald-500/10';
    if (diff > 10) return 'bg-rose-500/10';
    return 'bg-amber-500/10';
  }

  getComparisonText(): string {
    if (!this.result) return 'text-slate-400';
    const diff = this.result.riskPercent - 52;
    if (diff < -10) return 'text-emerald-400';
    if (diff > 10) return 'text-rose-400';
    return 'text-amber-400';
  }

  getComparisonMessage(): string {
    if (!this.result) return '';
    const diff = this.result.riskPercent - 52;
    if (diff < -10) {
      return `Great news! You're ${Math.abs(diff)} points below the industry average. Your skills appear well-positioned for the AI era.`;
    }
    if (diff > 10) {
      return `Alert: You're ${diff} points above the industry average. We recommend taking immediate action to reduce your risk.`;
    }
    return `You're close to the industry average. Following our recommendations can help you get ahead of the curve.`;
  }

  downloadReport(): void {
    // Placeholder for PDF download functionality
    console.log('Download report clicked');
  }

  startOver(): void {
    this.state.reset();
    this.router.navigateByUrl('/risk');
  }
}
