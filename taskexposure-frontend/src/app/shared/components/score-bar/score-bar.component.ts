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

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-bar" [class.score-bar--large]="size === 'large'">
      @for (segment of segmentArray; track $index) {
        <div
          class="score-bar__segment"
          [class.score-bar__segment--filled]="$index < filledSegments"
          [ngClass]="getSegmentColorClass($index)"
        ></div>
      }
    </div>
    @if (showLabel) {
      <div class="score-bar__labels">
        @for (label of segmentLabels; track $index) {
          <span class="score-bar__label">{{ label }}</span>
        }
      </div>
    }
  `,
  styles: [`
    .score-bar {
      display: flex;
      gap: 3px;
      height: 8px;
      width: 100%;
      border-radius: 4px;
      overflow: hidden;

      &--large {
        height: 12px;
        gap: 4px;
      }

      &__segment {
        flex: 1;
        background: var(--color-border-subtle);
        border-radius: 2px;
        transition: all 0.3s ease;

        &--filled {
          &.low { background: var(--color-low-risk); }
          &.medium { background: var(--color-medium-risk); }
          &.high { background: var(--color-high-risk); }
          &.accent { background: var(--color-accent); }
          &.purple { background: var(--color-purple); }
          &.cyan { background: var(--color-cyan); }
          &.gradient {
            background: linear-gradient(90deg, var(--color-low-risk), var(--color-medium-risk), var(--color-high-risk));
          }
        }
      }

      &__labels {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
      }

      &__label {
        font-size: 0.625rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }
  `],
})
export class ScoreBarComponent {
  @Input() value = 0;
  @Input() max = 100;
  @Input() segments = 10;
  @Input() color: 'auto' | 'low' | 'medium' | 'high' | 'accent' | 'purple' | 'cyan' | 'gradient' = 'auto';
  @Input() size: 'default' | 'large' = 'default';
  @Input() showLabel = false;
  @Input() segmentLabels: string[] = [];

  get segmentArray(): number[] {
    return Array.from({ length: this.segments }, (_, i) => i);
  }

  get filledSegments(): number {
    const percentage = this.value / this.max;
    return Math.round(percentage * this.segments);
  }

  getSegmentColorClass(index: number): string {
    if (this.color !== 'auto') {
      return this.color;
    }

    // Auto color based on position
    const percentage = ((index + 1) / this.segments) * 100;
    if (percentage <= 33) return 'low';
    if (percentage <= 66) return 'medium';
    return 'high';
  }
}
