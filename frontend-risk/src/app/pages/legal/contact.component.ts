import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiClient } from '../../core/api/api-client.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-black text-stone-900 mb-4">{{ 'contact.title' | translate }}</h1>
        <p class="text-stone-500 max-w-lg mx-auto">
          {{ 'contact.subtitle' | translate }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="p-6 border border-stone-200 bg-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-stone-900 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">{{ 'contact.emailLabel' | translate }}</h3>
                <a href="mailto:info&#64;careerisk.ee" class="text-red-600 text-sm hover:underline">info&#64;careerisk.ee</a>
              </div>
            </div>
          </div>

          <div class="p-6 border border-stone-200 bg-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-stone-900 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">{{ 'contact.responseTime' | translate }}</h3>
                <p class="text-stone-500 text-sm">{{ 'contact.responseTimeDesc' | translate }}</p>
              </div>
            </div>
          </div>

          <div class="p-6 border border-stone-200 bg-white">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-stone-900 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-stone-900">{{ 'contact.location' | translate }}</h3>
                <p class="text-stone-500 text-sm">{{ 'contact.locationValue' | translate }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="p-8 border border-stone-200 bg-white">
          @if (submitted()) {
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto bg-green-50 border border-green-200 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-stone-900 mb-2">{{ 'contact.successTitle' | translate }}</h3>
              <p class="text-stone-500">{{ 'contact.successDesc' | translate }}</p>
            </div>
          } @else {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">{{ 'contact.nameLabel' | translate }}</label>
                <input type="text" [(ngModel)]="name" [placeholder]="'contact.namePlaceholder' | translate"
                  class="w-full p-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">{{ 'contact.emailLabel' | translate }}</label>
                <input type="email" [(ngModel)]="email" [placeholder]="'contact.emailPlaceholder' | translate"
                  class="w-full p-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">{{ 'contact.subjectLabel' | translate }}</label>
                <select [(ngModel)]="subject"
                  class="w-full p-3 bg-white border border-stone-300 text-stone-900 focus:border-stone-900 focus:outline-none">
                  <option value="">{{ 'contact.subjectPlaceholder' | translate }}</option>
                  <option value="support">{{ 'contact.subjectSupport' | translate }}</option>
                  <option value="billing">{{ 'contact.subjectBilling' | translate }}</option>
                  <option value="feedback">{{ 'contact.subjectFeedback' | translate }}</option>
                  <option value="partnership">{{ 'contact.subjectPartnership' | translate }}</option>
                  <option value="other">{{ 'contact.subjectOther' | translate }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-stone-700 mb-1">{{ 'contact.messageLabel' | translate }}</label>
                <textarea [(ngModel)]="message" rows="4" [placeholder]="'contact.messagePlaceholder' | translate"
                  class="w-full p-3 bg-white border border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none resize-none"></textarea>
              </div>
              @if (error()) {
                <div class="text-sm text-red-600 bg-red-50 border border-red-200 p-3">
                  {{ error() }}
                </div>
              }
              <button (click)="submitForm()" [disabled]="!canSubmit() || submitting()"
                class="w-full py-3 bg-stone-900 text-white font-bold disabled:opacity-40 transition-all hover:bg-stone-800">
                @if (submitting()) { {{ 'contact.sending' | translate }} } @else { {{ 'contact.send' | translate }} }
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  private readonly api = inject(ApiClient);

  name = '';
  email = '';
  subject = '';
  message = '';
  submitted = signal(false);
  submitting = signal(false);
  error = signal('');

  canSubmit(): boolean {
    return !!this.name.trim() && !!this.email.trim() && !!this.subject && !!this.message.trim();
  }

  submitForm(): void {
    this.submitting.set(true);
    this.error.set('');

    this.api.post<any>('/contact', {
      name: this.name.trim(),
      email: this.email.trim(),
      subject: this.subject,
      message: this.message.trim()
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Failed to send message. Please try again or email us directly.');
      }
    });
  }
}
