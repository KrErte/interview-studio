import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskQuestion } from '../../../core/models/risk.models';
import { buildMockAnswer, buildMockProfile } from '../../../shared/mock/mock-data';
import { environment } from '../../../../environments/environment';

export interface QnASubmitEvent {
  answer: string;
  skipped: boolean;
}

@Component({
  selector: 'app-inline-qna',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-emerald-400 text-sm font-semibold tracking-wide uppercase">
            Inline Q&A
          </h3>
          <span class="text-slate-400 text-sm">
            Question {{ currentIndex }} of {{ totalQuestions }}
          </span>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            class="bg-emerald-500 h-full transition-all duration-300"
            [style.width.%]="progress">
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <p class="text-slate-400 mt-4">Loading next question...</p>
      </div>

      <!-- Question -->
      <div *ngIf="!loading && question" class="space-y-6">
        <!-- Question Title -->
        <div>
          <h4 class="text-slate-100 text-lg font-medium mb-2">
            {{ resolveQuestionTitle(question) }}
          </h4>
          <p *ngIf="hasSecondaryText(question)" class="text-slate-400 text-sm">
            {{ resolveQuestionText(question) }}
          </p>
        </div>

        <!-- Answer Input -->
        <div>
          <textarea
            [(ngModel)]="answer"
            [placeholder]="question.placeholder || 'Type your answer here...'"
            [disabled]="submitting"
            rows="6"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none">
          </textarea>
          <div *ngIf="showMockTools" class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              (click)="fillMockAnswer()"
              class="inline-flex items-center gap-1 rounded border border-emerald-500/60 px-2 py-1 font-semibold text-emerald-200 hover:border-emerald-400 hover:text-emerald-100">
              Generate mock answer
            </button>
            <button
              type="button"
              (click)="clearAnswer()"
              class="inline-flex items-center gap-1 rounded border border-slate-700 px-2 py-1 font-semibold text-slate-200 hover:border-slate-500">
              Clear
            </button>
            <span>For demo/testing only</span>
          </div>
          <p class="text-slate-500 text-xs mt-2">
            Minimum 20 characters recommended for better assessment accuracy
          </p>
        </div>

        <!-- Confidence Warning -->
        <div *ngIf="showSkipWarning" class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start space-x-3">
          <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <p class="text-amber-400 text-sm font-medium">
              Skipping reduces confidence
            </p>
            <p class="text-amber-300/80 text-xs mt-1">
              Each skipped question reduces your assessment confidence by approximately 8%.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between pt-2">
          <button
            (click)="onSkip()"
            [disabled]="submitting"
            class="px-6 py-2.5 text-slate-400 hover:text-slate-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Skip Question
          </button>

          <button
            (click)="onSubmit()"
            [disabled]="submitting || !canSubmit"
            class="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500 flex items-center space-x-2">
            <span *ngIf="!submitting">Submit Answer</span>
            <span *ngIf="submitting" class="flex items-center space-x-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InlineQnAComponent {
  @Input() question: RiskQuestion | null = null;
  @Input() currentIndex: number = 1;
  @Input() totalQuestions: number = 3;
  @Input() loading: boolean = false;
  @Input() submitting: boolean = false;

  @Output() submitAnswer = new EventEmitter<QnASubmitEvent>();
  @Output() skipQuestion = new EventEmitter<void>();

  answer: string = '';
  showSkipWarning: boolean = false;

  get progress(): number {
    return (this.currentIndex / this.totalQuestions) * 100;
  }

  get canSubmit(): boolean {
    return this.answer.trim().length > 0;
  }

  get showMockTools(): boolean {
    return !!environment.enableMockTools;
  }

  resolveQuestionTitle(question: RiskQuestion): string {
    if (!question) {
      return '';
    }
    if (typeof question === 'string') {
      return question;
    }
    if ((question as any).question) {
      return (question as any).question as string;
    }
    if (question.title) {
      return question.title;
    }
    return question.text || '';
  }

  resolveQuestionText(question: RiskQuestion): string {
    if (!question) {
      return '';
    }
    if (typeof question === 'string') {
      return question;
    }
    if (question.text) {
      return question.text;
    }
    if ((question as any).question) {
      return (question as any).question as string;
    }
    return '';
  }

  hasSecondaryText(question: RiskQuestion): boolean {
    if (!question) return false;
    if (typeof question === 'string') return false;
    if (question.title && question.text) return true;
    return false;
  }

  fillMockAnswer(): void {
    const profile = buildMockProfile();
    const qText = this.resolveQuestionText(this.question as RiskQuestion);
    this.answer = buildMockAnswer(qText || 'Describe your experience.', profile);
  }

  clearAnswer(): void {
    this.answer = '';
    this.showSkipWarning = false;
  }

  onSubmit(): void {
    if (!this.canSubmit || this.submitting) {
      return;
    }

    this.submitAnswer.emit({
      answer: this.answer.trim(),
      skipped: false
    });

    // Reset for next question
    this.answer = '';
    this.showSkipWarning = false;
  }

  onSkip(): void {
    if (this.submitting) {
      return;
    }

    // Show warning first, then allow skip on second click
    if (!this.showSkipWarning) {
      this.showSkipWarning = true;
      setTimeout(() => {
        this.showSkipWarning = false;
      }, 5000);
      return;
    }

    this.skipQuestion.emit();

    // Reset for next question
    this.answer = '';
    this.showSkipWarning = false;
  }
}
