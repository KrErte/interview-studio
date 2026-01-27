import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 class="text-4xl font-bold text-white mb-4">Job Market Check</h1>
      <p class="text-gray-400 text-lg mb-8 text-center max-w-md">
        Are you competitive in the job market right now, and what should you do in the next 30 days?
      </p>
      <div class="flex gap-4">
        <button
          (click)="start()"
          class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Check My Position
        </button>
        <button
          (click)="useMockData()"
          class="bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-8 rounded-lg transition-colors border border-gray-600"
        >
          Demo Mode
        </button>
      </div>
    </div>
  `,
})
export class LandingComponent {
  constructor(private router: Router) {}

  start(): void {
    this.router.navigate(['/upload']);
  }

  useMockData(): void {
    this.router.navigate(['/result', 'demo']);
  }
}
