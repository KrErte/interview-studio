import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService, CvOptimizerResponse } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-cv-optimizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-2">CV/LinkedIn Optimizer</h1>
      <p class="text-slate-400 mb-8">Upload your CV and get AI-powered ATS optimization and improvement suggestions.</p>

      <!-- Upload Form -->
      @if (!result()) {
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Backend Engineer"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Upload CV (PDF)</label>
            <div
              class="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors cursor-pointer"
              (click)="fileInput.click()"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop($event)">
              <input #fileInput type="file" accept=".pdf,.txt,.doc,.docx" class="hidden" (change)="onFileSelected($event)"/>
              @if (selectedFile()) {
                <div class="text-emerald-400 font-semibold">{{ selectedFile()!.name }}</div>
                <div class="text-sm text-slate-500 mt-1">{{ (selectedFile()!.size / 1024).toFixed(1) }} KB</div>
              } @else {
                <div class="text-slate-400">Drop your CV here or click to browse</div>
                <div class="text-sm text-slate-600 mt-1">PDF, TXT, DOC supported</div>
              }
            </div>
          </div>

          <button (click)="analyze()" [disabled]="loading() || !selectedFile()"
            class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg hover:shadow-emerald-500/40 transition-all disabled:opacity-50">
            @if (loading()) { Analyzing... } @else { Analyze CV }
          </button>
        </div>
      }

      <!-- Results -->
      @if (result()) {
        <div class="space-y-6">
          <!-- ATS Score Gauge -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
            <div class="text-sm text-slate-400 mb-2">ATS Compatibility Score</div>
            <div class="text-6xl font-bold mb-2"
              [class]="result()!.atsScore >= 80 ? 'text-emerald-400' : result()!.atsScore >= 60 ? 'text-yellow-400' : 'text-red-400'">
              {{ result()!.atsScore }}
            </div>
            <div class="w-full max-w-xs mx-auto h-3 bg-slate-800 rounded-full overflow-hidden mt-3">
              <div class="h-full rounded-full transition-all"
                [class]="result()!.atsScore >= 80 ? 'bg-emerald-500' : result()!.atsScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'"
                [style.width.%]="result()!.atsScore"></div>
            </div>
          </div>

          <!-- Overall Summary -->
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">Overall Assessment</h3>
            <p class="text-sm text-slate-300">{{ result()!.overallSummary }}</p>
          </div>

          <!-- Missing Keywords -->
          @if (result()!.missingKeywords?.length) {
            <div class="rounded-xl border border-red-900/50 bg-red-950/20 p-5">
              <h3 class="font-semibold text-red-400 mb-3">Missing ATS Keywords</h3>
              <div class="flex flex-wrap gap-2">
                @for (kw of result()!.missingKeywords; track kw) {
                  <span class="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{{ kw }}</span>
                }
              </div>
            </div>
          }

          <!-- Section Feedback -->
          @if (result()!.sectionFeedback?.length) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 class="font-semibold text-white mb-3">Section-by-Section Review</h3>
              <div class="space-y-3">
                @for (sf of result()!.sectionFeedback; track sf.section) {
                  <div class="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50">
                    <span class="px-2 py-0.5 rounded text-xs font-bold"
                      [class]="sf.status === 'GOOD' ? 'bg-emerald-500/20 text-emerald-300' : sf.status === 'MISSING' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'">
                      {{ sf.status }}
                    </span>
                    <div>
                      <div class="text-sm font-semibold text-white">{{ sf.section }}</div>
                      <div class="text-sm text-slate-400 mt-1">{{ sf.suggestion }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Impact Improvements -->
          @if (result()!.impactImprovements?.length) {
            <div class="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
              <h3 class="font-semibold text-emerald-400 mb-3">Impact Improvements</h3>
              <ul class="space-y-2">
                @for (imp of result()!.impactImprovements; track imp) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-emerald-400 mt-0.5">&#x2191;</span> {{ imp }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- LinkedIn Tips -->
          @if (result()!.linkedInTips?.length) {
            <div class="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-5">
              <h3 class="font-semibold text-cyan-400 mb-3">LinkedIn Profile Tips</h3>
              <ul class="space-y-2">
                @for (tip of result()!.linkedInTips; track tip) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-cyan-400 mt-0.5">&#x2022;</span> {{ tip }}
                  </li>
                }
              </ul>
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">
            Analyze Another CV
          </button>
        </div>
      }
    </div>
  `
})
export class CvOptimizerComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';

  readonly loading = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly result = signal<CvOptimizerResponse | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.length) {
      this.selectedFile.set(event.dataTransfer.files[0]);
    }
  }

  analyze() {
    const file = this.selectedFile();
    if (!file) return;

    this.loading.set(true);
    this.arenaApi.analyzeCv(file, this.targetRole || undefined).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to analyze CV. Please try again.');
      }
    });
  }

  reset() {
    this.result.set(null);
    this.selectedFile.set(null);
    this.targetRole = '';
  }
}
