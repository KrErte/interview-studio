import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TruthCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface BrutalTruth {
  id: string;
  category: string;
  severity: 'uncomfortable' | 'harsh' | 'devastating';
  truth: string;
  explanation: string;
  actionable: string;
  heard: boolean;
}

interface ProfileInput {
  linkedInUrl: string;
  resumeText: string;
  currentRole: string;
  yearsExperience: number;
  desiredRole: string;
  salaryExpectation: number;
  jobSearchDuration: number; // months
  interviewsWithoutOffer: number;
  githubUrl: string;
}

@Component({
  selector: 'app-brutal-truth-machine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="truth-container">
      <div class="header">
        <div class="warning-banner">
          <span class="warning-icon">⚠️</span>
          <span>This tool provides brutally honest feedback. It may be uncomfortable.</span>
        </div>
        <h1>🪞 The Brutal Truth Machine</h1>
        <p>What recruiters think but won't tell you. What your friends are too nice to say.</p>
      </div>

      @if (!analysisComplete()) {
        <!-- Input Section -->
        <div class="input-section">
          <div class="input-header">
            <h2>Let's see what we're working with</h2>
            <p>The more you share, the harder the truths.</p>
          </div>

          <div class="input-grid">
            <div class="input-group full-width">
              <label>Paste your resume/CV text</label>
              <textarea
                [(ngModel)]="profile.resumeText"
                placeholder="Paste the full text of your resume here. Don't worry, we'll find all the weak spots..."
                rows="6"
              ></textarea>
            </div>

            <div class="input-group">
              <label>Current Role</label>
              <input type="text" [(ngModel)]="profile.currentRole" placeholder="e.g., Senior Developer" />
            </div>

            <div class="input-group">
              <label>Target Role</label>
              <input type="text" [(ngModel)]="profile.desiredRole" placeholder="e.g., Staff Engineer" />
            </div>

            <div class="input-group">
              <label>Years of Experience</label>
              <input type="number" [(ngModel)]="profile.yearsExperience" min="0" max="40" />
            </div>

            <div class="input-group">
              <label>Expected Salary ($)</label>
              <input type="number" [(ngModel)]="profile.salaryExpectation" placeholder="150000" />
            </div>

            <div class="input-group">
              <label>Months Job Searching</label>
              <input type="number" [(ngModel)]="profile.jobSearchDuration" min="0" placeholder="How long have you been looking?" />
            </div>

            <div class="input-group">
              <label>Interviews Without Offers</label>
              <input type="number" [(ngModel)]="profile.interviewsWithoutOffer" min="0" placeholder="How many rejections?" />
            </div>

            <div class="input-group">
              <label>LinkedIn URL (optional)</label>
              <input type="text" [(ngModel)]="profile.linkedInUrl" placeholder="https://linkedin.com/in/..." />
            </div>

            <div class="input-group">
              <label>GitHub URL (optional)</label>
              <input type="text" [(ngModel)]="profile.githubUrl" placeholder="https://github.com/..." />
            </div>
          </div>

          <div class="consent-section">
            <label class="consent-checkbox">
              <input type="checkbox" [(ngModel)]="consentGiven" />
              <span>I understand this feedback will be uncomfortable and I want the truth anyway</span>
            </label>
          </div>

          <button
            class="btn-analyze"
            [disabled]="!canAnalyze()"
            (click)="generateTruths()"
          >
            @if (isAnalyzing()) {
              <span class="spinner"></span> Finding the uncomfortable truths...
            } @else {
              Give Me The Truth →
            }
          </button>
        </div>
      } @else {
        <!-- Results Section -->
        <div class="results-section">
          <div class="results-header">
            <div class="truth-score">
              <div class="score-circle" [attr.data-level]="getScoreLevel()">
                {{ truthScore() }}
              </div>
              <span class="score-label">Truth Score</span>
              <p class="score-explanation">{{ getScoreExplanation() }}</p>
            </div>
            <button class="btn-reset" (click)="reset()">Start Over</button>
          </div>

          <!-- Category Filter -->
          <div class="category-filter">
            @for (cat of categories; track cat.id) {
              <button
                class="filter-btn"
                [class.active]="activeCategory() === cat.id || activeCategory() === 'all'"
                (click)="setCategory(cat.id)"
              >
                <span>{{ cat.icon }}</span>
                <span>{{ cat.name }}</span>
                <span class="count">{{ getTruthCount(cat.id) }}</span>
              </button>
            }
          </div>

          <!-- Truths List -->
          <div class="truths-list">
            @for (truth of filteredTruths(); track truth.id) {
              <div class="truth-card" [attr.data-severity]="truth.severity" [class.heard]="truth.heard">
                <div class="truth-header">
                  <div class="severity-badge" [attr.data-severity]="truth.severity">
                    {{ getSeverityLabel(truth.severity) }}
                  </div>
                  <span class="category-tag">{{ getCategoryName(truth.category) }}</span>
                </div>

                <div class="truth-content">
                  <p class="truth-text">{{ truth.truth }}</p>

                  @if (truth.heard) {
                    <div class="truth-details">
                      <div class="explanation">
                        <h4>Why This Matters</h4>
                        <p>{{ truth.explanation }}</p>
                      </div>
                      <div class="action">
                        <h4>What To Do About It</h4>
                        <p>{{ truth.actionable }}</p>
                      </div>
                    </div>
                  }
                </div>

                <button
                  class="btn-reveal"
                  (click)="revealTruth(truth)"
                  [class.revealed]="truth.heard"
                >
                  {{ truth.heard ? 'Got it' : 'Show me why' }}
                </button>
              </div>
            }
          </div>

          <!-- The Hardest Truth -->
          <div class="hardest-truth">
            <h3>💀 The Hardest Truth</h3>
            <div class="hardest-content">
              <p class="hardest-text">{{ hardestTruth() }}</p>
              <p class="hardest-context">{{ hardestContext() }}</p>
            </div>
          </div>

          <!-- What's Actually Working -->
          <div class="whats-working">
            <h3>✨ What's Actually Working</h3>
            <p class="working-intro">It's not all bad. Here's what you should keep doing:</p>
            <div class="working-list">
              @for (item of positives(); track item) {
                <div class="working-item">{{ item }}</div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Mock Button -->
      <button class="mock-btn" (click)="fillMockData()" title="Fill with test data">
        🧪 Mock
      </button>
    </div>
  `,
  styles: [`
    .truth-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 100%);
      padding: 2rem;
    }

    .header {
      max-width: 900px;
      margin: 0 auto 2rem;
      text-align: center;
    }

    .warning-banner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: #fca5a5;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
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

    /* Input Section */
    .input-section {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 2rem;
    }

    .input-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .input-header h2 {
      color: #f1f5f9;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .input-header p {
      color: #64748b;
    }

    .input-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .input-group.full-width {
      grid-column: span 2;
    }

    .input-group label {
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .input-group input,
    .input-group textarea {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 0.875rem 1rem;
      color: #f1f5f9;
      font-size: 1rem;
    }

    .input-group textarea {
      resize: vertical;
      font-family: inherit;
    }

    .input-group input:focus,
    .input-group textarea:focus {
      outline: none;
      border-color: #ef4444;
    }

    .consent-section {
      margin-bottom: 2rem;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.05);
      border-radius: 8px;
    }

    .consent-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #fca5a5;
      cursor: pointer;
    }

    .consent-checkbox input {
      width: 20px;
      height: 20px;
      accent-color: #ef4444;
    }

    .btn-analyze {
      width: 100%;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: none;
      padding: 1.25rem 2rem;
      border-radius: 12px;
      color: white;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      transition: all 0.3s;
    }

    .btn-analyze:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-analyze:not(:disabled):hover {
      transform: scale(1.02);
      box-shadow: 0 8px 30px rgba(239, 68, 68, 0.3);
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

    /* Results Section */
    .results-section {
      max-width: 1000px;
      margin: 0 auto;
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .truth-score {
      text-align: center;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      margin-bottom: 0.5rem;
    }

    .score-circle[data-level="bad"] { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .score-circle[data-level="okay"] { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .score-circle[data-level="good"] { background: linear-gradient(135deg, #10b981, #059669); }

    .score-label {
      color: #64748b;
      font-size: 0.875rem;
    }

    .score-explanation {
      color: #94a3b8;
      font-size: 0.875rem;
      max-width: 300px;
      margin-top: 0.5rem;
    }

    .btn-reset {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
    }

    /* Category Filter */
    .category-filter {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover,
    .filter-btn.active {
      border-color: #ef4444;
      color: #f1f5f9;
    }

    .filter-btn .count {
      background: rgba(239, 68, 68, 0.2);
      padding: 0.125rem 0.5rem;
      border-radius: 10px;
      font-size: 0.75rem;
    }

    /* Truths List */
    .truths-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .truth-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s;
    }

    .truth-card[data-severity="uncomfortable"] {
      border-left: 4px solid #f59e0b;
    }

    .truth-card[data-severity="harsh"] {
      border-left: 4px solid #ef4444;
    }

    .truth-card[data-severity="devastating"] {
      border-left: 4px solid #7f1d1d;
      background: rgba(127, 29, 29, 0.1);
    }

    .truth-card.heard {
      opacity: 0.7;
    }

    .truth-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .severity-badge {
      font-size: 0.7rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .severity-badge[data-severity="uncomfortable"] {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }

    .severity-badge[data-severity="harsh"] {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .severity-badge[data-severity="devastating"] {
      background: rgba(127, 29, 29, 0.3);
      color: #fca5a5;
    }

    .category-tag {
      color: #64748b;
      font-size: 0.75rem;
    }

    .truth-text {
      color: #f1f5f9;
      font-size: 1.125rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .truth-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .truth-details h4 {
      color: #94a3b8;
      font-size: 0.75rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .explanation p,
    .action p {
      color: #cbd5e1;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .action p {
      color: #10b981;
    }

    .btn-reveal {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .btn-reveal.revealed {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
      color: #10b981;
    }

    /* Hardest Truth */
    .hardest-truth {
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.3), rgba(185, 28, 28, 0.2));
      border: 2px solid #7f1d1d;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .hardest-truth h3 {
      color: #fca5a5;
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }

    .hardest-text {
      color: #f1f5f9;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .hardest-context {
      color: #94a3b8;
      font-size: 1rem;
    }

    /* What's Working */
    .whats-working {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 16px;
      padding: 2rem;
    }

    .whats-working h3 {
      color: #10b981;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .working-intro {
      color: #64748b;
      margin-bottom: 1rem;
    }

    .working-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .working-item {
      background: rgba(16, 185, 129, 0.1);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #a7f3d0;
      border-left: 3px solid #10b981;
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
      .input-grid {
        grid-template-columns: 1fr;
      }

      .input-group.full-width {
        grid-column: span 1;
      }

      .truth-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BrutalTruthMachineComponent {
  categories: TruthCategory[] = [
    { id: 'resume', name: 'Resume', icon: '📄', description: 'Problems with your CV' },
    { id: 'experience', name: 'Experience', icon: '💼', description: 'Gaps and weaknesses' },
    { id: 'market', name: 'Market Position', icon: '📊', description: 'Where you stand' },
    { id: 'perception', name: 'Perception', icon: '👁️', description: 'How others see you' },
    { id: 'skills', name: 'Skills', icon: '🔧', description: 'Technical gaps' }
  ];

  profile: ProfileInput = {
    linkedInUrl: '',
    resumeText: '',
    currentRole: '',
    yearsExperience: 0,
    desiredRole: '',
    salaryExpectation: 0,
    jobSearchDuration: 0,
    interviewsWithoutOffer: 0,
    githubUrl: ''
  };

  consentGiven = false;
  isAnalyzing = signal(false);
  analysisComplete = signal(false);
  truths = signal<BrutalTruth[]>([]);
  activeCategory = signal('all');
  truthScore = signal(0);
  hardestTruth = signal('');
  hardestContext = signal('');
  positives = signal<string[]>([]);

  filteredTruths = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.truths();
    return this.truths().filter(t => t.category === cat);
  });

  canAnalyze(): boolean {
    return this.consentGiven &&
           this.profile.currentRole.length > 0 &&
           this.profile.yearsExperience > 0;
  }

  generateTruths() {
    this.isAnalyzing.set(true);

    setTimeout(() => {
      const generatedTruths: BrutalTruth[] = [];

      // Resume-based truths
      if (this.profile.resumeText) {
        const text = this.profile.resumeText.toLowerCase();

        if (text.includes('responsible for') || text.includes('duties included')) {
          generatedTruths.push({
            id: 'resume-1',
            category: 'resume',
            severity: 'harsh',
            truth: 'Your resume reads like a job description, not an achievement list.',
            explanation: 'Recruiters spend 6 seconds on a resume. "Responsible for" tells them nothing about your impact. Every other candidate says the same thing.',
            actionable: 'Replace every "responsible for" with a specific achievement. Use numbers. "Led team of 5 to deliver $2M project 2 weeks early" beats "responsible for team leadership."',
            heard: false
          });
        }

        if (text.includes('hard worker') || text.includes('team player') || text.includes('fast learner')) {
          generatedTruths.push({
            id: 'resume-2',
            category: 'resume',
            severity: 'uncomfortable',
            truth: 'Your resume contains meaningless buzzwords that everyone uses.',
            explanation: 'Every candidate claims to be a "hard-working team player." These words are so overused they\'re invisible. Recruiters literally skip over them.',
            actionable: 'Delete all soft-skill adjectives. Show, don\'t tell. Instead of "team player," describe how you collaborated on a specific project.',
            heard: false
          });
        }

        if (!text.includes('%') && !text.includes('$') && !text.match(/\d{2,}/)) {
          generatedTruths.push({
            id: 'resume-3',
            category: 'resume',
            severity: 'devastating',
            truth: 'Your resume has no quantifiable achievements. None.',
            explanation: 'Without numbers, your experience is unprovable claims. "Improved performance" means nothing. "Improved page load by 40%" means everything.',
            actionable: 'Add at least one number to every bullet point. Revenue, users, time saved, team size, anything measurable.',
            heard: false
          });
        }
      }

      // Experience-based truths
      if (this.profile.yearsExperience >= 5 && this.profile.currentRole.toLowerCase().includes('junior') || this.profile.currentRole.toLowerCase().includes('entry')) {
        generatedTruths.push({
          id: 'exp-1',
          category: 'experience',
          severity: 'devastating',
          truth: 'You have 5+ years of experience but still hold a junior title. That\'s a red flag to recruiters.',
          explanation: 'Hiring managers will wonder why you haven\'t progressed. They\'ll assume performance issues, lack of ambition, or that you\'ve been coasting.',
          actionable: 'Either negotiate a title change immediately or be prepared to explain your career story compellingly. Don\'t let "I was comfortable" be your answer.',
          heard: false
        });
      }

      if (this.profile.jobSearchDuration > 3) {
        generatedTruths.push({
          id: 'exp-2',
          category: 'market',
          severity: this.profile.jobSearchDuration > 6 ? 'devastating' : 'harsh',
          truth: `You've been job hunting for ${this.profile.jobSearchDuration} months. That's longer than average. Something isn't working.`,
          explanation: 'The average tech job search is 2-3 months. Longer searches create a "stale candidate" perception. Recruiters wonder why nobody else wanted you.',
          actionable: 'Stop doing what you\'ve been doing. Get your resume professionally reviewed. Practice interviewing. Consider targeting different roles or companies.',
          heard: false
        });
      }

      if (this.profile.interviewsWithoutOffer > 5) {
        generatedTruths.push({
          id: 'exp-3',
          category: 'perception',
          severity: 'harsh',
          truth: `You've had ${this.profile.interviewsWithoutOffer} interviews without an offer. The problem is likely in the room, not the resume.`,
          explanation: 'Getting interviews means your resume works. Not getting offers means something breaks during the interview. Could be communication, culture fit, or interview skills.',
          actionable: 'Record yourself answering interview questions. Ask rejected companies for feedback. Practice with a friend. The issue is fixable but you need to identify it.',
          heard: false
        });
      }

      // Salary expectation truths
      if (this.profile.salaryExpectation > 0) {
        const expectedPerYear = this.profile.salaryExpectation / this.profile.yearsExperience;
        if (expectedPerYear > 30000) {
          generatedTruths.push({
            id: 'market-1',
            category: 'market',
            severity: 'uncomfortable',
            truth: 'Your salary expectations may be higher than your experience justifies.',
            explanation: 'Salary is based on value delivered, not time served. High expectations with average achievements is a common rejection reason that recruiters won\'t tell you.',
            actionable: 'Research actual market rates on levels.fyi and Glassdoor. Either adjust expectations or be ready to justify the premium with concrete achievements.',
            heard: false
          });
        }
      }

      // Desired role truths
      if (this.profile.desiredRole && this.profile.currentRole) {
        const current = this.profile.currentRole.toLowerCase();
        const desired = this.profile.desiredRole.toLowerCase();

        if ((desired.includes('staff') || desired.includes('principal') || desired.includes('director')) &&
            !current.includes('senior') && !current.includes('lead')) {
          generatedTruths.push({
            id: 'market-2',
            category: 'market',
            severity: 'harsh',
            truth: `Jumping from ${this.profile.currentRole} to ${this.profile.desiredRole} is unrealistic for most candidates.`,
            explanation: 'Companies promote internally to these roles or hire people already at that level. Skip-level promotions via job changes are rare and require exceptional evidence.',
            actionable: 'Target the next level up, not two levels. Build the portfolio and visibility that would justify the skip-level later.',
            heard: false
          });
        }
      }

      // GitHub truths
      if (this.profile.githubUrl && !this.profile.githubUrl.includes('github.com')) {
        // Skip, invalid URL
      } else if (!this.profile.githubUrl && this.profile.desiredRole?.toLowerCase().includes('engineer')) {
        generatedTruths.push({
          id: 'skills-1',
          category: 'skills',
          severity: 'uncomfortable',
          truth: 'You didn\'t provide a GitHub. In 2024, that\'s often interpreted as "nothing to show."',
          explanation: 'Fair or not, many hiring managers check GitHub. An empty or absent GitHub suggests you don\'t code outside work, which can signal lower passion.',
          actionable: 'You don\'t need a massive portfolio. One or two clean, documented projects is enough. Quality over quantity.',
          heard: false
        });
      }

      // Generic but important truths
      generatedTruths.push({
        id: 'perception-1',
        category: 'perception',
        severity: 'uncomfortable',
        truth: 'If you\'re not getting calls back, your resume is likely being filtered out by ATS before a human sees it.',
        explanation: '75% of resumes are rejected by automated systems before a human reviews them. Keywords, formatting, and file type all matter.',
        actionable: 'Use a simple format. Include exact keywords from job descriptions. Submit as PDF. Use tools like jobscan.co to check ATS compatibility.',
        heard: false
      });

      generatedTruths.push({
        id: 'perception-2',
        category: 'perception',
        severity: 'harsh',
        truth: 'Your LinkedIn headline probably says your job title. That\'s a missed opportunity.',
        explanation: 'Recruiters search by keywords, not titles. "Senior Developer at Company X" doesn\'t tell them what you actually do or want.',
        actionable: 'Make your headline searchable and specific: "React/Node.js Developer | Fintech | Open to Senior+ Roles" gets more recruiter hits than just "Software Engineer."',
        heard: false
      });

      // Set the truths
      this.truths.set(generatedTruths);

      // Calculate score (lower is worse)
      const devastating = generatedTruths.filter(t => t.severity === 'devastating').length;
      const harsh = generatedTruths.filter(t => t.severity === 'harsh').length;
      const score = Math.max(0, 100 - (devastating * 25) - (harsh * 10));
      this.truthScore.set(score);

      // Set hardest truth
      const hardest = generatedTruths.find(t => t.severity === 'devastating') ||
                      generatedTruths.find(t => t.severity === 'harsh') ||
                      generatedTruths[0];
      if (hardest) {
        this.hardestTruth.set(hardest.truth);
        this.hardestContext.set(hardest.explanation);
      }

      // Set positives
      const positiveList: string[] = [];
      if (this.profile.yearsExperience >= 5) {
        positiveList.push('You have meaningful experience to draw from');
      }
      if (this.profile.resumeText && this.profile.resumeText.length > 500) {
        positiveList.push('You have content to work with - now it\'s about positioning');
      }
      if (this.profile.interviewsWithoutOffer > 0) {
        positiveList.push('You\'re getting interviews - your resume is working at some level');
      }
      positiveList.push('You\'re seeking honest feedback - most people avoid this');
      positiveList.push('Everything identified here is fixable with effort');
      this.positives.set(positiveList);

      this.isAnalyzing.set(false);
      this.analysisComplete.set(true);
    }, 2500);
  }

  revealTruth(truth: BrutalTruth) {
    truth.heard = true;
    this.truths.update(t => [...t]);
  }

  setCategory(categoryId: string) {
    this.activeCategory.set(categoryId === this.activeCategory() ? 'all' : categoryId);
  }

  getTruthCount(categoryId: string): number {
    return this.truths().filter(t => t.category === categoryId).length;
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find(c => c.id === categoryId)?.name || categoryId;
  }

  getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      'uncomfortable': 'Uncomfortable',
      'harsh': 'Harsh',
      'devastating': 'Devastating'
    };
    return labels[severity] || severity;
  }

  getScoreLevel(): string {
    const score = this.truthScore();
    if (score >= 70) return 'good';
    if (score >= 40) return 'okay';
    return 'bad';
  }

  getScoreExplanation(): string {
    const score = this.truthScore();
    if (score >= 70) return 'You\'re in decent shape. Focus on the fixable issues.';
    if (score >= 40) return 'Significant issues found. Address them before continuing your search.';
    return 'Major red flags identified. Serious work needed before applying to more jobs.';
  }

  reset() {
    this.analysisComplete.set(false);
    this.truths.set([]);
    this.profile = {
      linkedInUrl: '',
      resumeText: '',
      currentRole: '',
      yearsExperience: 0,
      desiredRole: '',
      salaryExpectation: 0,
      jobSearchDuration: 0,
      interviewsWithoutOffer: 0,
      githubUrl: ''
    };
    this.consentGiven = false;
  }

  fillMockData() {
    this.profile = {
      linkedInUrl: 'https://linkedin.com/in/johndoe',
      resumeText: `Senior Software Engineer with 5 years of experience.
      Responsible for developing web applications.
      Team player and fast learner.
      Duties included writing code, attending meetings, and fixing bugs.
      Hard worker dedicated to quality.`,
      currentRole: 'Software Engineer',
      yearsExperience: 5,
      desiredRole: 'Staff Engineer',
      salaryExpectation: 200000,
      jobSearchDuration: 4,
      interviewsWithoutOffer: 7,
      githubUrl: ''
    };
    this.consentGiven = true;
  }
}
