import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Step {
  number: number;
  label: string;
  completed: boolean;
  active: boolean;
}

@Component({
  selector: 'app-stepper-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-slate-900 border-b border-slate-800 py-6">
      <div class="max-w-4xl mx-auto px-4">
        <div class="flex items-center justify-between relative">
          <!-- Progress line -->
          <div class="absolute top-5 left-0 right-0 h-0.5 bg-slate-800 -z-10">
            <div
              class="h-full bg-emerald-500 transition-all duration-500"
              [style.width.%]="progressPercentage">
            </div>
          </div>

          <!-- Steps -->
          <div
            *ngFor="let step of steps; let i = index"
            class="flex flex-col items-center flex-1 relative">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 mb-2"
              [ngClass]="{
                'bg-emerald-500 text-slate-950': step.completed || step.active,
                'bg-slate-800 text-slate-400': !step.completed && !step.active,
                'ring-4 ring-emerald-500/30': step.active
              }">
              <span *ngIf="!step.completed || step.active">{{ step.number }}</span>
              <svg *ngIf="step.completed && !step.active" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span
              class="text-xs font-medium text-center max-w-20 transition-colors duration-300"
              [ngClass]="{
                'text-emerald-400': step.completed || step.active,
                'text-slate-500': !step.completed && !step.active
              }">
              {{ step.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class StepperHeaderComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 4;

  get steps(): Step[] {
    const stepLabels = ['Inputs', 'Questions', 'Assessment', 'Roadmap'];
    return Array.from({ length: this.totalSteps }, (_, i) => ({
      number: i + 1,
      label: stepLabels[i] || `Step ${i + 1}`,
      completed: i + 1 < this.currentStep,
      active: i + 1 === this.currentStep
    }));
  }

  get progressPercentage(): number {
    return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }
}
