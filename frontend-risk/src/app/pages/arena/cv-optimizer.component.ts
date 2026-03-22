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
      <h1 class="text-3xl font-bold text-stone-900 mb-2">CV/LinkedIn Optimizer</h1>
      <p class="text-stone-500 mb-8">Upload your CV and get AI-powered ATS optimization and improvement suggestions.</p>

      <!-- Upload Form -->
      @if (!result()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Backend Engineer"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>

          <div>
            <label class="block text-sm font-medium text-stone-700 mb-2">Upload CV (PDF)</label>
            <div
              class="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-stone-900 transition-colors cursor-pointer"
              (click)="fileInput.click()"
              (dragover)="$event.preventDefault()"
              (drop)="onDrop($event)">
              <input #fileInput type="file" accept=".pdf,.txt,.doc,.docx" class="hidden" (change)="onFileSelected($event)"/>
              @if (selectedFile()) {
                <div class="text-green-700 font-semibold">{{ selectedFile()!.name }}</div>
                <div class="text-sm text-stone-500 mt-1">{{ (selectedFile()!.size / 1024).toFixed(1) }} KB</div>
              } @else {
                <div class="text-stone-500">Drop your CV here or click to browse</div>
                <div class="text-sm text-stone-500 mt-1">PDF, TXT, DOC supported</div>
              }
            </div>
          </div>

          <button (click)="analyze()" [disabled]="loading() || !selectedFile()"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white transition-all disabled:opacity-50">
            @if (loading()) { Analyzing... } @else { Analyze CV }
          </button>
        </div>
      }

      <!-- Results -->
      @if (result()) {
        <div class="space-y-6">
          <!-- ATS Score Gauge -->
          <div class="rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <div class="text-sm text-stone-500 mb-2">ATS Compatibility Score</div>
            <div class="text-6xl font-bold mb-2"
              [class]="result()!.atsScore >= 80 ? 'text-green-700' : result()!.atsScore >= 60 ? 'text-amber-600' : 'text-red-700'">
              {{ result()!.atsScore }}
            </div>
            <div class="w-full max-w-xs mx-auto h-3 bg-stone-100 rounded-full overflow-hidden mt-3">
              <div class="h-full rounded-full transition-all"
                [class]="result()!.atsScore >= 80 ? 'bg-green-600' : result()!.atsScore >= 60 ? 'bg-amber-500' : 'bg-red-600'"
                [style.width.%]="result()!.atsScore"></div>
            </div>
          </div>

          <!-- Overall Summary -->
          <div class="rounded-xl border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">Overall Assessment</h3>
            <p class="text-sm text-stone-700">{{ result()!.overallSummary }}</p>
          </div>

          <!-- Missing Keywords -->
          @if (result()!.missingKeywords?.length) {
            <div class="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 class="font-semibold text-red-700 mb-3">Missing ATS Keywords</h3>
              <div class="flex flex-wrap gap-2">
                @for (kw of result()!.missingKeywords; track kw) {
                  <span class="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-sm">{{ kw }}</span>
                }
              </div>
            </div>
          }

          <!-- Section Feedback -->
          @if (result()!.sectionFeedback?.length) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Section-by-Section Review</h3>
              <div class="space-y-3">
                @for (sf of result()!.sectionFeedback; track sf.section) {
                  <div class="flex items-start gap-3 p-3 rounded-lg bg-stone-50">
                    <span class="px-2 py-0.5 rounded text-xs font-bold"
                      [class]="sf.status === 'GOOD' ? 'bg-green-100 text-green-800' : sf.status === 'MISSING' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'">
                      {{ sf.status }}
                    </span>
                    <div>
                      <div class="text-sm font-semibold text-stone-900">{{ sf.section }}</div>
                      <div class="text-sm text-stone-500 mt-1">{{ sf.suggestion }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Impact Improvements -->
          @if (result()!.impactImprovements?.length) {
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-700 mb-3">Impact Improvements</h3>
              <ul class="space-y-2">
                @for (imp of result()!.impactImprovements; track imp) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-700 mt-0.5">&#x2191;</span> {{ imp }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- LinkedIn Tips -->
          @if (result()!.linkedInTips?.length) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-3">LinkedIn Profile Tips</h3>
              <ul class="space-y-2">
                @for (tip of result()!.linkedInTips; track tip) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-stone-900 mt-0.5">&#x2022;</span> {{ tip }}
                  </li>
                }
              </ul>
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
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
