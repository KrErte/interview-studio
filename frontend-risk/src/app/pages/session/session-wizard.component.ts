import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionApiService, QAPair } from '../../core/services/session-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-session-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="max-w-2xl mx-auto px-6 py-12">
      <!-- Progress -->
      <div class="mb-10">
        <div class="flex items-center justify-between text-xs text-stone-400 mb-3">
          <span class="uppercase tracking-widest">{{ 'common.step' | translate }} {{ displayStep() }} / {{ totalSteps() }}</span>
          <span>{{ 'wizard.quickAssessment' | translate }}</span>
        </div>
        <div class="h-0.5 bg-stone-200 overflow-hidden">
          <div class="h-full bg-stone-900 transition-all duration-300"
            [style.width.%]="(displayStep() / totalSteps()) * 100"></div>
        </div>
      </div>

      <!-- Step 1: Target Role -->
      @if (step() === 1) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-black text-stone-900 mb-2">{{ 'wizard.targetRoleTitle' | translate }}</h1>
          <p class="text-stone-500 mb-8">{{ 'wizard.targetRoleHint' | translate }}</p>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            @for (role of suggestedRoles; track role) {
              <button (click)="targetRole = role; step.set(2)"
                class="p-3 border text-sm text-left transition-all"
                [class]="targetRole === role
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'">
                {{ role }}
              </button>
            }
          </div>

          <input type="text" [(ngModel)]="targetRole" [placeholder]="'wizard.targetRolePlaceholder' | translate"
            class="w-full p-4 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none">
        </div>
      }

      <!-- Step 2: Experience Level -->
      @if (step() === 2) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-black text-stone-900 mb-2">{{ 'wizard.experienceTitle' | translate }}</h1>
          <p class="text-stone-500 mb-8">{{ 'wizard.experienceHint' | translate }} <span class="font-semibold text-stone-900">{{ targetRole }}</span>?</p>

          <div class="space-y-2">
            @for (opt of experienceOptions; track opt.value) {
              <button (click)="experienceLevel = opt.value"
                class="w-full p-4 border text-left transition-all"
                [class]="experienceLevel === opt.value
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white hover:border-stone-400'">
                <div class="font-semibold" [class]="experienceLevel === opt.value ? 'text-white' : 'text-stone-900'">{{ opt.label }}</div>
                <div class="text-sm mt-0.5" [class]="experienceLevel === opt.value ? 'text-stone-300' : 'text-stone-400'">{{ opt.hint }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 3: Main Challenge -->
      @if (step() === 3) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-black text-stone-900 mb-2">{{ 'wizard.challengeTitle' | translate }}</h1>
          <p class="text-stone-500 mb-8">{{ 'wizard.challengeHint' | translate }} <span class="font-semibold text-stone-900">{{ targetRole }}</span>?</p>

          <div class="space-y-2">
            @for (opt of challengeOptions; track opt.value) {
              <button (click)="mainChallenge = opt.value"
                class="w-full p-4 border text-left transition-all"
                [class]="mainChallenge === opt.value
                  ? 'border-stone-900 bg-stone-900 text-white'
                  : 'border-stone-200 bg-white hover:border-stone-400'">
                <div class="font-semibold" [class]="mainChallenge === opt.value ? 'text-white' : 'text-stone-900'">{{ opt.label }}</div>
                <div class="text-sm mt-0.5" [class]="mainChallenge === opt.value ? 'text-stone-300' : 'text-stone-400'">{{ opt.hint }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 4+: Clarifying Questions -->
      @if (step() >= 4) {
        <div class="animate-fadeIn">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full bg-stone-900 animate-pulse"></div>
            <span class="text-xs uppercase tracking-widest text-stone-400">{{ 'wizard.clarifying.aiPersonalized' | translate }}</span>
          </div>
          <h1 class="text-3xl font-black text-stone-900 mb-2">{{ 'wizard.clarifying.title' | translate }}</h1>
          <p class="text-stone-500 mb-8">{{ 'wizard.clarifying.subtitle' | translate }}</p>

          @if (loadingQuestion()) {
            <div class="flex items-center gap-3 p-6 border border-stone-200 bg-stone-50">
              <div class="w-5 h-5 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
              <span class="text-stone-500">{{ 'wizard.clarifying.generating' | translate }}</span>
            </div>
          } @else if (currentQuestion()) {
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-xs font-bold text-stone-400 uppercase">{{ 'wizard.clarifying.question' | translate }} {{ currentQuestionNumber() }} / {{ totalClarifyingQuestions() }}</span>
              </div>
              <p class="text-lg font-semibold text-stone-900 mb-4">{{ currentQuestion() }}</p>
              <textarea [(ngModel)]="currentAnswer"
                [placeholder]="'wizard.clarifying.answerPlaceholder' | translate"
                rows="4"
                class="w-full p-4 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none resize-none"></textarea>
            </div>
          }

          <!-- Previous Q&As -->
          @if (clarifyingQAs().length > 0) {
            <div class="mt-6 space-y-3">
              @for (qa of clarifyingQAs(); track $index) {
                <div class="p-4 bg-stone-50 border border-stone-100">
                  <p class="text-xs font-bold text-stone-400 uppercase mb-1">{{ 'wizard.clarifying.question' | translate }} {{ $index + 1 }}</p>
                  <p class="text-sm font-medium text-stone-700 mb-1">{{ qa.question }}</p>
                  <p class="text-sm text-stone-500">{{ qa.answer }}</p>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Navigation -->
      <div class="flex justify-between mt-10 pt-6 border-t border-stone-200">
        @if (step() > 1) {
          <button (click)="goBack()"
            class="px-6 py-3 border border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors text-sm">
            {{ 'common.back' | translate }}
          </button>
        } @else {
          <div></div>
        }

        <div class="flex items-center gap-3">
          @if (!canProceed() && showHint()) {
            <span class="text-sm text-red-600">{{ hintMessage() }}</span>
          }

          @if (step() < 3) {
            <button (click)="onNext()" [disabled]="!canProceed()"
              class="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold disabled:opacity-30 transition-all text-sm">
              {{ 'common.next' | translate }}
            </button>
          } @else if (step() === 3) {
            <button (click)="startClarifyingQuestions()" [disabled]="!canProceed()"
              class="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold disabled:opacity-30 transition-all text-sm">
              {{ 'common.next' | translate }}
            </button>
          } @else {
            <!-- Clarifying questions step -->
            @if (!clarifyingDone()) {
              <button (click)="skipClarifying()"
                class="px-6 py-3 border border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900 transition-colors text-sm">
                {{ 'common.skip' | translate }}
              </button>
              <button (click)="submitClarifyingAnswer()" [disabled]="!currentAnswer.trim() || loadingQuestion()"
                class="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold disabled:opacity-30 transition-all text-sm">
                @if (loadingQuestion()) { {{ 'wizard.clarifying.generating' | translate }} }
                @else if (currentQuestionNumber() >= totalClarifyingQuestions()) { {{ 'wizard.clarifying.finishAndAssess' | translate }} }
                @else { {{ 'wizard.clarifying.answerAndNext' | translate }} }
              </button>
            } @else {
              <button (click)="submit()" [disabled]="submitting()"
                class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-30 transition-all text-sm">
                @if (submitting()) { {{ 'wizard.analyzing' | translate }} } @else { {{ 'wizard.getAssessment' | translate }} }
              </button>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SessionWizardComponent {
  private readonly sessionApi = inject(SessionApiService);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);

  step = signal(1);
  submitting = signal(false);
  showHint = signal(false);
  loadingQuestion = signal(false);

  // Clarifying questions state
  clarifyingQAs = signal<QAPair[]>([]);
  currentQuestion = signal<string | null>(null);
  currentQuestionNumber = signal(0);
  totalClarifyingQuestions = signal(3);
  clarifyingDone = signal(false);
  currentAnswer = '';

  targetRole = '';
  experienceLevel = '';
  mainChallenge = '';

  displayStep = computed(() => Math.min(this.step(), 4));
  totalSteps = computed(() => 4);

  suggestedRoles = [
    'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer',
    'Sales Manager', 'Marketing Manager', 'Financial Analyst', 'HR Manager',
    'Project Manager', 'Business Analyst', 'Nurse', 'Teacher'
  ];

  experienceOptions = [
    { value: 'expert', label: 'Expert', hint: 'I currently work in this role or have 3+ years' },
    { value: 'intermediate', label: 'Intermediate', hint: 'I have some experience (1-3 years)' },
    { value: 'beginner', label: 'Beginner', hint: 'I\'m new but have done some learning/projects' },
    { value: 'none', label: 'No experience', hint: 'This would be a career switch for me' }
  ];

  challengeOptions = [
    { value: 'cv', label: 'My CV doesn\'t stand out', hint: 'I have the skills but my CV isn\'t getting callbacks' },
    { value: 'positioning', label: 'Positioning myself', hint: 'I struggle to present my experience for this role' },
    { value: 'skill_gap', label: 'Missing key skills', hint: 'I need to develop specific skills or certifications for this role' },
    { value: 'career_switch', label: 'Career switch', hint: 'I\'m coming from a completely different field' },
    { value: 'interview_prep', label: 'Interview preparation', hint: 'I get interviews but don\'t convert them' }
  ];

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.targetRole.trim();
      case 2: return !!this.experienceLevel;
      case 3: return !!this.mainChallenge;
      default: return true;
    }
  }

  hintMessage(): string {
    switch (this.step()) {
      case 1: return 'Please enter a target role';
      case 2: return 'Please select your experience level';
      case 3: return 'Please select your main challenge';
      default: return '';
    }
  }

  onNext(): void {
    if (!this.canProceed()) {
      this.showHint.set(true);
      return;
    }
    this.showHint.set(false);
    this.step.set(this.step() + 1);
  }

  goBack(): void {
    if (this.step() >= 4) {
      // Going back from clarifying questions to step 3
      this.step.set(3);
      this.clarifyingQAs.set([]);
      this.currentQuestion.set(null);
      this.currentQuestionNumber.set(0);
      this.clarifyingDone.set(false);
      this.currentAnswer = '';
    } else {
      this.step.set(this.step() - 1);
    }
  }

  startClarifyingQuestions(): void {
    if (!this.canProceed()) {
      this.showHint.set(true);
      return;
    }
    this.showHint.set(false);
    this.step.set(4);
    this.fetchNextQuestion();
  }

  fetchNextQuestion(): void {
    this.loadingQuestion.set(true);
    this.sessionApi.getClarifyingQuestion({
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel,
      mainChallenge: this.mainChallenge,
      previousQAs: this.clarifyingQAs()
    }).subscribe({
      next: (res) => {
        this.loadingQuestion.set(false);
        if (res.done && !res.question) {
          this.clarifyingDone.set(true);
        } else {
          this.currentQuestion.set(res.question);
          this.currentQuestionNumber.set(res.questionNumber);
          this.totalClarifyingQuestions.set(res.totalQuestions);
        }
      },
      error: () => {
        this.loadingQuestion.set(false);
        // On error, skip clarifying and go straight to submit
        this.clarifyingDone.set(true);
      }
    });
  }

  submitClarifyingAnswer(): void {
    if (!this.currentAnswer.trim()) return;

    const qa: QAPair = {
      question: this.currentQuestion()!,
      answer: this.currentAnswer.trim()
    };

    this.clarifyingQAs.set([...this.clarifyingQAs(), qa]);
    this.currentAnswer = '';

    if (this.currentQuestionNumber() >= this.totalClarifyingQuestions()) {
      this.clarifyingDone.set(true);
      this.currentQuestion.set(null);
    } else {
      this.fetchNextQuestion();
    }
  }

  skipClarifying(): void {
    this.clarifyingDone.set(true);
    this.currentQuestion.set(null);
  }

  submit() {
    this.submitting.set(true);
    this.analytics.trackEvent('session_started', { mode: 'SIMPLE', role: this.targetRole });

    this.sessionApi.createSession({
      mode: 'SIMPLE',
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel,
      mainChallenge: this.mainChallenge,
      clarifyingAnswers: this.clarifyingQAs().length > 0 ? this.clarifyingQAs() : undefined
    }).subscribe({
      next: (res) => {
        this.analytics.trackEvent('session_completed', { mode: 'SIMPLE', status: res.status });
        sessionStorage.setItem('lastSession', JSON.stringify(res));
        this.router.navigate(['/session', res.id]);
      },
      error: () => {
        this.submitting.set(false);
        alert('Something went wrong. Please try again.');
      }
    });
  }
}
