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

// ============================================
// Analyze Endpoint DTOs
// ============================================

export interface AnalyzeRequest {
  roleTitle: string;
  tenureYears: number;
  contextText: string;
  cvText?: string;
  sessionId?: string;
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  hint?: string;
}

export interface AnalyzeResponse {
  analysisId: string;
  phase: string;
  replaceabilityPct: number;
  riskLabel: string;
  confidence: string;
  strengths: string[];
  risks: string[];
  whySummary: string;
  clarifyingQuestions: ClarifyingQuestion[];
}

// ============================================
// Refine Endpoint DTOs
// ============================================

export interface RefineAnswer {
  id: string;
  answer: string;
}

export interface RefineRequest {
  analysisId: string;
  answers: RefineAnswer[];
  sessionId?: string;
}

export interface RoadmapItem {
  day: number;
  title: string;
  actions: string[];
  output: string;
  impact: string;
}

export interface Roadmap {
  days: number;
  items: RoadmapItem[];
}

export interface RefineResponse {
  analysisId: string;
  phase: string;
  replaceabilityPct: number;
  deltaPct: number;
  riskLabel: string;
  confidence: string;
  strengths: string[];
  risks: string[];
  whatChanged: string[];
  roadmap: Roadmap;
}

// ============================================
// Risk Flow Endpoint DTOs
// ============================================

export interface RiskFlowStartRequest {
  context?: string;
  mode?: string;
}

export interface RiskFlowStartResponse {
  flowId: string;
  email: string;
  sessionId: string;
  startedAt: string;
  message: string;
  context: string;
  status: string;
  mode: string;
}

export interface RiskFlowNextRequest {
  flowId?: string;
  sessionId?: string;
}

export interface RiskFlowNextResponse {
  flowId: string;
  questionId: string;
  question: string;
  index: number;
  totalPlanned: number;
  done: boolean;
}

export interface RiskFlowAnswerRequest {
  flowId?: string;
  sessionId?: string;
  questionId: string;
  answer: string;
}

export interface RiskFlowAnswerResponse {
  flowId: string;
  questionId: string;
  status: string;
  receivedAt: string;
}

export interface RiskFlowEvaluateRequest {
  flowId?: string;
  sessionId?: string;
  payload?: Record<string, unknown>;
}

export interface RiskFlowEvaluateResponse {
  flowId: string;
  status: string;
  evaluatedAt: string;
  message: string;
}

// ============================================
// Summary Endpoint DTOs
// ============================================

export interface RiskSummaryResponse {
  riskScore: number;
  band: string;
  message: string;
  confidence: string;
  missingSignals: string[];
}

// ============================================
// Questions Endpoint DTOs
// ============================================

export interface Question {
  id: string;
  question: string;
  hint?: string;
}

export interface QuestionsResponse {
  questions: Question[];
}

// ============================================
// Re-evaluate Endpoint DTOs
// ============================================

export interface ReEvaluateRequest {
  email: string;
  taskKey: string;
  sessionId?: string;
}
