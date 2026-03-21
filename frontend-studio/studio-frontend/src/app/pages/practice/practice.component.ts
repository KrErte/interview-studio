import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PracticeApiService,
  PracticeQuestion,
  PracticeAnswerResponse,
  BLOCKER_LABELS
} from '../../core/services/practice-api.service';

type Stage = 'setup' | 'question' | 'feedback' | 'done';

interface AnsweredQuestion {
  question: PracticeQuestion;
  answer: string;
  result: PracticeAnswerResponse;
}

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#0a0f1a] text-white px-4 py-10">
      <div class="max-w-2xl mx-auto">

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-white">Harjutused</h1>
          <p class="text-slate-400 mt-1 text-sm">Küsimused on kohandatud sinu nõrkuste põhjal</p>
        </div>

        <!-- SETUP: vali blockerid + roll -->
        <div *ngIf="stage === 'setup'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Sihtroll</label>
            <input
              [(ngModel)]="targetRole"
              type="text"
              placeholder="nt. Product Manager, Senior Dev, UX Designer"
              class="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-3">Millised on su peamised takistused?</label>
            <div class="space-y-2">
              <label
                *ngFor="let blocker of allBlockers"
                class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
                [class.border-emerald-500]="selectedBlockers.includes(blocker)"
                [class.bg-emerald-950]="selectedBlockers.includes(blocker)"
                [class.border-slate-700]="!selectedBlockers.includes(blocker)"
                [class.bg-slate-900]="!selectedBlockers.includes(blocker)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedBlockers.includes(blocker)"
                  (change)="toggleBlocker(blocker)"
                  class="w-4 h-4 accent-emerald-500"
                />
                <span class="text-sm text-slate-200">{{ blockerLabel(blocker) }}</span>
              </label>
            </div>
          </div>

          <button
            (click)="startSession()"
            [disabled]="loading || selectedBlockers.length === 0 || !targetRole.trim()"
            class="w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Laen küsimusi...' : 'Alusta harjutust' }}
          </button>

          <p *ngIf="error" class="text-red-400 text-sm text-center">{{ error }}</p>
        </div>

        <!-- QUESTION: esita küsimus -->
        <div *ngIf="stage === 'question'" class="space-y-6">

          <!-- Progress -->
          <div class="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Küsimus {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <span class="text-emerald-400">{{ answeredQuestions.length }} vastatud</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5">
            <div
              class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              [style.width.%]="progressPercent"
            ></div>
          </div>

          <!-- Küsimus -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 font-medium">
                {{ blockerLabel(currentQuestion!.blocker) }}
              </span>
            </div>
            <p class="text-lg text-white font-medium leading-relaxed">{{ currentQuestion?.text }}</p>
            <div class="mt-4 flex items-start gap-2 text-sm text-slate-500">
              <span>💡</span>
              <span>{{ currentQuestion?.tip }}</span>
            </div>
          </div>

          <!-- Vastus -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Sinu vastus</label>
            <textarea
              [(ngModel)]="currentAnswer"
              rows="5"
              placeholder="Kirjuta oma vastus siia... Kasuta konkreetseid näiteid."
              class="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          <button
            (click)="submitAnswer()"
            [disabled]="submitting || !currentAnswer.trim()"
            class="w-full py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {{ submitting ? 'Hindan vastust...' : 'Esita vastus' }}
          </button>
        </div>

        <!-- FEEDBACK: näita tagasisidet -->
        <div *ngIf="stage === 'feedback' && lastResult" class="space-y-6">

          <!-- Skoor -->
          <div class="text-center py-6">
            <div class="text-6xl font-bold mb-2"
              [class.text-red-400]="lastResult.score <= 2"
              [class.text-yellow-400]="lastResult.score === 3"
              [class.text-green-400]="lastResult.score >= 4"
            >
              {{ lastResult.score }}<span class="text-2xl text-slate-500">/5</span>
            </div>
            <div class="flex justify-center gap-1 mt-2">
              <span *ngFor="let star of [1,2,3,4,5]" class="text-2xl"
                [class.text-yellow-400]="star <= lastResult.score"
                [class.text-slate-700]="star > lastResult.score"
              >★</span>
            </div>
          </div>

          <!-- Feedback -->
          <div class="bg-slate-800/30 border border-slate-700 rounded-xl p-5 space-y-4">
            <div>
              <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Tagasiside</h3>
              <p class="text-slate-200 text-sm leading-relaxed">{{ lastResult.feedback }}</p>
            </div>
            <div class="border-t border-slate-800 pt-4">
              <h3 class="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-2">Soovitus</h3>
              <p class="text-slate-300 text-sm leading-relaxed">{{ lastResult.suggestion }}</p>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              *ngIf="currentIndex < questions.length - 1"
              (click)="nextQuestion()"
              class="flex-1 py-3 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              Järgmine küsimus →
            </button>
            <button
              *ngIf="currentIndex >= questions.length - 1"
              (click)="finishSession()"
              class="flex-1 py-3 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors"
            >
              Vaata tulemusi ✓
            </button>
          </div>
        </div>

        <!-- DONE: kokkuvõte -->
        <div *ngIf="stage === 'done'" class="space-y-6">
          <div class="text-center py-6">
            <div class="text-4xl mb-3">🎯</div>
            <h2 class="text-xl font-bold text-white">Harjutus lõpetatud!</h2>
            <p class="text-slate-400 mt-1 text-sm">Keskmiskoor: <span class="text-white font-semibold">{{ averageScore.toFixed(1) }}/5</span></p>
          </div>

          <!-- Küsimuste kokkuvõte -->
          <div class="space-y-3">
            <div
              *ngFor="let item of answeredQuestions; let i = index"
              class="bg-slate-800/30 border border-slate-800 rounded-xl p-4"
            >
              <div class="flex items-start justify-between gap-4 mb-2">
                <p class="text-sm text-slate-300 flex-1">{{ item.question.text }}</p>
                <span class="text-lg font-bold shrink-0"
                  [class.text-red-400]="item.result.score <= 2"
                  [class.text-yellow-400]="item.result.score === 3"
                  [class.text-green-400]="item.result.score >= 4"
                >{{ item.result.score }}/5</span>
              </div>
              <p class="text-xs text-slate-500 italic">{{ item.result.suggestion }}</p>
            </div>
          </div>

          <button
            (click)="reset()"
            class="w-full py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            Uus harjutussessioon
          </button>
        </div>

      </div>
    </div>
  `
})
export class PracticeComponent {
  stage: Stage = 'setup';

  targetRole = '';
  selectedBlockers: string[] = [];
  allBlockers = ['gap_over_18_months', 'career_switch', 'urgency_weak', 'experience_outdated', 'cv_positioning'];

  sessionId = '';
  questions: PracticeQuestion[] = [];
  currentIndex = 0;
  currentAnswer = '';

  lastResult: PracticeAnswerResponse | null = null;
  answeredQuestions: { question: PracticeQuestion; answer: string; result: PracticeAnswerResponse }[] = [];

  loading = false;
  submitting = false;
  error = '';

  constructor(private practiceApi: PracticeApiService) {}

  get currentQuestion(): PracticeQuestion | null {
    return this.questions[this.currentIndex] ?? null;
  }

  get progressPercent(): number {
    return this.questions.length ? (this.currentIndex / this.questions.length) * 100 : 0;
  }

  get averageScore(): number {
    if (!this.answeredQuestions.length) return 0;
    const total = this.answeredQuestions.reduce((sum, q) => sum + q.result.score, 0);
    return total / this.answeredQuestions.length;
  }

  blockerLabel(blocker: string): string {
    return BLOCKER_LABELS[blocker] ?? blocker;
  }

  toggleBlocker(blocker: string): void {
    const idx = this.selectedBlockers.indexOf(blocker);
    if (idx >= 0) {
      this.selectedBlockers.splice(idx, 1);
    } else {
      this.selectedBlockers.push(blocker);
    }
  }

  startSession(): void {
    this.loading = true;
    this.error = '';
    this.practiceApi.createSession(this.selectedBlockers, this.targetRole.trim()).subscribe({
      next: (res) => {
        this.sessionId = res.sessionId;
        this.questions = res.questions;
        this.currentIndex = 0;
        this.answeredQuestions = [];
        this.currentAnswer = '';
        this.stage = 'question';
        this.loading = false;
      },
      error: () => {
        this.error = 'Ei saanud küsimusi laadida. Proovi uuesti.';
        this.loading = false;
      }
    });
  }

  submitAnswer(): void {
    const q = this.currentQuestion;
    if (!q || !this.currentAnswer.trim()) return;

    this.submitting = true;
    this.practiceApi
      .submitAnswer(this.sessionId, q.id, q.text, this.currentAnswer.trim(), q.blocker, this.targetRole)
      .subscribe({
        next: (res) => {
          this.lastResult = res;
          this.answeredQuestions.push({ question: q, answer: this.currentAnswer.trim(), result: res });
          this.stage = 'feedback';
          this.submitting = false;
        },
        error: () => {
          this.lastResult = { score: 3, feedback: 'Vastus salvestatud.', suggestion: 'Proovi STAR-meetodit.' };
          this.answeredQuestions.push({ question: q, answer: this.currentAnswer.trim(), result: this.lastResult });
          this.stage = 'feedback';
          this.submitting = false;
        }
      });
  }

  nextQuestion(): void {
    this.currentIndex++;
    this.currentAnswer = '';
    this.lastResult = null;
    this.stage = 'question';
  }

  finishSession(): void {
    this.stage = 'done';
  }

  reset(): void {
    this.stage = 'setup';
    this.questions = [];
    this.currentIndex = 0;
    this.currentAnswer = '';
    this.lastResult = null;
    this.answeredQuestions = [];
    this.sessionId = '';
    this.error = '';
  }
}
