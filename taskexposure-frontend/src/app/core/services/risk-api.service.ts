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

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AnalyzeRequest,
  AnalyzeResponse,
  RefineRequest,
  RefineResponse,
  RiskSummaryResponse,
  QuestionsResponse,
  ReEvaluateRequest,
  RiskFlowStartRequest,
  RiskFlowStartResponse,
  RiskFlowNextRequest,
  RiskFlowNextResponse,
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskFlowEvaluateRequest,
  RiskFlowEvaluateResponse,
} from '../models/risk-api.models';

@Injectable({
  providedIn: 'root',
})
export class RiskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/risk`;

  /**
   * Analyze tasks and get initial risk assessment with clarifying questions.
   * POST /api/risk/analyze
   */
  analyze(request: AnalyzeRequest): Observable<AnalyzeResponse> {
    return this.http.post<AnalyzeResponse>(`${this.baseUrl}/analyze`, request);
  }

  /**
   * Refine the assessment after answering clarifying questions.
   * POST /api/risk/refine
   */
  refine(request: RefineRequest): Observable<RefineResponse> {
    return this.http.post<RefineResponse>(`${this.baseUrl}/refine`, request);
  }

  /**
   * Get risk summary for a session.
   * GET /api/risk/summary
   */
  getSummary(sessionId?: string): Observable<RiskSummaryResponse> {
    const params: Record<string, string> = {};
    if (sessionId) {
      params['sessionId'] = sessionId;
    }
    return this.http.get<RiskSummaryResponse>(`${this.baseUrl}/summary`, { params });
  }

  /**
   * Get public assessment questions.
   * GET /api/risk/questions
   */
  getQuestions(): Observable<QuestionsResponse> {
    return this.http.get<QuestionsResponse>(`${this.baseUrl}/questions`);
  }

  /**
   * Re-evaluate risk for a training session.
   * POST /api/risk/re-evaluate
   */
  reEvaluate(request: ReEvaluateRequest): Observable<RiskSummaryResponse> {
    return this.http.post<RiskSummaryResponse>(`${this.baseUrl}/re-evaluate`, request);
  }

  // ============================================
  // Risk Flow Endpoints
  // ============================================

  /**
   * Start a new risk flow assessment.
   * POST /api/risk/flow/start
   */
  flowStart(request: RiskFlowStartRequest): Observable<RiskFlowStartResponse> {
    return this.http.post<RiskFlowStartResponse>(`${this.baseUrl}/flow/start`, request);
  }

  /**
   * Get the next question in the risk flow.
   * POST /api/risk/flow/next
   */
  flowNext(request: RiskFlowNextRequest): Observable<RiskFlowNextResponse> {
    return this.http.post<RiskFlowNextResponse>(`${this.baseUrl}/flow/next`, request);
  }

  /**
   * Submit an answer in the risk flow.
   * POST /api/risk/flow/answer
   */
  flowAnswer(request: RiskFlowAnswerRequest): Observable<RiskFlowAnswerResponse> {
    return this.http.post<RiskFlowAnswerResponse>(`${this.baseUrl}/flow/answer`, request);
  }

  /**
   * Evaluate the risk flow and get final assessment.
   * POST /api/risk/flow/evaluate
   */
  flowEvaluate(request: RiskFlowEvaluateRequest): Observable<RiskFlowEvaluateResponse> {
    return this.http.post<RiskFlowEvaluateResponse>(`${this.baseUrl}/flow/evaluate`, request);
  }
}
