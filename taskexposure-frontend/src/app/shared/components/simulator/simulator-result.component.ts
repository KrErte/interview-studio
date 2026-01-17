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

import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulationResult, AffectedTask } from '../../models/simulator.model';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-simulator-result',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="simulator-result" [class.simulator-result--positive]="isPositive" [class.simulator-result--negative]="!isPositive">
      <h4 class="simulator-result__header">
        @if (isPositive) {
          {{ 'simulator.result.ifLearn' | translate : { name: result.optionName } }}
        } @else {
          {{ 'simulator.result.ifAiGains' | translate : { name: result.optionName } }}
        }
      </h4>

      <div class="simulator-result__score-change">
        <div class="simulator-result__scores">
          <span class="simulator-result__current">{{ displayedCurrent }}%</span>
          <span class="simulator-result__arrow">→</span>
          <span class="simulator-result__new" [class.simulator-result__new--positive]="isPositive" [class.simulator-result__new--negative]="!isPositive">
            {{ displayedNew }}%
          </span>
        </div>
        <div class="simulator-result__delta" [class.simulator-result__delta--positive]="isPositive" [class.simulator-result__delta--negative]="!isPositive">
          <span class="simulator-result__delta-arrow">{{ isPositive ? '▼' : '▲' }}</span>
          {{ isPositive ? '' : '+' }}{{ result.delta }}%
        </div>
      </div>

      <div class="simulator-result__bar-container">
        <div class="simulator-result__bar simulator-result__bar--current" [style.width.%]="result.currentExposure"></div>
        <div
          class="simulator-result__bar simulator-result__bar--new"
          [class.simulator-result__bar--positive]="isPositive"
          [class.simulator-result__bar--negative]="!isPositive"
          [style.width.%]="animatedWidth"
        ></div>
      </div>

      @if (result.affectedTasks.length > 0) {
        <div class="simulator-result__tasks">
          <span class="simulator-result__tasks-label">{{ 'simulator.result.affectedTasks' | translate }}</span>
          <ul class="simulator-result__task-list">
            @for (task of result.affectedTasks; track task.taskDescription) {
              <li class="simulator-result__task-item">
                <span class="simulator-result__task-name">{{ truncateTask(task.taskDescription) }}</span>
                <span class="simulator-result__task-change" [class.simulator-result__task-change--positive]="task.delta < 0" [class.simulator-result__task-change--negative]="task.delta > 0">
                  {{ task.currentExposure }}% → {{ task.newExposure }}%
                  <span class="simulator-result__task-delta">({{ task.delta > 0 ? '+' : '' }}{{ task.delta }}%)</span>
                </span>
              </li>
            }
          </ul>
        </div>
      }

      <p class="simulator-result__disclaimer">{{ 'simulator.disclaimer' | translate }}</p>
    </div>
  `,
  styles: [`
    .simulator-result {
      padding: 1.5rem;
      background: rgba(22, 27, 34, 0.6);
      border-radius: 0.75rem;
      border: 1px solid var(--color-border);
      backdrop-filter: blur(8px);

      &--positive {
        border-color: rgba(16, 185, 129, 0.3);
      }

      &--negative {
        border-color: rgba(244, 63, 94, 0.3);
      }

      &__header {
        font-size: 1rem;
        font-weight: 500;
        color: var(--color-text);
        margin: 0 0 1.25rem;
      }

      &__score-change {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      &__scores {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      &__current {
        font-size: 2rem;
        font-weight: 600;
        color: var(--color-text-secondary);
      }

      &__arrow {
        font-size: 1.5rem;
        color: var(--color-text-muted);
      }

      &__new {
        font-size: 2rem;
        font-weight: 700;

        &--positive {
          color: var(--color-emerald, #10b981);
        }

        &--negative {
          color: var(--color-rose, #f43f5e);
        }
      }

      &__delta {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 1.125rem;
        font-weight: 600;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;

        &--positive {
          color: var(--color-emerald, #10b981);
          background: rgba(16, 185, 129, 0.15);
        }

        &--negative {
          color: var(--color-rose, #f43f5e);
          background: rgba(244, 63, 94, 0.15);
        }
      }

      &__delta-arrow {
        font-size: 0.875rem;
      }

      &__bar-container {
        position: relative;
        height: 12px;
        background: var(--color-border-subtle);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 1.25rem;
      }

      &__bar {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        border-radius: 6px;
        transition: width 0.8s ease-out;

        &--current {
          background: var(--color-text-muted);
          opacity: 0.3;
        }

        &--new {
          z-index: 1;
        }

        &--positive {
          background: linear-gradient(90deg, var(--color-emerald, #10b981), var(--color-teal, #14b8a6));
        }

        &--negative {
          background: linear-gradient(90deg, var(--color-rose, #f43f5e), var(--color-red, #ef4444));
        }
      }

      &__tasks {
        margin-bottom: 1rem;
      }

      &__tasks-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 0.75rem;
      }

      &__task-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      &__task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.375rem;
        font-size: 0.8125rem;
      }

      &__task-name {
        color: var(--color-text-secondary);
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 0.75rem;
      }

      &__task-change {
        flex-shrink: 0;
        font-weight: 500;

        &--positive {
          color: var(--color-emerald, #10b981);
        }

        &--negative {
          color: var(--color-rose, #f43f5e);
        }
      }

      &__task-delta {
        opacity: 0.7;
        font-size: 0.75rem;
        margin-left: 0.25rem;
      }

      &__disclaimer {
        font-size: 0.6875rem;
        color: var(--color-text-muted);
        margin: 0;
        font-style: italic;
      }
    }
  `],
})
export class SimulatorResultComponent implements OnChanges {
  @Input({ required: true }) result!: SimulationResult;
  @Input() type: 'skill' | 'ai-capability' = 'skill';

  animatedWidth = 0;
  displayedCurrent = 0;
  displayedNew = 0;

  get isPositive(): boolean {
    return this.result.delta < 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['result'] && this.result) {
      this.animateResult();
    }
  }

  private animateResult(): void {
    // Reset
    this.animatedWidth = this.result.currentExposure;
    this.displayedCurrent = 0;
    this.displayedNew = 0;

    // Animate current number
    this.animateNumber('displayedCurrent', this.result.currentExposure, 400);

    // After a short delay, animate the bar and new number
    setTimeout(() => {
      this.animatedWidth = this.result.newExposure;
      this.animateNumber('displayedNew', this.result.newExposure, 600);
    }, 300);
  }

  private animateNumber(property: 'displayedCurrent' | 'displayedNew', target: number, duration: number): void {
    const startValue = this[property];
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      this[property] = Math.round(startValue + (target - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  truncateTask(description: string): string {
    if (description.length <= 40) return description;
    return description.substring(0, 37) + '...';
  }
}
