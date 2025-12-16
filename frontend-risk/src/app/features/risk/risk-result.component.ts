import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RiskStateService } from './risk-state.service';
import { RiskAssessmentResult } from './risk.model';

@Component({
  selector: 'app-risk-result',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./risk-result.component.scss'],
  template: `
    <div class="space-y-6" *ngIf="result; else missing">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase text-emerald-300 font-semibold">Your AI risk</p>
          <h1 class="text-3xl font-bold text-slate-50">Result</h1>
        </div>
        <button class="btn-ghost" (click)="startOver()">Start new assessment</button>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="card col-span-2">
          <p class="text-xs uppercase text-slate-400">Risk percent</p>
          <p class="text-5xl font-extrabold text-emerald-300">{{ result.riskPercent }}%</p>
          <span class="badge" [class.badge-low]="result.confidence === 'LOW'" [class.badge-high]="result.confidence === 'HIGH'">
            Confidence: {{ result.confidence }}
          </span>
        </div>
        <div class="card">
          <p class="text-xs uppercase text-slate-400 mb-2">Recommendations</p>
          <ul class="list-disc list-inside space-y-1 text-sm text-slate-200">
            <li *ngFor="let rec of result.recommendations">{{ rec }}</li>
          </ul>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="card" *ngFor="let item of result.breakdown">
          <p class="text-xs uppercase text-slate-400">{{ item.label }}</p>
          <p class="text-2xl font-bold text-slate-50">{{ item.score }} / 100</p>
          <p class="text-sm text-slate-400">{{ item.details }}</p>
        </div>
      </div>
    </div>

    <ng-template #missing>
      <div class="card">
        <p class="text-slate-200">No result yet. Start the assessment to see your risk score.</p>
        <button class="btn-primary mt-3" (click)="router.navigateByUrl('/risk')">Start assessment</button>
      </div>
    </ng-template>
  `
})
export class RiskResultComponent implements OnInit {
  result: RiskAssessmentResult | null | undefined;

  constructor(private state: RiskStateService, public router: Router) {}

  ngOnInit(): void {
    this.result = this.state.snapshot.result;
  }

  startOver(): void {
    this.state.reset();
    this.router.navigateByUrl('/risk');
  }
}

