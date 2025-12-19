import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiskApiService, RiskAssessmentPayload } from './risk-api.service';
import { RiskQuestion, RiskWizardState } from './risk.model';
import { RiskStateService } from './risk-state.service';
import { DepthSelectorComponent } from '../../risk/components/depth-selector/depth-selector.component';
import { DepthBadgeComponent } from '../../risk/components/depth-badge/depth-badge.component';
import { DepthPreferenceService } from '../../risk/services/depth-preference.service';
import { DepthConfig } from '../../risk/models/depth.model';

type ExperienceFormControls = {
  years: FormControl<number | null>;
  role: FormControl<string>;
  industry: FormControl<string>;
  country: FormControl<string>;
};
type ExperienceForm = FormGroup<ExperienceFormControls>;

@Component({
  selector: 'app-risk-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DepthSelectorComponent, DepthBadgeComponent],
  styleUrls: ['./risk-wizard.component.scss'],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase text-emerald-300 font-semibold">Risk flow</p>
          <h1 class="text-2xl font-bold text-slate-50">AI Risk Assessment</h1>
          <p class="text-sm text-slate-400">Four steps to your personalized risk score.</p>
        </div>
        <button class="text-sm text-emerald-300 hover:text-emerald-200" (click)="startOver()">Start over</button>
      </div>

      <div class="grid gap-3 md:grid-cols-4">
        <div
          *ngFor="let step of steps; index as i"
          class="rounded-lg border px-3 py-3 text-sm"
          [class.border-emerald-500]="currentStep === i"
          [class.bg-slate-900]="currentStep === i"
          [class.border-slate-800]="currentStep !== i"
        >
          <p class="text-xs uppercase text-slate-400">Step {{ i + 1 }}</p>
          <div class="flex items-center gap-2">
            <p class="font-semibold text-slate-100">{{ step }}</p>
            <app-depth-badge *ngIf="i === 0 && inputsCompleted"></app-depth-badge>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-emerald-500/5 space-y-4">
        <ng-container [ngSwitch]="currentStep">
          <ng-container *ngSwitchCase="0">
            <h2 class="text-lg font-semibold text-slate-50 mb-2">Upload your CV</h2>
            <p class="text-sm text-slate-400 mb-4">Upload a PDF or reuse your latest CV.</p>

            <label class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-slate-700 hover:border-emerald-400">
              <div class="flex flex-col items-center justify-center pt-5 pb-6 text-slate-300 text-sm">
                <p *ngIf="!cvFileName">Click to select a PDF</p>
                <p *ngIf="cvFileName" class="text-emerald-300 font-semibold">Uploaded: {{ cvFileName }}</p>
              </div>
              <input type="file" class="hidden" accept="application/pdf" (change)="onFileSelected($event)" />
            </label>

            <div class="flex items-center gap-2 mt-4">
              <input type="checkbox" class="h-4 w-4" [checked]="useLatest" (change)="toggleUseLatest($event)" id="useLatest" />
              <label for="useLatest" class="text-sm text-slate-300">Use latest uploaded CV (if available)</label>
            </div>

            <div class="mt-6">
              <app-depth-selector></app-depth-selector>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-primary" (click)="next()" [disabled]="!canProceedCv() || loading">
                {{ loading ? 'Uploading...' : 'Next: Experience' }}
              </button>
            </div>

            <p class="text-xs text-rose-400" *ngIf="error">{{ error }}</p>
          </ng-container>

          <ng-container *ngSwitchCase="1">
            <h2 class="text-lg font-semibold text-slate-50 mb-2">Work experience</h2>
            <form [formGroup]="experienceForm" class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm text-slate-200">
                Years of experience
                <input type="number" formControlName="years" class="input" placeholder="5" />
                <span class="text-xs text-rose-400" *ngIf="experienceForm.controls.years.touched && experienceForm.controls.years.invalid">
                  Provide your experience in years.
                </span>
              </label>
              <label class="flex flex-col gap-1 text-sm text-slate-200">
                Current role title
                <input type="text" formControlName="role" class="input" placeholder="Product Manager" />
                <span class="text-xs text-rose-400" *ngIf="experienceForm.controls.role.touched && experienceForm.controls.role.invalid">
                  Role is required.
                </span>
              </label>
              <label class="flex flex-col gap-1 text-sm text-slate-200">
                Industry
                <select formControlName="industry" class="input">
                  <option value="">Select industry</option>
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                  <option>Other</option>
                </select>
                <span class="text-xs text-rose-400" *ngIf="experienceForm.controls.industry.touched && experienceForm.controls.industry.invalid">
                  Industry is required.
                </span>
              </label>
              <label class="flex flex-col gap-1 text-sm text-slate-200">
                Country
                <select formControlName="country" class="input">
                  <option>Estonia</option>
                  <option>Finland</option>
                  <option>Sweden</option>
                  <option>Germany</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                </select>
              </label>
            </form>

            <div class="flex gap-3 mt-6">
              <button class="btn-ghost" (click)="back()">Back</button>
              <button class="btn-primary" (click)="next()" [disabled]="!experienceForm.valid || loading">
                Next: Adaptive questions
              </button>
            </div>

            <p class="text-xs text-rose-400" *ngIf="error">{{ error }}</p>
          </ng-container>

          <ng-container *ngSwitchCase="2">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h2 class="text-lg font-semibold text-slate-50">Adaptive questions</h2>
                <p class="text-sm text-slate-400">We tailor these based on your profile.</p>
              </div>
              <p class="text-xs text-slate-400">Progress: {{ answeredCount }}/{{ questions.length }}</p>
            </div>

            <div class="space-y-4">
              <ng-container *ngFor="let q of questions; index as qi">
                <div class="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                  <p class="text-sm font-semibold text-slate-100">{{ q.label }}</p>

                  <ng-container [ngSwitch]="q.type">
                    <select *ngSwitchCase="'select'" class="input mt-2" [formControl]="getAnswerControl(q.id)">
                      <option value="">Select</option>
                      <option *ngFor="let opt of q.options" [value]="opt.value">{{ opt.label }}</option>
                    </select>

                    <div *ngSwitchCase="'multi-select'" class="mt-2 space-y-1">
                      <label *ngFor="let opt of q.options" class="flex items-center gap-2 text-sm text-slate-200">
                        <input type="checkbox" [value]="opt.value" (change)="toggleMulti(q.id, opt.value, $event)" [checked]="isChecked(q.id, opt.value)" />
                        {{ opt.label }}
                      </label>
                    </div>

                    <div *ngSwitchCase="'scale'" class="mt-3 flex items-center gap-2 text-sm text-slate-200">
                      <input type="range" class="flex-1 accent-emerald-400" [min]="q.min || 1" [max]="q.max || 5" [formControl]="getAnswerControl(q.id)" />
                      <span class="text-emerald-300 font-semibold">{{ getAnswerControl(q.id).value || q.min || 1 }}</span>
                    </div>

                    <div *ngSwitchCase="'boolean'" class="mt-2 flex gap-3">
                      <button type="button" class="btn-chip" [class.btn-chip-active]="getAnswerControl(q.id).value === true" (click)="setBoolean(q.id, true)">Yes</button>
                      <button type="button" class="btn-chip" [class.btn-chip-active]="getAnswerControl(q.id).value === false" (click)="setBoolean(q.id, false)">No</button>
                    </div>

                    <textarea *ngSwitchDefault class="input mt-2 h-20" [formControl]="getAnswerControl(q.id)" [placeholder]="q.placeholder || 'Your answer'"></textarea>
                  </ng-container>

                  <p class="text-xs text-rose-400 mt-2" *ngIf="q.required && !getAnswerControl(q.id).value">
                    This question is required.
                  </p>
                </div>
              </ng-container>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-ghost" (click)="back()">Back</button>
              <button class="btn-primary" (click)="next()" [disabled]="!questionsValid() || loading">
                Next: Review
              </button>
            </div>

            <p class="text-xs text-rose-400" *ngIf="error">{{ error }}</p>
          </ng-container>

          <ng-container *ngSwitchCase="3">
            <h2 class="text-lg font-semibold text-slate-50 mb-2">Review & submit</h2>
            <div class="space-y-3 text-sm text-slate-200">
              <div class="border border-slate-800 rounded-lg p-3">
                <p class="text-xs uppercase text-slate-400">CV</p>
                <p *ngIf="cvFileName; else useLatestTpl" class="font-semibold text-emerald-300">{{ cvFileName }}</p>
                <ng-template #useLatestTpl>
                  <p class="text-slate-300">Use latest CV: {{ useLatest ? 'Yes' : 'No file selected' }}</p>
                </ng-template>
              </div>
              <div class="border border-slate-800 rounded-lg p-3">
                <p class="text-xs uppercase text-slate-400">Experience</p>
                <p>{{ experienceForm.value.role }} • {{ experienceForm.value.industry }} • {{ experienceForm.value.country }}</p>
                <p class="text-slate-400">{{ experienceForm.value.years }} years</p>
              </div>
              <div class="border border-slate-800 rounded-lg p-3">
                <p class="text-xs uppercase text-slate-400">Adaptive answers</p>
                <ul class="list-disc list-inside space-y-1">
                  <li *ngFor="let q of questions" class="text-slate-200">
                    <span class="text-slate-400">{{ q.label }}:</span>
                    <span class="text-emerald-300">{{ displayAnswer(q) }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button class="btn-ghost" (click)="back()">Back</button>
              <button class="btn-primary" (click)="submitAssessment()" [disabled]="loading">
                {{ loading ? 'Calculating...' : 'Calculate Risk' }}
              </button>
            </div>
            <p class="text-xs text-rose-400" *ngIf="error">{{ error }}</p>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `
})
export class RiskWizardComponent implements OnInit {
  steps = ['CV', 'Experience', 'Adaptive', 'Review'];
  currentStep = 0;
  loading = false;
  error = '';

  cvFileName = '';
  cvId: string | undefined;
  useLatest = false;

  experienceForm: ExperienceForm;
  answersForm: FormGroup;
  questions: RiskQuestion[] = [];

  constructor(
    private fb: FormBuilder,
    private riskApi: RiskApiService,
    private state: RiskStateService,
    private router: Router,
    private depthPreference: DepthPreferenceService
  ) {
    const experienceControls: ExperienceFormControls = {
      years: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      role: this.fb.nonNullable.control('', Validators.required),
      industry: this.fb.nonNullable.control('', Validators.required),
      country: this.fb.nonNullable.control('Estonia', Validators.required)
    };
    this.experienceForm = this.fb.group(experienceControls);
    this.answersForm = this.fb.group({});
    effect(() => {
      this.depthPreference.depth();
      this.questions = this.applyDepthLimit(this.questions);
    });
  }

  ngOnInit(): void {
    this.restoreState();
    this.loadQuestions();
    this.experienceForm.valueChanges.subscribe(() => this.persist());
    this.answersForm.valueChanges.subscribe(() => this.persist());
  }

  private restoreState(): void {
    const saved = this.state.snapshot;
    this.cvId = saved.cv?.cvId;
    this.cvFileName = saved.cv?.fileName || '';
    this.useLatest = !!saved.cv?.useLatest;
    if (saved.experience) {
      this.experienceForm.patchValue({
        years: saved.experience.years ?? null,
        role: saved.experience.role || '',
        industry: saved.experience.industry || '',
        country: saved.experience.country || 'Estonia'
      });
    }
    if (saved.answers) {
      this.applyAnswers(saved.answers);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.loading = true;
    this.error = '';
    this.riskApi.uploadCv(file).subscribe({
      next: (res) => {
        this.loading = false;
        this.cvFileName = res.fileName;
        this.cvId = res.cvId;
        this.useLatest = false;
        this.persist();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Upload failed. Please try again.';
      }
    });
  }

  toggleUseLatest(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.useLatest = checked;
    if (checked) {
      this.cvId = undefined;
      this.cvFileName = '';
    }
    this.persist();
  }

  canProceedCv(): boolean {
    return !!this.cvId || this.useLatest;
  }

  next(): void {
    if (this.currentStep === 0 && !this.canProceedCv()) {
      this.error = 'Please upload a CV or use the latest one.';
      return;
    }

    if (this.currentStep === 1 && this.experienceForm.invalid) {
      this.experienceForm.markAllAsTouched();
      return;
    }

    if (this.currentStep === 2 && !this.questionsValid()) {
      return;
    }

    this.error = '';
    this.currentStep = Math.min(this.steps.length - 1, this.currentStep + 1);
    this.persist();
  }

  back(): void {
    this.error = '';
    this.currentStep = Math.max(0, this.currentStep - 1);
    this.persist();
  }

  get answeredCount(): number {
    return this.questions.filter((q) => !!this.getAnswerValue(q.id)).length;
  }

  get inputsCompleted(): boolean {
    return this.currentStep > 0;
  }

  private get depthConfig(): DepthConfig {
    return this.depthPreference.config();
  }

  getAnswerControl(questionId: string): FormControl<any> {
    if (!this.answersForm.contains(questionId)) {
      this.answersForm.addControl(questionId, this.fb.control(''));
    }
    return this.answersForm.get(questionId) as FormControl<any>;
  }

  toggleMulti(questionId: string, value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = new Set<string>((this.getAnswerValue(questionId) as string[]) ?? []);
    checked ? current.add(value) : current.delete(value);
    this.getAnswerControl(questionId).setValue(Array.from(current));
    this.persist();
  }

  isChecked(questionId: string, value: string): boolean {
    const current = this.getAnswerValue(questionId);
    return Array.isArray(current) ? current.includes(value) : false;
  }

  setBoolean(questionId: string, val: boolean): void {
    this.getAnswerControl(questionId).setValue(val);
    this.persist();
  }

  questionsValid(): boolean {
    return this.questions.every((q) => {
      if (!q.required) return true;
      const v = this.getAnswerValue(q.id);
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && v !== '';
    });
  }

  displayAnswer(q: RiskQuestion): string {
    const val = this.getAnswerValue(q.id);
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (val === null || val === undefined || val === '') return '—';
    return String(val);
  }

  submitAssessment(): void {
    this.error = '';
    this.loading = true;

    const preference = this.depthPreference.preference();
    const payload: RiskAssessmentPayload = {
      cvId: this.cvId,
      useLatestCv: this.useLatest,
      experience: {
        years: this.experienceForm.value.years ?? null,
        role: this.experienceForm.value.role || '',
        industry: this.experienceForm.value.industry || '',
        country: this.experienceForm.value.country || ''
      },
      answers: this.answersForm.getRawValue(),
      depth: preference.depth,
      persona: preference.persona
    };

    this.riskApi.assess(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.state.setResult(res);
        this.router.navigateByUrl('/risk/result');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not calculate risk. Please try again.';
      }
    });
  }

  startOver(): void {
    this.state.reset();
    this.currentStep = 0;
    this.cvFileName = '';
    this.cvId = undefined;
    this.useLatest = false;
    this.experienceForm.reset({
      years: null,
      role: '',
      industry: '',
      country: 'Estonia'
    });
    this.answersForm.reset();
  }

  private loadQuestions(): void {
    const existing = this.state.snapshot.answers || {};
    const depthPref = this.depthPreference.preference();
    this.riskApi.fetchQuestions(existing, depthPref.depth).subscribe({
      next: (qs) => {
        const source = qs?.length ? qs : this.defaultQuestions();
        this.questions = this.applyDepthLimit(source);
        this.applyAnswers(existing);
      },
      error: () => {
        this.questions = this.applyDepthLimit(this.defaultQuestions());
        this.applyAnswers(existing);
      }
    });
  }

  private defaultQuestions(): RiskQuestion[] {
    return [
      {
        id: 'automationExposure',
        label: 'How much of your daily work is repetitive and rule-based?',
        type: 'scale',
        min: 1,
        max: 5,
        required: true
      },
      {
        id: 'aiTooling',
        label: 'Which AI tooling do you already use?',
        type: 'multi-select',
        required: true,
        options: [
          { value: 'copilot', label: 'Code/Content copilots' },
          { value: 'automation', label: 'Automation workflows' },
          { value: 'analytics', label: 'Analytics/BI' },
          { value: 'none', label: 'None yet' }
        ]
      },
      {
        id: 'clientFacing',
        label: 'Is your role primarily client-facing?',
        type: 'boolean',
        required: true
      },
      {
        id: 'upskilling',
        label: 'What skills are you currently upskilling?',
        type: 'text',
        placeholder: 'e.g., data analysis, prompt design',
        required: false
      },
      {
        id: 'riskManagement',
        label: 'How often do you run risk reviews for your work?',
        type: 'select',
        required: true,
        options: [
          { value: 'never', label: 'Never' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'regularly', label: 'Regularly' }
        ]
      },
      {
        id: 'collaborationStyle',
        label: 'Which collaboration style fits you best?',
        type: 'select',
        required: false,
        options: [
          { value: 'solo', label: 'Independent' },
          { value: 'paired', label: 'Pair / small team' },
          { value: 'cross', label: 'Cross-functional' }
        ]
      },
      {
        id: 'deliveryCadence',
        label: 'What is your typical delivery cadence?',
        type: 'select',
        required: false,
        options: [
          { value: 'weekly', label: 'Weekly iterations' },
          { value: 'biweekly', label: 'Bi-weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'adHoc', label: 'Ad-hoc' }
        ]
      },
      {
        id: 'learningHours',
        label: 'How many hours per week do you dedicate to learning?',
        type: 'scale',
        min: 0,
        max: 10,
        required: false
      }
    ];
  }

  private applyDepthLimit(questions: RiskQuestion[]): RiskQuestion[] {
    if (!questions?.length) {
      return [];
    }
    const cfg = this.depthConfig;
    const maxCount = cfg.questionCountMax ?? cfg.questionCount;
    const limited = questions.slice(0, maxCount);
    if (limited.length >= cfg.questionCount) {
      return limited;
    }
    const defaults = this.defaultQuestions();
    const merged = [...limited];
    for (const q of defaults) {
      if (merged.length >= cfg.questionCount) {
        break;
      }
      if (!merged.find((existing) => existing.id === q.id)) {
        merged.push(q);
      }
    }
    return merged;
  }

  private applyAnswers(existing: Record<string, any>): void {
    Object.entries(existing).forEach(([key, value]) => {
      this.getAnswerControl(key).setValue(value);
    });
  }

  private getAnswerValue(questionId: string): any {
    return this.getAnswerControl(questionId).value;
  }

  private persist(): void {
    const state: RiskWizardState = {
      cv: { cvId: this.cvId, fileName: this.cvFileName, useLatest: this.useLatest },
      experience: this.experienceForm.getRawValue(),
      answers: this.answersForm.getRawValue(),
      result: this.state.snapshot.result
    };
    this.state.update(state);
  }
}

