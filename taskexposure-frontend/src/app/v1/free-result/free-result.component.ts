import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-free-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center p-8">
      <h1 class="text-3xl font-bold text-white mb-4">Your Assessment</h1>

      <!-- Sample Result badge (was Demo Mode) -->
      <div *ngIf="isDemo" class="bg-gray-800 text-gray-400 text-sm px-3 py-1 rounded mb-4">
        Sample Result
      </div>

      <!-- Status Badge -->
      <div
        class="w-32 h-32 rounded-full flex items-center justify-center text-2xl font-bold mb-2"
        [ngClass]="{
          'bg-red-600': status === 'RED',
          'bg-yellow-500 text-gray-900': status === 'YELLOW',
          'bg-emerald-600': status === 'GREEN'
        }"
      >
        {{ status }}
      </div>

      <!-- Trust line (D) -->
      <p class="text-gray-500 text-sm mb-6 text-center max-w-sm">
        This doesn't measure intelligence — it measures market fit right now.
      </p>

      <!-- 3 Blockers -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-2">Your Top 3 Blockers</h2>
        <!-- Helper line (G) -->
        <p class="text-gray-500 text-sm mb-4">
          These are the fastest fixes that most improve interview chances.
        </p>
        <ul class="space-y-3">
          <li *ngFor="let blocker of blockers" class="bg-gray-800 rounded-lg p-4 text-gray-300">
            {{ blocker }}
          </li>
        </ul>
      </div>

      <!-- Teaser Action with compelling preview (C) -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Your First Action</h2>
        <div class="bg-gray-800 rounded-lg p-4 relative overflow-hidden">
          <!-- Visible teaser preview -->
          <p class="text-gray-300 mb-2">{{ teaserPreview }}</p>
          <!-- Blurred detailed how-to -->
          <div class="relative">
            <p class="text-gray-300 blur-sm select-none">{{ teaserBlurred }}</p>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="bg-gray-900/90 text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium">
                Unlock full instructions
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment CTA (B) -->
      <button
        (click)="unlock()"
        class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
      >
        Get Your 30-Day Job Plan — €9.99
      </button>
      <p class="text-gray-500 text-sm mt-2">One-time purchase. Instant access.</p>
    </div>
  `,
})
export class FreeResultComponent implements OnInit {
  assessmentId = '';
  isDemo = false;
  status: 'RED' | 'YELLOW' | 'GREEN' = 'YELLOW';
  blockers: string[] = [];
  teaserPreview = '';
  teaserBlurred = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assessmentId = params['id'];
      this.isDemo = this.assessmentId === 'demo';
      this.loadResult();
    });
  }

  private loadResult(): void {
    if (this.isDemo) {
      // Mock data for sample result
      this.status = 'YELLOW';
      this.blockers = [
        'Your CV lacks quantified achievements from the last 2 years',
        'No visible presence in your target industry (LinkedIn, GitHub, etc.)',
        'Gap between your last role and target role not addressed',
      ];
      this.teaserPreview = 'First action: Rewrite your CV summary to clearly state your seniority and impact…';
      this.teaserBlurred = 'Start with your title + years, then add one concrete metric from your most recent role. Example: "Senior Engineer with 6 years experience, most recently reducing checkout latency by 40% at [Company]."';
    } else {
      // TODO: Call /api/taskexposure/result/{id}
      this.status = 'YELLOW';
      this.blockers = [
        'Blocker 1 from API',
        'Blocker 2 from API',
        'Blocker 3 from API',
      ];
      this.teaserPreview = 'First action: Address your most critical gap…';
      this.teaserBlurred = 'Detailed instructions will appear here after the API call is implemented.';
    }
  }

  unlock(): void {
    // TODO: Trigger Stripe payment flow (skip for demo)
    this.router.navigate(['/result', this.assessmentId, 'paid']);
  }
}
