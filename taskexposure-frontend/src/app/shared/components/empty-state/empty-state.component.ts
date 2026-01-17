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

export type EmptyStateVariant = 'default' | 'error' | 'no-results';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state" [ngClass]="'empty-state--' + variant">
      <div class="empty-state__icon">
        <!-- Default / No Content -->
        <svg *ngIf="variant === 'default'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
        </svg>

        <!-- Error -->
        <svg *ngIf="variant === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>

        <!-- No Results -->
        <svg *ngIf="variant === 'no-results'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      <h3 class="empty-state__title">{{ title }}</h3>

      <p class="empty-state__description" *ngIf="description">
        {{ description }}
      </p>

      <button
        *ngIf="actionLabel"
        type="button"
        class="empty-state__action"
        (click)="action.emit()"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem 2rem;
      text-align: center;
      background-color: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: 4px;
    }

    .empty-state__icon {
      width: 4rem;
      height: 4rem;
      margin-bottom: 1.5rem;
      color: var(--color-text-secondary);

      svg {
        width: 100%;
        height: 100%;
      }

      .empty-state--error & {
        color: var(--color-high-risk);
      }
    }

    .empty-state__title {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: var(--color-text);
    }

    .empty-state__description {
      font-size: 0.9375rem;
      line-height: 1.6;
      margin: 0 0 1.5rem 0;
      color: var(--color-text-secondary);
      max-width: 400px;
    }

    .empty-state__action {
      padding: 0.75rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #ffffff;
      background-color: var(--color-accent);
      border: none;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--color-accent-hover);
      }

      .empty-state--error & {
        background-color: var(--color-high-risk);

        &:hover {
          background-color: #dc2626;
        }
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() variant: EmptyStateVariant = 'default';
  @Input() title: string = 'No content yet';
  @Input() description?: string;
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();
}
