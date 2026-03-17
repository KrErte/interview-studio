import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaService, InterviewSimResponse, InterviewFeedback } from '../../../services/arena.service';

interface ChatMessage {
  role: 'interviewer' | 'user';
  text: string;
}

@Component({
  selector: 'app-interview-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-100">Interview Simulator</h1>
        </div>
        <p class="text-slate-400">Practice with AI-powered mock interviews and get detailed feedback.</p>
      </div>

      <!-- Phase 1: Setup -->
      <div *ngIf="phase === 'setup'" class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Target Role *</label>
          <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Senior Backend Developer"
                 class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Interview Type</label>
          <select [(ngModel)]="interviewType"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="TECHNICAL">Technical</option>
            <option value="BEHAVIORAL">Behavioral</option>
            <option value="MIXED">Mixed</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Experience Level</label>
          <select [(ngModel)]="experienceLevel"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="JUNIOR">Junior (0-2 years)</option>
            <option value="MID">Mid-level (3-5 years)</option>
            <option value="SENIOR">Senior (6+ years)</option>
          </select>
        </div>
        <button (click)="startInterview()" [disabled]="loading || !targetRole.trim()"
                class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
          <div *ngIf="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          {{ loading ? 'Starting...' : 'Start Interview' }}
        </button>
      </div>

      <!-- Phase 2: Chat -->
      <div *ngIf="phase === 'chat'" class="flex flex-col" style="min-height: 60vh;">
        <!-- Progress bar -->
        <div class="mb-4 flex items-center justify-between text-xs text-slate-400">
          <span>Question {{ currentQuestionNum }} of {{ totalQuestions }}</span>
          <button *ngIf="currentQuestionNum >= 5" (click)="endInterview()"
                  class="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/10 transition">
            End Interview
          </button>
        </div>
        <div class="mb-6 h-1.5 rounded-full bg-slate-800">
          <div class="h-1.5 rounded-full bg-blue-500 transition-all"
               [style.width.%]="(currentQuestionNum / totalQuestions) * 100"></div>
        </div>

        <!-- Chat messages -->
        <div class="flex-1 space-y-4 mb-6 overflow-y-auto" style="max-height: 50vh;">
          <div *ngFor="let msg of messages"
               class="flex"
               [ngClass]="msg.role === 'interviewer' ? 'justify-start' : 'justify-end'">
            <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                 [ngClass]="msg.role === 'interviewer'
                   ? 'bg-slate-800 text-slate-200 rounded-bl-md'
                   : 'bg-emerald-600/80 text-white rounded-br-md'">
              {{ msg.text }}
            </div>
          </div>
          <div *ngIf="loading" class="flex justify-start">
            <div class="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3">
              <div class="flex gap-1">
                <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 0ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 150ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="flex gap-3">
          <input [(ngModel)]="userAnswer" type="text" placeholder="Type your answer..."
                 (keydown.enter)="sendAnswer()"
                 [disabled]="loading"
                 class="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50" />
          <button (click)="sendAnswer()" [disabled]="loading || !userAnswer.trim()"
                  class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
            Send
          </button>
        </div>
      </div>

      <!-- Phase 3: Feedback -->
      <div *ngIf="phase === 'feedback' && feedback" class="space-y-6">
        <!-- Overall Score -->
        <div class="text-center py-8">
          <div class="inline-flex h-28 w-28 items-center justify-center rounded-full border-4"
               [ngClass]="{
                 'border-emerald-500 text-emerald-400': feedback.overallScore >= 70,
                 'border-amber-500 text-amber-400': feedback.overallScore >= 40 && feedback.overallScore < 70,
                 'border-rose-500 text-rose-400': feedback.overallScore < 40
               }">
            <span class="text-4xl font-bold">{{ feedback.overallScore }}</span>
          </div>
          <p class="mt-4 text-lg font-semibold"
             [ngClass]="{
               'text-emerald-400': feedback.overallScore >= 70,
               'text-amber-400': feedback.overallScore >= 40 && feedback.overallScore < 70,
               'text-rose-400': feedback.overallScore < 40
             }">
            {{ feedback.verdict }}
          </p>
        </div>

        <!-- Strengths & Weaknesses -->
        <div class="grid gap-4 md:grid-cols-2">
          <div *ngIf="feedback.strengths?.length" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h3 class="text-sm font-semibold text-emerald-300 mb-3">Strengths</h3>
            <ul class="space-y-2">
              <li *ngFor="let s of feedback.strengths" class="flex items-start gap-2 text-sm text-emerald-200/80">
                <span class="mt-0.5 text-emerald-400">&#x2713;</span>
                {{ s }}
              </li>
            </ul>
          </div>
          <div *ngIf="feedback.weaknesses?.length" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
            <h3 class="text-sm font-semibold text-rose-300 mb-3">Areas to Improve</h3>
            <ul class="space-y-2">
              <li *ngFor="let w of feedback.weaknesses" class="flex items-start gap-2 text-sm text-rose-200/80">
                <span class="mt-0.5 text-rose-400">&#x2717;</span>
                {{ w }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Improvement Plan -->
        <div *ngIf="feedback.improvementPlan" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Improvement Plan</h3>
          <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ feedback.improvementPlan }}</p>
        </div>

        <!-- Start New -->
        <div class="text-center pt-4">
          <button (click)="reset()"
                  class="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition">
            Start New Interview
          </button>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
        {{ error }}
      </div>
    </div>
  `
})
export class InterviewSimulatorComponent {
  phase: 'setup' | 'chat' | 'feedback' = 'setup';
  targetRole = '';
  interviewType = 'MIXED';
  experienceLevel = 'MID';
  loading = false;
  error: string | null = null;

  sessionId: number | null = null;
  messages: ChatMessage[] = [];
  userAnswer = '';
  currentQuestionNum = 0;
  totalQuestions = 10;
  feedback: InterviewFeedback | null = null;

  constructor(private arena: ArenaService) {}

  startInterview(): void {
    if (!this.targetRole.trim() || this.loading) return;
    this.loading = true;
    this.error = null;

    this.arena.startInterview(this.targetRole, this.interviewType, this.experienceLevel).subscribe({
      next: (res) => {
        this.sessionId = res.sessionId;
        this.currentQuestionNum = res.questionNumber;
        this.totalQuestions = res.totalQuestions;
        this.messages.push({ role: 'interviewer', text: res.question });
        this.phase = 'chat';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to start interview.';
      }
    });
  }

  sendAnswer(): void {
    if (!this.userAnswer.trim() || !this.sessionId || this.loading) return;
    const answer = this.userAnswer;
    this.userAnswer = '';
    this.messages.push({ role: 'user', text: answer });
    this.loading = true;
    this.error = null;

    this.arena.respondInterview(this.sessionId, answer).subscribe({
      next: (res) => this.handleResponse(res),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to send answer.';
      }
    });
  }

  endInterview(): void {
    if (!this.sessionId || this.loading) return;
    this.loading = true;

    this.arena.endInterview(this.sessionId).subscribe({
      next: (res) => this.handleResponse(res),
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to end interview.';
      }
    });
  }

  private handleResponse(res: InterviewSimResponse): void {
    this.loading = false;
    this.currentQuestionNum = res.questionNumber;

    if (res.feedback) {
      this.messages.push({ role: 'interviewer', text: res.feedback });
    }

    if (res.isComplete && res.finalFeedback) {
      this.feedback = res.finalFeedback;
      this.phase = 'feedback';
    } else if (res.question) {
      this.messages.push({ role: 'interviewer', text: res.question });
    }
  }

  reset(): void {
    this.phase = 'setup';
    this.sessionId = null;
    this.messages = [];
    this.userAnswer = '';
    this.currentQuestionNum = 0;
    this.feedback = null;
    this.error = null;
  }
}
