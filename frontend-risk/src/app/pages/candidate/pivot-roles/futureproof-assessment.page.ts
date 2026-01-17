import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { RiskApiService } from '../../../core/services/risk-api.service';
import { AuthService } from '../../../core/auth/auth-api.service';
import { AssessmentResult, RiskLevel } from '../../../core/models/risk.models';
import { Subject, takeUntil } from 'rxjs';
import { DisruptionTimelineComponent, DisruptionPoint } from './disruption-timeline.component';

@Component({
  selector: 'app-futureproof-assessment-page',
  standalone: true,
  imports: [CommonModule, DisruptionTimelineComponent, RouterLink],
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

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private navContext: NavContextService,
    private riskApi: RiskApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Ülevaade', key: 'OVERVIEW' },
      { label: 'Profiil', key: 'PROFILE' },
      { label: 'Küsimused', key: 'QUESTIONS' },
      { label: 'Analüüs', key: 'ANALYSIS' },
      { label: 'Tegevuskava', key: 'ROADMAP' }
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
    // Save session to localStorage so it persists after registration
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
    // fallback mock to avoid empty UI
    return [
      { year: new Date().getFullYear(), automationRisk: 22, insight: 'AI assistendid toetavad, kuid ei asenda.' },
      { year: new Date().getFullYear() + 2, automationRisk: 38, insight: 'Automatiseeritakse korduvad ülesanded; kriitiline jääb sinule.' },
      { year: new Date().getFullYear() + 5, automationRisk: 57, insight: 'Roll nõuab orkestreerimist ja süsteemset mõtlemist.' }
    ];
  }

  get currentRole(): string {
    return (this.assessment as any)?.currentRole || 'Sinu roll';
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
      // fallback: start a minimal assessment to fetch data
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
            this.error = err?.error?.message || 'Analüüsi ei õnnestu käivitada. Proovi uuesti.';
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
          this.error = err?.error?.message || 'Analüüsi laadimine ebaõnnestus. Proovi uuesti.';
        }
      });
  }
}

