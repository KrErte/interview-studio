export type ObserverStage =
  | 'INITIAL_ASSESSMENT'
  | 'CLARIFYING_Q1'
  | 'CLARIFYING_Q2'
  | 'CLARIFYING_Q3'
  | 'REASSESSMENT'
  | 'ROADMAP_GENERATED'
  | 'OTHER';

export interface ObserverLogDto {
  id: string;
  sessionUuid: string;
  createdAt: string;
  stage: ObserverStage;
  riskBefore?: number | null;
  riskAfter?: number | null;
  confidenceBefore?: number | null;
  confidenceAfter?: number | null;
  signalsJson?: string | null;
  weaknessesJson?: string | null;
  rationaleSummary?: string | null;
}

