import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  SessionApiService,
  SessionResponse,
  MockInterviewStartResponse,
  MockInterviewRespondResponse,
  MockInterviewSummary,
  BlockerResolution
} from '../../core/services/session-api.service';

type Phase = 'loading' | 'context' | 'interview' | 'summary';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-10">

      <!-- Loading -->
      @if (phase() === 'loading') {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      <!-- Context screen: show what we know before starting -->
      @if (phase() === 'context' && session()) {
        <div class="space-y-6">
          <div>
            <a [routerLink]="['/session', session()!.id]"
              class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to assessment
            </a>
            <h1 class="text-3xl font-bold text-white">Mock Interview</h1>
            <p class="text-slate-400 mt-1">
              Targeted practice based on <span class="text-white font-medium">your specific blockers</span>.
            </p>
          </div>

          <!-- Assessment context card -->
          <div class="rounded-2xl border bg-slate-900/80 p-6 space-y-4"
            [class]="session()!.status === 'RED' ? 'border-red-500/30' : session()!.status === 'GREEN' ? 'border-emerald-500/30' : 'border-amber-500/30'">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full"
                [class]="session()!.status === 'RED' ? 'bg-red-500' : session()!.status === 'GREEN' ? 'bg-emerald-500' : 'bg-amber-500'"></div>
              <span class="font-semibold text-white">{{ session()!.targetRole }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold"
                [class]="session()!.status === 'RED' ? 'bg-red-500/20 text-red-300' : session()!.status === 'GREEN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'">
                {{ session()!.status }}
              </span>
            </div>
            <p class="text-sm text-slate-400">
              This interview is customised for your assessment. Each question is designed to
              target a specific blocker we identified.
            </p>
          </div>

          <!-- Blocker targets -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Questions will target these blockers
            </h2>
            <div class="space-y-3">
              @for (blocker of session()!.blockers; track $index; let i = $index) {
                <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60">
                  <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-300">
                    {{ i + 1 }}
                  </div>
                  <span class="text-sm text-slate-300">{{ blocker }}</span>
                </div>
              }
            </div>
          </div>

          <!-- How it works -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">How it works</h2>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold text-white mb-1">5</div>
                <div class="text-xs text-slate-400">Questions</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-white mb-1">3</div>
                <div class="text-xs text-slate-400">Blockers targeted</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-white mb-1">AI</div>
                <div class="text-xs text-slate-400">Live feedback</div>
              </div>
            </div>
          </div>

          <button (click)="startInterview()" [disabled]="loading()"
            class="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg hover:shadow-emerald-500/40 transition-all disabled:opacity-50">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                Generating your questions...
              </span>
            } @else {
              Start Interview
            }
          </button>
        </div>
      }

      <!-- Interview phase -->
      @if (phase() === 'interview') {
        <div class="space-y-6">
          <!-- Header with progress -->
          <div>
            <a [routerLink]="['/session', sessionId()]"
              class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Exit interview
            </a>
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-slate-400">Question {{ currentQuestionNum() }} of {{ totalQuestions() }}</span>
              <span class="text-sm font-medium"
                [class]="targetedBlockerLabel() ? 'text-amber-400' : 'text-slate-500'">
                @if (targetedBlockerLabel()) {
                  <span class="flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"/>
                    </svg>
                    Targeting blocker #{{ blockerIndex() + 1 }}
                  </span>
                } @else {
                  Warm-up question
                }
              </span>
            </div>
            <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                [style.width.%]="progressPct()"></div>
            </div>
          </div>

          <!-- Targeted blocker highlight -->
          @if (targetedBlockerLabel()) {
            <div class="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-start gap-2">
              <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <p class="text-xs text-amber-300">
                <span class="font-semibold">Blocker targeted:</span> {{ targetedBlockerLabel() }}
              </p>
            </div>
          }

          <!-- Message history -->
          <div class="space-y-3">
            @for (msg of messages(); track $index) {
              <div [class]="msg.role === 'interviewer'
                ? 'bg-slate-900/80 border border-slate-800 rounded-2xl p-5'
                : 'bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-5 ml-6'">
                <div class="text-xs font-semibold mb-2"
                  [class]="msg.role === 'interviewer' ? 'text-cyan-400' : 'text-emerald-400'">
                  {{ msg.role === 'interviewer' ? 'Interviewer' : 'You' }}
                </div>
                <p class="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
              </div>

              <!-- Inline feedback after candidate answer -->
              @if (msg.role === 'candidate' && msg.feedback) {
                <div class="ml-6 rounded-xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 space-y-1">
                  <div class="text-xs font-semibold text-slate-400">Feedback</div>
                  <p class="text-xs text-slate-300">{{ msg.feedback }}</p>
                  @if (msg.blockerFeedback) {
                    <p class="text-xs mt-1"
                      [class]="msg.blockerFeedback.startsWith('Addressed') ? 'text-emerald-400' : msg.blockerFeedback.startsWith('Partially') ? 'text-amber-400' : 'text-red-400'">
                      {{ msg.blockerFeedback }}
                    </p>
                  }
                </div>
              }
            }

            <!-- Loading indicator -->
            @if (loading()) {
              <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                <div class="text-xs font-semibold text-cyan-400 mb-2">Interviewer</div>
                <div class="flex gap-1.5 items-center py-1">
                  <span class="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span class="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span class="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            }
          </div>

          <!-- Answer input -->
          @if (!loading()) {
            <div class="space-y-3">
              <textarea [(ngModel)]="currentAnswer" rows="5"
                placeholder="Type your answer here. Be specific — use concrete examples from your experience."
                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none text-sm leading-relaxed"></textarea>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500">
                  Tip: Use the STAR format — Situation, Task, Action, Result
                </span>
                <button (click)="submitAnswer()" [disabled]="!currentAnswer.trim()"
                  class="px-6 py-2.5 rounded-xl font-semibold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  Submit Answer
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Summary phase -->
      @if (phase() === 'summary' && summary()) {
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-white">Interview Complete</h1>
            <p class="text-slate-400 mt-1">Here's how you addressed your blockers.</p>
          </div>

          <!-- Overall score -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
            <div class="text-7xl font-bold mb-2 tabular-nums"
              [class]="summary()!.overallScore >= 70 ? 'text-emerald-400' : summary()!.overallScore >= 50 ? 'text-amber-400' : 'text-red-400'">
              {{ summary()!.overallScore }}
            </div>
            <div class="text-slate-400 mb-3">Overall Score</div>
            <span class="px-4 py-1.5 rounded-full text-sm font-bold"
              [class]="verdictClass(summary()!.verdict)">
              {{ formatVerdict(summary()!.verdict) }}
            </span>
          </div>

          <!-- Blocker Resolution Report ← THE UNIQUE PART -->
          <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 class="text-lg font-bold text-white mb-4">Blocker Resolution Report</h2>
            <div class="space-y-3">
              @for (res of summary()!.blockerResolutions; track $index) {
                <div class="flex items-start gap-4 p-4 rounded-xl"
                  [class]="res.resolution === 'ADDRESSED' ? 'bg-emerald-950/30 border border-emerald-900/40' : res.resolution === 'PARTIAL' ? 'bg-amber-950/30 border border-amber-900/40' : 'bg-red-950/30 border border-red-900/40'">
                  <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    [class]="res.resolution === 'ADDRESSED' ? 'bg-emerald-500/20 text-emerald-400' : res.resolution === 'PARTIAL' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'">
                    @if (res.resolution === 'ADDRESSED') { ✓ }
                    @else if (res.resolution === 'PARTIAL') { ~ }
                    @else { ✗ }
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-bold uppercase tracking-wide"
                        [class]="res.resolution === 'ADDRESSED' ? 'text-emerald-400' : res.resolution === 'PARTIAL' ? 'text-amber-400' : 'text-red-400'">
                        {{ res.resolution }}
                      </span>
                    </div>
                    <p class="text-sm text-slate-300 mb-1">{{ res.blocker }}</p>
                    @if (res.note) {
                      <p class="text-xs text-slate-500">{{ res.note }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Strengths & Weaknesses -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
              <h3 class="font-semibold text-emerald-400 mb-3">Strengths</h3>
              <ul class="space-y-2">
                @for (s of summary()!.strengths; track s) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-emerald-400 mt-0.5 flex-shrink-0">+</span> {{ s }}
                  </li>
                }
              </ul>
            </div>
            <div class="rounded-xl border border-red-900/50 bg-red-950/20 p-5">
              <h3 class="font-semibold text-red-400 mb-3">Areas to Improve</h3>
              <ul class="space-y-2">
                @for (w of summary()!.weaknesses; track w) {
                  <li class="text-sm text-slate-300 flex items-start gap-2">
                    <span class="text-red-400 mt-0.5 flex-shrink-0">–</span> {{ w }}
                  </li>
                }
              </ul>
            </div>
          </div>

          <!-- Improvement plan -->
          @if (summary()!.improvementPlan) {
            <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 class="font-semibold text-white mb-2">Next Steps</h3>
              <p class="text-sm text-slate-300 leading-relaxed">{{ summary()!.improvementPlan }}</p>
            </div>
          }

          <!-- Actions -->
          <div class="flex gap-3">
            <button (click)="restart()"
              class="flex-1 py-3 rounded-xl font-semibold bg-emerald-500 text-slate-900 hover:bg-emerald-400 transition-all text-sm">
              Practice Again
            </button>
            <a [routerLink]="['/session', sessionId()]"
              class="flex-1 py-3 rounded-xl font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all text-sm text-center">
              Back to Plan
            </a>
          </div>
        </div>
      }
    </div>
  `
})
export class MockInterviewComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly api     = inject(SessionApiService);

  readonly sessionId       = signal<number>(0);
  readonly session         = signal<SessionResponse | null>(null);
  readonly phase           = signal<Phase>('loading');
  readonly loading         = signal(false);

  readonly arenaSessionId  = signal<number | null>(null);
  readonly currentQuestionNum = signal(1);
  readonly totalQuestions  = signal(5);
  readonly targetedBlockerLabel = signal<string | null>(null);
  readonly messages        = signal<Array<{
    role: 'interviewer' | 'candidate';
    content: string;
    feedback?: string;
    blockerFeedback?: string;
  }>>([]);
  readonly summary         = signal<MockInterviewSummary | null>(null);

  currentAnswer = '';

  readonly progressPct = computed(() =>
    ((this.currentQuestionNum() - 1) / this.totalQuestions()) * 100
  );

  readonly blockerIndex = computed(() => {
    const label = this.targetedBlockerLabel();
    if (!label || !this.session()) return -1;
    return this.session()!.blockers.indexOf(label);
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.sessionId.set(id);
    this.api.getSession(id).subscribe({
      next: (s) => {
        this.session.set(s);
        this.phase.set('context');
      },
      error: () => this.router.navigate(['/'])
    });
  }

  startInterview() {
    this.loading.set(true);
    this.api.startMockInterview(this.sessionId()).subscribe({
      next: (res: MockInterviewStartResponse) => {
        this.arenaSessionId.set(res.arenaSessionId);
        this.currentQuestionNum.set(res.questionNumber);
        this.totalQuestions.set(res.totalQuestions);
        this.targetedBlockerLabel.set(res.targetedBlocker);
        this.messages.set([{ role: 'interviewer', content: res.question }]);
        this.phase.set('interview');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Could not start interview. Please try again.');
      }
    });
  }

  submitAnswer() {
    const answer = this.currentAnswer.trim();
    if (!answer || !this.arenaSessionId()) return;

    this.loading.set(true);
    this.currentAnswer = '';

    // Optimistically add answer to message list (feedback appended after response)
    const answerIndex = this.messages().length;
    this.messages.update(msgs => [...msgs, { role: 'candidate', content: answer }]);

    this.api.respondMockInterview(
      this.sessionId(), this.arenaSessionId()!, answer
    ).subscribe({
      next: (res: MockInterviewRespondResponse) => {
        // Attach feedback to the candidate message we just added
        this.messages.update(msgs => {
          const updated = [...msgs];
          updated[answerIndex] = {
            ...updated[answerIndex],
            feedback: res.feedback ?? undefined,
            blockerFeedback: res.blockerFeedback ?? undefined
          };
          return updated;
        });

        if (res.isComplete && res.summary) {
          this.summary.set(res.summary);
          this.phase.set('summary');
        } else if (res.question) {
          this.messages.update(msgs => [...msgs, { role: 'interviewer', content: res.question! }]);
          this.currentQuestionNum.set(res.questionNumber);
          this.targetedBlockerLabel.set(res.targetedBlocker);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        alert('Failed to submit answer. Please try again.');
      }
    });
  }

  restart() {
    this.arenaSessionId.set(null);
    this.messages.set([]);
    this.summary.set(null);
    this.currentAnswer = '';
    this.currentQuestionNum.set(1);
    this.targetedBlockerLabel.set(null);
    this.phase.set('context');
  }

  formatVerdict(verdict: string): string {
    return verdict.split('_').join(' ');
  }

  verdictClass(verdict: string): string {
    if (verdict.includes('STRONG_HIRE')) return 'bg-emerald-500/20 text-emerald-300';
    if (verdict === 'HIRE')              return 'bg-green-500/20 text-green-300';
    if (verdict.includes('LEAN_HIRE'))  return 'bg-yellow-500/20 text-yellow-300';
    if (verdict.includes('NO_HIRE'))    return 'bg-red-500/20 text-red-300';
    return 'bg-slate-500/20 text-slate-300';
  }
}
