import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RiskSummary {
  riskScore: number;
  band: string;
  message: string;
  confidence?: number;
  missingSignals?: string[];
}

export interface RiskQuestion {
  signalKey: string;
  label: string;
  question: string;
  index?: number;
  total?: number;
}

@Injectable({ providedIn: 'root' })
export class RiskApiService {
  constructor(private http: HttpClient) {}

  getSummary(): Observable<RiskSummary> {
    return this.http.get<RiskSummary>('/api/risk/summary');
  }

  getNextQuestion(): Observable<RiskQuestion> {
    return this.http.get<RiskQuestion>('/api/trainer/soft-question');
  }

  submitAnswer(signalKey: string, answer: string): Observable<void> {
    return this.http.post<void>('/api/trainer/soft-question', { signalKey, answer });
  }

  skipQuestion(signalKey?: string): Observable<void> {
    return this.http.post<void>('/api/trainer/soft-question/skip', { signalKey });
  }
}

