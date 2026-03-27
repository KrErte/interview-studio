import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ArenaApiService, InterviewRoadmapResponse } from '../../core/services/arena-api.service';

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

              <div class="border-t border-stone-100 pt-3">
                <p class="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Milestone</p>
                <p class="text-sm text-stone-700">{{ week.milestone }}</p>
              </div>
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

  goBack() {
    this.router.navigate(['/arena/interview-simulator']);
  }
}
