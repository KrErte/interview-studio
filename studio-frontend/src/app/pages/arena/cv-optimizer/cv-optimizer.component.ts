import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaService, CvOptimizerResponse } from '../../../services/arena.service';

@Component({
  selector: 'app-cv-optimizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-300">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-100">CV / LinkedIn Optimizer</h1>
        </div>
        <p class="text-slate-400">Upload your CV and get ATS optimization insights and LinkedIn tips.</p>
      </div>

      <!-- Upload form -->
      <div *ngIf="!result" class="space-y-4">
        <!-- Drop zone -->
        <div class="rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/60 p-10 text-center transition hover:border-teal-500/50 cursor-pointer"
             (click)="fileInput.click()"
             (dragover)="onDragOver($event)"
             (drop)="onDrop($event)">
          <svg class="mx-auto h-10 w-10 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p class="text-sm text-slate-400 mb-1">
            <span class="text-teal-400 font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-slate-500">PDF files only (max 10MB)</p>
          <input #fileInput type="file" accept=".pdf" class="hidden" (change)="onFileSelected($event)" />
        </div>

        <!-- Selected file -->
        <div *ngIf="selectedFile" class="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
          <svg class="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="flex-1 text-sm text-slate-200 truncate">{{ selectedFile.name }}</span>
          <span class="text-xs text-slate-500">{{ (selectedFile.size / 1024).toFixed(0) }} KB</span>
          <button (click)="removeFile()" class="text-slate-500 hover:text-rose-400 transition">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Target role -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Target Role (optional)</label>
          <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Data Scientist"
                 class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
        </div>

        <button (click)="analyze()" [disabled]="loading || !selectedFile"
                class="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
          <div *ngIf="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          {{ loading ? 'Analyzing...' : 'Analyze CV' }}
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
        {{ error }}
      </div>

      <!-- Results -->
      <div *ngIf="result" class="space-y-6">
        <!-- ATS Score Gauge -->
        <div class="text-center py-6">
          <div class="inline-flex h-28 w-28 items-center justify-center rounded-full border-4"
               [ngClass]="{
                 'border-emerald-500': result.atsScore >= 70,
                 'border-amber-500': result.atsScore >= 40 && result.atsScore < 70,
                 'border-rose-500': result.atsScore < 40
               }">
            <div>
              <span class="text-4xl font-bold"
                    [ngClass]="{
                      'text-emerald-400': result.atsScore >= 70,
                      'text-amber-400': result.atsScore >= 40 && result.atsScore < 70,
                      'text-rose-400': result.atsScore < 40
                    }">{{ result.atsScore }}</span>
              <p class="text-xs text-slate-500">ATS Score</p>
            </div>
          </div>
          <p class="mt-3 text-sm"
             [ngClass]="{
               'text-emerald-400': result.atsScore >= 70,
               'text-amber-400': result.atsScore >= 40 && result.atsScore < 70,
               'text-rose-400': result.atsScore < 40
             }">
            {{ result.atsScore >= 70 ? 'Great ATS compatibility!' : result.atsScore >= 40 ? 'Room for improvement' : 'Needs significant work' }}
          </p>
        </div>

        <!-- Overall Summary -->
        <div *ngIf="result.overallSummary" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Summary</h3>
          <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ result.overallSummary }}</p>
        </div>

        <!-- Missing Keywords -->
        <div *ngIf="result.missingKeywords?.length" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
          <h3 class="text-sm font-semibold text-rose-300 mb-3">Missing Keywords</h3>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let kw of result.missingKeywords"
                  class="rounded-full bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs text-rose-300">
              {{ kw }}
            </span>
          </div>
        </div>

        <!-- Section Feedback -->
        <div *ngIf="result.sectionFeedback?.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-200">Section Feedback</h3>
          <div *ngFor="let sf of result.sectionFeedback"
               class="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-semibold text-slate-200">{{ sf.section }}</span>
              <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300': sf.status === 'GOOD' || sf.status === 'STRONG',
                      'bg-amber-500/20 text-amber-300': sf.status === 'NEEDS_WORK' || sf.status === 'AVERAGE',
                      'bg-rose-500/20 text-rose-300': sf.status === 'MISSING' || sf.status === 'WEAK'
                    }">
                {{ sf.status }}
              </span>
            </div>
            <p class="text-sm text-slate-400">{{ sf.suggestion }}</p>
          </div>
        </div>

        <!-- Impact Improvements -->
        <div *ngIf="result.impactImprovements?.length" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Impact Improvements</h3>
          <ul class="space-y-2">
            <li *ngFor="let imp of result.impactImprovements" class="flex items-start gap-2 text-sm text-slate-300">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              {{ imp }}
            </li>
          </ul>
        </div>

        <!-- LinkedIn Tips -->
        <div *ngIf="result.linkedInTips?.length" class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <h3 class="text-sm font-semibold text-blue-300 mb-3">LinkedIn Tips</h3>
          <ul class="space-y-2">
            <li *ngFor="let tip of result.linkedInTips" class="flex items-start gap-2 text-sm text-blue-200/80">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>

        <!-- Analyze another -->
        <div class="text-center pt-4">
          <button (click)="reset()"
                  class="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition">
            Analyze Another CV
          </button>
        </div>
      </div>
    </div>
  `
})
export class CvOptimizerComponent {
  selectedFile: File | null = null;
  targetRole = '';
  loading = false;
  error: string | null = null;
  result: CvOptimizerResponse | null = null;

  constructor(private arena: ArenaService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files?.length) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
      }
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  analyze(): void {
    if (!this.selectedFile || this.loading) return;
    this.loading = true;
    this.error = null;

    this.arena.analyzeCv(this.selectedFile, this.targetRole || undefined).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'CV analysis failed. Please try again.';
      }
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.targetRole = '';
    this.result = null;
    this.error = null;
  }
}
