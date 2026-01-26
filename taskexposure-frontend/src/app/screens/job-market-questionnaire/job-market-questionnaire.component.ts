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

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobMarketService } from '../../core/services/job-market.service';
import {
  JobMarketAnswers,
  RoleTarget,
  LastWorkTiming,
  JobUrgency,
  WorkExamples,
  MainBlocker,
} from '../../shared/models/job-market.model';

interface QuestionOption<T> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-job-market-questionnaire',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-market-questionnaire.component.html',
  styleUrl: './job-market-questionnaire.component.scss',
})
export class JobMarketQuestionnaireComponent {
  private jobMarketService = inject(JobMarketService);

  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  // Answers
  roleTarget: RoleTarget | null = null;
  lastWorkTiming: LastWorkTiming | null = null;
  urgency: JobUrgency | null = null;
  workExamples: WorkExamples | null = null;
  mainBlocker: MainBlocker | null = null;

  // Question 1 options
  readonly roleTargetOptions: QuestionOption<RoleTarget>[] = [
    { value: 'same-role', label: 'Same as last job' },
    { value: 'slight-step-up', label: 'Slight step up' },
    { value: 'big-step-up', label: 'Big step up' },
    { value: 'career-switch', label: 'Career switch' },
    { value: 'not-sure', label: 'Not sure' },
  ];

  // Question 2 options
  readonly lastWorkTimingOptions: QuestionOption<LastWorkTiming>[] = [
    { value: 'less-than-6-months', label: 'Less than 6 months ago' },
    { value: '6-12-months', label: '6-12 months ago' },
    { value: '12-24-months', label: '12-24 months ago' },
    { value: 'more-than-2-years', label: 'More than 2 years ago' },
    { value: 'never', label: 'Never' },
  ];

  // Question 3 options
  readonly urgencyOptions: QuestionOption<JobUrgency>[] = [
    { value: 'immediate', label: 'Immediate (weeks)' },
    { value: 'soon', label: 'Soon (1-2 months)' },
    { value: 'flexible', label: 'Flexible' },
    { value: 'exploring', label: 'Just exploring' },
  ];

  // Question 4 options
  readonly workExamplesOptions: QuestionOption<WorkExamples>[] = [
    { value: 'real-production', label: 'Yes, real production or client work' },
    { value: 'some-outdated', label: 'Some, but outdated' },
    { value: 'personal-only', label: 'Only personal projects' },
    { value: 'none', label: 'No' },
  ];

  // Question 5 options
  readonly mainBlockerOptions: QuestionOption<MainBlocker>[] = [
    { value: 'not-getting-interviews', label: 'Not getting interviews' },
    { value: 'failing-interviews', label: 'Failing interviews' },
    { value: 'unclear-direction', label: 'Unclear direction' },
    { value: 'skills-gap', label: 'Skills gap' },
    { value: 'confidence-burnout', label: 'Confidence or burnout' },
  ];

  get isComplete(): boolean {
    return !!(
      this.roleTarget &&
      this.lastWorkTiming &&
      this.urgency &&
      this.workExamples &&
      this.mainBlocker
    );
  }

  get answeredCount(): number {
    let count = 0;
    if (this.roleTarget) count++;
    if (this.lastWorkTiming) count++;
    if (this.urgency) count++;
    if (this.workExamples) count++;
    if (this.mainBlocker) count++;
    return count;
  }

  onContinue(): void {
    if (!this.isComplete) return;

    const answers: JobMarketAnswers = {
      roleTarget: this.roleTarget!,
      lastWorkTiming: this.lastWorkTiming!,
      urgency: this.urgency!,
      workExamples: this.workExamples!,
      mainBlocker: this.mainBlocker!,
    };

    this.jobMarketService.setAnswers(answers);
    this.continue.emit();
  }

  onBack(): void {
    this.back.emit();
  }
}
