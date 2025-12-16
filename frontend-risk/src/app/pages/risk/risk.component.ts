import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskApiService, RiskQuestion, RiskSummary } from '../../core/services/risk-api.service';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-[70vh] items-center justify-center">
      <div class="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-50 shadow-xl shadow-emerald-500/10">
        <p class="text-xs uppercase text-emerald-300 font-semibold mb-2">AI Risk Assessment</p>
        <h1 class="text-2xl font-bold mb-4">Your snapshot</h1>

        <ng-container *ngIf="summary; else loadingTpl">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-2">
              <p class="text-sm text-slate-400">Risk score</p>
              <p class="text-5xl font-extrabold text-emerald-300">{{ summary.riskScore }}%</p>
              <p class="text-sm text-slate-300">Band:
                <span class="font-semibold text-emerald-200">{{ summary.band }}</span>
              </p>
            </div>
            <div class="md:col-span-1">
              <p class="text-sm text-slate-400">Message</p>
              <p class="text-sm text-slate-200 mt-2 leading-relaxed">{{ summary.message }}</p>
            </div>
          </div>

          <div class="mt-6 space-y-2">
            <div class="flex items-center justify-between text-sm text-slate-300">
              <span class="font-semibold text-slate-100">AI confidence</span>
              <span class="text-emerald-200 font-semibold">{{ confidencePct }}% confident</span>
            </div>
            <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                class="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                [style.width.%]="confidencePct"
              ></div>
            </div>
            <p class="text-xs text-slate-400">
              Based on your CV. Answer 2–3 questions to improve accuracy.
            </p>
          </div>

          <div class="mt-4">
            <button
              *ngIf="shouldShowImproveCta"
              type="button"
              (click)="toggleInlineQa()"
              class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400 disabled:opacity-60"
              [disabled]="questionLoading || saveLoading"
            >
              {{ qaExpanded ? 'Hide' : 'Improve accuracy' }}
            </button>
          </div>

          <div
            *ngIf="qaExpanded"
            class="mt-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wide text-emerald-300 font-semibold">Inline Q&A</p>
                <p class="text-sm text-slate-300">
                  Question {{ questionIndex + 1 }} of {{ totalQuestions || '...' }}
                </p>
              </div>
              <span class="text-xs text-slate-400" *ngIf="currentQuestion?.label">
                {{ currentQuestion?.label }}
              </span>
            </div>

            <ng-container *ngIf="currentQuestion; else questionLoadingTpl">
              <div class="space-y-2">
                <p class="text-base font-semibold text-slate-100">
                  {{ currentQuestion?.question }}
                </p>
                <textarea
                  [(ngModel)]="answerText"
                  rows="4"
                  class="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
                  placeholder="Type your answer..."
                  [disabled]="saveLoading"
                ></textarea>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  (click)="submitAnswer()"
                  class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400 disabled:opacity-60"
                  [disabled]="saveLoading || !answerText.trim()"
                >
                  {{ saveLoading ? 'Submitting...' : 'Submit answer' }}
                </button>
                <button
                  type="button"
                  (click)="skipQuestion()"
                  class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-emerald-400 disabled:opacity-60"
                  [disabled]="saveLoading || questionLoading"
                >
                  Skip
                </button>
              </div>
            </ng-container>

            <ng-template #questionLoadingTpl>
              <p class="text-sm text-slate-300">Loading question...</p>
            </ng-template>

            <p class="text-xs text-rose-400" *ngIf="qaError">{{ qaError }}</p>
          </div>
        </ng-container>

        <ng-template #loadingTpl>
          <p class="text-sm text-slate-300">Loading summary...</p>
        </ng-template>

        <p class="text-xs text-rose-400 mt-4" *ngIf="error">{{ error }}</p>
      </div>
    </div>
  `
})
export class RiskComponent implements OnInit {
  summary: RiskSummary | null = null;
  error = '';
  loadingSummary = false;

  qaExpanded = false;
  questionLoading = false;
  saveLoading = false;
  qaError = '';
  currentQuestion: RiskQuestion | null = null;
  answerText = '';
  questionIndex = 0;
  totalQuestions = 0;

  constructor(private riskApi: RiskApiService) {}

  get confidencePct(): number {
    const raw = this.summary?.confidence ?? 0;
    const normalized = raw <= 1 ? raw * 100 : raw;
    return Math.max(0, Math.min(100, Math.round(normalized)));
  }

  get missingSignalsCount(): number {
    return this.summary?.missingSignals?.length ?? 0;
  }

  get shouldShowImproveCta(): boolean {
    return this.confidencePct < 85 || this.missingSignalsCount > 0;
  }

  ngOnInit(): void {
    this.loadSummary();
  }

  toggleInlineQa(): void {
    this.qaExpanded = !this.qaExpanded;
    if (this.qaExpanded && !this.currentQuestion) {
      this.loadQuestion();
    }
  }

  submitAnswer(): void {
    if (!this.currentQuestion || !this.answerText.trim()) {
      return;
    }
    this.saveLoading = true;
    this.qaError = '';
    const answer = this.answerText.trim();
    this.riskApi.submitAnswer(this.currentQuestion.signalKey, answer).subscribe({
      next: () => {
        this.saveLoading = false;
        this.answerText = '';
        this.loadSummary();
        this.loadQuestion();
      },
      error: (err: any) => {
        this.saveLoading = false;
        this.qaError = err?.error?.message || 'Could not submit answer.';
      }
    });
  }

  skipQuestion(): void {
    if (!this.currentQuestion) {
      return;
    }
    this.saveLoading = true;
    this.qaError = '';
    this.riskApi.skipQuestion(this.currentQuestion.signalKey).subscribe({
      next: () => {
        this.saveLoading = false;
        this.answerText = '';
        this.loadQuestion();
      },
      error: (err: any) => {
        this.saveLoading = false;
        this.qaError = err?.error?.message || 'Could not skip question.';
      }
    });
  }

  private loadSummary(): void {
    this.loadingSummary = true;
    this.error = '';
    this.riskApi.getSummary().subscribe({
      next: (res: RiskSummary) => {
        this.summary = res;
        this.loadingSummary = false;
        this.totalQuestions = res?.missingSignals?.length || this.totalQuestions || 3;
      },
      error: () => {
        this.loadingSummary = false;
        this.error = 'Could not load risk summary.';
        this.summary = {
          riskScore: 42,
          band: 'MEDIUM',
          message: 'Demo data (backend stub not reachable).',
          confidence: 0.62,
          missingSignals: ['ownership_accountability', 'communication_clarity']
        };
      }
    });
  }

  private loadQuestion(): void {
    this.questionLoading = true;
    this.qaError = '';
    this.riskApi.getNextQuestion().subscribe({
      next: (q: RiskQuestion) => {
        this.currentQuestion = q;
        this.questionIndex = q.index ?? this.questionIndex;
        this.totalQuestions = q.total ?? (this.totalQuestions || this.missingSignalsCount || 3);
        this.questionLoading = false;
      },
      error: (err: any) => {
        this.questionLoading = false;
        this.qaError = err?.error?.message || 'No more questions available.';
        this.currentQuestion = null;
      }
    });
  }
}
