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
  workBreakdown: {
    repetitiveTasks: number;
    problemSolving: number;
    communication: number;
    creativity: number;
  };
  industryContext: string;
  companySize: string;
  remoteWork: number;
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

      <!-- Step 5: Work breakdown -->
      @if (currentStep() === 5) {
        <div class="step fade-in">
          <h1>Kuidas sinu tööpäev jaguneb?</h1>
          <p class="subtitle">See aitab hinnata automatiseerimise riski</p>

          <div class="work-sliders">
            <div class="slider-row">
              <label>
                <span class="emoji">🔄</span>
                Rutiinsed ülesanded
                <span class="hint">(andmete sisestamine, reportid, copy-paste)</span>
              </label>
              <input type="range" min="0" max="100" step="5"
                [ngModel]="assessment.workBreakdown.repetitiveTasks"
                (input)="updateWorkBreakdown('repetitiveTasks', $event)">
              <span class="percent">{{ assessment.workBreakdown.repetitiveTasks }}%</span>
            </div>

            <div class="slider-row">
              <label>
                <span class="emoji">🧩</span>
                Probleemide lahendamine
                <span class="hint">(debugging, arhitektuur, optimeerimine)</span>
              </label>
              <input type="range" min="0" max="100" step="5"
                [ngModel]="assessment.workBreakdown.problemSolving"
                (input)="updateWorkBreakdown('problemSolving', $event)">
              <span class="percent">{{ assessment.workBreakdown.problemSolving }}%</span>
            </div>

            <div class="slider-row">
              <label>
                <span class="emoji">💬</span>
                Suhtlus & koostöö
                <span class="hint">(koosolekud, mentorlus, kliendid)</span>
              </label>
              <input type="range" min="0" max="100" step="5"
                [ngModel]="assessment.workBreakdown.communication"
                (input)="updateWorkBreakdown('communication', $event)">
              <span class="percent">{{ assessment.workBreakdown.communication }}%</span>
            </div>

            <div class="slider-row">
              <label>
                <span class="emoji">💡</span>
                Loovus & innovatsioon
                <span class="hint">(uued lahendused, eksperimendid, R&D)</span>
              </label>
              <input type="range" min="0" max="100" step="5"
                [ngModel]="assessment.workBreakdown.creativity"
                (input)="updateWorkBreakdown('creativity', $event)">
              <span class="percent">{{ assessment.workBreakdown.creativity }}%</span>
            </div>
          </div>

          <div class="breakdown-total">
            Kokku: {{ workBreakdownTotal() }}%
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

    .work-sliders {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .slider-row {
      background: rgba(255,255,255,0.03);
      padding: 1rem;
      border-radius: 8px;
    }

    .slider-row label {
      display: block;
      color: #e2e8f0;
      margin-bottom: 0.75rem;
    }

    .slider-row .emoji {
      margin-right: 0.5rem;
    }

    .slider-row .hint {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .slider-row input[type="range"] {
      width: calc(100% - 60px);
      height: 6px;
      -webkit-appearance: none;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }

    .slider-row input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: #10b981;
      border-radius: 50%;
      cursor: pointer;
    }

    .slider-row .percent {
      float: right;
      color: #10b981;
      font-weight: 500;
    }

    .breakdown-total {
      text-align: center;
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .breakdown-total.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .warning-text {
      font-size: 0.875rem;
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
    industryContext: '',
    companySize: '',
    remoteWork: 50
  };

  constructor(private router: Router, private http: HttpClient) {}

  progressPercent = computed(() => (this.currentStep() / this.totalSteps) * 100);

  selectedSkills = computed(() => this.assessment.skills.map(s => s.name));

  workBreakdownTotal = computed(() =>
    this.assessment.workBreakdown.repetitiveTasks +
    this.assessment.workBreakdown.problemSolving +
    this.assessment.workBreakdown.communication +
    this.assessment.workBreakdown.creativity
  );

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

  updateWorkBreakdown(field: keyof typeof this.assessment.workBreakdown, event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = parseInt(input.value, 10);
    const oldValue = this.assessment.workBreakdown[field];
    const diff = newValue - oldValue;

    if (diff === 0) return;

    // Get other fields
    const allFields: (keyof typeof this.assessment.workBreakdown)[] = [
      'repetitiveTasks', 'problemSolving', 'communication', 'creativity'
    ];
    const otherFields = allFields.filter(f => f !== field);

    // Calculate total of other fields
    const otherTotal = otherFields.reduce((sum, f) => sum + this.assessment.workBreakdown[f], 0);

    if (otherTotal === 0 && diff > 0) {
      // Can't take from others if they're all 0
      this.assessment.workBreakdown[field] = newValue;
      return;
    }

    // Set the new value for the changed field
    this.assessment.workBreakdown[field] = newValue;

    // Distribute the negative diff proportionally among other fields
    let remaining = -diff;
    for (let i = 0; i < otherFields.length; i++) {
      const f = otherFields[i];
      const currentVal = this.assessment.workBreakdown[f];

      if (i === otherFields.length - 1) {
        // Last field gets the remainder to ensure exactly 100%
        const newVal = Math.max(0, Math.min(100, currentVal + remaining));
        this.assessment.workBreakdown[f] = newVal;
      } else if (otherTotal > 0) {
        // Distribute proportionally
        const proportion = currentVal / otherTotal;
        const change = Math.round(-diff * proportion);
        const newVal = Math.max(0, Math.min(100, currentVal + change));
        const actualChange = newVal - currentVal;
        this.assessment.workBreakdown[f] = newVal;
        remaining -= actualChange;
      }
    }

    // Final correction to ensure exactly 100%
    const total = this.workBreakdownTotal();
    if (total !== 100) {
      const correction = 100 - total;
      // Find a field that can absorb the correction
      for (const f of otherFields) {
        const val = this.assessment.workBreakdown[f];
        const newVal = val + correction;
        if (newVal >= 0 && newVal <= 100) {
          this.assessment.workBreakdown[f] = newVal;
          break;
        }
      }
    }
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return !!this.assessment.currentRole;
      case 2: return true;
      case 3: return this.assessment.skills.length >= 3;
      case 4: return true;
      case 5: return true; // Always 100% now with linked sliders
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
      industryContext: 'SaaS',
      companySize: 'medium',
      remoteWork: 80
    };

    // Jump to last step
    this.currentStep.set(this.totalSteps);
  }
}
