import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaService, SalaryCoachResponse } from '../../../services/arena.service';

interface ChatMessage {
  role: 'coach' | 'user';
  text: string;
}

@Component({
  selector: 'app-salary-coach',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-100">Salary Negotiation Coach</h1>
        </div>
        <p class="text-slate-400">Get personalized salary negotiation strategies and follow-up coaching.</p>
      </div>

      <!-- Phase 1: Input form -->
      <div *ngIf="phase === 'input'" class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-300">Target Role *</label>
          <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Product Manager"
                 class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Current Salary</label>
            <input [(ngModel)]="currentSalary" type="text" placeholder="e.g. $85,000"
                   class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Offered Salary</label>
            <input [(ngModel)]="offeredSalary" type="text" placeholder="e.g. $95,000"
                   class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Location</label>
            <input [(ngModel)]="location" type="text" placeholder="e.g. San Francisco, CA"
                   class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-300">Years of Experience</label>
            <input [(ngModel)]="experienceYears" type="text" placeholder="e.g. 5"
                   class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>
        </div>
        <button (click)="start()" [disabled]="loading || !targetRole.trim()"
                class="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2">
          <div *ngIf="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          {{ loading ? 'Analyzing...' : 'Get Coaching' }}
        </button>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200 text-sm">
        {{ error }}
      </div>

      <!-- Phase 2: Results + Chat -->
      <div *ngIf="phase === 'results' && initialResult" class="space-y-6">
        <!-- Market Analysis -->
        <div *ngIf="initialResult.marketAnalysis" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Market Analysis</h3>
          <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ initialResult.marketAnalysis }}</p>
        </div>

        <!-- Recommended Counter -->
        <div *ngIf="initialResult.recommendedCounter"
             class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 class="text-sm font-semibold text-amber-300 mb-2">Recommended Counter Offer</h3>
          <p class="text-lg font-bold text-amber-200">{{ initialResult.recommendedCounter }}</p>
        </div>

        <!-- Negotiation Strategies -->
        <div *ngIf="initialResult.negotiationStrategies?.length" class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-3">Negotiation Strategies</h3>
          <ul class="space-y-2">
            <li *ngFor="let s of initialResult.negotiationStrategies; let i = index"
                class="flex items-start gap-3 text-sm text-slate-300">
              <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs text-amber-300 font-semibold">
                {{ i + 1 }}
              </span>
              {{ s }}
            </li>
          </ul>
        </div>

        <!-- Talking Points -->
        <div *ngIf="initialResult.talkingPoints?.length" class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 class="text-sm font-semibold text-emerald-300 mb-3">Talking Points</h3>
          <ul class="space-y-2">
            <li *ngFor="let tp of initialResult.talkingPoints" class="flex items-start gap-2 text-sm text-emerald-200/80">
              <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              {{ tp }}
            </li>
          </ul>
        </div>

        <!-- Follow-up Chat -->
        <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 class="text-sm font-semibold text-slate-200 mb-4">Follow-up Questions</h3>

          <!-- Chat history -->
          <div *ngIf="chatMessages.length" class="space-y-3 mb-4 max-h-80 overflow-y-auto">
            <div *ngFor="let msg of chatMessages"
                 class="flex"
                 [ngClass]="msg.role === 'coach' ? 'justify-start' : 'justify-end'">
              <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                   [ngClass]="msg.role === 'coach'
                     ? 'bg-slate-800 text-slate-200 rounded-bl-md'
                     : 'bg-amber-600/80 text-white rounded-br-md'">
                {{ msg.text }}
              </div>
            </div>
            <div *ngIf="chatLoading" class="flex justify-start">
              <div class="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3">
                <div class="flex gap-1">
                  <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 0ms"></div>
                  <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 150ms"></div>
                  <div class="h-2 w-2 animate-bounce rounded-full bg-slate-500" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat input -->
          <div class="flex gap-3">
            <input [(ngModel)]="chatInput" type="text"
                   placeholder="Ask a follow-up question..."
                   (keydown.enter)="sendMessage()"
                   [disabled]="chatLoading"
                   class="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50" />
            <button (click)="sendMessage()" [disabled]="chatLoading || !chatInput.trim()"
                    class="rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SalaryCoachComponent {
  phase: 'input' | 'results' = 'input';
  targetRole = '';
  currentSalary = '';
  offeredSalary = '';
  location = '';
  experienceYears = '';
  loading = false;
  error: string | null = null;

  sessionId: number | null = null;
  initialResult: SalaryCoachResponse | null = null;
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;

  constructor(private arena: ArenaService) {}

  start(): void {
    if (!this.targetRole.trim() || this.loading) return;
    this.loading = true;
    this.error = null;

    this.arena.startSalaryCoach({
      targetRole: this.targetRole,
      currentSalary: this.currentSalary || undefined,
      offeredSalary: this.offeredSalary || undefined,
      location: this.location || undefined,
      experienceYears: this.experienceYears || undefined
    }).subscribe({
      next: (res) => {
        this.sessionId = res.sessionId;
        this.initialResult = res;
        this.phase = 'results';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to start coaching session.';
      }
    });
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || !this.sessionId || this.chatLoading) return;
    const msg = this.chatInput;
    this.chatInput = '';
    this.chatMessages.push({ role: 'user', text: msg });
    this.chatLoading = true;

    this.arena.messageSalaryCoach(this.sessionId, msg).subscribe({
      next: (res) => {
        this.chatMessages.push({ role: 'coach', text: res.message });
        this.chatLoading = false;
      },
      error: (err) => {
        this.chatLoading = false;
        this.chatMessages.push({ role: 'coach', text: 'Sorry, something went wrong. Please try again.' });
      }
    });
  }
}
