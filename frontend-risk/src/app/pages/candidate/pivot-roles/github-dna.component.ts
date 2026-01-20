import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CareerDNA {
  username: string;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  accountAge: number;
  dominantSkills: DominantSkill[];
  recessiveSkills: RecessiveSkill[];
  skillMutations: SkillMutation[];
  codeVelocity: CodeVelocity;
  consistencyScore: number;
  marketFitScore: number;
  extinctionRisks: ExtinctionRisk[];
  trajectory: CareerTrajectory;
  languageBreakdown: Record<string, LanguageStats>;
  weeklyActivity: number[];
  peakCodingHour: number;
  mostActiveDay: string;
  error?: string;
}

interface DominantSkill {
  skill: string;
  strength: number;
  repoCount: number;
  marketDemand: number;
}

interface RecessiveSkill {
  skill: string;
  strength: number;
  lastUsed: string;
  activationPotential: string;
}

interface SkillMutation {
  name: string;
  description: string;
  rarity: number;
  salaryImpact: string;
  careerPaths: string[];
}

interface CodeVelocity {
  totalCommits: number;
  commitsPerWeek: number;
  activeRepos: number;
  velocityLevel: string;
  percentile: number;
}

interface ExtinctionRisk {
  skill: string;
  aiThreat: number;
  marketDemand: number;
  reason: string;
  survivalStrategy: string;
}

interface CareerTrajectory {
  type: string;
  growingSkills: string[];
  atRiskSkills: string[];
  recommendation: string;
  confidence: number;
  yearsToSenior: number;
}

interface LanguageStats {
  language: string;
  percentage: number;
  repoCount: number;
  marketDemand: number;
  aiThreat: number;
}

@Component({
  selector: 'app-github-dna',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="github-dna-container">
      <!-- Search Input -->
      <div class="search-section">
        <div class="search-box">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9c0 2.3-.9 4.5-2.4 6.1"/>
              <path d="M12 12l4 4"/>
              <path d="M16 16l5 5"/>
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="usernameInput"
            placeholder="Enter GitHub username..."
            (keyup.enter)="analyzeProfile()"
            class="search-input"
          />
          <button
            (click)="analyzeProfile()"
            [disabled]="loading()"
            class="analyze-btn"
          >
            {{ loading() ? 'Analyzing...' : 'Analyze DNA' }}
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="dna-helix">
            <div class="strand strand-1"></div>
            <div class="strand strand-2"></div>
          </div>
          <p>Sequencing Career DNA...</p>
        </div>
      }

      @if (error()) {
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
        </div>
      }

      @if (dna() && !loading()) {
        <div class="dna-results">
          <!-- Profile Header -->
          <div class="profile-header">
            <img [src]="dna()!.avatarUrl" [alt]="dna()!.username" class="avatar" />
            <div class="profile-info">
              <h2>{{ dna()!.username }}</h2>
              <div class="profile-stats">
                <span>{{ dna()!.publicRepos }} repos</span>
                <span>{{ dna()!.followers }} followers</span>
                <span>{{ dna()!.accountAge }} years on GitHub</span>
              </div>
              <a [href]="dna()!.profileUrl" target="_blank" class="profile-link">
                View Profile →
              </a>
            </div>
            <div class="market-fit-score">
              <div class="score-circle" [class]="getMarketFitClass()">
                <span class="score-value">{{ dna()!.marketFitScore }}</span>
                <span class="score-label">Market Fit</span>
              </div>
            </div>
          </div>

          <!-- Skill Mutations (Rare Combinations) -->
          @if (dna()!.skillMutations && dna()!.skillMutations.length > 0) {
            <div class="section mutations-section">
              <div class="section-header">
                <span class="section-icon">🧬</span>
                <h3>SKILL MUTATIONS</h3>
                <span class="section-badge rare">Rare Combinations Found</span>
              </div>
              <div class="mutations-grid">
                @for (mutation of dna()!.skillMutations; track mutation.name) {
                  <div class="mutation-card">
                    <div class="mutation-header">
                      <span class="mutation-name">{{ mutation.name }}</span>
                      <span class="rarity-badge">{{ mutation.rarity }}% Rarity</span>
                    </div>
                    <p class="mutation-desc">{{ mutation.description }}</p>
                    <div class="mutation-impact">
                      <span class="salary-impact">{{ mutation.salaryImpact }}</span>
                    </div>
                    <div class="career-paths">
                      @for (path of mutation.careerPaths; track path) {
                        <span class="path-tag">{{ path }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Code Velocity -->
          <div class="section velocity-section">
            <div class="section-header">
              <span class="section-icon">⚡</span>
              <h3>CODE VELOCITY</h3>
            </div>
            <div class="velocity-dashboard">
              <div class="velocity-main">
                <div class="velocity-level" [class]="'level-' + dna()!.codeVelocity.velocityLevel">
                  {{ dna()!.codeVelocity.velocityLevel.toUpperCase() }}
                </div>
                <div class="percentile">Top {{ 100 - dna()!.codeVelocity.percentile }}%</div>
              </div>
              <div class="velocity-stats">
                <div class="stat">
                  <span class="stat-value">{{ dna()!.codeVelocity.commitsPerWeek | number:'1.1-1' }}</span>
                  <span class="stat-label">commits/week</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ dna()!.codeVelocity.activeRepos }}</span>
                  <span class="stat-label">active repos</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ dna()!.consistencyScore }}%</span>
                  <span class="stat-label">consistency</span>
                </div>
              </div>
              <!-- Weekly Activity Chart -->
              <div class="activity-chart">
                <div class="chart-bars">
                  @for (week of dna()!.weeklyActivity || []; track $index) {
                    <div
                      class="bar"
                      [style.height.%]="getBarHeight(week)"
                      [title]="'Week ' + ($index + 1) + ': ' + week + ' commits'"
                    ></div>
                  }
                </div>
                <div class="chart-label">Last 12 weeks activity</div>
              </div>
            </div>
          </div>

          <!-- Dominant vs Recessive Skills -->
          <div class="section skills-section">
            <div class="skills-grid">
              <!-- Dominant -->
              <div class="skills-column dominant">
                <h4>🟢 DOMINANT SKILLS</h4>
                <p class="column-desc">Your strongest, most-used skills</p>
                @for (skill of dna()!.dominantSkills; track skill.skill) {
                  <div class="skill-bar">
                    <div class="skill-info">
                      <span class="skill-name">{{ skill.skill }}</span>
                      <span class="skill-repos">{{ skill.repoCount }} repos</span>
                    </div>
                    <div class="bar-container">
                      <div class="bar-fill dominant-fill" [style.width.%]="skill.strength"></div>
                      <span class="bar-value">{{ skill.strength }}%</span>
                    </div>
                    <div class="market-indicator" [class]="getMarketClass(skill.marketDemand)">
                      {{ skill.marketDemand > 70 ? '📈 High demand' : skill.marketDemand > 50 ? '➡️ Stable' : '📉 Declining' }}
                    </div>
                  </div>
                }
              </div>

              <!-- Recessive -->
              <div class="skills-column recessive">
                <h4>🟡 RECESSIVE SKILLS</h4>
                <p class="column-desc">Present but underutilized</p>
                @for (skill of dna()!.recessiveSkills; track skill.skill) {
                  <div class="skill-bar">
                    <div class="skill-info">
                      <span class="skill-name">{{ skill.skill }}</span>
                      <span class="skill-last-used">Last: {{ skill.lastUsed | slice:0:4 }}</span>
                    </div>
                    <div class="bar-container">
                      <div class="bar-fill recessive-fill" [style.width.%]="skill.strength"></div>
                      <span class="bar-value">{{ skill.strength }}%</span>
                    </div>
                    <div class="activation-potential" [class]="'potential-' + skill.activationPotential">
                      {{ skill.activationPotential === 'high' ? '🚀 High activation potential' :
                         skill.activationPotential === 'medium' ? '💡 Medium potential' : '⏸️ Low priority' }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Extinction Risks -->
          @if (dna()!.extinctionRisks && dna()!.extinctionRisks.length > 0) {
            <div class="section extinction-section">
              <div class="section-header">
                <span class="section-icon">☠️</span>
                <h3>EXTINCTION RISKS</h3>
                <span class="section-badge danger">Action Required</span>
              </div>
              <div class="extinction-list">
                @for (risk of dna()!.extinctionRisks; track risk.skill) {
                  <div class="extinction-card">
                    <div class="risk-header">
                      <span class="risk-skill">{{ risk.skill }}</span>
                      <div class="threat-meters">
                        <div class="meter">
                          <span class="meter-label">AI Threat</span>
                          <div class="meter-bar">
                            <div class="meter-fill threat" [style.width.%]="risk.aiThreat"></div>
                          </div>
                          <span class="meter-value">{{ risk.aiThreat }}%</span>
                        </div>
                        <div class="meter">
                          <span class="meter-label">Market</span>
                          <div class="meter-bar">
                            <div class="meter-fill market" [style.width.%]="risk.marketDemand"></div>
                          </div>
                          <span class="meter-value">{{ risk.marketDemand }}%</span>
                        </div>
                      </div>
                    </div>
                    <p class="risk-reason">{{ risk.reason }}</p>
                    <div class="survival-strategy">
                      <span class="strategy-label">Survival Strategy:</span>
                      <p>{{ risk.survivalStrategy }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Career Trajectory -->
          <div class="section trajectory-section">
            <div class="section-header">
              <span class="section-icon">🎯</span>
              <h3>CAREER TRAJECTORY</h3>
            </div>
            <div class="trajectory-card" [class]="'trajectory-' + dna()!.trajectory.type">
              <div class="trajectory-type">
                {{ dna()!.trajectory.type === 'growth' ? '📈 GROWTH' :
                   dna()!.trajectory.type === 'stable' ? '➡️ STABLE' :
                   dna()!.trajectory.type === 'legacy-maintenance' ? '⚠️ LEGACY PATH' : '📊 ANALYZING' }}
              </div>
              <div class="trajectory-details">
                <div class="detail-row">
                  <span class="detail-label">Confidence</span>
                  <div class="confidence-bar">
                    <div class="bar-fill" [style.width.%]="dna()!.trajectory.confidence"></div>
                  </div>
                  <span class="detail-value">{{ dna()!.trajectory.confidence }}%</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Est. Years to Senior+</span>
                  <span class="detail-value years">{{ dna()!.trajectory.yearsToSenior }} years</span>
                </div>
              </div>
              <div class="trajectory-recommendation">
                <p>{{ dna()!.trajectory.recommendation }}</p>
              </div>
              <div class="skill-lists">
                <div class="growing-skills">
                  <h5>🟢 Growing Skills</h5>
                  @for (skill of dna()!.trajectory.growingSkills; track skill) {
                    <span class="skill-tag growing">{{ skill }}</span>
                  }
                </div>
                @if (dna()!.trajectory.atRiskSkills.length > 0) {
                  <div class="atrisk-skills">
                    <h5>🔴 At-Risk Skills</h5>
                    @for (skill of dna()!.trajectory.atRiskSkills; track skill) {
                      <span class="skill-tag atrisk">{{ skill }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Coding Patterns -->
          <div class="section patterns-section">
            <div class="patterns-grid">
              <div class="pattern-card">
                <span class="pattern-icon">🕐</span>
                <span class="pattern-value">{{ formatHour(dna()!.peakCodingHour) }}</span>
                <span class="pattern-label">Peak Coding Hour</span>
              </div>
              <div class="pattern-card">
                <span class="pattern-icon">📅</span>
                <span class="pattern-value">{{ dna()!.mostActiveDay }}</span>
                <span class="pattern-label">Most Active Day</span>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .github-dna-container {
      padding: 1.5rem;
      background: linear-gradient(180deg, rgba(16, 24, 40, 0.95) 0%, rgba(16, 24, 40, 0.98) 100%);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .search-section {
      margin-bottom: 2rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 0.75rem 1rem;
    }

    .search-icon {
      color: rgba(255, 255, 255, 0.5);
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      font-size: 1rem;
      outline: none;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .analyze-btn {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
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
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }

    .analyze-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-state {
      text-align: center;
      padding: 4rem;
    }

    .dna-helix {
      width: 60px;
      height: 100px;
      margin: 0 auto 1rem;
      position: relative;
    }

    .strand {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid;
      border-radius: 50%;
      animation: rotate 2s linear infinite;
    }

    .strand-1 {
      border-color: #8b5cf6 transparent transparent transparent;
    }

    .strand-2 {
      border-color: transparent transparent #06b6d4 transparent;
      animation-delay: -1s;
    }

    @keyframes rotate {
      to { transform: rotate(360deg); }
    }

    .error-state {
      text-align: center;
      padding: 2rem;
      color: #f87171;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid rgba(139, 92, 246, 0.5);
    }

    .profile-info {
      flex: 1;
    }

    .profile-info h2 {
      margin: 0 0 0.5rem;
      color: white;
      font-size: 1.5rem;
    }

    .profile-stats {
      display: flex;
      gap: 1rem;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .profile-link {
      color: #8b5cf6;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .market-fit-score {
      text-align: center;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 4px solid;
    }

    .score-circle.high {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .score-circle.medium {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }

    .score-circle.low {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .score-value {
      font-size: 2rem;
      font-weight: 700;
      color: white;
    }

    .score-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .section {
      margin-bottom: 1.5rem;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .section-icon {
      font-size: 1.25rem;
    }

    .section-header h3 {
      margin: 0;
      color: white;
      font-size: 0.875rem;
      letter-spacing: 0.1em;
    }

    .section-badge {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .section-badge.rare {
      background: rgba(139, 92, 246, 0.2);
      color: #a78bfa;
    }

    .section-badge.danger {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .mutations-grid {
      display: grid;
      gap: 1rem;
    }

    .mutation-card {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .mutation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .mutation-name {
      color: #a78bfa;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .rarity-badge {
      background: rgba(139, 92, 246, 0.3);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .mutation-desc {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin: 0 0 0.75rem;
    }

    .salary-impact {
      color: #10b981;
      font-weight: 600;
    }

    .career-paths {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .path-tag {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.8);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .velocity-dashboard {
      display: grid;
      gap: 1.5rem;
    }

    .velocity-main {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .velocity-level {
      font-size: 2rem;
      font-weight: 700;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
    }

    .level-hyperspeed {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      color: white;
    }

    .level-fast {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .level-steady {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
    }

    .level-moderate {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .level-slow {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .percentile {
      color: rgba(255, 255, 255, 0.6);
    }

    .velocity-stats {
      display: flex;
      gap: 2rem;
    }

    .stat {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
    }

    .activity-chart {
      margin-top: 1rem;
    }

    .chart-bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 60px;
    }

    .chart-bars .bar {
      flex: 1;
      background: linear-gradient(to top, #8b5cf6, #a78bfa);
      border-radius: 2px 2px 0 0;
      min-height: 4px;
      transition: all 0.3s;
    }

    .chart-bars .bar:hover {
      background: #a78bfa;
    }

    .chart-label {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .skills-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .skills-column h4 {
      margin: 0 0 0.25rem;
      color: white;
      font-size: 0.875rem;
    }

    .column-desc {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
      margin: 0 0 1rem;
    }

    .skill-bar {
      margin-bottom: 1rem;
    }

    .skill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .skill-name {
      color: white;
      font-weight: 500;
    }

    .skill-repos, .skill-last-used {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }

    .bar-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .dominant-fill {
      background: linear-gradient(90deg, #10b981, #34d399);
    }

    .recessive-fill {
      background: linear-gradient(90deg, #f59e0b, #fbbf24);
    }

    .bar-value {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      min-width: 35px;
    }

    .market-indicator, .activation-potential {
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }

    .market-indicator.high { color: #10b981; }
    .market-indicator.medium { color: #f59e0b; }
    .market-indicator.low { color: #ef4444; }

    .potential-high { color: #10b981; }
    .potential-medium { color: #f59e0b; }
    .potential-low { color: rgba(255, 255, 255, 0.4); }

    .extinction-list {
      display: grid;
      gap: 1rem;
    }

    .extinction-card {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .risk-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .risk-skill {
      color: #f87171;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .threat-meters {
      display: flex;
      gap: 1rem;
    }

    .meter {
      text-align: center;
    }

    .meter-label {
      display: block;
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 0.25rem;
    }

    .meter-bar {
      width: 60px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .meter-fill.threat {
      background: #ef4444;
      height: 100%;
    }

    .meter-fill.market {
      background: #10b981;
      height: 100%;
    }

    .meter-value {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .risk-reason {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.875rem;
      margin: 0 0 0.75rem;
    }

    .survival-strategy {
      background: rgba(0, 0, 0, 0.2);
      padding: 0.75rem;
      border-radius: 8px;
    }

    .strategy-label {
      color: #10b981;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .survival-strategy p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      margin: 0.25rem 0 0;
    }

    .trajectory-card {
      padding: 1.5rem;
      border-radius: 12px;
    }

    .trajectory-growth {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05));
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .trajectory-stable {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.05));
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .trajectory-legacy-maintenance {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.05));
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .trajectory-type {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }

    .trajectory-details {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .detail-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
    }

    .confidence-bar {
      width: 100px;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-bar .bar-fill {
      background: #8b5cf6;
      height: 100%;
    }

    .detail-value {
      color: white;
      font-weight: 600;
    }

    .detail-value.years {
      color: #06b6d4;
    }

    .trajectory-recommendation {
      background: rgba(0, 0, 0, 0.2);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .trajectory-recommendation p {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      font-size: 0.95rem;
    }

    .skill-lists {
      display: flex;
      gap: 2rem;
    }

    .skill-lists h5 {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      margin: 0 0 0.5rem;
    }

    .skill-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      margin-right: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .skill-tag.growing {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .skill-tag.atrisk {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }

    .patterns-grid {
      display: flex;
      gap: 1rem;
    }

    .pattern-card {
      flex: 1;
      text-align: center;
      background: rgba(0, 0, 0, 0.2);
      padding: 1.25rem;
      border-radius: 12px;
    }

    .pattern-icon {
      display: block;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .pattern-value {
      display: block;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .pattern-label {
      display: block;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.25rem;
    }

    @media (max-width: 768px) {
      .skills-grid {
        grid-template-columns: 1fr;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
      }

      .search-box {
        flex-direction: column;
      }
    }
  `]
})
export class GitHubDNAComponent implements OnInit {
  private http = inject(HttpClient);

  usernameInput = '';
  dna = signal<CareerDNA | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  @Input() initialUsername?: string;

  ngOnInit() {
    if (this.initialUsername) {
      this.usernameInput = this.initialUsername;
      this.analyzeProfile();
    }
  }

  analyzeProfile() {
    if (!this.usernameInput.trim()) {
      this.error.set('Please enter a GitHub username');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.http.get<CareerDNA>(`${environment.apiBaseUrl}/career-intel/github/${this.usernameInput.trim()}`)
      .subscribe({
        next: (data) => {
          this.dna.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to analyze profile. Try again.');
          this.loading.set(false);
        }
      });
  }

  getMarketFitClass(): string {
    const score = this.dna()?.marketFitScore || 0;
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  getMarketClass(demand: number): string {
    if (demand > 70) return 'high';
    if (demand > 50) return 'medium';
    return 'low';
  }

  getBarHeight(commits: number): number {
    const max = Math.max(...(this.dna()?.weeklyActivity || [1]));
    return max > 0 ? (commits / max) * 100 : 0;
  }

  formatHour(hour: number): string {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  }
}
