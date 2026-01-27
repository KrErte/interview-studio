import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudioApiService, SimpleSessionRequest } from '../../core/services/studio-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-session-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
          <div class="flex items-center gap-2 text-sm text-gray-500">
            Step {{ step() }} of 3
          </div>
        </div>
      </header>

      <!-- Progress bar -->
      <div class="bg-gray-900">
        <div class="max-w-2xl mx-auto">
          <div class="h-1 bg-gray-800">
            <div
              class="h-full bg-emerald-600 transition-all duration-300"
              [style.width.%]="(step() / 3) * 100"
            ></div>
          </div>
        </div>
      </div>

      <!-- Form content -->
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div class="w-full max-w-md">
          @switch (step()) {
            @case (1) {
              <!-- Step 1: Target role -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">What role are you targeting?</h2>
                  <p class="text-gray-400">Be specific — this helps us give better advice.</p>
                </div>

                <input
                  type="text"
                  [(ngModel)]="form.targetRole"
                  placeholder="e.g., Senior Frontend Developer"
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  (keyup.enter)="form.targetRole && nextStep()"
                  autofocus
                />

                <div class="flex flex-wrap gap-2">
                  @for (suggestion of roleSuggestions; track suggestion) {
                    <button
                      (click)="form.targetRole = suggestion; nextStep()"
                      class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {{ suggestion }}
                    </button>
                  }
                </div>
              </div>
            }

            @case (2) {
              <!-- Step 2: Experience level -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">Your experience with this role?</h2>
                  <p class="text-gray-400">How much direct experience do you have?</p>
                </div>

                <div class="space-y-3">
                  @for (option of experienceOptions; track option.value) {
                    <button
                      (click)="form.experienceLevel = option.value; nextStep()"
                      class="w-full text-left bg-gray-900 border border-gray-700 hover:border-emerald-500 rounded-lg px-4 py-4 transition-colors group"
                      [class.border-emerald-500]="form.experienceLevel === option.value"
                    >
                      <div class="font-medium text-white group-hover:text-emerald-400">{{ option.label }}</div>
                      <div class="text-sm text-gray-500 mt-1">{{ option.description }}</div>
                    </button>
                  }
                </div>
              </div>
            }

            @case (3) {
              <!-- Step 3: Main challenge -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">What's your biggest challenge?</h2>
                  <p class="text-gray-400">What's holding you back right now?</p>
                </div>

                <div class="space-y-3">
                  @for (option of challengeOptions; track option.value) {
                    <button
                      (click)="form.mainChallenge = option.value; submit()"
                      class="w-full text-left bg-gray-900 border border-gray-700 hover:border-emerald-500 rounded-lg px-4 py-4 transition-colors group"
                      [class.border-emerald-500]="form.mainChallenge === option.value"
                      [disabled]="submitting()"
                    >
                      <div class="font-medium text-white group-hover:text-emerald-400">{{ option.label }}</div>
                      <div class="text-sm text-gray-500 mt-1">{{ option.description }}</div>
                    </button>
                  }
                </div>
              </div>
            }
          }

          <!-- Navigation -->
          <div class="flex items-center justify-between mt-8">
            @if (step() > 1) {
              <button
                (click)="prevStep()"
                class="text-gray-400 hover:text-white flex items-center gap-1"
                [disabled]="submitting()"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Back
              </button>
            } @else {
              <div></div>
            }

            @if (step() < 3 && canProceed()) {
              <button
                (click)="nextStep()"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                Continue
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            }
          </div>

          @if (error()) {
            <div class="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {{ error() }}
            </div>
          }

          @if (submitting()) {
            <div class="mt-8 text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-emerald-500"></div>
              <p class="text-gray-400 mt-2">Analyzing your profile...</p>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class SessionNewComponent implements OnInit {
  step = signal(1);
  submitting = signal(false);
  error = signal<string | null>(null);

  form: SimpleSessionRequest = {
    targetRole: '',
    experienceLevel: '',
    mainChallenge: '',
  };

  roleSuggestions = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'UX Designer',
    'DevOps Engineer',
  ];

  experienceOptions = [
    { value: 'expert', label: '5+ years', description: 'Senior level, deep expertise' },
    { value: '3-5years', label: '3-5 years', description: 'Mid-level, solid experience' },
    { value: '1-2years', label: '1-2 years', description: 'Junior level, building skills' },
    { value: 'some', label: 'Some experience', description: 'Related work but not direct' },
    { value: 'learning', label: 'Learning / Career switch', description: 'New to this role' },
  ];

  challengeOptions = [
    { value: 'no-responses', label: 'Not getting responses', description: 'Applications going into a void' },
    { value: 'interviews', label: 'Struggling in interviews', description: 'Getting interviews but not offers' },
    { value: 'positioning', label: 'Unsure how to position myself', description: 'Don\'t know how to sell my experience' },
    { value: 'market', label: 'Bad job market', description: 'Few opportunities in my area' },
    { value: 'confidence', label: 'Lack of confidence', description: 'Not sure if I\'m good enough' },
  ];

  constructor(
    private router: Router,
    private studioApi: StudioApiService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.analytics.pageView('/session/new', 'New Session (Simple)');
    this.analytics.track('questionnaire_started', { mode: 'simple' });
  }

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.form.targetRole.trim();
      case 2: return !!this.form.experienceLevel;
      case 3: return !!this.form.mainChallenge;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.step() < 3) {
      this.step.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
    }
  }

  submit(): void {
    if (this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.analytics.track('questionnaire_completed', { mode: 'simple' });

    this.studioApi.createSimpleSession(this.form).subscribe({
      next: (session) => {
        this.analytics.track('session_completed', { sessionId: session.id, status: session.status });
        this.router.navigate(['/session', session.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.message || 'Failed to create session. Please try again.');
        console.error('Session creation failed:', err);
      },
    });
  }
}
