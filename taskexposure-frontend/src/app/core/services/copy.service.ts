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

import { Injectable, computed } from '@angular/core';
import { TranslationService } from './translation.service';
import {
  EntryCopy,
  InputMethodCopy,
  ManualInputCopy,
  ClarifyingQuestionsCopy,
  AnalysisCopy,
  AssessmentJustificationCopy,
  RiskScoreCopy,
  RiskBreakdownCopy,
  RoadmapCopy,
  SummaryCopy,
  ScenarioCopy,
  ExposureBand,
} from '../../shared/content/copy';

/**
 * CopyService - Provides translated copy for all screens
 *
 * This service wraps the TranslationService to provide the same interface
 * as the static copy constants, but with i18n support.
 */
@Injectable({
  providedIn: 'root',
})
export class CopyService {
  constructor(private t: TranslationService) {}

  get entryCopy(): EntryCopy {
    return {
      headline: this.t.t('start.headline'),
      subheadline: this.t.t('start.subheadline'),
      body: [this.t.t('start.body')],
      killerSentence: this.t.t('start.killerSentence'),
      timeEstimate: this.t.t('start.timeEstimate'),
      requirements: this.t.t('start.requirements'),
      deliverables: [
        this.t.t('start.deliverables.analysis'),
        this.t.t('start.deliverables.archetype'),
        this.t.t('start.deliverables.roadmap'),
      ],
      differentiators: [
        {
          title: this.t.t('start.differentiators.taskLevel.title'),
          description: this.t.t('start.differentiators.taskLevel.description'),
        },
        {
          title: this.t.t('start.differentiators.signalExtraction.title'),
          description: this.t.t('start.differentiators.signalExtraction.description'),
        },
        {
          title: this.t.t('start.differentiators.agencyAffirming.title'),
          description: this.t.t('start.differentiators.agencyAffirming.description'),
        },
      ],
      cta: {
        primary: this.t.t('start.cta.primary'),
        variants: [this.t.t('start.cta.variant1'), this.t.t('start.cta.variant2')],
      },
    };
  }

  get inputMethodCopy(): InputMethodCopy {
    return {
      headline: this.t.t('inputMethod.headline'),
      body: [this.t.t('inputMethod.body')],
      options: {
        cv: {
          title: this.t.t('inputMethod.cv.title'),
          description: this.t.t('inputMethod.cv.description'),
          disabled: this.t.t('inputMethod.cv.disabled'),
        },
        manual: {
          title: this.t.t('inputMethod.manual.title'),
          description: this.t.t('inputMethod.manual.description'),
        },
      },
      cta: {
        primary: this.t.t('inputMethod.cta.primary'),
      },
    };
  }

  get manualInputCopy(): ManualInputCopy {
    return {
      headline: this.t.t('manualInput.headline'),
      subheadline: this.t.t('manualInput.subheadline'),
      killerSentence: this.t.t('manualInput.killerSentence'),
      instructions: [
        this.t.t('manualInput.instructions.line1'),
        this.t.t('manualInput.instructions.line2'),
      ],
      example: {
        bad: this.t.t('manualInput.example.bad'),
        good: this.t.t('manualInput.example.good'),
      },
      transformation: [
        {
          vague: this.t.t('manualInput.transformation.example1.vague'),
          rich: this.t.t('manualInput.transformation.example1.rich'),
        },
        {
          vague: this.t.t('manualInput.transformation.example2.vague'),
          rich: this.t.t('manualInput.transformation.example2.rich'),
        },
      ],
      placeholder: this.t.t('manualInput.placeholder'),
      counter: (current: number, min: number, max: number) =>
        this.t.t('manualInput.counter', { current, min, max }),
      cta: {
        primary: this.t.t('manualInput.cta.primary'),
        variants: [this.t.t('manualInput.cta.variant1'), this.t.t('manualInput.cta.variant2')],
      },
      labels: {
        addTask: this.t.t('manualInput.labels.addTask'),
        remove: this.t.t('manualInput.labels.remove'),
      },
    };
  }

  get clarifyingQuestionsCopy(): ClarifyingQuestionsCopy {
    return {
      headline: this.t.t('questions.headline'),
      subheadline: this.t.t('questions.subheadline'),
      killerSentence: this.t.t('questions.killerSentence'),
      cta: {
        primary: this.t.t('questions.cta.primary'),
      },
      labels: {
        next: this.t.t('questions.labels.next'),
        finish: this.t.t('questions.labels.finish'),
      },
      progressLabel: (current: number, total: number) =>
        this.t.t('questions.progressLabel', { current, total }),
      questions: {
        contextDependency: {
          prompt: this.t.t('questions.contextDependency.prompt'),
          options: [
            this.t.t('questions.contextDependency.options.almostAll'),
            this.t.t('questions.contextDependency.options.aboutHalf'),
            this.t.t('questions.contextDependency.options.veryFew'),
            this.t.t('questions.contextDependency.options.almostNone'),
          ],
          signalUnlocked: this.t.t('questions.contextDependency.signalUnlocked'),
        },
        accountabilityScope: {
          prompt: this.t.t('questions.accountabilityScope.prompt'),
          options: [
            this.t.t('questions.accountabilityScope.options.someoneElse'),
            this.t.t('questions.accountabilityScope.options.contribute'),
            this.t.t('questions.accountabilityScope.options.usuallyLead'),
            this.t.t('questions.accountabilityScope.options.accountable'),
          ],
          signalUnlocked: this.t.t('questions.accountabilityScope.signalUnlocked'),
        },
        environmentalPressure: {
          prompt: this.t.t('questions.environmentalPressure.prompt'),
          options: [
            this.t.t('questions.environmentalPressure.options.toolReplacement'),
            this.t.t('questions.environmentalPressure.options.reviewAiOutput'),
            this.t.t('questions.environmentalPressure.options.justifyHuman'),
          ],
          signalUnlocked: this.t.t('questions.environmentalPressure.signalUnlocked'),
        },
      },
    };
  }

  get analysisCopy(): AnalysisCopy {
    return {
      headline: this.t.t('analysis.headline'),
      subheadline: this.t.t('analysis.subheadline'),
      killerSentence: this.t.t('analysis.killerSentence'),
      processingSteps: [
        this.t.t('analysis.processingSteps.step1'),
        this.t.t('analysis.processingSteps.step2'),
        this.t.t('analysis.processingSteps.step3'),
        this.t.t('analysis.processingSteps.step4'),
      ],
      cta: {
        primary: this.t.t('analysis.cta.primary'),
      },
    };
  }

  get assessmentJustificationCopy(): AssessmentJustificationCopy {
    return {
      headline: this.t.t('justification.headline'),
      subheadline: this.t.t('justification.subheadline'),
      sections: {
        capabilities: {
          title: this.t.t('justification.capabilities.title'),
          description: this.t.t('justification.capabilities.description'),
        },
        limitations: {
          title: this.t.t('justification.limitations.title'),
          description: this.t.t('justification.limitations.description'),
        },
        signalStrength: {
          title: this.t.t('justification.signalStrength.title'),
          label: this.t.t('justification.signalStrength.label'),
          explanation: {
            Low: this.t.t('justification.signalStrength.explanation.low'),
            Moderate: this.t.t('justification.signalStrength.explanation.moderate'),
            High: this.t.t('justification.signalStrength.explanation.high'),
          },
          learnMore: {
            title: this.t.t('justification.signalStrength.learnMore.title'),
            content: [
              this.t.t('justification.signalStrength.learnMore.content.line1'),
              this.t.t('justification.signalStrength.learnMore.content.line2'),
              this.t.t('justification.signalStrength.learnMore.content.line3'),
              this.t.t('justification.signalStrength.learnMore.content.line4'),
            ],
          },
        },
      },
      cta: {
        primary: this.t.t('justification.cta.primary'),
        variants: [this.t.t('justification.cta.variant1'), this.t.t('justification.cta.variant2')],
      },
    };
  }

  get riskScoreCopy(): RiskScoreCopy {
    return {
      headline: this.t.t('score.headline'),
      headlineTemplate: (score: number) => this.t.t('score.headlineTemplate', { score }),
      killerSentence: this.t.t('score.killerSentence'),
      bandLabels: {
        protected: {
          label: this.t.t('score.band.protected.label'),
          range: this.t.t('score.band.protected.range'),
          meaning: this.t.t('score.band.protected.meaning'),
          action: this.t.t('score.band.protected.action'),
        },
        mixed: {
          label: this.t.t('score.band.mixed.label'),
          range: this.t.t('score.band.mixed.range'),
          meaning: this.t.t('score.band.mixed.meaning'),
          action: this.t.t('score.band.mixed.action'),
        },
        exposed: {
          label: this.t.t('score.band.exposed.label'),
          range: this.t.t('score.band.exposed.range'),
          meaning: this.t.t('score.band.exposed.meaning'),
          action: this.t.t('score.band.exposed.action'),
        },
        critical: {
          label: this.t.t('score.band.critical.label'),
          range: this.t.t('score.band.critical.range'),
          meaning: this.t.t('score.band.critical.meaning'),
          action: this.t.t('score.band.critical.action'),
        },
      },
      disclaimer: this.t.t('score.disclaimer'),
      cta: {
        primary: this.t.t('score.cta.primary'),
        variants: [this.t.t('score.cta.variant1'), this.t.t('score.cta.variant2')],
      },
    };
  }

  get riskBreakdownCopy(): RiskBreakdownCopy {
    return {
      headline: this.t.t('breakdown.headline'),
      subheadline: this.t.t('breakdown.subheadline'),
      killerSentence: this.t.t('breakdown.killerSentence'),
      exposureLabels: {
        high: this.t.t('breakdown.exposureLabels.high'),
        medium: this.t.t('breakdown.exposureLabels.medium'),
        low: this.t.t('breakdown.exposureLabels.low'),
      },
      exposureDescriptors: {
        high: this.t.t('breakdown.exposureDescriptors.high'),
        medium: this.t.t('breakdown.exposureDescriptors.medium'),
        low: this.t.t('breakdown.exposureDescriptors.low'),
      },
      taskCategories: {
        automated: {
          label: this.t.t('breakdown.taskCategories.automated.label'),
          meaning: this.t.t('breakdown.taskCategories.automated.meaning'),
          action: this.t.t('breakdown.taskCategories.automated.action'),
        },
        aiAssisted: {
          label: this.t.t('breakdown.taskCategories.aiAssisted.label'),
          meaning: this.t.t('breakdown.taskCategories.aiAssisted.meaning'),
          action: this.t.t('breakdown.taskCategories.aiAssisted.action'),
        },
        humanMoat: {
          label: this.t.t('breakdown.taskCategories.humanMoat.label'),
          meaning: this.t.t('breakdown.taskCategories.humanMoat.meaning'),
          action: this.t.t('breakdown.taskCategories.humanMoat.action'),
        },
      },
      cta: {
        primary: this.t.t('breakdown.cta.primary'),
        variants: [this.t.t('breakdown.cta.variant1'), this.t.t('breakdown.cta.variant2')],
      },
    };
  }

  get roadmapCopy(): RoadmapCopy {
    return {
      headline: this.t.t('roadmap.headline'),
      subheadline: this.t.t('roadmap.subheadline'),
      killerSentence: this.t.t('roadmap.killerSentence'),
      actionPrefix: this.t.t('roadmap.actionPrefix'),
      impactLabel: this.t.t('roadmap.impactLabel'),
      actionCategories: {
        delegateToAi: {
          title: this.t.t('roadmap.actionCategories.delegateToAi.title'),
          description: this.t.t('roadmap.actionCategories.delegateToAi.description'),
        },
        elevateRole: {
          title: this.t.t('roadmap.actionCategories.elevateRole.title'),
          description: this.t.t('roadmap.actionCategories.elevateRole.description'),
        },
        amplifyMoat: {
          title: this.t.t('roadmap.actionCategories.amplifyMoat.title'),
          description: this.t.t('roadmap.actionCategories.amplifyMoat.description'),
        },
      },
      cta: {
        primary: this.t.t('roadmap.cta.primary'),
        variants: [this.t.t('roadmap.cta.variant1'), this.t.t('roadmap.cta.variant2')],
      },
    };
  }

  get summaryCopy(): SummaryCopy {
    return {
      headline: this.t.t('summary.headline'),
      subheadline: this.t.t('summary.subheadline'),
      killerSentence: this.t.t('summary.killerSentence'),
      sections: {
        score: this.t.t('summary.sections.score'),
        highExposure: this.t.t('summary.sections.highExposure'),
        lowExposure: this.t.t('summary.sections.lowExposure'),
        topAction: this.t.t('summary.sections.topAction'),
        archetype: this.t.t('summary.sections.archetype'),
        committedActions: this.t.t('summary.sections.committedActions'),
      },
      download: this.t.t('summary.download'),
      nextSteps: this.t.t('summary.nextSteps'),
      returnPrompt: this.t.t('summary.returnPrompt'),
      cta: {
        primary: this.t.t('summary.cta.primary'),
        variants: [this.t.t('summary.cta.variant1'), this.t.t('summary.cta.variant2')],
      },
    };
  }

  get scenarioCopy(): ScenarioCopy {
    return {
      headline: this.t.t('scenario.headline'),
      subheadline: this.t.t('scenario.subheadline'),
      killerSentence: this.t.t('scenario.killerSentence'),
      doNothing: {
        title: this.t.t('scenario.doNothing.title'),
        timeframes: {
          months6: this.t.t('scenario.doNothing.timeframes.months6'),
          months12: this.t.t('scenario.doNothing.timeframes.months12'),
          months24: this.t.t('scenario.doNothing.timeframes.months24'),
        },
      },
      ifYouAct: {
        title: this.t.t('scenario.ifYouAct.title'),
        timeframes: {
          months6: this.t.t('scenario.ifYouAct.timeframes.months6'),
          months12: this.t.t('scenario.ifYouAct.timeframes.months12'),
          months24: this.t.t('scenario.ifYouAct.timeframes.months24'),
        },
      },
      supportingCopy: this.t.t('scenario.supportingCopy'),
    };
  }

  // Roadmap-specific helpers
  getProgressHint(committedCount: number, totalCount: number): string {
    if (committedCount === 0) {
      return this.t.t('roadmap.progressHints.empty');
    }
    if (committedCount === totalCount) {
      return this.t.t('roadmap.progressHints.complete');
    }
    if (committedCount === 1) {
      return this.t.t('roadmap.progressHints.partial', { count: committedCount });
    }
    return this.t.t('roadmap.progressHints.partialPlural', { count: committedCount });
  }

  getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
    return this.t.t(`roadmap.difficultyLabels.${difficulty}`);
  }

  getTimeLabel(key: 'months6' | 'months12' | 'months24'): string {
    return this.t.t(`scenario.timeLabels.${key}`);
  }

  // Helper functions from copy.ts
  getExposureBand(score: number): ExposureBand {
    if (score < 30) return 'protected';
    if (score <= 50) return 'mixed';
    if (score <= 70) return 'exposed';
    return 'critical';
  }

  getScoreMeaning(score: number): {
    label: string;
    meaning: string;
    action: string;
  } {
    const band = this.getExposureBand(score);
    return {
      label: this.riskScoreCopy.bandLabels[band].label,
      meaning: this.riskScoreCopy.bandLabels[band].meaning,
      action: this.riskScoreCopy.bandLabels[band].action,
    };
  }

  getBandColorClass(score: number): string {
    const band = this.getExposureBand(score);
    const colorMap: Record<ExposureBand, string> = {
      protected: 'emerald',
      mixed: 'amber',
      exposed: 'orange',
      critical: 'rose',
    };
    return colorMap[band];
  }

  getSignalStrengthExplanation(strength: 'low' | 'moderate' | 'high'): string {
    const keyMap: Record<'low' | 'moderate' | 'high', 'Low' | 'Moderate' | 'High'> = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
    };
    return this.assessmentJustificationCopy.sections.signalStrength.explanation[
      keyMap[strength]
    ];
  }
}
