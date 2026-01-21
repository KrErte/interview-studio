import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrainingPlan {
  id: string;
  name: string;
  skill: string;
  targetEmployees: number;
  enrolled: number;
  completed: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  provider: string;
  estimatedCost: number;
  projectedROI: number;
}

interface TrainingProvider {
  id: string;
  name: string;
  logo: string;
  courses: number;
  rating: number;
  integrated: boolean;
}

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Training Plans</h1>
          <p class="text-slate-400 mt-1">Create and manage upskilling programs for your workforce</p>
        </div>
        <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Training Plan
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Active Programs</div>
          <div class="text-3xl font-bold text-emerald-400 mt-1">{{ activePrograms() }}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Employees Enrolled</div>
          <div class="text-3xl font-bold text-purple-400 mt-1">{{ totalEnrolled() }}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Completion Rate</div>
          <div class="text-3xl font-bold text-white mt-1">{{ completionRate() }}%</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">YTD Investment</div>
          <div class="text-3xl font-bold text-amber-400 mt-1">\${{ ytdInvestment().toLocaleString() }}</div>
        </div>
      </div>

      <!-- AI Recommendations -->
      <div class="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-500/30 rounded-xl p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
            🤖
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white mb-2">AI-Recommended Training</h3>
            <p class="text-slate-400 text-sm mb-4">
              Based on your workforce skill gaps and market trends, we recommend prioritizing these training programs:
            </p>
            <div class="flex flex-wrap gap-2">
              @for (rec of aiRecommendations(); track rec) {
                <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {{ rec }}
                </span>
              }
            </div>
          </div>
          <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm">
            Auto-Generate Plans
          </button>
        </div>
      </div>

      <!-- Training Plans Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Training Programs</h2>
          <div class="flex gap-2">
            <button class="px-3 py-1 text-sm rounded-lg"
              [class]="selectedTab() === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'"
              (click)="selectedTab.set('all')">
              All
            </button>
            <button class="px-3 py-1 text-sm rounded-lg"
              [class]="selectedTab() === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'"
              (click)="selectedTab.set('active')">
              Active
            </button>
            <button class="px-3 py-1 text-sm rounded-lg"
              [class]="selectedTab() === 'scheduled' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'"
              (click)="selectedTab.set('scheduled')">
              Scheduled
            </button>
            <button class="px-3 py-1 text-sm rounded-lg"
              [class]="selectedTab() === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'"
              (click)="selectedTab.set('completed')">
              Completed
            </button>
          </div>
        </div>
        <table class="w-full">
          <thead class="bg-slate-800/50">
            <tr class="text-left text-sm text-slate-400">
              <th class="p-4 font-medium">Program</th>
              <th class="p-4 font-medium">Skill</th>
              <th class="p-4 font-medium">Progress</th>
              <th class="p-4 font-medium">Timeline</th>
              <th class="p-4 font-medium">Provider</th>
              <th class="p-4 font-medium">ROI</th>
              <th class="p-4 font-medium">Status</th>
              <th class="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (plan of filteredPlans(); track plan.id) {
              <tr class="border-t border-slate-800 hover:bg-slate-800/50">
                <td class="p-4">
                  <div class="font-medium text-white">{{ plan.name }}</div>
                  <div class="text-xs text-slate-500">\${{ plan.estimatedCost.toLocaleString() }} budget</div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 bg-slate-800 text-slate-300 rounded text-sm">{{ plan.skill }}</span>
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-emerald-500 rounded-full"
                        [style.width.%]="(plan.completed / plan.enrolled) * 100">
                      </div>
                    </div>
                    <span class="text-sm text-slate-400">{{ plan.completed }}/{{ plan.enrolled }}</span>
                  </div>
                </td>
                <td class="p-4 text-sm text-slate-400">
                  {{ plan.startDate }} - {{ plan.endDate }}
                </td>
                <td class="p-4 text-slate-300">{{ plan.provider }}</td>
                <td class="p-4">
                  <span class="text-emerald-400 font-medium">{{ plan.projectedROI }}x</span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full"
                    [class]="plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                             plan.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                             plan.status === 'completed' ? 'bg-slate-500/20 text-slate-400' :
                             'bg-amber-500/20 text-amber-400'">
                    {{ plan.status }}
                  </span>
                </td>
                <td class="p-4">
                  <button class="text-sm text-emerald-400 hover:text-emerald-300">
                    Manage →
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Training Providers -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Connected Training Providers</h2>
        <div class="grid grid-cols-4 gap-4">
          @for (provider of providers(); track provider.id) {
            <div class="p-4 bg-slate-800/50 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <div class="text-2xl">{{ provider.logo }}</div>
                @if (provider.integrated) {
                  <span class="text-xs text-emerald-400">Connected</span>
                } @else {
                  <button class="text-xs text-slate-400 hover:text-white">Connect</button>
                }
              </div>
              <div class="font-medium text-white">{{ provider.name }}</div>
              <div class="text-sm text-slate-400">{{ provider.courses }} courses</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class TrainingPlansComponent {
  selectedTab = signal<'all' | 'active' | 'scheduled' | 'completed'>('all');
  activePrograms = signal(5);
  totalEnrolled = signal(67);
  completionRate = signal(72);
  ytdInvestment = signal(145000);

  aiRecommendations = signal([
    'AI/ML Fundamentals',
    'Cloud Architecture (AWS/Azure)',
    'Data Analytics & Visualization',
    'Cybersecurity Basics'
  ]);

  trainingPlans = signal<TrainingPlan[]>([
    {
      id: '1',
      name: 'AI Fundamentals Bootcamp',
      skill: 'AI/Machine Learning',
      targetEmployees: 30,
      enrolled: 24,
      completed: 18,
      startDate: 'Jan 15',
      endDate: 'Mar 15',
      status: 'active',
      provider: 'Coursera',
      estimatedCost: 36000,
      projectedROI: 4.8
    },
    {
      id: '2',
      name: 'AWS Solutions Architect',
      skill: 'Cloud Architecture',
      targetEmployees: 15,
      enrolled: 15,
      completed: 12,
      startDate: 'Feb 1',
      endDate: 'Apr 30',
      status: 'active',
      provider: 'AWS Training',
      estimatedCost: 22500,
      projectedROI: 5.2
    },
    {
      id: '3',
      name: 'Data Science with Python',
      skill: 'Data Analytics',
      targetEmployees: 20,
      enrolled: 18,
      completed: 0,
      startDate: 'Mar 1',
      endDate: 'May 30',
      status: 'scheduled',
      provider: 'DataCamp',
      estimatedCost: 18000,
      projectedROI: 4.1
    },
    {
      id: '4',
      name: 'Leadership Development',
      skill: 'Management',
      targetEmployees: 10,
      enrolled: 10,
      completed: 10,
      startDate: 'Oct 1',
      endDate: 'Dec 15',
      status: 'completed',
      provider: 'LinkedIn Learning',
      estimatedCost: 8500,
      projectedROI: 3.5
    },
    {
      id: '5',
      name: 'Cybersecurity Essentials',
      skill: 'Security',
      targetEmployees: 25,
      enrolled: 0,
      completed: 0,
      startDate: 'Apr 1',
      endDate: 'Jun 30',
      status: 'draft',
      provider: 'Pluralsight',
      estimatedCost: 25000,
      projectedROI: 6.0
    }
  ]);

  filteredPlans = signal<TrainingPlan[]>(this.trainingPlans());

  providers = signal<TrainingProvider[]>([
    { id: '1', name: 'Coursera', logo: '📚', courses: 5000, rating: 4.7, integrated: true },
    { id: '2', name: 'LinkedIn Learning', logo: '💼', courses: 8000, rating: 4.5, integrated: true },
    { id: '3', name: 'Pluralsight', logo: '🎓', courses: 3000, rating: 4.6, integrated: true },
    { id: '4', name: 'Udemy Business', logo: '🎯', courses: 12000, rating: 4.4, integrated: false }
  ]);

  constructor() {
    // Filter plans when tab changes
  }
}
