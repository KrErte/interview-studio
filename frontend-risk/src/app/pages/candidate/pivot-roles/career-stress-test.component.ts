import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StressScenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  probability: number; // 0-100
  timeframe: string;
}

interface CascadeEffect {
  id: string;
  name: string;
  timing: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation?: string;
}

interface RecoveryPath {
  name: string;
  duration: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'extreme';
  requirements: string[];
  successRate: number;
}

interface ScenarioResult {
  scenario: StressScenario;
  cascadeEffects: CascadeEffect[];
  financialImpact: {
    monthlyBurnRate: number;
    runwayMonths: number;
    totalCostToRecover: number;
  };
  recoveryPaths: RecoveryPath[];
  worstCase: string;
  bestCase: string;
  yourReadiness: number; // 0-100
}

@Component({
  selector: 'app-career-stress-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stress-container">
      <div class="header">
        <h1>🔬 Career Stress Test</h1>
        <p>Like a bank stress test, but for your career. See how you'd survive different scenarios.</p>
      </div>

      @if (!activeResult()) {
        <!-- Scenario Selection -->
        <div class="scenarios-section">
          <h2>Choose a Scenario to Simulate</h2>
          <p class="subtitle">What would happen if...</p>

          <div class="scenarios-grid">
            @for (scenario of scenarios; track scenario.id) {
              <div class="scenario-card" (click)="runSimulation(scenario)">
                <div class="scenario-icon">{{ scenario.icon }}</div>
                <h3>{{ scenario.name }}</h3>
                <p>{{ scenario.description }}</p>
                <div class="scenario-meta">
                  <div class="probability">
                    <span class="label">Probability</span>
                    <div class="prob-bar">
                      <div class="prob-fill" [style.width.%]="scenario.probability"></div>
                    </div>
                    <span class="value">{{ scenario.probability }}%</span>
                  </div>
                  <span class="timeframe">{{ scenario.timeframe }}</span>
                </div>
                <button class="btn-simulate">Simulate →</button>
              </div>
            }
          </div>

          <!-- Quick Stats -->
          <div class="quick-stats">
            <h3>📊 Your Current Resilience Profile</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-value">{{ emergencyFundMonths }}</span>
                <span class="stat-label">Months Emergency Fund</span>
                <span class="stat-status" [attr.data-status]="emergencyFundMonths >= 6 ? 'good' : 'bad'">
                  {{ emergencyFundMonths >= 6 ? '✓ Adequate' : '⚠️ Too Low' }}
                </span>
              </div>
              <div class="stat-card">
                <span class="stat-value">{{ networkStrength }}</span>
                <span class="stat-label">Network Strength Score</span>
                <span class="stat-status" [attr.data-status]="networkStrength >= 60 ? 'good' : 'bad'">
                  {{ networkStrength >= 60 ? '✓ Solid' : '⚠️ Weak' }}
                </span>
              </div>
              <div class="stat-card">
                <span class="stat-value">{{ skillDiversity }}</span>
                <span class="stat-label">Skill Diversity Index</span>
                <span class="stat-status" [attr.data-status]="skillDiversity >= 70 ? 'good' : 'bad'">
                  {{ skillDiversity >= 70 ? '✓ Diverse' : '⚠️ Narrow' }}
                </span>
              </div>
              <div class="stat-card">
                <span class="stat-value">{{ marketDemand }}%</span>
                <span class="stat-label">Current Market Demand</span>
                <span class="stat-status" [attr.data-status]="marketDemand >= 50 ? 'good' : 'bad'">
                  {{ marketDemand >= 50 ? '✓ In Demand' : '⚠️ Softening' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- Simulation Results -->
        <div class="results-section">
          <button class="btn-back" (click)="clearResult()">← Choose Different Scenario</button>

          <div class="result-header">
            <div class="result-icon">{{ activeResult()!.scenario.icon }}</div>
            <div class="result-title">
              <h2>{{ activeResult()!.scenario.name }}</h2>
              <p>Simulation complete. Here's what would happen.</p>
            </div>
            <div class="readiness-score" [attr.data-level]="getReadinessLevel()">
              <span class="score">{{ activeResult()!.yourReadiness }}%</span>
              <span class="label">Readiness</span>
            </div>
          </div>

          <!-- Cascade Timeline -->
          <div class="cascade-section">
            <h3>⚡ Cascade Effects Timeline</h3>
            <p class="section-desc">How this scenario would unfold over time</p>

            <div class="cascade-timeline">
              @for (effect of activeResult()!.cascadeEffects; track effect.id; let i = $index) {
                <div class="cascade-item" [attr.data-impact]="effect.impact">
                  <div class="timeline-marker">
                    <div class="marker-dot"></div>
                    @if (i < activeResult()!.cascadeEffects.length - 1) {
                      <div class="marker-line"></div>
                    }
                  </div>
                  <div class="cascade-content">
                    <div class="cascade-header">
                      <span class="cascade-timing">{{ effect.timing }}</span>
                      <span class="impact-badge" [attr.data-impact]="effect.impact">
                        {{ effect.impact | uppercase }}
                      </span>
                    </div>
                    <h4>{{ effect.name }}</h4>
                    <p>{{ effect.description }}</p>
                    @if (effect.mitigation) {
                      <div class="mitigation">
                        <span class="mitigation-icon">🛡️</span>
                        <span>{{ effect.mitigation }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Financial Impact -->
          <div class="financial-section">
            <h3>💰 Financial Impact Analysis</h3>
            <div class="financial-grid">
              <div class="financial-card burn">
                <span class="card-label">Monthly Burn Rate</span>
                <span class="card-value">\${{ activeResult()!.financialImpact.monthlyBurnRate | number }}</span>
                <span class="card-context">Without income</span>
              </div>
              <div class="financial-card runway" [attr.data-status]="activeResult()!.financialImpact.runwayMonths >= 6 ? 'ok' : 'danger'">
                <span class="card-label">Financial Runway</span>
                <span class="card-value">{{ activeResult()!.financialImpact.runwayMonths }} months</span>
                <span class="card-context">Until savings depleted</span>
              </div>
              <div class="financial-card recovery">
                <span class="card-label">Cost to Recover</span>
                <span class="card-value">\${{ activeResult()!.financialImpact.totalCostToRecover | number }}</span>
                <span class="card-context">Total estimated cost</span>
              </div>
            </div>
          </div>

          <!-- Recovery Paths -->
          <div class="recovery-section">
            <h3>🛤️ Recovery Paths</h3>
            <p class="section-desc">Your options for getting back on track</p>

            <div class="recovery-grid">
              @for (path of activeResult()!.recoveryPaths; track path.name) {
                <div class="recovery-card" [attr.data-difficulty]="path.difficulty">
                  <div class="recovery-header">
                    <h4>{{ path.name }}</h4>
                    <span class="difficulty-badge">{{ path.difficulty | titlecase }}</span>
                  </div>
                  <div class="recovery-stats">
                    <div class="stat">
                      <span class="stat-label">Duration</span>
                      <span class="stat-value">{{ path.duration }}</span>
                    </div>
                    <div class="stat">
                      <span class="stat-label">Success Rate</span>
                      <span class="stat-value">{{ path.successRate }}%</span>
                    </div>
                  </div>
                  <div class="requirements">
                    <span class="req-label">Requirements:</span>
                    <ul>
                      @for (req of path.requirements; track req) {
                        <li>{{ req }}</li>
                      }
                    </ul>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Best/Worst Case -->
          <div class="outcomes-section">
            <div class="outcome worst">
              <h4>😰 Worst Case Scenario</h4>
              <p>{{ activeResult()!.worstCase }}</p>
            </div>
            <div class="outcome best">
              <h4>🌟 Best Case Scenario</h4>
              <p>{{ activeResult()!.bestCase }}</p>
            </div>
          </div>

          <!-- Action Items -->
          <div class="actions-section">
            <h3>🎯 Prepare Now (Before It Happens)</h3>
            <div class="action-list">
              <div class="action-item">
                <span class="action-number">1</span>
                <div class="action-content">
                  <h4>Build Emergency Fund</h4>
                  <p>Target 6 months of expenses minimum. You currently have {{ emergencyFundMonths }} months.</p>
                </div>
              </div>
              <div class="action-item">
                <span class="action-number">2</span>
                <div class="action-content">
                  <h4>Strengthen Network Now</h4>
                  <p>Reach out to 3 people per week. Build relationships before you need them.</p>
                </div>
              </div>
              <div class="action-item">
                <span class="action-number">3</span>
                <div class="action-content">
                  <h4>Keep Skills Current</h4>
                  <p>Diversify beyond your current stack. Have at least one marketable backup skill.</p>
                </div>
              </div>
              <div class="action-item">
                <span class="action-number">4</span>
                <div class="action-content">
                  <h4>Document Achievements</h4>
                  <p>Keep a running list of accomplishments. You'll need them for interviews.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Mock Button -->
      <button class="mock-btn" (click)="runMockSimulation()" title="Quick simulation">
        🧪 Mock
      </button>
    </div>
  `,
  styles: [`
    .stress-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%);
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .header h1 {
      font-size: 2.5rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #64748b;
      font-size: 1.125rem;
    }

    /* Scenarios Section */
    .scenarios-section {
      max-width: 1200px;
      margin: 0 auto;
    }

    .scenarios-section h2 {
      color: #f1f5f9;
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #64748b;
      text-align: center;
      margin-bottom: 2rem;
    }

    .scenarios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .scenario-card {
      background: rgba(255,255,255,0.02);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s;
    }

    .scenario-card:hover {
      border-color: #f59e0b;
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(245, 158, 11, 0.15);
    }

    .scenario-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .scenario-card h3 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .scenario-card p {
      color: #94a3b8;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .scenario-meta {
      margin-bottom: 1rem;
    }

    .probability {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .probability .label {
      color: #64748b;
      font-size: 0.75rem;
      width: 70px;
    }

    .prob-bar {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .prob-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
      transition: width 0.3s;
    }

    .probability .value {
      color: #f59e0b;
      font-size: 0.875rem;
      font-weight: 600;
      width: 40px;
      text-align: right;
    }

    .timeframe {
      color: #64748b;
      font-size: 0.75rem;
    }

    .btn-simulate {
      width: 100%;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
      padding: 0.875rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      opacity: 0;
      transition: all 0.3s;
    }

    .scenario-card:hover .btn-simulate {
      opacity: 1;
    }

    /* Quick Stats */
    .quick-stats {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 2rem;
    }

    .quick-stats h3 {
      color: #f1f5f9;
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 1.25rem;
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      display: block;
      color: #64748b;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }

    .stat-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .stat-status[data-status="good"] {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .stat-status[data-status="bad"] {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    /* Results Section */
    .results-section {
      max-width: 1000px;
      margin: 0 auto;
    }

    .btn-back {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
    }

    .result-icon {
      font-size: 4rem;
    }

    .result-title {
      flex: 1;
    }

    .result-title h2 {
      color: #f1f5f9;
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }

    .result-title p {
      color: #64748b;
    }

    .readiness-score {
      text-align: center;
      padding: 1rem 1.5rem;
      border-radius: 12px;
    }

    .readiness-score[data-level="high"] { background: rgba(16, 185, 129, 0.2); }
    .readiness-score[data-level="medium"] { background: rgba(245, 158, 11, 0.2); }
    .readiness-score[data-level="low"] { background: rgba(239, 68, 68, 0.2); }

    .readiness-score .score {
      display: block;
      font-size: 2rem;
      font-weight: bold;
      color: #f1f5f9;
    }

    .readiness-score .label {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    /* Cascade Timeline */
    .cascade-section,
    .financial-section,
    .recovery-section,
    .actions-section {
      margin-bottom: 2rem;
    }

    .cascade-section h3,
    .financial-section h3,
    .recovery-section h3,
    .actions-section h3 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .section-desc {
      color: #64748b;
      margin-bottom: 1.5rem;
    }

    .cascade-timeline {
      display: flex;
      flex-direction: column;
    }

    .cascade-item {
      display: flex;
      gap: 1.5rem;
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 20px;
    }

    .marker-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #f59e0b;
      border: 3px solid #1a1a2e;
    }

    .cascade-item[data-impact="critical"] .marker-dot { background: #ef4444; }
    .cascade-item[data-impact="high"] .marker-dot { background: #f59e0b; }
    .cascade-item[data-impact="medium"] .marker-dot { background: #3b82f6; }
    .cascade-item[data-impact="low"] .marker-dot { background: #10b981; }

    .marker-line {
      width: 2px;
      flex: 1;
      background: rgba(255,255,255,0.1);
      min-height: 40px;
    }

    .cascade-content {
      flex: 1;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }

    .cascade-item[data-impact="critical"] .cascade-content {
      border-left: 4px solid #ef4444;
    }

    .cascade-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .cascade-timing {
      color: #64748b;
      font-size: 0.8rem;
    }

    .impact-badge {
      font-size: 0.65rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .impact-badge[data-impact="critical"] { background: #ef4444; color: white; }
    .impact-badge[data-impact="high"] { background: #f59e0b; color: black; }
    .impact-badge[data-impact="medium"] { background: #3b82f6; color: white; }
    .impact-badge[data-impact="low"] { background: #10b981; color: white; }

    .cascade-content h4 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .cascade-content p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .mitigation {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      font-size: 0.85rem;
      color: #a7f3d0;
    }

    /* Financial Section */
    .financial-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .financial-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }

    .financial-card .card-label {
      display: block;
      color: #64748b;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }

    .financial-card .card-value {
      display: block;
      font-size: 1.75rem;
      font-weight: bold;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .financial-card .card-context {
      color: #64748b;
      font-size: 0.75rem;
    }

    .financial-card.burn { border-left: 4px solid #ef4444; }
    .financial-card.runway[data-status="ok"] { border-left: 4px solid #10b981; }
    .financial-card.runway[data-status="danger"] { border-left: 4px solid #ef4444; }
    .financial-card.recovery { border-left: 4px solid #f59e0b; }

    /* Recovery Section */
    .recovery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .recovery-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .recovery-card[data-difficulty="easy"] { border-top: 3px solid #10b981; }
    .recovery-card[data-difficulty="moderate"] { border-top: 3px solid #3b82f6; }
    .recovery-card[data-difficulty="hard"] { border-top: 3px solid #f59e0b; }
    .recovery-card[data-difficulty="extreme"] { border-top: 3px solid #ef4444; }

    .recovery-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .recovery-header h4 {
      color: #f1f5f9;
      font-size: 1rem;
    }

    .difficulty-badge {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: rgba(255,255,255,0.1);
      color: #94a3b8;
    }

    .recovery-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .recovery-stats .stat {
      display: flex;
      flex-direction: column;
    }

    .recovery-stats .stat-label {
      color: #64748b;
      font-size: 0.7rem;
    }

    .recovery-stats .stat-value {
      color: #f1f5f9;
      font-weight: 600;
    }

    .requirements {
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .req-label {
      color: #64748b;
      font-size: 0.75rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .requirements ul {
      margin: 0;
      padding-left: 1.25rem;
    }

    .requirements li {
      color: #94a3b8;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    /* Outcomes Section */
    .outcomes-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .outcome {
      padding: 1.5rem;
      border-radius: 12px;
    }

    .outcome.worst {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .outcome.best {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .outcome h4 {
      color: #f1f5f9;
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }

    .outcome p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    /* Actions Section */
    .action-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .action-item {
      display: flex;
      gap: 1rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .action-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f59e0b;
      color: black;
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

    .mock-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8b5cf6;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      z-index: 1000;
    }

    @media (max-width: 768px) {
      .financial-grid {
        grid-template-columns: 1fr;
      }

      .outcomes-section {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CareerStressTestComponent {
  // User stats (would come from profile in real app)
  emergencyFundMonths = 3;
  networkStrength = 45;
  skillDiversity = 60;
  marketDemand = 65;

  scenarios: StressScenario[] = [
    {
      id: 'layoff',
      name: 'Sudden Layoff',
      icon: '📦',
      description: 'Your company announces 20% workforce reduction. Your team is affected. You have 2 weeks.',
      probability: 35,
      timeframe: 'Could happen any time'
    },
    {
      id: 'tech-obsolete',
      name: 'Tech Stack Obsolete',
      icon: '🦕',
      description: 'Your primary technology is deprecated. New jobs require skills you don\'t have.',
      probability: 25,
      timeframe: '2-5 year horizon'
    },
    {
      id: 'ai-disruption',
      name: 'AI Takes Your Tasks',
      icon: '🤖',
      description: 'AI tools can now do 60% of your daily work. Companies restructure roles.',
      probability: 45,
      timeframe: '1-3 year horizon'
    },
    {
      id: 'bad-reference',
      name: 'Toxic Reference',
      icon: '☠️',
      description: 'A former manager is giving negative references. You don\'t know why interviews fail.',
      probability: 15,
      timeframe: 'Hidden problem'
    },
    {
      id: 'market-crash',
      name: 'Tech Market Crash',
      icon: '📉',
      description: 'Major recession. Tech hiring freezes. 50% fewer open positions.',
      probability: 20,
      timeframe: 'Economic cycle'
    },
    {
      id: 'health-crisis',
      name: 'Extended Health Issue',
      icon: '🏥',
      description: 'Health problem requires 3+ months away from work. Job protection unclear.',
      probability: 10,
      timeframe: 'Life happens'
    }
  ];

  activeResult = signal<ScenarioResult | null>(null);

  runSimulation(scenario: StressScenario) {
    const result = this.generateResult(scenario);
    this.activeResult.set(result);
  }

  generateResult(scenario: StressScenario): ScenarioResult {
    const results: Record<string, ScenarioResult> = {
      'layoff': {
        scenario,
        cascadeEffects: [
          {
            id: 'ce1',
            name: 'Immediate Income Loss',
            timing: 'Day 1',
            impact: 'critical',
            description: 'Salary stops. Severance may cover 2-4 weeks if you\'re lucky.',
            mitigation: 'Negotiate severance. File for unemployment immediately.'
          },
          {
            id: 'ce2',
            name: 'Benefits Termination',
            timing: 'End of Month',
            impact: 'high',
            description: 'Health insurance ends. COBRA costs 3x what you were paying.',
            mitigation: 'Research ACA marketplace options. They\'re often cheaper than COBRA.'
          },
          {
            id: 'ce3',
            name: 'Job Search Begins',
            timing: 'Week 1-2',
            impact: 'medium',
            description: 'Resume needs updating. Linkedin activity spikes (visible to network).',
            mitigation: 'Keep resume updated always. Turn off activity broadcasts.'
          },
          {
            id: 'ce4',
            name: 'Network Activation',
            timing: 'Week 2-4',
            impact: 'medium',
            description: 'Reaching out to contacts. Many won\'t respond. Some will help.',
            mitigation: 'Maintain network relationships BEFORE you need them.'
          },
          {
            id: 'ce5',
            name: 'Interview Fatigue',
            timing: 'Month 2-3',
            impact: 'high',
            description: 'Multiple rounds at multiple companies. Rejection accumulates. Confidence drops.',
            mitigation: 'Set limits: max 3 active processes. Quality over quantity.'
          },
          {
            id: 'ce6',
            name: 'Financial Stress Peak',
            timing: 'Month 3-4',
            impact: 'critical',
            description: 'Savings depleting. May need to accept lower offer or widen search.',
            mitigation: 'Define your "accept anything" threshold BEFORE you hit it.'
          }
        ],
        financialImpact: {
          monthlyBurnRate: 6500,
          runwayMonths: this.emergencyFundMonths,
          totalCostToRecover: 25000
        },
        recoveryPaths: [
          {
            name: 'Direct Replacement',
            duration: '2-4 months',
            difficulty: 'moderate',
            requirements: ['Updated resume', 'Active network', 'Interview skills'],
            successRate: 70
          },
          {
            name: 'Level Up',
            duration: '3-6 months',
            difficulty: 'hard',
            requirements: ['Strong portfolio', 'Leadership examples', 'Higher bar interviews'],
            successRate: 40
          },
          {
            name: 'Pivot Role',
            duration: '4-8 months',
            difficulty: 'hard',
            requirements: ['Transferable skills story', 'Rebranded resume', 'New network'],
            successRate: 50
          },
          {
            name: 'Contract/Freelance',
            duration: '1-2 months',
            difficulty: 'easy',
            requirements: ['Marketable skills', 'Self-marketing ability', 'Lower stability tolerance'],
            successRate: 80
          }
        ],
        worstCase: 'Job search extends to 6+ months. Savings depleted. Forced to accept significant pay cut or relocation. Career momentum lost.',
        bestCase: 'Strong network leads to quick hire. Negotiate better comp than previous role. Use gap to refresh skills. Come back stronger.',
        yourReadiness: this.calculateReadiness()
      },
      'ai-disruption': {
        scenario,
        cascadeEffects: [
          {
            id: 'ce1',
            name: 'Task Automation Begins',
            timing: 'Month 1-6',
            impact: 'medium',
            description: 'AI tools introduced. Initially "to help you." Work feels easier.',
            mitigation: 'Learn the tools deeply. Become the expert others ask.'
          },
          {
            id: 'ce2',
            name: 'Headcount Questions',
            timing: 'Month 6-12',
            impact: 'high',
            description: 'Management notices 2 people do what 3 did. Efficiency gains measured.',
            mitigation: 'Focus on work AI can\'t do: strategy, relationships, judgment.'
          },
          {
            id: 'ce3',
            name: 'Role Restructuring',
            timing: 'Year 1-2',
            impact: 'critical',
            description: 'Your role merged with another. New job requires AI orchestration skills you don\'t have.',
            mitigation: 'Build AI skills NOW. Don\'t wait for mandate.'
          },
          {
            id: 'ce4',
            name: 'Market Shift',
            timing: 'Year 2-3',
            impact: 'high',
            description: 'Job postings require AI proficiency. Your old-school approach is liability.',
            mitigation: 'Certifications, projects, visible AI work on resume.'
          }
        ],
        financialImpact: {
          monthlyBurnRate: 6500,
          runwayMonths: this.emergencyFundMonths,
          totalCostToRecover: 15000
        },
        recoveryPaths: [
          {
            name: 'Upskill & Adapt',
            duration: '3-6 months',
            difficulty: 'moderate',
            requirements: ['AI/ML fundamentals', 'Prompt engineering', 'Integration skills'],
            successRate: 75
          },
          {
            name: 'Specialize in AI Safety',
            duration: '6-12 months',
            difficulty: 'hard',
            requirements: ['Deep AI knowledge', 'Ethics understanding', 'Research ability'],
            successRate: 60
          },
          {
            name: 'Move to Human-Centric Roles',
            duration: '3-6 months',
            difficulty: 'moderate',
            requirements: ['Strong soft skills', 'Leadership experience', 'Strategic thinking'],
            successRate: 65
          }
        ],
        worstCase: 'Skills become obsolete. Can\'t compete with AI-native workers. Forced into lower-paying adjacent roles or career change.',
        bestCase: 'Early adoption makes you the AI expert. Premium paid for people who can work WITH AI effectively. Career accelerates.',
        yourReadiness: this.calculateReadiness() - 10
      }
    };

    // Default to layoff scenario data structure for others
    return results[scenario.id] || results['layoff'];
  }

  calculateReadiness(): number {
    let score = 50;
    score += this.emergencyFundMonths >= 6 ? 15 : (this.emergencyFundMonths >= 3 ? 5 : -10);
    score += this.networkStrength >= 60 ? 15 : (this.networkStrength >= 40 ? 5 : -5);
    score += this.skillDiversity >= 70 ? 10 : (this.skillDiversity >= 50 ? 5 : -5);
    score += this.marketDemand >= 60 ? 10 : (this.marketDemand >= 40 ? 5 : -5);
    return Math.min(100, Math.max(0, score));
  }

  getReadinessLevel(): string {
    const readiness = this.activeResult()?.yourReadiness || 0;
    if (readiness >= 70) return 'high';
    if (readiness >= 40) return 'medium';
    return 'low';
  }

  clearResult() {
    this.activeResult.set(null);
  }

  runMockSimulation() {
    this.runSimulation(this.scenarios[0]); // Layoff scenario
  }
}
