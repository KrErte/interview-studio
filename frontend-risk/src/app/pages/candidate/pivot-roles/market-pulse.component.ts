import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

interface MarketSignal {
  id: string;
  type: 'opportunity' | 'warning' | 'trend' | 'layoff';
  title: string;
  source: string;
  timeAgo: string;
  relevanceScore: number;
  details: string;
  actionable: boolean;
  action?: string;
}

interface MarketMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-market-pulse',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-stone-200 bg-white overflow-hidden">
      <!-- Header with live indicator -->
      <div class="px-5 pt-5 pb-4 border-b border-stone-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 bg-stone-900 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-600 border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h3 class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Market Pulse</h3>
              <p class="text-xs text-stone-500">Live signals relevant to your profile</p>
            </div>
          </div>
          <div class="flex items-center gap-2 px-2 py-1 bg-red-50 border border-red-200">
            <div class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
            <span class="text-[10px] font-bold text-red-600 uppercase tracking-widest">LIVE</span>
          </div>
        </div>
      </div>

      <!-- Quick metrics bar -->
      <div class="px-5 py-3 border-b border-stone-200 bg-stone-50">
        <div class="grid grid-cols-4 gap-4">
          <div *ngFor="let metric of metrics" class="text-center">
            <div class="text-lg font-mono font-bold" [ngClass]="getMetricColor(metric)">
              {{ metric.value }}
            </div>
            <div class="flex items-center justify-center gap-1 text-[10px]">
              <span class="text-stone-400">{{ metric.label }}</span>
              <span [ngClass]="getTrendColor(metric.trend)">
                {{ metric.trend === 'up' ? '&#8593;' : metric.trend === 'down' ? '&#8595;' : '&#8594;' }}
                {{ metric.change > 0 ? '+' : '' }}{{ metric.change }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Signal feed -->
      <div class="divide-y divide-stone-200">
        <div
          *ngFor="let signal of signals; let i = index"
          class="px-5 py-4 hover:bg-stone-50 transition-colors cursor-pointer"
          [class.animate-slideIn]="i < 3"
          [style.animation-delay]="i * 100 + 'ms'"
        >
          <div class="flex items-start gap-3">
            <!-- Signal type icon -->
            <div
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center"
              [ngClass]="getSignalIconClasses(signal.type)"
            >
              <span class="text-sm">{{ getSignalIcon(signal.type) }}</span>
            </div>

            <!-- Signal content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-medium text-stone-900">{{ signal.title }}</p>
                  <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs text-stone-400">{{ signal.source }}</span>
                    <span class="text-stone-300">&bull;</span>
                    <span class="text-xs text-stone-400">{{ signal.timeAgo }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1">
                  <div
                    class="w-2 h-2 rounded-full"
                    [ngClass]="getRelevanceColor(signal.relevanceScore)"
                  ></div>
                  <span class="text-[10px] text-stone-400">{{ signal.relevanceScore }}% match</span>
                </div>
              </div>

              <p class="mt-2 text-xs text-stone-500">{{ signal.details }}</p>

              <!-- Actionable button -->
              <button
                *ngIf="signal.actionable"
                class="mt-2 inline-flex items-center gap-1 px-2 py-1 text-xs font-bold transition-colors"
                [ngClass]="getActionButtonClasses(signal.type)"
              >
                {{ signal.action || 'View Details' }}
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-5 py-3 border-t border-stone-200 flex items-center justify-between">
        <span class="text-xs text-stone-400">
          Showing {{ signals.length }} signals from last 24h
        </span>
        <button class="text-xs font-bold text-red-600 hover:text-red-700">
          Configure Alerts
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out forwards;
    }
  `]
})
export class MarketPulseComponent implements OnInit {
  @Input() userRole = 'Software Engineer';

  metrics: MarketMetric[] = [
    { label: 'Open Roles', value: '2.4K', change: -12, trend: 'down' },
    { label: 'Avg Salary', value: '$142K', change: 3, trend: 'up' },
    { label: 'AI Adoption', value: '67%', change: 15, trend: 'up' },
    { label: 'Remote %', value: '45%', change: -5, trend: 'down' }
  ];

  signals: MarketSignal[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Anthropic hiring Senior Engineers',
      source: 'LinkedIn',
      timeAgo: '2h ago',
      relevanceScore: 92,
      details: '15 new positions opened for engineers with Python/TypeScript experience. Strong match with your profile.',
      actionable: true,
      action: 'View Positions'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Meta reduces engineering headcount',
      source: 'TechCrunch',
      timeAgo: '4h ago',
      relevanceScore: 78,
      details: 'Company announces 10% reduction in engineering roles. May increase competition in your job market.',
      actionable: false
    },
    {
      id: '3',
      type: 'trend',
      title: 'Rust demand up 45% this quarter',
      source: 'Stack Overflow Jobs',
      timeAgo: '6h ago',
      relevanceScore: 65,
      details: 'Systems programming skills becoming more valuable. Consider adding to your toolkit.',
      actionable: true,
      action: 'Learning Path'
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Your skills match: Stripe Backend Role',
      source: 'Direct Match',
      timeAgo: '8h ago',
      relevanceScore: 88,
      details: 'Based on your experience with APIs and payment systems. $180-220K range.',
      actionable: true,
      action: 'Quick Apply'
    },
    {
      id: '5',
      type: 'layoff',
      title: 'Tech layoffs continue in Q1',
      source: 'layoffs.fyi',
      timeAgo: '12h ago',
      relevanceScore: 70,
      details: '23,000 tech workers laid off this month. Defensive positioning recommended.',
      actionable: true,
      action: 'Review Plan'
    },
    {
      id: '6',
      type: 'trend',
      title: 'AI-assisted coding now standard',
      source: 'GitHub Survey',
      timeAgo: '1d ago',
      relevanceScore: 95,
      details: '78% of developers now use AI coding assistants daily. Adapt or fall behind.',
      actionable: true,
      action: 'AI Skills Guide'
    }
  ];

  ngOnInit(): void {
    // Sort by relevance
    this.signals.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  getSignalIcon(type: MarketSignal['type']): string {
    switch (type) {
      case 'opportunity': return '>';
      case 'warning': return '!';
      case 'trend': return '^';
      case 'layoff': return 'x';
    }
  }

  getSignalIconClasses(type: MarketSignal['type']): string {
    switch (type) {
      case 'opportunity': return 'bg-stone-50 border border-stone-200';
      case 'warning': return 'bg-amber-50 border border-amber-200';
      case 'trend': return 'bg-stone-50 border border-stone-200';
      case 'layoff': return 'bg-red-50 border border-red-200';
    }
  }

  getMetricColor(metric: MarketMetric): string {
    if (metric.trend === 'up' && metric.change > 0) return 'text-stone-900';
    if (metric.trend === 'down' && metric.change < 0) return 'text-red-600';
    return 'text-stone-900';
  }

  getTrendColor(trend: MarketMetric['trend']): string {
    switch (trend) {
      case 'up': return 'text-stone-900';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-stone-400';
    }
  }

  getRelevanceColor(score: number): string {
    if (score >= 80) return 'bg-stone-900';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-stone-400';
  }

  getActionButtonClasses(type: MarketSignal['type']): string {
    switch (type) {
      case 'opportunity': return 'bg-stone-50 text-stone-900 hover:bg-stone-100 border border-stone-200';
      case 'warning': return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200';
      case 'trend': return 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200';
      case 'layoff': return 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200';
    }
  }
}
