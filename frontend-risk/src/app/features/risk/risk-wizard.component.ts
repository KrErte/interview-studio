import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RiskApiService, RiskAssessmentPayload } from './risk-api.service';
import { RiskQuestion, RiskWizardState } from './risk.model';
import { RiskStateService } from './risk-state.service';

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
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-4">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-xs text-emerald-300 font-semibold">THREAT ANALYSIS IN PROGRESS</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Career Disruption Scanner</h1>
        <p class="text-slate-400">Complete each module to generate your personalized threat assessment</p>
      </div>

      <!-- Progress Steps - Terminal Style -->
      <div class="relative mb-10">
        <!-- Progress Line -->
        <div class="absolute top-5 left-0 right-0 h-0.5 bg-slate-800">
          <div
            class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
            [style.width.%]="(currentStep / (steps.length - 1)) * 100"
          ></div>
        </div>

        <!-- Step Indicators -->
        <div class="relative flex justify-between">
          <div
            *ngFor="let step of steps; let i = index"
            class="flex flex-col items-center"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10"
              [class.bg-gradient-to-br]="i <= currentStep"
              [class.from-emerald-500]="i <= currentStep"
              [class.to-cyan-500]="i <= currentStep"
              [class.text-slate-900]="i <= currentStep"
              [class.bg-slate-800]="i > currentStep"
              [class.text-slate-500]="i > currentStep"
              [class.ring-4]="i === currentStep"
              [class.ring-emerald-500/30]="i === currentStep"
            >
              <svg *ngIf="i < currentStep" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              <span *ngIf="i >= currentStep">{{ i + 1 }}</span>
            </div>
            <span
              class="mt-2 text-xs font-medium transition-colors"
              [class.text-emerald-400]="i === currentStep"
              [class.text-slate-400]="i !== currentStep"
            >{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Card -->
      <div class="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur overflow-hidden">
        <!-- Card Header -->
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center"
              [class]="steps[currentStep].iconBg"
            >
              <svg class="w-5 h-5" [class]="steps[currentStep].iconColor" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="steps[currentStep].icon" />
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-bold text-white">{{ steps[currentStep].title }}</h2>
              <p class="text-sm text-slate-500">{{ steps[currentStep].description }}</p>
            </div>
          </div>
          <button
            class="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
            (click)="startOver()"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        <!-- Card Body -->
        <div class="p-6">
          <!-- Step 0: CV Upload -->
          <div *ngIf="currentStep === 0" class="space-y-6">
            <div
              class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer"
              [class.border-slate-700]="!cvFileName"
              [class.hover:border-emerald-500/50]="!cvFileName"
              [class.border-emerald-500]="cvFileName"
              [class.bg-emerald-500/5]="cvFileName"
            >
              <input
                type="file"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="application/pdf"
                (change)="onFileSelected($event)"
              />
              <div *ngIf="!cvFileName" class="space-y-3">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
                  <svg class="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-300">Drop your CV here or click to browse</p>
                  <p class="text-xs text-slate-500 mt-1">PDF format, max 10MB</p>
                </div>
              </div>
              <div *ngIf="cvFileName" class="space-y-3">
                <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-emerald-400">{{ cvFileName }}</p>
                  <p class="text-xs text-slate-500 mt-1">Click to replace</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <input
                type="checkbox"
                id="useLatest"
                class="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                [checked]="useLatest"
                (change)="toggleUseLatest($event)"
              />
              <label for="useLatest" class="text-sm text-slate-300 cursor-pointer">
                Use my previously uploaded CV
              </label>
            </div>
          </div>

          <!-- Step 1: Experience -->
          <div *ngIf="currentStep === 1">
            <form [formGroup]="experienceForm" class="grid gap-5 md:grid-cols-2">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Years of Experience</label>
                <input
                  type="number"
                  formControlName="years"
                  class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="5"
                />
                <p class="text-xs text-rose-400" *ngIf="experienceForm.controls.years.touched && experienceForm.controls.years.invalid">
                  Please enter your years of experience
                </p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Current Role</label>
                <input
                  type="text"
                  formControlName="role"
                  class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Product Manager"
                />
                <p class="text-xs text-rose-400" *ngIf="experienceForm.controls.role.touched && experienceForm.controls.role.invalid">
                  Please enter your current role
                </p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Industry</label>
                <select
                  formControlName="industry"
                  class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="" class="bg-slate-900">Select your industry</option>
                  <option value="Technology" class="bg-slate-900">Technology</option>
                  <option value="Finance" class="bg-slate-900">Finance</option>
                  <option value="Healthcare" class="bg-slate-900">Healthcare</option>
                  <option value="Education" class="bg-slate-900">Education</option>
                  <option value="Manufacturing" class="bg-slate-900">Manufacturing</option>
                  <option value="Retail" class="bg-slate-900">Retail</option>
                  <option value="Other" class="bg-slate-900">Other</option>
                </select>
                <p class="text-xs text-rose-400" *ngIf="experienceForm.controls.industry.touched && experienceForm.controls.industry.invalid">
                  Please select your industry
                </p>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-300">Country</label>
                <select
                  formControlName="country"
                  class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Estonia" class="bg-slate-900">Estonia</option>
                  <option value="Finland" class="bg-slate-900">Finland</option>
                  <option value="Sweden" class="bg-slate-900">Sweden</option>
                  <option value="Germany" class="bg-slate-900">Germany</option>
                  <option value="United Kingdom" class="bg-slate-900">United Kingdom</option>
                  <option value="United States" class="bg-slate-900">United States</option>
                  <option value="Other" class="bg-slate-900">Other</option>
                </select>
              </div>
            </form>
          </div>

          <!-- Step 2: Adaptive Questions -->
          <div *ngIf="currentStep === 2" class="space-y-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm text-slate-400">Answer these to personalize your analysis</p>
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <div
                    *ngFor="let q of questions; let i = index"
                    class="w-2 h-2 rounded-full transition-colors"
                    [class.bg-emerald-500]="!!getAnswerValue(q.id)"
                    [class.bg-slate-700]="!getAnswerValue(q.id)"
                  ></div>
                </div>
                <span class="text-xs text-slate-500">{{ answeredCount }}/{{ questions.length }}</span>
              </div>
            </div>

            <div *ngFor="let q of questions" class="p-5 rounded-xl border border-slate-800 bg-slate-800/30">
              <p class="text-sm font-semibold text-white mb-3">{{ q.label }}</p>

              <!-- Scale Input -->
              <div *ngIf="q.type === 'scale'" class="space-y-3">
                <input
                  type="range"
                  class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  [min]="q.min || 1"
                  [max]="q.max || 5"
                  [formControl]="getAnswerControl(q.id)"
                />
                <div class="flex justify-between text-xs text-slate-500">
                  <span>Rarely</span>
                  <span class="text-emerald-400 font-semibold">{{ getAnswerControl(q.id).value || q.min || 1 }}</span>
                  <span>Very often</span>
                </div>
              </div>

              <!-- Multi-select -->
              <div *ngIf="q.type === 'multi-select'" class="flex flex-wrap gap-2">
                <button
                  *ngFor="let opt of q.options"
                  type="button"
                  class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  [class.bg-emerald-500]="isChecked(q.id, opt.value)"
                  [class.text-slate-900]="isChecked(q.id, opt.value)"
                  [class.bg-slate-800]="!isChecked(q.id, opt.value)"
                  [class.text-slate-300]="!isChecked(q.id, opt.value)"
                  [class.hover:bg-slate-700]="!isChecked(q.id, opt.value)"
                  (click)="toggleMultiDirect(q.id, opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>

              <!-- Boolean -->
              <div *ngIf="q.type === 'boolean'" class="flex gap-3">
                <button
                  type="button"
                  class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  [class.bg-emerald-500]="getAnswerControl(q.id).value === true"
                  [class.text-slate-900]="getAnswerControl(q.id).value === true"
                  [class.bg-slate-800]="getAnswerControl(q.id).value !== true"
                  [class.text-slate-300]="getAnswerControl(q.id).value !== true"
                  [class.hover:bg-slate-700]="getAnswerControl(q.id).value !== true"
                  (click)="setBoolean(q.id, true)"
                >
                  Yes
                </button>
                <button
                  type="button"
                  class="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                  [class.bg-emerald-500]="getAnswerControl(q.id).value === false"
                  [class.text-slate-900]="getAnswerControl(q.id).value === false"
                  [class.bg-slate-800]="getAnswerControl(q.id).value !== false"
                  [class.text-slate-300]="getAnswerControl(q.id).value !== false"
                  [class.hover:bg-slate-700]="getAnswerControl(q.id).value !== false"
                  (click)="setBoolean(q.id, false)"
                >
                  No
                </button>
              </div>

              <!-- Text -->
              <div *ngIf="q.type === 'text'">
                <textarea
                  class="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none"
                  rows="3"
                  [formControl]="getAnswerControl(q.id)"
                  [placeholder]="q.placeholder || 'Your answer'"
                ></textarea>
              </div>

              <p class="text-xs text-rose-400 mt-2" *ngIf="q.required && !getAnswerValue(q.id)">
                This field is required
              </p>
            </div>
          </div>

          <!-- Step 3: Review -->
          <div *ngIf="currentStep === 3" class="space-y-5">
            <!-- CV Review -->
            <div class="p-5 rounded-xl border border-slate-800 bg-slate-800/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 uppercase">CV Source</p>
                    <p class="text-sm font-semibold text-white">{{ cvFileName || (useLatest ? 'Using latest CV' : 'No CV selected') }}</p>
                  </div>
                </div>
                <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Experience Review -->
            <div class="p-5 rounded-xl border border-slate-800 bg-slate-800/30">
              <p class="text-xs text-slate-500 uppercase mb-3">Profile Summary</p>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500">Role</p>
                  <p class="text-sm font-semibold text-white">{{ experienceForm.value.role }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Industry</p>
                  <p class="text-sm font-semibold text-white">{{ experienceForm.value.industry }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Experience</p>
                  <p class="text-sm font-semibold text-white">{{ experienceForm.value.years }} years</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500">Location</p>
                  <p class="text-sm font-semibold text-white">{{ experienceForm.value.country }}</p>
                </div>
              </div>
            </div>

            <!-- Analysis Preview -->
            <div class="p-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <svg class="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">Ready for Analysis</p>
                  <p class="text-xs text-slate-400">Our AI will analyze your profile against 50,000+ data points</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div *ngIf="error" class="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p class="text-sm text-rose-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            *ngIf="currentStep > 0"
            type="button"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
            (click)="back()"
          >
            Back
          </button>
          <div *ngIf="currentStep === 0"></div>

          <button
            *ngIf="currentStep < 3"
            type="button"
            class="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all"
            [disabled]="!canProceed() || loading"
            (click)="next()"
          >
            {{ loading ? 'Processing...' : 'Continue' }}
          </button>

          <button
            *ngIf="currentStep === 3"
            type="button"
            class="px-8 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all flex items-center gap-2"
            [disabled]="loading"
            (click)="submitAssessment()"
          >
            <svg *ngIf="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Analyzing...' : 'Generate Risk Report' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class RiskWizardComponent implements OnInit {
  steps = [
    {
      label: 'CV',
      title: 'Upload Your CV',
      description: 'We analyze your skills and experience',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Profile',
      title: 'Work Experience',
      description: 'Tell us about your current role',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    {
      label: 'Analysis',
      title: 'Risk Factors',
      description: 'Personalized threat assessment questions',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400'
    },
    {
      label: 'Report',
      title: 'Review & Generate',
      description: 'Confirm your data and get your report',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400'
    }
  ];

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
    private router: Router
  ) {
    const experienceControls: ExperienceFormControls = {
      years: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      role: this.fb.nonNullable.control('', Validators.required),
      industry: this.fb.nonNullable.control('', Validators.required),
      country: this.fb.nonNullable.control('Estonia', Validators.required)
    };
    this.experienceForm = this.fb.group(experienceControls);
    this.answersForm = this.fb.group({});
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

  canProceed(): boolean {
    if (this.currentStep === 0) return !!this.cvId || this.useLatest;
    if (this.currentStep === 1) return this.experienceForm.valid;
    if (this.currentStep === 2) return this.questionsValid();
    return true;
  }

  next(): void {
    if (!this.canProceed()) {
      if (this.currentStep === 1) this.experienceForm.markAllAsTouched();
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

  getAnswerControl(questionId: string): FormControl<any> {
    if (!this.answersForm.contains(questionId)) {
      this.answersForm.addControl(questionId, this.fb.control(''));
    }
    return this.answersForm.get(questionId) as FormControl<any>;
  }

  toggleMultiDirect(questionId: string, value: string): void {
    const current = new Set<string>((this.getAnswerValue(questionId) as string[]) ?? []);
    current.has(value) ? current.delete(value) : current.add(value);
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

  submitAssessment(): void {
    this.error = '';
    this.loading = true;

    const payload: RiskAssessmentPayload = {
      cvId: this.cvId,
      useLatestCv: this.useLatest,
      experience: {
        years: this.experienceForm.value.years ?? null,
        role: this.experienceForm.value.role || '',
        industry: this.experienceForm.value.industry || '',
        country: this.experienceForm.value.country || ''
      },
      answers: this.answersForm.getRawValue()
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
    this.riskApi.fetchQuestions(existing).subscribe({
      next: (qs) => {
        this.questions = qs?.length ? qs : this.defaultQuestions();
        this.applyAnswers(existing);
      },
      error: () => {
        this.questions = this.defaultQuestions();
        this.applyAnswers(existing);
      }
    });
  }

  private defaultQuestions(): RiskQuestion[] {
    return [
      {
        id: 'automationExposure',
        label: 'How much of your daily work involves repetitive, rule-based tasks?',
        type: 'scale',
        min: 1,
        max: 5,
        required: true
      },
      {
        id: 'aiTooling',
        label: 'Which AI tools do you currently use in your work?',
        type: 'multi-select',
        required: true,
        options: [
          { value: 'copilot', label: 'AI Copilots' },
          { value: 'automation', label: 'Automation' },
          { value: 'analytics', label: 'AI Analytics' },
          { value: 'none', label: 'None yet' }
        ]
      },
      {
        id: 'clientFacing',
        label: 'Is your role primarily client or customer-facing?',
        type: 'boolean',
        required: true
      },
      {
        id: 'upskilling',
        label: 'What skills are you currently learning or improving?',
        type: 'text',
        placeholder: 'e.g., data analysis, prompt engineering, leadership',
        required: false
      }
    ];
  }

  private applyAnswers(existing: Record<string, any>): void {
    Object.entries(existing).forEach(([key, value]) => {
      this.getAnswerControl(key).setValue(value);
    });
  }

  getAnswerValue(questionId: string): any {
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
