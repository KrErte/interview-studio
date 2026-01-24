import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { RiskApiService } from '../../../core/services/risk-api.service';
import { AuthService } from '../../../core/auth/auth-api.service';
import { UserTierService } from '../../../core/services/user-tier.service';
import {
  AssessmentResult,
  RiskLevel,
  ThreatVector,
  SkillCell,
  VitalSign,
  AIMilestone,
  Scenario,
  SkillDecay,
  MarketSignal,
  MarketMetric,
  DisruptedRole
} from '../../../core/models/risk.models';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { DisruptionTimelineComponent, DisruptionPoint } from './disruption-timeline.component';
import { ThreatRadarComponent } from './threat-radar.component';
import { SkillVulnerabilityMatrixComponent } from './skill-vulnerability-matrix.component';
import { CareerVitalsComponent } from './career-vitals.component';
import { AIEncroachmentTimelineComponent } from './ai-encroachment-timeline.component';
import { ScenarioSimulatorComponent } from './scenario-simulator.component';
import { SkillDecayClockComponent } from './skill-decay-clock.component';
import { MarketPulseComponent } from './market-pulse.component';
import { DisruptionAutopsyComponent } from './disruption-autopsy.component';
import { ActionRecommendationsComponent } from './action-recommendations.component';
import { EmailCaptureModalComponent } from '../../../shared/email-capture-modal/email-capture-modal.component';
import { PaywallModalComponent } from '../../../shared/paywall-modal/paywall-modal.component';

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
    DisruptionAutopsyComponent,
    ActionRecommendationsComponent,
    EmailCaptureModalComponent,
    PaywallModalComponent
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
  activeTab: 'overview' | 'threats' | 'skills' | 'vitals' | 'timeline' | 'simulator' | 'decay' | 'pulse' | 'autopsy' | 'actions' = 'overview';

  // Paywall state
  showEmailCapture = false;
  showPaywall = false;
  paywallFeatureName = '';

  // Locked tabs for free users
  readonly lockedTabs = ['actions', 'simulator', 'pulse', 'decay', 'threats', 'skills', 'vitals', 'timeline', 'autopsy'];

  private destroy$ = new Subject<void>();

  // Data loaded from backend API
  threatVectors: ThreatVector[] = [];
  skillCells: SkillCell[] = [];
  vitalSigns: VitalSign[] = [];
  aiMilestones: AIMilestone[] = [];
  scenarios: Scenario[] = [];
  skillDecay: SkillDecay[] = [];
  marketSignals: MarketSignal[] = [];
  marketMetrics: MarketMetric[] = [];
  disruptedRoles: DisruptedRole[] = [];
  analysisLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navContext: NavContextService,
    private riskApi: RiskApiService,
    private auth: AuthService,
    public userTier: UserTierService
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

  getPercentileSaferThan(): number {
    // Calculate what % of people have higher risk than you
    // This is a simplified model - real implementation would use backend data
    const risk = this.assessment?.riskPercent ?? 50;
    // Assume normal distribution centered around 45% risk for developers
    // Lower your risk = higher percentile of people with more risk
    const percentile = Math.max(5, Math.min(95, 100 - risk + Math.floor(Math.random() * 10)));
    return percentile;
  }

  setActiveTab(tab: string): void {
    // Check if tab is locked for free users
    if (this.lockedTabs.includes(tab) && !this.userTier.isPro()) {
      this.paywallFeatureName = this.getTabDisplayName(tab);
      this.showPaywall = true;
      return;
    }
    this.activeTab = tab as 'overview' | 'threats' | 'skills' | 'vitals' | 'timeline' | 'simulator' | 'decay' | 'pulse' | 'autopsy' | 'actions';
  }

  isTabLocked(tabId: string): boolean {
    return this.lockedTabs.includes(tabId) && !this.userTier.isPro();
  }

  private getTabDisplayName(tabId: string): string {
    const names: Record<string, string> = {
      'actions': 'Tegevusplaan',
      'simulator': 'What-If Simulator',
      'pulse': 'Market Pulse',
      'decay': 'Skill Decay',
      'threats': 'Threat Radar',
      'skills': 'Skill Matrix',
      'vitals': 'Career Vitals',
      'timeline': 'AI Timeline',
      'autopsy': 'Case Studies'
    };
    return names[tabId] || tabId;
  }

  onEmailSubmitted(email: string): void {
    this.showEmailCapture = false;
    // Could trigger a toast notification here
    console.log('Email captured:', email);
  }

  onEmailSkipped(): void {
    this.showEmailCapture = false;
  }

  onPaywallUpgrade(): void {
    this.showPaywall = false;
    // Refresh to show unlocked content
  }

  onPaywallClosed(): void {
    this.showPaywall = false;
  }

  tryDownloadPDF(): void {
    if (!this.userTier.isPro()) {
      this.paywallFeatureName = 'PDF eksport';
      this.showPaywall = true;
      return;
    }
    this.downloadPDF();
  }

  tryGoToRoadmap(): void {
    if (!this.userTier.isPro()) {
      this.paywallFeatureName = '12 kuu tegevusplaan';
      this.showPaywall = true;
      return;
    }
    this.goToRoadmap();
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

  shareResults(): void {
    const shareData = {
      title: 'Minu Career Disruption Index',
      text: `Minu karjääri automatiseerimise risk on ${this.assessment?.riskPercent}%. Kontrolli oma riski: `,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  private copyToClipboard(): void {
    const text = `Minu Career Disruption Index: ${this.assessment?.riskPercent}% risk. Kontrolli oma: ${window.location.origin}/start`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Link kopeeritud!');
    });
  }

  downloadPDF(): void {
    // Generate simple text report (real PDF would need library like jsPDF)
    const report = this.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-disruption-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateReport(): string {
    const lines = [
      '═══════════════════════════════════════════════════',
      '           CAREER DISRUPTION INDEX REPORT          ',
      '═══════════════════════════════════════════════════',
      '',
      `Genereeritud: ${new Date().toLocaleDateString('et-EE')}`,
      `Roll: ${this.currentRole}`,
      '',
      '───────────────────────────────────────────────────',
      '                   KOKKUVÕTE                       ',
      '───────────────────────────────────────────────────',
      '',
      `Disruption Risk:     ${this.assessment?.riskPercent}%`,
      `Risk Level:          ${this.riskBandLabel}`,
      `Confidence:          ${this.confidencePercent}%`,
      `Time to Adapt:       18 kuud`,
      '',
      '───────────────────────────────────────────────────',
      '                   TIMELINE                        ',
      '───────────────────────────────────────────────────',
      ''
    ];

    this.timelinePoints.forEach(point => {
      lines.push(`${point.year}: ${point.automationRisk}% risk`);
      lines.push(`         ${point.insight}`);
      lines.push('');
    });

    if (this.topPivotRoles.length > 0) {
      lines.push('───────────────────────────────────────────────────');
      lines.push('              SOOVITATUD ROLLID                    ');
      lines.push('───────────────────────────────────────────────────');
      lines.push('');
      this.topPivotRoles.forEach((role, i) => {
        lines.push(`${i + 1}. ${role}`);
      });
      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════════');
    lines.push('          Powered by Tulevikukindlus                ');
    lines.push('═══════════════════════════════════════════════════');

    return lines.join('\n');
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
          this.loadRiskAnalysis(sessionId);

          // Show email capture modal after assessment loads (if no email yet)
          const hasEmail = this.userTier.hasEmail();
          console.log('Email capture check:', { hasEmail, assessmentCount: this.userTier.assessmentCount() });
          if (!hasEmail) {
            setTimeout(() => {
              console.log('Showing email capture modal');
              this.showEmailCapture = true;
            }, 1500);
          }

          // Increment assessment count for free tier limit
          this.userTier.incrementAssessmentCount();
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Failed to load analysis. Please try again.';
        }
      });
  }

  private loadRiskAnalysis(sessionId: string): void {
    this.analysisLoading = true;
    const role = this.currentRole;

    this.riskApi
      .getRiskAnalysis(sessionId, role)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.threatVectors = data.threatVectors || [];
          this.skillCells = data.skillMatrix || [];
          this.vitalSigns = data.vitalSigns || [];
          this.aiMilestones = data.aiMilestones || [];
          this.scenarios = data.scenarios || [];
          this.skillDecay = data.skillDecay || [];
          this.marketSignals = data.marketSignals || [];
          this.marketMetrics = data.marketMetrics || [];
          this.disruptedRoles = data.disruptedRoles || [];
          this.analysisLoading = false;
        },
        error: () => {
          // If API fails, keep empty arrays (or could use fallback mock data)
          this.analysisLoading = false;
        }
      });
  }
}
