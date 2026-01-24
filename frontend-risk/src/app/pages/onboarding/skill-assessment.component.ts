import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SkillCategory {
  name: string;
  skills: string[];
}

interface AssessmentData {
  currentRole: string;
  yearsExperience: number;
  skills: { name: string; level: number; yearsUsed: number }[];
  // Old % breakdown for backward compatibility - computed from selections
  workBreakdown: {
    repetitiveTasks: number;
    problemSolving: number;
    communication: number;
    creativity: number;
  };
  // New selection-based work pattern data
  workPattern: {
    timeGoesTo: string[];      // max 2 selections
    mostDraining: string;       // single selection
    aiChangesFirst: string;     // single selection
  };
  industryContext: string;
  companySize: string;
  remoteWork: number;
}

// Work pattern options for selection UI
interface WorkPatternOption {
  id: string;
  emoji: string;
  label: string;
  description: string;
}

/**
 * Maps selection-based work pattern answers to normalized % weights.
 * This preserves backward compatibility with the existing scoring model.
 *
 * Mapping logic:
 * - "timeGoesTo" selections get higher weights (primary activities)
 * - "mostDraining" selection gets moderate weight boost
 * - "aiChangesFirst" selection indicates high automation vulnerability
 *
 * The weights are normalized to sum to 1.0 internally.
 */
function mapAnswersToWorkdayWeights(pattern: AssessmentData['workPattern']): AssessmentData['workBreakdown'] {
  // Base weights for each category
  const weights = {
    repetitiveTasks: 15,
    problemSolving: 25,
    communication: 30,
    creativity: 30
  };

  // Map option IDs to weight keys
  const optionToWeight: Record<string, keyof typeof weights> = {
    'routine': 'repetitiveTasks',
    'problem-solving': 'problemSolving',
    'meetings': 'communication',
    'creative': 'creativity'
  };

  // Boost weights for "timeGoesTo" selections (primary activities)
  for (const selection of pattern.timeGoesTo) {
    const key = optionToWeight[selection];
    if (key) {
      weights[key] += 25; // Primary activity boost
    }
  }

  // Moderate boost for "mostDraining" selection
  const drainingKey = optionToWeight[pattern.mostDraining];
  if (drainingKey) {
    weights[drainingKey] += 10;
  }

  // "aiChangesFirst" indicates high automation risk for that category
  // Boost that category slightly as it represents current workflow
  const aiFirstKey = optionToWeight[pattern.aiChangesFirst];
  if (aiFirstKey) {
    weights[aiFirstKey] += 5;
  }

  // Normalize to 100%
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  return {
    repetitiveTasks: Math.round((weights.repetitiveTasks / total) * 100),
    problemSolving: Math.round((weights.problemSolving / total) * 100),
    communication: Math.round((weights.communication / total) * 100),
    creativity: Math.round((weights.creativity / total) * 100)
  };
}

@Component({
  selector: 'app-skill-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assessment-container">
      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="progressPercent()"></div>
        <span class="progress-text">{{ currentStep() }} / {{ totalSteps }}</span>
      </div>

      <!-- Step 1: Role -->
      @if (currentStep() === 1) {
        <div class="step fade-in">
          <h1>Mis on sinu praegune roll?</h1>
          <p class="subtitle">See aitab meil mõista sinu karjääri konteksti</p>

          <div class="role-grid">
            @for (role of roles; track role) {
              <button
                class="role-card"
                [class.selected]="assessment.currentRole === role"
                (click)="selectRole(role)">
                {{ role }}
              </button>
            }
          </div>

          <div class="custom-input">
            <input
              type="text"
              placeholder="Või kirjuta oma roll..."
              [(ngModel)]="customRole"
              (keyup.enter)="selectRole(customRole)">
          </div>
        </div>
      }

      <!-- Step 2: Experience -->
      @if (currentStep() === 2) {
        <div class="step fade-in">
          <h1>Kui kaua oled selles valdkonnas töötanud?</h1>

          <div class="experience-slider">
            <input
              type="range"
              min="0"
              max="25"
              [(ngModel)]="assessment.yearsExperience">
            <div class="experience-display">
              <span class="years">{{ assessment.yearsExperience }}</span>
              <span class="label">aastat</span>
            </div>
          </div>

          <div class="experience-context">
            @if (assessment.yearsExperience < 2) {
              <span class="badge junior">Algaja</span>
              <p>AI tööriistad võivad sind aidata kiiremini õppida</p>
            } @else if (assessment.yearsExperience < 5) {
              <span class="badge mid">Keskmine</span>
              <p>Hea aeg spetsialiseeruda ja eristuda</p>
            } @else if (assessment.yearsExperience < 10) {
              <span class="badge senior">Kogenud</span>
              <p>Sinu kogemus on väärtuslik - fookus peaks olema strateegilisel mõtlemisel</p>
            } @else {
              <span class="badge expert">Ekspert</span>
              <p>Keskendu mentorluse ja arhitektuuri rollidele</p>
            }
          </div>
        </div>
      }

      <!-- Step 3: Skills -->
      @if (currentStep() === 3) {
        <div class="step fade-in">
          <h1>Milliseid tehnoloogiaid kasutad?</h1>
          <p class="subtitle">Vali kõik mis kehtivad. Hiljem saad täpsustada taset.</p>

          @for (category of skillCategories; track category.name) {
            <div class="skill-category">
              <h3>{{ category.name }}</h3>
              <div class="skill-chips">
                @for (skill of category.skills; track skill) {
                  <button
                    class="skill-chip"
                    [class.selected]="isSkillSelected(skill)"
                    (click)="toggleSkill(skill)">
                    {{ skill }}
                    @if (isSkillSelected(skill)) {
                      <span class="check">✓</span>
                    }
                  </button>
                }
              </div>
            </div>
          }

          <div class="custom-skill">
            <input
              type="text"
              placeholder="Lisa oma skill..."
              [(ngModel)]="customSkill"
              (keyup.enter)="addCustomSkill()">
            <button (click)="addCustomSkill()" [disabled]="!customSkill">Lisa</button>
          </div>

          <div class="selected-count">
            {{ selectedSkills().length }} skilli valitud
          </div>
        </div>
      }

      <!-- Step 4: Skill levels -->
      @if (currentStep() === 4) {
        <div class="step fade-in">
          <h1>Hinda oma oskuste taset</h1>
          <p class="subtitle">1 = algaja, 5 = ekspert</p>

          <div class="skill-levels">
            @for (skill of assessment.skills; track skill.name) {
              <div class="skill-level-row">
                <span class="skill-name">{{ skill.name }}</span>
                <div class="level-buttons">
                  @for (level of [1,2,3,4,5]; track level) {
                    <button
                      class="level-btn"
                      [class.active]="skill.level === level"
                      (click)="setSkillLevel(skill.name, level)">
                      {{ level }}
                    </button>
                  }
                </div>
                <div class="years-used">
                  <input
                    type="number"
                    min="0"
                    max="25"
                    [(ngModel)]="skill.yearsUsed"
                    placeholder="a">
                  <span>a</span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Step 5: Work pattern (new selection-based UI) -->
      @if (currentStep() === 5) {
        <div class="step fade-in">
          <div class="step-meta">
            <span class="time-hint">⏱️ ~20 sek</span>
            <span class="question-count">3 küsimust</span>
          </div>

          <!-- Question 5a: Time goes to... (max 2) -->
          <div class="work-question" [class.answered]="assessment.workPattern.timeGoesTo.length > 0">
            <h2>Sinu aeg läheb peamiselt...</h2>
            <p class="hint">Vali kuni 2 tegevust, mis võtavad enim aega</p>

            <div class="option-cards">
              @for (option of timeGoesToOptions; track option.id) {
                <button
                  type="button"
                  class="option-card"
                  [class.selected]="isTimeGoesToSelected(option.id)"
                  [class.disabled]="!isTimeGoesToSelected(option.id) && assessment.workPattern.timeGoesTo.length >= 2"
                  [attr.aria-pressed]="isTimeGoesToSelected(option.id)"
                  [attr.aria-label]="option.label"
                  (click)="toggleTimeGoesTo(option.id)"
                  (keydown.enter)="toggleTimeGoesTo(option.id)"
                  (keydown.space)="toggleTimeGoesTo(option.id); $event.preventDefault()">
                  <span class="option-emoji">{{ option.emoji }}</span>
                  <span class="option-label">{{ option.label }}</span>
                  <span class="option-desc">{{ option.description }}</span>
                  @if (isTimeGoesToSelected(option.id)) {
                    <span class="check-mark">✓</span>
                  }
                </button>
              }
            </div>
            <p class="selection-hint" *ngIf="assessment.workPattern.timeGoesTo.length === 0">
              💡 Vali vähemalt üks
            </p>
          </div>

          <!-- Question 5b: Most draining -->
          <div class="work-question" [class.answered]="assessment.workPattern.mostDraining">
            <h2>Mis väsitab sind enim?</h2>
            <p class="hint">Vali üks</p>

            <div class="option-chips">
              @for (option of drainingOptions; track option.id) {
                <button
                  type="button"
                  class="option-chip"
                  [class.selected]="assessment.workPattern.mostDraining === option.id"
                  [attr.aria-pressed]="assessment.workPattern.mostDraining === option.id"
                  (click)="selectMostDraining(option.id)">
                  <span class="chip-emoji">{{ option.emoji }}</span>
                  {{ option.label }}
                </button>
              }
            </div>
          </div>

          <!-- Question 5c: AI changes first -->
          <div class="work-question" [class.answered]="assessment.workPattern.aiChangesFirst">
            <h2>Kui AI sinu tööd muudab, siis esimesena...</h2>
            <p class="hint">Mille osa tööst AI tõenäoliselt ära teeb?</p>

            <div class="option-chips">
              @for (option of aiChangesOptions; track option.id) {
                <button
                  type="button"
                  class="option-chip"
                  [class.selected]="assessment.workPattern.aiChangesFirst === option.id"
                  [attr.aria-pressed]="assessment.workPattern.aiChangesFirst === option.id"
                  (click)="selectAiChangesFirst(option.id)">
                  <span class="chip-emoji">{{ option.emoji }}</span>
                  {{ option.label }}
                </button>
              }
            </div>
          </div>

          <!-- Progress indicator -->
          <div class="question-progress">
            <span [class.done]="assessment.workPattern.timeGoesTo.length > 0">①</span>
            <span [class.done]="assessment.workPattern.mostDraining">②</span>
            <span [class.done]="assessment.workPattern.aiChangesFirst">③</span>
          </div>
        </div>
      }

      <!-- Step 6: Context -->
      @if (currentStep() === 6) {
        <div class="step fade-in">
          <h1>Veel veidi konteksti</h1>

          <div class="context-section">
            <label>Mis valdkonnas töötad?</label>
            <div class="option-grid">
              @for (industry of industries; track industry) {
                <button
                  class="option-btn"
                  [class.selected]="assessment.industryContext === industry"
                  (click)="assessment.industryContext = industry">
                  {{ industry }}
                </button>
              }
            </div>
          </div>

          <div class="context-section">
            <label>Ettevõtte suurus</label>
            <div class="option-grid">
              @for (size of companySizes; track size.value) {
                <button
                  class="option-btn"
                  [class.selected]="assessment.companySize === size.value"
                  (click)="assessment.companySize = size.value">
                  {{ size.label }}
                </button>
              }
            </div>
          </div>

          <div class="context-section">
            <label>Kui palju töötad kaugtööna?</label>
            <div class="remote-slider">
              <input type="range" min="0" max="100" step="10" [(ngModel)]="assessment.remoteWork">
              <span>{{ assessment.remoteWork }}% remote</span>
            </div>
          </div>
        </div>
      }

      <!-- Navigation -->
      <div class="nav-buttons">
        @if (currentStep() > 1) {
          <button class="btn-back" (click)="previousStep()">← Tagasi</button>
        }

        @if (currentStep() < totalSteps) {
          <button
            class="btn-next"
            (click)="nextStep()"
            [disabled]="!canProceed()">
            Edasi →
          </button>
        } @else {
          <button
            class="btn-analyze"
            (click)="submitAssessment()"
            [disabled]="isSubmitting()">
            @if (isSubmitting()) {
              Analüüsin...
            } @else {
              Analüüsi minu karjääri 🚀
            }
          </button>
        }
      </div>

      <!-- Mock Data Button -->
      <button class="mock-btn" (click)="fillMockData()" title="Fill with test data">
        🧪 Mock
      </button>
    </div>
  `,
  styles: [`
    .assessment-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: 100vh;
    }

    .progress-bar {
      background: rgba(255,255,255,0.1);
      height: 8px;
      border-radius: 4px;
      margin-bottom: 3rem;
      position: relative;
    }

    .progress-fill {
      background: linear-gradient(90deg, #10b981, #06d6a0);
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      position: absolute;
      right: 0;
      top: -24px;
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .step {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #f1f5f9;
    }

    .subtitle {
      color: #94a3b8;
      margin-bottom: 2rem;
    }

    .role-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .role-card {
      background: rgba(255,255,255,0.05);
      border: 2px solid transparent;
      padding: 1rem;
      border-radius: 12px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .role-card:hover {
      background: rgba(255,255,255,0.1);
    }

    .role-card.selected {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }

    .custom-input input {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
      color: #fff;
      font-size: 1rem;
    }

    .experience-slider {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin: 2rem 0;
    }

    .experience-slider input[type="range"] {
      flex: 1;
      height: 8px;
      -webkit-appearance: none;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
    }

    .experience-slider input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 24px;
      height: 24px;
      background: #10b981;
      border-radius: 50%;
      cursor: pointer;
    }

    .experience-display {
      text-align: center;
    }

    .experience-display .years {
      font-size: 3rem;
      font-weight: bold;
      color: #10b981;
      display: block;
    }

    .experience-display .label {
      color: #94a3b8;
    }

    .experience-context {
      background: rgba(255,255,255,0.05);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .badge.junior { background: #3b82f6; }
    .badge.mid { background: #8b5cf6; }
    .badge.senior { background: #f59e0b; }
    .badge.expert { background: #10b981; }

    .skill-category {
      margin-bottom: 1.5rem;
    }

    .skill-category h3 {
      color: #94a3b8;
      font-size: 0.875rem;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }

    .skill-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .skill-chip {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .skill-chip:hover {
      background: rgba(255,255,255,0.1);
    }

    .skill-chip.selected {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
    }

    .skill-chip .check {
      color: #10b981;
    }

    .custom-skill {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .custom-skill input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.75rem;
      border-radius: 8px;
      color: #fff;
    }

    .custom-skill button {
      background: #10b981;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
    }

    .custom-skill button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .selected-count {
      text-align: center;
      color: #10b981;
      margin-top: 1rem;
      font-weight: 500;
    }

    .skill-levels {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skill-level-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.03);
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .skill-name {
      width: 150px;
      color: #e2e8f0;
    }

    .level-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .level-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .level-btn:hover {
      border-color: #10b981;
    }

    .level-btn.active {
      background: #10b981;
      border-color: #10b981;
      color: #fff;
    }

    .years-used {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: auto;
    }

    .years-used input {
      width: 50px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.5rem;
      border-radius: 4px;
      color: #fff;
      text-align: center;
    }

    .years-used span {
      color: #94a3b8;
    }

    /* New selection-based work pattern UI */
    .step-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.75rem;
      color: #64748b;
    }

    .time-hint, .question-count {
      background: rgba(255,255,255,0.05);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .work-question {
      margin-bottom: 2rem;
      padding: 1.25rem;
      background: rgba(255,255,255,0.02);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.05);
      transition: all 0.3s ease;
    }

    .work-question.answered {
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.03);
    }

    .work-question h2 {
      font-size: 1.25rem;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
    }

    .work-question .hint {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .option-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 640px) {
      .option-cards {
        grid-template-columns: 1fr;
      }
    }

    .option-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border: 2px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .option-card:hover:not(.disabled) {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.2);
    }

    .option-card:focus {
      outline: none;
      box-shadow: 0 0 0 2px #10b981;
    }

    .option-card.selected {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10b981;
    }

    .option-card.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .option-emoji {
      font-size: 1.5rem;
    }

    .option-label {
      font-weight: 600;
      color: #e2e8f0;
    }

    .option-desc {
      font-size: 0.75rem;
      color: #64748b;
    }

    .check-mark {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: #10b981;
      color: #fff;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }

    .option-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .option-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 25px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .option-chip:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.2);
    }

    .option-chip:focus {
      outline: none;
      box-shadow: 0 0 0 2px #10b981;
    }

    .option-chip.selected {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #10b981;
    }

    .chip-emoji {
      font-size: 1rem;
    }

    .selection-hint {
      margin-top: 0.75rem;
      font-size: 0.75rem;
      color: #f59e0b;
    }

    .question-progress {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
      font-size: 1.25rem;
      color: #475569;
    }

    .question-progress span {
      transition: color 0.3s ease;
    }

    .question-progress span.done {
      color: #10b981;
    }

    .context-section {
      margin-bottom: 2rem;
    }

    .context-section label {
      display: block;
      color: #e2e8f0;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .option-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .option-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      color: #e2e8f0;
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .option-btn.selected {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
    }

    .remote-slider {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .remote-slider input {
      flex: 1;
    }

    .remote-slider span {
      color: #10b981;
      min-width: 100px;
    }

    .nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .btn-back {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 1rem 2rem;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
    }

    .btn-next, .btn-analyze {
      background: linear-gradient(135deg, #10b981, #06d6a0);
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      cursor: pointer;
      margin-left: auto;
    }

    .btn-next:disabled, .btn-analyze:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
      transition: all 0.2s;
    }

    .mock-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(139, 92, 246, 0.5);
    }
  `]
})
export class SkillAssessmentComponent {
  currentStep = signal(1);
  totalSteps = 6;
  isSubmitting = signal(false);
  customRole = '';
  customSkill = '';

  roles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Analyst',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'QA Engineer',
    'System Administrator',
    'Security Engineer'
  ];

  skillCategories: SkillCategory[] = [
    {
      name: 'Programmeerimiskeeled',
      skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin']
    },
    {
      name: 'Frontend',
      skills: ['React', 'Angular', 'Vue', 'Next.js', 'HTML/CSS', 'Tailwind', 'SASS']
    },
    {
      name: 'Backend',
      skills: ['Node.js', 'Spring Boot', '.NET', 'Django', 'FastAPI', 'Express', 'NestJS']
    },
    {
      name: 'Andmebaasid',
      skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB']
    },
    {
      name: 'Cloud & DevOps',
      skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux']
    },
    {
      name: 'AI & Data',
      skills: ['Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas', 'Spark']
    }
  ];

  industries = [
    'Fintech', 'E-commerce', 'SaaS', 'Healthcare', 'Gaming',
    'Consulting', 'Startup', 'Enterprise', 'Government', 'Education'
  ];

  companySizes = [
    { value: 'startup', label: '1-10 (Startup)' },
    { value: 'small', label: '11-50 (Väike)' },
    { value: 'medium', label: '51-200 (Keskmine)' },
    { value: 'large', label: '201-1000 (Suur)' },
    { value: 'enterprise', label: '1000+ (Enterprise)' }
  ];

  // Work pattern selection options
  timeGoesToOptions: WorkPatternOption[] = [
    { id: 'routine', emoji: '🔄', label: 'Rutiinsed ülesanded', description: 'Andmete sisestamine, reportid, dokumentatsioon' },
    { id: 'problem-solving', emoji: '🧩', label: 'Probleemide lahendamine', description: 'Debugging, optimeerimine, arhitektuur' },
    { id: 'meetings', emoji: '💬', label: 'Koosolekud ja suhtlus', description: 'Tiimi kohtumised, kliendid, mentorlus' },
    { id: 'creative', emoji: '💡', label: 'Loov töö', description: 'Uued lahendused, eksperimendid, disain' }
  ];

  drainingOptions: WorkPatternOption[] = [
    { id: 'routine', emoji: '😴', label: 'Rutiinne töö', description: '' },
    { id: 'problem-solving', emoji: '🤯', label: 'Keerulised probleemid', description: '' },
    { id: 'meetings', emoji: '😮‍💨', label: 'Koosolekud', description: '' },
    { id: 'creative', emoji: '😓', label: 'Loov surve', description: '' }
  ];

  aiChangesOptions: WorkPatternOption[] = [
    { id: 'routine', emoji: '🤖', label: 'Rutiinsed asjad', description: '' },
    { id: 'problem-solving', emoji: '🔍', label: 'Analüüs ja debugging', description: '' },
    { id: 'meetings', emoji: '📝', label: 'Dokumenteerimine', description: '' },
    { id: 'creative', emoji: '🎨', label: 'Esimesed kavandid', description: '' }
  ];

  assessment: AssessmentData = {
    currentRole: '',
    yearsExperience: 3,
    skills: [],
    workBreakdown: {
      repetitiveTasks: 25,
      problemSolving: 35,
      communication: 20,
      creativity: 20
    },
    workPattern: {
      timeGoesTo: [],
      mostDraining: '',
      aiChangesFirst: ''
    },
    industryContext: '',
    companySize: '',
    remoteWork: 50
  };

  constructor(private router: Router, private http: HttpClient) {}

  progressPercent = computed(() => (this.currentStep() / this.totalSteps) * 100);

  selectedSkills = computed(() => this.assessment.skills.map(s => s.name));

  selectRole(role: string) {
    if (role.trim()) {
      this.assessment.currentRole = role;
    }
  }

  isSkillSelected(skill: string): boolean {
    return this.assessment.skills.some(s => s.name === skill);
  }

  toggleSkill(skill: string) {
    const index = this.assessment.skills.findIndex(s => s.name === skill);
    if (index >= 0) {
      this.assessment.skills.splice(index, 1);
    } else {
      this.assessment.skills.push({ name: skill, level: 3, yearsUsed: 1 });
    }
  }

  addCustomSkill() {
    if (this.customSkill.trim() && !this.isSkillSelected(this.customSkill)) {
      this.assessment.skills.push({ name: this.customSkill.trim(), level: 3, yearsUsed: 1 });
      this.customSkill = '';
    }
  }

  setSkillLevel(skillName: string, level: number) {
    const skill = this.assessment.skills.find(s => s.name === skillName);
    if (skill) {
      skill.level = level;
    }
  }

  // Work pattern selection methods
  isTimeGoesToSelected(id: string): boolean {
    return this.assessment.workPattern.timeGoesTo.includes(id);
  }

  toggleTimeGoesTo(id: string): void {
    const index = this.assessment.workPattern.timeGoesTo.indexOf(id);
    if (index >= 0) {
      // Remove selection
      this.assessment.workPattern.timeGoesTo.splice(index, 1);
    } else if (this.assessment.workPattern.timeGoesTo.length < 2) {
      // Add selection (max 2)
      this.assessment.workPattern.timeGoesTo.push(id);
    }
    this.updateWorkBreakdownFromPattern();
  }

  selectMostDraining(id: string): void {
    this.assessment.workPattern.mostDraining = id;
    this.updateWorkBreakdownFromPattern();
  }

  selectAiChangesFirst(id: string): void {
    this.assessment.workPattern.aiChangesFirst = id;
    this.updateWorkBreakdownFromPattern();
  }

  /**
   * Updates the legacy workBreakdown percentages from the new selection-based pattern.
   * This ensures backward compatibility with existing scoring/API.
   */
  private updateWorkBreakdownFromPattern(): void {
    this.assessment.workBreakdown = mapAnswersToWorkdayWeights(this.assessment.workPattern);
  }

  workPatternComplete(): boolean {
    return this.assessment.workPattern.timeGoesTo.length > 0 &&
           !!this.assessment.workPattern.mostDraining &&
           !!this.assessment.workPattern.aiChangesFirst;
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return !!this.assessment.currentRole;
      case 2: return true;
      case 3: return this.assessment.skills.length >= 3;
      case 4: return true;
      case 5: return this.assessment.workPattern.timeGoesTo.length > 0; // At least one selection, gentle validation
      case 6: return !!this.assessment.industryContext && !!this.assessment.companySize;
      default: return true;
    }
  }

  nextStep() {
    if (this.canProceed() && this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  submitAssessment() {
    this.isSubmitting.set(true);

    // Store assessment in localStorage for the analysis page
    localStorage.setItem('careerAssessment', JSON.stringify(this.assessment));

    // Navigate to analysis page
    this.router.navigate(['/analysis'], {
      queryParams: { source: 'assessment' }
    });
  }

  fillMockData() {
    // Fill all form data with mock values
    this.assessment = {
      currentRole: 'Full Stack Developer',
      yearsExperience: 5,
      skills: [
        { name: 'TypeScript', level: 4, yearsUsed: 3 },
        { name: 'React', level: 4, yearsUsed: 3 },
        { name: 'Node.js', level: 3, yearsUsed: 2 },
        { name: 'PostgreSQL', level: 3, yearsUsed: 2 },
        { name: 'Docker', level: 2, yearsUsed: 1 },
        { name: 'AWS', level: 2, yearsUsed: 1 }
      ],
      workBreakdown: {
        repetitiveTasks: 20,
        problemSolving: 40,
        communication: 25,
        creativity: 15
      },
      workPattern: {
        timeGoesTo: ['problem-solving', 'creative'],
        mostDraining: 'meetings',
        aiChangesFirst: 'routine'
      },
      industryContext: 'SaaS',
      companySize: 'medium',
      remoteWork: 80
    };

    // Update workBreakdown from the new pattern
    this.updateWorkBreakdownFromPattern();

    // Jump to last step
    this.currentStep.set(this.totalSteps);
  }
}
