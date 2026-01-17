import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { RiskApiService } from '../../../core/services/risk-api.service';
import { AuthService } from '../../../core/auth/auth-api.service';
import { AssessmentResult, RiskLevel } from '../../../core/models/risk.models';
import { Subject, takeUntil } from 'rxjs';
import { DisruptionTimelineComponent, DisruptionPoint } from './disruption-timeline.component';
import { ThreatRadarComponent, ThreatVector } from './threat-radar.component';
import { SkillVulnerabilityMatrixComponent, SkillCell } from './skill-vulnerability-matrix.component';
import { CareerVitalsComponent, VitalSign } from './career-vitals.component';
import { AIEncroachmentTimelineComponent, AIMilestone } from './ai-encroachment-timeline.component';
import { ScenarioSimulatorComponent } from './scenario-simulator.component';
import { SkillDecayClockComponent } from './skill-decay-clock.component';
import { MarketPulseComponent } from './market-pulse.component';
import { DisruptionAutopsyComponent } from './disruption-autopsy.component';

@Component({
  selector: 'app-futureproof-assessment-page',
  standalone: true,
  imports: [
    CommonModule,
    DisruptionTimelineComponent,
    ThreatRadarComponent,
    SkillVulnerabilityMatrixComponent,
    CareerVitalsComponent,
    AIEncroachmentTimelineComponent,
    ScenarioSimulatorComponent,
    SkillDecayClockComponent,
    MarketPulseComponent,
    DisruptionAutopsyComponent
  ],
  templateUrl: './futureproof-assessment.page.html'
})
export class FutureproofAssessmentPageComponent implements OnInit, OnDestroy {
  assessment: AssessmentResult | null = null;
  loading = false;
  error: string | null = null;
  sessionId: string | null = null;
  showDetails = false;
  selectedTimelineRisk: { year: number; risk: number } | null = null;
  showRegisterPrompt = false;
  activeTab: 'overview' | 'threats' | 'skills' | 'vitals' | 'timeline' | 'simulator' | 'decay' | 'pulse' | 'autopsy' = 'overview';

  private destroy$ = new Subject<void>();

  // Mock data for unique visualizations
  threatVectors: ThreatVector[] = [
    {
      id: 'code-gen',
      label: 'Code Generation',
      severity: 78,
      category: 'automation',
      eta: '6 months',
      description: 'AI models now generate production-quality code for standard patterns'
    },
    {
      id: 'data-analysis',
      label: 'Data Analysis',
      severity: 65,
      category: 'automation',
      eta: '1 year',
      description: 'Automated insights generation replacing manual analysis workflows'
    },
    {
      id: 'offshore',
      label: 'Global Talent Pool',
      severity: 52,
      category: 'outsourcing',
      eta: '18 months',
      description: 'Remote-first culture enabling access to global specialists at lower cost'
    },
    {
      id: 'no-code',
      label: 'No-Code Platforms',
      severity: 45,
      category: 'obsolescence',
      eta: '2 years',
      description: 'Business users now build applications without traditional coding'
    },
    {
      id: 'ai-natives',
      label: 'AI-Native Workforce',
      severity: 38,
      category: 'competition',
      eta: '3 years',
      description: 'New graduates entering with native AI collaboration skills'
    }
  ];

  skillCells: SkillCell[] = [
    { skill: 'Python', currentLevel: 85, aiCapability: 90, demandTrend: 'stable', category: 'Programming' },
    { skill: 'JavaScript', currentLevel: 80, aiCapability: 88, demandTrend: 'stable', category: 'Programming' },
    { skill: 'SQL', currentLevel: 75, aiCapability: 95, demandTrend: 'declining', category: 'Programming' },
    { skill: 'API Design', currentLevel: 70, aiCapability: 60, demandTrend: 'rising', category: 'Architecture' },
    { skill: 'System Design', currentLevel: 65, aiCapability: 40, demandTrend: 'rising', category: 'Architecture' },
    { skill: 'Documentation', currentLevel: 60, aiCapability: 85, demandTrend: 'declining', category: 'Communication' },
    { skill: 'Code Review', currentLevel: 75, aiCapability: 70, demandTrend: 'stable', category: 'Communication' },
    { skill: 'Stakeholder Mgmt', currentLevel: 55, aiCapability: 15, demandTrend: 'rising', category: 'Leadership' },
    { skill: 'Team Mentoring', currentLevel: 50, aiCapability: 10, demandTrend: 'rising', category: 'Leadership' },
    { skill: 'Testing', currentLevel: 70, aiCapability: 82, demandTrend: 'declining', category: 'Quality' },
    { skill: 'Debugging', currentLevel: 80, aiCapability: 75, demandTrend: 'stable', category: 'Quality' },
    { skill: 'Performance Opt.', currentLevel: 60, aiCapability: 55, demandTrend: 'stable', category: 'Quality' }
  ];

  vitalSigns: VitalSign[] = [
    {
      id: 'market-demand',
      label: 'Market Demand',
      value: 72,
      unit: 'idx',
      min: 0,
      max: 100,
      optimalMin: 60,
      optimalMax: 100,
      trend: 'down',
      history: [85, 82, 80, 78, 76, 75, 74, 73, 72, 72, 72, 72]
    },
    {
      id: 'skill-currency',
      label: 'Skill Currency',
      value: 68,
      unit: '%',
      min: 0,
      max: 100,
      optimalMin: 75,
      optimalMax: 100,
      trend: 'down',
      history: [88, 85, 82, 79, 76, 74, 72, 70, 69, 68, 68, 68]
    },
    {
      id: 'ai-collaboration',
      label: 'AI Collaboration',
      value: 45,
      unit: '%',
      min: 0,
      max: 100,
      optimalMin: 60,
      optimalMax: 100,
      trend: 'up',
      history: [20, 25, 28, 32, 35, 38, 40, 42, 43, 44, 45, 45]
    },
    {
      id: 'adaptability',
      label: 'Adaptability Score',
      value: 82,
      unit: 'pts',
      min: 0,
      max: 100,
      optimalMin: 70,
      optimalMax: 100,
      trend: 'stable',
      history: [80, 81, 80, 82, 81, 82, 83, 82, 81, 82, 82, 82]
    },
    {
      id: 'learning-velocity',
      label: 'Learning Velocity',
      value: 56,
      unit: 'u/mo',
      min: 0,
      max: 100,
      optimalMin: 50,
      optimalMax: 100,
      trend: 'up',
      history: [40, 42, 44, 46, 48, 50, 51, 52, 54, 55, 56, 56]
    },
    {
      id: 'network-strength',
      label: 'Network Strength',
      value: 38,
      unit: 'conn',
      min: 0,
      max: 100,
      optimalMin: 50,
      optimalMax: 100,
      trend: 'stable',
      history: [35, 36, 36, 37, 37, 37, 38, 38, 38, 38, 38, 38]
    }
  ];

  aiMilestones: AIMilestone[] = [
    {
      year: 2024,
      capability: 'Automated Code Suggestions',
      description: 'AI provides real-time code completions and suggestions',
      impact: 'medium',
      probability: 100,
      status: 'past',
      affectedTasks: ['Basic coding', 'Boilerplate generation', 'Simple refactoring']
    },
    {
      year: 2025,
      capability: 'Autonomous Bug Fixing',
      description: 'AI identifies and fixes common bugs without human intervention',
      impact: 'high',
      probability: 85,
      status: 'imminent',
      affectedTasks: ['Debugging', 'Error resolution', 'Test maintenance', 'Patch generation']
    },
    {
      year: 2026,
      capability: 'Full Feature Implementation',
      description: 'AI builds complete features from natural language specifications',
      impact: 'critical',
      probability: 70,
      status: 'projected',
      affectedTasks: ['Feature development', 'CRUD operations', 'API development', 'UI implementation']
    },
    {
      year: 2027,
      capability: 'Architecture Design',
      description: 'AI proposes and validates system architectures autonomously',
      impact: 'high',
      probability: 55,
      status: 'projected',
      affectedTasks: ['System design', 'Tech stack decisions', 'Scalability planning']
    },
    {
      year: 2029,
      capability: 'Strategic Technical Leadership',
      description: 'AI provides strategic technology recommendations at executive level',
      impact: 'medium',
      probability: 35,
      status: 'projected',
      affectedTasks: ['Roadmap planning', 'Resource allocation', 'Vendor evaluation']
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navContext: NavContextService,
    private riskApi: RiskApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Overview', key: 'OVERVIEW' },
      { label: 'Profile', key: 'PROFILE' },
      { label: 'Questions', key: 'QUESTIONS' },
      { label: 'Analysis', key: 'ANALYSIS' },
      { label: 'Roadmap', key: 'ROADMAP' }
    ]);
    this.navContext.setActiveKey('ANALYSIS');

    const qpSession = this.route.snapshot.queryParamMap.get('sessionId');
    const storedSession = sessionStorage.getItem('fp_session');
    this.sessionId = qpSession || storedSession;

    this.loadAssessment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get riskBandLabel(): string {
    if (!this.assessment) return '—';
    if (this.assessment.riskBand === RiskLevel.LOW) return 'Low';
    if (this.assessment.riskBand === RiskLevel.MEDIUM) return 'Medium';
    return 'High';
  }

  get confidencePercent(): number {
    return this.assessment?.confidence ?? 0;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab as 'overview' | 'threats' | 'skills' | 'vitals' | 'timeline' | 'simulator' | 'decay' | 'pulse' | 'autopsy';
  }

  retry(): void {
    this.loadAssessment();
  }

  goToRoadmap(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/futureproof/roadmap');
    } else {
      this.showRegisterPrompt = true;
    }
  }

  closeRegisterPrompt(): void {
    this.showRegisterPrompt = false;
  }

  goToRegister(): void {
    if (this.sessionId) {
      localStorage.setItem('pending_assessment_session', this.sessionId);
    }
    this.router.navigateByUrl('/register');
  }

  goToLogin(): void {
    if (this.sessionId) {
      localStorage.setItem('pending_assessment_session', this.sessionId);
    }
    this.router.navigateByUrl('/login');
  }

  goToQuestions(): void {
    this.router.navigateByUrl('/futureproof/questions');
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  get topPivotRoles(): string[] {
    const roles = (this.assessment as any)?.pivotRoles as string[] | undefined;
    if (!roles || !Array.isArray(roles)) {
      return [];
    }
    return roles.slice(0, 3);
  }

  get timelinePoints(): DisruptionPoint[] {
    const raw = (this.assessment as any)?.timeline as DisruptionPoint[] | undefined;
    if (raw && Array.isArray(raw) && raw.length) {
      return raw.slice(0, 3);
    }
    // fallback mock
    return [
      { year: new Date().getFullYear(), automationRisk: 22, insight: 'AI assistants support but don\'t replace your role.' },
      { year: new Date().getFullYear() + 2, automationRisk: 38, insight: 'Repetitive tasks automated; critical thinking stays with you.' },
      { year: new Date().getFullYear() + 5, automationRisk: 57, insight: 'Role requires orchestration and systems thinking.' }
    ];
  }

  get currentRole(): string {
    return (this.assessment as any)?.currentRole || 'Software Engineer';
  }

  private setInitialTimelineSelection(): void {
    const points = this.timelinePoints;
    if (!points.length) {
      this.selectedTimelineRisk = null;
      return;
    }
    const highest = [...points].sort((a, b) => b.automationRisk - a.automationRisk)[0];
    this.selectedTimelineRisk = { year: highest.year, risk: highest.automationRisk };
  }

  onTimelineSelect(point: DisruptionPoint): void {
    this.selectedTimelineRisk = { year: point.year, risk: point.automationRisk };
  }

  get ctaVisible(): boolean {
    return (this.selectedTimelineRisk?.risk ?? 0) >= 40;
  }

  get ctaPrimary(): boolean {
    const risk = this.selectedTimelineRisk?.risk ?? 0;
    return risk >= 50;
  }

  get ctaYear(): number | null {
    return this.selectedTimelineRisk?.year ?? null;
  }

  private loadAssessment(): void {
    this.loading = true;
    this.error = null;

    const sid = this.sessionId;
    if (!sid) {
      this.riskApi
        .startAssessment({
          cvFileId: undefined,
          experience: {
            yearsOfExperience: 0,
            currentRole: '',
            seniority: 'Mid',
            industry: '',
            stack: ''
          }
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.sessionId = res.sessionId;
            if (res.sessionId) {
              sessionStorage.setItem('fp_session', res.sessionId);
            }
            this.fetchAssessment(res.sessionId);
            this.setInitialTimelineSelection();
          },
          error: (err) => {
            this.loading = false;
            this.error = err?.error?.message || 'Failed to start analysis. Please try again.';
          }
        });
    } else {
      this.fetchAssessment(sid);
    }
  }

  private fetchAssessment(sessionId: string): void {
    this.riskApi
      .getAssessment(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.assessment = res;
          this.loading = false;
          this.setInitialTimelineSelection();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to load analysis. Please try again.';
        }
      });
  }
}
