import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentResult, RiskLevel, AssessmentWeakness, RiskSignal } from '../../../core/models/risk.models';

@Component({
  selector: 'app-snapshot-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Risk Score Card -->
      <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 class="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-6">
          Risk Assessment
        </h3>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Risk Percentage -->
          <div class="space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-slate-400 text-sm font-medium">Market Risk</span>
              <span class="text-3xl font-bold" [ngClass]="riskColorClass">
                {{ assessment?.riskPercent }}%
              </span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                [ngClass]="riskBarColorClass"
                [style.width.%]="assessment?.riskPercent">
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                [ngClass]="riskBadgeClass">
                {{ assessment?.riskBand }}
              </span>
              <span class="text-slate-500 text-xs">
                {{ riskDescription }}
              </span>
            </div>
          </div>

          <!-- Confidence -->
          <div class="space-y-3">
            <div class="flex items-baseline justify-between">
              <span class="text-slate-400 text-sm font-medium">Confidence</span>
              <span class="text-3xl font-bold text-emerald-400">
                {{ assessment?.confidence }}%
              </span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                class="h-full bg-emerald-500 transition-all duration-500"
                [style.width.%]="assessment?.confidence">
              </div>
            </div>
            <p class="text-slate-500 text-xs">
              Based on {{ assessment?.confidence >= 80 ? 'comprehensive' : assessment?.confidence >= 70 ? 'good' : 'partial' }} data analysis
            </p>
          </div>
        </div>
      </div>

      <!-- Weaknesses (Top 3) -->
      <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 class="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-4">
          Key Weaknesses
        </h3>
        <div class="space-y-4">
          <div
            *ngFor="let weakness of topWeaknesses; let i = index"
            class="border-l-4 pl-4 py-2"
            [ngClass]="{
              'border-rose-500': weakness.severity === 'high',
              'border-amber-500': weakness.severity === 'medium',
              'border-slate-600': weakness.severity === 'low'
            }">
            <div class="flex items-start justify-between mb-1">
              <h4 class="text-slate-200 font-medium text-sm">
                {{ i + 1 }}. {{ weakness.title }}
              </h4>
              <span
                class="text-xs px-2 py-0.5 rounded uppercase font-semibold ml-2 flex-shrink-0"
                [ngClass]="{
                  'bg-rose-500/20 text-rose-400': weakness.severity === 'high',
                  'bg-amber-500/20 text-amber-400': weakness.severity === 'medium',
                  'bg-slate-600/20 text-slate-400': weakness.severity === 'low'
                }">
                {{ weakness.severity }}
              </span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">
              {{ weakness.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Risk Signals -->
      <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 class="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-4">
          Risk Signals
        </h3>
        <div class="space-y-4">
          <div *ngFor="let signal of assessment?.signals" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-slate-200 text-sm font-medium">
                {{ signal.label }}
              </span>
              <div class="flex items-center space-x-2">
                <span class="text-slate-400 text-sm">
                  {{ signal.score }}/100
                </span>
                <span
                  class="text-xs px-2 py-0.5 rounded uppercase font-semibold"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-400': signal.level === 'LOW',
                    'bg-amber-500/20 text-amber-400': signal.level === 'MEDIUM',
                    'bg-rose-500/20 text-rose-400': signal.level === 'HIGH'
                  }">
                  {{ signal.level }}
                </span>
              </div>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                class="h-full transition-all duration-500"
                [ngClass]="{
                  'bg-emerald-500': signal.level === 'LOW',
                  'bg-amber-500': signal.level === 'MEDIUM',
                  'bg-rose-500': signal.level === 'HIGH'
                }"
                [style.width.%]="signal.score">
              </div>
            </div>
            <p *ngIf="signal.description" class="text-slate-500 text-xs">
              {{ signal.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex justify-center pt-4">
        <button
          (click)="generateRoadmap.emit()"
          [disabled]="loading"
          class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
          <span *ngIf="!loading">Generate Roadmap to Improve</span>
          <span *ngIf="loading" class="flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </span>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class SnapshotCardComponent {
  @Input() assessment: AssessmentResult | null = null;
  @Input() loading: boolean = false;

  @Output() generateRoadmap = new EventEmitter<void>();

  get topWeaknesses(): AssessmentWeakness[] {
    return this.assessment?.weaknesses?.slice(0, 3) || [];
  }

  get riskColorClass(): string {
    if (!this.assessment) return 'text-slate-400';

    switch (this.assessment.riskBand) {
      case RiskLevel.LOW:
        return 'text-emerald-400';
      case RiskLevel.MEDIUM:
        return 'text-amber-400';
      case RiskLevel.HIGH:
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  }

  get riskBarColorClass(): string {
    if (!this.assessment) return 'bg-slate-600';

    switch (this.assessment.riskBand) {
      case RiskLevel.LOW:
        return 'bg-emerald-500';
      case RiskLevel.MEDIUM:
        return 'bg-amber-500';
      case RiskLevel.HIGH:
        return 'bg-rose-500';
      default:
        return 'bg-slate-600';
    }
  }

  get riskBadgeClass(): string {
    if (!this.assessment) return 'bg-slate-600/20 text-slate-400';

    switch (this.assessment.riskBand) {
      case RiskLevel.LOW:
        return 'bg-emerald-500/20 text-emerald-400';
      case RiskLevel.MEDIUM:
        return 'bg-amber-500/20 text-amber-400';
      case RiskLevel.HIGH:
        return 'bg-rose-500/20 text-rose-400';
      default:
        return 'bg-slate-600/20 text-slate-400';
    }
  }

  get riskDescription(): string {
    if (!this.assessment) return '';

    switch (this.assessment.riskBand) {
      case RiskLevel.LOW:
        return 'Strong market position';
      case RiskLevel.MEDIUM:
        return 'Moderate improvement needed';
      case RiskLevel.HIGH:
        return 'Significant action required';
      default:
        return '';
    }
  }
}
