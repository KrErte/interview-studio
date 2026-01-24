import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTierService } from '../../core/services/user-tier.service';

@Component({
  selector: 'app-paywall-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl relative">
        <!-- Close button -->
        <button
          (click)="close()"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Lock icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-center text-slate-50 mb-2">
          {{ featureName }} on Pro funktsioon
        </h2>

        <!-- Subtitle -->
        <p class="text-slate-400 text-center mb-6">
          Uuenda Pro versioonile, et avada kõik funktsioonid.
        </p>

        <!-- Pricing card -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <div class="flex items-baseline justify-center gap-1 mb-4">
            <span class="text-4xl font-bold text-emerald-400">€49</span>
            <span class="text-slate-400">ühekordne</span>
          </div>

          <ul class="space-y-3">
            <li class="flex items-center gap-2 text-slate-300">
              <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Piiramatu arv hindamisi
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Detailne analüüs kõikides kategooriates
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              12 kuu personaalne tegevusplaan
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              PDF eksport ja e-mail raportid
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Perioodilised uuendused turu kohta
            </li>
          </ul>
        </div>

        <!-- CTA buttons -->
        <div class="space-y-3">
          <button
            (click)="onUpgrade()"
            [disabled]="isProcessing()"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50"
          >
            <span *ngIf="!isProcessing()">Uuenda Pro versioonile</span>
            <span *ngIf="isProcessing()" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Töötleme...
            </span>
          </button>

          <button
            (click)="close()"
            class="w-full py-2 text-slate-400 hover:text-slate-200 text-sm"
          >
            Mitte praegu
          </button>
        </div>

        <!-- Money back guarantee -->
        <p class="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          30 päeva raha tagasi garantii
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class PaywallModalComponent {
  @Input() isOpen = false;
  @Input() featureName = 'See funktsioon';

  @Output() upgraded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isProcessing = signal(false);

  constructor(private userTierService: UserTierService) {}

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close();
    }
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onUpgrade(): void {
    this.isProcessing.set(true);

    // Simulate payment processing - in production this would redirect to Stripe/payment
    setTimeout(() => {
      this.userTierService.upgradeToPro();
      this.upgraded.emit();
      this.isProcessing.set(false);
      this.isOpen = false;
    }, 1500);
  }
}
