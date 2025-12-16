export type InterviewerStyle = 'HR' | 'TECH' | 'TEAM_LEAD' | 'MIXED';

export type InterviewSeniority = 'JUNIOR' | 'MID' | 'SENIOR';

export interface InterviewSessionStartRequest {
  companyName: string;
  roleTitle: string;
  seniority: InterviewSeniority;
  interviewerStyle: InterviewerStyle;
}

export interface InterviewQuestionResponse {
  sessionId: string;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  modelAnswerHint: string;
}

export interface InterviewAnswerRequest {
  sessionId: string;
  questionNumber: number;
  answer: string;
}

export interface InterviewLocalAnalysis {
  detectedStrengths: string[];
  detectedRisks: string[];
}

export interface InterviewNextQuestionResponse {
  sessionId: string;
  isFinished: false;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  modelAnswerHint: string;
  localAnalysis?: InterviewLocalAnalysis;
}

export interface InterviewDimensionScore {
  dimension: string;
  score: number;
}

export interface InterviewSummaryResponse {
  sessionId: string;
  isFinished: true;
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  dimensionScores: InterviewDimensionScore[];
  verdict: string;
}

export interface InterviewSessionCreateRequest {
  email: string;
}

export interface InterviewSessionCreateResponse {
  sessionUuid: string;
  sessionId?: string | number;
  email?: string;
}

export interface InterviewProgressUsedContext {
  lastAnswer: string;
  last3: string[];
  last5: string[];
}

export interface InterviewProgressStats {
  questionCount: number;
  currentDimension?: string;
  last1Average?: number;
  last3Average?: number;
  last5Average?: number;
}

export interface InterviewProfileDto {
  sessionUuid?: string | null;
  cvFilename?: string | null;
  uploadedAt?: string | null;
  candidateKeySkills: string[];
  candidateExperienceDepth: string[];
  candidateRealExamples: string[];
  interviewerSummary: string[];
  interviewerProbePriorities: string[];
  interviewerRiskHypotheses: string[];
  interviewerClaimsVsDemonstrated: string[];
}

export interface InterviewFitSnapshot {
  computed: boolean;
  overall: number | null;
  currentDimension: string | null;
  trend: string | null;
}

export interface InterviewFitInsight {
  type: 'STRENGTH' | 'RISK';
  text: string;
}

export interface InterviewFitDimensionBreakdown {
  key: string;
  label: string;
  scorePercent: number | null;
  band: string | null;
  insights: InterviewFitInsight[] | null;
}

export interface InterviewFitBreakdown {
  confidence: string | null; // LOW|MEDIUM|HIGH
  answeredCount: number;
  dimensions: InterviewFitDimensionBreakdown[] | null;
}

export type CandidateSummarySignalConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CandidateSummarySignalDto {
  label: string;
  confidence: CandidateSummarySignalConfidence;
}

export interface CandidateSummaryEvidenceDto {
  q: string;
  a: string;
}

export interface CandidateSummaryDto {
  sessionUuid?: string | null;
  narrative: string;
  strengths: string[];
  risks: string[];
  signals: CandidateSummarySignalDto[];
  evidenceLast3: CandidateSummaryEvidenceDto[];
  updatedAt: string;
  answeredCount: number;
  lastFitScore?: number | null;
  lastFitTrend?: string | null;
}

export interface InterviewProgressResponse {
  question: string;
  interviewerStyle?: InterviewerStyle;
  usedContext?: InterviewProgressUsedContext;
  decision?: string;
  progress?: InterviewProgressStats;
  fitScore?: number | null;
  fitTrend?: string | null;
  fit?: InterviewFitSnapshot;
  fitBreakdown?: InterviewFitBreakdown | null;
  sessionComplete?: boolean;
  candidateSummary?: CandidateSummaryDto | null;
}





