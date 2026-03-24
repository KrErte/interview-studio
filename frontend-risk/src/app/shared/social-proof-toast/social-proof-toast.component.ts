import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

const CITIES = [
  'Tallinn', 'Tartu', 'Helsinki', 'Riga', 'Vilnius', 'Stockholm',
  'Berlin', 'London', 'Amsterdam', 'Warsaw', 'Prague', 'Copenhagen',
  'Oslo', 'Dublin', 'Vienna', 'Zurich', 'Barcelona', 'Paris'
];

const ROLES = [
  'Marketing Manager', 'Software Developer', 'Data Analyst',
  'Project Manager', 'UX Designer', 'Financial Analyst',
  'HR Specialist', 'Content Writer', 'Sales Manager',
  'Business Analyst', 'Product Manager', 'Accountant'
];

@Component({
  selector: 'app-social-proof-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="fixed bottom-20 left-4 z-[100] max-w-xs animate-slide-in">
        <div class="bg-white border border-stone-200 shadow-lg p-3 flex items-start gap-3">
          <div class="w-8 h-8 bg-stone-100 flex items-center justify-center shrink-0 text-xs font-bold text-stone-500">
            {{ initials() }}
          </div>
          <div class="min-w-0">
            <p class="text-sm text-stone-900 font-medium leading-snug">{{ message() }}</p>
            <p class="text-xs text-stone-400 mt-0.5">{{ timeAgo() }}</p>
          </div>
          <button (click)="dismiss()" class="shrink-0 text-stone-300 hover:text-stone-500 mt-0.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in { animation: slideIn 0.4s ease-out; }
  `]
})
export class SocialProofToastComponent implements OnInit, OnDestroy {
  visible = signal(false);
  message = signal('');
  initials = signal('');
  timeAgo = signal('');

  private interval: any;
  private timeout: any;

  ngOnInit(): void {
    // First toast after 8 seconds, then every 25-45 seconds
    this.timeout = setTimeout(() => {
      this.showToast();
      this.interval = setInterval(() => this.showToast(), this.randomBetween(25000, 45000));
    }, 8000);
  }

  ngOnDestroy(): void {
    if (this.interval) clearInterval(this.interval);
    if (this.timeout) clearTimeout(this.timeout);
  }

  dismiss(): void {
    this.visible.set(false);
  }

  private showToast(): void {
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const role = ROLES[Math.floor(Math.random() * ROLES.length)];
    const mins = Math.floor(Math.random() * 12) + 1;

    this.message.set(`A ${role} from ${city} just checked their risk`);
    this.initials.set(city[0] + role[0]);
    this.timeAgo.set(`${mins} min ago`);
    this.visible.set(true);

    // Auto-hide after 5 seconds
    setTimeout(() => this.visible.set(false), 5000);
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}
