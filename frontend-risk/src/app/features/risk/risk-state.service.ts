import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RiskAssessmentResult, RiskWizardState } from './risk.model';

const STATE_KEY = 'risk_wizard_state';

@Injectable({ providedIn: 'root' })
export class RiskStateService {
  private readonly state$ = new BehaviorSubject<RiskWizardState>(this.loadState());

  get snapshot(): RiskWizardState {
    return this.state$.value;
  }

  readonly stateChanges = this.state$.asObservable();

  update(partial: Partial<RiskWizardState>): void {
    const next = { ...this.snapshot, ...partial };
    this.persist(next);
  }

  setResult(result: RiskAssessmentResult): void {
    const next = { ...this.snapshot, result };
    this.persist(next);
  }

  reset(): void {
    this.persist({});
  }

  private persist(next: RiskWizardState): void {
    this.state$.next(next);
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence errors (private mode)
    }
  }

  private loadState(): RiskWizardState {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as RiskWizardState;
    } catch {
      return {};
    }
  }
}

