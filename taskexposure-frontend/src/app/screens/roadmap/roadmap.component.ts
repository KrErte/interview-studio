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
import { RoadmapAction } from '../../shared/models/roadmap-action.model';
import { CopyService } from '../../core/services/copy.service';

/**
 * Action category from the Persona Engine spec.
 * Each action is categorized based on which transformation it enables.
 */
type ActionCategory = 'delegate-to-ai' | 'elevate-role' | 'amplify-moat';

interface ActionWithState extends RoadmapAction {
  completed: boolean;
  impactScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: ActionCategory;
}

/**
 * 3.7 Roadmap Screen - "The Path Forward"
 *
 * PURPOSE: Transform analysis into action.
 * Frame changes as identity evolution, not task-level fixes.
 *
 * ACTION CATEGORIES:
 * - Delegate to AI: Tasks you still do manually that AI handles well
 * - Elevate Your Role: Move from executor to orchestrator
 * - Amplify Your Moat: Expand and deepen human-exclusive work
 */
@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roadmap.component.html',
  styleUrl: './roadmap.component.scss',
})
export class RoadmapComponent {
  private copyService = inject(CopyService);

  @Input() set actions(value: RoadmapAction[]) {
    this.actionsWithState = value.map((action, index) => ({
      ...action,
      completed: false,
      impactScore: this.calculateImpactScore(index),
      difficulty: this.calculateDifficulty(index),
      category: this.deriveCategory(action, index),
    }));
  }
  @Output() continue = new EventEmitter<void>();

  get copy() {
    return this.copyService.roadmapCopy;
  }
  actionsWithState: ActionWithState[] = [];
  celebratingIndex: number | null = null;

  get completedCount(): number {
    return this.actionsWithState.filter((a) => a.completed).length;
  }

  get committedActions(): ActionWithState[] {
    return this.actionsWithState.filter((a) => a.completed);
  }

  get totalImpact(): number {
    return this.actionsWithState
      .filter((a) => a.completed)
      .reduce((sum, a) => sum + a.impactScore, 0);
  }

  get potentialImpact(): number {
    return this.actionsWithState.reduce((sum, a) => sum + a.impactScore, 0);
  }

  get progressPercentage(): number {
    if (this.actionsWithState.length === 0) return 0;
    return (this.completedCount / this.actionsWithState.length) * 100;
  }

  /**
   * Group actions by category for display
   */
  get actionsByCategory(): Map<ActionCategory, ActionWithState[]> {
    const grouped = new Map<ActionCategory, ActionWithState[]>();
    grouped.set('delegate-to-ai', []);
    grouped.set('elevate-role', []);
    grouped.set('amplify-moat', []);

    for (const action of this.actionsWithState) {
      const list = grouped.get(action.category) || [];
      list.push(action);
      grouped.set(action.category, list);
    }

    return grouped;
  }

  private calculateImpactScore(index: number): number {
    // First actions have higher impact
    return Math.max(5, 15 - index * 3);
  }

  private calculateDifficulty(index: number): 'easy' | 'medium' | 'hard' {
    if (index === 0) return 'easy';
    if (index < 3) return 'medium';
    return 'hard';
  }

  /**
   * Derive action category based on action content.
   * TODO: Backend should provide this categorization based on task analysis.
   */
  private deriveCategory(action: RoadmapAction, index: number): ActionCategory {
    // Simple heuristic - in production, backend should provide this
    const description = action.description.toLowerCase();

    if (
      description.includes('automat') ||
      description.includes('ai tool') ||
      description.includes('delegate') ||
      description.includes('compress')
    ) {
      return 'delegate-to-ai';
    }

    if (
      description.includes('orchestrat') ||
      description.includes('judgment') ||
      description.includes('review') ||
      description.includes('shift')
    ) {
      return 'elevate-role';
    }

    if (
      description.includes('relationship') ||
      description.includes('trust') ||
      description.includes('expand') ||
      description.includes('deepen')
    ) {
      return 'amplify-moat';
    }

    // Fallback based on index
    if (index % 3 === 0) return 'delegate-to-ai';
    if (index % 3 === 1) return 'elevate-role';
    return 'amplify-moat';
  }

  getCategoryLabel(category: ActionCategory): string {
    const labels: Record<ActionCategory, string> = {
      'delegate-to-ai': 'Delegate to AI',
      'elevate-role': 'Elevate Your Role',
      'amplify-moat': 'Amplify Your Moat',
    };
    return labels[category];
  }

  getCategoryColorClass(category: ActionCategory): string {
    const colors: Record<ActionCategory, string> = {
      'delegate-to-ai': 'rose',
      'elevate-role': 'amber',
      'amplify-moat': 'emerald',
    };
    return colors[category];
  }

  getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
    return this.copyService.getDifficultyLabel(difficulty);
  }

  toggleAction(index: number): void {
    const action = this.actionsWithState[index];
    action.completed = !action.completed;

    if (action.completed) {
      this.celebratingIndex = index;
      setTimeout(() => {
        this.celebratingIndex = null;
      }, 1500);
    }
  }

  onContinue(): void {
    this.continue.emit();
  }
}
