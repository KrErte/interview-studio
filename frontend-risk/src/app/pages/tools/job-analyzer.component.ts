import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TierService } from '../../core/services/tier.service';
import { ArenaApiService, JobXrayResponse } from '../../core/services/arena-api.service';

interface AnalysisResult {
  mustHave: string[];
  niceToHave: string[];
  redFlags: RedFlag[];
  salaryEstimate: { min: number; max: number; currency: string } | null;
  experienceRequired: { min: number; max: number };
  remotePolicy: string;
  techStack: TechItem[];
  companySignals: CompanySignal[];
  matchScore: number;
  recommendations: string[];
}

interface RedFlag {
  text: string;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

interface TechItem {
  name: string;
  category: string;
  demand: 'rising' | 'stable' | 'declining';
}

interface CompanySignal {
  type: 'positive' | 'neutral' | 'negative';
  text: string;
}

@Component({
  selector: 'app-job-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="analyzer-container">
      <div class="header">
        <h1>🔬 Job Posting X-Ray</h1>
        <p>Paste any job description to see what they really want vs wishlist</p>
      </div>

      @if (rateLimited()) {
        <div class="rate-limit-banner">
          <div class="banner-icon">🔒</div>
          <h3>Daily limit reached</h3>
          <p>Free users get 1 analysis per day. Upgrade to Professional for unlimited analyses.</p>
          <a routerLink="/pricing" class="upgrade-btn">Upgrade to Professional</a>
        </div>
      }

      @if (!result() && !rateLimited()) {
        <div class="input-section">
          <textarea
            [(ngModel)]="jobText"
            placeholder="Paste the full job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience...
Requirements:
- Strong knowledge of React, TypeScript
- Experience with AWS services
..."
            rows="15">
          </textarea>

          <div class="input-actions">
            <span class="char-count">{{ jobText.length }} characters</span>
            <button
              class="btn-analyze"
              (click)="analyzeJob()"
              [disabled]="jobText.length < 100 || isAnalyzing()">
              @if (isAnalyzing()) {
                <span class="spinner"></span> Analyzing...
              } @else {
                Analyze job posting →
              }
            </button>
          </div>

          <div class="tips">
            <h4>💡 Tips</h4>
            <ul>
              <li>Copy the entire job posting text, not just requirements</li>
              <li>LinkedIn, Indeed, Glassdoor - all work</li>
              <li>More text means better analysis</li>
            </ul>
          </div>
        </div>
      } @else {
        <div class="results fade-in">
          <button class="btn-back" (click)="reset()">← Analyze new posting</button>

          <!-- Match Score -->
          <div class="match-score-card">
            <div class="score-circle" [class]="getScoreClass(result()!.matchScore)">
              {{ result()!.matchScore }}%
            </div>
            <div class="score-info">
              <h3>Your Match Score</h3>
              <p>Based on comparison of your profile and this posting</p>
            </div>
          </div>

          <!-- Requirements Analysis -->
          <div class="section">
            <h2>📋 Requirements Analysis</h2>
            <div class="two-columns">
              <div class="column must-have">
                <h3>🎯 Must Have (truly required)</h3>
                @for (item of result()!.mustHave; track item) {
                  <div class="req-item">
                    <span class="check">✓</span>
                    {{ item }}
                  </div>
                }
              </div>
              <div class="column nice-to-have">
                <h3>✨ Nice to Have (wishlist)</h3>
                @for (item of result()!.niceToHave; track item) {
                  <div class="req-item">
                    <span class="star">☆</span>
                    {{ item }}
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Red Flags -->
          @if (result()!.redFlags.length > 0) {
            <div class="section red-flags">
              <h2>🚩 Red Flags</h2>
              @for (flag of result()!.redFlags; track flag.text) {
                <div class="flag-item" [class]="flag.severity">
                  <div class="flag-header">
                    <span class="severity-badge">{{ flag.severity }}</span>
                    <span class="flag-text">{{ flag.text }}</span>
                  </div>
                  <p class="flag-explanation">{{ flag.explanation }}</p>
                </div>
              }
            </div>
          }

          <!-- Tech Stack -->
          <div class="section">
            <h2>🛠 Tech Stack Analysis</h2>
            <div class="tech-grid">
              @for (tech of result()!.techStack; track tech.name) {
                <div class="tech-item" [class]="tech.demand">
                  <span class="tech-name">{{ tech.name }}</span>
                  <span class="tech-category">{{ tech.category }}</span>
                  <span class="tech-demand">
                    @if (tech.demand === 'rising') { 📈 Rising }
                    @else if (tech.demand === 'declining') { 📉 Declining }
                    @else { ➡️ Stable }
                  </span>
                </div>
              }
            </div>
          </div>

          <!-- Company Signals -->
          <div class="section">
            <h2>🏢 Company Signals</h2>
            <div class="signals-list">
              @for (signal of result()!.companySignals; track signal.text) {
                <div class="signal-item" [class]="signal.type">
                  @if (signal.type === 'positive') { ✅ }
                  @else if (signal.type === 'negative') { ⚠️ }
                  @else { ℹ️ }
                  {{ signal.text }}
                </div>
              }
            </div>
          </div>

          <!-- Salary & Details -->
          <div class="section details-grid">
            <div class="detail-card">
              <h4>💰 Salary Estimate</h4>
              @if (result()!.salaryEstimate) {
                <p class="big-text">
                  {{ result()!.salaryEstimate!.currency }}{{ result()!.salaryEstimate!.min | number }}
                  - {{ result()!.salaryEstimate!.max | number }}
                </p>
              } @else {
                <p class="muted">Salary not mentioned</p>
              }
            </div>
            <div class="detail-card">
              <h4>📅 Experience Required</h4>
              <p class="big-text">
                {{ result()!.experienceRequired.min }}-{{ result()!.experienceRequired.max }} years
              </p>
            </div>
            <div class="detail-card">
              <h4>🏠 Remote Policy</h4>
              <p class="big-text">{{ result()!.remotePolicy }}</p>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="section recommendations">
            <h2>💡 Recommendations</h2>
            @for (rec of result()!.recommendations; track rec) {
              <div class="rec-item">{{ rec }}</div>
            }
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .analyzer-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .header p {
      color: #94a3b8;
    }

    .input-section textarea {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      color: #e2e8f0;
      font-size: 1rem;
      line-height: 1.6;
      resize: vertical;
      font-family: inherit;
    }

    .input-section textarea:focus {
      outline: none;
      border-color: #10b981;
    }

    .input-section textarea::placeholder {
      color: #64748b;
    }

    .input-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
    }

    .char-count {
      color: #64748b;
      font-size: 0.875rem;
    }

    .btn-analyze {
      background: linear-gradient(135deg, #10b981, #06d6a0);
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-analyze:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .tips {
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 12px;
      border-left: 4px solid #3b82f6;
    }

    .tips h4 {
      color: #3b82f6;
      margin-bottom: 0.75rem;
    }

    .tips ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #94a3b8;
    }

    .tips li {
      margin-bottom: 0.5rem;
    }

    .results {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .btn-back {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .match-score-card {
      display: flex;
      align-items: center;
      gap: 2rem;
      background: rgba(255,255,255,0.05);
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: #fff;
    }

    .score-circle.high { background: linear-gradient(135deg, #10b981, #06d6a0); }
    .score-circle.medium { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
    .score-circle.low { background: linear-gradient(135deg, #ef4444, #f87171); }

    .score-info h3 {
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .score-info p {
      color: #94a3b8;
    }

    .section {
      background: rgba(255,255,255,0.03);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .section h2 {
      color: #f1f5f9;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .column h3 {
      font-size: 1rem;
      margin-bottom: 1rem;
      color: #e2e8f0;
    }

    .must-have h3 { color: #10b981; }
    .nice-to-have h3 { color: #8b5cf6; }

    .req-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      color: #cbd5e1;
    }

    .check { color: #10b981; }
    .star { color: #8b5cf6; }

    .red-flags {
      border-left: 4px solid #ef4444;
    }

    .flag-item {
      background: rgba(239, 68, 68, 0.1);
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .flag-item.high { background: rgba(239, 68, 68, 0.15); }
    .flag-item.medium { background: rgba(245, 158, 11, 0.15); }
    .flag-item.low { background: rgba(59, 130, 246, 0.15); }

    .flag-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .severity-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      background: rgba(255,255,255,0.1);
    }

    .flag-text {
      color: #f1f5f9;
      font-weight: 500;
    }

    .flag-explanation {
      color: #94a3b8;
      font-size: 0.875rem;
      margin: 0;
    }

    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .tech-item {
      background: rgba(255,255,255,0.05);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tech-item.rising { border-left: 3px solid #10b981; }
    .tech-item.declining { border-left: 3px solid #ef4444; }
    .tech-item.stable { border-left: 3px solid #64748b; }

    .tech-name {
      color: #f1f5f9;
      font-weight: 500;
    }

    .tech-category {
      color: #64748b;
      font-size: 0.75rem;
    }

    .tech-demand {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .signals-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .signal-item {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #e2e8f0;
    }

    .signal-item.positive { background: rgba(16, 185, 129, 0.1); }
    .signal-item.negative { background: rgba(239, 68, 68, 0.1); }
    .signal-item.neutral { background: rgba(255,255,255,0.05); }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      background: transparent;
      padding: 0;
    }

    .detail-card {
      background: rgba(255,255,255,0.05);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }

    .detail-card h4 {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .big-text {
      color: #10b981;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .muted {
      color: #64748b;
    }

    .recommendations {
      border-left: 4px solid #10b981;
    }

    .rec-item {
      padding: 0.75rem 1rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      margin-bottom: 0.75rem;
      color: #e2e8f0;
    }

    @media (max-width: 768px) {
      .two-columns {
        grid-template-columns: 1fr;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }


    .rate-limit-banner {
      text-align: center;
      padding: 3rem 2rem;
      background: rgba(255,255,255,0.03);
      border: 2px solid rgba(245, 158, 11, 0.3);
      border-radius: 16px;
      margin-bottom: 2rem;
    }

    .rate-limit-banner .banner-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .rate-limit-banner h3 {
      font-size: 1.5rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .rate-limit-banner p {
      color: #94a3b8;
      max-width: 400px;
      margin: 0 auto 1.5rem;
    }

    .upgrade-btn {
      display: inline-block;
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #10b981, #06d6a0);
      border-radius: 8px;
      color: #0f172a;
      font-weight: 600;
      text-decoration: none;
    }

    .upgrade-btn:hover {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  `]
})
export class JobAnalyzerComponent {
  private readonly tierService = inject(TierService);
  private readonly arenaApi = inject(ArenaApiService);

  jobText = '';
  isAnalyzing = signal(false);
  result = signal<AnalysisResult | null>(null);
  rateLimited = signal(false);

  private readonly RATE_LIMIT_KEY = 'jobAnalyzer_lastUsed';

  constructor() {
    this.checkRateLimit();
  }

  private checkRateLimit(): void {
    if (this.tierService.canAccessUnlimitedAnalyzer()) return;
    const lastUsed = localStorage.getItem(this.RATE_LIMIT_KEY);
    if (lastUsed) {
      const lastDate = new Date(lastUsed).toDateString();
      const today = new Date().toDateString();
      if (lastDate === today) {
        this.rateLimited.set(true);
      }
    }
  }

  private recordUsage(): void {
    if (!this.tierService.canAccessUnlimitedAnalyzer()) {
      localStorage.setItem(this.RATE_LIMIT_KEY, new Date().toISOString());
    }
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  reset() {
    this.result.set(null);
    this.jobText = '';
  }

  analyzeJob() {
    this.isAnalyzing.set(true);

    this.arenaApi.analyzeJob(this.jobText).subscribe({
      next: (aiResult) => {
        // Map AI response to local AnalysisResult format
        const analysis = this.mapAiResult(aiResult);
        this.result.set(analysis);
        this.isAnalyzing.set(false);
        this.recordUsage();
      },
      error: (err) => {
        // Fallback to local analysis if API fails
        const analysis = this.performAnalysis(this.jobText);
        this.result.set(analysis);
        this.isAnalyzing.set(false);
        this.recordUsage();
      }
    });
  }

  private mapAiResult(ai: JobXrayResponse): AnalysisResult {
    return {
      mustHave: ai.realRequirements || [],
      niceToHave: ai.hiddenRequirements || [],
      redFlags: (ai.redFlags || []).map(f => ({ text: f, severity: 'medium' as const, explanation: '' })),
      salaryEstimate: null,
      experienceRequired: { min: 0, max: 0 },
      remotePolicy: 'See analysis',
      techStack: (ai.atsKeywords || []).map(kw => ({ name: kw, category: 'ATS', demand: 'stable' as const })),
      companySignals: [
        ...(ai.greenFlags || []).map(f => ({ type: 'positive' as const, text: f })),
        ...(ai.redFlags || []).map(f => ({ type: 'negative' as const, text: f })),
        ...(ai.cultureSignals ? [{ type: 'neutral' as const, text: ai.cultureSignals }] : [])
      ],
      matchScore: 0,
      recommendations: ai.fitTips || []
    };
  }

  private performAnalysis(text: string): AnalysisResult {
    const lowerText = text.toLowerCase();

    // Extract technologies
    const techPatterns = [
      { name: 'React', category: 'Frontend', pattern: /react/i },
      { name: 'Angular', category: 'Frontend', pattern: /angular/i },
      { name: 'Vue', category: 'Frontend', pattern: /vue/i },
      { name: 'TypeScript', category: 'Language', pattern: /typescript/i },
      { name: 'JavaScript', category: 'Language', pattern: /javascript/i },
      { name: 'Python', category: 'Language', pattern: /python/i },
      { name: 'Java', category: 'Language', pattern: /\bjava\b/i },
      { name: 'Node.js', category: 'Backend', pattern: /node\.?js/i },
      { name: 'AWS', category: 'Cloud', pattern: /\baws\b/i },
      { name: 'Docker', category: 'DevOps', pattern: /docker/i },
      { name: 'Kubernetes', category: 'DevOps', pattern: /kubernetes|k8s/i },
      { name: 'PostgreSQL', category: 'Database', pattern: /postgres/i },
      { name: 'MongoDB', category: 'Database', pattern: /mongo/i },
      { name: 'GraphQL', category: 'API', pattern: /graphql/i },
      { name: 'REST', category: 'API', pattern: /rest\s?api/i },
      { name: 'CI/CD', category: 'DevOps', pattern: /ci\/?cd/i },
      { name: 'Git', category: 'Tools', pattern: /\bgit\b/i },
      { name: 'Agile', category: 'Process', pattern: /agile|scrum/i },
    ];

    const techStack: TechItem[] = techPatterns
      .filter(t => t.pattern.test(text))
      .map(t => ({
        name: t.name,
        category: t.category,
        demand: this.getTechDemand(t.name)
      }));

    // Detect must-have vs nice-to-have
    const mustHave: string[] = [];
    const niceToHave: string[] = [];

    const requirements = this.extractRequirements(text);
    requirements.forEach(req => {
      if (this.isMustHave(req, text)) {
        mustHave.push(req);
      } else {
        niceToHave.push(req);
      }
    });

    // Detect red flags
    const redFlags: RedFlag[] = [];

    if (/rockstar|ninja|guru|wizard/i.test(text)) {
      redFlags.push({
        text: 'Uses "rockstar/ninja/guru" terminology',
        severity: 'medium',
        explanation: 'Suggests immature company culture or unrealistic expectations'
      });
    }

    if (/fast[- ]?paced|wear many hats|startup mentality/i.test(text)) {
      redFlags.push({
        text: 'Expects "fast-paced" work environment',
        severity: 'low',
        explanation: 'May mean overwork or lack of processes'
      });
    }

    if (/unlimited pto|unlimited vacation/i.test(text)) {
      redFlags.push({
        text: 'Unlimited PTO',
        severity: 'low',
        explanation: 'Statistically people take less time off than with traditional systems'
      });
    }

    if (techStack.length > 10) {
      redFlags.push({
        text: `Requires ${techStack.length} different technologies`,
        severity: 'medium',
        explanation: 'Too long a list suggests they don\'t know exactly what they want'
      });
    }

    if (/competitive salary|salary commensurate/i.test(text) && !/\$\d|€\d|\d+k/i.test(text)) {
      redFlags.push({
        text: 'Salary not disclosed',
        severity: 'medium',
        explanation: 'Companies that don\'t disclose salary typically pay below market average'
      });
    }

    // Experience detection
    const expMatch = text.match(/(\d+)\+?\s*(?:years?|aasta)/i);
    const minExp = expMatch ? parseInt(expMatch[1]) : 3;

    // Remote detection
    let remotePolicy = 'Not mentioned';
    if (/fully remote|100% remote/i.test(text)) remotePolicy = '100% Remote';
    else if (/hybrid/i.test(text)) remotePolicy = 'Hybrid';
    else if (/on[- ]?site|office/i.test(text)) remotePolicy = 'On-site';
    else if (/remote/i.test(text)) remotePolicy = 'Remote possible';

    // Salary detection
    let salaryEstimate = null;
    const salaryMatch = text.match(/[\$€](\d{1,3}),?(\d{3})(?:\s*[-–]\s*[\$€]?(\d{1,3}),?(\d{3}))?/);
    if (salaryMatch) {
      const min = parseInt(salaryMatch[1] + salaryMatch[2]);
      const max = salaryMatch[3] ? parseInt(salaryMatch[3] + salaryMatch[4]) : min * 1.3;
      salaryEstimate = { min, max, currency: text.includes('€') ? '€' : '$' };
    }

    // Company signals
    const companySignals: CompanySignal[] = [];

    if (/series [a-c]|seed|funded/i.test(text)) {
      companySignals.push({ type: 'neutral', text: 'Startup - funded but higher risk' });
    }
    if (/fortune 500|established|leader/i.test(text)) {
      companySignals.push({ type: 'positive', text: 'Large company - more stable but slower career growth' });
    }
    if (/equity|stock options|esop/i.test(text)) {
      companySignals.push({ type: 'positive', text: 'Offers equity in the company' });
    }
    if (/learning|growth|development/i.test(text)) {
      companySignals.push({ type: 'positive', text: 'Emphasizes learning and development' });
    }
    if (/immediate|asap|urgent/i.test(text)) {
      companySignals.push({ type: 'negative', text: 'Urgent need - someone left unexpectedly?' });
    }

    // Match score based on user profile (if exists)
    const savedAssessment = localStorage.getItem('careerAssessment');
    let matchScore = 65; // default
    if (savedAssessment) {
      const assessment = JSON.parse(savedAssessment);
      const userSkills = assessment.skills.map((s: any) => s.name.toLowerCase());
      const matchedTech = techStack.filter(t => userSkills.includes(t.name.toLowerCase()));
      matchScore = Math.min(95, Math.round((matchedTech.length / Math.max(techStack.length, 1)) * 100) + 20);
    }

    // Recommendations
    const recommendations = this.generateRecommendations(techStack, mustHave, redFlags, matchScore);

    return {
      mustHave,
      niceToHave,
      redFlags,
      salaryEstimate,
      experienceRequired: { min: minExp, max: minExp + 3 },
      remotePolicy,
      techStack,
      companySignals,
      matchScore,
      recommendations
    };
  }

  private extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const lines = text.split('\n');

    lines.forEach(line => {
      const cleaned = line.trim();
      if (cleaned.match(/^[-•*]\s*/) || cleaned.match(/^\d+\.\s*/)) {
        const req = cleaned.replace(/^[-•*\d.]\s*/, '').trim();
        if (req.length > 10 && req.length < 200) {
          requirements.push(req);
        }
      }
    });

    // Also extract from "Requirements:" section
    const reqSection = text.match(/requirements?:?\s*([\s\S]*?)(?:nice to have|preferred|benefits|$)/i);
    if (reqSection && requirements.length < 5) {
      const additionalReqs = reqSection[1].split(/[.\n]/).filter(r => r.trim().length > 20);
      requirements.push(...additionalReqs.slice(0, 10).map(r => r.trim()));
    }

    return [...new Set(requirements)].slice(0, 15);
  }

  private isMustHave(requirement: string, fullText: string): boolean {
    const mustHaveIndicators = /required|must have|essential|mandatory|need|strong/i;
    const niceToHaveIndicators = /nice to have|preferred|bonus|plus|ideally|optional/i;

    // Check context around this requirement
    const reqIndex = fullText.toLowerCase().indexOf(requirement.toLowerCase());
    const context = fullText.substring(Math.max(0, reqIndex - 100), reqIndex + requirement.length + 100);

    if (niceToHaveIndicators.test(context)) return false;
    if (mustHaveIndicators.test(context)) return true;

    // Default: first 60% are must-have
    const allReqs = this.extractRequirements(fullText);
    const position = allReqs.indexOf(requirement);
    return position < allReqs.length * 0.6;
  }

  private getTechDemand(tech: string): 'rising' | 'stable' | 'declining' {
    const rising = ['TypeScript', 'Rust', 'Go', 'Kubernetes', 'GraphQL', 'Next.js'];
    const declining = ['jQuery', 'PHP', 'Perl', 'CoffeeScript'];

    if (rising.includes(tech)) return 'rising';
    if (declining.includes(tech)) return 'declining';
    return 'stable';
  }

  private generateRecommendations(
    techStack: TechItem[],
    mustHave: string[],
    redFlags: RedFlag[],
    matchScore: number
  ): string[] {
    const recs: string[] = [];

    if (matchScore < 50) {
      recs.push('Your profile doesn\'t match well - focus on missing must-have skills before applying');
    } else if (matchScore > 80) {
      recs.push('Strong match! Highlight specific experience with mentioned technologies in your CV');
    }

    const risingTech = techStack.filter(t => t.demand === 'rising');
    if (risingTech.length > 0) {
      recs.push(`Focus is on rising technologies (${risingTech.map(t => t.name).join(', ')}) - good sign for long-term career`);
    }

    if (redFlags.length >= 3) {
      recs.push('Multiple red flags - research the company on Glassdoor/Teamblind before applying');
    }

    if (mustHave.length > 8) {
      recs.push('Long requirements list - they\'re likely flexible, focus on meeting 70%');
    }

    return recs;
  }

  fillMockData() {
    this.jobText = `Senior Full Stack Developer - Remote

About Us:
We are a fast-growing SaaS company backed by Series B funding, looking for a talented developer to join our engineering team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in TypeScript and React
- Experience with Node.js and PostgreSQL
- Familiarity with AWS services (EC2, S3, Lambda)
- Knowledge of Docker and CI/CD pipelines
- Experience with REST APIs and GraphQL
- Strong problem-solving skills
- Excellent communication in English

Nice to Have:
- Experience with Kubernetes
- Knowledge of Python or Go
- Previous startup experience
- Contributions to open source projects

What We Offer:
- Competitive salary ($120,000 - $160,000)
- Equity/stock options
- Fully remote work
- Unlimited PTO
- Learning and development budget
- Health insurance

We're looking for someone who can wear many hats and thrives in a fast-paced environment!`;
    this.result.set(null);
  }
}
