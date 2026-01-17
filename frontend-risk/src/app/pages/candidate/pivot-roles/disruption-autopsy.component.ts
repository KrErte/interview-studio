import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface DisruptedRole {
  title: string;
  peakYear: number;
  currentStatus: 'disrupted' | 'transformed' | 'declining';
  peakEmployment: string;
  currentEmployment: string;
  decline: number;
  disruptors: string[];
  timeline: { year: number; event: string }[];
  survivors: string[];
  lessons: string[];
}

@Component({
  selector: 'app-disruption-autopsy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      <!-- Header -->
      <div class="px-5 pt-5 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Disruption Autopsy</h3>
            <p class="text-xs text-slate-500">Learn from roles that faced disruption before</p>
          </div>
        </div>
      </div>

      <!-- Role selector -->
      <div class="px-5 py-3 border-b border-slate-800 flex gap-2 overflow-x-auto">
        <button
          *ngFor="let role of disruptedRoles"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          [ngClass]="selectedRole?.title === role.title
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
            : 'bg-slate-800 text-slate-400 hover:text-slate-200'"
          (click)="selectRole(role)"
        >
          {{ role.title }}
        </button>
      </div>

      <!-- Selected role details -->
      <div *ngIf="selectedRole" class="p-5 space-y-5">
        <!-- Status header -->
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-xl font-bold text-white">{{ selectedRole.title }}</h4>
            <p class="text-sm text-slate-400">Peak: {{ selectedRole.peakYear }}</p>
          </div>
          <div
            class="px-3 py-1.5 rounded-full text-xs font-bold uppercase"
            [ngClass]="getStatusClasses(selectedRole.currentStatus)"
          >
            {{ selectedRole.currentStatus }}
          </div>
        </div>

        <!-- Impact stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div class="text-xs text-slate-500 mb-1">Peak Employment</div>
            <div class="text-lg font-mono font-bold text-slate-300">{{ selectedRole.peakEmployment }}</div>
          </div>
          <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
            <div class="text-xs text-slate-500 mb-1">Current</div>
            <div class="text-lg font-mono font-bold text-slate-300">{{ selectedRole.currentEmployment }}</div>
          </div>
          <div class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
            <div class="text-xs text-rose-400 mb-1">Decline</div>
            <div class="text-lg font-mono font-bold text-rose-400">-{{ selectedRole.decline }}%</div>
          </div>
        </div>

        <!-- Disruptors -->
        <div>
          <div class="text-xs text-slate-500 uppercase tracking-wide mb-2">What Disrupted This Role</div>
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let disruptor of selectedRole.disruptors"
              class="px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300"
            >
              {{ disruptor }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <div class="text-xs text-slate-500 uppercase tracking-wide mb-3">How It Happened</div>
          <div class="relative pl-4 border-l border-slate-700 space-y-4">
            <div *ngFor="let event of selectedRole.timeline" class="relative">
              <div class="absolute -left-[21px] w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600"></div>
              <div class="text-xs text-slate-500">{{ event.year }}</div>
              <div class="text-sm text-slate-300">{{ event.event }}</div>
            </div>
          </div>
        </div>

        <!-- Survivors -->
        <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div class="text-xs text-emerald-400 uppercase tracking-wide mb-2">How Survivors Adapted</div>
          <ul class="space-y-2">
            <li *ngFor="let survival of selectedRole.survivors" class="flex items-start gap-2 text-sm text-slate-300">
              <svg class="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ survival }}
            </li>
          </ul>
        </div>

        <!-- Lessons -->
        <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div class="text-xs text-amber-400 uppercase tracking-wide mb-2">Key Lessons for You</div>
          <ul class="space-y-2">
            <li *ngFor="let lesson of selectedRole.lessons" class="flex items-start gap-2 text-sm text-slate-300">
              <span class="text-amber-400 mt-0.5">→</span>
              {{ lesson }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class DisruptionAutopsyComponent {
  disruptedRoles: DisruptedRole[] = [
    {
      title: 'Travel Agent',
      peakYear: 2000,
      currentStatus: 'disrupted',
      peakEmployment: '124K',
      currentEmployment: '58K',
      decline: 53,
      disruptors: ['Online Booking (Expedia)', 'Price Comparison Sites', 'Airline Direct Sales', 'Mobile Apps'],
      timeline: [
        { year: 1996, event: 'Expedia and Travelocity launch online booking' },
        { year: 2000, event: 'Peak employment - most bookings still through agents' },
        { year: 2005, event: 'Airlines eliminate agent commissions' },
        { year: 2010, event: 'Mobile booking apps emerge' },
        { year: 2020, event: 'COVID accelerates digital adoption' }
      ],
      survivors: [
        'Specialized in luxury/complex travel',
        'Built corporate client relationships',
        'Became "travel advisors" with expertise',
        'Created niche (honeymoons, adventure, accessible travel)'
      ],
      lessons: [
        'Commoditized tasks get automated first',
        'Expertise and relationships are defensible',
        'Pivot to complexity, not volume'
      ]
    },
    {
      title: 'Bank Teller',
      peakYear: 2007,
      currentStatus: 'declining',
      peakEmployment: '600K',
      currentEmployment: '400K',
      decline: 33,
      disruptors: ['ATMs', 'Online Banking', 'Mobile Deposits', 'Cryptocurrency'],
      timeline: [
        { year: 1970, event: 'First ATMs deployed' },
        { year: 1995, event: 'Online banking begins' },
        { year: 2007, event: 'Peak employment before smartphone era' },
        { year: 2014, event: 'Mobile check deposit becomes standard' },
        { year: 2020, event: 'Branch visits drop 50% during pandemic' }
      ],
      survivors: [
        'Transitioned to "universal bankers" with advisory role',
        'Moved into loan origination and wealth management',
        'Specialized in business banking relationships',
        'Became branch managers focusing on complex services'
      ],
      lessons: [
        'Routine transactions are first to automate',
        'Advisory and relationship roles persist longer',
        'Physical presence still valued for complex decisions'
      ]
    },
    {
      title: 'Paralegal',
      peakYear: 2019,
      currentStatus: 'transformed',
      peakEmployment: '325K',
      currentEmployment: '290K',
      decline: 11,
      disruptors: ['E-discovery Software', 'Contract AI (Kira)', 'Document Automation', 'LegalZoom'],
      timeline: [
        { year: 2010, event: 'E-discovery tools reduce document review time 90%' },
        { year: 2015, event: 'Contract analysis AI enters market' },
        { year: 2019, event: 'GPT-2 shows potential for legal writing' },
        { year: 2023, event: 'ChatGPT disrupts routine legal research' },
        { year: 2024, event: 'AI handles 60% of document preparation' }
      ],
      survivors: [
        'Became AI tool operators and quality reviewers',
        'Specialized in litigation support and trial prep',
        'Moved into compliance and regulatory roles',
        'Built expertise in specific legal domains (IP, healthcare)'
      ],
      lessons: [
        'Research and document work is highly automatable',
        'Being an AI operator is a valid career pivot',
        'Domain expertise + tech skills = job security'
      ]
    },
    {
      title: 'Junior Developer',
      peakYear: 2023,
      currentStatus: 'transformed',
      peakEmployment: '2.1M',
      currentEmployment: '1.8M',
      decline: 14,
      disruptors: ['GitHub Copilot', 'ChatGPT/Claude', 'No-Code Platforms', 'AI Code Generation'],
      timeline: [
        { year: 2021, event: 'GitHub Copilot public preview' },
        { year: 2022, event: 'ChatGPT shows coding capabilities' },
        { year: 2023, event: 'Entry-level hiring drops 40% at major tech companies' },
        { year: 2024, event: 'AI handles most boilerplate and CRUD operations' },
        { year: 2025, event: 'Junior role redefines as "AI-assisted developer"' }
      ],
      survivors: [
        'Became AI-assisted developers producing 3-5x output',
        'Specialized in AI/ML engineering and prompt engineering',
        'Moved to roles requiring human judgment (security, architecture)',
        'Built domain expertise (fintech, healthcare, etc.)'
      ],
      lessons: [
        'Coding alone is not enough - need systems thinking',
        'AI collaboration skills are now required',
        'Specialization beats generalization',
        'The role is transforming, not disappearing'
      ]
    }
  ];

  selectedRole: DisruptedRole | null = null;

  ngOnInit(): void {
    this.selectedRole = this.disruptedRoles[3]; // Start with Junior Developer
  }

  selectRole(role: DisruptedRole): void {
    this.selectedRole = role;
  }

  getStatusClasses(status: DisruptedRole['currentStatus']): string {
    switch (status) {
      case 'disrupted': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'transformed': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'declining': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    }
  }
}
