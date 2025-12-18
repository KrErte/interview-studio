export interface RiskCalculateRequest {
  sessionId?: string;
  candidateId?: string;
  interviewId?: string;
  answers?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface RiskCalculateResponse {
  riskScore?: number;
  riskLevel?: string;
  confidence?: number;
  factors?: RiskFactor[];
  calculatedAt?: string;
  error?: string;
  message?: string;
}

export interface RiskFactor {
  id?: string;
  name?: string;
  weight?: number;
  score?: number;
  description?: string;
}

export interface RiskFlowAnswerRequest {
  sessionId?: string;
  questionId?: string;
  answer?: string | number | boolean | Record<string, unknown>;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface RiskFlowAnswerResponse {
  success?: boolean;
  nextQuestionId?: string;
  isComplete?: boolean;
  currentProgress?: number;
  totalQuestions?: number;
  partialRiskScore?: number;
  error?: string;
  message?: string;
}

export interface RiskRoadmapRequest {
  sessionId?: string;
  candidateId?: string;
  interviewId?: string;
  includeDetails?: boolean;
  filters?: RiskRoadmapFilters;
}

export interface RiskRoadmapFilters {
  riskLevelMin?: string;
  riskLevelMax?: string;
  dateFrom?: string;
  dateTo?: string;
  categories?: string[];
}

export interface RiskRoadmapResponse {
  roadmapId?: string;
  items?: RiskRoadmapItem[];
  summary?: RiskRoadmapSummary;
  generatedAt?: string;
  error?: string;
  message?: string;
}

export interface RiskRoadmapItem {
  id?: string;
  title?: string;
  description?: string;
  priority?: number;
  riskLevel?: string;
  category?: string;
  recommendedActions?: string[];
  dueDate?: string;
  status?: string;
}

export interface RiskRoadmapSummary {
  totalItems?: number;
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  overallRiskScore?: number;
  recommendations?: string[];
}
