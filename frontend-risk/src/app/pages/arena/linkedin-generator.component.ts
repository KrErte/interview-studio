import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-linkedin-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-2">LinkedIn Summary Generator</h1>
      <p class="text-slate-400 mb-8">Generate a professional LinkedIn profile. Headline, about section, and experience bullets.</p>

      <!-- Setup Form -->
      @if (!hasResult()) {
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Full-Stack Developer"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Experience Summary</label>
            <textarea [(ngModel)]="experience" rows="3" placeholder="Brief summary of your experience, achievements, and career highlights..."
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Key Skills</label>
            <input [(ngModel)]="skills" type="text" placeholder="e.g. React, Node.js, TypeScript, AWS, Team Leadership"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Tone</label>
            <select [(ngModel)]="tone"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="thought-leader">Thought Leader</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <button (click)="generate()" [disabled]="loading() || !targetRole"
            class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-blue-500/40 transition-all disabled:opacity-50">
            @if (loading()) { Generating... } @else { Generate LinkedIn Profile }
          </button>
        </div>
      }

      <!-- Results -->
      @if (hasResult()) {
        <div class="space-y-6">
          <!-- Headline -->
          @if (headline()) {
            <div class="rounded-xl border border-blue-900/50 bg-blue-950/20 p-5">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-blue-400">LinkedIn Headline</h3>
                <button (click)="copyToClipboard(headline())" class="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                  {{ copiedField() === 'headline' ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <p class="text-white font-medium">{{ headline() }}</p>
            </div>
          }

          <!-- About Section -->
          @if (aboutSection()) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-semibold text-white">About Section</h3>
                <button (click)="copyToClipboard(aboutSection(), 'about')" class="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                  {{ copiedField() === 'about' ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <p class="text-sm text-slate-300 whitespace-pre-wrap">{{ aboutSection() }}</p>
            </div>
          }

          <!-- Experience Bullets -->
          @if (experienceBullets().length) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-white">Experience Bullets</h3>
                <button (click)="copyToClipboard(experienceBullets().join('\\n'), 'bullets')" class="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                  {{ copiedField() === 'bullets' ? 'Copied!' : 'Copy All' }}
                </button>
              </div>
              <ul class="space-y-2">
                @for (bullet of experienceBullets(); track bullet) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-emerald-400 mt-0.5">&#x2022;</span> {{ bullet }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Skills to Highlight -->
          @if (skillsToHighlight().length) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 class="font-semibold text-white mb-3">Skills to Highlight</h3>
              <div class="flex flex-wrap gap-2">
                @for (skill of skillsToHighlight(); track skill) {
                  <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">{{ skill }}</span>
                }
              </div>
            </div>
          }

          <!-- Summary -->
          @if (summary()) {
            <div class="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
              <h3 class="font-semibold text-emerald-400 mb-2">Strategy Notes</h3>
              <p class="text-sm text-slate-300">{{ summary() }}</p>
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">
            Generate Another Profile
          </button>
        </div>
      }
    </div>
  `
})
export class LinkedinGeneratorComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';
  experience = '';
  skills = '';
  tone = 'professional';

  readonly loading = signal(false);
  readonly hasResult = signal(false);
  readonly headline = signal('');
  readonly aboutSection = signal('');
  readonly experienceBullets = signal<string[]>([]);
  readonly skillsToHighlight = signal<string[]>([]);
  readonly summary = signal('');
  readonly copiedField = signal('');

  generate() {
    this.loading.set(true);
    this.arenaApi.generateLinkedin({
      targetRole: this.targetRole,
      experience: this.experience || undefined,
      skills: this.skills || undefined,
      tone: this.tone
    }).subscribe({
      next: (res) => {
        this.hasResult.set(true);
        this.headline.set(res.headline || '');
        this.aboutSection.set(res.aboutSection || '');
        this.experienceBullets.set(res.experienceBullets || []);
        this.skillsToHighlight.set(res.skillsToHighlight || []);
        this.summary.set(res.summary || '');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to generate LinkedIn profile. Please try again.');
      }
    });
  }

  copyToClipboard(text: string, field: string = 'headline') {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField.set(field);
      setTimeout(() => this.copiedField.set(''), 2000);
    });
  }

  reset() {
    this.hasResult.set(false);
    this.headline.set('');
    this.aboutSection.set('');
    this.experienceBullets.set([]);
    this.skillsToHighlight.set([]);
    this.summary.set('');
  }
}
