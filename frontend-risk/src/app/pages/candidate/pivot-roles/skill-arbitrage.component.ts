import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface ArbitrageReport {
  currentPortfolio: SkillPortfolio;
  buySignals: BuySignal[];
  sellSignals: SellSignal[];
  combosNearCompletion: SkillCombo[];
  quickWins: QuickWin[];
  longTermPlays: LongTermPlay[];
  riskAnalysis: PortfolioRisk;
  totalUpsidePotential: number;
  recommendedStrategy: string;
}

interface SkillPortfolio {
  positions: PortfolioPosition[];
  totalPremium: number;
  avgRisk: number;
  diversification: string;
  grade: string;
}

interface PortfolioPosition {
  skill: string;
  premium: number;
  growthRate: number;
  valuation: string;
  risk: number;
}

interface BuySignal {
  skill: string;
  salaryPremium: number;
  demandGrowth: number;
  learningMonths: number;
  roiPerMonth: number;
  reason: string;
  urgency: string;
  industries: string[];
}

interface SellSignal {
  skill: string;
  currentPremium: number;
  demandGrowth: number;
  reason: string;
  replacement: string;
  action: string;
}

interface SkillCombo {
  name: string;
  premiumPotential: number;
  completionPercent: number;
  missingSkills: string[];
  description: string;
  priority: string;
}

interface QuickWin {
  skill: string;
  timeToLearn: string;
  premium: string;
  learningPath: string;
  roi: number;
}

interface LongTermPlay {
  path: string;
  timeframe: string;
  potential: string;
  steps: string[];
  thesis: string;
}

interface PortfolioRisk {
  exposure: string;
  risks: string[];
  recommendation: string;
  riskScore: number;
}

@Component({
  selector: 'app-skill-arbitrage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="arbitrage-container">
      <!-- Input Section -->
      <div class="input-section">
        <div class="input-header">
          <span class="header-icon">📈</span>
          <div>
            <h3>SKILL PORTFOLIO ANALYZER</h3>
            <p>Find undervalued skills with highest ROI</p>
          </div>
        </div>

        <div class="skill-input">
          <div class="tags-container">
            @for (skill of currentSkills(); track skill) {
              <span class="skill-tag">
                {{ skill }}
                <button (click)="removeSkill(skill)" class="remove-btn">×</button>
              </span>
            }
            <input
              type="text"
              [(ngModel)]="skillInput"
              (keyup.enter)="addSkill()"
              placeholder="Add skill (e.g., Python, React, AWS)..."
              class="skill-input-field"
            />
          </div>
        </div>

        <div class="params-row">
          <div class="param">
            <label>Current Role</label>
            <select [(ngModel)]="currentRole">
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="ML Engineer">ML Engineer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Data Engineer">Data Engineer</option>
            </select>
          </div>
          <div class="param">
            <label>Years Experience</label>
            <input type="number" [(ngModel)]="yearsExperience" min="0" max="30" />
          </div>
          <button
            (click)="analyze()"
            [disabled]="loading() || currentSkills().length === 0"
            class="analyze-btn"
          >
            {{ loading() ? 'Analyzing...' : 'Analyze Portfolio' }}
          </button>
        </div>
      </div>

      @if (report()) {
        <div class="results">
          <!-- Portfolio Grade -->
          <div class="portfolio-grade">
            <div class="grade-circle" [class]="'grade-' + report()!.currentPortfolio.grade.charAt(0).toLowerCase()">
              <span class="grade">{{ report()!.currentPortfolio.grade }}</span>
            </div>
            <div class="grade-info">
              <span class="grade-label">Portfolio Grade</span>
              <span class="total-premium">
                +${{ report()!.currentPortfolio.totalPremium | number }}/yr current value
              </span>
              <span class="upside">
                +${{ report()!.totalUpsidePotential | number }}/yr potential upside
              </span>
            </div>
            <div class="risk-indicator" [class]="'risk-' + report()!.riskAnalysis.exposure">
              <span class="risk-label">{{ report()!.riskAnalysis.exposure | uppercase }}</span>
              <span class="risk-desc">Risk Exposure</span>
            </div>
          </div>

          <!-- Strategy Recommendation -->
          <div class="strategy-section">
            <div class="strategy-icon">🎯</div>
            <p class="strategy-text">{{ report()!.recommendedStrategy }}</p>
          </div>

          <!-- BUY Signals -->
          @if (report()!.buySignals.length > 0) {
            <div class="section buy-section">
              <div class="section-header">
                <span class="signal-icon buy">🟢</span>
                <h3>BUY SIGNALS</h3>
                <span class="section-desc">Skills to invest in NOW</span>
              </div>
              <div class="signals-grid">
                @for (signal of report()!.buySignals; track signal.skill) {
                  <div class="signal-card buy">
                    <div class="signal-header">
                      <span class="skill-name">{{ signal.skill }}</span>
                      <span class="urgency-badge" [class]="'urgency-' + signal.urgency.toLowerCase()">
                        {{ signal.urgency }}
                      </span>
                    </div>
                    <div class="signal-metrics">
                      <div class="metric">
                        <span class="metric-value">+${{ signal.salaryPremium | number }}</span>
                        <span class="metric-label">salary premium/yr</span>
                      </div>
                      <div class="metric">
                        <span class="metric-value">{{ signal.demandGrowth }}%</span>
                        <span class="metric-label">demand growth</span>
                      </div>
                      <div class="metric">
                        <span class="metric-value">{{ signal.learningMonths }}mo</span>
                        <span class="metric-label">to learn</span>
                      </div>
                    </div>
                    <div class="roi-bar">
                      <div class="roi-fill" [style.width.%]="Math.min(100, signal.roiPerMonth / 100)"></div>
                      <span class="roi-value">${{ signal.roiPerMonth | number }}/mo ROI</span>
                    </div>
                    <p class="signal-reason">{{ signal.reason }}</p>
                    <div class="industries">
                      @for (industry of signal.industries; track industry) {
                        <span class="industry-tag">{{ industry }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- SELL Signals -->
          @if (report()!.sellSignals.length > 0) {
            <div class="section sell-section">
              <div class="section-header">
                <span class="signal-icon sell">🔴</span>
                <h3>SELL SIGNALS</h3>
                <span class="section-desc">Stop investing time here</span>
              </div>
              <div class="signals-grid">
                @for (signal of report()!.sellSignals; track signal.skill) {
                  <div class="signal-card sell">
                    <div class="signal-header">
                      <span class="skill-name">{{ signal.skill }}</span>
                      <span class="decline-badge">{{ signal.demandGrowth }}% YoY</span>
                    </div>
                    <p class="signal-reason">{{ signal.reason }}</p>
                    <div class="replacement">
                      <span class="replacement-label">→ Replace with:</span>
                      <p>{{ signal.replacement }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Skill Combos -->
          @if (report()!.combosNearCompletion.length > 0) {
            <div class="section combo-section">
              <div class="section-header">
                <span class="signal-icon combo">⚡</span>
                <h3>SKILL COMBOS</h3>
                <span class="section-desc">Powerful combinations you're close to</span>
              </div>
              <div class="combos-grid">
                @for (combo of report()!.combosNearCompletion; track combo.name) {
                  <div class="combo-card" [class.high-priority]="combo.priority === 'high'">
                    <div class="combo-header">
                      <span class="combo-name">{{ combo.name }}</span>
                      <span class="combo-premium">+${{ combo.premiumPotential | number }}/yr</span>
                    </div>
                    <div class="completion-bar">
                      <div class="completion-fill" [style.width.%]="combo.completionPercent"></div>
                      <span class="completion-text">{{ combo.completionPercent }}% complete</span>
                    </div>
                    <p class="combo-desc">{{ combo.description }}</p>
                    <div class="missing-skills">
                      <span class="missing-label">Missing:</span>
                      @for (skill of combo.missingSkills; track skill) {
                        <span class="missing-tag">{{ skill }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Quick Wins -->
          <div class="section quickwin-section">
            <div class="section-header">
              <span class="signal-icon quick">🚀</span>
              <h3>QUICK WINS</h3>
              <span class="section-desc">Highest ROI for minimal time</span>
            </div>
            <div class="quickwins-grid">
              @for (win of report()!.quickWins; track win.skill) {
                <div class="quickwin-card">
                  <div class="quickwin-header">
                    <span class="quickwin-skill">{{ win.skill }}</span>
                    <span class="quickwin-time">{{ win.timeToLearn }}</span>
                  </div>
                  <div class="quickwin-premium">{{ win.premium }}</div>
                  <div class="quickwin-path">
                    <span class="path-label">Learning Path:</span>
                    <p>{{ win.learningPath }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Long Term Plays -->
          <div class="section longterm-section">
            <div class="section-header">
              <span class="signal-icon longterm">🏆</span>
              <h3>LONG-TERM PLAYS</h3>
              <span class="section-desc">Career bets for maximum upside</span>
            </div>
            <div class="longterm-grid">
              @for (play of report()!.longTermPlays; track play.path) {
                <div class="longterm-card">
                  <div class="longterm-header">
                    <span class="play-path">{{ play.path }}</span>
                    <div class="play-meta">
                      <span class="play-time">{{ play.timeframe }}</span>
                      <span class="play-potential">{{ play.potential }}</span>
                    </div>
                  </div>
                  <p class="play-thesis">{{ play.thesis }}</p>
                  <div class="play-steps">
                    @for (step of play.steps; track step; let i = $index) {
                      <div class="step">
                        <span class="step-num">{{ i + 1 }}</span>
                        <span class="step-text">{{ step }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Risk Analysis -->
          <div class="section risk-section">
            <div class="section-header">
              <span class="signal-icon risk">⚠️</span>
              <h3>PORTFOLIO RISKS</h3>
            </div>
            <div class="risk-content">
              <div class="risk-meter">
                <div class="meter-bar">
                  <div
                    class="meter-fill"
                    [style.width.%]="report()!.riskAnalysis.riskScore"
                    [class]="'risk-' + report()!.riskAnalysis.exposure"
                  ></div>
                </div>
                <span class="meter-label">{{ report()!.riskAnalysis.riskScore }}% Risk Score</span>
              </div>
              <ul class="risk-list">
                @for (risk of report()!.riskAnalysis.risks; track risk) {
                  <li>{{ risk }}</li>
                }
              </ul>
              <p class="risk-recommendation">{{ report()!.riskAnalysis.recommendation }}</p>
            </div>
          </div>

          <!-- Current Portfolio Positions -->
          <div class="section positions-section">
            <div class="section-header">
              <span class="signal-icon positions">📊</span>
              <h3>CURRENT POSITIONS</h3>
            </div>
            <div class="positions-table">
              <div class="table-header">
                <span>Skill</span>
                <span>Premium</span>
                <span>Growth</span>
                <span>Valuation</span>
              </div>
              @for (pos of report()!.currentPortfolio.positions; track pos.skill) {
                <div class="table-row" [class]="'valuation-' + pos.valuation">
                  <span class="pos-skill">{{ pos.skill }}</span>
                  <span class="pos-premium">+${{ pos.premium | number }}</span>
                  <span class="pos-growth" [class.positive]="pos.growthRate > 0" [class.negative]="pos.growthRate < 0">
                    {{ pos.growthRate > 0 ? '+' : '' }}{{ pos.growthRate }}%
                  </span>
                  <span class="pos-valuation">
                    {{ pos.valuation === 'undervalued' ? '🟢' : pos.valuation === 'overvalued' ? '🔴' : pos.valuation === 'alpha' ? '⭐' : '🟡' }}
                    {{ pos.valuation }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .arbitrage-container {
      padding: 1.5rem;
      background: linear-gradient(180deg, rgba(16, 24, 40, 0.95) 0%, rgba(16, 24, 40, 0.98) 100%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .input-section {
      margin-bottom: 2rem;
    }

    .input-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .header-icon {
      font-size: 2rem;
    }

    .input-header h3 {
      margin: 0;
      color: white;
      font-size: 1rem;
      letter-spacing: 0.1em;
    }

    .input-header p {
      margin: 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
    }

    .skill-input {
      margin-bottom: 1rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      min-height: 50px;
    }

    .skill-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.2));
      color: white;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      padding: 0;
      font-size: 1rem;
      line-height: 1;
    }

    .remove-btn:hover {
      color: white;
    }

    .skill-input-field {
      flex: 1;
      min-width: 150px;
      background: transparent;
      border: none;
      color: white;
      font-size: 0.875rem;
      outline: none;
    }

    .skill-input-field::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .params-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .param {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .param label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
    }

    .param select, .param input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .analyze-btn {
      background: linear-gradient(135deg, #10b981, #06b6d4);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .analyze-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .analyze-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .portfolio-grade {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .grade-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid;
    }

    .grade-a { border-color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .grade-b { border-color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
    .grade-c { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .grade-d { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .grade-f { border-color: #ef4444; background: rgba(239, 68, 68, 0.2); }

    .grade {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
    }

    .grade-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .grade-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .total-premium {
      color: #10b981;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .upside {
      color: #06b6d4;
      font-size: 1rem;
    }

    .risk-indicator {
      text-align: center;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
    }

    .risk-growth { background: rgba(16, 185, 129, 0.2); }
    .risk-balanced { background: rgba(6, 182, 212, 0.2); }
    .risk-high-risk { background: rgba(239, 68, 68, 0.2); }

    .risk-label {
      display: block;
      font-weight: 700;
      color: white;
      font-size: 0.875rem;
    }

    .risk-desc {
      display: block;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.7rem;
    }

    .strategy-section {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .strategy-icon {
      font-size: 1.5rem;
    }

    .strategy-text {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 1rem;
      line-height: 1.5;
    }

    .section {
      margin-bottom: 1.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .signal-icon {
      font-size: 1.25rem;
    }

    .section-header h3 {
      margin: 0;
      color: white;
      font-size: 0.875rem;
      letter-spacing: 0.1em;
    }

    .section-desc {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }

    .signals-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .signal-card {
      padding: 1.25rem;
      border-radius: 12px;
    }

    .signal-card.buy {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05));
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .signal-card.sell {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .signal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .skill-name {
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .urgency-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .urgency-now {
      background: #10b981;
      color: white;
    }

    .urgency-3, .urgency-6, .urgency-12 {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .decline-badge {
      color: #f87171;
      font-weight: 600;
    }

    .signal-metrics {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .metric {
      text-align: center;
    }

    .metric-value {
      display: block;
      color: #10b981;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .metric-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.65rem;
    }

    .roi-bar {
      position: relative;
      height: 24px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .roi-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #06b6d4);
    }

    .roi-value {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .signal-reason {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin: 0 0 0.75rem;
    }

    .industries {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .industry-tag {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
    }

    .replacement {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.75rem;
      border-radius: 8px;
      margin-top: 0.75rem;
    }

    .replacement-label {
      color: #10b981;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .replacement p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      margin: 0.25rem 0 0;
    }

    .combos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }

    .combo-card {
      padding: 1.25rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .combo-card.high-priority {
      border-color: rgba(139, 92, 246, 0.5);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
    }

    .combo-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .combo-name {
      color: #a78bfa;
      font-weight: 600;
    }

    .combo-premium {
      color: #10b981;
      font-weight: 600;
    }

    .completion-bar {
      position: relative;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .completion-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6, #a78bfa);
    }

    .completion-text {
      position: absolute;
      right: 0;
      top: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.7rem;
    }

    .combo-desc {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      margin: 0 0 0.75rem;
    }

    .missing-skills {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .missing-label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }

    .missing-tag {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .quickwins-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .quickwin-card {
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), transparent);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 12px;
    }

    .quickwin-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .quickwin-skill {
      color: #06b6d4;
      font-weight: 600;
    }

    .quickwin-time {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .quickwin-premium {
      color: #10b981;
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }

    .quickwin-path {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.75rem;
      border-radius: 8px;
    }

    .path-label {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.7rem;
    }

    .quickwin-path p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.8rem;
      margin: 0.25rem 0 0;
    }

    .longterm-grid {
      display: grid;
      gap: 1rem;
    }

    .longterm-card {
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
    }

    .longterm-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .play-path {
      color: #f59e0b;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .play-meta {
      text-align: right;
    }

    .play-time {
      display: block;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }

    .play-potential {
      color: #10b981;
      font-weight: 600;
    }

    .play-thesis {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      margin: 0 0 1rem;
      font-style: italic;
    }

    .play-steps {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
    }

    .step-num {
      width: 20px;
      height: 20px;
      background: rgba(139, 92, 246, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a78bfa;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .step-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
    }

    .risk-content {
      padding: 1.25rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    .risk-meter {
      margin-bottom: 1rem;
    }

    .meter-bar {
      height: 10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      overflow: hidden;
    }

    .meter-fill {
      height: 100%;
    }

    .meter-fill.risk-growth { background: #10b981; }
    .meter-fill.risk-balanced { background: #06b6d4; }
    .meter-fill.risk-high-risk { background: #ef4444; }

    .meter-label {
      display: block;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .risk-list {
      margin: 0 0 1rem;
      padding-left: 1.25rem;
    }

    .risk-list li {
      color: #f87171;
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }

    .risk-recommendation {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      margin: 0;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .positions-table {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(0, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.5fr;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .pos-skill {
      color: white;
      font-weight: 500;
    }

    .pos-premium {
      color: #10b981;
    }

    .pos-growth {
      font-weight: 600;
    }

    .pos-growth.positive { color: #10b981; }
    .pos-growth.negative { color: #ef4444; }

    .pos-valuation {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
    }

    @media (max-width: 768px) {
      .params-row {
        flex-direction: column;
      }

      .portfolio-grade {
        flex-direction: column;
        text-align: center;
      }

      .signals-grid, .combos-grid, .quickwins-grid {
        grid-template-columns: 1fr;
      }

      .table-header, .table-row {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class SkillArbitrageComponent {
  private http = inject(HttpClient);

  skillInput = '';
  currentSkills = signal<string[]>(['Python', 'JavaScript', 'React']);
  currentRole = 'Software Engineer';
  yearsExperience = 3;
  loading = signal(false);
  report = signal<ArbitrageReport | null>(null);

  Math = Math;

  addSkill() {
    const skill = this.skillInput.trim();
    if (skill && !this.currentSkills().includes(skill)) {
      this.currentSkills.update(skills => [...skills, skill]);
      this.skillInput = '';
    }
  }

  removeSkill(skill: string) {
    this.currentSkills.update(skills => skills.filter(s => s !== skill));
  }

  analyze() {
    this.loading.set(true);

    this.http.post<ArbitrageReport>(`${environment.apiUrl}/api/career-intel/arbitrage`, {
      currentSkills: this.currentSkills(),
      currentRole: this.currentRole,
      yearsExperience: this.yearsExperience
    }).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
