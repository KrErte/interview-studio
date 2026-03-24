import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <button
        (click)="scrollToTop()"
        class="fixed bottom-6 right-6 z-50 w-10 h-10 bg-stone-900 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all duration-300 opacity-90 hover:opacity-100"
        aria-label="Back to top">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    }
  `
})
export class BackToTopComponent {
  visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 400);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
