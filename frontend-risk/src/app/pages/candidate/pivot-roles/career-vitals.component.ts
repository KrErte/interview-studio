import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

export interface VitalSign {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
  trend: 'up' | 'down' | 'stable';
  history: number[]; // last 12 data points
}

@Component({
  selector: 'app-career-vitals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Monitor header -->
      <div class="px-5 pt-4 pb-3 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Career Vital Signs</h3>
              <p class="text-xs text-slate-500">Real-time career health monitoring</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full animate-pulse" [ngClass]="overallStatusColor"></div>
            <span class="text-xs font-mono" [ngClass]="overallStatusColor">{{ overallStatus }}</span>
          </div>
        </div>
      </div>

      <!-- Vital signs grid -->
      <div class="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          *ngFor="let vital of vitals; let i = index"
          class="relative rounded-xl border p-4 transition-all duration-300"
          [ngClass]="getVitalCardClasses(vital)"
        >
          <!-- Label and value -->
          <div class="flex items-start justify-between mb-3">
            <div>
              <p class="text-xs text-slate-400 uppercase tracking-wide">{{ vital.label }}</p>
              <div class="flex items-baseline gap-1 mt-1">
                <span class="text-3xl font-mono font-bold" [ngClass]="getVitalValueColor(vital)">
                  {{ animatedValues[i] }}
                </span>
                <span class="text-sm text-slate-500">{{ vital.unit }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 px-2 py-1 rounded-full" [ngClass]="getTrendBadgeClasses(vital.trend)">
              <span class="text-xs">{{ getTrendIcon(vital.trend) }}</span>
              <span class="text-[10px] font-medium uppercase">{{ vital.trend }}</span>
            </div>
          </div>

          <!-- Mini chart -->
          <div class="h-12 relative">
            <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
              <!-- Optimal zone -->
              <rect
                x="0"
                [attr.y]="40 - (vital.optimalMax / vital.max * 40)"
                width="100"
                [attr.height]="(vital.optimalMax - vital.optimalMin) / vital.max * 40"
                fill="rgba(16, 185, 129, 0.1)"
              />

              <!-- Line chart -->
              <polyline
                fill="none"
                [attr.stroke]="getChartStrokeColor(vital)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                [attr.points]="getChartPoints(vital)"
              />

              <!-- Current value dot -->
              <circle
                [attr.cx]="100"
                [attr.cy]="40 - (vital.value / vital.max * 40)"
                r="3"
                [attr.fill]="getChartStrokeColor(vital)"
              />
            </svg>

            <!-- Grid lines -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div class="border-b border-slate-800/50"></div>
              <div class="border-b border-slate-800/50"></div>
              <div class="border-b border-slate-800/50"></div>
            </div>
          </div>

          <!-- Range indicator -->
          <div class="mt-3">
            <div class="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <!-- Optimal zone marker -->
              <div
                class="absolute h-full bg-emerald-500/20"
                [style.left.%]="(vital.optimalMin / vital.max) * 100"
                [style.width.%]="((vital.optimalMax - vital.optimalMin) / vital.max) * 100"
              ></div>

              <!-- Current position marker -->
              <div
                class="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-500"
                [ngClass]="getVitalDotColor(vital)"
                [style.left.%]="(vital.value / vital.max) * 100"
              ></div>
            </div>
            <div class="flex justify-between mt-1 text-[9px] text-slate-500">
              <span>{{ vital.min }}</span>
              <span class="text-emerald-400">optimal: {{ vital.optimalMin }}-{{ vital.optimalMax }}</span>
              <span>{{ vital.max }}</span>
            </div>
          </div>

          <!-- Warning indicator for out-of-range -->
          <div
            *ngIf="!isInOptimalRange(vital)"
            class="absolute top-2 right-2 flex items-center gap-1"
          >
            <div class="w-2 h-2 rounded-full animate-pulse" [ngClass]="getWarningColor(vital)"></div>
          </div>
        </div>
      </div>

      <!-- Overall assessment -->
      <div class="px-5 py-4 border-t border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="text-center">
              <div class="text-3xl font-mono font-bold" [ngClass]="overallScoreColor">{{ overallScore }}</div>
              <div class="text-[10px] uppercase tracking-wide text-slate-500">Overall Score</div>
            </div>
            <div class="h-10 w-px bg-slate-800"></div>
            <div>
              <p class="text-sm text-slate-300">{{ diagnosis }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ recommendation }}</p>
            </div>
          </div>
          <button class="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
            Full Checkup →
          </button>
        </div>
      </div>
    </div>
  `
})
export class CareerVitalsComponent implements OnInit, OnDestroy {
  @Input() vitals: VitalSign[] = [];

  animatedValues: number[] = [];
  private animationInterval: any;

  ngOnInit(): void {
    // Initialize animated values
    this.animatedValues = this.vitals.map(() => 0);
    this.animateValues();
  }

  ngOnDestroy(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  private animateValues(): void {
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    this.animationInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.animatedValues = this.vitals.map((vital, i) =>
        Math.round(vital.value * easeOut)
      );

      if (currentStep >= steps) {
        clearInterval(this.animationInterval);
      }
    }, stepDuration);
  }

  get overallScore(): number {
    if (!this.vitals.length) return 0;

    const scores = this.vitals.map(v => {
      if (v.value >= v.optimalMin && v.value <= v.optimalMax) return 100;
      const distFromOptimal = v.value < v.optimalMin
        ? v.optimalMin - v.value
        : v.value - v.optimalMax;
      const range = v.max - v.min;
      return Math.max(0, 100 - (distFromOptimal / range * 150));
    });

    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  get overallScoreColor(): string {
    const score = this.overallScore;
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  }

  get overallStatus(): string {
    const score = this.overallScore;
    if (score >= 80) return 'OPTIMAL';
    if (score >= 60) return 'STABLE';
    if (score >= 40) return 'ATTENTION';
    return 'CRITICAL';
  }

  get overallStatusColor(): string {
    const score = this.overallScore;
    if (score >= 80) return 'bg-emerald-500 text-emerald-400';
    if (score >= 60) return 'bg-cyan-500 text-cyan-400';
    if (score >= 40) return 'bg-amber-500 text-amber-400';
    return 'bg-rose-500 text-rose-400';
  }

  get diagnosis(): string {
    const lowVitals = this.vitals.filter(v => v.value < v.optimalMin);
    const highVitals = this.vitals.filter(v => v.value > v.optimalMax);

    if (lowVitals.length === 0 && highVitals.length === 0) {
      return 'All career vitals within optimal range.';
    }

    const issues: string[] = [];
    if (lowVitals.length) {
      issues.push(`${lowVitals.map(v => v.label).join(', ')} below optimal`);
    }
    if (highVitals.length) {
      issues.push(`${highVitals.map(v => v.label).join(', ')} elevated`);
    }
    return issues.join('; ') + '.';
  }

  get recommendation(): string {
    const score = this.overallScore;
    if (score >= 80) return 'Continue current trajectory. Monitor monthly.';
    if (score >= 60) return 'Minor adjustments recommended. Review skill development plan.';
    if (score >= 40) return 'Proactive intervention needed. Consider pivot strategy.';
    return 'Immediate action required. Prioritize upskilling in critical areas.';
  }

  getVitalCardClasses(vital: VitalSign): string {
    if (this.isInOptimalRange(vital)) {
      return 'border-emerald-500/30 bg-emerald-500/5';
    }
    if (vital.value < vital.optimalMin * 0.7 || vital.value > vital.optimalMax * 1.3) {
      return 'border-rose-500/30 bg-rose-500/5';
    }
    return 'border-amber-500/30 bg-amber-500/5';
  }

  getVitalValueColor(vital: VitalSign): string {
    if (this.isInOptimalRange(vital)) return 'text-emerald-400';
    if (vital.value < vital.optimalMin * 0.7 || vital.value > vital.optimalMax * 1.3) return 'text-rose-400';
    return 'text-amber-400';
  }

  getVitalDotColor(vital: VitalSign): string {
    if (this.isInOptimalRange(vital)) return 'bg-emerald-500';
    if (vital.value < vital.optimalMin * 0.7 || vital.value > vital.optimalMax * 1.3) return 'bg-rose-500';
    return 'bg-amber-500';
  }

  getWarningColor(vital: VitalSign): string {
    if (vital.value < vital.optimalMin * 0.7 || vital.value > vital.optimalMax * 1.3) return 'bg-rose-500';
    return 'bg-amber-500';
  }

  getTrendBadgeClasses(trend: VitalSign['trend']): string {
    switch (trend) {
      case 'up': return 'bg-emerald-500/20 text-emerald-400';
      case 'down': return 'bg-rose-500/20 text-rose-400';
      case 'stable': return 'bg-slate-500/20 text-slate-400';
    }
  }

  getTrendIcon(trend: VitalSign['trend']): string {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'stable': return '→';
    }
  }

  isInOptimalRange(vital: VitalSign): boolean {
    return vital.value >= vital.optimalMin && vital.value <= vital.optimalMax;
  }

  getChartStrokeColor(vital: VitalSign): string {
    if (this.isInOptimalRange(vital)) return '#10b981';
    if (vital.value < vital.optimalMin * 0.7 || vital.value > vital.optimalMax * 1.3) return '#f43f5e';
    return '#f59e0b';
  }

  getChartPoints(vital: VitalSign): string {
    const points: string[] = [];
    const stepX = 100 / (vital.history.length - 1);

    for (let i = 0; i < vital.history.length; i++) {
      const x = i * stepX;
      const y = 40 - (vital.history[i] / vital.max * 40);
      points.push(`${x},${y}`);
    }

    return points.join(' ');
  }
}
