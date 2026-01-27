import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudioApiService, SessionResponse } from '../../core/services/studio-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800 print:hidden">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
          <div class="flex items-center gap-4">
            <button
              (click)="print()"
              class="text-gray-400 hover:text-white text-sm flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              Print
            </button>
            <a routerLink="/" class="text-gray-400 hover:text-white text-sm">Create Your Own</a>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-8">
        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-emerald-500"></div>
              <p class="text-gray-400 mt-4">Loading report...</p>
            </div>
          </div>
        } @else if (error()) {
          <div class="max-w-md mx-auto text-center py-20">
            <div class="text-red-400 mb-4">{{ error() }}</div>
            <a routerLink="/" class="text-emerald-400 hover:text-emerald-300">Create your own session</a>
          </div>
        } @else if (session()) {
          <div class="max-w-3xl mx-auto">
            <!-- Report header -->
            <div class="text-center mb-8 print:mb-4">
              <p class="text-gray-500 text-sm mb-2">Interview Studio Report</p>
              <h1 class="text-3xl font-bold text-white mb-2 print:text-black">{{ session()!.targetRole }}</h1>
              <p class="text-gray-400 print:text-gray-600">{{ formatDate(session()!.createdAt) }}</p>
            </div>

            <!-- Status -->
            <div class="text-center mb-8">
              <div
                class="inline-flex items-center justify-center w-20 h-20 rounded-full text-xl font-bold print:border-2"
                [class]="statusClasses()"
              >
                {{ session()!.status }}
              </div>
              <p class="text-gray-500 text-sm mt-3 print:text-gray-600">Market Fit Assessment</p>
            </div>

            <!-- Blockers -->
            <div class="mb-8">
              <h2 class="text-xl font-semibold text-white mb-4 print:text-black">Key Blockers</h2>
              <div class="space-y-3">
                @for (blocker of session()!.blockers; track blocker; let i = $index) {
                  <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 flex gap-3 print:bg-white print:border-gray-300">
                    <span class="flex-shrink-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-sm text-gray-400 print:bg-gray-200 print:text-gray-600">
                      {{ i + 1 }}
                    </span>
                    <span class="text-gray-300 print:text-gray-800">{{ blocker }}</span>
                  </div>
                }
              </div>
            </div>

            @if (session()!.paid) {
              <!-- 30-Day Plan -->
              @if (session()!.plan?.length) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4 print:text-black">30-Day Action Plan</h2>
                  <div class="space-y-3">
                    @for (action of session()!.plan; track action.day) {
                      <div class="bg-gray-900 border border-gray-800 rounded-lg p-4 print:bg-white print:border-gray-300">
                        <div class="flex items-center gap-3 mb-2">
                          <span class="bg-emerald-600/20 text-emerald-400 text-sm font-medium px-2 py-0.5 rounded print:bg-emerald-100 print:text-emerald-700">
                            Day {{ action.day }}
                          </span>
                        </div>
                        <p class="text-white font-medium mb-1 print:text-black">{{ action.action }}</p>
                        <p class="text-gray-500 text-sm print:text-gray-600">→ {{ action.outcome }}</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- CV Suggestions -->
              @if (session()!.cvRewriteBullets?.length) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4 print:text-black">CV Suggestions</h2>
                  <ul class="space-y-2">
                    @for (bullet of session()!.cvRewriteBullets; track bullet) {
                      <li class="flex gap-2 text-gray-300 print:text-gray-800">
                        <span class="text-emerald-500 print:text-emerald-700">•</span>
                        {{ bullet }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Roles to Avoid -->
              @if (session()!.rolesToAvoid?.length) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4 print:text-black">Roles to Avoid</h2>
                  <ul class="space-y-2">
                    @for (role of session()!.rolesToAvoid; track role) {
                      <li class="flex gap-2 text-red-300 print:text-red-700">
                        <span class="text-red-500 print:text-red-700">✕</span>
                        {{ role }}
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Pivot -->
              @if (session()!.pivotSuggestion) {
                <div class="mb-8">
                  <h2 class="text-xl font-semibold text-white mb-4 print:text-black">Consider a Pivot</h2>
                  <p class="text-blue-300 print:text-blue-700">{{ session()!.pivotSuggestion }}</p>
                </div>
              }
            }

            <!-- CTA for viewers -->
            <div class="mt-12 text-center print:hidden">
              <p class="text-gray-400 mb-4">Want your own personalized assessment?</p>
              <a
                routerLink="/"
                class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3 rounded-lg transition-colors"
              >
                Get Your Assessment
              </a>
            </div>

            <!-- Print footer -->
            <div class="hidden print:block mt-12 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
              <p>Generated by Interview Studio — interviewstudio.app</p>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    @media print {
      :host {
        background: white !important;
      }
    }
  `],
})
export class ShareComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  session = signal<SessionResponse | null>(null);

  constructor(
    private route: ActivatedRoute,
    private studioApi: StudioApiService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const shareId = params['shareId'];
      if (shareId) {
        this.loadSession(shareId);
      } else {
        this.error.set('Invalid share link');
        this.loading.set(false);
      }
    });
  }

  loadSession(shareId: string): void {
    this.loading.set(true);
    this.studioApi.getSharedSession(shareId).subscribe({
      next: (session) => {
        this.session.set(session);
        this.loading.set(false);
        this.analytics.pageView(`/share/${shareId}`, 'Shared Report');
      },
      error: () => {
        this.error.set('Report not found or no longer available');
        this.loading.set(false);
      },
    });
  }

  statusClasses(): string {
    const status = this.session()?.status;
    switch (status) {
      case 'RED': return 'bg-red-600 text-white print:bg-red-100 print:text-red-700 print:border-red-500';
      case 'YELLOW': return 'bg-yellow-500 text-gray-900 print:bg-yellow-100 print:text-yellow-700 print:border-yellow-500';
      case 'GREEN': return 'bg-emerald-600 text-white print:bg-emerald-100 print:text-emerald-700 print:border-emerald-500';
      default: return 'bg-gray-600 text-white print:bg-gray-100 print:text-gray-700 print:border-gray-500';
    }
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  print(): void {
    window.print();
  }
}
