import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModeService } from '../../../core/services/ui-mode.service';

interface SimpleScenario {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-career-stress-test-simple',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-container">
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div class="step" [class.active]="step() >= 1" [class.completed]="step() > 1">1</div>
        <div class="step-line" [class.active]="step() > 1"></div>
        <div class="step" [class.active]="step() >= 2" [class.completed]="step() > 2">2</div>
        <div class="step-line" [class.active]="step() > 2"></div>
        <div class="step" [class.active]="step() >= 3">3</div>
      </div>

      @switch (step()) {
        @case (1) {
          <!-- Step 1: Choose Scenario -->
          <div class="step-content">
            <h1>What keeps you up at night?</h1>
            <p class="subtitle">Choose the career risk that worries you most</p>

            <div class="simple-scenarios">
              @for (scenario of scenarios; track scenario.id) {
                <button
                  class="scenario-btn"
                  [class.selected]="selectedScenario()?.id === scenario.id"
                  (click)="selectScenario(scenario)"
                >
                  <span class="icon">{{ scenario.icon }}</span>
                  <span class="name">{{ scenario.name }}</span>
                </button>
              }
            </div>

            <button
              class="btn-next"
              [disabled]="!selectedScenario()"
              (click)="nextStep()"
            >
              See what would happen →
            </button>
          </div>
        }

        @case (2) {
          <!-- Step 2: Quick Assessment -->
          <div class="step-content">
            <h1>Quick check</h1>
            <p class="subtitle">Answer honestly - no one else will see this</p>

            <div class="quick-questions">
              <div class="question">
                <label>How many months of savings do you have?</label>
                <div class="option-btns">
                  <button
                    [class.selected]="savings() === '0-2'"
                    (click)="setSavings('0-2')"
                  >0-2 months</button>
                  <button
                    [class.selected]="savings() === '3-5'"
                    (click)="setSavings('3-5')"
                  >3-5 months</button>
                  <button
                    [class.selected]="savings() === '6+'"
                    (click)="setSavings('6+')"
                  >6+ months</button>
                </div>
              </div>

              <div class="question">
                <label>When did you last update your resume?</label>
                <div class="option-btns">
                  <button
                    [class.selected]="resumeAge() === 'recent'"
                    (click)="setResumeAge('recent')"
                  >This month</button>
                  <button
                    [class.selected]="resumeAge() === 'old'"
                    (click)="setResumeAge('old')"
                  >This year</button>
                  <button
                    [class.selected]="resumeAge() === 'ancient'"
                    (click)="setResumeAge('ancient')"
                  >Can't remember</button>
                </div>
              </div>
            </div>

            <div class="btn-row">
              <button class="btn-back" (click)="prevStep()">← Back</button>
              <button
                class="btn-next"
                [disabled]="!savings() || !resumeAge()"
                (click)="runSimulation()"
              >
                Show me the truth →
              </button>
            </div>
          </div>
        }

        @case (3) {
          <!-- Step 3: Results -->
          <div class="step-content results">
            <div class="result-header" [attr.data-level]="readinessLevel()">
              <div class="score-ring">
                <span class="score">{{ readinessScore() }}%</span>
              </div>
              <div class="result-text">
                <h2>{{ getReadinessTitle() }}</h2>
                <p>{{ getReadinessMessage() }}</p>
              </div>
            </div>

            <div class="key-insight">
              <span class="insight-icon">💡</span>
              <p>{{ getKeyInsight() }}</p>
            </div>

            <div class="action-cards">
              <h3>Your top 3 actions</h3>
              @for (action of topActions(); track action.title; let i = $index) {
                <div class="action-card">
                  <span class="action-num">{{ i + 1 }}</span>
                  <div class="action-content">
                    <h4>{{ action.title }}</h4>
                    <p>{{ action.description }}</p>
                  </div>
                </div>
              }
            </div>

            <div class="btn-row">
              <button class="btn-back" (click)="reset()">← Start over</button>
              <button class="btn-advanced" (click)="switchToAdvanced()">
                See detailed analysis →
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .simple-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 3rem;
    }

    .step {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #64748b;
      transition: all 0.3s;
    }

    .step.active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    .step.completed {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }

    .step-line {
      width: 60px;
      height: 2px;
      background: rgba(255,255,255,0.1);
      transition: background 0.3s;
    }

    .step-line.active {
      background: #10b981;
    }

    .step-content {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }

    h1 {
      font-size: 2rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #64748b;
      margin-bottom: 2.5rem;
    }

    .simple-scenarios {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .scenario-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.03);
      border: 2px solid rgba(255,255,255,0.1);
      padding: 1.25rem 1.5rem;
      border-radius: 12px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .scenario-btn:hover {
      border-color: rgba(16, 185, 129, 0.5);
      background: rgba(16, 185, 129, 0.05);
    }

    .scenario-btn.selected {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .scenario-btn .icon {
      font-size: 2rem;
    }

    .scenario-btn .name {
      font-size: 1.125rem;
      font-weight: 500;
    }

    .btn-next, .btn-back, .btn-advanced {
      padding: 1rem 2rem;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-next {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: white;
      width: 100%;
    }

    .btn-next:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-next:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
    }

    .btn-back {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      color: #94a3b8;
    }

    .btn-advanced {
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.5);
      color: #c4b5fd;
    }

    .btn-row {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    /* Quick Questions */
    .quick-questions {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .question {
      text-align: left;
    }

    .question label {
      display: block;
      color: #e2e8f0;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .option-btns {
      display: flex;
      gap: 0.75rem;
    }

    .option-btns button {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      padding: 0.875rem 1rem;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-btns button:hover {
      border-color: rgba(255,255,255,0.3);
    }

    .option-btns button.selected {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #10b981;
    }

    /* Results */
    .results {
      text-align: left;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .result-header[data-level="high"] {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .result-header[data-level="medium"] {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .result-header[data-level="low"] {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .score-ring {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .score {
      font-size: 1.5rem;
      font-weight: bold;
      color: #f1f5f9;
    }

    .result-text h2 {
      font-size: 1.25rem;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .result-text p {
      color: #94a3b8;
      font-size: 0.95rem;
    }

    .key-insight {
      display: flex;
      gap: 1rem;
      background: rgba(139, 92, 246, 0.1);
      border-left: 4px solid #8b5cf6;
      padding: 1rem 1.25rem;
      border-radius: 0 12px 12px 0;
      margin-bottom: 2rem;
    }

    .insight-icon {
      font-size: 1.5rem;
    }

    .key-insight p {
      color: #e2e8f0;
      font-size: 1rem;
      line-height: 1.5;
    }

    .action-cards h3 {
      color: #f1f5f9;
      font-size: 1.125rem;
      margin-bottom: 1rem;
    }

    .action-card {
      display: flex;
      gap: 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 0.75rem;
    }

    .action-num {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f59e0b;
      color: #0a0f1a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
    }

    .action-content h4 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .action-content p {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    @media (max-width: 600px) {
      .option-btns {
        flex-direction: column;
      }

      .result-header {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class CareerStressTestSimpleComponent {
  private uiMode = inject(UiModeService);

  scenarios: SimpleScenario[] = [
    { id: 'layoff', name: 'Getting laid off suddenly', icon: '📦', description: '' },
    { id: 'ai-disruption', name: 'AI making my skills obsolete', icon: '🤖', description: '' },
    { id: 'market-crash', name: 'Tech market crash/recession', icon: '📉', description: '' }
  ];

  step = signal(1);
  selectedScenario = signal<SimpleScenario | null>(null);
  savings = signal<string>('');
  resumeAge = signal<string>('');
  readinessScore = signal(0);

  selectScenario(scenario: SimpleScenario) {
    this.selectedScenario.set(scenario);
  }

  setSavings(value: string) {
    this.savings.set(value);
  }

  setResumeAge(value: string) {
    this.resumeAge.set(value);
  }

  nextStep() {
    this.step.update(s => s + 1);
  }

  prevStep() {
    this.step.update(s => s - 1);
  }

  runSimulation() {
    // Calculate simple readiness score
    let score = 50;

    if (this.savings() === '6+') score += 25;
    else if (this.savings() === '3-5') score += 10;
    else score -= 10;

    if (this.resumeAge() === 'recent') score += 15;
    else if (this.resumeAge() === 'old') score += 5;
    else score -= 5;

    this.readinessScore.set(Math.min(100, Math.max(0, score)));
    this.step.set(3);
  }

  readinessLevel(): string {
    const score = this.readinessScore();
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  getReadinessTitle(): string {
    const level = this.readinessLevel();
    if (level === 'high') return 'You\'re reasonably prepared';
    if (level === 'medium') return 'Some gaps to address';
    return 'Action needed';
  }

  getReadinessMessage(): string {
    const level = this.readinessLevel();
    const scenario = this.selectedScenario()?.name?.toLowerCase() || 'this scenario';

    if (level === 'high') {
      return `If ${scenario} happened tomorrow, you'd have a buffer. But there's room to strengthen your position.`;
    }
    if (level === 'medium') {
      return `You'd survive ${scenario}, but it would be stressful. A few changes now can make a big difference.`;
    }
    return `${scenario.charAt(0).toUpperCase() + scenario.slice(1)} would hit you hard. Let's fix that.`;
  }

  getKeyInsight(): string {
    const scenario = this.selectedScenario()?.id;
    const insights: Record<string, string> = {
      'layoff': 'The average job search in tech takes 3-4 months. Your emergency fund is your runway.',
      'ai-disruption': 'AI won\'t replace you directly - but someone using AI might. The skill gap is adaptation speed.',
      'market-crash': 'Recessions hit differently by role. Essential skills survive; nice-to-have skills get cut first.'
    };
    return insights[scenario || 'layoff'];
  }

  topActions(): Array<{ title: string; description: string }> {
    const actions: Array<{ title: string; description: string }> = [];

    if (this.savings() !== '6+') {
      actions.push({
        title: 'Build 6-month emergency fund',
        description: 'Automate transfers to a separate savings account. Start with what you can.'
      });
    }

    if (this.resumeAge() !== 'recent') {
      actions.push({
        title: 'Update your resume this week',
        description: 'Add recent achievements. Use numbers. Keep it ready to send.'
      });
    }

    actions.push({
      title: 'Reconnect with 3 people',
      description: 'Reach out to former colleagues. Coffee chat, no ask. Build before you need.'
    });

    if (this.selectedScenario()?.id === 'ai-disruption') {
      actions.push({
        title: 'Learn one AI tool deeply',
        description: 'Pick one relevant to your work. Become the person others ask for help.'
      });
    }

    return actions.slice(0, 3);
  }

  switchToAdvanced() {
    this.uiMode.setMode('advanced');
  }

  reset() {
    this.step.set(1);
    this.selectedScenario.set(null);
    this.savings.set('');
    this.resumeAge.set('');
  }
}
