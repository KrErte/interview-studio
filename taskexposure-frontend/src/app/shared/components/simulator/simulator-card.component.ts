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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorOption } from '../../models/simulator.model';

@Component({
  selector: 'app-simulator-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="simulator-card"
      [class.simulator-card--selected]="selected"
      [class.simulator-card--skill]="option.category === 'skill'"
      [class.simulator-card--ai]="option.category === 'ai-capability'"
      (click)="onSelect()"
    >
      <span class="simulator-card__icon">{{ option.icon }}</span>
      <span class="simulator-card__name">{{ option.name }}</span>
      @if (selected) {
        <span class="simulator-card__check">✓</span>
      }
    </button>
  `,
  styles: [`
    .simulator-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      min-width: 140px;
      min-height: 90px;
      background: rgba(22, 27, 34, 0.6);
      border: 1px solid var(--color-border);
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      backdrop-filter: blur(8px);

      &:hover {
        transform: scale(1.02);
        border-color: var(--color-accent);
        background: rgba(22, 27, 34, 0.8);
      }

      &--selected {
        border-color: var(--color-emerald, #10b981);
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
        background: rgba(16, 185, 129, 0.1);

        &.simulator-card--ai {
          border-color: var(--color-rose, #f43f5e);
          box-shadow: 0 0 20px rgba(244, 63, 94, 0.2);
          background: rgba(244, 63, 94, 0.1);
        }
      }

      &__icon {
        font-size: 1.75rem;
        line-height: 1;
      }

      &__name {
        font-size: 0.8125rem;
        font-weight: 500;
        color: var(--color-text);
        text-align: center;
      }

      &__check {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        width: 1.25rem;
        height: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-emerald, #10b981);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
        border-radius: 50%;

        .simulator-card--ai & {
          background: var(--color-rose, #f43f5e);
        }
      }
    }
  `],
})
export class SimulatorCardComponent {
  @Input({ required: true }) option!: SimulatorOption;
  @Input() selected = false;
  @Output() select = new EventEmitter<SimulatorOption>();

  onSelect(): void {
    this.select.emit(this.option);
  }
}
