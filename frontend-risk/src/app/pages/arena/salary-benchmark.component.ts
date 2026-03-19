import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-salary-benchmark',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-2">Salary Benchmark Dashboard</h1>
      <p class="text-slate-400 mb-8">See how your salary compares. Market data for any role and location.</p>

      <!-- Setup Form -->
      @if (!hasResult()) {
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Data Scientist"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Location</label>
            <input [(ngModel)]="location" type="text" placeholder="e.g. Berlin, Germany"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1">Experience Level</label>
            <select [(ngModel)]="experienceLevel"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500">
              <option value="junior">Junior (0-2 years)</option>
              <option value="mid-level">Mid-Level (3-5 years)</option>
              <option value="senior">Senior (6-10 years)</option>
              <option value="lead">Lead / Staff (10+ years)</option>
            </select>
          </div>
          <button (click)="analyze()" [disabled]="loading() || !targetRole || !location"
            class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg hover:shadow-emerald-500/40 transition-all disabled:opacity-50">
            @if (loading()) { Analyzing salaries... } @else { Get Salary Benchmark }
          </button>
        </div>
      }

      <!-- Results -->
      @if (hasResult()) {
        <div class="space-y-6">
          <!-- Salary Range Card -->
          <div class="rounded-2xl border border-emerald-900/50 bg-gradient-to-b from-emerald-950/30 to-slate-900 p-6">
            <div class="text-center mb-6">
              <h3 class="text-lg font-bold text-white mb-1">{{ resultRole() }}</h3>
              <p class="text-sm text-slate-400">{{ resultLocation() }}</p>
            </div>

            <!-- Salary Range Bar -->
            <div class="mb-6">
              <div class="flex justify-between text-xs text-slate-500 mb-2">
                <span>{{ resultCurrency() }}{{ minSalary() | number }}</span>
                <span>{{ resultCurrency() }}{{ maxSalary() | number }}</span>
              </div>
              <div class="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                <!-- P25-P75 range -->
                <div class="absolute h-full bg-emerald-500/40 rounded-full"
                  [style.left.%]="getBarPosition(p25())"
                  [style.width.%]="getBarPosition(p75()) - getBarPosition(p25())">
                </div>
                <!-- Median marker -->
                <div class="absolute top-0 h-full w-1 bg-emerald-400 rounded"
                  [style.left.%]="getBarPosition(medianSalary())">
                </div>
              </div>
              <div class="flex justify-between mt-3">
                <div class="text-center">
                  <div class="text-xs text-slate-500">P25</div>
                  <div class="text-sm font-bold text-slate-300">{{ resultCurrency() }}{{ p25() | number }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-emerald-400 font-bold">Median</div>
                  <div class="text-lg font-bold text-emerald-400">{{ resultCurrency() }}{{ medianSalary() | number }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-slate-500">P75</div>
                  <div class="text-sm font-bold text-slate-300">{{ resultCurrency() }}{{ p75() | number }}</div>
                </div>
              </div>
            </div>

            <!-- Min / Median / Max -->
            <div class="grid grid-cols-3 gap-4 text-center">
              <div class="rounded-xl bg-slate-800/50 p-3">
                <div class="text-xs text-slate-500 mb-1">Minimum</div>
                <div class="text-lg font-bold text-slate-300">{{ resultCurrency() }}{{ minSalary() | number }}</div>
              </div>
              <div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                <div class="text-xs text-emerald-400 mb-1">Median</div>
                <div class="text-lg font-bold text-emerald-400">{{ resultCurrency() }}{{ medianSalary() | number }}</div>
              </div>
              <div class="rounded-xl bg-slate-800/50 p-3">
                <div class="text-xs text-slate-500 mb-1">Maximum</div>
                <div class="text-lg font-bold text-slate-300">{{ resultCurrency() }}{{ maxSalary() | number }}</div>
              </div>
            </div>
          </div>

          <!-- Location Comparisons -->
          @if (locationComparisons().length) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 class="font-semibold text-white mb-4">Location Comparison</h3>
              <div class="space-y-3">
                @for (loc of locationComparisons(); track loc.location) {
                  <div class="flex items-center gap-4">
                    <div class="w-32 text-sm text-slate-300 truncate">{{ loc.location }}</div>
                    <div class="flex-1">
                      <div class="h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-cyan-500/60 rounded-full transition-all"
                          [style.width.%]="getComparisonWidth(loc.medianSalary)">
                        </div>
                      </div>
                    </div>
                    <div class="w-24 text-right text-sm font-medium text-slate-300">{{ resultCurrency() }}{{ loc.medianSalary | number }}</div>
                    <div class="w-16 text-right">
                      <span class="px-2 py-0.5 rounded text-xs" [class]="getCostClass(loc.costOfLivingIndex)">{{ loc.costOfLivingIndex }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Market Insights -->
          @if (marketInsights()) {
            <div class="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-5">
              <h3 class="font-semibold text-cyan-400 mb-2">Market Insights</h3>
              <p class="text-sm text-slate-300">{{ marketInsights() }}</p>
            </div>
          }

          <!-- Negotiation Tips -->
          @if (negotiationTips().length) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 class="font-semibold text-white mb-3">Negotiation Tips</h3>
              <ul class="space-y-2">
                @for (tip of negotiationTips(); track tip) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-emerald-400 mt-0.5">&#x2192;</span> {{ tip }}
                  </li>
                }
              </ul>
            </div>
          }

          <button (click)="reset()"
            class="w-full py-3 rounded-xl font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all">
            Benchmark Another Role
          </button>
        </div>
      }
    </div>
  `
})
export class SalaryBenchmarkComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';
  location = '';
  experienceLevel = 'mid-level';

  readonly loading = signal(false);
  readonly hasResult = signal(false);
  readonly resultRole = signal('');
  readonly resultLocation = signal('');
  readonly resultCurrency = signal('EUR ');
  readonly minSalary = signal(0);
  readonly medianSalary = signal(0);
  readonly maxSalary = signal(0);
  readonly p25 = signal(0);
  readonly p75 = signal(0);
  readonly locationComparisons = signal<{location: string; medianSalary: number; costOfLivingIndex: string}[]>([]);
  readonly marketInsights = signal('');
  readonly negotiationTips = signal<string[]>([]);

  analyze() {
    this.loading.set(true);
    this.arenaApi.analyzeSalaryBenchmark({
      targetRole: this.targetRole,
      location: this.location,
      experienceLevel: this.experienceLevel
    }).subscribe({
      next: (res) => {
        this.hasResult.set(true);
        this.resultRole.set(res.role || this.targetRole);
        this.resultLocation.set(res.location || this.location);
        this.resultCurrency.set((res.currency || 'EUR') + ' ');
        this.minSalary.set(res.minSalary || 0);
        this.medianSalary.set(res.medianSalary || 0);
        this.maxSalary.set(res.maxSalary || 0);
        this.p25.set(res.p25 || 0);
        this.p75.set(res.p75 || 0);
        this.locationComparisons.set(res.locationComparisons || []);
        this.marketInsights.set(res.marketInsights || '');
        this.negotiationTips.set(res.negotiationTips || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to get salary benchmark. Please try again.');
      }
    });
  }

  getBarPosition(value: number): number {
    const min = this.minSalary();
    const max = this.maxSalary();
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  }

  getComparisonWidth(salary: number): number {
    const max = Math.max(...this.locationComparisons().map(l => l.medianSalary), this.maxSalary());
    return max > 0 ? (salary / max) * 100 : 0;
  }

  getCostClass(cost: string): string {
    if (cost === 'High') return 'bg-red-500/20 text-red-300';
    if (cost === 'Low') return 'bg-emerald-500/20 text-emerald-300';
    return 'bg-yellow-500/20 text-yellow-300';
  }

  reset() {
    this.hasResult.set(false);
    this.resultRole.set('');
    this.resultLocation.set('');
    this.minSalary.set(0);
    this.medianSalary.set(0);
    this.maxSalary.set(0);
    this.p25.set(0);
    this.p75.set(0);
    this.locationComparisons.set([]);
    this.marketInsights.set('');
    this.negotiationTips.set([]);
  }
}
