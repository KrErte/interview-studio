import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubDNAComponent } from './github-dna.component';
import { SkillArbitrageComponent } from './skill-arbitrage.component';
import { ApiClient } from '../../../core/api/api-client.service';

type TabType = 'github' | 'arbitrage' | 'company' | 'jobs';

@Component({
  selector: 'app-career-intel',
  standalone: true,
  imports: [CommonModule, FormsModule, GitHubDNAComponent, SkillArbitrageComponent],
  template: `
    <div class="career-intel-page">
      <!-- Hero Section -->
      <div class="hero">
        <div class="hero-badge">CAREER INTELLIGENCE</div>
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
                  <button class="analyze-btn" (click)="analyzeCompany()" [disabled]="companyLoading()">
                    {{ companyLoading() ? 'Analyzing...' : 'Analyze' }}
                  </button>
                </div>
                @if (companyLoading()) {
                  <div style="text-align: center; padding: 2rem;">
                    <div style="width: 2rem; height: 2rem; border: 3px solid #fecaca; border-top-color: #dc2626; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;"></div>
                    <p style="color: #a8a29e; margin-top: 0.75rem; font-size: 0.875rem;">Analyzing company health...</p>
                  </div>
                }
                @if (companyError()) {
                  <div style="text-align: center; padding: 1rem; color: #dc2626; font-size: 0.875rem;">
                    {{ companyError() }}
                    <button (click)="analyzeCompany()" style="margin-left: 0.5rem; color: #dc2626; text-decoration: underline; background: none; border: none; cursor: pointer; font-weight: 700;">Retry</button>
                  </div>
                }
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
                  <button class="analyze-btn" (click)="analyzeJobs()" [disabled]="jobLoading()">
                    {{ jobLoading() ? 'Analyzing...' : 'X-Ray Market' }}
                  </button>
                </div>
                @if (jobLoading()) {
                  <div style="text-align: center; padding: 2rem;">
                    <div style="width: 2rem; height: 2rem; border: 3px solid #fecaca; border-top-color: #dc2626; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto;"></div>
                    <p style="color: #a8a29e; margin-top: 0.75rem; font-size: 0.875rem;">X-raying job market...</p>
                  </div>
                }
                @if (jobError()) {
                  <div style="text-align: center; padding: 1rem; color: #dc2626; font-size: 0.875rem;">
                    {{ jobError() }}
                    <button (click)="analyzeJobs()" style="margin-left: 0.5rem; color: #dc2626; text-decoration: underline; background: none; border: none; cursor: pointer; font-weight: 700;">Retry</button>
                  </div>
                }
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

                    <h4>Wishlist Items (ignore these):</h4>
                    <div class="wishlist">
                      @for (item of jobResult().wishlistItems; track item.requirement) {
                        <div class="wishlist-card">
                          <span class="wishlist-req">{{ item.requirement }}</span>
                          <p class="wishlist-reality">{{ item.reality }}</p>
                          <p class="wishlist-strategy">→ {{ item.strategy }}</p>
                        </div>
                      }
                    </div>

                    <h4>Emerging Skills:</h4>
                    <div class="emerging">
                      @for (skill of jobResult().emergingSkills; track skill.name) {
                        <div class="emerging-card">
                          <span class="emerging-name">{{ skill.name }}</span>
                          <span class="emerging-growth">+{{ skill.mentionGrowth }}% growth</span>
                          <span class="emerging-time">Mainstream: {{ skill.timeToMainstream }}</span>
                        </div>
                      }
                    </div>

                    <h4>Red Flags to Watch:</h4>
                    <div class="redflags">
                      @for (flag of jobResult().redFlags; track flag.phrase) {
                        <div class="redflag-card">
                          <span class="flag-phrase">"{{ flag.phrase }}"</span>
                          <span class="flag-danger">⚠ {{ flag.dangerScore }}% danger</span>
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
      background: #fafaf9;
      padding: 2rem;
    }

    .hero {
      text-align: center;
      padding: 3rem 0;
    }

    .hero-badge {
      display: inline-block;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 0.5rem 1.25rem;
      font-size: 0.75rem;
      color: #dc2626;
      margin-bottom: 1rem;
      letter-spacing: 0.1em;
      font-weight: 700;
      text-transform: uppercase;
    }

    .hero h1 {
      font-size: 3rem;
      font-weight: 800;
      color: #1c1917;
      margin: 0 0 0.5rem;
    }

    .hero-subtitle {
      color: #57534e;
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
      background: white;
      border: 1px solid #e7e5e4;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab:hover {
      background: #fafaf9;
      border-color: #d6d3d1;
    }

    .tab.active {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .tab-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .tab-label {
      color: #1c1917;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .tab-desc {
      color: #a8a29e;
      font-size: 0.75rem;
    }

    .content-area {
      max-width: 1200px;
      margin: 0 auto;
    }

    .coming-soon {
      background: white;
      border: 1px solid #e7e5e4;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
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
      color: #1c1917;
      margin: 0 0 0.5rem;
    }

    .coming-soon p {
      color: #a8a29e;
      margin: 0 0 1.5rem;
    }

    .company-search, .role-select {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .company-input, .role-dropdown {
      background: white;
      border: 1px solid #e7e5e4;
      color: #1c1917;
      padding: 0.75rem 1.25rem;
      font-size: 1rem;
      width: 250px;
    }

    .company-input::placeholder {
      color: #a8a29e;
    }

    .analyze-btn {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .analyze-btn:hover {
      background: #b91c1c;
    }

    .company-result, .job-result {
      text-align: left;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
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
      color: #1c1917;
      margin: 0;
    }

    .health-score {
      font-size: 1.5rem;
      font-weight: 700;
      padding: 0.5rem 1rem;
    }

    .health-score.high { background: #fafaf9; color: #1c1917; border: 1px solid #e7e5e4; }
    .health-score.medium { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .health-score.low { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

    .layoff-risk {
      margin-bottom: 1rem;
    }

    .risk-label {
      color: #57534e;
      margin-right: 0.5rem;
    }

    .risk-value {
      font-weight: 600;
    }

    .risk-low { color: #1c1917; }
    .risk-moderate { color: #b45309; }
    .risk-elevated { color: #b45309; }
    .risk-high, .risk-critical { color: #dc2626; }

    .summary {
      color: #57534e;
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
      font-size: 0.85rem;
    }

    .signal-positive { background: #fafaf9; border: 1px solid #e7e5e4; }
    .signal-negative { background: #fef2f2; border: 1px solid #fecaca; }
    .signal-neutral { background: #fafaf9; border: 1px solid #e7e5e4; }

    .signal-name { color: #1c1917; }
    .signal-sentiment { color: #a8a29e; font-size: 0.75rem; }

    .recommendations h4 {
      color: #1c1917;
      margin: 1rem 0 0.5rem;
      font-size: 0.9rem;
    }

    .recommendations ul {
      margin: 0;
      padding-left: 1.25rem;
    }

    .recommendations li {
      color: #57534e;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
    }

    .market-timing {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #fafaf9;
      border: 1px solid #e7e5e4;
    }

    .timing-label {
      color: #57534e;
      margin-right: 0.5rem;
    }

    .timing-value {
      color: #1c1917;
      font-weight: 600;
    }

    .job-result h4 {
      color: #1c1917;
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
      background: #fafaf9;
      border: 1px solid #e7e5e4;
    }

    .req-skill {
      color: #1c1917;
      font-weight: 500;
    }

    .req-freq {
      color: #57534e;
      font-size: 0.85rem;
    }

    .req-change {
      font-weight: 600;
      font-size: 0.85rem;
    }

    .req-change.positive { color: #1c1917; }

    .wishlist-card {
      padding: 1rem;
      background: #fffbeb;
      border: 1px solid #fde68a;
    }

    .wishlist-req {
      color: #b45309;
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }

    .wishlist-reality {
      color: #57534e;
      font-size: 0.85rem;
      margin: 0 0 0.5rem;
    }

    .wishlist-strategy {
      color: #1c1917;
      font-size: 0.85rem;
      margin: 0;
    }

    .emerging-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .emerging-name {
      color: #dc2626;
      font-weight: 600;
    }

    .emerging-growth {
      color: #1c1917;
      font-weight: 600;
    }

    .emerging-time {
      color: #a8a29e;
      font-size: 0.85rem;
    }

    .redflag-card {
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .flag-phrase {
      color: #dc2626;
      font-weight: 600;
      display: block;
      margin-bottom: 0.25rem;
    }

    .flag-danger {
      color: #dc2626;
      font-size: 0.8rem;
    }

    .flag-meaning {
      color: #57534e;
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
      border-top: 1px solid #e7e5e4;
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
      color: #1c1917;
      margin: 0 0 0.25rem;
    }

    .prop p {
      color: #a8a29e;
      font-size: 0.85rem;
      margin: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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
  private readonly api = inject(ApiClient);

  activeTab = signal<TabType>('github');
  companyInput = '';
  selectedRole = 'Software Engineer';
  companyResult = signal<any>(null);
  jobResult = signal<any>(null);
  companyLoading = signal(false);
  jobLoading = signal(false);
  companyError = signal('');
  jobError = signal('');

  setTab(tab: TabType) {
    this.activeTab.set(tab);
  }

  analyzeCompany() {
    if (!this.companyInput.trim()) return;

    this.companyLoading.set(true);
    this.companyError.set('');
    this.companyResult.set(null);

    this.api.get<any>(`/career-intel/company/${encodeURIComponent(this.companyInput.trim())}`).subscribe({
      next: (data) => {
        this.companyResult.set(data);
        this.companyLoading.set(false);
      },
      error: () => {
        this.companyLoading.set(false);
        this.companyError.set('Failed to analyze company. Please try again.');
      }
    });
  }

  analyzeJobs() {
    this.jobLoading.set(true);
    this.jobError.set('');
    this.jobResult.set(null);

    this.api.get<any>('/career-intel/jobs', {
      params: { role: this.selectedRole }
    }).subscribe({
      next: (data) => {
        this.jobResult.set(data);
        this.jobLoading.set(false);
      },
      error: () => {
        this.jobLoading.set(false);
        this.jobError.set('Failed to analyze job market. Please try again.');
      }
    });
  }

  getHealthClass(): string {
    const score = this.companyResult()?.healthScore || 0;
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}
