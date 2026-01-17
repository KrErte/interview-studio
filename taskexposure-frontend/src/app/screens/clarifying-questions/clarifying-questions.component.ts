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

import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Task } from '../../shared/models/task.model';
import { ClarifyingQuestion as ApiClarifyingQuestion } from '../../core/models/risk-api.models';
import { CopyService } from '../../core/services/copy.service';



interface LocalClarifyingQuestion {
  id: string;
  context: string;
  question: string;
  hint?: string;
  options?: string[];
}

@Component({
  selector: 'app-clarifying-questions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clarifying-questions.component.html',
  styleUrl: './clarifying-questions.component.scss',
})
export class ClarifyingQuestionsComponent implements OnInit, OnChanges {
  private copyService = inject(CopyService);

  @Input() tasks: Task[] = [];
  @Input() apiQuestions: ApiClarifyingQuestion[] = [];
  @Input() isLoading = false;
  @Output() complete = new EventEmitter<Map<string, string>>();

  get copy() {
    return this.copyService.clarifyingQuestionsCopy;
  }

  questions: LocalClarifyingQuestion[] = [];
  currentQuestionIndex: number = 0;
  answers: Map<string, string> = new Map();
  currentAnswer: string = '';

  get currentQuestion(): LocalClarifyingQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get hasSelectedAnswer(): boolean {
    if (!this.currentQuestion) return false;
    // For API questions (text input), check if currentAnswer is filled
    if (!this.currentQuestion.options) {
      return this.currentAnswer.trim().length > 0;
    }
    // For option-based questions, check if an answer is stored
    return this.answers.has(this.currentQuestion.id);
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get progressLabel(): string {
    if (this.copy.progressLabel) {
      return this.copy.progressLabel(this.currentQuestionIndex + 1, this.questions.length);
    }
    return '';
  }

  get ctaLabel(): string {
    return this.isLastQuestion
      ? (this.copy.labels?.['finish'] || this.copy.cta.primary)
      : (this.copy.labels?.['next'] || 'Next');
  }

  ngOnInit(): void {
    this.initializeQuestions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['apiQuestions'] && this.apiQuestions.length > 0) {
      this.initializeQuestions();
    }
  }

  private initializeQuestions(): void {
    if (this.apiQuestions && this.apiQuestions.length > 0) {
      // Use API questions
      this.questions = this.apiQuestions.map((q) => ({
        id: q.id,
        context: q.hint || '',
        question: q.question,
        hint: q.hint,
      }));
    } else {
      // Fallback to generated questions
      this.generateFallbackQuestions();
    }
  }

  private generateFallbackQuestions(): void {
    this.questions = [
      {
        id: '1',
        context: 'You mentioned tasks involving data or information processing.',
        question: 'Which best describes your involvement?',
        options: [
          'Following established procedures and templates',
          'Designing new procedures based on changing requirements',
          'Both equally',
        ],
      },
      {
        id: '2',
        context: 'You mentioned communication-related tasks.',
        question: 'Which best describes your communication responsibilities?',
        options: [
          'Routine updates and status reports',
          'Negotiating outcomes with stakeholders',
          'Both equally',
        ],
      },
      {
        id: '3',
        context: 'You mentioned work involving analysis or review.',
        question: 'Which best describes your analytical work?',
        options: [
          'Checking against defined criteria',
          'Evaluating trade-offs with incomplete information',
          'Both equally',
        ],
      },
    ];
  }

  selectAnswer(optionIndex: number): void {
    if (this.currentQuestion && this.currentQuestion.options) {
      this.answers.set(this.currentQuestion.id, this.currentQuestion.options[optionIndex]);
    }
  }

  submitTextAnswer(): void {
    if (this.currentQuestion && this.currentAnswer.trim()) {
      this.answers.set(this.currentQuestion.id, this.currentAnswer.trim());
      this.currentAnswer = '';
      this.nextQuestion();
    }
  }

  nextQuestion(): void {
    if (this.isLastQuestion) {
      // Save current answer if it's a text input
      if (this.currentQuestion && !this.currentQuestion.options && this.currentAnswer.trim()) {
        this.answers.set(this.currentQuestion.id, this.currentAnswer.trim());
      }
      this.complete.emit(this.answers);
    } else {
      // Save current answer if it's a text input
      if (this.currentQuestion && !this.currentQuestion.options && this.currentAnswer.trim()) {
        this.answers.set(this.currentQuestion.id, this.currentAnswer.trim());
        this.currentAnswer = '';
      }
      this.currentQuestionIndex++;
    }
  }
}
