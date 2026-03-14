import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionApiService } from '../../core/services/session-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-session-wizard-advanced',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Step {{ step() }} of 5</span>
          <span class="text-purple-400">Advanced Assessment</span>
        </div>
        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            [style.width.%]="(step() / 5) * 100"></div>
        </div>
      </div>

      <!-- Step 1: Target Role -->
      @if (step() === 1) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">What role are you targeting?</h1>
          <p class="text-slate-400 mb-8">Be specific — e.g. "Senior Frontend Engineer" or "Data Analyst"</p>
          <input type="text" [(ngModel)]="targetRole" placeholder="Enter your target role..."
            class="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none text-lg">
        </div>
      }

      <!-- Step 2: Last worked in role -->
      @if (step() === 2) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">When did you last work as {{ targetRole }}?</h1>
          <p class="text-slate-400 mb-8">This helps us gauge your readiness</p>
          <div class="space-y-3">
            @for (opt of lastWorkedOptions; track opt.value) {
              <button (click)="lastWorkedInRole = opt.value"
                class="w-full p-4 rounded-xl border text-left transition-all"
                [class]="lastWorkedInRole === opt.value ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'">
                <div class="font-semibold text-white">{{ opt.label }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 3: Urgency -->
      @if (step() === 3) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">How urgently do you need this role?</h1>
          <p class="text-slate-400 mb-8">We'll tailor the plan to your timeline</p>
          <div class="space-y-3">
            @for (opt of urgencyOptions; track opt.value) {
              <button (click)="urgency = opt.value"
                class="w-full p-4 rounded-xl border text-left transition-all"
                [class]="urgency === opt.value ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'">
                <div class="font-semibold text-white">{{ opt.label }}</div>
                <div class="text-sm text-slate-400 mt-1">{{ opt.hint }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 4: Recent work examples -->
      @if (step() === 4) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">Describe recent relevant work</h1>
          <p class="text-slate-400 mb-8">Projects, achievements, or experience related to {{ targetRole }}</p>
          <textarea [(ngModel)]="recentWorkExamples" rows="6"
            placeholder="E.g. 'Built a React dashboard that reduced load times by 40%...' or 'Led a team of 5 engineers to deliver...'"
            class="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"></textarea>
          <p class="text-xs text-slate-500 mt-2">Optional but helps us give better recommendations</p>
        </div>
      }

      <!-- Step 5: Main Blocker -->
      @if (step() === 5) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">What's your biggest blocker?</h1>
          <p class="text-slate-400 mb-8">What's the main thing stopping you from getting {{ targetRole }}?</p>
          <div class="space-y-3">
            @for (opt of blockerOptions; track opt.value) {
              <button (click)="mainBlocker = opt.value"
                class="w-full p-4 rounded-xl border text-left transition-all"
                [class]="mainBlocker === opt.value ? 'border-purple-500 bg-purple-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'">
                <div class="font-semibold text-white">{{ opt.label }}</div>
                <div class="text-sm text-slate-400 mt-1">{{ opt.hint }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Navigation -->
      <div class="flex justify-between mt-10 pt-6 border-t border-slate-800">
        @if (step() > 1) {
          <button (click)="step.set(step() - 1)"
            class="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">
            Back
          </button>
        } @else {
          <div></div>
        }

        @if (step() < 5) {
          <button (click)="step.set(step() + 1)" [disabled]="!canProceed()"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-40 transition-all">
            Next
          </button>
        } @else {
          <button (click)="submit()" [disabled]="!canProceed() || submitting()"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-40 transition-all">
            @if (submitting()) { Analyzing... } @else { Get Full Assessment }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .animate-fadeIn { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SessionWizardAdvancedComponent {
  private readonly sessionApi = inject(SessionApiService);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);

  step = signal(1);
  submitting = signal(false);

  targetRole = '';
  lastWorkedInRole = '';
  urgency = '';
  recentWorkExamples = '';
  mainBlocker = '';

  lastWorkedOptions = [
    { value: 'current', label: 'Currently in this role' },
    { value: '6_months', label: 'Within the last 6 months' },
    { value: '1_year', label: '6-12 months ago' },
    { value: '2_years', label: '1-2 years ago' },
    { value: '2+_years', label: 'More than 2 years ago' },
    { value: 'never', label: 'Never worked in this role' }
  ];

  urgencyOptions = [
    { value: 'immediate', label: 'Immediate', hint: 'I need a role within 1-2 weeks' },
    { value: '1_month', label: 'Within a month', hint: 'Actively job hunting' },
    { value: '3_months', label: 'Within 3 months', hint: 'Planning a transition' },
    { value: 'exploring', label: 'Just exploring', hint: 'Considering options, no rush' }
  ];

  blockerOptions = [
    { value: 'cv', label: 'CV/Resume issues', hint: 'Not getting enough callbacks' },
    { value: 'positioning', label: 'Can\'t position myself', hint: 'Struggle to frame my experience' },
    { value: 'no_experience', label: 'Lack of experience', hint: 'Don\'t have enough relevant work' },
    { value: 'career_switch', label: 'Career switch complexity', hint: 'Coming from a different field entirely' },
    { value: 'interview_skills', label: 'Interview skills', hint: 'Get interviews but fail to convert' }
  ];

  canProceed(): boolean {
    switch (this.step()) {
      case 1: return !!this.targetRole.trim();
      case 2: return !!this.lastWorkedInRole;
      case 3: return !!this.urgency;
      case 4: return true; // optional
      case 5: return !!this.mainBlocker;
      default: return false;
    }
  }

  submit() {
    this.submitting.set(true);
    this.analytics.trackEvent('session_started', { mode: 'ADVANCED', role: this.targetRole });

    this.sessionApi.createSession({
      mode: 'ADVANCED',
      targetRole: this.targetRole,
      lastWorkedInRole: this.lastWorkedInRole,
      urgency: this.urgency,
      recentWorkExamples: this.recentWorkExamples,
      mainBlocker: this.mainBlocker
    }).subscribe({
      next: (res) => {
        this.analytics.trackEvent('session_completed', { mode: 'ADVANCED', status: res.status });
        this.router.navigate(['/session', res.id]);
      },
      error: () => {
        this.submitting.set(false);
        alert('Something went wrong. Please try again.');
      }
    });
  }
}
