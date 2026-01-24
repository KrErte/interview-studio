import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserTierService } from '../../core/services/user-tier.service';

@Component({
  selector: 'app-email-capture-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <!-- Close button -->
        <button
          (click)="close()"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-center text-slate-50 mb-2">
          {{ title }}
        </h2>

        <!-- Subtitle -->
        <p class="text-slate-400 text-center mb-6">
          {{ subtitle }}
        </p>

        <!-- Benefits list -->
        <ul class="space-y-2 mb-6">
          <li *ngFor="let benefit of benefits" class="flex items-center gap-2 text-slate-300">
            <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ benefit }}
          </li>
        </ul>

        <!-- Email form -->
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <input
              type="email"
              [(ngModel)]="emailValue"
              name="email"
              placeholder="sinu@email.ee"
              required
              class="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            [disabled]="isSubmitting() || !emailValue"
            class="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isSubmitting()">{{ buttonText }}</span>
            <span *ngIf="isSubmitting()" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saadame...
            </span>
          </button>
        </form>

        <!-- Privacy note -->
        <p class="text-xs text-slate-500 text-center mt-4">
          Me ei jaga sinu e-maili kolmandate osapooltega.
        </p>

        <!-- Skip link -->
        <button
          *ngIf="allowSkip"
          (click)="skip()"
          class="w-full text-center text-sm text-slate-500 hover:text-slate-400 mt-3"
        >
          Jätka ilma
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `]
})
export class EmailCaptureModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Salvesta oma tulemused';
  @Input() subtitle = 'Sisesta e-mail, et saada tulemused ja uuendused.';
  @Input() buttonText = 'Saada tulemused';
  @Input() allowSkip = true;
  @Input() benefits: string[] = [
    'Tulemuste kokkuvõte e-mailile',
    'Teavitused turu muutustest',
    'Personaalsed soovitused'
  ];

  @Output() emailSubmitted = new EventEmitter<string>();
  @Output() skipped = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  emailValue = '';
  isSubmitting = signal(false);

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

  skip(): void {
    this.isOpen = false;
    this.skipped.emit();
  }

  onSubmit(): void {
    if (!this.emailValue || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    // Simulate API call
    setTimeout(() => {
      this.userTierService.setEmail(this.emailValue);
      this.emailSubmitted.emit(this.emailValue);
      this.isSubmitting.set(false);
      this.isOpen = false;
    }, 1000);
  }
}
