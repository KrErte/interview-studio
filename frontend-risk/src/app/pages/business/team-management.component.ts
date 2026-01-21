import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Employee {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  status: 'active' | 'invited' | 'inactive';
  invitedDate?: string;
  lastActive?: string;
  assessmentsCompleted: number;
  riskScore?: number;
}

interface Department {
  id: string;
  name: string;
  headcount: number;
  manager?: string;
}

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Team Management</h1>
          <p class="text-slate-400 mt-1">Manage employees, departments, and access permissions</p>
        </div>
        <button
          (click)="showInviteModal.set(true)"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Invite Employees
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Total Employees</div>
          <div class="text-3xl font-bold text-white mt-1">{{ totalEmployees() }}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Active</div>
          <div class="text-3xl font-bold text-emerald-400 mt-1">{{ activeEmployees() }}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Pending Invites</div>
          <div class="text-3xl font-bold text-amber-400 mt-1">{{ pendingInvites() }}</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div class="text-sm text-slate-400">Departments</div>
          <div class="text-3xl font-bold text-purple-400 mt-1">{{ departments().length }}</div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search employees..."
            class="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
        </div>
        <select
          [(ngModel)]="filterDepartment"
          class="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
          <option value="">All Departments</option>
          @for (dept of departments(); track dept.id) {
            <option [value]="dept.id">{{ dept.name }}</option>
          }
        </select>
        <select
          [(ngModel)]="filterStatus"
          class="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Employee Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-800">
            <tr class="text-left text-sm text-slate-400">
              <th class="p-4 font-medium">
                <input type="checkbox" class="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500">
              </th>
              <th class="p-4 font-medium">Employee</th>
              <th class="p-4 font-medium">Role</th>
              <th class="p-4 font-medium">Department</th>
              <th class="p-4 font-medium">Status</th>
              <th class="p-4 font-medium">Assessments</th>
              <th class="p-4 font-medium">Risk Score</th>
              <th class="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (employee of filteredEmployees(); track employee.id) {
              <tr class="border-t border-slate-800 hover:bg-slate-800/50">
                <td class="p-4">
                  <input type="checkbox" class="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500">
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {{ employee.name.split(' ').map(n => n[0]).join('') }}
                    </div>
                    <div>
                      <div class="font-medium text-white">{{ employee.name }}</div>
                      <div class="text-sm text-slate-500">{{ employee.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-slate-300">{{ employee.role }}</td>
                <td class="p-4 text-slate-400">{{ employee.department }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full"
                    [class]="employee.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                             employee.status === 'invited' ? 'bg-amber-500/20 text-amber-400' :
                             'bg-slate-500/20 text-slate-400'">
                    {{ employee.status }}
                  </span>
                </td>
                <td class="p-4 text-slate-300">{{ employee.assessmentsCompleted }}</td>
                <td class="p-4">
                  @if (employee.riskScore !== undefined) {
                    <span class="font-mono font-medium"
                      [class]="employee.riskScore >= 70 ? 'text-red-400' :
                               employee.riskScore >= 50 ? 'text-amber-400' : 'text-emerald-400'">
                      {{ employee.riskScore }}
                    </span>
                  } @else {
                    <span class="text-slate-500">-</span>
                  }
                </td>
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <button class="p-1 text-slate-400 hover:text-white" title="View Profile">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button class="p-1 text-slate-400 hover:text-white" title="Send Reminder">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button class="p-1 text-slate-400 hover:text-red-400" title="Remove">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div class="flex items-center justify-between text-sm">
        <div class="text-slate-400">
          Showing {{ filteredEmployees().length }} of {{ employees().length }} employees
        </div>
        <div class="flex gap-2">
          <button class="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
            Export CSV
          </button>
          <button class="px-3 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700">
            Bulk Invite
          </button>
        </div>
      </div>

      <!-- Invite Modal -->
      @if (showInviteModal()) {
        <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50" (click)="showInviteModal.set(false)">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full mx-4" (click)="$event.stopPropagation()">
            <h2 class="text-xl font-bold text-white mb-4">Invite Employees</h2>
            <p class="text-slate-400 text-sm mb-6">
              Enter email addresses to send assessment invitations. Employees will receive a link to complete their skill assessment.
            </p>

            <div class="space-y-4">
              <div>
                <label class="block text-sm text-slate-400 mb-2">Email Addresses</label>
                <textarea
                  [(ngModel)]="inviteEmails"
                  placeholder="Enter emails, one per line or comma-separated"
                  rows="4"
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
                </textarea>
              </div>

              <div>
                <label class="block text-sm text-slate-400 mb-2">Department (optional)</label>
                <select
                  [(ngModel)]="inviteDepartment"
                  class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500">
                  <option value="">Select department</option>
                  @for (dept of departments(); track dept.id) {
                    <option [value]="dept.name">{{ dept.name }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="flex items-center gap-2">
                  <input type="checkbox" [(ngModel)]="sendReminders" class="rounded border-slate-600 bg-slate-700 text-emerald-500">
                  <span class="text-sm text-slate-300">Send automatic reminders after 3 days</span>
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
              <button
                (click)="showInviteModal.set(false)"
                class="px-4 py-2 text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                (click)="sendInvites()"
                class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                Send Invitations
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TeamManagementComponent {
  searchQuery = '';
  filterDepartment = '';
  filterStatus = '';
  showInviteModal = signal(false);
  inviteEmails = '';
  inviteDepartment = '';
  sendReminders = true;

  departments = signal<Department[]>([
    { id: '1', name: 'Engineering', headcount: 45, manager: 'John Smith' },
    { id: '2', name: 'Marketing', headcount: 24, manager: 'Sarah Johnson' },
    { id: '3', name: 'Sales', headcount: 32, manager: 'Mike Brown' },
    { id: '4', name: 'Finance', headcount: 18, manager: 'Lisa Chen' },
    { id: '5', name: 'Product', headcount: 12, manager: 'Alex Kim' },
    { id: '6', name: 'Design', headcount: 8, manager: 'Emma Wilson' }
  ]);

  employees = signal<Employee[]>([
    { id: '1', email: 'sarah.chen@company.com', name: 'Sarah Chen', role: 'Senior Developer', department: 'Engineering', status: 'active', lastActive: '2024-01-20', assessmentsCompleted: 3, riskScore: 72 },
    { id: '2', email: 'marcus.johnson@company.com', name: 'Marcus Johnson', role: 'Data Analyst', department: 'Engineering', status: 'active', lastActive: '2024-01-19', assessmentsCompleted: 2, riskScore: 65 },
    { id: '3', email: 'emily.rodriguez@company.com', name: 'Emily Rodriguez', role: 'Product Manager', department: 'Product', status: 'active', lastActive: '2024-01-20', assessmentsCompleted: 4, riskScore: 45 },
    { id: '4', email: 'david.kim@company.com', name: 'David Kim', role: 'UX Designer', department: 'Design', status: 'active', lastActive: '2024-01-15', assessmentsCompleted: 2, riskScore: 58 },
    { id: '5', email: 'lisa.thompson@company.com', name: 'Lisa Thompson', role: 'DevOps Engineer', department: 'Engineering', status: 'active', lastActive: '2024-01-20', assessmentsCompleted: 3, riskScore: 38 },
    { id: '6', email: 'james.wilson@company.com', name: 'James Wilson', role: 'Marketing Manager', department: 'Marketing', status: 'active', lastActive: '2024-01-18', assessmentsCompleted: 1, riskScore: 81 },
    { id: '7', email: 'anna.martinez@company.com', name: 'Anna Martinez', role: 'Financial Analyst', department: 'Finance', status: 'invited', invitedDate: '2024-01-15', assessmentsCompleted: 0 },
    { id: '8', email: 'robert.brown@company.com', name: 'Robert Brown', role: 'Sales Executive', department: 'Sales', status: 'active', lastActive: '2024-01-19', assessmentsCompleted: 2, riskScore: 55 },
    { id: '9', email: 'jennifer.lee@company.com', name: 'Jennifer Lee', role: 'Content Writer', department: 'Marketing', status: 'invited', invitedDate: '2024-01-18', assessmentsCompleted: 0 },
    { id: '10', email: 'michael.garcia@company.com', name: 'Michael Garcia', role: 'Backend Developer', department: 'Engineering', status: 'inactive', lastActive: '2023-12-01', assessmentsCompleted: 1, riskScore: 62 }
  ]);

  totalEmployees = computed(() => this.employees().length);
  activeEmployees = computed(() => this.employees().filter(e => e.status === 'active').length);
  pendingInvites = computed(() => this.employees().filter(e => e.status === 'invited').length);

  filteredEmployees = computed(() => {
    let result = this.employees();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.role.toLowerCase().includes(query)
      );
    }

    if (this.filterDepartment) {
      const dept = this.departments().find(d => d.id === this.filterDepartment);
      if (dept) {
        result = result.filter(e => e.department === dept.name);
      }
    }

    if (this.filterStatus) {
      result = result.filter(e => e.status === this.filterStatus);
    }

    return result;
  });

  sendInvites() {
    const emails = this.inviteEmails
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e);

    console.log('Sending invites to:', emails, 'Department:', this.inviteDepartment);
    // API call here

    this.inviteEmails = '';
    this.inviteDepartment = '';
    this.showInviteModal.set(false);
  }
}
