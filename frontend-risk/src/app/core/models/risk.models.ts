export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  UNKNOWN = 'UNKNOWN'
}

export enum QuestionType {
  TEXT = 'TEXT',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTI_CHOICE = 'MULTI_CHOICE',
  SCALE = 'SCALE',
  BOOLEAN = 'BOOLEAN'
}

export type LegacyQuestionType = 'select' | 'multi-select' | 'scale' | 'boolean' | 'text';
export type RiskQuestionType = QuestionType | LegacyQuestionType;

export type RiskQuestionAnswer = string | string[] | number | boolean | null;

export interface RiskQuestionOption {
  value: string;
  label: string;
}

export interface RiskQuestion {
  id: string;
  type: RiskQuestionType;
  text?: string;
  title?: string;
  label?: string;
  placeholder?: string;
  options?: RiskQuestionOption[];
  required?: boolean;
  min?: number;
  max?: number;
  signalKey?: string;
  order?: number;
  metadata?: Record<string, unknown>;
}

export interface RiskSignal {
  key: string;
  label: string;
  score: number;
  confidence?: number;
  level?: RiskLevel;
  description?: string;
}

export interface RiskFlowStartRequest {
  resumeSessionId?: string;
  seed?: string;
}

export interface RiskFlowStartResponse {
  sessionId: string | null | undefined;
  firstQuestion?: RiskQuestion | null;
  totalQuestions?: number;
  status?: string;
}

export interface RiskFlowAnswerRequest {
  sessionId: string;
  questionId: string;
  answer?: RiskQuestionAnswer;
  skipped?: boolean;
}

export interface RiskFlowAnswerResponse {
  sessionId: string;
  nextQuestion?: RiskQuestion | null;
  isComplete: boolean;
  answeredCount?: number;
  totalQuestions?: number;
}

export interface RiskFlowNextRequest {
  sessionId: string;
}

export interface RiskFlowNextResponse {
  sessionId: string;
  question?: string | null;
  questionId?: string | null;
  done?: boolean;
  index?: number;
  totalPlanned?: number;
  status?: string;
}

export interface RiskFlowEvaluateRequest {
  sessionId: string;
  forceRecalculate?: boolean;
}

export interface RiskFlowEvaluateResponse {
  sessionId: string;
  isComplete: boolean;
  finalScore: number;
  finalConfidence: number;
  riskLevel: RiskLevel;
  signals: RiskSignal[];
  summary?: string;
}

export interface RiskFlowSummaryResponse {
  sessionId: string;
  finalScore: number;
  finalConfidence: number;
  riskLevel: RiskLevel;
  signals?: RiskSignal[];
  summary?: string;
}

// Legacy summary shape kept for compatibility; not used by the new flow directly.
export interface RiskSummary {
  riskScore: number;
  band: string;
  message: string;
  confidence?: number;
  missingSignals?: string[];
}

