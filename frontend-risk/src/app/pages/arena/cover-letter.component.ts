import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-cover-letter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">Cover Letter Generator</h1>
      <p class="text-stone-500 mb-8">Generate a tailored cover letter for any job. Just paste the description and go.</p>

      <!-- Setup Form -->
      @if (!hasResult()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Job Description</label>
            <textarea [(ngModel)]="jobDescription" rows="6" placeholder="Paste the full job description here..."
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Your Key Experience</label>
            <textarea [(ngModel)]="keyExperience" rows="3" placeholder="Briefly describe your most relevant experience for this role..."
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Tone</label>
            <select [(ngModel)]="tone"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="confident">Confident</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>
          <button (click)="generate()" [disabled]="loading() || !jobDescription"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white transition-all disabled:opacity-50">
            @if (loading()) { Writing cover letter... } @else { Generate Cover Letter }
          </button>
        </div>
      }

      <!-- Results -->
      @if (hasResult()) {
        <div class="space-y-6">
          <!-- Cover Letter -->
          @if (coverLetter()) {
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-stone-900">Your Cover Letter</h3>
                <button (click)="copyToClipboard(coverLetter())" class="flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-100 text-xs text-stone-500 hover:text-stone-900 transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ copied() ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <div class="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed bg-stone-50 rounded-xl p-5 border border-stone-300">{{ coverLetter() }}</div>
            </div>
          }

          <!-- Highlights -->
          @if (highlights().length) {
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-700 mb-3">Key Strengths Highlighted</h3>
              <ul class="space-y-2">
                @for (h of highlights(); track h) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-700 mt-0.5">&#x2713;</span> {{ h }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Tone & Summary -->
          @if (toneSummary() || summary()) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              @if (toneSummary()) {
                <div class="mb-3">
                  <span class="text-xs font-bold text-stone-500 uppercase">Tone Used:</span>
                  <span class="ml-2 text-sm text-stone-700">{{ toneSummary() }}</span>
                </div>
              }
              @if (summary()) {
                <p class="text-sm text-stone-500">{{ summary() }}</p>
              }
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
            Generate Another Cover Letter
          </button>
        </div>
      }
    </div>
  `
})
export class CoverLetterComponent {
  private readonly arenaApi = inject(ArenaApiService);

  jobDescription = '';
  keyExperience = '';
  tone = 'professional';

  readonly loading = signal(false);
  readonly hasResult = signal(false);
  readonly coverLetter = signal('');
  readonly highlights = signal<string[]>([]);
  readonly toneSummary = signal('');
  readonly summary = signal('');
  readonly copied = signal(false);

  generate() {
    this.loading.set(true);
    this.arenaApi.generateCoverLetter({
      jobDescription: this.jobDescription,
      keyExperience: this.keyExperience || undefined,
      tone: this.tone
    }).subscribe({
      next: (res) => {
        this.hasResult.set(true);
        this.coverLetter.set(res.coverLetter || '');
        this.highlights.set(res.highlights || []);
        this.toneSummary.set(res.tone || '');
        this.summary.set(res.summary || '');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to generate cover letter. Please try again.');
      }
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  reset() {
    this.hasResult.set(false);
    this.coverLetter.set('');
    this.highlights.set([]);
    this.toneSummary.set('');
    this.summary.set('');
  }
}
