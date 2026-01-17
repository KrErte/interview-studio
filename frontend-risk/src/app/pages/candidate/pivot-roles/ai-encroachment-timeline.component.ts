import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

export interface AIMilestone {
  year: number;
  capability: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100
  status: 'past' | 'imminent' | 'projected';
  affectedTasks: string[];
}

@Component({
  selector: 'app-ai-encroachment-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Header -->
      <div class="relative px-5 pt-5 pb-4 border-b border-slate-800 overflow-hidden">
        <!-- Animated background -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-transparent to-emerald-500/20 animate-pulse"></div>
        </div>

        <div class="relative flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">AI Capability Timeline</h3>
            </div>
            <p class="text-xs text-slate-500 mt-2">When AI will match human capability in your role's core tasks</p>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-500">Current Year</div>
            <div class="text-2xl font-mono font-bold text-white">{{ currentYear }}</div>
          </div>
        </div>
      </div>

      <!-- Timeline visualization -->
      <div class="p-5">
        <!-- Year markers -->
        <div class="relative">
          <!-- Timeline track -->
          <div class="absolute top-6 left-0 right-0 h-1 bg-slate-800 rounded-full"></div>

          <!-- Progress indicator (past to now) -->
          <div
            class="absolute top-6 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-1000"
            [style.width.%]="progressToNow"
          ></div>

          <!-- Current year marker -->
          <div
            class="absolute top-4 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/30 z-10"
            [style.left.%]="progressToNow"
            [style.transform]="'translateX(-50%)'"
          >
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-emerald-400 whitespace-nowrap">NOW</div>
          </div>

          <!-- Year labels -->
          <div class="flex justify-between pt-10 text-xs text-slate-500 font-mono">
            <span>{{ timelineStart }}</span>
            <span>{{ Math.floor((timelineStart + timelineEnd) / 2) }}</span>
            <span>{{ timelineEnd }}</span>
          </div>
        </div>

        <!-- Milestones -->
        <div class="mt-8 space-y-3">
          <div
            *ngFor="let milestone of sortedMilestones; let i = index"
            class="group relative"
            [style.animation-delay]="i * 100 + 'ms'"
          >
            <div
              class="flex items-stretch gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer"
              [ngClass]="getMilestoneClasses(milestone)"
              (click)="selectMilestone(milestone)"
            >
              <!-- Year badge -->
              <div class="flex-shrink-0 w-20 flex flex-col items-center justify-center rounded-lg p-2"
                   [ngClass]="getYearBadgeClasses(milestone)">
                <span class="text-xl font-mono font-bold">{{ milestone.year }}</span>
                <span class="text-[9px] uppercase tracking-wide mt-0.5" [ngClass]="getStatusTextClasses(milestone)">
                  {{ milestone.status }}
                </span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h4 class="text-sm font-semibold text-white">{{ milestone.capability }}</h4>
                    <p class="text-xs text-slate-400 mt-1">{{ milestone.description }}</p>
                  </div>
                  <div class="flex-shrink-0 text-right">
                    <div class="text-sm font-mono" [ngClass]="getProbabilityColor(milestone.probability)">
                      {{ milestone.probability }}%
                    </div>
                    <div class="text-[9px] text-slate-500 uppercase">probability</div>
                  </div>
                </div>

                <!-- Affected tasks pills -->
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span
                    *ngFor="let task of milestone.affectedTasks.slice(0, 3)"
                    class="px-2 py-0.5 text-[10px] rounded-full border"
                    [ngClass]="getImpactPillClasses(milestone.impact)"
                  >
                    {{ task }}
                  </span>
                  <span
                    *ngIf="milestone.affectedTasks.length > 3"
                    class="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-400"
                  >
                    +{{ milestone.affectedTasks.length - 3 }} more
                  </span>
                </div>
              </div>

              <!-- Impact indicator -->
              <div class="flex-shrink-0 flex items-center">
                <div class="flex flex-col items-center gap-1">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    [ngClass]="getImpactCircleClasses(milestone.impact)"
                  >
                    {{ getImpactIcon(milestone.impact) }}
                  </div>
                  <span class="text-[9px] uppercase tracking-wide" [ngClass]="getImpactTextClasses(milestone.impact)">
                    {{ milestone.impact }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Expanded details -->
            <div
              *ngIf="selectedMilestone?.year === milestone.year"
              class="mt-2 p-4 rounded-lg bg-slate-900/80 border border-slate-700 animate-fadeIn"
            >
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h5 class="text-xs text-slate-500 uppercase mb-2">Tasks at Risk</h5>
                  <ul class="space-y-1">
                    <li
                      *ngFor="let task of milestone.affectedTasks"
                      class="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getImpactDotClasses(milestone.impact)"></span>
                      {{ task }}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 class="text-xs text-slate-500 uppercase mb-2">Preparation Window</h5>
                  <div class="text-2xl font-mono font-bold text-white">{{ getTimeUntil(milestone) }}</div>
                  <p class="text-xs text-slate-400 mt-2">{{ getPreparationAdvice(milestone) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary footer -->
      <div class="px-5 py-4 border-t border-slate-800 bg-gradient-to-r from-slate-900/50 to-transparent">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <div>
              <span class="text-xs text-slate-500">Next Critical Milestone</span>
              <div class="text-sm font-semibold text-white">{{ nextCriticalMilestone?.capability || 'None projected' }}</div>
            </div>
            <div class="h-8 w-px bg-slate-800"></div>
            <div>
              <span class="text-xs text-slate-500">Time to Prepare</span>
              <div class="text-sm font-mono font-semibold" [ngClass]="getTimeColor(nextCriticalMilestone)">
                {{ nextCriticalMilestone ? getTimeUntil(nextCriticalMilestone) : '—' }}
              </div>
            </div>
          </div>
          <button
            class="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-sm font-medium text-violet-400 hover:bg-violet-500/20 transition-colors"
            (click)="onViewRoadmap.emit()"
          >
            View Adaptation Roadmap →
          </button>
        </div>
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
export class AIEncroachmentTimelineComponent implements OnInit {
  @Input() milestones: AIMilestone[] = [];
  @Input() role = 'Your Role';
  @Output() onViewRoadmap = new EventEmitter<void>();

  selectedMilestone: AIMilestone | null = null;
  currentYear = new Date().getFullYear();
  Math = Math;

  ngOnInit(): void {}

  get sortedMilestones(): AIMilestone[] {
    return [...this.milestones].sort((a, b) => a.year - b.year);
  }

  get timelineStart(): number {
    if (!this.milestones.length) return this.currentYear - 2;
    return Math.min(...this.milestones.map(m => m.year), this.currentYear - 1);
  }

  get timelineEnd(): number {
    if (!this.milestones.length) return this.currentYear + 5;
    return Math.max(...this.milestones.map(m => m.year), this.currentYear + 3);
  }

  get progressToNow(): number {
    const range = this.timelineEnd - this.timelineStart;
    const progress = this.currentYear - this.timelineStart;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  }

  get nextCriticalMilestone(): AIMilestone | null {
    return this.sortedMilestones.find(m =>
      m.year >= this.currentYear && (m.impact === 'critical' || m.impact === 'high')
    ) || null;
  }

  selectMilestone(milestone: AIMilestone): void {
    this.selectedMilestone = this.selectedMilestone?.year === milestone.year ? null : milestone;
  }

  getMilestoneClasses(milestone: AIMilestone): string {
    const isSelected = this.selectedMilestone?.year === milestone.year;
    if (isSelected) {
      return 'border-violet-500/50 bg-violet-500/10';
    }
    if (milestone.status === 'past') {
      return 'border-slate-700 bg-slate-900/30 opacity-60';
    }
    if (milestone.status === 'imminent') {
      return 'border-amber-500/30 bg-amber-500/5';
    }
    return 'border-slate-800 bg-slate-900/50 hover:border-slate-700';
  }

  getYearBadgeClasses(milestone: AIMilestone): string {
    if (milestone.status === 'past') return 'bg-slate-800/50';
    if (milestone.status === 'imminent') return 'bg-amber-500/20';
    return 'bg-slate-800';
  }

  getStatusTextClasses(milestone: AIMilestone): string {
    if (milestone.status === 'past') return 'text-slate-500';
    if (milestone.status === 'imminent') return 'text-amber-400';
    return 'text-slate-400';
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 80) return 'text-rose-400';
    if (probability >= 60) return 'text-amber-400';
    return 'text-emerald-400';
  }

  getImpactCircleClasses(impact: AIMilestone['impact']): string {
    switch (impact) {
      case 'critical': return 'bg-rose-500/20 text-rose-400';
      case 'high': return 'bg-amber-500/20 text-amber-400';
      case 'medium': return 'bg-cyan-500/20 text-cyan-400';
      case 'low': return 'bg-emerald-500/20 text-emerald-400';
    }
  }

  getImpactTextClasses(impact: AIMilestone['impact']): string {
    switch (impact) {
      case 'critical': return 'text-rose-400';
      case 'high': return 'text-amber-400';
      case 'medium': return 'text-cyan-400';
      case 'low': return 'text-emerald-400';
    }
  }

  getImpactPillClasses(impact: AIMilestone['impact']): string {
    switch (impact) {
      case 'critical': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'high': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'medium': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'low': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  }

  getImpactDotClasses(impact: AIMilestone['impact']): string {
    switch (impact) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-cyan-500';
      case 'low': return 'bg-emerald-500';
    }
  }

  getImpactIcon(impact: AIMilestone['impact']): string {
    switch (impact) {
      case 'critical': return '⚠️';
      case 'high': return '⚡';
      case 'medium': return '◐';
      case 'low': return '○';
    }
  }

  getTimeUntil(milestone: AIMilestone): string {
    const years = milestone.year - this.currentYear;
    if (years <= 0) return 'Now';
    if (years === 1) return '1 year';
    return `${years} years`;
  }

  getTimeColor(milestone: AIMilestone | null): string {
    if (!milestone) return 'text-slate-400';
    const years = milestone.year - this.currentYear;
    if (years <= 1) return 'text-rose-400';
    if (years <= 3) return 'text-amber-400';
    return 'text-emerald-400';
  }

  getPreparationAdvice(milestone: AIMilestone): string {
    const years = milestone.year - this.currentYear;
    if (years <= 0) return 'Immediate adaptation required. Focus on complementary skills.';
    if (years <= 2) return 'Begin upskilling now. Consider adjacent role transitions.';
    if (years <= 4) return 'Time to develop hybrid capabilities. Build AI collaboration skills.';
    return 'Early preparation window. Monitor trends and plan strategically.';
  }
}
