import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService, SalaryCoachResponse } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-salary-coach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">Salary Negotiation Coach</h1>
      <p class="text-stone-500 mb-8">Get AI-powered coaching to negotiate your best offer.</p>

      <!-- Setup Form -->
      @if (!sessionStarted()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Senior Software Engineer"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Current Salary</label>
              <input [(ngModel)]="currentSalary" type="text" placeholder="e.g. $90,000"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Offered Salary</label>
              <input [(ngModel)]="offeredSalary" type="text" placeholder="e.g. $110,000"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Location</label>
              <input [(ngModel)]="location" type="text" placeholder="e.g. Berlin, Germany"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Years of Experience</label>
              <input [(ngModel)]="experienceYears" type="text" placeholder="e.g. 5"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
            </div>
          </div>
          <button (click)="startCoaching()" [disabled]="loading() || !targetRole"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white transition-all disabled:opacity-50">
            @if (loading()) { Analyzing... } @else { Get Coaching }
          </button>
        </div>
      }

      <!-- Coaching Results + Chat -->
      @if (sessionStarted()) {
        <div class="space-y-6">
          <!-- Initial Analysis -->
          @if (marketAnalysis()) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-2">Market Analysis</h3>
              <p class="text-sm text-stone-700">{{ marketAnalysis() }}</p>
            </div>
          }

          @if (recommendedCounter()) {
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-700 mb-2">Recommended Counter-Offer</h3>
              <p class="text-lg font-bold text-stone-900">{{ recommendedCounter() }}</p>
            </div>
          }

          @if (strategies().length) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Negotiation Strategies</h3>
              <ul class="space-y-2">
                @for (s of strategies(); track s) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-700 mt-0.5">&#x2192;</span> {{ s }}
                  </li>
                }
              </ul>
            </div>
          }

          @if (talkingPoints().length) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Key Talking Points</h3>
              <ul class="space-y-2">
                @for (tp of talkingPoints(); track tp) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-stone-900 mt-0.5">&#x2022;</span> {{ tp }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Chat Messages -->
          @for (msg of chatMessages(); track $index) {
            <div [class]="msg.role === 'coach'
              ? 'bg-white border border-stone-200 rounded-2xl p-5'
              : 'bg-green-50 border border-green-200 rounded-2xl p-5 ml-8'">
              <div class="text-xs font-semibold mb-2" [class]="msg.role === 'coach' ? 'text-stone-900' : 'text-green-700'">
                {{ msg.role === 'coach' ? 'Coach' : 'You' }}
              </div>
              <p class="text-stone-700 text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          }

          <!-- Follow-up Input -->
          <div class="space-y-3">
            <textarea [(ngModel)]="followUpMessage" rows="3" placeholder="Ask a follow-up question..."
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
            <div class="flex gap-3">
              <button (click)="sendMessage()" [disabled]="loading() || !followUpMessage"
                class="flex-1 py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50">
                @if (loading()) { Thinking... } @else { Ask Coach }
              </button>
              <button (click)="reset()"
                class="px-6 py-3 rounded-xl font-semibold border border-stone-300 text-stone-700 hover:bg-stone-100 transition-all">
                New Session
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class SalaryCoachComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';
  currentSalary = '';
  offeredSalary = '';
  location = '';
  experienceYears = '';
  followUpMessage = '';

  readonly loading = signal(false);
  readonly sessionStarted = signal(false);
  readonly sessionId = signal<number | null>(null);
  readonly marketAnalysis = signal('');
  readonly recommendedCounter = signal('');
  readonly strategies = signal<string[]>([]);
  readonly talkingPoints = signal<string[]>([]);
  readonly chatMessages = signal<{role: string; content: string}[]>([]);

  startCoaching() {
    this.loading.set(true);
    this.arenaApi.startSalaryCoach({
      targetRole: this.targetRole,
      currentSalary: this.currentSalary || undefined,
      offeredSalary: this.offeredSalary || undefined,
      location: this.location || undefined,
      experienceYears: this.experienceYears || undefined
    }).subscribe({
      next: (res) => {
        this.sessionId.set(res.sessionId);
        this.sessionStarted.set(true);
        this.marketAnalysis.set(res.marketAnalysis || '');
        this.recommendedCounter.set(res.recommendedCounter || '');
        this.strategies.set(res.negotiationStrategies || []);
        this.talkingPoints.set(res.talkingPoints || []);
        if (res.message) {
          this.chatMessages.set([{ role: 'coach', content: res.message }]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to start coaching. Please try again.');
      }
    });
  }

  sendMessage() {
    if (!this.followUpMessage || !this.sessionId()) return;
    this.loading.set(true);

    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: this.followUpMessage }]);
    const msg = this.followUpMessage;
    this.followUpMessage = '';

    this.arenaApi.messageSalaryCoach(this.sessionId()!, msg).subscribe({
      next: (res) => {
        if (res.message) {
          this.chatMessages.update(msgs => [...msgs, { role: 'coach', content: res.message }]);
        }
        if (res.talkingPoints?.length) {
          this.talkingPoints.set(res.talkingPoints);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to get response. Please try again.');
      }
    });
  }

  reset() {
    this.sessionStarted.set(false);
    this.sessionId.set(null);
    this.marketAnalysis.set('');
    this.recommendedCounter.set('');
    this.strategies.set([]);
    this.talkingPoints.set([]);
    this.chatMessages.set([]);
    this.followUpMessage = '';
  }
}
