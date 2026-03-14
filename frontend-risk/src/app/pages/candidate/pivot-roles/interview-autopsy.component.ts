import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Interfaces ──────────────────────────────────────────────────────────────

interface InterviewInput {
  company: string;
  role: string;
  interviewType: 'phone-screen' | 'technical' | 'behavioral' | 'system-design' | 'final-round';
  duration: number;
  overallFeeling: 'confident' | 'uncertain' | 'terrible' | 'mixed';
  gotCallback: boolean;
  feedbackReceived: string;
}

interface QuestionAnswer {
  id: string;
  question: string;
  yourAnswer: string;
  confidence: number;
}

interface AutopsyFinding {
  id: string;
  evidenceNumber: number;
  category: 'fatal-wound' | 'internal-bleeding' | 'surface-wound' | 'pre-existing';
  title: string;
  finding: string;
  whatInterviewerThought: string;
  whatYouShouldHaveSaid: string;
  severityScore: number;
  revealed: boolean;
}

interface CauseOfDeath {
  primary: string;
  contributing: string[];
  timeOfDeath: string;
  mannerOfDeath: 'self-inflicted' | 'ambush' | 'slow-bleed' | 'mismatch';
  survivalChance: number;
  detectiveNotes: string;
}

interface ToxicologyResult {
  substance: string;
  level: 'trace' | 'moderate' | 'lethal';
  description: string;
  antidote: string;
}

interface WitnessStatement {
  witness: string;
  statement: string;
  verdict: 'pass' | 'concern' | 'reject';
}

interface RevivalStep {
  order: number;
  action: string;
  timeframe: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

interface AutopsyReport {
  caseNumber: string;
  findings: AutopsyFinding[];
  causeOfDeath: CauseOfDeath;
  toxicology: ToxicologyResult[];
  witnessStatements: WitnessStatement[];
  revivalProtocol: RevivalStep[];
}

@Component({
  selector: 'app-interview-autopsy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="autopsy-container">

      <!-- ───── PHASE 1: CASE INTAKE ───── -->
      @if (phase() === 'input') {
        <div class="crime-scene-tape">CRIME SCENE — DO NOT CROSS — CRIME SCENE — DO NOT CROSS — CRIME SCENE — DO NOT CROSS</div>

        <div class="case-header">
          <div class="case-badge">CASE FILE</div>
          <h1>Interview Autopsy</h1>
          <p class="subtitle">Forensic analysis of your failed interview. We'll find out exactly where it went wrong.</p>
        </div>

        <div class="intake-form">
          <div class="section-label"><span class="label-marker">A</span> Scene Details</div>
          <div class="form-grid">
            <div class="form-group">
              <label>Company Name</label>
              <input type="text" [(ngModel)]="interviewData.company" placeholder="e.g., Google, Startup XYZ" />
            </div>
            <div class="form-group">
              <label>Role Applied For</label>
              <input type="text" [(ngModel)]="interviewData.role" placeholder="e.g., Senior Frontend Engineer" />
            </div>
            <div class="form-group">
              <label>Interview Type</label>
              <select [(ngModel)]="interviewData.interviewType">
                <option value="phone-screen">Phone Screen</option>
                <option value="technical">Technical Interview</option>
                <option value="behavioral">Behavioral Interview</option>
                <option value="system-design">System Design</option>
                <option value="final-round">Final Round</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input type="number" [(ngModel)]="interviewData.duration" min="5" max="240" placeholder="45" />
            </div>
            <div class="form-group">
              <label>How did you feel after?</label>
              <select [(ngModel)]="interviewData.overallFeeling">
                <option value="confident">Confident — thought it went well</option>
                <option value="uncertain">Uncertain — hard to read</option>
                <option value="terrible">Terrible — knew it was over</option>
                <option value="mixed">Mixed — some good, some bad</option>
              </select>
            </div>
            <div class="form-group">
              <label>Did they call you back?</label>
              <select [(ngModel)]="interviewData.gotCallback">
                <option [ngValue]="false">No — rejected or ghosted</option>
                <option [ngValue]="true">Yes — but I want to improve anyway</option>
              </select>
            </div>
            <div class="form-group full-span">
              <label>Any feedback received? (optional)</label>
              <textarea [(ngModel)]="interviewData.feedbackReceived" rows="2" placeholder="e.g., 'We went with a candidate with more experience...'"></textarea>
            </div>
          </div>

          <div class="section-label"><span class="label-marker">B</span> Evidence — Questions &amp; Answers</div>
          <p class="section-hint">Recall the questions you were asked and what you answered. Add 1–8 items.</p>

          @for (qa of questions(); track qa.id; let i = $index) {
            <div class="qa-card">
              <div class="qa-header">
                <span class="evidence-tag">{{ i + 1 }}</span>
                <span class="qa-title">Q&amp;A #{{ i + 1 }}</span>
                @if (questions().length > 1) {
                  <button class="btn-remove" (click)="removeQuestion(qa.id)">Remove</button>
                }
              </div>
              <div class="qa-fields">
                <div class="form-group full-span">
                  <label>Question asked</label>
                  <input type="text" [(ngModel)]="qa.question" placeholder="e.g., Tell me about a time you led a project..." />
                </div>
                <div class="form-group full-span">
                  <label>Your answer (summarize)</label>
                  <textarea [(ngModel)]="qa.yourAnswer" rows="3" placeholder="What did you actually say?"></textarea>
                </div>
                <div class="form-group">
                  <label>Confidence (1–5)</label>
                  <div class="confidence-selector">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button
                        class="star-btn"
                        [class.active]="qa.confidence >= star"
                        (click)="qa.confidence = star"
                      >{{ star }}</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          @if (questions().length < 8) {
            <button class="btn-add-qa" (click)="addQuestion()">+ Add Another Q&amp;A</button>
          }

          <button
            class="btn-begin-autopsy"
            [disabled]="!canBeginAutopsy()"
            (click)="beginAutopsy()"
          >
            BEGIN AUTOPSY
          </button>
        </div>
      }

      <!-- ───── PHASE 2: FORENSIC SCANNING ───── -->
      @if (phase() === 'scanning') {
        <div class="scanning-screen">
          <div class="scan-frame">
            <div class="scan-line"></div>
            <div class="scan-content">
              <div class="scan-icon">&#x1F50D;</div>
              <p class="scan-text">{{ scanMessage() }}</p>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="scanProgress()"></div>
                <div class="progress-markers">
                  @for (m of [20,40,60,80]; track m) {
                    <div class="marker" [class.passed]="scanProgress() >= m" [style.left.%]="m"></div>
                  }
                </div>
              </div>
              <p class="scan-sub">Case #{{ report()?.caseNumber || '...' }}</p>
            </div>
          </div>
        </div>
      }

      <!-- ───── PHASE 3: AUTOPSY REPORT ───── -->
      @if (phase() === 'results' && report()) {
        <div class="crime-scene-tape">CASE CLOSED — EVIDENCE REVIEWED — CASE CLOSED — EVIDENCE REVIEWED — CASE CLOSED</div>

        <div class="results-container">
          <!-- Cause of Death Certificate -->
          <div class="death-certificate">
            <div class="cert-border">
              <div class="cert-header">
                <div class="cert-seal">&#x2620;</div>
                <h2>CERTIFICATE OF INTERVIEW DEATH</h2>
                <p class="cert-case">Case #{{ report()!.caseNumber }}</p>
              </div>
              <div class="cert-body">
                <div class="cert-row">
                  <span class="cert-label">Deceased:</span>
                  <span class="cert-value">Your candidacy at {{ interviewData.company }} — {{ interviewData.role }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-label">Primary Cause:</span>
                  <span class="cert-value cert-primary">{{ report()!.causeOfDeath.primary }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-label">Contributing Factors:</span>
                  <span class="cert-value">{{ report()!.causeOfDeath.contributing.join('; ') }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-label">Time of Death:</span>
                  <span class="cert-value">{{ report()!.causeOfDeath.timeOfDeath }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-label">Manner of Death:</span>
                  <span class="cert-value cert-manner">{{ formatManner(report()!.causeOfDeath.mannerOfDeath) }}</span>
                </div>
                <div class="cert-row">
                  <span class="cert-label">Survival Chance:</span>
                  <span class="cert-value">
                    <span class="survival-badge" [attr.data-chance]="getSurvivalLevel(report()!.causeOfDeath.survivalChance)">
                      {{ report()!.causeOfDeath.survivalChance }}%
                    </span>
                    if you had done things differently
                  </span>
                </div>
              </div>
              <div class="cert-notes">
                <div class="notes-header">Detective's Notes</div>
                <p>{{ report()!.causeOfDeath.detectiveNotes }}</p>
              </div>
            </div>
          </div>

          <!-- Tab Navigation -->
          <div class="tab-bar">
            <button class="tab-btn" [class.active]="activeTab() === 'findings'" (click)="activeTab.set('findings')">
              Evidence Board
            </button>
            <button class="tab-btn" [class.active]="activeTab() === 'toxicology'" (click)="activeTab.set('toxicology')">
              Toxicology
            </button>
            <button class="tab-btn" [class.active]="activeTab() === 'witnesses'" (click)="activeTab.set('witnesses')">
              Witness Statements
            </button>
            <button class="tab-btn" [class.active]="activeTab() === 'revival'" (click)="activeTab.set('revival')">
              Revival Protocol
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">

            <!-- FINDINGS TAB -->
            @if (activeTab() === 'findings') {
              <div class="findings-grid">
                @for (f of report()!.findings; track f.id) {
                  <div
                    class="finding-card"
                    [attr.data-category]="f.category"
                    [class.revealed]="f.revealed"
                    (click)="toggleFinding(f)"
                  >
                    <div class="finding-header">
                      <span class="evidence-marker" [attr.data-category]="f.category">{{ f.evidenceNumber }}</span>
                      <span class="finding-title">{{ f.title }}</span>
                      <span class="severity-badge" [attr.data-severity]="getSeverityLabel(f.severityScore)">
                        {{ f.severityScore }}/10
                      </span>
                    </div>
                    <p class="finding-text">{{ f.finding }}</p>
                    @if (f.revealed) {
                      <div class="finding-reveal">
                        <div class="reveal-section">
                          <div class="reveal-label">What the interviewer thought:</div>
                          <p class="reveal-text interviewer-thought">{{ f.whatInterviewerThought }}</p>
                        </div>
                        <div class="reveal-section">
                          <div class="reveal-label">What you should have said:</div>
                          <p class="reveal-text should-have-said">{{ f.whatYouShouldHaveSaid }}</p>
                        </div>
                      </div>
                    } @else {
                      <p class="click-hint">Click to reveal full findings</p>
                    }
                  </div>
                }
              </div>
            }

            <!-- TOXICOLOGY TAB -->
            @if (activeTab() === 'toxicology') {
              <div class="tox-table-wrap">
                <table class="tox-table">
                  <thead>
                    <tr>
                      <th>Substance</th>
                      <th>Level</th>
                      <th>Description</th>
                      <th>Antidote</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of report()!.toxicology; track t.substance) {
                      <tr [attr.data-level]="t.level">
                        <td class="substance-name">{{ t.substance }}</td>
                        <td><span class="level-badge" [attr.data-level]="t.level">{{ t.level | uppercase }}</span></td>
                        <td>{{ t.description }}</td>
                        <td class="antidote-cell">{{ t.antidote }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <!-- WITNESSES TAB -->
            @if (activeTab() === 'witnesses') {
              <div class="witness-grid">
                @for (w of report()!.witnessStatements; track w.witness) {
                  <div class="witness-card">
                    <div class="witness-header">
                      <span class="witness-icon">{{ getWitnessIcon(w.witness) }}</span>
                      <span class="witness-name">{{ w.witness }}</span>
                      <span class="verdict-badge" [attr.data-verdict]="w.verdict">{{ w.verdict | uppercase }}</span>
                    </div>
                    <p class="witness-statement">"{{ w.statement }}"</p>
                  </div>
                }
              </div>
            }

            <!-- REVIVAL TAB -->
            @if (activeTab() === 'revival') {
              <div class="revival-list">
                @for (step of report()!.revivalProtocol; track step.order) {
                  <div class="revival-step" [attr.data-priority]="step.priority">
                    <div class="step-number">{{ step.order }}</div>
                    <div class="step-body">
                      <div class="step-header">
                        <span class="step-action">{{ step.action }}</span>
                        <span class="priority-badge" [attr.data-priority]="step.priority">{{ step.priority }}</span>
                      </div>
                      <span class="step-timeframe">{{ step.timeframe }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <button class="btn-new-case" (click)="resetAll()">Open New Case</button>
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Base Container ───────────────────────────────────────────── */
    .autopsy-container {
      min-height: 100vh;
      background: linear-gradient(180deg, #0a0a0a 0%, #0a0f1a 50%, #1a0a0a 100%);
      color: #e0e0e0;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      padding-bottom: 4rem;
    }

    /* ── Crime Scene Tape ─────────────────────────────────────────── */
    .crime-scene-tape {
      background: repeating-linear-gradient(
        45deg,
        #fbbf24,
        #fbbf24 10px,
        #111 10px,
        #111 20px
      );
      color: #000;
      font-weight: 800;
      font-size: 0.7rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      text-align: center;
      padding: 6px 0;
      white-space: nowrap;
      overflow: hidden;
    }

    /* ── Case Header ──────────────────────────────────────────────── */
    .case-header {
      text-align: center;
      padding: 2.5rem 1rem 1rem;
    }
    .case-badge {
      display: inline-block;
      background: #1a1a2e;
      border: 1px solid #dc2626;
      color: #dc2626;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 3px;
      padding: 4px 16px;
      margin-bottom: 0.75rem;
    }
    .case-header h1 {
      font-size: 2rem;
      font-weight: 800;
      color: #fff;
      margin: 0.5rem 0;
    }
    .case-header .subtitle {
      color: #9ca3af;
      font-size: 0.95rem;
      max-width: 500px;
      margin: 0 auto;
    }

    /* ── Intake Form ──────────────────────────────────────────────── */
    .intake-form {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .section-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fbbf24;
      text-transform: uppercase;
      margin: 2rem 0 1rem;
      border-bottom: 1px solid #333;
      padding-bottom: 0.5rem;
    }
    .label-marker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #dc2626;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 800;
      border-radius: 50%;
    }
    .section-hint {
      color: #6b7280;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-group.full-span { grid-column: 1 / -1; }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input,
    .form-group select,
    .form-group textarea {
      background: #111827;
      border: 1px solid #374151;
      color: #e5e7eb;
      border-radius: 6px;
      padding: 0.6rem 0.75rem;
      font-size: 0.9rem;
      transition: border-color 0.2s;
    }
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #dc2626;
    }
    .form-group textarea { resize: vertical; }

    /* ── Q&A Cards ────────────────────────────────────────────────── */
    .qa-card {
      background: #111827;
      border: 1px solid #374151;
      border-left: 3px solid #dc2626;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .qa-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .evidence-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background: #dc2626;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 800;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .qa-title {
      font-family: 'Courier New', monospace;
      font-weight: 700;
      font-size: 0.85rem;
      color: #d1d5db;
      flex: 1;
    }
    .btn-remove {
      background: none;
      border: 1px solid #4b5563;
      color: #9ca3af;
      font-size: 0.75rem;
      padding: 2px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-remove:hover { border-color: #dc2626; color: #dc2626; }
    .qa-fields {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .qa-fields .form-group { grid-column: 1 / -1; }
    .confidence-selector {
      display: flex;
      gap: 0.35rem;
    }
    .star-btn {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid #374151;
      background: #1f2937;
      color: #6b7280;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .star-btn.active {
      background: #dc2626;
      border-color: #dc2626;
      color: #fff;
    }

    .btn-add-qa {
      display: block;
      width: 100%;
      background: transparent;
      border: 1px dashed #374151;
      color: #9ca3af;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      margin-bottom: 2rem;
      transition: all 0.2s;
    }
    .btn-add-qa:hover { border-color: #dc2626; color: #dc2626; }

    /* ── Begin Autopsy Button ─────────────────────────────────────── */
    .btn-begin-autopsy {
      display: block;
      width: 100%;
      background: #dc2626;
      color: #fff;
      border: none;
      padding: 1rem;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 8px;
      cursor: pointer;
      margin: 2rem 0;
      transition: all 0.2s;
    }
    .btn-begin-autopsy:hover:not(:disabled) { background: #b91c1c; }
    .btn-begin-autopsy:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Scanning Screen ──────────────────────────────────────────── */
    .scanning-screen {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      padding: 2rem;
    }
    .scan-frame {
      position: relative;
      width: 100%;
      max-width: 500px;
      background: #0d1117;
      border: 1px solid #dc2626;
      border-radius: 12px;
      padding: 3rem 2rem;
      overflow: hidden;
    }
    .scan-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #dc2626, transparent);
      animation: scanDown 2s ease-in-out infinite;
    }
    @keyframes scanDown {
      0% { top: 0; opacity: 1; }
      50% { opacity: 0.6; }
      100% { top: 100%; opacity: 1; }
    }
    .scan-content { text-align: center; }
    .scan-icon { font-size: 3rem; margin-bottom: 1.5rem; }
    .scan-text {
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      color: #dc2626;
      min-height: 1.5em;
      margin-bottom: 2rem;
    }
    .scan-sub {
      font-family: 'Courier New', monospace;
      color: #4b5563;
      font-size: 0.8rem;
      margin-top: 1.5rem;
    }

    /* Progress Bar */
    .progress-bar {
      position: relative;
      height: 6px;
      background: #1f2937;
      border-radius: 3px;
      overflow: visible;
    }
    .progress-fill {
      height: 100%;
      background: #dc2626;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
    .progress-markers {
      position: absolute;
      top: -4px;
      left: 0;
      right: 0;
      height: 14px;
    }
    .marker {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #374151;
      border: 2px solid #1f2937;
      transform: translateX(-50%);
      transition: background 0.3s;
    }
    .marker.passed { background: #dc2626; }

    /* ── Results Container ────────────────────────────────────────── */
    .results-container {
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    /* ── Death Certificate ────────────────────────────────────────── */
    .death-certificate {
      margin-bottom: 2rem;
    }
    .cert-border {
      background: #1a1a1a;
      border: 2px solid #8b7355;
      border-radius: 4px;
      padding: 2rem;
      position: relative;
      box-shadow: inset 0 0 30px rgba(139,115,85,0.08);
    }
    .cert-border::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid #8b735544;
      border-radius: 2px;
      pointer-events: none;
    }
    .cert-header {
      text-align: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #333;
      padding-bottom: 1rem;
    }
    .cert-seal { font-size: 2rem; margin-bottom: 0.5rem; }
    .cert-header h2 {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: 3px;
      color: #dc2626;
      margin: 0;
    }
    .cert-case {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .cert-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .cert-row {
      display: flex;
      gap: 0.75rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .cert-label {
      flex-shrink: 0;
      width: 160px;
      font-family: 'Courier New', monospace;
      font-weight: 700;
      color: #9ca3af;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    .cert-value { color: #d1d5db; }
    .cert-primary { color: #dc2626; font-weight: 700; }
    .cert-manner { color: #fbbf24; font-weight: 600; }
    .survival-badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .survival-badge[data-chance="low"] { background: #7f1d1d; color: #fca5a5; }
    .survival-badge[data-chance="medium"] { background: #78350f; color: #fde68a; }
    .survival-badge[data-chance="high"] { background: #14532d; color: #86efac; }
    .cert-notes {
      margin-top: 1.5rem;
      border-top: 1px solid #333;
      padding-top: 1rem;
    }
    .notes-header {
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }
    .cert-notes p { color: #9ca3af; font-size: 0.9rem; line-height: 1.6; margin: 0; }

    /* ── Tab Bar ───────────────────────────────────────────────────── */
    .tab-bar {
      display: flex;
      border-bottom: 1px solid #333;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }
    .tab-btn {
      flex: 1;
      min-width: 120px;
      background: transparent;
      border: none;
      color: #6b7280;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .tab-btn:hover { color: #d1d5db; }
    .tab-btn.active { color: #dc2626; border-bottom-color: #dc2626; }

    /* ── Findings Tab ──────────────────────────────────────────────── */
    .findings-grid { display: flex; flex-direction: column; gap: 1rem; }
    .finding-card {
      background: #1a1a2e;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .finding-card:hover { border-color: #4b5563; }
    .finding-card[data-category="fatal-wound"] { border-left: 3px solid #991b1b; }
    .finding-card[data-category="internal-bleeding"] { border-left: 3px solid #dc2626; }
    .finding-card[data-category="surface-wound"] { border-left: 3px solid #fbbf24; }
    .finding-card[data-category="pre-existing"] { border-left: 3px solid #6b7280; }
    .finding-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .evidence-marker {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 800;
      flex-shrink: 0;
      color: #fff;
    }
    .evidence-marker[data-category="fatal-wound"] { background: #991b1b; }
    .evidence-marker[data-category="internal-bleeding"] { background: #dc2626; }
    .evidence-marker[data-category="surface-wound"] { background: #d97706; }
    .evidence-marker[data-category="pre-existing"] { background: #6b7280; }
    .finding-title {
      flex: 1;
      font-weight: 700;
      color: #e5e7eb;
      font-size: 0.95rem;
    }
    .severity-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .severity-badge[data-severity="critical"] { background: #7f1d1d; color: #fca5a5; }
    .severity-badge[data-severity="high"] { background: #78350f; color: #fde68a; }
    .severity-badge[data-severity="medium"] { background: #1e3a5f; color: #93c5fd; }
    .severity-badge[data-severity="low"] { background: #1f2937; color: #9ca3af; }
    .finding-text { color: #9ca3af; font-size: 0.88rem; line-height: 1.5; margin: 0; }
    .click-hint {
      color: #4b5563;
      font-size: 0.78rem;
      font-style: italic;
      margin: 0.5rem 0 0;
    }
    .finding-reveal {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #333;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .reveal-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.25rem;
    }
    .reveal-section:first-child .reveal-label { color: #dc2626; }
    .reveal-section:last-child .reveal-label { color: #22c55e; }
    .reveal-text {
      font-size: 0.88rem;
      line-height: 1.5;
      margin: 0;
      padding: 0.75rem;
      border-radius: 6px;
    }
    .interviewer-thought { background: #1c1015; color: #fca5a5; }
    .should-have-said { background: #0d1f0d; color: #86efac; }

    /* ── Toxicology Tab ────────────────────────────────────────────── */
    .tox-table-wrap { overflow-x: auto; }
    .tox-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.88rem;
    }
    .tox-table th {
      text-align: left;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0.75rem;
      border-bottom: 1px solid #333;
    }
    .tox-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #1f2937;
      color: #d1d5db;
      vertical-align: top;
    }
    .substance-name {
      font-weight: 700;
      font-family: 'Courier New', monospace;
      white-space: nowrap;
    }
    .level-badge {
      display: inline-block;
      padding: 1px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .level-badge[data-level="trace"] { background: #1f2937; color: #9ca3af; }
    .level-badge[data-level="moderate"] { background: #78350f; color: #fde68a; }
    .level-badge[data-level="lethal"] { background: #7f1d1d; color: #fca5a5; }
    .antidote-cell { color: #86efac; }

    /* ── Witnesses Tab ─────────────────────────────────────────────── */
    .witness-grid { display: flex; flex-direction: column; gap: 1rem; }
    .witness-card {
      background: #1a1a2e;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 1.25rem;
    }
    .witness-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .witness-icon { font-size: 1.3rem; }
    .witness-name {
      font-weight: 700;
      color: #e5e7eb;
      flex: 1;
    }
    .verdict-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .verdict-badge[data-verdict="pass"] { background: #14532d; color: #86efac; }
    .verdict-badge[data-verdict="concern"] { background: #78350f; color: #fde68a; }
    .verdict-badge[data-verdict="reject"] { background: #7f1d1d; color: #fca5a5; }
    .witness-statement {
      color: #9ca3af;
      font-size: 0.9rem;
      line-height: 1.6;
      font-style: italic;
      margin: 0;
    }

    /* ── Revival Tab ───────────────────────────────────────────────── */
    .revival-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .revival-step {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 8px;
      padding: 1rem;
    }
    .revival-step[data-priority="critical"] { border-left: 3px solid #dc2626; }
    .revival-step[data-priority="important"] { border-left: 3px solid #fbbf24; }
    .revival-step[data-priority="nice-to-have"] { border-left: 3px solid #6b7280; }
    .step-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: #1f2937;
      border-radius: 50%;
      font-weight: 800;
      color: #e5e7eb;
      font-size: 0.85rem;
      flex-shrink: 0;
    }
    .step-body { flex: 1; }
    .step-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }
    .step-action { font-weight: 600; color: #e5e7eb; font-size: 0.9rem; }
    .priority-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 1px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .priority-badge[data-priority="critical"] { background: #7f1d1d; color: #fca5a5; }
    .priority-badge[data-priority="important"] { background: #78350f; color: #fde68a; }
    .priority-badge[data-priority="nice-to-have"] { background: #1f2937; color: #9ca3af; }
    .step-timeframe { font-size: 0.8rem; color: #6b7280; }

    /* ── New Case Button ───────────────────────────────────────────── */
    .btn-new-case {
      display: block;
      width: 100%;
      max-width: 300px;
      margin: 2rem auto 0;
      background: transparent;
      border: 1px solid #374151;
      color: #9ca3af;
      padding: 0.75rem;
      font-size: 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-new-case:hover { border-color: #dc2626; color: #dc2626; }

    /* ── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .cert-row { flex-direction: column; gap: 0.15rem; }
      .cert-label { width: auto; }
      .case-header h1 { font-size: 1.5rem; }
      .tab-btn { font-size: 0.75rem; padding: 0.6rem 0.5rem; min-width: 80px; }
      .finding-header { flex-wrap: wrap; }
    }
  `]
})
export class InterviewAutopsyComponent {

  // ── State ────────────────────────────────────────────────────────
  phase = signal<'input' | 'scanning' | 'results'>('input');
  activeTab = signal<'findings' | 'toxicology' | 'witnesses' | 'revival'>('findings');
  report = signal<AutopsyReport | null>(null);
  scanProgress = signal(0);
  scanMessage = signal('Initializing forensic analysis...');

  interviewData: InterviewInput = {
    company: '',
    role: '',
    interviewType: 'technical',
    duration: 45,
    overallFeeling: 'uncertain',
    gotCallback: false,
    feedbackReceived: ''
  };

  questions = signal<QuestionAnswer[]>([
    this.createQuestion()
  ]);

  // ── Computed ─────────────────────────────────────────────────────
  canBeginAutopsy = computed(() => {
    const qs = this.questions();
    return (
      this.interviewData.company.trim().length > 0 &&
      this.interviewData.role.trim().length > 0 &&
      qs.length >= 1 &&
      qs.every(q => q.question.trim().length > 0 && q.yourAnswer.trim().length > 0)
    );
  });

  // ── Q&A Management ──────────────────────────────────────────────
  private nextId = 1;

  createQuestion(): QuestionAnswer {
    return {
      id: `qa-${this.nextId++}`,
      question: '',
      yourAnswer: '',
      confidence: 3
    };
  }

  addQuestion(): void {
    this.questions.update(qs => [...qs, this.createQuestion()]);
  }

  removeQuestion(id: string): void {
    this.questions.update(qs => qs.filter(q => q.id !== id));
  }

  // ── Begin Autopsy ───────────────────────────────────────────────
  beginAutopsy(): void {
    const caseNumber = 'AUT-' + Date.now().toString(36).toUpperCase().slice(-6);
    this.report.set({ ...this.generateReport(caseNumber) });
    this.phase.set('scanning');
    this.runScanAnimation();
  }

  private scanMessages = [
    'Analyzing response patterns...',
    'Cross-referencing with 10,000 interview failures...',
    'Identifying fatal moments...',
    'Reconstructing the crime scene...',
    'Preparing autopsy report...'
  ];

  private runScanAnimation(): void {
    let step = 0;
    const totalSteps = this.scanMessages.length;
    const interval = setInterval(() => {
      if (step < totalSteps) {
        this.scanMessage.set(this.scanMessages[step]);
        this.scanProgress.set(((step + 1) / totalSteps) * 100);
        step++;
      } else {
        clearInterval(interval);
        this.phase.set('results');
      }
    }, 800);
  }

  // ── Findings Toggle ─────────────────────────────────────────────
  toggleFinding(f: AutopsyFinding): void {
    f.revealed = !f.revealed;
  }

  // ── Reset ───────────────────────────────────────────────────────
  resetAll(): void {
    this.phase.set('input');
    this.report.set(null);
    this.activeTab.set('findings');
    this.scanProgress.set(0);
    this.interviewData = {
      company: '',
      role: '',
      interviewType: 'technical',
      duration: 45,
      overallFeeling: 'uncertain',
      gotCallback: false,
      feedbackReceived: ''
    };
    this.questions.set([this.createQuestion()]);
  }

  // ── Helpers for Template ────────────────────────────────────────
  formatManner(m: string): string {
    const map: Record<string, string> = {
      'self-inflicted': 'Self-Inflicted (unforced errors)',
      'ambush': 'Ambush (unexpected questions)',
      'slow-bleed': 'Slow Bleed (gradual loss of confidence)',
      'mismatch': 'Mismatch (wrong fit from the start)'
    };
    return map[m] || m;
  }

  getSurvivalLevel(chance: number): string {
    if (chance >= 60) return 'high';
    if (chance >= 30) return 'medium';
    return 'low';
  }

  getSeverityLabel(score: number): string {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  getWitnessIcon(witness: string): string {
    if (witness.includes('Hiring Manager')) return '\u{1F464}';
    if (witness.includes('Technical Lead')) return '\u{1F4BB}';
    if (witness.includes('HR')) return '\u{1F4CB}';
    if (witness.includes('Team Member')) return '\u{1F465}';
    return '\u{1F50E}';
  }

  // ═══════════════════════════════════════════════════════════════
  //  DETERMINISTIC ANALYSIS ENGINE
  // ═══════════════════════════════════════════════════════════════

  private generateReport(caseNumber: string): AutopsyReport {
    const qs = this.questions();
    const data = this.interviewData;

    const findings = this.analyzeFindings(qs, data);
    const causeOfDeath = this.determineCauseOfDeath(findings, qs, data);
    const toxicology = this.analyzeToxicology(qs, data);
    const witnessStatements = this.generateWitnessStatements(findings, qs, data);
    const revivalProtocol = this.buildRevivalProtocol(findings, toxicology, data);

    return {
      caseNumber,
      findings,
      causeOfDeath,
      toxicology,
      witnessStatements,
      revivalProtocol
    };
  }

  // ── Findings Analysis ───────────────────────────────────────────
  private analyzeFindings(qs: QuestionAnswer[], data: InterviewInput): AutopsyFinding[] {
    const findings: AutopsyFinding[] = [];
    let evidenceNum = 1;

    for (const qa of qs) {
      const answerLength = qa.yourAnswer.trim().length;
      const words = qa.yourAnswer.trim().split(/\s+/).length;
      const questionLower = qa.question.toLowerCase();
      const answerLower = qa.yourAnswer.toLowerCase();

      // Check: answer too short
      if (words < 15) {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: data.interviewType === 'technical' ? 'fatal-wound' : 'internal-bleeding',
          title: 'Critically Shallow Response',
          finding: `Your answer to "${this.truncate(qa.question, 60)}" was only ${words} words. This signals lack of depth or preparation.`,
          whatInterviewerThought: 'This candidate either doesn\'t know the answer or hasn\'t thought deeply about this topic. Red flag for senior roles.',
          whatYouShouldHaveSaid: 'Structure your response using a framework: for behavioral questions use STAR (Situation, Task, Action, Result), for technical questions walk through your thought process step-by-step, including trade-offs.',
          severityScore: data.interviewType === 'technical' ? 9 : 7,
          revealed: false
        });
      }

      // Check: answer too long / rambling
      if (words > 200) {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: 'internal-bleeding',
          title: 'Verbal Hemorrhaging',
          finding: `Your answer to "${this.truncate(qa.question, 60)}" ran to ${words} words. Long answers often bury the key point.`,
          whatInterviewerThought: 'They\'re rambling. Can\'t distill their thoughts. Would they do this in meetings too? Communication skills concern.',
          whatYouShouldHaveSaid: 'Lead with your conclusion, then provide 2-3 supporting points. Aim for 60-90 second responses. Ask "Would you like me to go deeper?" rather than covering everything.',
          severityScore: 6,
          revealed: false
        });
      }

      // Check: behavioral question without STAR indicators
      const isBehavioral = /tell me about a time|describe a situation|give me an example|how did you handle|walk me through/i.test(questionLower);
      const hasSTAR = /situation|task|action|result|outcome|impact|led to|achieved|delivered|improved/i.test(answerLower);
      if (isBehavioral && !hasSTAR) {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: 'fatal-wound',
          title: 'Missing STAR Framework',
          finding: `Behavioral question detected but your answer lacks structured storytelling — no clear situation, action, or result.`,
          whatInterviewerThought: 'Generic answer. No specific examples. Either making it up or can\'t recall actual achievements. Probably not a strong performer.',
          whatYouShouldHaveSaid: 'Use the STAR method: "In [Situation], I was tasked with [Task]. I [Action — specific steps]. The result was [Result — with metrics if possible]."',
          severityScore: 8,
          revealed: false
        });
      }

      // Check: no metrics or specifics
      const hasMetrics = /\d+%|\d+x|\$\d|saved|reduced|increased|improved by|grew|revenue|users|customers/i.test(answerLower);
      if (!hasMetrics && words > 20) {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: 'surface-wound',
          title: 'No Quantifiable Impact',
          finding: `Your answer to "${this.truncate(qa.question, 60)}" contains no metrics, numbers, or measurable outcomes.`,
          whatInterviewerThought: 'No numbers = no impact. If they actually achieved something significant, they\'d remember the metrics.',
          whatYouShouldHaveSaid: 'Always quantify your impact: "reduced load time by 40%", "managed a team of 5", "delivered 2 weeks ahead of schedule", "increased conversion by 15%".',
          severityScore: 5,
          revealed: false
        });
      }

      // Check: low confidence + technical question
      if (qa.confidence <= 2 && (data.interviewType === 'technical' || data.interviewType === 'system-design')) {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: 'fatal-wound',
          title: 'Confidence Collapse on Technical Question',
          finding: `You rated your confidence ${qa.confidence}/5 on "${this.truncate(qa.question, 60)}". Low confidence in technical interviews is often fatal.`,
          whatInterviewerThought: 'If they\'re not confident in their own answer, why should I be? This is a core competency question and they seem unsure.',
          whatYouShouldHaveSaid: 'Even when uncertain, show your thinking process: "I\'d approach this by first considering X, then Y. I\'m not 100% certain about Z, but here\'s how I\'d verify..." Structured uncertainty beats silent panic.',
          severityScore: 9,
          revealed: false
        });
      }

      // Check: low confidence on any question + feeling was confident (blind spot)
      if (qa.confidence <= 2 && data.overallFeeling === 'confident') {
        findings.push({
          id: `f-${evidenceNum}`,
          evidenceNumber: evidenceNum++,
          category: 'pre-existing',
          title: 'Blind Spot Detected',
          finding: `You felt confident overall but rated this answer ${qa.confidence}/5. This gap suggests you may not recognize your own weaknesses.`,
          whatInterviewerThought: 'The candidate seemed confident but the answer quality didn\'t match. Overconfidence can be a bigger issue than under-preparation.',
          whatYouShouldHaveSaid: 'Self-awareness matters. Acknowledge areas where you\'re still growing. "This isn\'t my strongest area yet, but here\'s what I do know and how I\'m working on it."',
          severityScore: 4,
          revealed: false
        });
      }
    }

    // Check: duration vs number of questions
    const minutesPerQuestion = data.duration / qs.length;
    if (minutesPerQuestion < 5 && qs.length >= 3) {
      findings.push({
        id: `f-${evidenceNum}`,
        evidenceNumber: evidenceNum++,
        category: 'internal-bleeding',
        title: 'Speed-Run Interview',
        finding: `${qs.length} questions in ${data.duration} minutes means ~${Math.round(minutesPerQuestion)} minutes per answer. That's barely enough for depth.`,
        whatInterviewerThought: 'We moved through questions fast because the answers weren\'t going anywhere. Normally we go deep on 2-3 questions with strong candidates.',
        whatYouShouldHaveSaid: 'If questions seem rapid-fire, ask: "Would you like me to go deeper on any of these?" Taking control of pacing shows confidence and depth.',
        severityScore: 7,
        revealed: false
      });
    }

    // Check: confident feeling but no callback (blind spot)
    if (data.overallFeeling === 'confident' && !data.gotCallback) {
      findings.push({
        id: `f-${evidenceNum}`,
        evidenceNumber: evidenceNum++,
        category: 'pre-existing',
        title: 'The Dunning-Kruger Gap',
        finding: `You felt confident, but they didn't call back. This gap between perception and reality is a critical pattern to address.`,
        whatInterviewerThought: 'The candidate seemed pleasant but lacked the depth we needed. They may not have realized how much they were missing.',
        whatYouShouldHaveSaid: 'After any interview, do a ruthless self-debrief. Write down every question and your answer while it\'s fresh. You\'ll spot the gaps yourself.',
        severityScore: 5,
        revealed: false
      });
    }

    // Ensure at least one finding
    if (findings.length === 0) {
      findings.push({
        id: `f-${evidenceNum}`,
        evidenceNumber: evidenceNum++,
        category: 'surface-wound',
        title: 'Inconclusive Evidence',
        finding: 'Based on the information provided, no major red flags were detected. The issue may be subtle — competition, culture fit, or internal candidates.',
        whatInterviewerThought: 'The candidate was decent but we had a slightly stronger option. Sometimes it\'s not about what you did wrong.',
        whatYouShouldHaveSaid: 'When you lose to competition rather than your own mistakes, focus on differentiation. What unique perspective or experience do you bring?',
        severityScore: 3,
        revealed: false
      });
    }

    return findings;
  }

  // ── Cause of Death ──────────────────────────────────────────────
  private determineCauseOfDeath(findings: AutopsyFinding[], qs: QuestionAnswer[], data: InterviewInput): CauseOfDeath {
    const fatalCount = findings.filter(f => f.category === 'fatal-wound').length;
    const bleedingCount = findings.filter(f => f.category === 'internal-bleeding').length;
    const avgConfidence = qs.reduce((sum, q) => sum + q.confidence, 0) / qs.length;

    // Determine manner of death
    let mannerOfDeath: CauseOfDeath['mannerOfDeath'];
    if (fatalCount >= 2) {
      mannerOfDeath = 'self-inflicted';
    } else if (data.overallFeeling === 'terrible' && avgConfidence <= 2) {
      mannerOfDeath = 'ambush';
    } else if (bleedingCount >= 2) {
      mannerOfDeath = 'slow-bleed';
    } else {
      mannerOfDeath = 'mismatch';
    }

    // Determine time of death
    const worstQuestionIdx = qs.reduce((worst, q, i) => q.confidence < qs[worst].confidence ? i : worst, 0);
    const estimatedMinute = Math.round((worstQuestionIdx + 1) / qs.length * data.duration);
    const timeOfDeath = `Approximately ${estimatedMinute} minutes into the interview`;

    // Primary cause
    let primary: string;
    const topFinding = findings.sort((a, b) => b.severityScore - a.severityScore)[0];
    if (fatalCount >= 2) {
      primary = 'Multiple critical failures in core competency areas';
    } else if (topFinding.category === 'fatal-wound') {
      primary = topFinding.title + ' — ' + this.truncate(topFinding.finding, 80);
    } else if (data.overallFeeling === 'confident' && !data.gotCallback) {
      primary = 'Critical self-awareness gap: strong self-assessment did not match interview performance';
    } else {
      primary = topFinding.title;
    }

    // Contributing factors
    const contributing = findings
      .filter(f => f !== topFinding)
      .slice(0, 3)
      .map(f => f.title);

    // Survival chance
    let survivalChance = 70;
    survivalChance -= fatalCount * 15;
    survivalChance -= bleedingCount * 8;
    if (data.overallFeeling === 'terrible') survivalChance -= 5;
    if (avgConfidence < 2.5) survivalChance -= 10;
    survivalChance = Math.max(10, Math.min(85, survivalChance));

    // Detective's notes
    const detectiveNotes = this.buildDetectiveNotes(findings, data, avgConfidence);

    return {
      primary,
      contributing: contributing.length > 0 ? contributing : ['Insufficient differentiation from other candidates'],
      timeOfDeath,
      mannerOfDeath,
      survivalChance,
      detectiveNotes
    };
  }

  private buildDetectiveNotes(findings: AutopsyFinding[], data: InterviewInput, avgConf: number): string {
    const parts: string[] = [];

    if (data.overallFeeling === 'confident' && !data.gotCallback) {
      parts.push(`The subject believed the interview went well, yet received no callback. This is the most dangerous pattern — without awareness of what went wrong, the same mistakes will repeat.`);
    } else if (data.overallFeeling === 'terrible') {
      parts.push(`The subject knew something went wrong, which is actually a positive signal. Self-awareness is the first step to recovery.`);
    }

    const fatalFindings = findings.filter(f => f.category === 'fatal-wound');
    if (fatalFindings.length > 0) {
      parts.push(`We identified ${fatalFindings.length} fatal wound(s) — issues serious enough to end the candidacy on their own.`);
    }

    if (avgConf <= 2) {
      parts.push(`Average confidence across answers was critically low (${avgConf.toFixed(1)}/5). Preparation and mock interviews are essential before the next attempt.`);
    }

    if (data.feedbackReceived && data.feedbackReceived.trim().length > 0) {
      parts.push(`The feedback received ("${this.truncate(data.feedbackReceived.trim(), 80)}") aligns with our forensic findings.`);
    }

    parts.push('Recommendation: Follow the Revival Protocol before applying to similar roles.');

    return parts.join(' ');
  }

  // ── Toxicology Analysis ─────────────────────────────────────────
  private analyzeToxicology(qs: QuestionAnswer[], data: InterviewInput): ToxicologyResult[] {
    const results: ToxicologyResult[] = [];
    const allAnswers = qs.map(q => q.yourAnswer.toLowerCase()).join(' ');
    const allWords = allAnswers.split(/\s+/).length;

    // Check for vagueness
    const vagueWords = (allAnswers.match(/\b(stuff|things|basically|kind of|sort of|etc|whatever|various|some|maybe)\b/g) || []).length;
    if (vagueWords >= 3) {
      results.push({
        substance: 'Vague-itis',
        level: vagueWords >= 6 ? 'lethal' : 'moderate',
        description: `${vagueWords} vague filler words detected across your answers. Words like "stuff", "things", "basically" undermine credibility.`,
        antidote: 'Replace every vague word with a specific noun, metric, or example. "Various things" becomes "three specific initiatives: X, Y, and Z."'
      });
    } else if (vagueWords >= 1) {
      results.push({
        substance: 'Vague-itis',
        level: 'trace',
        description: `${vagueWords} minor instance(s) of vague language. Not lethal but still weakens your delivery.`,
        antidote: 'Audit your go-to phrases. Replace filler with precision.'
      });
    }

    // Check for over-confidence
    const avgConf = qs.reduce((s, q) => s + q.confidence, 0) / qs.length;
    if (avgConf >= 4.5 && !data.gotCallback) {
      results.push({
        substance: 'Over-Confidence Syndrome',
        level: 'lethal',
        description: `Average self-rated confidence of ${avgConf.toFixed(1)}/5 with no callback. Perception and reality are dangerously misaligned.`,
        antidote: 'Record yourself doing mock interviews. Watch the recording — you\'ll see the gaps you\'re missing in real-time.'
      });
    } else if (avgConf >= 4 && !data.gotCallback) {
      results.push({
        substance: 'Over-Confidence Syndrome',
        level: 'moderate',
        description: `High self-assessed confidence (${avgConf.toFixed(1)}/5) without positive outcome suggests some blind spots.`,
        antidote: 'Get feedback from a trusted peer or mentor. Ask them to be brutally honest.'
      });
    }

    // Check for under-preparation
    const shortAnswers = qs.filter(q => q.yourAnswer.trim().split(/\s+/).length < 15).length;
    if (shortAnswers >= Math.ceil(qs.length * 0.5)) {
      results.push({
        substance: 'Prep-Deficiency',
        level: shortAnswers === qs.length ? 'lethal' : 'moderate',
        description: `${shortAnswers} of ${qs.length} answers were critically short. This suggests insufficient preparation or shallow knowledge.`,
        antidote: 'For each role you interview for, prepare 5 detailed stories with specific metrics and outcomes. Practice until each is 60-90 seconds.'
      });
    }

    // Check for negative language
    const negativeWords = (allAnswers.match(/\b(couldn't|didn't|wasn't|failed|mistake|problem|unfortunately|struggle|difficult|hard time)\b/g) || []).length;
    if (negativeWords >= 4) {
      results.push({
        substance: 'Negativity Toxin',
        level: negativeWords >= 7 ? 'lethal' : 'moderate',
        description: `${negativeWords} negative framing instances found. Interviewers pick up on negative energy immediately.`,
        antidote: 'Reframe every negative as a learning: "I struggled with X" becomes "I identified X as a growth area and took steps to improve by doing Y."'
      });
    }

    // Check for "we" vs "I"
    const weCount = (allAnswers.match(/\bwe\b/g) || []).length;
    const iCount = (allAnswers.match(/\bI\b/gi) || []).length;
    if (weCount > iCount * 2 && weCount >= 4) {
      results.push({
        substance: 'Credit Dilution',
        level: 'moderate',
        description: `Used "we" ${weCount} times vs "I" ${iCount} times. The interviewer wants to know YOUR contribution, not the team's.`,
        antidote: 'Use "I" to describe your specific actions, then acknowledge the team: "I led the design of X, collaborating with the team on implementation."'
      });
    } else if (iCount > weCount * 3 && iCount >= 6) {
      results.push({
        substance: 'Solo Hero Complex',
        level: 'trace',
        description: `Heavy use of "I" (${iCount} times) with minimal "we" (${weCount} times) may signal poor teamwork to interviewers.`,
        antidote: 'Balance individual contributions with team acknowledgment. Show you can lead AND collaborate.'
      });
    }

    // Ensure at least one result
    if (results.length === 0) {
      results.push({
        substance: 'Trace Compounds Only',
        level: 'trace',
        description: 'No major toxic communication patterns detected. Your interview language appears clean.',
        antidote: 'Continue refining your delivery. Consider adding more quantifiable impact statements to strengthen your answers.'
      });
    }

    return results;
  }

  // ── Witness Statements ──────────────────────────────────────────
  private generateWitnessStatements(findings: AutopsyFinding[], qs: QuestionAnswer[], data: InterviewInput): WitnessStatement[] {
    const statements: WitnessStatement[] = [];
    const fatalCount = findings.filter(f => f.category === 'fatal-wound').length;
    const avgConf = qs.reduce((s, q) => s + q.confidence, 0) / qs.length;
    const avgWords = qs.reduce((s, q) => s + q.yourAnswer.trim().split(/\s+/).length, 0) / qs.length;

    // Hiring Manager perspective
    let hmVerdict: WitnessStatement['verdict'] = 'concern';
    let hmStatement: string;
    if (fatalCount >= 2) {
      hmVerdict = 'reject';
      hmStatement = `The candidate showed promise on paper, but in the interview they couldn't demonstrate the depth we need for this ${data.role} position. We need someone who can hit the ground running, and I didn't see that today.`;
    } else if (fatalCount === 1) {
      hmVerdict = 'concern';
      hmStatement = `There were some good moments, but one answer really gave me pause. For the ${data.role} role at our level, I'd need to see more consistency. I'd consider them for a more junior position.`;
    } else {
      hmVerdict = data.gotCallback ? 'pass' : 'concern';
      hmStatement = `Decent interview overall. Not the strongest candidate in the pool, but not the weakest either. The decision came down to small differentiators between the top candidates.`;
    }
    statements.push({ witness: 'The Hiring Manager', statement: hmStatement, verdict: hmVerdict });

    // Technical Lead perspective (for technical/system-design interviews)
    if (data.interviewType === 'technical' || data.interviewType === 'system-design') {
      const hasMetrics = qs.some(q => /\d+%|\d+x|\$\d|performance|scalab|architect/i.test(q.yourAnswer));
      let tlVerdict: WitnessStatement['verdict'] = 'concern';
      let tlStatement: string;
      if (avgConf <= 2) {
        tlVerdict = 'reject';
        tlStatement = `The candidate seemed uncomfortable with technical questions. For a ${data.role} position, I need someone who can discuss technical concepts with confidence, even when they're not 100% sure.`;
      } else if (!hasMetrics) {
        tlVerdict = 'concern';
        tlStatement = `They talked in generalities. I wanted to hear about specific technical decisions they made, trade-offs they considered, and measurable outcomes. The answers were too abstract for my comfort.`;
      } else {
        tlVerdict = data.gotCallback ? 'pass' : 'concern';
        tlStatement = `Technical knowledge seems adequate. I'd want a follow-up to dig deeper on specific system design decisions. Could be a fit with some mentoring.`;
      }
      statements.push({ witness: 'The Technical Lead', statement: tlStatement, verdict: tlVerdict });
    }

    // HR perspective
    let hrVerdict: WitnessStatement['verdict'] = 'pass';
    let hrStatement: string;
    if (data.overallFeeling === 'terrible') {
      hrVerdict = 'concern';
      hrStatement = `I noticed the candidate seemed stressed during the interview. While some nervousness is normal, it affected their ability to communicate clearly. I'd recommend they practice more before their next interview cycle.`;
    } else if (avgWords > 180) {
      hrVerdict = 'concern';
      hrStatement = `The candidate was enthusiastic but had trouble being concise. In our fast-paced environment, we need people who can communicate efficiently. The long answers extended the interview past schedule.`;
    } else {
      hrStatement = `Professional demeanor overall. The candidate was respectful and engaged. From a culture-fit perspective, they seem like they could integrate well with the team.`;
    }
    statements.push({ witness: 'The HR Representative', statement: hrStatement, verdict: hrVerdict });

    // Team Member perspective
    let tmVerdict: WitnessStatement['verdict'] = 'concern';
    let tmStatement: string;
    const allAnswers = qs.map(q => q.yourAnswer.toLowerCase()).join(' ');
    const weCount = (allAnswers.match(/\bwe\b/g) || []).length;
    if (weCount >= 3) {
      tmVerdict = 'pass';
      tmStatement = `They seem like a team player based on how they talked about past work. I'd be happy to collaborate with them. They referenced teamwork and collaboration naturally.`;
    } else if (fatalCount >= 2) {
      tmVerdict = 'reject';
      tmStatement = `I'm not sure they could keep up with our team's pace. Some of the answers to technical questions were concerning. I'd worry about having to compensate for their gaps.`;
    } else {
      tmStatement = `Hard to tell from one interview. They seemed competent enough, but I didn't get a strong read on how they'd actually work day-to-day. Would need a paired programming session.`;
    }
    statements.push({ witness: 'The Team Member', statement: tmStatement, verdict: tmVerdict });

    return statements;
  }

  // ── Revival Protocol ────────────────────────────────────────────
  private buildRevivalProtocol(findings: AutopsyFinding[], toxicology: ToxicologyResult[], data: InterviewInput): RevivalStep[] {
    const steps: RevivalStep[] = [];
    let order = 1;

    // Critical: address fatal wounds first
    const fatalFindings = findings.filter(f => f.category === 'fatal-wound');
    if (fatalFindings.length > 0) {
      steps.push({
        order: order++,
        action: `Address ${fatalFindings.length} critical weakness(es): ${fatalFindings.map(f => f.title).join(', ')}. Deep-dive into each topic until you can explain it confidently to a peer.`,
        timeframe: 'This week',
        priority: 'critical'
      });
    }

    // Critical: mock interviews
    steps.push({
      order: order++,
      action: `Do 3 mock ${data.interviewType} interviews with a peer or mentor. Record yourself and review the recordings for filler words, body language, and answer structure.`,
      timeframe: 'Next 2 weeks',
      priority: 'critical'
    });

    // Important: fix toxic patterns
    const lethalToxins = toxicology.filter(t => t.level === 'lethal');
    if (lethalToxins.length > 0) {
      steps.push({
        order: order++,
        action: `Eliminate toxic communication patterns: ${lethalToxins.map(t => t.substance).join(', ')}. Practice their antidotes daily.`,
        timeframe: 'Next 2 weeks',
        priority: 'critical'
      });
    }

    // Important: prepare stories
    steps.push({
      order: order++,
      action: `Write out 5 detailed career stories using the STAR format. Each should include specific metrics, your personal contribution, and the business impact.`,
      timeframe: 'Next week',
      priority: 'important'
    });

    // Important: research & prepare
    steps.push({
      order: order++,
      action: `Before your next interview, research the company deeply: recent news, tech stack, team structure, and common interview questions for ${data.role} roles.`,
      timeframe: 'Before next interview',
      priority: 'important'
    });

    // If there was an internal bleeding issue (rambling, speed-run)
    const bleedingFindings = findings.filter(f => f.category === 'internal-bleeding');
    if (bleedingFindings.length > 0) {
      steps.push({
        order: order++,
        action: `Practice concise delivery. Set a timer: answer any question in 60-90 seconds. If you need more time, pause and ask "Would you like me to elaborate?"`,
        timeframe: 'Ongoing practice',
        priority: 'important'
      });
    }

    // Nice-to-have: reapply strategy
    if (!data.gotCallback) {
      steps.push({
        order: order++,
        action: `Consider reapplying to ${data.company} in 6 months with improved skills. Reach out to your interviewer on LinkedIn with a professional thank-you note now.`,
        timeframe: '6 months',
        priority: 'nice-to-have'
      });
    }

    // Nice-to-have: build a tracker
    steps.push({
      order: order++,
      action: `Create an interview tracker: log every question you're asked, your answer, and self-rating. Review patterns after every 3 interviews.`,
      timeframe: 'Start immediately',
      priority: 'nice-to-have'
    });

    return steps;
  }

  // ── Utility ─────────────────────────────────────────────────────
  private truncate(str: string, max: number): string {
    return str.length > max ? str.slice(0, max) + '...' : str;
  }
}
