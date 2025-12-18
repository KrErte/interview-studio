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

// Legacy summary shape kept for compatibility; not used by the new flow directly.
export interface RiskSummary {
  riskScore: number;
  band: string;
  message: string;
  confidence?: number;
  missingSignals?: string[];
}

// Experience input data for Step 1
export interface ExperienceInput {
  yearsOfExperience: number;
  currentRole: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  industry: string;
  stack: string;
}

// Assessment data for Step 3
export interface AssessmentWeakness {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AssessmentResult {
  riskPercent: number;
  riskBand: RiskLevel;
  confidence: number;
  weaknesses: AssessmentWeakness[];
  signals: RiskSignal[];
}

// Roadmap data for Step 4
export enum RoadmapDuration {
  SEVEN_DAYS = 7,
  THIRTY_DAYS = 30,
  NINETY_DAYS = 90
}

export interface RoadmapCheckpoint {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
}

export interface RoadmapItem {
  id: string;
  day?: number;
  week?: number;
  title: string;
  description: string;
  tasks: string[];
  checkpoints: RoadmapCheckpoint[];
}

export interface RoadmapResponse {
  sessionId: string;
  duration: RoadmapDuration;
  items: RoadmapItem[];
  summary: string;
}

// Start assessment request with profile data
export interface StartAssessmentRequest {
  cvFileId?: string;
  experience: ExperienceInput;
}

export interface StartAssessmentResponse {
  sessionId: string;
  message: string;
}

// Get next question response
export interface GetNextQuestionResponse {
  sessionId: string;
  question: RiskQuestion;
  index: number;
  total: number;
}

// Submit/skip answer request
export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
  skipped?: boolean;
}

export interface SubmitAnswerResponse {
  sessionId: string;
  success: boolean;
  confidenceImpact?: number;
}

// Generate roadmap request
export interface GenerateRoadmapRequest {
  sessionId: string;
  duration: RoadmapDuration;
}

