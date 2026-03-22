import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService, InterviewSimResponse } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-interview-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">Interview Simulator</h1>
      <p class="text-stone-500 mb-8">Practice with an AI interviewer. Get real-time feedback and a final evaluation.</p>

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

      <!-- Interview Chat -->
      @if (sessionStarted() && !isComplete()) {
        <div class="space-y-4">
          <!-- Progress -->
          <div class="flex items-center gap-3 mb-6">
            <div class="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div class="h-full bg-stone-900 rounded-full transition-all"
                [style.width.%]="(currentQuestion() / totalQuestions()) * 100"></div>
            </div>
            <span class="text-sm text-stone-500">Q{{ currentQuestion() }}/{{ totalQuestions() }}</span>
          </div>

          <!-- Messages -->
          @for (msg of messages(); track $index) {
            <div [class]="msg.role === 'interviewer'
              ? 'bg-white border border-stone-200 rounded-2xl p-5'
              : 'bg-stone-50 border border-stone-200 rounded-2xl p-5 ml-8'">
              <div class="text-xs font-semibold mb-2" [class]="msg.role === 'interviewer' ? 'text-stone-900' : 'text-stone-600'">
                {{ msg.role === 'interviewer' ? 'Interviewer' : 'You' }}
              </div>
              <p class="text-stone-700 text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          }

          <!-- Answer Input -->
          <div class="space-y-3">
            <textarea [(ngModel)]="currentAnswer" rows="4" placeholder="Type your answer..."
              class="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
            <div class="flex gap-3">
              <button (click)="submitAnswer()" [disabled]="loading() || !currentAnswer"
                class="flex-1 py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50">
                @if (loading()) { Thinking... } @else { Submit Answer }
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

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
            Start New Interview
          </button>
        </div>
      }
    </div>
  `
})
export class InterviewSimulatorComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';
  interviewType = 'behavioral';
  experienceLevel = 'mid-level';
  currentAnswer = '';

  readonly loading = signal(false);
  readonly sessionStarted = signal(false);
  readonly sessionId = signal<number | null>(null);
  readonly currentQuestion = signal(0);
  readonly totalQuestions = signal(5);
  readonly isComplete = signal(false);
  readonly messages = signal<{role: string; content: string}[]>([]);
  readonly finalFeedback = signal<InterviewSimResponse['finalFeedback'] | null>(null);

  startInterview() {
    this.loading.set(true);
    this.arenaApi.startInterview(this.targetRole, this.interviewType, this.experienceLevel).subscribe({
      next: (res) => {
        this.sessionId.set(res.sessionId);
        this.sessionStarted.set(true);
        this.currentQuestion.set(res.questionNumber);
        this.totalQuestions.set(res.totalQuestions);
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
    this.finalFeedback.set(null);
    this.currentAnswer = '';
  }

  getVerdictClass(verdict: string): string {
    if (verdict.includes('STRONG_HIRE')) return 'bg-green-100 text-green-800';
    if (verdict.includes('HIRE') && !verdict.includes('NO')) return 'bg-green-50 text-green-700';
    if (verdict.includes('LEAN_HIRE')) return 'bg-amber-50 text-amber-700';
    if (verdict.includes('NO_HIRE')) return 'bg-red-50 text-red-700';
    return 'bg-stone-100 text-stone-600';
  }
}
