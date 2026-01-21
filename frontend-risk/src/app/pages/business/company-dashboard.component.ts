import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  riskScore: number;
  lastAssessment: string;
  skillGaps: string[];
  status: 'assessed' | 'pending' | 'overdue';
}

interface DepartmentRisk {
  name: string;
  avgRisk: number;
  headcount: number;
  criticalGaps: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface SkillGapSummary {
  skill: string;
  gap: number;
  affected: number;
  marketDemand: 'high' | 'medium' | 'low';
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white">Workforce Intelligence</h1>
          <p class="text-slate-400 mt-1">{{ companyName() }} • {{ teamMembers().length }} employees tracked</p>
        </div>
        <div class="flex gap-3">
          <button (click)="exportReport()" class="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition-colors">
            Export Report
          </button>
          <button (click)="inviteEmployees()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
            + Invite Employees
          </button>
        </div>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="text-sm text-slate-400 mb-1">Workforce Risk Score</div>
          <div class="flex items-end gap-2">
            <span class="text-4xl font-bold" [class]="getRiskColor(overallRisk())">{{ overallRisk() }}</span>
            <span class="text-slate-500 text-sm mb-1">/ 100</span>
          </div>
          <div class="text-xs mt-2" [class]="riskTrend() === 'improving' ? 'text-emerald-400' : 'text-red-400'">
            {{ riskTrend() === 'improving' ? '↓ 5 pts' : '↑ 3 pts' }} vs last month
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="text-sm text-slate-400 mb-1">Critical Skill Gaps</div>
          <div class="text-4xl font-bold text-amber-400">{{ criticalGaps() }}</div>
          <div class="text-xs text-slate-500 mt-2">Across {{ affectedDepartments() }} departments</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="text-sm text-slate-400 mb-1">Assessment Coverage</div>
          <div class="text-4xl font-bold text-emerald-400">{{ assessmentCoverage() }}%</div>
          <div class="text-xs text-slate-500 mt-2">{{ pendingAssessments() }} pending</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="text-sm text-slate-400 mb-1">Projected Upskill ROI</div>
          <div class="text-4xl font-bold text-purple-400">{{ projectedROI() }}x</div>
          <div class="text-xs text-slate-500 mt-2">\${{ estimatedSavings().toLocaleString() }} annual savings</div>
        </div>
      </div>

      <!-- Department Risk Matrix -->
      <div class="grid grid-cols-3 gap-6">
        <div class="col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Department Risk Matrix</h2>
          <div class="space-y-3">
            @for (dept of departmentRisks(); track dept.name) {
              <div class="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg">
                <div class="w-32 font-medium text-slate-200">{{ dept.name }}</div>
                <div class="flex-1">
                  <div class="h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      [class]="dept.avgRisk > 70 ? 'bg-red-500' : dept.avgRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'"
                      [style.width.%]="dept.avgRisk">
                    </div>
                  </div>
                </div>
                <div class="w-16 text-right font-mono" [class]="getRiskColor(dept.avgRisk)">{{ dept.avgRisk }}</div>
                <div class="w-20 text-right text-slate-400 text-sm">{{ dept.headcount }} people</div>
                <div class="w-8">
                  @if (dept.trend === 'improving') {
                    <span class="text-emerald-400">↓</span>
                  } @else if (dept.trend === 'declining') {
                    <span class="text-red-400">↑</span>
                  } @else {
                    <span class="text-slate-500">→</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Critical Skill Gaps -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Critical Skill Gaps</h2>
          <div class="space-y-3">
            @for (gap of skillGaps(); track gap.skill) {
              <div class="p-3 bg-slate-800/50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-medium text-slate-200">{{ gap.skill }}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full"
                    [class]="gap.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                             gap.urgency === 'high' ? 'bg-amber-500/20 text-amber-400' :
                             'bg-slate-500/20 text-slate-400'">
                    {{ gap.urgency }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-slate-400">{{ gap.affected }} affected</span>
                  <span class="text-slate-600">•</span>
                  <span class="text-purple-400">{{ gap.marketDemand }} demand</span>
                </div>
              </div>
            }
          </div>
          <button class="w-full mt-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
            View All Gaps →
          </button>
        </div>
      </div>

      <!-- At-Risk Employees -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">At-Risk Employees</h2>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">
              Filter by Department
            </button>
            <button class="px-3 py-1 text-sm rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">
              Sort by Risk
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="text-left text-sm text-slate-400 border-b border-slate-700">
                <th class="pb-3 font-medium">Employee</th>
                <th class="pb-3 font-medium">Role</th>
                <th class="pb-3 font-medium">Department</th>
                <th class="pb-3 font-medium">Risk Score</th>
                <th class="pb-3 font-medium">Key Gaps</th>
                <th class="pb-3 font-medium">Status</th>
                <th class="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (member of atRiskMembers(); track member.id) {
                <tr class="border-b border-slate-800 hover:bg-slate-800/50">
                  <td class="py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
                        {{ member.name.charAt(0) }}
                      </div>
                      <span class="text-slate-200">{{ member.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 text-slate-300">{{ member.role }}</td>
                  <td class="py-4 text-slate-400">{{ member.department }}</td>
                  <td class="py-4">
                    <span class="font-mono font-bold" [class]="getRiskColor(member.riskScore)">
                      {{ member.riskScore }}
                    </span>
                  </td>
                  <td class="py-4">
                    <div class="flex gap-1 flex-wrap max-w-xs">
                      @for (gap of member.skillGaps.slice(0, 2); track gap) {
                        <span class="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">{{ gap }}</span>
                      }
                      @if (member.skillGaps.length > 2) {
                        <span class="text-xs text-slate-500">+{{ member.skillGaps.length - 2 }}</span>
                      }
                    </div>
                  </td>
                  <td class="py-4">
                    <span class="text-xs px-2 py-1 rounded-full"
                      [class]="member.status === 'assessed' ? 'bg-emerald-500/20 text-emerald-400' :
                               member.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                               'bg-red-500/20 text-red-400'">
                      {{ member.status }}
                    </span>
                  </td>
                  <td class="py-4">
                    <button class="text-sm text-emerald-400 hover:text-emerald-300">
                      View Profile →
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Upskilling Recommendations -->
      <div class="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-500/30 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">AI-Powered Upskilling Recommendations</h2>
        <div class="grid grid-cols-3 gap-4">
          @for (rec of upskillRecommendations(); track rec.skill) {
            <div class="bg-slate-900/50 rounded-lg p-4">
              <div class="font-medium text-white mb-2">{{ rec.skill }}</div>
              <div class="text-sm text-slate-400 mb-3">{{ rec.employees }} employees recommended</div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-500">Est. Cost: \${{ rec.cost.toLocaleString() }}</span>
                <span class="text-emerald-400 font-medium">{{ rec.roi }}x ROI</span>
              </div>
              <button class="w-full mt-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm">
                Create Training Plan
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CompanyDashboardComponent implements OnInit {
  companyName = signal('Acme Corporation');
  overallRisk = signal(52);
  riskTrend = signal<'improving' | 'stable' | 'declining'>('improving');
  criticalGaps = signal(7);
  affectedDepartments = signal(4);
  assessmentCoverage = signal(78);
  pendingAssessments = signal(12);
  projectedROI = signal(4.2);
  estimatedSavings = signal(340000);

  teamMembers = signal<TeamMember[]>([
    { id: '1', name: 'Sarah Chen', role: 'Senior Developer', department: 'Engineering', riskScore: 72, lastAssessment: '2024-01-15', skillGaps: ['AI/ML', 'Cloud Architecture'], status: 'assessed' },
    { id: '2', name: 'Marcus Johnson', role: 'Data Analyst', department: 'Analytics', riskScore: 65, lastAssessment: '2024-01-10', skillGaps: ['Python', 'Machine Learning'], status: 'assessed' },
    { id: '3', name: 'Emily Rodriguez', role: 'Product Manager', department: 'Product', riskScore: 45, lastAssessment: '2024-01-18', skillGaps: ['Technical Writing'], status: 'assessed' },
    { id: '4', name: 'David Kim', role: 'UX Designer', department: 'Design', riskScore: 58, lastAssessment: '2024-01-05', skillGaps: ['AI Tools', 'Motion Design'], status: 'overdue' },
    { id: '5', name: 'Lisa Thompson', role: 'DevOps Engineer', department: 'Engineering', riskScore: 38, lastAssessment: '2024-01-20', skillGaps: ['Kubernetes'], status: 'assessed' },
    { id: '6', name: 'James Wilson', role: 'Marketing Manager', department: 'Marketing', riskScore: 81, lastAssessment: '2024-01-08', skillGaps: ['AI Marketing', 'Data Analytics', 'Automation'], status: 'assessed' },
    { id: '7', name: 'Anna Martinez', role: 'Financial Analyst', department: 'Finance', riskScore: 69, lastAssessment: '', skillGaps: ['Python', 'Automation'], status: 'pending' },
    { id: '8', name: 'Robert Brown', role: 'Sales Executive', department: 'Sales', riskScore: 55, lastAssessment: '2024-01-12', skillGaps: ['CRM Automation'], status: 'assessed' }
  ]);

  atRiskMembers = computed(() =>
    this.teamMembers()
      .filter(m => m.riskScore >= 50)
      .sort((a, b) => b.riskScore - a.riskScore)
  );

  departmentRisks = signal<DepartmentRisk[]>([
    { name: 'Marketing', avgRisk: 76, headcount: 24, criticalGaps: 3, trend: 'declining' },
    { name: 'Engineering', avgRisk: 52, headcount: 45, criticalGaps: 2, trend: 'improving' },
    { name: 'Finance', avgRisk: 61, headcount: 18, criticalGaps: 2, trend: 'stable' },
    { name: 'Sales', avgRisk: 48, headcount: 32, criticalGaps: 1, trend: 'improving' },
    { name: 'Design', avgRisk: 55, headcount: 12, criticalGaps: 1, trend: 'stable' },
    { name: 'Product', avgRisk: 35, headcount: 8, criticalGaps: 0, trend: 'improving' }
  ]);

  skillGaps = signal<SkillGapSummary[]>([
    { skill: 'AI/Machine Learning', gap: 78, affected: 34, marketDemand: 'high', urgency: 'critical' },
    { skill: 'Cloud Architecture', gap: 65, affected: 28, marketDemand: 'high', urgency: 'critical' },
    { skill: 'Data Analytics', gap: 58, affected: 45, marketDemand: 'high', urgency: 'high' },
    { skill: 'Automation Tools', gap: 52, affected: 56, marketDemand: 'medium', urgency: 'high' },
    { skill: 'Cybersecurity', gap: 45, affected: 22, marketDemand: 'high', urgency: 'medium' }
  ]);

  upskillRecommendations = signal([
    { skill: 'AI Fundamentals', employees: 34, cost: 45000, roi: 5.2 },
    { skill: 'Cloud Certification', employees: 28, cost: 38000, roi: 4.8 },
    { skill: 'Data Science Bootcamp', employees: 18, cost: 62000, roi: 4.1 }
  ]);

  ngOnInit() {
    this.loadCompanyData();
  }

  getRiskColor(risk: number): string {
    if (risk >= 70) return 'text-red-400';
    if (risk >= 50) return 'text-amber-400';
    return 'text-emerald-400';
  }

  exportReport() {
    // Generate PDF report
    console.log('Generating workforce report...');
  }

  inviteEmployees() {
    // Open invite modal
    console.log('Opening employee invite modal...');
  }

  private loadCompanyData() {
    // In production, load from API
    console.log('Loading company data...');
  }
}
