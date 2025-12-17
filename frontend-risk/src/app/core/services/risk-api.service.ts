import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client.service';
import {
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskFlowEvaluateRequest,
  RiskFlowEvaluateResponse,
  RiskFlowStartRequest,
  RiskFlowStartResponse,
  RiskFlowNextRequest,
  RiskFlowNextResponse,
  RiskFlowSummaryResponse,
  RiskSummary
} from '../models/risk.models';

@Injectable({ providedIn: 'root' })
export class RiskApiService {
  constructor(private api: ApiClient) {}

  start(payload: RiskFlowStartRequest = {}): Observable<RiskFlowStartResponse> {
    return this.api.post<RiskFlowStartResponse>('/risk/flow/start', payload);
  }

  next(payload: RiskFlowNextRequest): Observable<RiskFlowNextResponse> {
    return this.api.post<RiskFlowNextResponse>('/risk/flow/next', payload);
  }

  answer(payload: RiskFlowAnswerRequest): Observable<RiskFlowAnswerResponse> {
    return this.api.post<RiskFlowAnswerResponse>('/risk/flow/answer', payload);
  }

  evaluate(payload: RiskFlowEvaluateRequest): Observable<RiskFlowEvaluateResponse> {
    return this.api.post<RiskFlowEvaluateResponse>('/risk/flow/evaluate', payload);
  }

  summary(sessionId: string): Observable<RiskFlowSummaryResponse> {
    return this.api.get<RiskFlowSummaryResponse>(`/risk/flow/${sessionId}/summary`);
  }

  // Kept for backwards compatibility; not used by the new flow.
  getSummary(): Observable<RiskSummary> {
    return this.api.get<RiskSummary>('/risk/summary');
  }
}

