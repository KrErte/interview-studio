import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ArenaApiService, InterviewSimResponse } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-interview-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">Interview Simulator</h1>
      <p class="text-stone-500 mb-4">Practice with an AI interviewer. Get real-time feedback and a final evaluation.</p>

      @if (focusTopic && sessionStarted()) {
        <div class="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-sm text-indigo-700">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          Focused: {{ focusTopic }}
        </div>
      }

      <!-- Setup Form -->
      @if (!sessionStarted()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Senior Frontend Developer"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Interview Type</label>
              <select [(ngModel)]="interviewType"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
                <option value="behavioral">Behavioral</option>
                <option value="technical">Technical</option>
                <option value="system-design">System Design</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
              <select [(ngModel)]="experienceLevel"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
                <option value="junior">Junior</option>
                <option value="mid-level">Mid-Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Staff</option>
              </select>
            </div>
          </div>
          <button (click)="startInterview()" [disabled]="loading() || !targetRole"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50">
            @if (loading()) { Starting interview... } @else { Start Interview }
          </button>
        </div>
      }

      <!-- Interview Card -->
      @if (sessionStarted() && !isComplete()) {
        <div class="space-y-6">
          <!-- Progress -->
          <div class="flex items-center gap-3">
            <div class="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div class="h-full bg-stone-900 rounded-full transition-all duration-500"
                [style.width.%]="(currentQuestion() / totalQuestions()) * 100"></div>
            </div>
            <span class="text-sm font-medium text-stone-500">{{ currentQuestion() }} / {{ totalQuestions() }}</span>
          </div>

          <!-- History Toggle -->
          @if (messages().length > 1) {
            <div class="flex justify-end">
              <button (click)="showHistory.set(!showHistory())"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                {{ showHistory() ? 'Hide' : 'Show' }} history ({{ messages().length - 1 }})
              </button>
            </div>
          }

          <!-- Collapsible History -->
          @if (showHistory()) {
            <div class="space-y-2 border border-stone-200 rounded-2xl p-4 bg-stone-50/50 max-h-64 overflow-y-auto">
              @for (msg of messages().slice(0, -1); track $index) {
                <div class="text-sm" [class]="msg.role === 'interviewer' ? 'text-stone-600' : 'text-stone-500 pl-4'">
                  <span class="font-semibold text-xs uppercase tracking-wide" [class]="msg.role === 'interviewer' ? 'text-stone-700' : 'text-stone-400'">
                    {{ msg.role === 'interviewer' ? 'Interviewer' : 'You' }}:
                  </span>
                  <span class="whitespace-pre-wrap"> {{ msg.content.length > 200 ? msg.content.substring(0, 200) + '...' : msg.content }}</span>
                </div>
              }
            </div>
          }

          <!-- Feedback from previous answer -->
          @if (lastFeedback()) {
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 animate-fade-in">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">Feedback</span>
              </div>
              <p class="text-sm text-stone-700 whitespace-pre-wrap">{{ lastFeedback() }}</p>
            </div>
          }

          <!-- Current Question Card -->
          <div class="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold">{{ currentQuestion() }}</div>
              <span class="text-xs font-semibold text-stone-400 uppercase tracking-wide">Interviewer</span>
            </div>
            <p class="text-stone-800 text-base leading-relaxed whitespace-pre-wrap">{{ currentQuestionText() }}</p>
          </div>

          <!-- Answer Input -->
          <div class="space-y-3">
            <textarea [(ngModel)]="currentAnswer" rows="5" placeholder="Type your answer..."
              class="w-full px-4 py-3 bg-white border border-stone-300 rounded-2xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 resize-none transition-all"></textarea>
            <div class="flex gap-3">
              <button (click)="submitAnswer()" [disabled]="loading() || !currentAnswer"
                class="flex-1 py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50">
                @if (loading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Thinking...
                  </span>
                } @else { Submit Answer }
              </button>
              <button (click)="endEarly()"
                class="px-6 py-3 rounded-xl font-semibold border border-stone-300 text-stone-500 hover:bg-stone-100 transition-all">
                End Early
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Final Feedback -->
      @if (isComplete() && finalFeedback()) {
        <div class="space-y-6">
          <div class="text-center py-8">
            <div class="text-6xl font-bold mb-2" [class]="finalFeedback()!.overallScore >= 70 ? 'text-green-700' : finalFeedback()!.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'">
              {{ finalFeedback()!.overallScore }}
            </div>
            <div class="text-stone-500">Overall Score</div>
            <div class="mt-2 px-4 py-1 rounded-full inline-block text-sm font-bold"
              [class]="getVerdictClass(finalFeedback()!.verdict)">
              {{ finalFeedback()!.verdict.split('_').join(' ') }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-800 mb-3">Strengths</h3>
              <ul class="space-y-2">
                @for (s of finalFeedback()!.strengths; track s) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-600 mt-0.5">+</span> {{ s }}
                  </li>
                }
              </ul>
            </div>
            <div class="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 class="font-semibold text-red-800 mb-3">Areas to Improve</h3>
              <ul class="space-y-2">
                @for (w of finalFeedback()!.weaknesses; track w) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-red-600 mt-0.5">-</span> {{ w }}
                  </li>
                }
              </ul>
            </div>
          </div>

          @if (finalFeedback()!.improvementPlan) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              <h3 class="font-semibold text-stone-900 mb-2">Improvement Plan</h3>
              <p class="text-sm text-stone-600">{{ finalFeedback()!.improvementPlan }}</p>
            </div>
          }

          <button (click)="generateRoadmap()"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all">
            Generate Improvement Roadmap
          </button>

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
            Start New Interview
          </button>
        </div>
      }
    </div>
  `
})
export class InterviewSimulatorComponent implements OnInit {
  private readonly arenaApi = inject(ArenaApiService);
  private readonly router = inject(Router);

  targetRole = '';
  interviewType = 'behavioral';
  experienceLevel = 'mid-level';
  currentAnswer = '';
  focusTopic = '';

  ngOnInit() {
    const practice = sessionStorage.getItem('interview_practice_focus');
    if (practice) {
      sessionStorage.removeItem('interview_practice_focus');
      const data = JSON.parse(practice);
      this.targetRole = data.targetRole || '';
      this.focusTopic = data.focusTopic || '';
      this.interviewType = data.interviewType || 'mixed';
      this.startInterview();
    }
  }

  readonly loading = signal(false);
  readonly sessionStarted = signal(false);
  readonly sessionId = signal<number | null>(null);
  readonly currentQuestion = signal(0);
  readonly totalQuestions = signal(5);
  readonly isComplete = signal(false);
  readonly messages = signal<{role: string; content: string}[]>([]);
  readonly currentQuestionText = signal('');
  readonly lastFeedback = signal<string | null>(null);
  readonly showHistory = signal(false);
  readonly finalFeedback = signal<InterviewSimResponse['finalFeedback'] | null>(null);

  startInterview() {
    this.loading.set(true);
    this.arenaApi.startInterview(this.targetRole, this.interviewType, this.experienceLevel, this.focusTopic || undefined).subscribe({
      next: (res) => {
        this.sessionId.set(res.sessionId);
        this.sessionStarted.set(true);
        this.currentQuestion.set(res.questionNumber);
        this.totalQuestions.set(res.totalQuestions);
        this.currentQuestionText.set(res.question);
        this.lastFeedback.set(null);
        this.messages.set([{ role: 'interviewer', content: res.question }]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to start interview. Please try again.');
      }
    });
  }

  submitAnswer() {
    if (!this.currentAnswer || !this.sessionId()) return;
    this.loading.set(true);

    this.messages.update(msgs => [...msgs, { role: 'candidate', content: this.currentAnswer }]);
    const answer = this.currentAnswer;
    this.currentAnswer = '';

    this.arenaApi.respondInterview(this.sessionId()!, answer).subscribe({
      next: (res) => {
        if (res.isComplete && res.finalFeedback) {
          this.isComplete.set(true);
          this.finalFeedback.set(res.finalFeedback);
        } else {
          this.lastFeedback.set(res.feedback || null);
          if (res.question) {
            this.currentQuestionText.set(res.question);
          }
          if (res.feedback) {
            this.messages.update(msgs => [...msgs, { role: 'interviewer', content: res.feedback }]);
          }
          if (res.question) {
            this.messages.update(msgs => [...msgs, { role: 'interviewer', content: res.question }]);
          }
          this.currentQuestion.set(res.questionNumber);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to submit answer. Please try again.');
      }
    });
  }

  endEarly() {
    if (!this.sessionId()) return;
    this.loading.set(true);
    this.arenaApi.endInterview(this.sessionId()!).subscribe({
      next: (res) => {
        this.isComplete.set(true);
        this.finalFeedback.set(res.finalFeedback || null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  reset() {
    this.sessionStarted.set(false);
    this.sessionId.set(null);
    this.currentQuestion.set(0);
    this.isComplete.set(false);
    this.messages.set([]);
    this.currentQuestionText.set('');
    this.lastFeedback.set(null);
    this.finalFeedback.set(null);
    this.currentAnswer = '';
    this.focusTopic = '';
  }

  generateRoadmap() {
    const feedback = this.finalFeedback();
    if (!feedback) return;
    sessionStorage.setItem('interview_roadmap_data', JSON.stringify({
      targetRole: this.targetRole,
      weaknesses: feedback.weaknesses,
      improvementPlan: feedback.improvementPlan
    }));
    this.router.navigate(['/arena/interview-roadmap']);
  }

  getVerdictClass(verdict: string): string {
    if (verdict.includes('STRONG_HIRE')) return 'bg-green-100 text-green-800';
    if (verdict.includes('HIRE') && !verdict.includes('NO')) return 'bg-green-50 text-green-700';
    if (verdict.includes('LEAN_HIRE')) return 'bg-amber-50 text-amber-700';
    if (verdict.includes('NO_HIRE')) return 'bg-red-50 text-red-700';
    return 'bg-stone-100 text-stone-600';
  }
}
