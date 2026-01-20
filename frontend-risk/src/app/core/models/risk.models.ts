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

// Risk Analysis DTOs
export interface ThreatVector {
  id: string;
  label: string;
  severity: number;
  category: 'automation' | 'outsourcing' | 'obsolescence' | 'competition';
  eta: string;
  description: string;
}

export interface SkillCell {
  skill: string;
  currentLevel: number;
  aiCapability: number;
  demandTrend: 'rising' | 'stable' | 'declining';
  category: string;
}

export interface VitalSign {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

export interface AIMilestone {
  year: number;
  capability: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  status: 'past' | 'imminent' | 'projected';
  affectedTasks: string[];
}

export interface Scenario {
  id: string;
  action: string;
  timeInvestment: string;
  riskChange: number;
  salaryChange: number;
  demandChange: number;
  description: string;
}

export interface SkillDecay {
  skill: string;
  halfLife: string;
  currentRelevance: number;
  lastUpdated: string;
  decayRate: 'fast' | 'moderate' | 'slow';
  renewalAction: string;
}

export interface MarketSignal {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'layoff';
  title: string;
  source: string;
  timeAgo: string;
  relevanceScore: number;
  details: string;
  actionable: boolean;
  action?: string;
}

export interface MarketMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TimelineEvent {
  year: number;
  event: string;
}

export interface DisruptedRole {
  title: string;
  peakYear: number;
  currentStatus: 'disrupted' | 'transformed' | 'declining';
  peakEmployment: string;
  currentEmployment: string;
  decline: number;
  disruptors: string[];
  timeline: TimelineEvent[];
  survivors: string[];
  lessons: string[];
}

export interface RiskAnalysisResponse {
  threatVectors: ThreatVector[];
  skillMatrix: SkillCell[];
  vitalSigns: VitalSign[];
  aiMilestones: AIMilestone[];
  scenarios: Scenario[];
  skillDecay: SkillDecay[];
  marketSignals: MarketSignal[];
  marketMetrics: MarketMetric[];
  disruptedRoles: DisruptedRole[];
}

