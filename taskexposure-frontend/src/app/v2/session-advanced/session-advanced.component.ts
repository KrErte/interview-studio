import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudioApiService, AdvancedSessionRequest } from '../../core/services/studio-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-session-advanced',
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
          <div class="flex items-center gap-4 text-sm">
            <span class="text-gray-500">Step {{ step() }} of 5</span>
            <span class="text-blue-400">Advanced</span>
          </div>
        </div>
      </header>

      <!-- Progress bar -->
      <div class="bg-gray-900">
        <div class="max-w-2xl mx-auto">
          <div class="h-1 bg-gray-800">
            <div
              class="h-full bg-blue-600 transition-all duration-300"
              [style.width.%]="(step() / 5) * 100"
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
                  <p class="text-gray-400">Be as specific as possible.</p>
                </div>

                <input
                  type="text"
                  [(ngModel)]="form.targetRole"
                  placeholder="e.g., Senior Backend Engineer"
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  (keyup.enter)="form.targetRole && nextStep()"
                  autofocus
                />
              </div>
            }

            @case (2) {
              <!-- Step 2: Last worked in role -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">When did you last work in this role?</h2>
                  <p class="text-gray-400">Direct experience in the target role.</p>
                </div>

                <div class="space-y-3">
                  @for (option of lastWorkedOptions; track option.value) {
                    <button
                      (click)="form.lastWorkedInRole = option.value; nextStep()"
                      class="w-full text-left bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-4 transition-colors group"
                      [class.border-blue-500]="form.lastWorkedInRole === option.value"
                    >
                      <div class="font-medium text-white group-hover:text-blue-400">{{ option.label }}</div>
                    </button>
                  }
                </div>
              </div>
            }

            @case (3) {
              <!-- Step 3: Urgency -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">How urgent is your job search?</h2>
                  <p class="text-gray-400">This helps prioritize recommendations.</p>
                </div>

                <div class="space-y-3">
                  @for (option of urgencyOptions; track option.value) {
                    <button
                      (click)="form.urgency = option.value; nextStep()"
                      class="w-full text-left bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-4 transition-colors group"
                      [class.border-blue-500]="form.urgency === option.value"
                    >
                      <div class="font-medium text-white group-hover:text-blue-400">{{ option.label }}</div>
                      <div class="text-sm text-gray-500 mt-1">{{ option.description }}</div>
                    </button>
                  }
                </div>
              </div>
            }

            @case (4) {
              <!-- Step 4: Recent work examples -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">Describe a recent relevant achievement</h2>
                  <p class="text-gray-400">Something that shows you can do the target role.</p>
                </div>

                <textarea
                  [(ngModel)]="form.recentWorkExamples"
                  rows="5"
                  placeholder="e.g., Led a team of 5 to rebuild our payment system, reducing transaction failures by 40%..."
                  class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>

                <p class="text-gray-500 text-sm">
                  Tip: Include a number or metric if possible.
                </p>
              </div>
            }

            @case (5) {
              <!-- Step 5: Main blocker -->
              <div class="space-y-6">
                <div class="text-center mb-8">
                  <h2 class="text-2xl font-bold text-white mb-2">What's your main blocker?</h2>
                  <p class="text-gray-400">What's holding you back right now?</p>
                </div>

                <div class="space-y-3">
                  @for (option of blockerOptions; track option.value) {
                    <button
                      (click)="form.mainBlocker = option.value; submit()"
                      class="w-full text-left bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-4 transition-colors group"
                      [class.border-blue-500]="form.mainBlocker === option.value"
                      [disabled]="submitting()"
                    >
                      <div class="font-medium text-white group-hover:text-blue-400">{{ option.label }}</div>
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

            @if (step() < 5 && canProceed()) {
              <button
                (click)="nextStep()"
                class="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-1"
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
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-blue-500"></div>
              <p class="text-gray-400 mt-2">Analyzing your profile...</p>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class SessionAdvancedComponent implements OnInit {
  step = signal(1);
  submitting = signal(false);
  error = signal<string | null>(null);

  form: AdvancedSessionRequest = {
    targetRole: '',
    lastWorkedInRole: '',
    urgency: '',
    recentWorkExamples: '',
    mainBlocker: '',
    cvText: '',
  };

  lastWorkedOptions = [
    { value: 'current', label: 'Currently in this role' },
    { value: '<6months', label: 'Less than 6 months ago' },
    { value: '6-12months', label: '6-12 months ago' },
    { value: '12-18months', label: '12-18 months ago' },
    { value: '>18months', label: 'More than 18 months ago' },
    { value: 'never', label: 'Never worked in this exact role' },
  ];

  urgencyOptions = [
    { value: 'immediate', label: 'Immediately', description: 'Need a job within 2 weeks' },
    { value: 'soon', label: 'Soon', description: 'Within 1-2 months' },
    { value: 'exploring', label: 'Just exploring', description: '3+ months or no rush' },
  ];

  blockerOptions = [
    { value: 'cv', label: 'My CV doesn\'t represent me well', description: 'Positioning/presentation issue' },
    { value: 'skills', label: 'I lack specific skills', description: 'Technical or domain gaps' },
    { value: 'experience', label: 'Not enough relevant experience', description: 'Background mismatch' },
    { value: 'interviews', label: 'I struggle with interviews', description: 'Performance anxiety or preparation' },
    { value: 'market', label: 'The job market is tough', description: 'Few opportunities available' },
    { value: 'unsure', label: 'I\'m not sure what\'s holding me back', description: 'Need diagnosis' },
  ];

  constructor(
    private router: Router,
    private studioApi: StudioApiService,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/session/new/advanced' } });
      return;
    }

    this.analytics.pageView('/session/new/advanced', 'New Session (Advanced)');
    this.analytics.track('questionnaire_started', { mode: 'advanced' });
  }

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.form.targetRole.trim();
      case 2: return !!this.form.lastWorkedInRole;
      case 3: return !!this.form.urgency;
      case 4: return !!this.form.recentWorkExamples.trim();
      case 5: return !!this.form.mainBlocker;
      default: return false;
    }
  }

  nextStep(): void {
    if (this.canProceed() && this.step() < 5) {
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

    this.analytics.track('questionnaire_completed', { mode: 'advanced' });

    this.studioApi.createAdvancedSession(this.form).subscribe({
      next: (session) => {
        this.analytics.track('session_completed', { sessionId: session.id, status: session.status });
        this.router.navigate(['/session', session.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 401) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/session/new/advanced' } });
        } else {
          this.error.set(err.message || 'Failed to create session. Please try again.');
        }
        console.error('Session creation failed:', err);
      },
    });
  }
}
