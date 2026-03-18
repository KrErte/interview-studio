import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { ApiClient } from '../../../core/api/api-client.service';
import { Subject, takeUntil, catchError, of } from 'rxjs';

type VisibilityMode = 'OFF' | 'ANON' | 'PUBLIC';
type FlowStep = 'OVERVIEW' | 1 | 2 | 3 | 4;
type InsightView = 'overview' | 'strengths' | 'gaps';
type CareerriskNavKey = 'OVERVIEW' | 'PROFILE' | 'QUESTIONS' | 'ANALYSIS' | 'ROADMAP';

interface PivotRoleMatch {
  id: string;
  targetRole: string;
  archetype?: string;
  matchPercent: number;
  location?: string;
  seniority?: string;
  overlapSkills: string[];
  gapSkills: string[];
}

interface CareerRiskReadinessScore {
  overall: number;
  adaptability: number;
  automationResilience: number;
  learningVelocity: number;
  explanation?: string;
}

interface MarketplaceVisibilitySettings {
  mode: VisibilityMode;
  visibilityThreshold: number;
}

type PlanDuration = '7d' | '30d' | '90d';

interface PlanBlock {
  title: string;
  summary: string;
  tasks: string[];
}

@Component({
  selector: 'app-pivot-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pivot-roles.page.html',
  styleUrls: ['./pivot-roles.page.scss']
})
export class PivotRolesPageComponent implements OnInit, OnDestroy {
  currentStep: FlowStep = 'OVERVIEW';
  activeNav: CareerriskNavKey = 'OVERVIEW';

  // Step 1 inputs
  profileYears: number | null = null;
  profileRole = '';
  profileSeniority = 'Mid';
  cvFileName: string | null = null;

  // Internal insights view
  insightView: InsightView = 'overview';

  roleMatches: PivotRoleMatch[] = [];
  loadingRoles = false;
  rolesError: string | null = null;

  careerRiskScore: CareerRiskReadinessScore | null = null;
  loadingScore = false;
  scoreError: string | null = null;

  benchmarkPercentile = 18;
  benchmarkFieldAverage = 63;

  visibility: MarketplaceVisibilitySettings | null = null;
  visibilityDraftMode: VisibilityMode = 'ANON';
  visibilityDraftThreshold = 70;
  loadingVisibility = false;
  savingVisibility = false;
  visibilityError: string | null = null;
  visibilitySavedMessage: string | null = null;

  planDuration: PlanDuration = '7d';
  planBlocks: Record<PlanDuration, PlanBlock[]> = {
    '7d': [
      {
        title: 'Days 1-2',
        summary: 'Consolidate CV and interview signals into one profile.',
        tasks: ['Upload CV and mark current role', 'Mark 3 main strengths', 'Set up visibility']
      },
      {
        title: 'Days 3-5',
        summary: 'Test new workflows and measure readiness.',
        tasks: ['Try 2 new tools', 'Document metrics', 'Add learning notes']
      },
      {
        title: 'Days 6-7',
        summary: 'Choose one pivot role and lock a mini roadmap.',
        tasks: ['Choose a position', 'Generate a short roadmap', 'Share with persona theater for feedback']
      }
    ],
    '30d': [
      {
        title: 'Week 1',
        summary: 'Systematic profile update and interview signals.',
        tasks: ['Update CV signals', 'Practice 2 engines', 'Map gaps']
      },
      {
        title: 'Weeks 2-3',
        summary: 'Deep learning and measurement.',
        tasks: ['Complete 3 micro-projects', 'Measure results', 'Run repeat analysis']
      },
      {
        title: 'Week 4',
        summary: 'Lock readiness and visibility.',
        tasks: ['Refresh visibility', 'Submit 2 applications', 'Confirm roadmap for next month']
      }
    ],
    '90d': [
      {
        title: 'Month 1',
        summary: 'Foundation and tools.',
        tasks: ['CV and portfolio', 'Automation hands-on exercises', 'Field benchmark']
      },
      {
        title: 'Month 2',
        summary: 'Application and depth.',
        tasks: ['3 real-world use cases', 'Performance metrics', 'Team collaboration simulation']
      },
      {
        title: 'Month 3',
        summary: 'Market readiness.',
        tasks: ['Persona theater feedback', 'Visibility campaign', 'Interview dress rehearsal']
      }
    ]
  };

  snapshotBusy = false;
  lastSnapshotMessage: string | null = null;
  planSelectionMessage: string | null = null;

  strengths: string[] = [
    'Workshop facilitation',
    'Architecture reviews',
    'Rapid prototyping',
    'Data storytelling and decision making'
  ];

  strengthsAboveBenchmark = [
    { name: 'Adaptability', delta: '+8%' },
    { name: 'Learning velocity', delta: '+6%' }
  ];

  gaps: string[] = ['Model evaluation', 'Prompt chaining', 'Latency budgeting', 'Vendor comparison'];

  gapsBelowBenchmark = [
    { name: 'Automation resilience', delta: '-5%' },
    { name: 'Systematic measurement', delta: '-4%' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navContext: NavContextService,
    private api: ApiClient
  ) {}

  ngOnInit(): void {
    this.navContext.setCareerriskNav([
      { label: 'Overview', key: 'OVERVIEW' },
      { label: 'Profile', key: 'PROFILE' },
      { label: 'Questions', key: 'QUESTIONS' },
      { label: 'Analysis', key: 'ANALYSIS' },
      { label: 'Roadmap', key: 'ROADMAP' }
    ]);

    this.navContext.commands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => this.applyNavCommand(key as CareerriskNavKey));

    const queryStep = (this.route.snapshot.queryParamMap.get('step') || '').toUpperCase();
    if (['OVERVIEW', 'PROFILE', 'QUESTIONS', 'ANALYSIS', 'ROADMAP'].includes(queryStep)) {
      this.applyNavCommand(queryStep as CareerriskNavKey, true);
    }

    this.loadRoleMatches();
    this.loadCareerRiskScore();
    this.loadVisibility();
  }

  ngOnDestroy(): void {
    this.navContext.resetNav();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasAnyData(): boolean {
    return !!(this.roleMatches.length || this.careerRiskScore || this.visibility);
  }

  setInsightView(view: InsightView): void {
    this.insightView = view;
  }

  goToQuestions(): void {
    this.router.navigateByUrl('/careerrisk/questions');
  }

  goToAssessment(): void {
    this.router.navigateByUrl('/careerrisk/assessment');
  }

  goToRoadmap(): void {
    this.router.navigateByUrl('/careerrisk/roadmap');
  }

  goToStep(step: FlowStep): void {
    this.currentStep = step;
    this.activeNav = this.stepToNav(step);
    this.navContext.setActiveKey(this.activeNav);
    if (step === 3) {
      this.insightView = 'overview';
    }
    if (step === 'OVERVIEW') {
      this.insightView = 'overview';
    }
  }

  startFlow(): void {
    this.goToQuestions();
  }

  analyzeReadiness(): void {
    if (this.snapshotBusy) {
      return;
    }

    this.snapshotBusy = true;
    this.lastSnapshotMessage = null;
    this.api.post<any>('/pivot/role-matches/compute', {}).pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.snapshotBusy = false;
      this.lastSnapshotMessage = 'Career-risk readiness overview updated. Matches refreshed.';
      this.currentStep = 3;
      this.activeNav = 'ANALYSIS';
      this.navContext.setActiveKey(this.activeNav);
      this.insightView = 'overview';
      this.loadRoleMatches();
    });
  }

  onTrackProgress(): void {
    this.planSelectionMessage = 'Readiness tracking coming soon.';
    this.router.navigateByUrl('/careerrisk');
  }

  onGeneratePlan(match: PivotRoleMatch): void {
    this.planSelectionMessage = `Created a starter roadmap for ${match.targetRole}.`;
    this.goToRoadmap();
  }

  selectPlanDuration(duration: PlanDuration): void {
    this.planDuration = duration;
  }

  isPlanDuration(duration: PlanDuration): boolean {
    return this.planDuration === duration;
  }

  isVisibilityMode(mode: VisibilityMode): boolean {
    return this.visibilityDraftMode === mode;
  }

  setVisibilityMode(mode: VisibilityMode): void {
    this.visibilityDraftMode = mode;
    this.visibilitySavedMessage = null;
  }

  onThresholdChange(value: number): void {
    const constrained = Math.max(0, Math.min(100, Number(value)));
    this.visibilityDraftThreshold = constrained;
    this.visibilitySavedMessage = null;
  }

  saveVisibility(): void {
    this.savingVisibility = true;
    this.visibilityError = null;
    this.visibilitySavedMessage = null;

    const payload = {
      visibility: this.visibilityDraftMode,
      visibilityThreshold: this.visibilityDraftThreshold
    };

    this.api.put<MarketplaceVisibilitySettings>('/marketplace/profile', payload).pipe(
      catchError(() => {
        // Fallback: apply locally even if backend fails
        return of({
          mode: this.visibilityDraftMode,
          visibilityThreshold: this.visibilityDraftThreshold
        } as MarketplaceVisibilitySettings);
      }),
      takeUntil(this.destroy$)
    ).subscribe((vis) => {
      this.visibility = vis;
      this.savingVisibility = false;
      this.visibilitySavedMessage = 'Visibility preferences saved for your career-risk profile.';
    });
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/careerrisk/questions');
  }

  private applyNavCommand(key: CareerriskNavKey, fromQuery: boolean = false): void {
    this.activeNav = key;
    this.navContext.setActiveKey(key);
    if (key === 'OVERVIEW') {
      this.goToStep('OVERVIEW');
    } else if (key === 'PROFILE') {
      this.goToStep(1);
    } else if (key === 'QUESTIONS') {
      this.goToStep(2);
    } else if (key === 'ANALYSIS') {
      this.goToStep(3);
      this.insightView = 'overview';
    } else if (key === 'ROADMAP') {
      // if already on roadmap route, stay; otherwise navigate
      if (!fromQuery) {
        this.goToRoadmap();
      } else {
        this.goToRoadmap();
      }
    }
  }

  private stepToNav(step: FlowStep): CareerriskNavKey {
    if (step === 'OVERVIEW') return 'OVERVIEW';
    if (step === 1) return 'PROFILE';
    if (step === 2) return 'QUESTIONS';
    if (step === 3) return 'ANALYSIS';
    return 'ROADMAP';
  }

  onCvSelected(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target?.files && target.files.length > 0) {
      this.cvFileName = target.files[0].name;
    }
  }

  private readonly mockRoleMatches: PivotRoleMatch[] = [
    {
      id: 'ai-product',
      targetRole: 'AI Product Strategist',
      archetype: 'Bridge builder',
      matchPercent: 78,
      location: 'Hybrid · EU',
      seniority: 'Senior IC',
      overlapSkills: ['User research', 'Experiment design', 'Data storytelling'],
      gapSkills: ['Model evaluation', 'Prompt chaining']
    },
    {
      id: 'ml-pm',
      targetRole: 'ML Platform PM',
      archetype: 'Systems thinker',
      matchPercent: 74,
      location: 'Remote',
      seniority: 'Staff',
      overlapSkills: ['Stakeholder alignment', 'Architecture reviews', 'Risk-based testing'],
      gapSkills: ['Feature flags at scale', 'Latency budgeting']
    },
    {
      id: 'solutions',
      targetRole: 'AI Solutions Lead',
      archetype: 'Customer-first',
      matchPercent: 69,
      location: 'Hybrid · EU',
      seniority: 'Senior IC',
      overlapSkills: ['Workshop facilitation', 'Rapid prototyping', 'Outcome framing'],
      gapSkills: ['Vendor evaluation', 'Cost forecasting']
    }
  ];

  private loadRoleMatches(): void {
    this.loadingRoles = true;
    this.rolesError = null;
    this.api.get<PivotRoleMatch[]>('/pivot/role-matches').pipe(
      catchError(() => of(this.mockRoleMatches)),
      takeUntil(this.destroy$)
    ).subscribe((matches) => {
      this.roleMatches = matches;
      this.loadingRoles = false;
    });
  }

  private readonly mockCareerRiskScore: CareerRiskReadinessScore = {
    overall: 82,
    adaptability: 79,
    automationResilience: 76,
    learningVelocity: 86,
    explanation: 'Score blends your interview signals, CV overlap, and recent upskilling activity.'
  };

  private loadCareerRiskScore(): void {
    this.loadingScore = true;
    this.scoreError = null;
    this.api.get<CareerRiskReadinessScore>('/career-risk-score').pipe(
      catchError(() => of(this.mockCareerRiskScore)),
      takeUntil(this.destroy$)
    ).subscribe((score) => {
      this.careerRiskScore = score;
      this.loadingScore = false;
    });
  }

  private readonly mockVisibility: MarketplaceVisibilitySettings = {
    mode: 'ANON',
    visibilityThreshold: 72
  };

  private loadVisibility(): void {
    this.loadingVisibility = true;
    this.visibilityError = null;
    this.api.get<MarketplaceVisibilitySettings>('/marketplace/profile').pipe(
      catchError(() => of(this.mockVisibility)),
      takeUntil(this.destroy$)
    ).subscribe((vis) => {
      this.visibility = vis;
      this.visibilityDraftMode = vis.mode;
      this.visibilityDraftThreshold = vis.visibilityThreshold;
      this.loadingVisibility = false;
    });
  }

}

