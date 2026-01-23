import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiModeService } from '../../../core/services/ui-mode.service';

interface SimpleTruth {
  truth: string;
  action: string;
  severity: 'yellow' | 'red';
}

@Component({
  selector: 'app-brutal-truth-machine-simple',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="simple-container">
      @if (!showResults()) {
        <!-- Input Step -->
        <div class="input-step">
          <div class="header">
            <span class="icon">🪞</span>
            <h1>Quick Career Check</h1>
            <p>3 questions. Honest answers. Real feedback.</p>
          </div>

          <div class="questions">
            <div class="question">
              <label>What's your current role?</label>
              <input
                type="text"
                [(ngModel)]="currentRole"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div class="question">
              <label>What role do you want next?</label>
              <input
                type="text"
                [(ngModel)]="targetRole"
                placeholder="e.g., Senior Engineer, Tech Lead"
              />
            </div>

            <div class="question">
              <label>How's your job search going?</label>
              <div class="status-options">
                <button
                  [class.selected]="searchStatus() === 'not-looking'"
                  (click)="setSearchStatus('not-looking')"
                >
                  Not looking
                </button>
                <button
                  [class.selected]="searchStatus() === 'casual'"
                  (click)="setSearchStatus('casual')"
                >
                  Casually browsing
                </button>
                <button
                  [class.selected]="searchStatus() === 'active'"
                  (click)="setSearchStatus('active')"
                >
                  Actively searching
                </button>
                <button
                  [class.selected]="searchStatus() === 'struggling'"
                  (click)="setSearchStatus('struggling')"
                >
                  Struggling (3+ months)
                </button>
              </div>
            </div>
          </div>

          <div class="consent">
            <label>
              <input type="checkbox" [(ngModel)]="consentGiven" />
              <span>I want honest feedback, even if uncomfortable</span>
            </label>
          </div>

          <button
            class="btn-analyze"
            [disabled]="!canAnalyze()"
            (click)="analyze()"
          >
            @if (isAnalyzing()) {
              <span class="spinner"></span>
              Analyzing...
            } @else {
              Show me the truth →
            }
          </button>
        </div>
      } @else {
        <!-- Results Step -->
        <div class="results-step">
          <button class="btn-back" (click)="reset()">← Start over</button>

          <div class="result-summary" [attr.data-level]="overallLevel()">
            <h2>{{ getOverallTitle() }}</h2>
            <p>{{ getOverallMessage() }}</p>
          </div>

          <div class="truths-list">
            @for (truth of truths(); track truth.truth; let i = $index) {
              <div class="truth-item" [attr.data-severity]="truth.severity">
                <div class="truth-content">
                  <p class="truth-text">{{ truth.truth }}</p>
                  <p class="action-text">→ {{ truth.action }}</p>
                </div>
              </div>
            }
          </div>

          <div class="good-news" *ngIf="positives().length > 0">
            <h3>✨ What's working</h3>
            @for (positive of positives(); track positive) {
              <div class="positive-item">{{ positive }}</div>
            }
          </div>

          <div class="cta-section">
            <p>Want the full breakdown with 10+ personalized insights?</p>
            <button class="btn-advanced" (click)="switchToAdvanced()">
              Get detailed analysis →
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .simple-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%);
      padding: 2rem;
      display: flex;
      justify-content: center;
    }

    .input-step, .results-step {
      max-width: 500px;
      width: 100%;
    }

    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .header .icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .header h1 {
      font-size: 2rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #64748b;
    }

    .questions {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .question label {
      display: block;
      color: #e2e8f0;
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .question input[type="text"] {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 1rem;
      color: #f1f5f9;
      font-size: 1rem;
    }

    .question input:focus {
      outline: none;
      border-color: #ef4444;
    }

    .status-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .status-options button {
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      padding: 0.875rem;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .status-options button:hover {
      border-color: rgba(255,255,255,0.3);
    }

    .status-options button.selected {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #fca5a5;
    }

    .consent {
      margin-bottom: 1.5rem;
    }

    .consent label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #94a3b8;
      cursor: pointer;
    }

    .consent input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #ef4444;
    }

    .btn-analyze {
      width: 100%;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none;
      padding: 1.125rem;
      border-radius: 10px;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.2s;
    }

    .btn-analyze:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-analyze:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Results */
    .btn-back {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      margin-bottom: 1.5rem;
    }

    .result-summary {
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: center;
    }

    .result-summary[data-level="good"] {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .result-summary[data-level="warning"] {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .result-summary[data-level="critical"] {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .result-summary h2 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .result-summary p {
      color: #94a3b8;
    }

    .truths-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .truth-item {
      background: rgba(255,255,255,0.02);
      border-radius: 12px;
      padding: 1.25rem;
      border-left: 4px solid;
    }

    .truth-item[data-severity="yellow"] {
      border-left-color: #f59e0b;
    }

    .truth-item[data-severity="red"] {
      border-left-color: #ef4444;
    }

    .truth-text {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.75rem;
      line-height: 1.5;
    }

    .action-text {
      color: #10b981;
      font-size: 0.9rem;
    }

    .good-news {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }

    .good-news h3 {
      color: #10b981;
      font-size: 1rem;
      margin-bottom: 1rem;
    }

    .positive-item {
      color: #a7f3d0;
      font-size: 0.95rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(16, 185, 129, 0.1);
    }

    .positive-item:last-child {
      border-bottom: none;
    }

    .cta-section {
      text-align: center;
      padding: 1.5rem;
      background: rgba(139, 92, 246, 0.1);
      border-radius: 12px;
    }

    .cta-section p {
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .btn-advanced {
      background: #8b5cf6;
      border: none;
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-advanced:hover {
      background: #7c3aed;
    }
  `]
})
export class BrutalTruthMachineSimpleComponent {
  private uiMode = inject(UiModeService);

  currentRole = '';
  targetRole = '';
  searchStatus = signal<string>('');
  consentGiven = false;
  isAnalyzing = signal(false);
  showResults = signal(false);
  truths = signal<SimpleTruth[]>([]);
  positives = signal<string[]>([]);

  setSearchStatus(status: string) {
    this.searchStatus.set(status);
  }

  canAnalyze(): boolean {
    return this.currentRole.length > 0 &&
           this.searchStatus() !== '' &&
           this.consentGiven;
  }

  analyze() {
    this.isAnalyzing.set(true);

    setTimeout(() => {
      const generatedTruths: SimpleTruth[] = [];
      const generatedPositives: string[] = [];

      // Search status based truths
      if (this.searchStatus() === 'struggling') {
        generatedTruths.push({
          truth: 'If you\'ve been searching 3+ months, something fundamental isn\'t working. It\'s not bad luck.',
          action: 'Get external feedback on your resume and interview approach. Fresh eyes see what you can\'t.',
          severity: 'red'
        });
      }

      if (this.searchStatus() === 'active') {
        generatedTruths.push({
          truth: 'Active job searching while employed is exhausting. Most people burn out before getting offers.',
          action: 'Set boundaries: max 5 applications/week, 2 interview processes at once. Quality beats quantity.',
          severity: 'yellow'
        });
      }

      // Role transition truths
      if (this.targetRole && this.currentRole) {
        const target = this.targetRole.toLowerCase();
        const current = this.currentRole.toLowerCase();

        if ((target.includes('lead') || target.includes('manager') || target.includes('senior')) &&
            !current.includes('senior') && !current.includes('lead')) {
          generatedTruths.push({
            truth: `Jumping from ${this.currentRole} to ${this.targetRole} is a 2-level skip. Most companies won\'t take that risk on an external hire.`,
            action: 'Target the intermediate level, or build undeniable proof (side projects, open source leadership).',
            severity: 'red'
          });
        }
      }

      // General truths
      if (this.searchStatus() !== 'not-looking') {
        generatedTruths.push({
          truth: 'Your resume probably reads like a job description ("responsible for...") instead of an achievement list.',
          action: 'Add one specific number to every bullet point. Impact > responsibilities.',
          severity: 'yellow'
        });
      }

      // Positives
      if (this.currentRole) {
        generatedPositives.push('You have a clear current role to build from');
      }
      if (this.targetRole) {
        generatedPositives.push('You have a target direction - that\'s more clarity than most');
      }
      if (this.searchStatus() === 'not-looking') {
        generatedPositives.push('Not being desperate gives you negotiating power');
      }
      generatedPositives.push('Seeking honest feedback puts you ahead of 90% of candidates');

      this.truths.set(generatedTruths);
      this.positives.set(generatedPositives);
      this.isAnalyzing.set(false);
      this.showResults.set(true);
    }, 1500);
  }

  overallLevel(): string {
    const redCount = this.truths().filter(t => t.severity === 'red').length;
    if (redCount >= 2) return 'critical';
    if (redCount >= 1) return 'warning';
    return 'good';
  }

  getOverallTitle(): string {
    const level = this.overallLevel();
    if (level === 'critical') return 'Some hard truths here';
    if (level === 'warning') return 'A few things to address';
    return 'You\'re on a decent path';
  }

  getOverallMessage(): string {
    const level = this.overallLevel();
    if (level === 'critical') return 'Don\'t panic - everything here is fixable. But action is needed.';
    if (level === 'warning') return 'Minor adjustments can make a big difference. Start with the first item.';
    return 'Keep doing what you\'re doing, and consider the tweaks below.';
  }

  switchToAdvanced() {
    this.uiMode.setMode('advanced');
  }

  reset() {
    this.currentRole = '';
    this.targetRole = '';
    this.searchStatus.set('');
    this.consentGiven = false;
    this.showResults.set(false);
    this.truths.set([]);
    this.positives.set([]);
  }
}
