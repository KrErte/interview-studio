import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

interface SkillDecay {
  skill: string;
  halfLife: number; // months until 50% relevance
  currentRelevance: number; // 0-100
  lastUpdated: string; // "3 months ago"
  decayRate: 'fast' | 'medium' | 'slow';
  renewalAction: string;
}

@Component({
  selector: 'app-skill-decay-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Header -->
      <div class="px-5 pt-5 pb-4 border-b border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative w-10 h-10">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" stroke-width="2" class="text-slate-800"/>
                <circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke="url(#decayGradient)"
                  stroke-width="2"
                  [attr.stroke-dasharray]="overallHealth + ', 100'"
                  stroke-linecap="round"
                  class="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="decayGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#f43f5e"/>
                    <stop offset="50%" stop-color="#f59e0b"/>
                    <stop offset="100%" stop-color="#10b981"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Skill Decay Clock</h3>
              <p class="text-xs text-slate-500">How long until your skills lose relevance</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-mono font-bold" [ngClass]="overallHealthColor">{{ overallHealth }}%</div>
            <div class="text-[10px] text-slate-500 uppercase">skill freshness</div>
          </div>
        </div>
      </div>

      <!-- Skills grid -->
      <div class="p-5 space-y-3">
        <div *ngFor="let skill of skills; let i = index" class="relative">
          <div
            class="p-4 rounded-xl border transition-all duration-300"
            [ngClass]="getSkillClasses(skill)"
          >
            <div class="flex items-start justify-between gap-4">
              <!-- Skill info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-white">{{ skill.skill }}</span>
                  <span
                    class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded"
                    [ngClass]="getDecayBadgeClasses(skill.decayRate)"
                  >
                    {{ skill.decayRate }} decay
                  </span>
                </div>
                <p class="text-xs text-slate-400">Last practiced: {{ skill.lastUpdated }}</p>
              </div>

              <!-- Countdown timer style display -->
              <div class="text-right">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-mono font-bold" [ngClass]="getRelevanceColor(skill)">
                    {{ skill.halfLife }}
                  </span>
                  <span class="text-xs text-slate-500">mo</span>
                </div>
                <div class="text-[10px] text-slate-500">half-life</div>
              </div>
            </div>

            <!-- Decay visualization -->
            <div class="mt-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[10px] text-slate-500">Current relevance</span>
                <span class="text-xs font-mono" [ngClass]="getRelevanceColor(skill)">{{ skill.currentRelevance }}%</span>
              </div>
              <div class="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <!-- Decay gradient background -->
                <div class="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-20"></div>
                <!-- Current level -->
                <div
                  class="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  [ngClass]="getRelevanceBarColor(skill)"
                  [style.width.%]="skill.currentRelevance"
                ></div>
                <!-- Decay projection line -->
                <div
                  class="absolute top-0 bottom-0 w-0.5 bg-white/50 transition-all duration-500"
                  [style.left.%]="getProjectedRelevance(skill)"
                ></div>
              </div>
              <div class="flex justify-between mt-1 text-[9px] text-slate-600">
                <span>Obsolete</span>
                <span class="text-slate-400">↓ in 6mo</span>
                <span>Current</span>
              </div>
            </div>

            <!-- Renewal action -->
            <div class="mt-3 flex items-center justify-between p-2 rounded-lg bg-slate-900/50">
              <span class="text-xs text-slate-400">{{ skill.renewalAction }}</span>
              <button class="text-xs font-medium text-emerald-400 hover:text-emerald-300">
                Renew →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="px-5 py-4 border-t border-slate-800">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
              <span class="text-xs text-slate-400">{{ criticalCount }} critical</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-amber-500"></div>
              <span class="text-xs text-slate-400">{{ warningCount }} warning</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span class="text-xs text-slate-400">{{ healthyCount }} healthy</span>
            </div>
          </div>
          <button class="text-xs font-medium text-violet-400 hover:text-violet-300">
            Renewal Plan →
          </button>
        </div>
      </div>
    </div>
  `
})
export class SkillDecayClockComponent implements OnInit {
  @Input() skills: SkillDecay[] = [
    {
      skill: 'React/TypeScript',
      halfLife: 18,
      currentRelevance: 85,
      lastUpdated: '2 weeks ago',
      decayRate: 'medium',
      renewalAction: 'Build a project with React 19 features'
    },
    {
      skill: 'SQL Optimization',
      halfLife: 24,
      currentRelevance: 70,
      lastUpdated: '2 months ago',
      decayRate: 'slow',
      renewalAction: 'Practice advanced query optimization'
    },
    {
      skill: 'REST API Design',
      halfLife: 12,
      currentRelevance: 60,
      lastUpdated: '4 months ago',
      decayRate: 'medium',
      renewalAction: 'Learn GraphQL and gRPC patterns'
    },
    {
      skill: 'Unit Testing',
      halfLife: 8,
      currentRelevance: 45,
      lastUpdated: '6 months ago',
      decayRate: 'fast',
      renewalAction: 'Adopt AI-assisted testing tools'
    },
    {
      skill: 'Manual Deployment',
      halfLife: 4,
      currentRelevance: 25,
      lastUpdated: '8 months ago',
      decayRate: 'fast',
      renewalAction: 'Replace with CI/CD automation'
    }
  ];

  ngOnInit(): void {}

  get overallHealth(): number {
    if (!this.skills.length) return 0;
    return Math.round(this.skills.reduce((sum, s) => sum + s.currentRelevance, 0) / this.skills.length);
  }

  get overallHealthColor(): string {
    const health = this.overallHealth;
    if (health >= 70) return 'text-emerald-400';
    if (health >= 50) return 'text-amber-400';
    return 'text-rose-400';
  }

  get criticalCount(): number {
    return this.skills.filter(s => s.currentRelevance < 40).length;
  }

  get warningCount(): number {
    return this.skills.filter(s => s.currentRelevance >= 40 && s.currentRelevance < 70).length;
  }

  get healthyCount(): number {
    return this.skills.filter(s => s.currentRelevance >= 70).length;
  }

  getSkillClasses(skill: SkillDecay): string {
    if (skill.currentRelevance < 40) {
      return 'border-rose-500/30 bg-rose-500/5';
    }
    if (skill.currentRelevance < 70) {
      return 'border-amber-500/30 bg-amber-500/5';
    }
    return 'border-emerald-500/30 bg-emerald-500/5';
  }

  getDecayBadgeClasses(rate: SkillDecay['decayRate']): string {
    switch (rate) {
      case 'fast': return 'bg-rose-500/20 text-rose-300';
      case 'medium': return 'bg-amber-500/20 text-amber-300';
      case 'slow': return 'bg-emerald-500/20 text-emerald-300';
    }
  }

  getRelevanceColor(skill: SkillDecay): string {
    if (skill.currentRelevance < 40) return 'text-rose-400';
    if (skill.currentRelevance < 70) return 'text-amber-400';
    return 'text-emerald-400';
  }

  getRelevanceBarColor(skill: SkillDecay): string {
    if (skill.currentRelevance < 40) return 'bg-rose-500';
    if (skill.currentRelevance < 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  getProjectedRelevance(skill: SkillDecay): number {
    // Project 6 months into future using half-life decay
    const monthsProjected = 6;
    const decayFactor = Math.pow(0.5, monthsProjected / skill.halfLife);
    return Math.max(0, skill.currentRelevance * decayFactor);
  }
}
