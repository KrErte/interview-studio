import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paid-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center p-8">
      <h1 class="text-3xl font-bold text-white mb-4">Your 30-Day Plan</h1>

      <!-- Sample Result badge (was Demo Mode) -->
      <div *ngIf="isDemo" class="bg-gray-800 text-gray-400 text-sm px-3 py-1 rounded mb-4">
        Sample Result
      </div>

      <!-- Status Badge -->
      <div
        class="w-24 h-24 rounded-full flex items-center justify-center text-xl font-bold mb-6"
        [ngClass]="{
          'bg-red-600': status === 'RED',
          'bg-yellow-500 text-gray-900': status === 'YELLOW',
          'bg-emerald-600': status === 'GREEN'
        }"
      >
        {{ status }}
      </div>

      <!-- 30-Day Plan (E - sharper copy) -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Your Action Plan</h2>
        <ul class="space-y-3">
          <li *ngFor="let action of plan" class="bg-gray-800 rounded-lg p-4">
            <div class="text-emerald-400 text-sm mb-1">Day {{ action.day }}</div>
            <div class="text-white font-medium">{{ action.action }}</div>
            <div class="text-gray-400 text-sm mt-1">{{ action.outcome }}</div>
          </li>
        </ul>
      </div>

      <!-- CV Rewrite Bullets -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">CV Rewrite Suggestions</h2>
        <ul class="space-y-2">
          <li *ngFor="let bullet of cvRewriteBullets" class="bg-gray-800 rounded-lg p-3 text-gray-300">
            {{ bullet }}
          </li>
        </ul>
      </div>

      <!-- Roles to Avoid -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Roles to Avoid</h2>
        <ul class="space-y-2">
          <li *ngFor="let role of rolesToAvoid" class="bg-red-900/30 border border-red-800 rounded-lg p-3 text-red-300">
            {{ role }}
          </li>
        </ul>
      </div>

      <!-- Pivot Suggestion (if applicable) -->
      <div *ngIf="pivotSuggestion" class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">Consider a Pivot</h2>
        <div class="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 text-emerald-300">
          {{ pivotSuggestion }}
        </div>
      </div>

      <!-- After 30 days block (F) -->
      <div class="w-full max-w-md mb-8">
        <h2 class="text-xl font-semibold text-white mb-4">After 30 days</h2>
        <div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <ul class="space-y-2 text-gray-300">
            <li class="flex items-start">
              <span class="text-emerald-400 mr-2">•</span>
              You should have interviews — or a clear signal of what's blocking you.
            </li>
            <li class="flex items-start">
              <span class="text-emerald-400 mr-2">•</span>
              Your CV + profile will be aligned to your target role.
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
})
export class PaidResultComponent implements OnInit {
  assessmentId = '';
  isDemo = false;
  status: 'RED' | 'YELLOW' | 'GREEN' = 'YELLOW';
  plan: { day: number; action: string; outcome: string }[] = [];
  cvRewriteBullets: string[] = [];
  rolesToAvoid: string[] = [];
  pivotSuggestion: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.assessmentId = params['id'];
      this.isDemo = this.assessmentId === 'demo';
      this.loadResult();
    });
  }

  private loadResult(): void {
    if (this.isDemo) {
      // Mock data for sample result (E - sharper copy)
      this.status = 'YELLOW';
      this.plan = [
        {
          day: 1,
          action: 'Rewrite your CV summary with one concrete metric',
          outcome: 'CV passes the 6-second recruiter scan'
        },
        {
          day: 3,
          action: 'Update LinkedIn headline to match target role exactly',
          outcome: 'Recruiter searches start finding you'
        },
        {
          day: 7,
          action: 'Apply to 5 roles that match your actual experience level',
          outcome: 'Pipeline started — no more "reach" roles wasting time'
        },
        {
          day: 14,
          action: 'Follow up on silence. No response = expand search immediately',
          outcome: 'Either interviews scheduled or clear signal to pivot'
        },
        {
          day: 21,
          action: 'Prepare answers for the 5 questions that usually kill senior candidates',
          outcome: 'No more fumbling on "why are you leaving?" or "salary expectations"'
        },
        {
          day: 28,
          action: 'If no offer: expand pipeline fast. If offer: negotiate smart',
          outcome: 'Offer in hand — or clear plan for month 2'
        },
      ];
      this.cvRewriteBullets = [
        'Lead with "Senior Developer with 5+ years building scalable systems" — not a generic objective',
        'Add one metric per role: "Reduced API latency by 40%" beats "Improved performance"',
        'Remove skills that date you (jQuery, PHP 5) unless the job explicitly requires them',
      ];
      this.rolesToAvoid = [
        'Junior/Entry-level positions — you\'ll be underpaid and bored within 6 months',
        'Roles requiring 80%+ travel — misaligned with your stated preferences',
      ];
      this.pivotSuggestion = null;
    } else {
      // TODO: Call /api/taskexposure/result/{id}/paid
      this.status = 'YELLOW';
      this.plan = [
        { day: 1, action: 'Action from API', outcome: 'Outcome from API' },
      ];
      this.cvRewriteBullets = ['CV bullet from API'];
      this.rolesToAvoid = ['Role from API'];
    }
  }
}
