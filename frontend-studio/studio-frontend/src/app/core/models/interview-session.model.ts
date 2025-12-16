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

/**
 * Legacy / progress-based interview flow
 *
 * Backend contracts:
 * - Start session: POST /api/interview-sessions
 * - Next question: POST /api/interviews/{sessionUuid}/next-question
 */

export interface InterviewSessionCreateRequest {
  email: string;
}

export interface InterviewSessionCreateResponse {
  /**
   * Preferred identifier for progress API.
   */
  sessionUuid: string;
  /**
   * Kept for backwards compatibility if backend still exposes numeric ID.
   */
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

/**
 * CV-driven interview profile derived from an uploaded CV.
 * Frontend treats this as read-only context for both candidate preview
 * and interviewer Control Room views.
 */
export interface InterviewProfileDto {
  /**
   * Optional session UUID this profile is associated with, if any.
   */
  sessionUuid?: string | null;
  /**
   * Original filename of the uploaded CV, if available.
   */
  cvFilename?: string | null;
  /**
   * ISO-8601 timestamp when the CV was processed.
   */
  uploadedAt?: string | null;
  /**
   * Candidate-safe focus areas. These are surfaced in the "Interview Focus
   * Preview" panel before the interview starts.
   */
  candidateKeySkills: string[];
  candidateExperienceDepth: string[];
  candidateRealExamples: string[];
  /**
   * Interviewer-only view, surfaced in the Control Room drawer.
   * Must not be shown to the candidate.
   */
  interviewerSummary: string[];
  interviewerProbePriorities: string[];
  interviewerRiskHypotheses: string[];
  interviewerClaimsVsDemonstrated: string[];
}

export interface InterviewFitSnapshot {
  /**
   * Whether backend has computed the fit metrics for this turn.
   */
  computed: boolean;
  /**
   * Canonical overall fit score for this turn, in percent (0–100).
   * Mirrors the top-level fitScore field.
   */
  overall: number | null;
  /**
   * Canonical current focus dimension key for this turn.
   * Mirrors progress.currentDimension.
   */
  currentDimension: string | null;
  /**
   * Canonical trend label for fit ("IMPROVING" | "FLAT" | "DECLINING"), if provided.
   * Mirrors the top-level fitTrend field.
   */
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

/**
 * Backend-provided candidate summary DTOs.
 * Frontend must treat these as the single source of truth and must not
 * attempt to re-compute heuristics locally.
 */
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
  /**
   * Optional session UUID, for debugging and admin tooling.
   */
  sessionUuid?: string | null;
  /**
   * Neutral narrative summary of the candidate so far.
   */
  narrative: string;
  /**
   * High-level strengths extracted from answers.
   */
  strengths: string[];
  /**
   * High-level risks / concerns extracted from answers.
   */
  risks: string[];
  /**
   * Key signals with confidence bands.
   */
  signals: CandidateSummarySignalDto[];
  /**
   * Most recent evidence snippets (question / answer pairs).
   */
  evidenceLast3: CandidateSummaryEvidenceDto[];
  /**
   * ISO timestamp when this summary was last updated by the backend.
   */
  updatedAt: string;
  /**
   * How many answers have been processed into this summary.
   */
  answeredCount: number;
  /**
   * Optional cached fit fields for convenience in the UI.
   */
  lastFitScore?: number | null;
  lastFitTrend?: string | null;
}

export interface InterviewProgressResponse {
  question: string;
  /**
   * Legacy field from earlier implementation. May be absent in newer contracts.
   */
  interviewerStyle?: InterviewerStyle;
  /**
   * Legacy field from earlier implementation. May be absent in newer contracts.
   */
  usedContext?: InterviewProgressUsedContext;
  /**
   * High-level decision about how the AI wants to steer the conversation next.
   */
  decision?: string;
  /**
   * Rolling progress stats including questionCount that should drive the UI step counter.
   */
  progress?: InterviewProgressStats;
  /**
   * Overall fit score for the session (0-100), if computed.
   */
  fitScore?: number | null;
  /**
   * High-level trend label for fit (e.g. "UP", "FLAT", "DOWN"), if provided.
   */
  fitTrend?: string | null;
  /**
   * Current fit snapshot for this answer / question.
   */
  fit?: InterviewFitSnapshot;
  /**
   * Detailed fit breakdown: dimensions, insights, confidence.
   */
  fitBreakdown?: InterviewFitBreakdown | null;
  /**
   * When true, the interview flow for this session is complete.
   */
  sessionComplete?: boolean;
  /**
   * Server-maintained candidate summary snapshot for this turn.
   */
  candidateSummary?: CandidateSummaryDto | null;
}

