import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percent' | 'currency';
}

interface SkillTrend {
  skill: string;
  demandChange: number;
  companyGap: number;
  marketAvg: number;
  recommendation: string;
}

@Component({
  selector: 'app-analytics-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Analytics & Reports</h1>
          <p class="text-slate-400 mt-1">Workforce intelligence insights and exportable reports</p>
        </div>
        <div class="flex gap-3">
          <select class="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
            <option>All time</option>
          </select>
          <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </button>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-4 gap-4">
        @for (metric of keyMetrics(); track metric.label) {
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div class="text-sm text-slate-400 mb-2">{{ metric.label }}</div>
            <div class="flex items-end justify-between">
              <span class="text-3xl font-bold text-white">
                @if (metric.format === 'percent') {
                  {{ metric.value }}%
                } @else if (metric.format === 'currency') {
                  \${{ metric.value.toLocaleString() }}
                } @else {
                  {{ metric.value }}
                }
              </span>
              <span class="text-sm flex items-center gap-1"
                [class]="metric.trend === 'up' && metric.label.includes('Risk') ? 'text-red-400' :
                         metric.trend === 'up' ? 'text-emerald-400' :
                         metric.trend === 'down' && metric.label.includes('Risk') ? 'text-emerald-400' :
                         metric.trend === 'down' ? 'text-red-400' : 'text-slate-400'">
                @if (metric.trend === 'up') {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                } @else if (metric.trend === 'down') {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                }
                {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Risk Distribution Chart -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
          <div class="space-y-4">
            @for (risk of riskDistribution(); track risk.label) {
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-400">{{ risk.label }}</span>
                  <span class="text-white">{{ risk.count }} employees ({{ risk.percent }}%)</span>
                </div>
                <div class="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    [class]="risk.color"
                    [style.width.%]="risk.percent">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Department Comparison -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Department Comparison</h3>
          <div class="space-y-3">
            @for (dept of departmentComparison(); track dept.name) {
              <div class="flex items-center gap-4">
                <div class="w-24 text-sm text-slate-400">{{ dept.name }}</div>
                <div class="flex-1 flex items-center gap-2">
                  <div class="flex-1 h-6 bg-slate-700 rounded relative overflow-hidden">
                    <div class="absolute inset-y-0 left-0 bg-emerald-500/30 rounded" [style.width.%]="dept.coverage"></div>
                    <div class="absolute inset-y-0 left-0 bg-emerald-500 rounded" [style.width.%]="dept.completion"></div>
                  </div>
                  <span class="text-sm text-slate-300 w-12 text-right">{{ dept.completion }}%</span>
                </div>
              </div>
            }
          </div>
          <div class="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-emerald-500 rounded"></div>
              Completed
            </span>
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-emerald-500/30 rounded"></div>
              Invited
            </span>
          </div>
        </div>
      </div>

      <!-- Market Skill Trends -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Market Skill Trends vs Your Workforce</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-slate-400 border-b border-slate-700">
                <th class="pb-3 font-medium">Skill</th>
                <th class="pb-3 font-medium">Market Demand Change</th>
                <th class="pb-3 font-medium">Your Coverage</th>
                <th class="pb-3 font-medium">Industry Average</th>
                <th class="pb-3 font-medium">Gap</th>
                <th class="pb-3 font-medium">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              @for (skill of skillTrends(); track skill.skill) {
                <tr class="border-b border-slate-800">
                  <td class="py-4 font-medium text-white">{{ skill.skill }}</td>
                  <td class="py-4">
                    <span class="flex items-center gap-1"
                      [class]="skill.demandChange > 0 ? 'text-emerald-400' : 'text-red-400'">
                      @if (skill.demandChange > 0) {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      } @else {
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      }
                      {{ skill.demandChange > 0 ? '+' : '' }}{{ skill.demandChange }}%
                    </span>
                  </td>
                  <td class="py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 rounded-full" [style.width.%]="100 - skill.companyGap"></div>
                      </div>
                      <span class="text-slate-300 text-sm">{{ 100 - skill.companyGap }}%</span>
                    </div>
                  </td>
                  <td class="py-4 text-slate-400">{{ skill.marketAvg }}%</td>
                  <td class="py-4">
                    <span class="font-mono"
                      [class]="skill.companyGap > 30 ? 'text-red-400' : skill.companyGap > 15 ? 'text-amber-400' : 'text-emerald-400'">
                      {{ skill.companyGap > 0 ? '-' : '+' }}{{ Math.abs(skill.companyGap) }}%
                    </span>
                  </td>
                  <td class="py-4 text-sm text-slate-400">{{ skill.recommendation }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ROI Calculator -->
      <div class="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-500/30 rounded-xl p-8">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-xl font-bold text-white mb-2">Upskilling ROI Calculator</h3>
            <p class="text-slate-400 max-w-xl">
              Based on your workforce data, here's the projected return on investment for addressing critical skill gaps.
            </p>
          </div>
          <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
            Customize Assumptions
          </button>
        </div>

        <div class="grid grid-cols-4 gap-6 mt-8">
          <div class="text-center">
            <div class="text-4xl font-bold text-white">\${{ (estimatedInvestment() / 1000).toFixed(0) }}K</div>
            <div class="text-sm text-slate-400 mt-1">Estimated Investment</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-emerald-400">\${{ (projectedSavings() / 1000).toFixed(0) }}K</div>
            <div class="text-sm text-slate-400 mt-1">Projected Annual Savings</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-purple-400">{{ roiMultiple() }}x</div>
            <div class="text-sm text-slate-400 mt-1">3-Year ROI</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-bold text-amber-400">{{ paybackMonths() }}</div>
            <div class="text-sm text-slate-400 mt-1">Months to Payback</div>
          </div>
        </div>
      </div>

      <!-- Exportable Reports -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-white mb-4">Exportable Reports</h3>
        <div class="grid grid-cols-3 gap-4">
          @for (report of availableReports(); track report.name) {
            <div class="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                  [class]="report.iconBg">
                  <span class="text-lg">{{ report.icon }}</span>
                </div>
                <div>
                  <div class="font-medium text-white">{{ report.name }}</div>
                  <div class="text-xs text-slate-500">{{ report.format }}</div>
                </div>
              </div>
              <button class="p-2 text-slate-400 hover:text-emerald-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AnalyticsReportsComponent {
  Math = Math;

  keyMetrics = signal<ReportMetric[]>([
    { label: 'Average Risk Score', value: 52, change: -8, trend: 'down', format: 'number' },
    { label: 'Assessment Completion', value: 78, change: 12, trend: 'up', format: 'percent' },
    { label: 'Skill Gap Coverage', value: 64, change: 18, trend: 'up', format: 'percent' },
    { label: 'Est. Annual Savings', value: 340000, change: 25, trend: 'up', format: 'currency' }
  ]);

  riskDistribution = signal([
    { label: 'Low Risk (0-30)', count: 28, percent: 35, color: 'bg-emerald-500' },
    { label: 'Medium Risk (31-60)', count: 32, percent: 40, color: 'bg-amber-500' },
    { label: 'High Risk (61-80)', count: 15, percent: 19, color: 'bg-orange-500' },
    { label: 'Critical Risk (81+)', count: 5, percent: 6, color: 'bg-red-500' }
  ]);

  departmentComparison = signal([
    { name: 'Engineering', completion: 85, coverage: 95 },
    { name: 'Marketing', completion: 65, coverage: 80 },
    { name: 'Sales', completion: 72, coverage: 85 },
    { name: 'Finance', completion: 58, coverage: 70 },
    { name: 'Product', completion: 90, coverage: 95 },
    { name: 'Design', completion: 78, coverage: 88 }
  ]);

  skillTrends = signal<SkillTrend[]>([
    { skill: 'AI/Machine Learning', demandChange: 45, companyGap: 65, marketAvg: 42, recommendation: 'Priority training needed' },
    { skill: 'Cloud Architecture', demandChange: 32, companyGap: 48, marketAvg: 55, recommendation: 'Schedule certifications' },
    { skill: 'Data Analytics', demandChange: 28, companyGap: 35, marketAvg: 60, recommendation: 'On track, continue' },
    { skill: 'Cybersecurity', demandChange: 38, companyGap: 52, marketAvg: 45, recommendation: 'Hire or train urgently' },
    { skill: 'DevOps/SRE', demandChange: 22, companyGap: 28, marketAvg: 52, recommendation: 'Minor upskilling' },
    { skill: 'Product Management', demandChange: 15, companyGap: 12, marketAvg: 48, recommendation: 'Above average' }
  ]);

  estimatedInvestment = signal(145000);
  projectedSavings = signal(340000);
  roiMultiple = signal(4.2);
  paybackMonths = signal(8);

  availableReports = signal([
    { name: 'Executive Summary', format: 'PDF', icon: '📊', iconBg: 'bg-purple-500/20' },
    { name: 'Department Breakdown', format: 'PDF / Excel', icon: '🏢', iconBg: 'bg-emerald-500/20' },
    { name: 'Individual Assessments', format: 'CSV', icon: '👤', iconBg: 'bg-blue-500/20' },
    { name: 'Skill Gap Analysis', format: 'PDF', icon: '🎯', iconBg: 'bg-amber-500/20' },
    { name: 'ROI Projection', format: 'PDF / Excel', icon: '💰', iconBg: 'bg-green-500/20' },
    { name: 'Training Recommendations', format: 'PDF', icon: '📚', iconBg: 'bg-pink-500/20' }
  ]);
}
