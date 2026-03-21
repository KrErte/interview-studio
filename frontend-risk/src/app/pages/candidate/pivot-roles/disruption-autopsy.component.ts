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
    <div class="border border-stone-200 bg-white shadow-sm overflow-hidden">
      <!-- Header -->
      <div class="px-5 pt-5 pb-4 border-b border-stone-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-red-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 class="text-[10px] font-bold text-stone-900 uppercase tracking-widest">Disruption Autopsy</h3>
            <p class="text-xs text-stone-400">Learn from roles that faced disruption before</p>
          </div>
        </div>
      </div>

      <!-- Role selector -->
      <div class="px-5 py-3 border-b border-stone-200 flex gap-2 overflow-x-auto">
        <button
          *ngFor="let role of disruptedRoles"
          class="flex-shrink-0 px-3 py-1.5 text-xs font-bold transition-colors"
          [ngClass]="selectedRole?.title === role.title
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-stone-50 text-stone-500 hover:text-stone-900 border border-stone-200'"
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
            <h4 class="text-xl font-bold text-stone-900">{{ selectedRole.title }}</h4>
            <p class="text-sm text-stone-400">Peak: {{ selectedRole.peakYear }}</p>
          </div>
          <div
            class="px-3 py-1.5 text-xs font-bold uppercase"
            [ngClass]="getStatusClasses(selectedRole.currentStatus)"
          >
            {{ selectedRole.currentStatus }}
          </div>
        </div>

        <!-- Impact stats -->
        <div class="grid grid-cols-3 gap-4">
          <div class="p-3 bg-stone-50 border border-stone-200">
            <div class="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Peak Employment</div>
            <div class="text-lg font-mono font-bold text-stone-600">{{ selectedRole.peakEmployment }}</div>
          </div>
          <div class="p-3 bg-stone-50 border border-stone-200">
            <div class="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Current</div>
            <div class="text-lg font-mono font-bold text-stone-600">{{ selectedRole.currentEmployment }}</div>
          </div>
          <div class="p-3 bg-red-50 border border-red-200">
            <div class="text-[10px] text-red-600 uppercase tracking-widest font-bold mb-1">Decline</div>
            <div class="text-lg font-mono font-bold text-red-600">-{{ selectedRole.decline }}%</div>
          </div>
        </div>

        <!-- Disruptors -->
        <div>
          <div class="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">What Disrupted This Role</div>
          <div class="flex flex-wrap gap-2">
            <span
              *ngFor="let disruptor of selectedRole.disruptors"
              class="px-2 py-1 bg-red-50 border border-red-200 text-xs text-red-600"
            >
              {{ disruptor }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <div class="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-3">How It Happened</div>
          <div class="relative pl-4 border-l border-stone-300 space-y-4">
            <div *ngFor="let event of selectedRole.timeline" class="relative">
              <div class="absolute -left-[21px] w-3 h-3 rounded-full bg-white border-2 border-stone-400"></div>
              <div class="text-xs text-stone-400">{{ event.year }}</div>
              <div class="text-sm text-stone-600">{{ event.event }}</div>
            </div>
          </div>
        </div>

        <!-- Survivors -->
        <div class="p-4 bg-stone-50 border border-stone-200">
          <div class="text-[10px] text-stone-900 uppercase tracking-widest font-bold mb-2">How Survivors Adapted</div>
          <ul class="space-y-2">
            <li *ngFor="let survival of selectedRole.survivors" class="flex items-start gap-2 text-sm text-stone-600">
              <svg class="w-4 h-4 text-stone-900 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              {{ survival }}
            </li>
          </ul>
        </div>

        <!-- Lessons -->
        <div class="p-4 bg-amber-50 border border-amber-200">
          <div class="text-[10px] text-amber-700 uppercase tracking-widest font-bold mb-2">Key Lessons for You</div>
          <ul class="space-y-2">
            <li *ngFor="let lesson of selectedRole.lessons" class="flex items-start gap-2 text-sm text-stone-600">
              <span class="text-amber-700 mt-0.5">→</span>
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
      case 'disrupted': return 'bg-red-50 text-red-600 border border-red-200';
      case 'transformed': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'declining': return 'bg-amber-50 text-amber-700 border border-amber-200';
    }
  }
}
