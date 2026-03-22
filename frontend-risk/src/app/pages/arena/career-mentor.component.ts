import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArenaApiService } from '../../core/services/arena-api.service';

@Component({
  selector: 'app-career-mentor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-stone-900 mb-2">AI Career Mentor</h1>
      <p class="text-stone-500 mb-8">Get personalized career advice powered by AI. Ask questions, get actionable guidance.</p>

      <!-- Setup Form -->
      @if (!sessionStarted()) {
        <div class="rounded-2xl border border-stone-200 bg-white p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Target Role</label>
            <input [(ngModel)]="targetRole" type="text" placeholder="e.g. Senior Product Manager"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"/>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Current Status</label>
              <select [(ngModel)]="currentStatus"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
                <option value="employed">Currently Employed</option>
                <option value="job-searching">Actively Job Searching</option>
                <option value="career-switch">Career Switching</option>
                <option value="returning">Returning to Work</option>
                <option value="freelancing">Freelancing</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-1">Experience Level</label>
              <select [(ngModel)]="experienceLevel"
                class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-stone-900">
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-Level (3-5 years)</option>
                <option value="senior">Senior (6-10 years)</option>
                <option value="lead">Lead / Manager (10+ years)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-1">Main Challenge</label>
            <textarea [(ngModel)]="mainChallenge" rows="3" placeholder="What's your biggest career challenge right now?"
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
          </div>
          <button (click)="startMentoring()" [disabled]="loading() || !targetRole"
            class="w-full py-3 rounded-xl font-bold bg-stone-900 text-white transition-all disabled:opacity-50">
            @if (loading()) { Starting session... } @else { Start Mentoring Session }
          </button>
        </div>
      }

      <!-- Mentoring Results + Chat -->
      @if (sessionStarted()) {
        <div class="space-y-6">
          <!-- Career Outlook -->
          @if (careerOutlook()) {
            <div class="rounded-xl border border-stone-200 bg-stone-50 p-5">
              <h3 class="font-semibold text-stone-900 mb-2">Career Outlook</h3>
              <p class="text-sm text-stone-700">{{ careerOutlook() }}</p>
            </div>
          }

          <!-- Action Items -->
          @if (actionItems().length) {
            <div class="rounded-xl border border-green-200 bg-green-50 p-5">
              <h3 class="font-semibold text-green-700 mb-3">Action Items</h3>
              <ul class="space-y-2">
                @for (item of actionItems(); track item) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-green-700 mt-0.5">&#x2713;</span> {{ item }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Resources -->
          @if (resourceLinks().length) {
            <div class="rounded-xl border border-stone-200 bg-white p-5">
              <h3 class="font-semibold text-stone-900 mb-3">Recommended Resources</h3>
              <ul class="space-y-2">
                @for (link of resourceLinks(); track link) {
                  <li class="text-sm text-stone-700 flex items-start gap-2">
                    <span class="text-stone-900 mt-0.5">&#x2192;</span> {{ link }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Chat Messages -->
          @for (msg of chatMessages(); track $index) {
            <div [class]="msg.role === 'mentor'
              ? 'bg-white border border-stone-200 rounded-2xl p-5'
              : 'bg-stone-50 border border-stone-200 rounded-2xl p-5 ml-8'">
              <div class="text-xs font-semibold mb-2" [class]="msg.role === 'mentor' ? 'text-stone-900' : 'text-green-700'">
                {{ msg.role === 'mentor' ? 'Career Mentor' : 'You' }}
              </div>
              <p class="text-stone-700 text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          }

          <!-- Follow-up Input -->
          <div class="space-y-3">
            <textarea [(ngModel)]="followUpMessage" rows="3" placeholder="Ask your career mentor a question..."
              class="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 resize-none"></textarea>
            <div class="flex gap-3">
              <button (click)="sendMessage()" [disabled]="loading() || !followUpMessage"
                class="flex-1 py-3 rounded-xl font-bold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50">
                @if (loading()) { Thinking... } @else { Ask Mentor }
              </button>
              <button (click)="reset()"
                class="px-6 py-3 rounded-xl font-semibold border border-stone-300 text-stone-500 hover:bg-stone-100 transition-all">
                New Session
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CareerMentorComponent {
  private readonly arenaApi = inject(ArenaApiService);

  targetRole = '';
  currentStatus = 'employed';
  experienceLevel = 'mid';
  mainChallenge = '';
  followUpMessage = '';

  readonly loading = signal(false);
  readonly sessionStarted = signal(false);
  readonly sessionId = signal<number | null>(null);
  readonly careerOutlook = signal('');
  readonly actionItems = signal<string[]>([]);
  readonly resourceLinks = signal<string[]>([]);
  readonly chatMessages = signal<{role: string; content: string}[]>([]);

  startMentoring() {
    this.loading.set(true);
    this.arenaApi.startCareerMentor({
      targetRole: this.targetRole,
      currentStatus: this.currentStatus,
      experienceLevel: this.experienceLevel,
      mainChallenge: this.mainChallenge || undefined
    }).subscribe({
      next: (res) => {
        this.sessionId.set(res.sessionId);
        this.sessionStarted.set(true);
        this.careerOutlook.set(res.careerOutlook || '');
        this.actionItems.set(res.actionItems || []);
        this.resourceLinks.set(res.resourceLinks || []);
        if (res.message) {
          this.chatMessages.set([{ role: 'mentor', content: res.message }]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to start mentoring session. Please try again.');
      }
    });
  }

  sendMessage() {
    if (!this.followUpMessage || !this.sessionId()) return;
    this.loading.set(true);

    this.chatMessages.update(msgs => [...msgs, { role: 'user', content: this.followUpMessage }]);
    const msg = this.followUpMessage;
    this.followUpMessage = '';

    this.arenaApi.messageCareerMentor(this.sessionId()!, msg).subscribe({
      next: (res) => {
        if (res.message) {
          this.chatMessages.update(msgs => [...msgs, { role: 'mentor', content: res.message }]);
        }
        if (res.actionItems?.length) {
          this.actionItems.set(res.actionItems);
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
    this.careerOutlook.set('');
    this.actionItems.set([]);
    this.resourceLinks.set([]);
    this.chatMessages.set([]);
    this.followUpMessage = '';
  }
}
