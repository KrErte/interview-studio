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
  selector: 'app-careerrisk-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-6 border border-stone-200 bg-white px-4 py-3">
      <div class="flex flex-wrap items-center gap-3">
        <ng-container *ngFor="let step of steps; let idx = index">
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-2 text-sm font-semibold transition"
            [ngClass]="{
              'bg-stone-900 text-white': status(step) === 'completed',
              'border border-stone-900 text-stone-900': status(step) === 'active',
              'text-stone-400 border border-stone-200 cursor-not-allowed': status(step) === 'upcoming'
            }"
            [disabled]="status(step) !== 'completed'"
            (click)="navigate(step)"
            [attr.aria-current]="status(step) === 'active' ? 'step' : null"
            [attr.aria-disabled]="status(step) !== 'completed'"
          >
            <span
              class="flex h-6 w-6 items-center justify-center border text-xs font-bold"
              [ngClass]="{
                'border-stone-700 bg-stone-900 text-white': status(step) === 'completed',
                'border-stone-900 text-stone-900': status(step) === 'active',
                'border-stone-300 text-stone-400': status(step) === 'upcoming'
              }"
            >
              <ng-container [ngSwitch]="status(step)">
                <span *ngSwitchCase="'completed'">&#10003;</span>
                <span *ngSwitchDefault>{{ idx + 1 }}</span>
              </ng-container>
            </span>
            <span>{{ step.label }}</span>
          </button>
          <span *ngIf="idx < steps.length - 1" class="text-stone-300">—</span>
        </ng-container>
      </div>
    </div>
  `
})
export class CareerriskStepperComponent implements OnInit, OnDestroy {
  steps: FlowStep[] = [
    { key: 'overview', label: 'Profile', path: '/careerrisk/overview' },
    { key: 'questions', label: 'Questions', path: '/careerrisk/questions' },
    { key: 'assessment', label: 'Analysis', path: '/careerrisk/assessment' },
    { key: 'roadmap', label: 'Roadmap', path: '/careerrisk/roadmap' }
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
    if (url.startsWith('/careerrisk/questions')) {
      this.activeKey = 'questions';
      return;
    }
    if (url.startsWith('/careerrisk/assessment')) {
      this.activeKey = 'assessment';
      return;
    }
    if (url.startsWith('/careerrisk/roadmap')) {
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


