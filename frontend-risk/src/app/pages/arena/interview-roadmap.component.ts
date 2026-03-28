import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArenaApiService, InterviewRoadmapResponse, LearnResource } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-interview-roadmap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <button (click)="goBack()"
        class="text-sm text-stone-500 hover:text-stone-900 mb-6 inline-flex items-center gap-1 transition-colors">
        &larr; Back to Interview
      </button>

      <h1 class="text-3xl font-bold text-stone-900 mb-2">Your Improvement Roadmap</h1>
      <p class="text-stone-500 mb-8">Personalized 4-week plan based on your interview results.</p>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-16 space-y-4">
          <div class="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin"></div>
          <p class="text-stone-500 text-sm">Generating your roadmap...</p>
        </div>
      }

      @if (error()) {
        <div class="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p class="text-red-700 mb-4">{{ error() }}</p>
          <button (click)="generate()" class="px-6 py-2 rounded-xl bg-stone-900 text-white font-semibold hover:bg-stone-800 transition-all">
            Retry
          </button>
        </div>
      }

      @if (roadmap()) {
        <p class="text-stone-600 mb-6">{{ roadmap()!.summary }}</p>

        <!-- Weaknesses this plan addresses -->
        @if (weaknesses.length) {
          <div class="rounded-xl border border-amber-200 bg-amber-50 p-5 mb-6">
            <h3 class="font-semibold text-amber-800 mb-2">Areas Being Addressed</h3>
            <ul class="space-y-1">
              @for (w of weaknesses; track w) {
                <li class="text-sm text-stone-700 flex items-start gap-2">
                  <span class="text-amber-600 mt-0.5">&bull;</span> {{ w }}
                </li>
              }
            </ul>
          </div>
        }

        <!-- Weeks -->
        <div class="space-y-4">
          @for (week of roadmap()!.weeks; track week.week) {
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-sm">
                  W{{ week.week }}
                </div>
                <div>
                  <h3 class="font-semibold text-stone-900">{{ week.theme }}</h3>
                </div>
              </div>

              <ul class="space-y-2 mb-4">
                @for (task of week.tasks; track task) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-stone-400 mt-0.5">&rarr;</span> {{ task }}
                  </li>
                }
              </ul>

              <div class="border-t border-stone-100 pt-3 flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Milestone</p>
                  <p class="text-sm text-stone-700">{{ week.milestone }}</p>
                </div>
                <div class="shrink-0 flex gap-2">
                  <button (click)="loadLearnResources(week)"
                    [disabled]="learnLoading() === week.week"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-50">
                    @if (learnLoading() === week.week) {
                      <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    } @else {
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    }
                    Learn
                  </button>
                  <button (click)="practiceWeek(week)"
                    class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-all">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    Practice
                  </button>
                </div>
              </div>

              <!-- Learn Resources Panel -->
              @if (learnResources()[week.week]) {
                <div class="mt-4 border-t border-stone-100 pt-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-semibold text-stone-700">Recommended Resources</h4>
                    <button (click)="closeLearnResources(week.week)" class="text-stone-400 hover:text-stone-600 text-xs">Close</button>
                  </div>
                  <div class="grid gap-2">
                    @for (r of learnResources()[week.week]; track r.title) {
                      <a [href]="r.url" target="_blank" rel="noopener"
                        class="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:border-stone-300 hover:bg-stone-50 transition-all group">
                        <div class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          [class]="getResourceTypeClass(r.type)">
                          {{ getResourceTypeIcon(r.type) }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-stone-900 group-hover:text-indigo-700 transition-colors">{{ r.title }}</div>
                          <div class="text-xs text-stone-500 mt-0.5">{{ r.description }}</div>
                          <div class="flex gap-2 mt-1">
                            <span class="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{{ r.type }}</span>
                            <span class="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                              [class]="r.difficulty === 'beginner' ? 'bg-green-50 text-green-600' : r.difficulty === 'advanced' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'">
                              {{ r.difficulty }}
                            </span>
                          </div>
                        </div>
                        <svg class="w-4 h-4 text-stone-300 group-hover:text-stone-500 shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <button (click)="goBack()"
          class="w-full mt-8 py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
          Back to Interview
        </button>
      }
    </div>
  `
})
export class InterviewRoadmapComponent implements OnInit {
  private readonly arenaApi = inject(ArenaApiService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly roadmap = signal<InterviewRoadmapResponse | null>(null);
  readonly learnLoading = signal<number | null>(null);
  readonly learnResources = signal<Record<number, LearnResource[]>>({});

  targetRole = '';
  weaknesses: string[] = [];
  improvementPlan = '';

  ngOnInit() {
    const data = sessionStorage.getItem('interview_roadmap_data');
    if (!data) {
      this.router.navigate(['/arena/interview-simulator']);
      return;
    }
    const parsed = JSON.parse(data);
    this.targetRole = parsed.targetRole || '';
    this.weaknesses = parsed.weaknesses || [];
    this.improvementPlan = parsed.improvementPlan || '';
    this.generate();
  }

  generate() {
    this.loading.set(true);
    this.error.set(null);
    this.arenaApi.generateInterviewRoadmap({
      targetRole: this.targetRole,
      weaknesses: this.weaknesses,
      improvementPlan: this.improvementPlan
    }).subscribe({
      next: (res) => {
        this.roadmap.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to generate roadmap. Please try again.');
        this.loading.set(false);
      }
    });
  }

  loadLearnResources(week: {week: number; theme: string; tasks: string[]}) {
    // Toggle off if already loaded
    if (this.learnResources()[week.week]) {
      this.closeLearnResources(week.week);
      return;
    }
    this.learnLoading.set(week.week);
    this.arenaApi.generateLearnResources({
      targetRole: this.targetRole,
      theme: week.theme,
      tasks: week.tasks
    }).subscribe({
      next: (res) => {
        this.learnResources.update(cur => ({ ...cur, [week.week]: res.resources }));
        this.learnLoading.set(null);
      },
      error: () => {
        this.learnLoading.set(null);
      }
    });
  }

  closeLearnResources(weekNum: number) {
    this.learnResources.update(cur => {
      const copy = { ...cur };
      delete copy[weekNum];
      return copy;
    });
  }

  getResourceTypeClass(type: string): string {
    switch (type) {
      case 'video': return 'bg-red-50 text-red-600';
      case 'course': return 'bg-blue-50 text-blue-600';
      case 'docs': return 'bg-green-50 text-green-600';
      case 'book': return 'bg-purple-50 text-purple-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  }

  getResourceTypeIcon(type: string): string {
    switch (type) {
      case 'video': return '▶';
      case 'course': return '🎓';
      case 'docs': return '📄';
      case 'book': return '📖';
      default: return '📝';
    }
  }

  practiceWeek(week: {week: number; theme: string; tasks: string[]; milestone: string}) {
    sessionStorage.setItem('interview_practice_focus', JSON.stringify({
      targetRole: this.targetRole,
      focusTopic: week.theme + ': ' + week.tasks.join('; '),
      interviewType: 'mixed'
    }));
    this.router.navigate(['/arena/interview-simulator']);
  }

  goBack() {
    this.router.navigate(['/arena/interview-simulator']);
  }
}
