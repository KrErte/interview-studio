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

/**
 * Centralized copy for TASKEXPOSURE - Narrative UX Implementation
 *
 * Based on Persona Engine v1 Specification
 *
 * The assessment flow is designed as a narrative arc, not a form submission.
 * Each screen advances user understanding while building toward actionable insight.
 *
 * Screen Narrative Arc:
 * 1. START ("The Mirror"): Establish credibility, differentiate from fear-based tools
 * 2. TASK INPUT ("The Inventory"): Capture rich task descriptions
 * 3. QUESTIONS ("The Depth Probe"): Extract signals from task descriptions
 * 4. ANALYSIS ("The Processing"): Build anticipation, communicate methodology
 * 5. SCORE ("The Mirror Moment"): Deliver score with emotional intelligence
 * 6. BREAKDOWN ("The Anatomy"): Show which tasks drive exposure and why
 * 7. ROADMAP ("The Path Forward"): Transform analysis into action
 * 8. SUMMARY ("The Commitment"): Close the loop, enable commitment tracking
 */

export interface ScreenCopy {
  headline: string;
  subheadline?: string;
  body?: string[];
  killerSentence?: string;
  cta: {
    primary: string;
    variants?: string[];
  };
  labels?: Record<string, string>;
  helper?: Record<string, string>;
}

export interface EntryCopy extends ScreenCopy {
  timeEstimate: string;
  requirements: string;
  deliverables: string[];
  differentiators: {
    title: string;
    description: string;
  }[];
}

export interface InputMethodCopy extends ScreenCopy {
  options: {
    cv: { title: string; description: string; disabled: string };
    manual: { title: string; description: string };
  };
}

export interface ManualInputCopy extends ScreenCopy {
  instructions: string[];
  example: { bad: string; good: string };
  placeholder: string;
  counter: (current: number, min: number, max: number) => string;
  transformation: { vague: string; rich: string }[];
}

export interface ClarifyingQuestionsCopy extends ScreenCopy {
  progressLabel?: (current: number, total: number) => string;
  questions: {
    contextDependency: {
      prompt: string;
      options: string[];
      signalUnlocked: string;
    };
    accountabilityScope: {
      prompt: string;
      options: string[];
      signalUnlocked: string;
    };
    environmentalPressure: {
      prompt: string;
      options: string[];
      signalUnlocked: string;
    };
  };
}

export interface AnalysisCopy extends ScreenCopy {
  processingSteps: string[];
}

export interface AssessmentJustificationCopy extends ScreenCopy {
  sections: {
    capabilities: { title: string; description: string };
    limitations: { title: string; description: string };
    signalStrength: {
      title: string;
      label: string;
      explanation: Record<'Low' | 'Moderate' | 'High', string>;
      learnMore: {
        title: string;
        content: string[];
      };
    };
  };
}

export interface RiskScoreCopy extends ScreenCopy {
  headlineTemplate: (score: number) => string;
  bandLabels: {
    protected: { label: string; range: string; meaning: string; action: string };
    mixed: { label: string; range: string; meaning: string; action: string };
    exposed: { label: string; range: string; meaning: string; action: string };
    critical: { label: string; range: string; meaning: string; action: string };
  };
  disclaimer: string;
}

export interface RiskBreakdownCopy extends ScreenCopy {
  exposureLabels: Record<'high' | 'medium' | 'low', string>;
  exposureDescriptors: Record<'high' | 'medium' | 'low', string>;
  taskCategories: {
    automated: { label: string; meaning: string; action: string };
    aiAssisted: { label: string; meaning: string; action: string };
    humanMoat: { label: string; meaning: string; action: string };
  };
}

export interface RoadmapCopy extends ScreenCopy {
  actionPrefix: string;
  impactLabel: string;
  actionCategories: {
    delegateToAi: {
      title: string;
      description: string;
    };
    elevateRole: {
      title: string;
      description: string;
    };
    amplifyMoat: {
      title: string;
      description: string;
    };
  };
}

export interface SummaryCopy extends ScreenCopy {
  sections: {
    score: string;
    highExposure: string;
    lowExposure: string;
    topAction: string;
    archetype: string;
    committedActions: string;
  };
  download: string;
  nextSteps: string;
  returnPrompt: string;
}

export interface ScenarioCopy {
  headline: string;
  subheadline: string;
  killerSentence: string;
  doNothing: {
    title: string;
    timeframes: {
      months6: string;
      months12: string;
      months24: string;
    };
  };
  ifYouAct: {
    title: string;
    timeframes: {
      months6: string;
      months12: string;
      months24: string;
    };
  };
  supportingCopy: string;
}

// =============================================================================
// SCREEN COPY DEFINITIONS - Narrative UX Implementation
// =============================================================================

/**
 * 3.1 Start Screen - "The Mirror"
 *
 * PURPOSE: Establish credibility, differentiate from fear-based tools,
 * invite self-reflection rather than passive consumption.
 *
 * EMOTIONAL STATE: Curious but guarded. User expects another doomsday calculator.
 */
export const ENTRY_COPY: EntryCopy = {
  headline: "Your job title says nothing about your work. Let's look at what you actually do.",
  subheadline:
    "AI doesn't automate jobs—it automates tasks. Some of what you do is already being done by AI. Some of it can't be. The difference isn't your title. It's the specific activities that fill your days.",
  body: [
    "This takes 10 minutes. You'll describe 3–5 of your core tasks. We'll analyze them for patterns that matter—not to scare you, but to show you where your leverage is.",
  ],
  killerSentence: "We don't predict. We clarify.",
  timeEstimate: '10 minutes',
  requirements: 'Describe 3-5 core tasks from your actual work',
  deliverables: [
    'Task-level exposure analysis',
    'Your perceived future role archetype',
    'Personalized action roadmap',
  ],
  differentiators: [
    {
      title: 'Task-Level Analysis',
      description: 'Based on what you actually do, not job titles',
    },
    {
      title: 'Signal Extraction',
      description: 'We read patterns in your work, not industry statistics',
    },
    {
      title: 'Agency-Affirming',
      description: 'Shows you where your leverage is, not what to fear',
    },
  ],
  cta: {
    primary: 'Show me what I\'m working with',
    variants: ['Begin assessment', 'Start my analysis'],
  },
};

export const INPUT_METHOD_COPY: InputMethodCopy = {
  headline: 'Choose how to provide your work information',
  body: ['The more specific your input, the more accurate your assessment.'],
  options: {
    cv: {
      title: 'Upload your CV',
      description: 'Faster setup, but may need refinement',
      disabled: 'Coming soon',
    },
    manual: {
      title: 'Describe your tasks manually',
      description: 'Takes longer, but produces more accurate results',
    },
  },
  cta: {
    primary: 'Continue',
  },
};

/**
 * 3.2 Task Input Screen - "The Inventory"
 *
 * PURPOSE: Capture rich task descriptions that reveal signals.
 * Guide users away from job-title thinking into actual work description.
 */
export const MANUAL_INPUT_COPY: ManualInputCopy = {
  headline: 'Walk me through a typical week. What actually takes your time?',
  subheadline: "Don't list responsibilities. Describe activities.",
  killerSentence: 'The details reveal the truth. Be specific.',
  instructions: [
    'Think about how you spend your time each week.',
    'Focus on activities, not titles or responsibilities.',
  ],
  example: {
    bad: '"Project management"',
    good: '"I run weekly standups, chase engineers for updates, and decide when to escalate blockers"',
  },
  transformation: [
    {
      vague: 'Project management',
      rich: 'I run weekly standups, chase engineers for updates, and decide when to escalate blockers',
    },
    {
      vague: 'Data analysis',
      rich: 'I pull sales data, build pivot tables, and write narrative summaries for non-technical stakeholders',
    },
  ],
  placeholder:
    'Describe a specific task or activity... (e.g., "I spend 3 hours weekly chasing updates from engineers who don\'t respond to Slack")',
  counter: (current: number, min: number, max: number) =>
    `${current} of ${min}-${max} tasks added`,
  cta: {
    primary: 'Analyze these tasks',
    variants: ['Continue to analysis', 'Proceed'],
  },
  labels: {
    addTask: 'Add task',
    remove: 'Remove',
  },
};

/**
 * 3.3 Clarifying Questions - "The Depth Probe"
 *
 * PURPOSE: Extract signals that task descriptions alone don't reveal.
 * Maximize information gain per question.
 */
export const CLARIFYING_QUESTIONS_COPY: ClarifyingQuestionsCopy = {
  headline: 'A few clarifying questions',
  subheadline:
    'Similar-sounding tasks can have very different exposure profiles. These questions help us distinguish between them.',
  killerSentence: 'These questions have no wrong answers—only honest ones.',
  cta: {
    primary: 'Continue',
  },
  labels: {
    next: 'Next question',
    finish: 'See analysis',
  },
  progressLabel: (current: number, total: number) => `Question ${current} of ${total}`,
  questions: {
    contextDependency: {
      prompt:
        'Think about your last 5 working days. How many of your completed tasks could a competent new hire do on day one—with access to your files, but no handover from you?',
      options: ['Almost all of them', 'About half', 'Very few', 'Almost none'],
      signalUnlocked: 'Institutional knowledge dependency',
    },
    accountabilityScope: {
      prompt:
        'When something goes wrong in your area, who explains why to leadership—you, or someone else?',
      options: ['Someone else', 'I contribute', 'I usually lead', "I'm accountable for outcomes"],
      signalUnlocked: 'Accountability weight',
    },
    environmentalPressure: {
      prompt: 'In the past 12 months, have you noticed any of these at work?',
      options: [
        'A tool now does something I used to do manually',
        "I've been asked to 'review AI output' instead of creating from scratch",
        "I've had to justify why a task needs a human instead of automation",
      ],
      signalUnlocked: 'Real-world displacement velocity',
    },
  },
};

/**
 * 3.4 Analysis Screen - "The Processing"
 *
 * PURPOSE: Build anticipation. Communicate that actual analysis is happening.
 * Reduce score anxiety by explaining methodology before revealing results.
 */
export const ANALYSIS_COPY: AnalysisCopy = {
  headline: 'Analyzing your work profile',
  subheadline: 'We\'re reading your work, not looking up your job.',
  killerSentence: "We're not looking up your job. We're reading your work.",
  processingSteps: [
    'Mapping your tasks to AI capability domains...',
    'Analyzing decision patterns and judgment requirements...',
    'Identifying your highest-leverage activities...',
    'Building your personalized exposure profile...',
  ],
  cta: {
    primary: 'View your results',
  },
};

export const ASSESSMENT_JUSTIFICATION_COPY: AssessmentJustificationCopy = {
  headline: 'Analysis complete',
  subheadline:
    'Before showing your score, here is the reasoning behind your assessment.',
  sections: {
    capabilities: {
      title: 'Where AI systems perform well',
      description: 'These capabilities overlap with parts of your described work:',
    },
    limitations: {
      title: 'Where AI systems struggle',
      description: 'These aspects of your work remain difficult to automate:',
    },
    signalStrength: {
      title: 'Assessment confidence',
      label: 'Signal strength',
      explanation: {
        Low: 'Limited input makes this assessment less precise. Consider adding more task details for a refined analysis.',
        Moderate:
          'Sufficient detail for a reasonable assessment. Additional specificity would improve precision.',
        High: 'Strong input quality. This assessment reflects a detailed understanding of your work.',
      },
      learnMore: {
        title: 'How is signal strength calculated?',
        content: [
          'Signal strength reflects how much information we have to work with.',
          'It considers: number of tasks provided, specificity of descriptions, and consistency of clarifying answers.',
          'A low signal does not mean high or low exposure. It means the assessment has wider confidence intervals.',
          'You can improve signal strength by providing more tasks or more detailed descriptions.',
        ],
      },
    },
  },
  cta: {
    primary: 'View your score',
    variants: ['See your results', 'Show my score'],
  },
};

/**
 * 3.5 Score Screen - "The Mirror Moment"
 *
 * PURPOSE: Deliver the exposure score with emotional intelligence.
 * Frame numbers as starting points, not verdicts.
 */
export const RISK_SCORE_COPY: RiskScoreCopy = {
  headline: 'Your AI exposure score',
  headlineTemplate: (score: number) =>
    `Your current work has ${score}% task exposure to AI`,
  killerSentence: "This isn't a verdict. It's a lens.",
  bandLabels: {
    protected: {
      label: 'Protected',
      range: '<30%',
      meaning:
        'Your work has strong human moats. Most of what you do requires judgment, relationships, or accountability that AI cannot replicate.',
      action: 'Your work is well-positioned. See the breakdown to understand why.',
    },
    mixed: {
      label: 'Mixed',
      range: '30-50%',
      meaning:
        'Your work is a mix of automatable and human-exclusive tasks. Your opportunity: move time from the first to the second.',
      action: 'There are specific changes you can make to shift the balance.',
    },
    exposed: {
      label: 'Exposed',
      range: '50-70%',
      meaning:
        "A significant portion of your work follows patterns AI handles well. This isn't a crisis—it's a signal.",
      action: 'The roadmap will show you how to reposition.',
    },
    critical: {
      label: 'Critical',
      range: '>70%',
      meaning:
        'Most of your described work falls where AI is already capable. This requires active attention—not panic.',
      action:
        'The good news: targeted changes can significantly reduce this exposure.',
    },
  },
  disclaimer:
    "This is a task exposure assessment, not a job loss prediction. Exposure indicates overlap with AI capabilities, not replacement timeline.",
  cta: {
    primary: 'See task breakdown',
    variants: ['View breakdown', 'Understand this score'],
  },
};

/**
 * 3.6 Breakdown Screen - "The Anatomy"
 *
 * PURPOSE: Show exactly which tasks drive exposure and why.
 * Introduce the three-category framework.
 */
export const RISK_BREAKDOWN_COPY: RiskBreakdownCopy = {
  headline: 'Your work isn\'t one thing. It\'s many things.',
  subheadline:
    'Each task is assigned to a future-role category—not just risk levels, but how the task will exist in 2-5 years.',
  killerSentence: "Your work isn't one thing. It's many things—some stable, some shifting.",
  exposureLabels: {
    high: 'Automated',
    medium: 'AI-Assisted',
    low: 'Human Moat',
  },
  exposureDescriptors: {
    high: 'AI already does this reliably. Delegate to AI now.',
    medium: 'AI does heavy lifting, you provide oversight. Learn to orchestrate.',
    low: 'Requires trust, accountability, or ambiguity AI cannot handle. Expand this.',
  },
  taskCategories: {
    automated: {
      label: 'AUTOMATED',
      meaning: 'AI already does this reliably. Task likely disappears within 1-3 years.',
      action: 'Delegate to AI now. Reclaim time for higher-value work.',
    },
    aiAssisted: {
      label: 'AI-ASSISTED',
      meaning:
        'AI does heavy lifting, human oversight needed. Role shifts from creator to editor.',
      action: 'Learn to orchestrate AI. Move value from execution to judgment.',
    },
    humanMoat: {
      label: 'HUMAN MOAT',
      meaning:
        'Requires trust, accountability, or ambiguity AI cannot handle. Protected 5+ years.',
      action: 'Expand and deepen. Make this larger share of your work.',
    },
  },
  cta: {
    primary: 'See your roadmap',
    variants: ['View actions', 'What can I do?'],
  },
};

/**
 * 3.7 Roadmap Screen - "The Path Forward"
 *
 * PURPOSE: Transform analysis into action.
 * Frame changes as identity evolution, not task-level fixes.
 */
export const ROADMAP_COPY: RoadmapCopy = {
  headline: "Your exposure isn't fixed. Here's how it shifts.",
  subheadline:
    'These recommendations are specific to your task profile. Each one shifts work toward areas where human judgment remains essential.',
  killerSentence: "The goal isn't to outrun AI. It's to work where AI can't follow.",
  actionPrefix: 'Action',
  impactLabel: 'Expected impact',
  actionCategories: {
    delegateToAi: {
      title: 'Delegate to AI',
      description:
        'Tasks in "Automated" category you still do manually. Stop doing them, or use AI tooling to compress them.',
    },
    elevateRole: {
      title: 'Elevate Your Role',
      description:
        'Tasks in "AI-Assisted" where you can move from executor to orchestrator.',
    },
    amplifyMoat: {
      title: 'Amplify Your Moat',
      description:
        'Tasks in "Human Moat" you should deliberately expand or deepen.',
    },
  },
  cta: {
    primary: 'View summary',
    variants: ['Finish assessment', 'Complete'],
  },
};

/**
 * 3.8 Summary Screen - "The Commitment"
 *
 * PURPOSE: Close the loop. Provide portable summary.
 * Enable commitment tracking. Set up for return visits.
 */
export const SUMMARY_COPY: SummaryCopy = {
  headline: 'Assessment complete',
  subheadline: 'Your results are ready.',
  killerSentence: "Knowing isn't enough. What will you do differently?",
  sections: {
    score: 'Overall exposure',
    highExposure: 'Highest exposure tasks',
    lowExposure: 'Strongest human moats',
    topAction: 'Priority action',
    archetype: 'Your perceived future role',
    committedActions: 'Actions you\'ve committed to',
  },
  download: 'Download report',
  nextSteps:
    'Review the recommended actions and consider how they apply to your current role.',
  returnPrompt:
    'Assessments like this are most useful when revisited every 3-6 months. Your work changes. So should your strategy.',
  cta: {
    primary: 'Download full report',
    variants: ['Save report', 'Export results'],
  },
};

/**
 * 4. "If You Do Nothing vs If You Act" Scenario
 *
 * Comparative projection showing two plausible futures based on action vs inaction.
 * Uses opportunity cost framing, not fear language.
 */
export const SCENARIO_COPY: ScenarioCopy = {
  headline: 'Two paths forward',
  subheadline:
    'The change is coming either way. The only question is whether you\'re steering it.',
  killerSentence:
    'The change is coming either way. The only question is whether you\'re steering it.',
  doNothing: {
    title: 'IF YOU DO NOTHING',
    timeframes: {
      months6:
        'Current work continues, but perceived value declines as others adopt AI tools.',
      months12:
        'Tasks you do manually become expectations AI handles. More work, less differentiation.',
      months24:
        'When restructuring happens, your role looks like overhead. Competing with those who adapted.',
    },
  },
  ifYouAct: {
    title: 'IF YOU ACT',
    timeframes: {
      months6:
        'You adopt AI tools for automatable tasks, freeing time for higher-judgment work.',
      months12:
        'Known for judgment and orchestration, not execution. Exposure score decreases.',
      months24:
        'When restructuring happens, positioned in work AI cannot replace. The shift accelerated you.',
    },
  },
  supportingCopy:
    "Most professionals adapt eventually. The ones who adapt first don't just survive—they gain leverage. The window isn't closing, but it is narrowing.",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export type ExposureBand = 'protected' | 'mixed' | 'exposed' | 'critical';

export function getExposureBand(score: number): ExposureBand {
  if (score < 30) return 'protected';
  if (score <= 50) return 'mixed';
  if (score <= 70) return 'exposed';
  return 'critical';
}

// Legacy compatibility - maps new bands to old for existing components
export function getExposureBandLegacy(score: number): 'low' | 'moderate' | 'high' {
  if (score <= 30) return 'low';
  if (score <= 60) return 'moderate';
  return 'high';
}

export function getScoreMeaning(score: number): {
  label: string;
  meaning: string;
  action: string;
} {
  const band = getExposureBand(score);
  return {
    label: RISK_SCORE_COPY.bandLabels[band].label,
    meaning: RISK_SCORE_COPY.bandLabels[band].meaning,
    action: RISK_SCORE_COPY.bandLabels[band].action,
  };
}

export function getSignalStrengthExplanation(
  strength: 'low' | 'moderate' | 'high'
): string {
  const keyMap: Record<'low' | 'moderate' | 'high', 'Low' | 'Moderate' | 'High'> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
  };
  return ASSESSMENT_JUSTIFICATION_COPY.sections.signalStrength.explanation[
    keyMap[strength]
  ];
}

export function getBandColorClass(score: number): string {
  const band = getExposureBand(score);
  const colorMap: Record<ExposureBand, string> = {
    protected: 'emerald',
    mixed: 'amber',
    exposed: 'orange',
    critical: 'rose',
  };
  return colorMap[band];
}
