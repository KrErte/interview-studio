import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

export interface ThreatVector {
  id: string;
  label: string;
  severity: number; // 0-100
  category: 'automation' | 'outsourcing' | 'obsolescence' | 'competition';
  eta: string; // "6 months", "2 years", etc.
  description: string;
}

@Component({
  selector: 'app-threat-radar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Scanning overlay effect -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          class="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent"
          [style.transform]="'translateY(' + scanPosition + '%)'"
          [style.transition]="scanning ? 'transform 2s linear' : 'none'"
        ></div>
      </div>

      <!-- Grid lines -->
      <div class="absolute inset-0 pointer-events-none">
        <svg class="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="threat-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(71, 85, 105, 0.3)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#threat-grid)" />
        </svg>
      </div>

      <!-- Header -->
      <div class="relative z-10 px-5 pt-5 pb-3 border-b border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-3 h-3 rounded-full" [ngClass]="statusColor"></div>
              <div class="absolute inset-0 rounded-full animate-ping" [ngClass]="statusColor" style="animation-duration: 2s;"></div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-100 uppercase tracking-wider">Career Threat Radar</h3>
              <p class="text-xs text-slate-500">Real-time vulnerability scan</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-mono font-bold" [ngClass]="threatLevelColor">{{ overallThreat }}%</div>
            <div class="text-[10px] uppercase tracking-wide text-slate-500">threat level</div>
          </div>
        </div>
      </div>

      <!-- Radar visualization -->
      <div class="relative z-10 p-5">
        <div class="grid gap-2">
          <div
            *ngFor="let threat of sortedThreats; let i = index"
            class="group relative"
            [style.animation-delay]="i * 100 + 'ms'"
          >
            <!-- Threat row -->
            <div
              class="relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer"
              [ngClass]="getThreatRowClasses(threat)"
              (click)="selectThreat(threat)"
            >
              <!-- Severity indicator -->
              <div class="flex-shrink-0 w-12 h-12 relative">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="text-slate-800"
                  />
                  <circle
                    cx="18" cy="18" r="16"
                    fill="none"
                    [attr.stroke]="getThreatStrokeColor(threat)"
                    stroke-width="2"
                    [attr.stroke-dasharray]="threat.severity + ', 100'"
                    stroke-linecap="round"
                    class="transition-all duration-500"
                  />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-xs font-bold" [ngClass]="getThreatTextColor(threat)">{{ threat.severity }}</span>
                </div>
              </div>

              <!-- Threat info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-slate-100">{{ threat.label }}</span>
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded"
                    [ngClass]="getCategoryClasses(threat.category)"
                  >
                    {{ threat.category }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 truncate">{{ threat.description }}</p>
              </div>

              <!-- ETA -->
              <div class="flex-shrink-0 text-right">
                <div class="text-xs font-mono text-slate-300">{{ threat.eta }}</div>
                <div class="text-[10px] text-slate-500 uppercase">until impact</div>
              </div>

              <!-- Blip animation for high severity -->
              <div
                *ngIf="threat.severity >= 70"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2"
              >
                <div class="absolute inset-0 rounded-full bg-rose-500 animate-ping"></div>
                <div class="absolute inset-0 rounded-full bg-rose-500"></div>
              </div>
            </div>

            <!-- Expanded details -->
            <div
              *ngIf="selectedThreat?.id === threat.id"
              class="mt-2 p-4 rounded-lg bg-slate-900/80 border border-slate-700 animate-fadeIn"
            >
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">Automation Probability</span>
                  <div class="mt-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-700"
                      [ngClass]="getThreatBarColor(threat)"
                      [style.width.%]="threat.severity"
                    ></div>
                  </div>
                </div>
                <div>
                  <span class="text-slate-500">Market Readiness</span>
                  <div class="mt-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-cyan-500 rounded-full transition-all duration-700"
                      [style.width.%]="100 - threat.severity"
                    ></div>
                  </div>
                </div>
              </div>
              <p class="mt-3 text-xs text-slate-400">
                {{ getDetailedAnalysis(threat) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer scan status -->
      <div class="relative z-10 px-5 py-3 border-t border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Scanning {{ threatCount }} threat vectors</span>
        </div>
        <button
          class="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          (click)="rescan()"
        >
          Rescan Now
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class ThreatRadarComponent implements OnInit, OnDestroy {
  @Input() threats: ThreatVector[] = [];

  selectedThreat: ThreatVector | null = null;
  scanPosition = -100;
  scanning = false;
  private scanInterval: any;

  ngOnInit(): void {
    this.startScanning();
  }

  ngOnDestroy(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }

  get sortedThreats(): ThreatVector[] {
    return [...this.threats].sort((a, b) => b.severity - a.severity);
  }

  get overallThreat(): number {
    if (!this.threats.length) return 0;
    const sum = this.threats.reduce((acc, t) => acc + t.severity, 0);
    return Math.round(sum / this.threats.length);
  }

  get threatCount(): number {
    return this.threats.length;
  }

  get statusColor(): string {
    const threat = this.overallThreat;
    if (threat >= 70) return 'bg-rose-500';
    if (threat >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  get threatLevelColor(): string {
    const threat = this.overallThreat;
    if (threat >= 70) return 'text-rose-400';
    if (threat >= 50) return 'text-amber-400';
    return 'text-emerald-400';
  }

  selectThreat(threat: ThreatVector): void {
    this.selectedThreat = this.selectedThreat?.id === threat.id ? null : threat;
  }

  startScanning(): void {
    this.runScan();
    this.scanInterval = setInterval(() => this.runScan(), 4000);
  }

  runScan(): void {
    this.scanPosition = -100;
    this.scanning = false;

    setTimeout(() => {
      this.scanning = true;
      this.scanPosition = 200;
    }, 50);
  }

  rescan(): void {
    this.runScan();
  }

  getThreatRowClasses(threat: ThreatVector): string {
    const isSelected = this.selectedThreat?.id === threat.id;
    const base = isSelected
      ? 'border-emerald-500/50 bg-emerald-500/5'
      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80';
    return base;
  }

  getThreatStrokeColor(threat: ThreatVector): string {
    if (threat.severity >= 70) return '#f43f5e';
    if (threat.severity >= 50) return '#f59e0b';
    if (threat.severity >= 30) return '#06b6d4';
    return '#10b981';
  }

  getThreatTextColor(threat: ThreatVector): string {
    if (threat.severity >= 70) return 'text-rose-400';
    if (threat.severity >= 50) return 'text-amber-400';
    if (threat.severity >= 30) return 'text-cyan-400';
    return 'text-emerald-400';
  }

  getThreatBarColor(threat: ThreatVector): string {
    if (threat.severity >= 70) return 'bg-rose-500';
    if (threat.severity >= 50) return 'bg-amber-500';
    if (threat.severity >= 30) return 'bg-cyan-500';
    return 'bg-emerald-500';
  }

  getCategoryClasses(category: ThreatVector['category']): string {
    switch (category) {
      case 'automation':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'outsourcing':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'obsolescence':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'competition':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    }
  }

  getDetailedAnalysis(threat: ThreatVector): string {
    const analyses: Record<ThreatVector['category'], string> = {
      automation: `AI systems are increasingly capable of handling ${threat.label.toLowerCase()}. Current models show ${threat.severity}% task coverage with improving accuracy each quarter.`,
      outsourcing: `Global talent pools now offer ${threat.label.toLowerCase()} at 60-80% cost reduction. Remote-first tools accelerate this trend.`,
      obsolescence: `Technology shifts are making traditional ${threat.label.toLowerCase()} approaches less relevant. New paradigms require different skill sets.`,
      competition: `Market saturation in ${threat.label.toLowerCase()} is increasing. Differentiation requires advanced specialization or hybrid skills.`
    };
    return analyses[threat.category];
  }
}
