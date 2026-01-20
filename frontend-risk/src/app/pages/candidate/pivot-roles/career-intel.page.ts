import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubDNAComponent } from './github-dna.component';
import { SkillArbitrageComponent } from './skill-arbitrage.component';

type TabType = 'github' | 'arbitrage' | 'company' | 'jobs';

@Component({
  selector: 'app-career-intel',
  standalone: true,
  imports: [CommonModule, FormsModule, GitHubDNAComponent, SkillArbitrageComponent],
  template: `
    <div class="career-intel-page">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-badge">🔮 CAREER INTELLIGENCE</div>
        <h1>Your Unfair Advantage</h1>
        <p class="hero-subtitle">
          Real data. Real insights. Not generic advice.
        </p>
      </div>

      <!-- Feature Tabs -->
      <div class="tabs-container">
        <button
          class="tab"
          [class.active]="activeTab() === 'github'"
          (click)="setTab('github')"
        >
          <span class="tab-icon">🧬</span>
          <span class="tab-label">GitHub DNA</span>
          <span class="tab-desc">Analyze your code fingerprint</span>
        </button>
        <button
          class="tab"
          [class.active]="activeTab() === 'arbitrage'"
          (click)="setTab('arbitrage')"
        >
          <span class="tab-icon">📈</span>
          <span class="tab-label">Skill Arbitrage</span>
          <span class="tab-desc">Find undervalued skills</span>
        </button>
        <button
          class="tab"
          [class.active]="activeTab() === 'company'"
          (click)="setTab('company')"
        >
          <span class="tab-icon">🏢</span>
          <span class="tab-label">Company Radar</span>
          <span class="tab-desc">Layoff probability</span>
        </button>
        <button
          class="tab"
          [class.active]="activeTab() === 'jobs'"
          (click)="setTab('jobs')"
        >
          <span class="tab-icon">🎯</span>
          <span class="tab-label">Job X-Ray</span>
          <span class="tab-desc">Real vs wishlist requirements</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        @switch (activeTab()) {
          @case ('github') {
            <app-github-dna></app-github-dna>
          }
          @case ('arbitrage') {
            <app-skill-arbitrage></app-skill-arbitrage>
          }
          @case ('company') {
            <div class="coming-soon">
              <div class="coming-soon-content">
                <span class="coming-icon">🏢</span>
                <h2>Company Health Radar</h2>
                <p>Enter a company name to analyze layoff probability</p>
                <div class="company-search">
                  <input
                    type="text"
                    [(ngModel)]="companyInput"
                    placeholder="Google, Meta, Amazon..."
                    class="company-input"
                  />
                  <button class="analyze-btn" (click)="analyzeCompany()">Analyze</button>
                </div>
                @if (companyResult()) {
                  <div class="company-result">
                    <div class="result-header">
                      <h3>{{ companyResult().companyName }}</h3>
                      <div class="health-score" [class]="getHealthClass()">
                        {{ companyResult().healthScore }}/100
                      </div>
                    </div>
                    <div class="layoff-risk">
                      <span class="risk-label">Layoff Risk:</span>
                      <span class="risk-value" [class]="'risk-' + companyResult().layoffRisk.level">
                        {{ companyResult().layoffRisk.probability }}% ({{ companyResult().layoffRisk.level }})
                      </span>
                    </div>
                    <p class="summary">{{ companyResult().executiveSummary }}</p>
                    <div class="signals">
                      @for (signal of companyResult().signals; track signal.name) {
                        <div class="signal" [class]="'signal-' + signal.sentiment">
                          <span class="signal-name">{{ signal.name }}</span>
                          <span class="signal-sentiment">{{ signal.sentiment }}</span>
                        </div>
                      }
                    </div>
                    <div class="recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        @for (rec of companyResult().recommendations; track rec) {
                          <li>{{ rec }}</li>
                        }
                      </ul>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          @case ('jobs') {
            <div class="coming-soon">
              <div class="coming-soon-content">
                <span class="coming-icon">🎯</span>
                <h2>Job Posting X-Ray</h2>
                <p>See through job requirements - what's real vs wishlist</p>
                <div class="role-select">
                  <select [(ngModel)]="selectedRole" class="role-dropdown">
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="ML Engineer">ML Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                  <button class="analyze-btn" (click)="analyzeJobs()">X-Ray Market</button>
                </div>
                @if (jobResult()) {
                  <div class="job-result">
                    <div class="market-timing">
                      <span class="timing-label">Market Timing:</span>
                      <span class="timing-value">{{ jobResult().timing.bestTime }}</span>
                    </div>
                    <p class="summary">{{ jobResult().summary }}</p>

                    <h4>Real Requirements (must-have):</h4>
                    <div class="requirements">
                      @for (req of jobResult().realRequirements; track req.skill) {
                        @if (req.mustHave) {
                          <div class="req-card">
                            <span class="req-skill">{{ req.skill }}</span>
                            <span class="req-freq">{{ req.frequency }}% of jobs</span>
                            <span class="req-change" [class.positive]="req.yoyChange > 0">
                              {{ req.yoyChange > 0 ? '+' : '' }}{{ req.yoyChange }}% YoY
                            </span>
                          </div>
                        }
                      }
                    </div>

                    <h4>🎭 Wishlist Items (ignore these):</h4>
                    <div class="wishlist">
                      @for (item of jobResult().wishlistItems; track item.requirement) {
                        <div class="wishlist-card">
                          <span class="wishlist-req">{{ item.requirement }}</span>
                          <p class="wishlist-reality">{{ item.reality }}</p>
                          <p class="wishlist-strategy">💡 {{ item.strategy }}</p>
                        </div>
                      }
                    </div>

                    <h4>🚀 Emerging Skills:</h4>
                    <div class="emerging">
                      @for (skill of jobResult().emergingSkills; track skill.name) {
                        <div class="emerging-card">
                          <span class="emerging-name">{{ skill.name }}</span>
                          <span class="emerging-growth">+{{ skill.mentionGrowth }}% growth</span>
                          <span class="emerging-time">Mainstream: {{ skill.timeToMainstream }}</span>
                        </div>
                      }
                    </div>

                    <h4>🚩 Red Flags to Watch:</h4>
                    <div class="redflags">
                      @for (flag of jobResult().redFlags; track flag.phrase) {
                        <div class="redflag-card">
                          <span class="flag-phrase">"{{ flag.phrase }}"</span>
                          <span class="flag-danger">⚠️ {{ flag.dangerScore }}% danger</span>
                          <p class="flag-meaning">{{ flag.meaning }}</p>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        }
      </div>

      <!-- Unique Value Props -->
      <div class="value-props">
        <div class="prop">
          <span class="prop-icon">📊</span>
          <h4>Real Data</h4>
          <p>GitHub API, HN, research papers - not guesses</p>
        </div>
        <div class="prop">
          <span class="prop-icon">🎯</span>
          <h4>Personalized</h4>
          <p>Analysis of YOUR profile, not generic advice</p>
        </div>
        <div class="prop">
          <span class="prop-icon">💰</span>
          <h4>Actionable</h4>
          <p>Specific skills, courses, salary impacts</p>
        </div>
        <div class="prop">
          <span class="prop-icon">⚡</span>
          <h4>Unique</h4>
          <p>Features no other career tool has</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .career-intel-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0f1a 0%, #111827 100%);
      padding: 2rem;
    }

    .hero {
      text-align: center;
      padding: 3rem 0;
    }

    .hero-badge {
      display: inline-block;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2));
      border: 1px solid rgba(139, 92, 246, 0.3);
      padding: 0.5rem 1.25rem;
      border-radius: 20px;
      font-size: 0.875rem;
      color: #a78bfa;
      margin-bottom: 1rem;
      letter-spacing: 0.1em;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.5rem;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.25rem;
      margin: 0;
    }

    .tabs-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto 2rem;
    }

    .tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab:hover {
      background: rgba(0, 0, 0, 0.4);
      border-color: rgba(139, 92, 246, 0.3);
      transform: translateY(-2px);
    }

    .tab.active {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.1));
      border-color: rgba(139, 92, 246, 0.5);
    }

    .tab-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .tab-label {
      color: white;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .tab-desc {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.75rem;
    }

    .content-area {
      max-width: 1200px;
      margin: 0 auto;
    }

    .coming-soon {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
    }

    .coming-soon-content {
      text-align: center;
    }

    .coming-icon {
      font-size: 4rem;
      display: block;
      margin-bottom: 1rem;
    }

    .coming-soon h2 {
      color: white;
      margin: 0 0 0.5rem;
    }

    .coming-soon p {
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 1.5rem;
    }

    .company-search, .role-select {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .company-input, .role-dropdown {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      font-size: 1rem;
      width: 250px;
    }

    .company-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
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

    .analyze-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
    }

    .company-result, .job-result {
      text-align: left;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1rem;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .result-header h3 {
      color: white;
      margin: 0;
    }

    .health-score {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
      border-radius: 8px;
    }

    .health-score.high { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .health-score.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .health-score.low { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

    .layoff-risk {
      margin-bottom: 1rem;
    }

    .risk-label {
      color: rgba(255, 255, 255, 0.6);
      margin-right: 0.5rem;
    }

    .risk-value {
      font-weight: 600;
    }

    .risk-low { color: #10b981; }
    .risk-moderate { color: #f59e0b; }
    .risk-elevated { color: #f97316; }
    .risk-high, .risk-critical { color: #ef4444; }

    .summary {
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 1rem;
      font-size: 0.95rem;
    }

    .signals {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .signal {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .signal-positive { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); }
    .signal-negative { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
    .signal-neutral { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }

    .signal-name { color: white; }
    .signal-sentiment { color: rgba(255, 255, 255, 0.5); font-size: 0.75rem; }

    .recommendations h4 {
      color: white;
      margin: 1rem 0 0.5rem;
      font-size: 0.9rem;
    }

    .recommendations ul {
      margin: 0;
      padding-left: 1.25rem;
    }

    .recommendations li {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .market-timing {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
    }

    .timing-label {
      color: rgba(255, 255, 255, 0.6);
      margin-right: 0.5rem;
    }

    .timing-value {
      color: #10b981;
      font-weight: 600;
    }

    .job-result h4 {
      color: white;
      margin: 1.5rem 0 0.75rem;
      font-size: 0.95rem;
    }

    .requirements, .wishlist, .emerging, .redflags {
      display: grid;
      gap: 0.75rem;
    }

    .req-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
    }

    .req-skill {
      color: white;
      font-weight: 500;
    }

    .req-freq {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
    }

    .req-change {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .req-change.positive { color: #10b981; }

    .wishlist-card {
      padding: 1rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
    }

    .wishlist-req {
      color: #f59e0b;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .wishlist-reality {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin: 0 0 0.5rem;
    }

    .wishlist-strategy {
      color: #10b981;
      font-size: 0.85rem;
      margin: 0;
    }

    .emerging-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 8px;
    }

    .emerging-name {
      color: #a78bfa;
      font-weight: 600;
    }

    .emerging-growth {
      color: #10b981;
      font-weight: 600;
    }

    .emerging-time {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
    }

    .redflag-card {
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
    }

    .flag-phrase {
      color: #f87171;
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }

    .flag-danger {
      color: #f87171;
      font-size: 0.8rem;
    }

    .flag-meaning {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.85rem;
      margin: 0.5rem 0 0;
    }

    .value-props {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
      margin: 3rem auto 0;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .prop {
      text-align: center;
    }

    .prop-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .prop h4 {
      color: white;
      margin: 0 0 0.25rem;
    }

    .prop p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .tabs-container {
        grid-template-columns: repeat(2, 1fr);
      }

      .value-props {
        grid-template-columns: repeat(2, 1fr);
      }

      .hero h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class CareerIntelPage {
  activeTab = signal<TabType>('github');
  companyInput = '';
  selectedRole = 'Software Engineer';
  companyResult = signal<any>(null);
  jobResult = signal<any>(null);

  setTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  analyzeCompany() {
    if (!this.companyInput.trim()) return;

    fetch(`${(window as any).env?.apiUrl || 'http://localhost:8080'}/api/career-intel/company/${this.companyInput.trim()}`)
      .then(res => res.json())
      .then(data => this.companyResult.set(data))
      .catch(() => {});
  }

  analyzeJobs() {
    fetch(`${(window as any).env?.apiUrl || 'http://localhost:8080'}/api/career-intel/jobs?role=${encodeURIComponent(this.selectedRole)}`)
      .then(res => res.json())
      .then(data => this.jobResult.set(data))
      .catch(() => {});
  }

  getHealthClass(): string {
    const score = this.companyResult()?.healthScore || 0;
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}
