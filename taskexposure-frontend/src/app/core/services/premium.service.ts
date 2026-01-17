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

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PremiumState {
  isPremium: boolean;
  purchasedAt: Date | null;
  assessmentsUsed: number;
  maxFreeAssessments: number;
}

const STORAGE_KEY = 'taskexposure_premium';
const MAX_FREE_ASSESSMENTS = 1;

@Injectable({
  providedIn: 'root',
})
export class PremiumService {
  private readonly stateSubject = new BehaviorSubject<PremiumState>(this.loadFromStorage());

  readonly state$ = this.stateSubject.asObservable();

  get currentState(): PremiumState {
    return this.stateSubject.value;
  }

  get isPremium(): boolean {
    return this.stateSubject.value.isPremium;
  }

  get canStartAssessment(): boolean {
    const state = this.stateSubject.value;
    return state.isPremium || state.assessmentsUsed < state.maxFreeAssessments;
  }

  get assessmentsRemaining(): number {
    const state = this.stateSubject.value;
    if (state.isPremium) return Infinity;
    return Math.max(0, state.maxFreeAssessments - state.assessmentsUsed);
  }

  /**
   * Record that an assessment was started
   */
  recordAssessmentUsed(): void {
    const state = this.currentState;
    this.updateState({
      ...state,
      assessmentsUsed: state.assessmentsUsed + 1,
    });
  }

  /**
   * Activate premium access (mock purchase)
   */
  activatePremium(): void {
    this.updateState({
      ...this.currentState,
      isPremium: true,
      purchasedAt: new Date(),
    });
  }

  /**
   * Deactivate premium (for testing)
   */
  deactivatePremium(): void {
    this.updateState({
      ...this.currentState,
      isPremium: false,
      purchasedAt: null,
    });
  }

  /**
   * Reset all state (for testing)
   */
  resetState(): void {
    this.updateState({
      isPremium: false,
      purchasedAt: null,
      assessmentsUsed: 0,
      maxFreeAssessments: MAX_FREE_ASSESSMENTS,
    });
    this.removeFromStorage();
  }

  private updateState(state: PremiumState): void {
    this.stateSubject.next(state);
    this.saveToStorage(state);
  }

  private loadFromStorage(): PremiumState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          purchasedAt: parsed.purchasedAt ? new Date(parsed.purchasedAt) : null,
          maxFreeAssessments: MAX_FREE_ASSESSMENTS,
        };
      }
    } catch (e) {
      console.warn('Failed to load premium state from storage:', e);
    }
    return {
      isPremium: false,
      purchasedAt: null,
      assessmentsUsed: 0,
      maxFreeAssessments: MAX_FREE_ASSESSMENTS,
    };
  }

  private saveToStorage(state: PremiumState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save premium state to storage:', e);
    }
  }

  private removeFromStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove premium state from storage:', e);
    }
  }
}
