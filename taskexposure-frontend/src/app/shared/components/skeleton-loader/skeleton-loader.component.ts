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

type SkeletonType = 'text' | 'title' | 'paragraph' | 'card' | 'gauge' | 'button';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-loader" [ngClass]="'skeleton-loader--' + type">
      <ng-container [ngSwitch]="type">
        <ng-container *ngSwitchCase="'text'">
          <div class="skeleton skeleton--text" *ngFor="let _ of lines"></div>
        </ng-container>

        <ng-container *ngSwitchCase="'title'">
          <div class="skeleton skeleton--title"></div>
        </ng-container>

        <ng-container *ngSwitchCase="'paragraph'">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text" *ngFor="let _ of lines"></div>
        </ng-container>

        <ng-container *ngSwitchCase="'card'">
          <div class="skeleton-card">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text" style="width: 80%"></div>
          </div>
        </ng-container>

        <ng-container *ngSwitchCase="'gauge'">
          <div class="skeleton skeleton--circle" style="width: 200px; height: 200px; margin: 0 auto;"></div>
        </ng-container>

        <ng-container *ngSwitchCase="'button'">
          <div class="skeleton skeleton--button"></div>
        </ng-container>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-loader {
      &--paragraph {
        max-width: 600px;
      }
    }

    .skeleton-card {
      padding: 1.5rem;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: SkeletonType = 'text';
  @Input() lineCount: number = 3;

  get lines(): number[] {
    return Array(this.lineCount).fill(0);
  }
}
