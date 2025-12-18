import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

interface FlowStep {
  key: 'overview' | 'questions' | 'assessment' | 'roadmap';
  label: string;
  path: string;
}

@Component({
  selector: 'app-futureproof-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <div class="flex flex-wrap items-center gap-3">
        <ng-container *ngFor="let step of steps; let idx = index">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition"
            [ngClass]="{
              'bg-emerald-500 text-slate-900 shadow': status(step) === 'completed',
              'border border-emerald-400 text-emerald-200 bg-slate-900': status(step) === 'active',
              'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed': status(step) === 'upcoming'
            }"
            [disabled]="status(step) !== 'completed'"
            (click)="navigate(step)"
            [attr.aria-current]="status(step) === 'active' ? 'step' : null"
            [attr.aria-disabled]="status(step) !== 'completed'"
          >
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full border"
              [ngClass]="{
                'border-emerald-700 bg-emerald-600 text-slate-900': status(step) === 'completed',
                'border-emerald-400 text-emerald-200': status(step) === 'active',
                'border-slate-700 text-slate-500': status(step) === 'upcoming'
              }"
            >
              <ng-container [ngSwitch]="status(step)">
                <span *ngSwitchCase="'completed'">✓</span>
                <span *ngSwitchDefault>{{ idx + 1 }}</span>
              </ng-container>
            </span>
            <span>{{ step.label }}</span>
          </button>
          <span *ngIf="idx < steps.length - 1" class="text-slate-600">—</span>
        </ng-container>
      </div>
    </div>
  `
})
export class FutureproofStepperComponent implements OnInit, OnDestroy {
  steps: FlowStep[] = [
    { key: 'overview', label: 'Profiil', path: '/futureproof/overview' },
    { key: 'questions', label: 'Küsimused', path: '/futureproof/questions' },
    { key: 'assessment', label: 'Analüüs', path: '/futureproof/assessment' },
    { key: 'roadmap', label: 'Tegevuskava', path: '/futureproof/roadmap' }
  ];

  activeKey: FlowStep['key'] = 'overview';
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateActive(this.router.url);
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event: any) => event?.urlAfterRedirects !== undefined)
      )
      .subscribe((event: any) => this.updateActive(event.urlAfterRedirects as string));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateActive(url: string): void {
    if (url.startsWith('/futureproof/questions')) {
      this.activeKey = 'questions';
      return;
    }
    if (url.startsWith('/futureproof/assessment')) {
      this.activeKey = 'assessment';
      return;
    }
    if (url.startsWith('/futureproof/roadmap')) {
      this.activeKey = 'roadmap';
      return;
    }
    this.activeKey = 'overview';
  }

  isActive(step: FlowStep): boolean {
    return this.activeKey === step.key;
  }

  status(step: FlowStep): 'completed' | 'active' | 'upcoming' {
    const order = this.steps.findIndex((s) => s.key === step.key);
    const activeOrder = this.steps.findIndex((s) => s.key === this.activeKey);
    if (order === activeOrder) {
      return 'active';
    }
    if (order < activeOrder) {
      return 'completed';
    }
    return 'upcoming';
  }

  navigate(step: FlowStep): void {
    if (this.status(step) !== 'completed') {
      return;
    }
    this.router.navigateByUrl(step.path);
  }
}


