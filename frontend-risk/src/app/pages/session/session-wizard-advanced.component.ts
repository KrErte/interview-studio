import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionApiService } from '../../core/services/session-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-session-wizard-advanced',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-12">
      <!-- Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>{{ 'common.step' | translate }} {{ step() }} / 6</span>
          <span class="text-purple-400">{{ 'wizard.advancedAssessment' | translate }}</span>
        </div>
        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
            [style.width.%]="(step() / 6) * 100"></div>
        </div>
      </div>

      <!-- Step 1: Target Role -->
      @if (step() === 1) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">What role are you targeting?</h1>
          <p class="text-slate-400 mb-8">Be specific — e.g. "Senior Sales Manager" or "Data Analyst"</p>
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
            placeholder="E.g. 'Increased quarterly sales by 30%...' or 'Led a team of 5 to deliver a key project on time...'"
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

      <!-- Step 6: CV Upload (Optional) -->
      @if (step() === 6) {
        <div class="animate-fadeIn">
          <h1 class="text-3xl font-bold text-white mb-2">Upload your CV (optional)</h1>
          <p class="text-slate-400 mb-8">A CV helps us give more personalized recommendations</p>

          <div
            class="relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer"
            [class]="dragging ? 'border-purple-500 bg-purple-500/5' : 'border-slate-700 hover:border-slate-500'"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="cvFileInput.click()">

            <input #cvFileInput type="file" class="hidden"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              (change)="onFileSelected($event)">

            @if (!cvFileName) {
              <div class="space-y-3">
                <svg class="w-12 h-12 mx-auto text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-slate-300 font-medium">Drag & drop your CV here</p>
                <p class="text-sm text-slate-500">or <span class="text-purple-400 font-semibold">browse files</span></p>
                <p class="text-xs text-slate-600">PDF, DOC, DOCX, or TXT (max 8 MB)</p>
              </div>
            } @else {
              <div class="space-y-3">
                <svg class="w-12 h-12 mx-auto text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-emerald-300 font-medium">{{ cvFileName }}</p>
                @if (cvText) {
                  <p class="text-xs text-slate-500">{{ cvText.length }} characters extracted</p>
                } @else {
                  <p class="text-xs text-slate-500">File attached (text will be extracted on server)</p>
                }
                <button (click)="removeCv($event)" class="text-xs text-slate-500 hover:text-red-400 underline transition-colors">Remove</button>
              </div>
            }
          </div>

          <p class="text-xs text-slate-600 mt-3 text-center">You can skip this step — your assessment will still work without a CV</p>
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

        <div class="flex items-center gap-3">
          @if (!canProceed() && showHint()) {
            <span class="text-sm text-amber-400">{{ hintMessage() }}</span>
          }
        </div>
        @if (step() < 6) {
          <button (click)="onNext()" [disabled]="!canProceed()"
            class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-40 transition-all">
            {{ 'common.next' | translate }}
          </button>
        } @else {
          <div class="flex gap-3">
            @if (!cvFileName) {
              <button (click)="submit()"
                [disabled]="submitting()"
                class="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">
                {{ 'wizard.skipSubmit' | translate }}
              </button>
            }
            <button (click)="submit()" [disabled]="submitting()"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold disabled:opacity-40 transition-all">
              @if (submitting()) { {{ 'wizard.analyzing' | translate }} } @else { {{ 'wizard.getFullAssessment' | translate }} }
            </button>
          </div>
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
  showHint = signal(false);

  targetRole = '';
  lastWorkedInRole = '';
  urgency = '';
  recentWorkExamples = '';
  mainBlocker = '';
  cvFileName = '';
  cvText = '';
  dragging = false;

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
      case 6: return true; // optional CV upload
      default: return false;
    }
  }

  hintMessage(): string {
    switch (this.step()) {
      case 1: return 'Please enter a target role';
      case 2: return 'Please select when you last worked in this role';
      case 3: return 'Please select your urgency level';
      case 5: return 'Please select your main blocker';
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  removeCv(event: Event): void {
    event.stopPropagation();
    this.cvFileName = '';
    this.cvText = '';
  }

  private handleFile(file: File): void {
    const maxSize = 8 * 1024 * 1024; // 8 MB
    if (file.size > maxSize) {
      alert('File too large. Maximum 8 MB.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx', 'txt'].includes(ext)) {
      alert('Unsupported file type. Please use PDF, DOC, DOCX, or TXT.');
      return;
    }

    this.cvFileName = file.name;

    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = () => {
        this.cvText = (reader.result as string) || '';
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOC/DOCX, we can only show the filename
      // Text extraction would happen server-side
      this.cvText = '';
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
      mainBlocker: this.mainBlocker,
      cvText: this.cvText || undefined
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
