import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exit-intent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4" (click)="dismiss()">
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative bg-white max-w-md w-full p-8 shadow-2xl" (click)="$event.stopPropagation()">
          <button (click)="dismiss()" class="absolute top-3 right-3 text-stone-400 hover:text-stone-900">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="text-center">
            <div class="w-12 h-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-xl font-black text-stone-900 mb-2">Wait — don't leave without knowing your risk</h3>
            <p class="text-sm text-stone-500 mb-6 leading-relaxed">
              47% of professionals are at high automation risk. A 3-minute check could change how you plan your career.
            </p>
            <a routerLink="/session/new" (click)="dismiss()" class="block w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors text-center mb-3">
              Check My Risk — Free
            </a>
            <button (click)="dismiss()" class="text-xs text-stone-400 hover:text-stone-600 transition-colors">
              No thanks, I'll take my chances
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ExitIntentComponent {
  visible = signal(false);
  private triggered = false;

  constructor() {
    const dismissed = sessionStorage.getItem('exit_intent_dismissed');
    if (dismissed) this.triggered = true;
  }

  @HostListener('document:mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (this.triggered) return;
    // Only trigger when mouse exits toward the top (closing tab)
    if (event.clientY <= 0) {
      this.triggered = true;
      this.visible.set(true);
    }
  }

  dismiss(): void {
    this.visible.set(false);
    sessionStorage.setItem('exit_intent_dismissed', '1');
  }
}
