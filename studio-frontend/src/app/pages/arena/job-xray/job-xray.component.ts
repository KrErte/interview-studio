import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArenaService, JobXrayResponse } from '../../../services/arena.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-job-xray',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-100">Job X-Ray</h1>
        </div>
        <p class="text-slate-400">Paste a job description and get a deep analysis of what the employer really wants.</p>
      </div>

      <!-- Usage counter for free users -->
      <div *ngIf="!auth.isArenaPro() && result"
           class="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-400">Free usage this month</span>
          <span class="text-sm font-semibold"
                [ngClass]="result.usageCount >= result.usageLimit ? 'text-rose-400' : 'text-emerald-400'">
            {{ result.usageCount }} / {{ result.usageLimit }}
          </span>
        </div>
        <div class="mt-2 h-1.5 rounded-full bg-slate-800">
          <div class="h-1.5 rounded-full transition-all"
               [ngClass]="result.usageCount >= result.usageLimit ? 'bg-rose-500' : 'bg-emerald-500'"
               [style.width.%]="(result.usageCount / result.usageLimit) * 100"></div>
        </div>
      </div>

      <!-- Upgrade banner when limit reached -->
      <div *ngIf="limitReached"
           class="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
        <p class="text-amber-200 font-semibold mb-2">Monthly free limit reached</p>
        <p class="text-sm text-amber-300/70 mb-4">Upgrade to Arena Pro for unlimited analyses.</p>
        <a routerLink="/pricing"
           class="inline-block rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition">
          Upgrade to Arena Pro
        </a>
      </div>

      <!-- Input form -->
      <div *ngIf="!limitReached" class="mb-8 space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Job Description *</label>
          <textarea
            [(ngModel)]="jobDescription"
            rows="8"
            placeholder="Paste the full job description here..."
            class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-y">
          </textarea>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Target Role (optional)</label>
          <input
            [(ngModel)]="targetRole"
            type="text"
            placeholder="e.g. Senior Frontend Developer"
            class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500" />
        </div>
        <button
          (click)="analyze()"
          [disabled]="loading || !jobDescription.trim()"
          class="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
          <div *ngIf="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          {{ loading ? 'Analyzing...' : 'Analyze Job' }}
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
        {{ error }}
      </div>

      <!-- Results -->
      <div *ngIf="result && !limitReached" class="space-y-6">
        <!-- Seniority badge -->
        <div class="flex items-center gap-3">
          <span class="rounded-full bg-violet-500/20 border border-violet-400/40 px-4 py-1.5 text-sm font-semibold text-violet-300">
            {{ result.seniority }}
          </span>
          <span *ngIf="result.salaryEstimate" class="text-sm text-slate-400">
            Est. salary: {{ result.salaryEstimate }}
          </span>
        </div>

        <!-- Real Requirements -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Real Requirements</h3>
          <ul class="space-y-2">
            <li *ngFor="let req of result.realRequirements" class="flex items-start gap-2 text-sm text-slate-300">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Hidden Requirements -->
        <div *ngIf="result.hiddenRequirements?.length" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Hidden Requirements</h3>
          <ul class="space-y-2">
            <li *ngFor="let req of result.hiddenRequirements" class="flex items-start gap-2 text-sm text-amber-300/80">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              {{ req }}
            </li>
          </ul>
        </div>

        <!-- Red / Green Flags -->
        <div class="grid gap-4 md:grid-cols-2">
          <div *ngIf="result.redFlags?.length" class="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5">
            <h3 class="text-sm font-semibold text-rose-300 mb-3">Red Flags</h3>
            <ul class="space-y-2">
              <li *ngFor="let flag of result.redFlags" class="flex items-start gap-2 text-sm text-rose-200/80">
                <span class="mt-0.5 text-rose-400">&#x2717;</span>
                {{ flag }}
              </li>
            </ul>
          </div>
          <div *ngIf="result.greenFlags?.length" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h3 class="text-sm font-semibold text-emerald-300 mb-3">Green Flags</h3>
            <ul class="space-y-2">
              <li *ngFor="let flag of result.greenFlags" class="flex items-start gap-2 text-sm text-emerald-200/80">
                <span class="mt-0.5 text-emerald-400">&#x2713;</span>
                {{ flag }}
              </li>
            </ul>
          </div>
        </div>

        <!-- ATS Keywords -->
        <div *ngIf="result.atsKeywords?.length" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">ATS Keywords</h3>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let kw of result.atsKeywords"
                  class="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300">
              {{ kw }}
            </span>
          </div>
        </div>

        <!-- Culture Signals -->
        <div *ngIf="result.cultureSignals" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Culture Signals</h3>
          <p class="text-sm text-slate-300 leading-relaxed">{{ result.cultureSignals }}</p>
        </div>

        <!-- Fit Tips -->
        <div *ngIf="result.fitTips?.length" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 class="text-sm font-semibold text-emerald-300 mb-3">Fit Tips</h3>
          <ul class="space-y-2">
            <li *ngFor="let tip of result.fitTips" class="flex items-start gap-2 text-sm text-emerald-200/80">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class JobXrayComponent {
  jobDescription = '';
  targetRole = '';
  loading = false;
  error: string | null = null;
  result: JobXrayResponse | null = null;
  limitReached = false;

  constructor(
    private arena: ArenaService,
    public auth: AuthService
  ) {}

  analyze(): void {
    if (!this.jobDescription.trim() || this.loading) return;

    this.loading = true;
    this.error = null;

    this.arena.analyzeJob(this.jobDescription, this.targetRole || undefined).subscribe({
      next: (res) => {
        this.result = res;
        this.limitReached = false;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 429) {
          this.limitReached = true;
          this.error = null;
        } else {
          this.error = err.error?.message || 'Analysis failed. Please try again.';
        }
      }
    });
  }
}
