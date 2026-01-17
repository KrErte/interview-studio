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

import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatorService } from '../../../core/services/simulator.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SimulatorCardComponent } from './simulator-card.component';
import { SimulatorResultComponent } from './simulator-result.component';
import {
  SimulatorTab,
  SimulatorOption,
  SimulationResult,
} from '../../models/simulator.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [CommonModule, TranslatePipe, SimulatorCardComponent, SimulatorResultComponent],
  template: `
    <section class="simulator glass-card">
      <h3 class="simulator__title">{{ 'simulator.title' | translate }}</h3>

      <!-- Tabs -->
      <div class="simulator__tabs">
        <button
          type="button"
          class="simulator__tab"
          [class.simulator__tab--active]="activeTab() === 'skill'"
          (click)="setActiveTab('skill')"
        >
          {{ 'simulator.tabs.skill' | translate }}
        </button>
        <button
          type="button"
          class="simulator__tab"
          [class.simulator__tab--active]="activeTab() === 'ai-capability'"
          (click)="setActiveTab('ai-capability')"
        >
          {{ 'simulator.tabs.aiCapability' | translate }}
        </button>
      </div>

      <!-- Current Exposure -->
      <div class="simulator__current">
        <span class="simulator__current-label">{{ 'simulator.currentExposure' | translate }}</span>
        <span class="simulator__current-value">{{ currentExposure }}%</span>
      </div>

      <!-- Option Selection -->
      <div class="simulator__options-section">
        <p class="simulator__instruction">
          @if (activeTab() === 'skill') {
            {{ 'simulator.selectSkill' | translate }}
          } @else {
            {{ 'simulator.selectAiCapability' | translate }}
          }
        </p>

        <div class="simulator__options-grid">
          @if (loading()) {
            @for (i of [1,2,3,4]; track i) {
              <div class="simulator__option-skeleton"></div>
            }
          } @else {
            @for (option of currentOptions(); track option.id) {
              <app-simulator-card
                [option]="option"
                [selected]="selectedOption()?.id === option.id"
                (select)="onOptionSelect($event)"
              />
            }
          }
        </div>
      </div>

      <!-- Divider -->
      @if (simulationResult() || simulating()) {
        <div class="simulator__divider"></div>
      }

      <!-- Simulation Result -->
      @if (simulating()) {
        <div class="simulator__loading">
          <div class="simulator__spinner"></div>
          <span>{{ 'simulator.simulating' | translate }}</span>
        </div>
      } @else if (simulationResult()) {
        <div class="simulator__result-section">
          <h4 class="simulator__result-title">{{ 'simulator.resultTitle' | translate }}</h4>
          <app-simulator-result
            [result]="simulationResult()!"
            [type]="activeTab()"
          />
        </div>
      }
    </section>
  `,
  styles: [`
    .simulator {
      padding: 1.5rem;
      background: rgba(22, 27, 34, 0.8);
      backdrop-filter: blur(12px);
      border-radius: 1rem;
      border: 1px solid var(--color-border);

      &__title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 1.25rem;
      }

      &__tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        padding: 0.25rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.5rem;
      }

      &__tab {
        flex: 1;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-secondary);
        background: transparent;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          color: var(--color-text);
          background: rgba(255, 255, 255, 0.05);
        }

        &--active {
          color: var(--color-text);
          background: var(--color-accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

          &:hover {
            background: var(--color-accent);
          }
        }
      }

      &__current {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 0.5rem;
        margin-bottom: 1.25rem;
      }

      &__current-label {
        font-size: 0.8125rem;
        color: var(--color-text-secondary);
      }

      &__current-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-text);
      }

      &__options-section {
        margin-bottom: 1rem;
      }

      &__instruction {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin: 0 0 1rem;
      }

      &__options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.75rem;
      }

      &__option-skeleton {
        height: 90px;
        background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 0.75rem;
      }

      &__divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--color-border), transparent);
        margin: 1.5rem 0;
      }

      &__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        gap: 1rem;
        color: var(--color-text-secondary);
        font-size: 0.875rem;
      }

      &__spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-accent);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      &__result-section {
        animation: fadeIn 0.3s ease;
      }

      &__result-title {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 1rem;
      }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class SimulatorComponent implements OnInit {
  private readonly simulatorService = inject(SimulatorService);

  @Input() sessionId?: string;
  @Input() currentExposure = 47;
  @Input() tasks: Task[] = [];

  activeTab = signal<SimulatorTab>('skill');
  skills = signal<SimulatorOption[]>([]);
  aiCapabilities = signal<SimulatorOption[]>([]);
  selectedOption = signal<SimulatorOption | null>(null);
  simulationResult = signal<SimulationResult | null>(null);
  loading = signal(true);
  simulating = signal(false);

  get currentOptions(): () => SimulatorOption[] {
    return () => this.activeTab() === 'skill' ? this.skills() : this.aiCapabilities();
  }

  ngOnInit(): void {
    this.loadOptions();
  }

  setActiveTab(tab: SimulatorTab): void {
    if (tab !== this.activeTab()) {
      this.activeTab.set(tab);
      this.selectedOption.set(null);
      this.simulationResult.set(null);
    }
  }

  onOptionSelect(option: SimulatorOption): void {
    if (this.selectedOption()?.id === option.id) {
      // Deselect
      this.selectedOption.set(null);
      this.simulationResult.set(null);
      return;
    }

    this.selectedOption.set(option);
    this.runSimulation(option);
  }

  private loadOptions(): void {
    this.loading.set(true);
    this.simulatorService.getOptions().subscribe({
      next: (response) => {
        this.skills.set(response.skills);
        this.aiCapabilities.set(response.aiCapabilities);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private runSimulation(option: SimulatorOption): void {
    this.simulating.set(true);
    this.simulationResult.set(null);

    const request = {
      sessionId: this.sessionId,
      optionId: option.id,
      currentExposure: this.currentExposure,
      tasks: this.tasks.map(t => ({ description: t.description, exposure: t.exposure })),
    };

    const simulate$ = option.category === 'skill'
      ? this.simulatorService.simulateSkill(request)
      : this.simulatorService.simulateAiCapability(request);

    simulate$.subscribe({
      next: (result) => {
        this.simulating.set(false);
        this.simulationResult.set(result);
      },
      error: () => {
        this.simulating.set(false);
      },
    });
  }
}
