import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoadmapResponse, RoadmapDuration, RoadmapItem, RoadmapCheckpoint } from '../../../core/models/risk.models';

@Component({
  selector: 'app-roadmap-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Header with Duration Selector -->
      <div class="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 class="text-emerald-400 text-sm font-semibold tracking-wide uppercase mb-4">
          Improvement Roadmap
        </h3>

        <!-- Duration Selector -->
        <div class="flex items-center space-x-3 mb-4">
          <span class="text-slate-400 text-sm font-medium">Timeline:</span>
          <div class="flex space-x-2">
            <button
              *ngFor="let option of durationOptions"
              (click)="selectDuration(option.value)"
              [disabled]="loading"
              class="px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              [ngClass]="{
                'bg-emerald-500 text-slate-950': selectedDuration === option.value,
                'bg-slate-800 text-slate-300 hover:bg-slate-700': selectedDuration !== option.value
              }">
              {{ option.label }}
            </button>
          </div>
        </div>

        <!-- Summary -->
        <p *ngIf="roadmap?.summary" class="text-slate-300 text-sm leading-relaxed">
          {{ roadmap.summary }}
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p class="text-slate-400 mt-4">Generating personalized roadmap...</p>
      </div>

      <!-- Roadmap Items -->
      <div *ngIf="!loading && roadmap" class="space-y-4">
        <div
          *ngFor="let item of roadmap.items; let i = index"
          class="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors">
          <!-- Item Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                  {{ item.day ? 'D' + item.day : 'W' + item.week }}
                </span>
                <h4 class="text-slate-100 text-lg font-semibold">
                  {{ item.title }}
                </h4>
              </div>
              <p class="text-slate-400 text-sm">
                {{ item.description }}
              </p>
            </div>
          </div>

          <!-- Tasks -->
          <div *ngIf="item.tasks && item.tasks.length > 0" class="mb-4">
            <h5 class="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-2">
              Tasks
            </h5>
            <ul class="space-y-2">
              <li
                *ngFor="let task of item.tasks"
                class="flex items-start space-x-2 text-slate-300 text-sm">
                <svg class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                <span>{{ task }}</span>
              </li>
            </ul>
          </div>

          <!-- Checkpoints -->
          <div *ngIf="item.checkpoints && item.checkpoints.length > 0">
            <h5 class="text-slate-300 text-xs font-semibold uppercase tracking-wide mb-3">
              Checkpoints
            </h5>
            <div class="space-y-3">
              <div
                *ngFor="let checkpoint of item.checkpoints"
                class="flex items-start space-x-3 p-3 bg-slate-950 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  [checked]="checkpoint.completed"
                  (change)="toggleCheckpoint(item.id, checkpoint.id)"
                  class="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 mt-0.5 cursor-pointer">
                <div class="flex-1">
                  <p class="text-slate-200 text-sm font-medium">
                    {{ checkpoint.title }}
                  </p>
                  <p class="text-slate-500 text-xs mt-1">
                    {{ checkpoint.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Indicator -->
          <div *ngIf="getItemProgress(item) !== null" class="mt-4 pt-4 border-t border-slate-800">
            <div class="flex items-center justify-between text-xs mb-2">
              <span class="text-slate-400">Progress</span>
              <span class="text-emerald-400 font-semibold">
                {{ getItemProgress(item) }}%
              </span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full bg-emerald-500 transition-all duration-300"
                [style.width.%]="getItemProgress(item)">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div *ngIf="!loading && roadmap" class="flex items-center justify-between pt-4">
        <button
          (click)="restartFlow.emit()"
          class="px-6 py-2.5 text-slate-400 hover:text-slate-300 font-medium transition-colors">
          Start New Assessment
        </button>

        <button
          class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span>Export Roadmap</span>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class RoadmapPanelComponent {
  @Input() roadmap: RoadmapResponse | null = null;
  @Input() loading: boolean = false;
  @Input() selectedDuration: RoadmapDuration = RoadmapDuration.SEVEN_DAYS;

  @Output() durationChange = new EventEmitter<RoadmapDuration>();
  @Output() restartFlow = new EventEmitter<void>();

  durationOptions = [
    { label: '7 Days', value: RoadmapDuration.SEVEN_DAYS },
    { label: '30 Days', value: RoadmapDuration.THIRTY_DAYS },
    { label: '90 Days', value: RoadmapDuration.NINETY_DAYS }
  ];

  selectDuration(duration: RoadmapDuration): void {
    if (duration !== this.selectedDuration && !this.loading) {
      this.selectedDuration = duration;
      this.durationChange.emit(duration);
    }
  }

  toggleCheckpoint(itemId: string, checkpointId: string): void {
    if (!this.roadmap) return;

    // Find and toggle the checkpoint
    const item = this.roadmap.items.find(i => i.id === itemId);
    if (item) {
      const checkpoint = item.checkpoints.find(c => c.id === checkpointId);
      if (checkpoint) {
        checkpoint.completed = !checkpoint.completed;
      }
    }
  }

  getItemProgress(item: RoadmapItem): number | null {
    if (!item.checkpoints || item.checkpoints.length === 0) {
      return null;
    }

    const completed = item.checkpoints.filter(c => c.completed).length;
    return Math.round((completed / item.checkpoints.length) * 100);
  }
}
