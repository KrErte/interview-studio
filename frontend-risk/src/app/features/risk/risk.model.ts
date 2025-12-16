export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskBreakdownItem {
  key: string;
  label: string;
  score: number;
  details: string;
}

export interface RiskAssessmentResult {
  riskPercent: number;
  confidence: ConfidenceLevel;
  breakdown: RiskBreakdownItem[];
  recommendations: string[];
  followupQuestions?: RiskQuestion[];
}

export type RiskQuestionType = 'select' | 'multi-select' | 'scale' | 'boolean' | 'text';

export interface RiskQuestionOption {
  value: string;
  label: string;
}

export interface RiskQuestion {
  id: string;
  label: string;
  type: RiskQuestionType;
  options?: RiskQuestionOption[];
  min?: number;
  max?: number;
  required?: boolean;
  placeholder?: string;
}

export interface CvUploadResponse {
  cvId: string;
  fileName: string;
}

export interface RiskWizardState {
  cv?: {
    cvId?: string;
    fileName?: string;
    useLatest?: boolean;
  };
  experience?: {
    years?: number | null;
    role?: string;
    industry?: string;
    country?: string;
  };
  answers?: Record<string, string | string[] | number | boolean>;
  result?: RiskAssessmentResult | null;
}

