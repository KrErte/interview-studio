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

export type JobMarketStatus = 'red' | 'yellow' | 'green';

export type RoleTarget =
  | 'same-role'
  | 'slight-step-up'
  | 'big-step-up'
  | 'career-switch'
  | 'not-sure';

export type LastWorkTiming =
  | 'less-than-6-months'
  | '6-12-months'
  | '12-24-months'
  | 'more-than-2-years'
  | 'never';

export type JobUrgency =
  | 'immediate'
  | 'soon'
  | 'flexible'
  | 'exploring';

export type WorkExamples =
  | 'real-production'
  | 'some-outdated'
  | 'personal-only'
  | 'none';

export type MainBlocker =
  | 'not-getting-interviews'
  | 'failing-interviews'
  | 'unclear-direction'
  | 'skills-gap'
  | 'confidence-burnout';

export interface JobMarketAnswers {
  roleTarget: RoleTarget;
  lastWorkTiming: LastWorkTiming;
  urgency: JobUrgency;
  workExamples: WorkExamples;
  mainBlocker: MainBlocker;
}

export interface Blocker {
  title: string;
  description: string;
}

export interface WeeklyAction {
  week: number;
  title: string;
  description: string;
}

export interface JobMarketFreeResult {
  status: JobMarketStatus;
  statusExplanation: string;
  blockers: Blocker[];
  teaserAction: string;
}

export interface CvRewriteBullet {
  original: string;
  improved: string;
}

export interface JobMarketPaidResult extends JobMarketFreeResult {
  weeklyPlan: WeeklyAction[];
  cvRewriteBullets: CvRewriteBullet[];
  rolesToAvoid: string[];
  pivotSuggestion?: string;
}

export interface JobMarketState {
  cvFileName?: string;
  cvText?: string;
  answers?: JobMarketAnswers;
  freeResult?: JobMarketFreeResult;
  paidResult?: JobMarketPaidResult;
  isPaid: boolean;
}
