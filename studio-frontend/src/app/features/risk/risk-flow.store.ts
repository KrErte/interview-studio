import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RiskApiService } from './risk-api.service';
import {
  RiskCalculateRequest,
  RiskCalculateResponse,
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskRoadmapRequest,
  RiskRoadmapResponse,
} from './risk.models';

@Injectable({
  providedIn: 'root',
})
export class RiskFlowStore {
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _score = new BehaviorSubject<number | null>(null);
  private readonly _confidence = new BehaviorSubject<number | null>(null);
  private readonly _currentQuestion = new BehaviorSubject<string | null>(null);
  private readonly _done = new BehaviorSubject<boolean>(false);
  private readonly _signals = new BehaviorSubject<any[]>([]);
  private readonly _roadmap = new BehaviorSubject<any | null>(null);

  readonly loading$: Observable<boolean> = this._loading.asObservable();
  readonly error$: Observable<string | null> = this._error.asObservable();
  readonly score$: Observable<number | null> = this._score.asObservable();
  readonly confidence$: Observable<number | null> = this._confidence.asObservable();
  readonly currentQuestion$: Observable<string | null> = this._currentQuestion.asObservable();
  readonly done$: Observable<boolean> = this._done.asObservable();
  readonly signals$: Observable<any[]> = this._signals.asObservable();
  readonly roadmap$: Observable<any | null> = this._roadmap.asObservable();

  constructor(private riskApi: RiskApiService) {}

  startCalculate(payload: RiskCalculateRequest): void {
    this._loading.next(true);
    this._error.next(null);

    this.riskApi.calculate(payload).subscribe({
      next: (response: RiskCalculateResponse) => {
        this._score.next(response?.riskScore ?? null);
        this._confidence.next(response?.confidence ?? null);
        if (response?.factors) {
          this._signals.next(response.factors);
        }
        this._loading.next(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? err?.message ?? 'Failed to calculate risk';
        this._error.next(message);
        this._loading.next(false);
      },
    });
  }

  submitAnswer(payload: RiskFlowAnswerRequest): void {
    this._loading.next(true);
    this._error.next(null);

    this.riskApi.answer(payload).subscribe({
      next: (response: RiskFlowAnswerResponse) => {
        if (response?.nextQuestionId) {
          this._currentQuestion.next(response.nextQuestionId);
        }
        if (response?.isComplete) {
          this._done.next(true);
          this._currentQuestion.next(null);
        }
        if (response?.partialRiskScore !== undefined && response?.partialRiskScore !== null) {
          this._score.next(response.partialRiskScore);
        }
        this._loading.next(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? err?.message ?? 'Failed to submit answer';
        this._error.next(message);
        this._loading.next(false);
      },
    });
  }

  fetchRoadmap(payload: RiskRoadmapRequest): void {
    this._loading.next(true);
    this._error.next(null);

    this.riskApi.roadmap(payload).subscribe({
      next: (response: RiskRoadmapResponse) => {
        this._roadmap.next(response ?? null);
        this._loading.next(false);
      },
      error: (err) => {
        const message = err?.error?.message ?? err?.message ?? 'Failed to fetch roadmap';
        this._error.next(message);
        this._loading.next(false);
      },
    });
  }
}
