import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="fixed bottom-0 left-0 right-0 z-[9999] bg-stone-900 text-white border-t border-stone-700 px-4 py-4 md:px-6 md:py-3">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p class="text-sm text-stone-300 leading-relaxed">
            We use cookies to improve your experience and analyze site traffic.
            <a href="/privacy" class="underline text-white hover:text-red-400 transition-colors">Privacy Policy</a>
          </p>
          <div class="flex items-center gap-2 shrink-0">
            <button (click)="decline()" class="px-4 py-1.5 text-xs font-bold text-stone-400 border border-stone-600 hover:border-stone-400 hover:text-white transition-colors">
              Decline
            </button>
            <button (click)="accept()" class="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">
              Accept
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CookieConsentComponent {
  visible = signal(false);

  constructor() {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      this.visible.set(true);
    }
  }

  accept(): void {
    localStorage.setItem('cookie_consent', 'accepted');
    this.visible.set(false);
  }

  decline(): void {
    localStorage.setItem('cookie_consent', 'declined');
    this.visible.set(false);
  }
}
