import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-16">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-white mb-4">Get in Touch</h1>
        <p class="text-slate-400 max-w-lg mx-auto">
          Have a question, feedback, or need support? We'd love to hear from you.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white">Email</h3>
                <a href="mailto:info&#64;careerisk.ee" class="text-emerald-400 text-sm hover:underline">info&#64;careerisk.ee</a>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white">Response Time</h3>
                <p class="text-slate-400 text-sm">Usually within 24 hours on business days</p>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-slate-800 bg-slate-900/50">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-white">Location</h3>
                <p class="text-slate-400 text-sm">Tallinn, Estonia</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div class="p-8 rounded-2xl border border-slate-800 bg-slate-900/50">
          @if (submitted()) {
            <div class="text-center py-8">
              <div class="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p class="text-slate-400">We'll get back to you as soon as possible.</p>
            </div>
          } @else {
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input type="text" [(ngModel)]="name" placeholder="Your name"
                  class="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input type="email" [(ngModel)]="email" placeholder="your&#64;email.com"
                  class="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                <select [(ngModel)]="subject"
                  class="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none">
                  <option value="">Select a topic</option>
                  <option value="support">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feedback">Feedback</option>
                  <option value="partnership">Partnership / B2B</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-300 mb-1">Message</label>
                <textarea [(ngModel)]="message" rows="4" placeholder="How can we help?"
                  class="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none resize-none"></textarea>
              </div>
              <button (click)="submitForm()" [disabled]="!canSubmit()"
                class="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold disabled:opacity-40 transition-all hover:shadow-emerald-500/25 shadow-lg">
                Send Message
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  submitted = signal(false);

  canSubmit(): boolean {
    return !!this.name.trim() && !!this.email.trim() && !!this.subject && !!this.message.trim();
  }

  submitForm(): void {
    // For now, just show success message
    // TODO: integrate with backend email API
    this.submitted.set(true);
  }
}
