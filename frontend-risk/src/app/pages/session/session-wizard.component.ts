import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionApiService } from '../../core/services/session-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-session-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>{{ 'common.step' | translate }} {{ step() }} / 3</span>
          <span>{{ 'wizard.quickAssessment' | translate }}</span>
        </div>
        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-300"
            [style.width.%]="(step() / 3) * 100"></div>
        </div>
      </div>

      <!-- Step 1: Target Role -->
      @if (step() === 1) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">What role are you targeting?</h1>
          <p class="text-slate-400 mb-8">Tell us the position you're preparing for</p>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            @for (role of suggestedRoles; track role) {
              <button (click)="targetRole = role; step.set(2)"
                class="p-3 rounded-xl border text-sm text-left transition-all"
                [class]="targetRole === role
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-600'">
                {{ role }}
              </button>
            }
          </div>

          <input type="text" [(ngModel)]="targetRole" placeholder="Or type your target role..."
            class="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none">
        </div>
      }

      <!-- Step 2: Experience Level -->
      @if (step() === 2) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">Your experience with this role?</h1>
          <p class="text-slate-400 mb-8">How familiar are you with <span class="text-emerald-400">{{ targetRole }}</span>?</p>

          <div class="space-y-3">
            @for (opt of experienceOptions; track opt.value) {
              <button (click)="experienceLevel = opt.value"
                class="w-full p-4 rounded-xl border text-left transition-all"
                [class]="experienceLevel === opt.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'">
                <div class="font-semibold text-white">{{ opt.label }}</div>
                <div class="text-sm text-slate-400 mt-1">{{ opt.hint }}</div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 3: Main Challenge -->
      @if (step() === 3) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">What's your biggest challenge?</h1>
          <p class="text-slate-400 mb-8">What's holding you back from landing <span class="text-emerald-400">{{ targetRole }}</span>?</p>

          <div class="space-y-3">
            @for (opt of challengeOptions; track opt.value) {
              <button (click)="mainChallenge = opt.value"
                class="w-full p-4 rounded-xl border text-left transition-all"
                [class]="mainChallenge === opt.value
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'">
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
            {{ 'common.back' | translate }}
          </button>
        } @else {
          <div></div>
        }

        @if (step() < 3) {
          <button (click)="step.set(step() + 1)" [disabled]="!canProceed()"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold disabled:opacity-40 transition-all">
            {{ 'common.next' | translate }}
          </button>
        } @else {
          <button (click)="submit()" [disabled]="!canProceed() || submitting()"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold disabled:opacity-40 transition-all">
            @if (submitting()) { {{ 'wizard.analyzing' | translate }} } @else { {{ 'wizard.getAssessment' | translate }} }
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
export class SessionWizardComponent {
  private readonly sessionApi = inject(SessionApiService);
  private readonly router = inject(Router);
  private readonly analytics = inject(AnalyticsService);

  step = signal(1);
  submitting = signal(false);

  targetRole = '';
  experienceLevel = '';
  mainChallenge = '';

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
      default: return false;
    }
  }

  submit() {
    this.submitting.set(true);
    this.analytics.trackEvent('session_started', { mode: 'SIMPLE', role: this.targetRole });

    this.sessionApi.createSession({
      mode: 'SIMPLE',
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel,
      mainChallenge: this.mainChallenge
    }).subscribe({
      next: (res) => {
        this.analytics.trackEvent('session_completed', { mode: 'SIMPLE', status: res.status });
        // Store in sessionStorage for guest access
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
