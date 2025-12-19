export enum AssessmentDepth {
  QUICK = 'QUICK',
  DEEP = 'DEEP'
}

export enum PersonaType {
  BALANCED = 'BALANCED',
  NAVIGATOR = 'NAVIGATOR',
  ANALYST = 'ANALYST',
  ENGINEER = 'ENGINEER',
  EVALUATOR = 'EVALUATOR',
  RISK_OFFICER = 'RISK_OFFICER',
  COACH = 'COACH'
}

export interface DepthPreference {
  depth: AssessmentDepth;
  persona: PersonaType;
  lastUpdated: string;
}

export interface DepthConfig {
  questionCount: number;
  questionCountMax?: number;
  includeRoadmap: boolean;
  scoringMode: 'SIMPLE' | 'GRANULAR';
  estimatedMinutes: number;
}

export const DEPTH_CONFIGS: Record<AssessmentDepth, DepthConfig> = {
  [AssessmentDepth.QUICK]: {
    questionCount: 3,
    includeRoadmap: false,
    scoringMode: 'SIMPLE',
    estimatedMinutes: 5
  },
  [AssessmentDepth.DEEP]: {
    questionCount: 6,
    questionCountMax: 8,
    includeRoadmap: true,
    scoringMode: 'GRANULAR',
    estimatedMinutes: 12
  }
};

