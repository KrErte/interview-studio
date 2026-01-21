import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-business-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 max-w-4xl">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Settings</h1>
        <p class="text-slate-400 mt-1">Manage your organization's settings and preferences</p>
      </div>

      <!-- Company Profile -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Company Profile</h2>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-sm text-slate-400 mb-2">Company Name</label>
            <input
              type="text"
              [(ngModel)]="companyName"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-2">Industry</label>
            <select
              [(ngModel)]="industry"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
              <option value="technology">Technology</option>
              <option value="finance">Finance & Banking</option>
              <option value="healthcare">Healthcare</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-2">Company Size</label>
            <select
              [(ngModel)]="companySize"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1001+">1001+ employees</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-slate-400 mb-2">Website</label>
            <input
              type="url"
              [(ngModel)]="website"
              class="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Billing -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Billing & Subscription</h2>
          <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
            {{ currentPlan() }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="p-4 bg-slate-800/50 rounded-lg">
            <div class="text-sm text-slate-400">Current Plan</div>
            <div class="text-xl font-bold text-white mt-1">{{ currentPlan() }}</div>
          </div>
          <div class="p-4 bg-slate-800/50 rounded-lg">
            <div class="text-sm text-slate-400">Monthly Cost</div>
            <div class="text-xl font-bold text-white mt-1">\${{ monthlyCost() }}</div>
          </div>
          <div class="p-4 bg-slate-800/50 rounded-lg">
            <div class="text-sm text-slate-400">Next Billing Date</div>
            <div class="text-xl font-bold text-white mt-1">{{ nextBillingDate() }}</div>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
            Manage Billing
          </button>
          <button class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>

      <!-- User Management -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Admin Users</h2>
        <div class="space-y-3">
          @for (admin of admins(); track admin.email) {
            <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {{ admin.initials }}
                </div>
                <div>
                  <div class="font-medium text-white">{{ admin.name }}</div>
                  <div class="text-xs text-slate-500">{{ admin.email }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">{{ admin.role }}</span>
                <button class="text-slate-400 hover:text-red-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
        <button class="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Invite Admin
        </button>
      </div>

      <!-- Notification Preferences -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
        <div class="space-y-4">
          @for (pref of notificationPrefs(); track pref.key) {
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-white">{{ pref.label }}</div>
                <div class="text-sm text-slate-400">{{ pref.description }}</div>
              </div>
              <button
                (click)="toggleNotification(pref.key)"
                class="relative w-12 h-6 rounded-full transition-colors"
                [class]="pref.enabled ? 'bg-emerald-600' : 'bg-slate-700'">
                <div
                  class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"
                  [class]="pref.enabled ? 'left-7' : 'left-1'">
                </div>
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Security -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-4">Security</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <div class="font-medium text-white">Two-Factor Authentication</div>
              <div class="text-sm text-slate-400">Require 2FA for all admin accounts</div>
            </div>
            <button class="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Enabled</button>
          </div>
          <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <div class="font-medium text-white">Single Sign-On (SSO)</div>
              <div class="text-sm text-slate-400">Connect with your identity provider</div>
            </div>
            <button class="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600">Configure</button>
          </div>
          <div class="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <div class="font-medium text-white">Data Export</div>
              <div class="text-sm text-slate-400">Download all your organization's data</div>
            </div>
            <button class="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600">Export</button>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-slate-900 border border-red-500/30 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-white">Delete Organization</div>
            <div class="text-sm text-slate-400">Permanently delete your organization and all associated data</div>
          </div>
          <button class="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors border border-red-500/30">
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  `
})
export class BusinessSettingsComponent {
  companyName = 'Acme Corporation';
  industry = 'technology';
  companySize = '201-500';
  website = 'https://acme.com';

  currentPlan = signal('Business');
  monthlyCost = signal(799);
  nextBillingDate = signal('Feb 15, 2024');

  admins = signal([
    { name: 'John Admin', email: 'john@acme.com', role: 'Owner', initials: 'JA' },
    { name: 'Sarah Manager', email: 'sarah@acme.com', role: 'Admin', initials: 'SM' },
    { name: 'Mike HR', email: 'mike@acme.com', role: 'HR Manager', initials: 'MH' }
  ]);

  notificationPrefs = signal([
    { key: 'weekly_digest', label: 'Weekly Digest', description: 'Receive weekly summary of workforce analytics', enabled: true },
    { key: 'risk_alerts', label: 'Risk Alerts', description: 'Get notified when employees enter high-risk status', enabled: true },
    { key: 'assessment_complete', label: 'Assessment Completed', description: 'Notification when an employee completes their assessment', enabled: false },
    { key: 'training_progress', label: 'Training Progress', description: 'Updates on training program completion', enabled: true }
  ]);

  toggleNotification(key: string): void {
    this.notificationPrefs.update(prefs =>
      prefs.map(p => p.key === key ? { ...p, enabled: !p.enabled } : p)
    );
  }
}
