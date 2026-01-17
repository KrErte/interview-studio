/*
 * Copyright 2025 TASKEXPOSURE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../shared/models/task.model';
import {
  RadarChartComponent,
  RadarDataPoint,
} from '../../shared/components/radar-chart/radar-chart.component';
import { ScoreBarComponent } from '../../shared/components/score-bar/score-bar.component';
import {
  TaskCategory,
  TASK_CATEGORIES,
  mapExposureToCategory,
} from '../../shared/models/persona-archetype.model';
import { CopyService } from '../../core/services/copy.service';

/**
 * 3.6 Breakdown Screen - "The Anatomy"
 *
 * PURPOSE: Show exactly which tasks drive exposure and why.
 * Introduce the three-category framework:
 * - AUTOMATED: AI already does this reliably. Task likely disappears within 1-3 years.
 * - AI-ASSISTED: AI does heavy lifting, human oversight needed.
 * - HUMAN MOAT: Requires trust, accountability, or ambiguity AI cannot handle.
 */
@Component({
  selector: 'app-risk-breakdown',
  standalone: true,
  imports: [CommonModule, RadarChartComponent, ScoreBarComponent],
  templateUrl: './risk-breakdown.component.html',
  styleUrl: './risk-breakdown.component.scss',
})
export class RiskBreakdownComponent {
  private copyService = inject(CopyService);

  @Input() tasks: Task[] = [];
  @Output() continue = new EventEmitter<void>();

  get copy() {
    return this.copyService.riskBreakdownCopy;
  }
  readonly taskCategories = TASK_CATEGORIES;
  expandedTaskIndex: number | null = null;

  get radarData(): RadarDataPoint[] {
    // Create signal-based radar showing exposure patterns
    return [
      { label: 'Routine Density', value: this.getRoutineExposure() },
      { label: 'Decision Ambiguity', value: 100 - this.getAmbiguityScore() },
      { label: 'Trust Dependency', value: 100 - this.getTrustScore() },
      { label: 'Orchestration', value: 100 - this.getOrchestrationScore() },
      { label: 'Accountability', value: 100 - this.getAccountabilityScore() },
    ];
  }

  /**
   * Summary by task category (the new framework)
   */
  get categorySummary(): { automated: number; aiAssisted: number; humanMoat: number } {
    return {
      automated: this.tasks.filter((t) => t.exposure === 'high').length,
      aiAssisted: this.tasks.filter((t) => t.exposure === 'medium').length,
      humanMoat: this.tasks.filter((t) => t.exposure === 'low').length,
    };
  }

  // Legacy getter for backwards compatibility
  get exposureSummary(): { high: number; medium: number; low: number } {
    return {
      high: this.tasks.filter((t) => t.exposure === 'high').length,
      medium: this.tasks.filter((t) => t.exposure === 'medium').length,
      low: this.tasks.filter((t) => t.exposure === 'low').length,
    };
  }

  private getRoutineExposure(): number {
    const highCount = this.tasks.filter((t) => t.exposure === 'high').length;
    return Math.min(100, (highCount / Math.max(this.tasks.length, 1)) * 150);
  }

  private getAmbiguityScore(): number {
    const lowCount = this.tasks.filter((t) => t.exposure === 'low').length;
    return Math.min(100, 30 + (lowCount / Math.max(this.tasks.length, 1)) * 70);
  }

  private getTrustScore(): number {
    const lowCount = this.tasks.filter((t) => t.exposure === 'low').length;
    return Math.min(100, 25 + (lowCount / Math.max(this.tasks.length, 1)) * 60);
  }

  private getOrchestrationScore(): number {
    const mediumCount = this.tasks.filter((t) => t.exposure === 'medium').length;
    return Math.min(100, 35 + (mediumCount / Math.max(this.tasks.length, 1)) * 50);
  }

  private getAccountabilityScore(): number {
    const lowCount = this.tasks.filter((t) => t.exposure === 'low').length;
    return Math.min(100, 40 + (lowCount / Math.max(this.tasks.length, 1)) * 45);
  }

  /**
   * Get the task category for a given exposure level
   */
  getTaskCategory(exposure: Task['exposure']): TaskCategory {
    return mapExposureToCategory(exposure);
  }

  /**
   * Get category info for display
   */
  getCategoryInfo(exposure: Task['exposure']) {
    const category = this.getTaskCategory(exposure);
    return this.taskCategories[category];
  }

  getExposureClass(exposure: Task['exposure']): string {
    return `risk-breakdown__task--${exposure}`;
  }

  getExposureLabelClass(exposure: Task['exposure']): string {
    return `risk-breakdown__exposure-label--${exposure}`;
  }

  getExposureLabel(exposure: 'high' | 'medium' | 'low'): string {
    return this.copy.exposureLabels[exposure];
  }

  getExposurePercentage(exposure: 'high' | 'medium' | 'low'): number {
    if (exposure === 'high') return 85;
    if (exposure === 'medium') return 55;
    return 25;
  }

  toggleTaskExpanded(index: number): void {
    this.expandedTaskIndex = this.expandedTaskIndex === index ? null : index;
  }

  onContinue(): void {
    this.continue.emit();
  }
}
