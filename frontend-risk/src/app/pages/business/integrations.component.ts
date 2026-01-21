import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'hris' | 'lms' | 'communication' | 'analytics' | 'ats';
  logo: string;
  status: 'connected' | 'available' | 'coming_soon';
  lastSync?: string;
  employeesImported?: number;
}

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Integrations</h1>
          <p class="text-slate-400 mt-1">Connect your existing tools to sync employee data automatically</p>
        </div>
        <a href="#" class="text-emerald-400 hover:text-emerald-300 text-sm">
          View API Documentation →
        </a>
      </div>

      <!-- Connected Integrations -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Connected Integrations</h2>
        @if (connectedIntegrations().length > 0) {
          <div class="grid grid-cols-2 gap-4">
            @for (integration of connectedIntegrations(); track integration.id) {
              <div class="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-emerald-500/30">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                    {{ integration.logo }}
                  </div>
                  <div>
                    <div class="font-medium text-white">{{ integration.name }}</div>
                    <div class="text-xs text-slate-400">
                      Last synced: {{ integration.lastSync }} • {{ integration.employeesImported }} employees
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button class="p-2 text-slate-400 hover:text-white" title="Sync now">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button class="p-2 text-slate-400 hover:text-white" title="Settings">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button class="px-3 py-1 text-red-400 hover:text-red-300 text-sm">
                    Disconnect
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-8 text-slate-500">
            No integrations connected yet. Connect your first integration below.
          </div>
        }
      </div>

      <!-- Available Integrations by Category -->
      @for (category of categories(); track category.id) {
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xl">{{ category.icon }}</span>
            <h2 class="text-lg font-semibold text-white">{{ category.name }}</h2>
          </div>
          <div class="grid grid-cols-3 gap-4">
            @for (integration of getIntegrationsByCategory(category.id); track integration.id) {
              <div class="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                    {{ integration.logo }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-white">{{ integration.name }}</div>
                    <div class="text-xs text-slate-400 mt-1 line-clamp-2">{{ integration.description }}</div>
                  </div>
                </div>
                <div class="mt-3 flex justify-end">
                  @if (integration.status === 'available') {
                    <button class="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-500 transition-colors">
                      Connect
                    </button>
                  } @else if (integration.status === 'coming_soon') {
                    <span class="px-3 py-1 bg-slate-700 text-slate-400 rounded text-sm">
                      Coming Soon
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- API Access -->
      <div class="bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/30 rounded-xl p-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white mb-2">REST API Access</h2>
            <p class="text-slate-400 text-sm max-w-xl">
              Build custom integrations using our REST API. Import employee data, trigger assessments,
              and export analytics programmatically.
            </p>
          </div>
          <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
            Generate API Key
          </button>
        </div>
        <div class="mt-4 p-4 bg-slate-900 rounded-lg">
          <div class="flex items-center justify-between">
            <code class="text-emerald-400 text-sm">https://api.workforceintel.io/v1</code>
            <button class="text-slate-400 hover:text-white text-sm">
              Copy
            </button>
          </div>
        </div>
      </div>

      <!-- Webhook Configuration -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Webhooks</h2>
        <p class="text-slate-400 text-sm mb-4">
          Receive real-time notifications when assessments are completed or risk scores change.
        </p>
        <div class="space-y-3">
          @for (webhook of webhooks(); track webhook.event) {
            <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div class="font-medium text-white text-sm">{{ webhook.event }}</div>
                <div class="text-xs text-slate-500">{{ webhook.url || 'Not configured' }}</div>
              </div>
              <button class="text-sm text-emerald-400 hover:text-emerald-300">
                {{ webhook.url ? 'Edit' : 'Configure' }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class IntegrationsComponent {
  integrations = signal<Integration[]>([
    // HRIS
    { id: '1', name: 'Workday', description: 'Enterprise HR and finance', category: 'hris', logo: '📊', status: 'connected', lastSync: '2 hours ago', employeesImported: 156 },
    { id: '2', name: 'BambooHR', description: 'Small business HR software', category: 'hris', logo: '🎋', status: 'available' },
    { id: '3', name: 'ADP', description: 'Payroll and HR services', category: 'hris', logo: '💼', status: 'available' },
    { id: '4', name: 'Gusto', description: 'Payroll, benefits, and HR', category: 'hris', logo: '🌟', status: 'available' },

    // LMS
    { id: '5', name: 'Cornerstone', description: 'Learning management platform', category: 'lms', logo: '🎓', status: 'connected', lastSync: '1 day ago', employeesImported: 89 },
    { id: '6', name: 'Docebo', description: 'AI-powered learning platform', category: 'lms', logo: '📚', status: 'available' },
    { id: '7', name: 'Absorb LMS', description: 'Corporate learning system', category: 'lms', logo: '💡', status: 'coming_soon' },

    // Communication
    { id: '8', name: 'Slack', description: 'Team messaging and collaboration', category: 'communication', logo: '💬', status: 'available' },
    { id: '9', name: 'Microsoft Teams', description: 'Chat, meetings, and collaboration', category: 'communication', logo: '🔵', status: 'available' },
    { id: '10', name: 'Gmail/Google Workspace', description: 'Email and productivity suite', category: 'communication', logo: '📧', status: 'available' },

    // Analytics
    { id: '11', name: 'Tableau', description: 'Business intelligence platform', category: 'analytics', logo: '📈', status: 'available' },
    { id: '12', name: 'Power BI', description: 'Microsoft analytics service', category: 'analytics', logo: '📊', status: 'available' },
    { id: '13', name: 'Looker', description: 'Data exploration and visualization', category: 'analytics', logo: '🔍', status: 'coming_soon' },

    // ATS
    { id: '14', name: 'Greenhouse', description: 'Applicant tracking system', category: 'ats', logo: '🌱', status: 'available' },
    { id: '15', name: 'Lever', description: 'Recruiting software', category: 'ats', logo: '⚡', status: 'available' },
    { id: '16', name: 'Workable', description: 'Recruiting and HR platform', category: 'ats', logo: '👥', status: 'coming_soon' }
  ]);

  categories = signal([
    { id: 'hris', name: 'HR Information Systems', icon: '🏢' },
    { id: 'lms', name: 'Learning Management', icon: '🎓' },
    { id: 'communication', name: 'Communication', icon: '💬' },
    { id: 'analytics', name: 'Analytics & BI', icon: '📊' },
    { id: 'ats', name: 'Applicant Tracking', icon: '👥' }
  ]);

  webhooks = signal([
    { event: 'assessment.completed', url: 'https://company.com/webhooks/assessment' },
    { event: 'risk_score.changed', url: '' },
    { event: 'employee.invited', url: '' },
    { event: 'training.completed', url: '' }
  ]);

  connectedIntegrations = signal(
    this.integrations().filter(i => i.status === 'connected')
  );

  getIntegrationsByCategory(category: string): Integration[] {
    return this.integrations().filter(i => i.category === category && i.status !== 'connected');
  }
}
