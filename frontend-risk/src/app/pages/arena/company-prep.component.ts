import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-company-prep',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">Company-Specific Interview Prep</h1>
      <p class="text-stone-500 mb-8">Get tailored prep for any company. Culture insights, common questions, and what they value.</p>

      <!-- Setup Form -->
      @if (!hasResult()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Company Name</label>
            <input [(ngModel)]="companyName" type="text" placeholder="e.g. Google, Stripe, Bolt..."
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Senior Backend Engineer"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
            <select [(ngModel)]="experienceLevel"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
              <option value="junior">Junior</option>
              <option value="mid-level">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead / Staff</option>
            </select>
          </div>
          <button (click)="analyze()" [disabled]="loading() || !companyName || !targetRole"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white transition-all disabled:opacity-50">
            @if (loading()) { Researching company... } @else { Get Interview Prep }
          </button>
        </div>
      }

      <!-- Results -->
      @if (hasResult()) {
        <div class="space-y-6">
          <!-- Company Overview -->
          @if (companyOverview()) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-2">Company Overview</h3>
              <p class="text-sm text-stone-700">{{ companyOverview() }}</p>
            </div>
          }

          <!-- Culture Insights -->
          @if (cultureInsights()) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-2">Culture Insights</h3>
              <p class="text-sm text-stone-700">{{ cultureInsights() }}</p>
            </div>
          }

          <!-- What They Value -->
          @if (whatTheyValue().length) {
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-700 mb-3">What They Value</h3>
              <ul class="space-y-2">
                @for (val of whatTheyValue(); track val) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-700 mt-0.5">&#9733;</span> {{ val }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Common Questions -->
          @if (commonQuestions().length) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Likely Interview Questions</h3>
              <ol class="space-y-3">
                @for (q of commonQuestions(); track q; let i = $index) {
                  <li class="text-sm text-stone-700 flex items-start gap-3">
                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500">{{ i + 1 }}</span>
                    {{ q }}
                  </li>
                }
              </ol>
            </div>
          }

          <!-- Prep Tips -->
          @if (prepTips().length) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Preparation Tips</h3>
              <ul class="space-y-2">
                @for (tip of prepTips(); track tip) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-stone-900 mt-0.5">&#x2192;</span> {{ tip }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Red Flags -->
          @if (redFlags().length) {
            <div class="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 class="font-semibold text-red-700 mb-3">Watch Out For</h3>
              <ul class="space-y-2">
                @for (flag of redFlags(); track flag) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-red-700 mt-0.5">&#x26A0;</span> {{ flag }}
                  </li>
                }
              </ul>
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
            Research Another Company
          </button>
        </div>
      }
    </div>
  `
})
export class CompanyPrepComponent {
  private readonly arenaApi = inject(ArenaApiService);

  companyName = '';
  targetRole = '';
  experienceLevel = 'mid-level';

  readonly loading = signal(false);
  readonly hasResult = signal(false);
  readonly companyOverview = signal('');
  readonly cultureInsights = signal('');
  readonly commonQuestions = signal<string[]>([]);
  readonly whatTheyValue = signal<string[]>([]);
  readonly prepTips = signal<string[]>([]);
  readonly redFlags = signal<string[]>([]);

  analyze() {
    this.loading.set(true);
    this.arenaApi.analyzeCompany({
      companyName: this.companyName,
      targetRole: this.targetRole,
      experienceLevel: this.experienceLevel
    }).subscribe({
      next: (res) => {
        this.hasResult.set(true);
        this.companyOverview.set(res.companyOverview || '');
        this.cultureInsights.set(res.cultureInsights || '');
        this.commonQuestions.set(res.commonQuestions || []);
        this.whatTheyValue.set(res.whatTheyValue || []);
        this.prepTips.set(res.prepTips || []);
        this.redFlags.set(res.redFlags || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to analyze company. Please try again.');
      }
    });
  }

  reset() {
    this.hasResult.set(false);
    this.companyOverview.set('');
    this.cultureInsights.set('');
    this.commonQuestions.set([]);
    this.whatTheyValue.set([]);
    this.prepTips.set([]);
    this.redFlags.set([]);
  }
}
