import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { Subject, takeUntil } from 'rxjs';

type VisibilityMode = 'OFF' | 'ANON' | 'PUBLIC';
type FlowStep = 'OVERVIEW' | 1 | 2 | 3 | 4;
type InsightView = 'overview' | 'strengths' | 'gaps';
type FutureproofNavKey = 'OVERVIEW' | 'PROFILE' | 'QUESTIONS' | 'ANALYSIS' | 'ROADMAP';

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

interface FutureReadinessScore {
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
  activeNav: FutureproofNavKey = 'OVERVIEW';

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

  futureScore: FutureReadinessScore | null = null;
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
        title: 'Päevad 1-2',
        summary: 'Koonda CV ja intervjuu signaalid ühte profiili.',
        tasks: ['Lae CV ja märgi praegune roll', 'Märgi 3 peamist tugevust', 'Seadista nähtavus']
      },
      {
        title: 'Päevad 3-5',
        summary: 'Testi uusi töövooge ja mõõda valmidust.',
        tasks: ['Katseta 2 uut tööriista', 'Dokumenteeri mõõdikud', 'Lisa õppimismärkmed']
      },
      {
        title: 'Päev 6-7',
        summary: 'Vali üks pöördepositsioon ja lukusta mini-tegevuskava.',
        tasks: ['Vali positsioon', 'Genereeri lühike tegevuskava', 'Jaga persona teatriga tagasisideks']
      }
    ],
    '30d': [
      {
        title: 'Nädal 1',
        summary: 'Süsteemne profiili uuendus ja intervjuu signaalid.',
        tasks: ['Täienda CV signaalid', 'Harjuta 2 mootorit', 'Kaardista lüngad']
      },
      {
        title: 'Nädalad 2-3',
        summary: 'Sügav õppimine ja mõõtmine.',
        tasks: ['Täida 3 mikroprojekti', 'Mõõda tulemusi', 'Tee kordusanalüüs']
      },
      {
        title: 'Nädal 4',
        summary: 'Valmisoleku lukustamine ja nähtavus.',
        tasks: ['Värskenda nähtavust', 'Saada 2 taotlust', 'Kinnita tegevuskava järgmiseks kuuks']
      }
    ],
    '90d': [
      {
        title: 'Kuu 1',
        summary: 'Vundament ja tööriistad.',
        tasks: ['CV ja portfoolio', 'Automatiseerimise praktilised harjutused', 'Valdkonna benchmark']
      },
      {
        title: 'Kuu 2',
        summary: 'Rakendus ja sügavus.',
        tasks: ['3 päris-kasutusjuhtu', 'Jõudlusmõõdikud', 'Tiimikoostöö simulatsioon']
      },
      {
        title: 'Kuu 3',
        summary: 'Turuvalmidus.',
        tasks: ['Persona teatrist tagasiside', 'Nähtavuse kampaania', 'Intervjuu dress rehearsal']
      }
    ]
  };

  snapshotBusy = false;
  lastSnapshotMessage: string | null = null;
  planSelectionMessage: string | null = null;

  strengths: string[] = [
    'Töötubade juhtimine',
    'Arhitektuuri ülevaatused',
    'Kiire prototüüpimine',
    'Andmelugu ja otsustamine'
  ];

  strengthsAboveBenchmark = [
    { name: 'Kohanemisvõime', delta: '+8%' },
    { name: 'Õppimiskiirus', delta: '+6%' }
  ];

  gaps: string[] = ['Mudelihindamine', 'Promptide ahel', 'Latency eelarvestamine', 'Vendorite võrdlus'];

  gapsBelowBenchmark = [
    { name: 'Automatiseerimise vastupidavus', delta: '-5%' },
    { name: 'Süsteemne mõõtmine', delta: '-4%' }
  ];

  private timers: ReturnType<typeof setTimeout>[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navContext: NavContextService
  ) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Ülevaade', key: 'OVERVIEW' },
      { label: 'Profiil', key: 'PROFILE' },
      { label: 'Küsimused', key: 'QUESTIONS' },
      { label: 'Analüüs', key: 'ANALYSIS' },
      { label: 'Tegevuskava', key: 'ROADMAP' }
    ]);

    this.navContext.commands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => this.applyNavCommand(key as FutureproofNavKey));

    const queryStep = (this.route.snapshot.queryParamMap.get('step') || '').toUpperCase();
    if (['OVERVIEW', 'PROFILE', 'QUESTIONS', 'ANALYSIS', 'ROADMAP'].includes(queryStep)) {
      this.applyNavCommand(queryStep as FutureproofNavKey, true);
    }

    this.loadRoleMatches();
    this.loadFutureScore();
    this.loadVisibility();
  }

  ngOnDestroy(): void {
    this.navContext.resetNav();
    this.timers.forEach((timerId) => clearTimeout(timerId));
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasAnyData(): boolean {
    return !!(this.roleMatches.length || this.futureScore || this.visibility);
  }

  setInsightView(view: InsightView): void {
    this.insightView = view;
  }

  goToQuestions(): void {
    this.router.navigateByUrl('/futureproof/questions');
  }

  goToAssessment(): void {
    this.router.navigateByUrl('/futureproof/assessment');
  }

  goToRoadmap(): void {
    this.router.navigateByUrl('/futureproof/roadmap');
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
    this.queueTimer(() => {
      this.snapshotBusy = false;
      this.lastSnapshotMessage = 'Tulevikukindluse ülevaade värskendatud. Sobivused uuendatud.';
      this.currentStep = 3;
      this.activeNav = 'ANALYSIS';
      this.navContext.setActiveKey(this.activeNav);
      this.insightView = 'overview';
      this.loadRoleMatches();
    }, 600);
  }

  onTrackProgress(): void {
    this.planSelectionMessage = 'Valmisoleku jälgimine avaneb peagi.';
    this.router.navigateByUrl('/futureproof');
  }

  onGeneratePlan(match: PivotRoleMatch): void {
    this.planSelectionMessage = `Lõime starditegevuskava positsioonile ${match.targetRole}.`;
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

    this.queueTimer(() => {
      this.visibility = {
        mode: this.visibilityDraftMode,
        visibilityThreshold: this.visibilityDraftThreshold
      };
      this.savingVisibility = false;
      this.visibilitySavedMessage = 'Nähtavuse eelistused salvestatud sinu tulevikukindla profiili jaoks.';
    }, 500);
  }

  goToDashboard(): void {
    this.router.navigateByUrl('/futureproof/overview');
  }

  private applyNavCommand(key: FutureproofNavKey, fromQuery: boolean = false): void {
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

  private stepToNav(step: FlowStep): FutureproofNavKey {
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

  private loadRoleMatches(): void {
    this.loadingRoles = true;
    this.rolesError = null;
    this.queueTimer(() => {
      this.roleMatches = [
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
      this.loadingRoles = false;
    }, 420);
  }

  private loadFutureScore(): void {
    this.loadingScore = true;
    this.scoreError = null;
    this.queueTimer(() => {
      this.futureScore = {
        overall: 82,
        adaptability: 79,
        automationResilience: 76,
        learningVelocity: 86,
        explanation:
          'Score blends your interview signals, CV overlap, and recent upskilling activity.'
      };
      this.loadingScore = false;
    }, 360);
  }

  private loadVisibility(): void {
    this.loadingVisibility = true;
    this.visibilityError = null;
    this.queueTimer(() => {
      this.visibility = {
        mode: 'ANON',
        visibilityThreshold: 72
      };
      this.visibilityDraftMode = this.visibility.mode;
      this.visibilityDraftThreshold = this.visibility.visibilityThreshold;
      this.loadingVisibility = false;
    }, 320);
  }

  private queueTimer(callback: () => void, delayMs: number): void {
    const timerId = setTimeout(callback, delayMs);
    this.timers.push(timerId);
  }
}

