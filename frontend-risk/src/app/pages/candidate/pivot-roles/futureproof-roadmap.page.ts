import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { RiskApiService } from '../../../core/services/risk-api.service';
import { RoadmapDuration, RoadmapItem, RoadmapResponse } from '../../../core/models/risk.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-futureproof-roadmap-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './futureproof-roadmap.page.html',
  styleUrls: ['./futureproof-roadmap.page.scss']
})
export class FutureproofRoadmapPageComponent implements OnInit, OnDestroy {
  durations: RoadmapDuration[] = [
    RoadmapDuration.SEVEN_DAYS,
    RoadmapDuration.THIRTY_DAYS,
    RoadmapDuration.NINETY_DAYS
  ];
  duration = RoadmapDuration.SEVEN_DAYS;
  roadmap: RoadmapResponse | null = null;
  loading = false;
  generating = false;
  error: string | null = null;
  sessionId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private navContext: NavContextService,
    private riskApi: RiskApiService
  ) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Ülevaade', key: 'OVERVIEW' },
      { label: 'Profiil', key: 'PROFILE' },
      { label: 'Küsimused', key: 'QUESTIONS' },
      { label: 'Analüüs', key: 'ANALYSIS' },
      { label: 'Tegevuskava', key: 'ROADMAP' }
    ]);
    this.navContext.setActiveKey('ROADMAP');
    this.navContext.commands$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => {
        if (key === 'ROADMAP') {
          return;
        }
        this.router.navigateByUrl(`/futureproof?step=${key}`);
      });

    this.sessionId = sessionStorage.getItem('fp_session');
    if (!this.sessionId) {
      this.redirectToStart();
      return;
    }
    this.loadRoadmap();
  }

  ngOnDestroy(): void {
    this.navContext.resetNav();
    this.destroy$.next();
    this.destroy$.complete();
  }

  isPlanDuration(duration: RoadmapDuration): boolean {
    return this.duration === duration;
  }

  selectPlanDuration(duration: RoadmapDuration): void {
    if (this.duration === duration) {
      return;
    }
    this.duration = duration;
    this.loadRoadmap();
  }

  backToOverview(): void {
    this.router.navigateByUrl('/futureproof');
  }

  backToAssessment(): void {
    if (this.sessionId) {
      this.router.navigate(['/futureproof/assessment'], { queryParams: { sessionId: this.sessionId } });
    }
  }

  get items(): RoadmapItem[] {
    return this.roadmap?.items ?? [];
  }

  get summary(): string {
    return this.roadmap?.summary ?? '';
  }

  loadRoadmap(): void {
    this.loading = true;
    this.generating = true;
    this.error = null;

    const sid = this.sessionId;
    if (!sid) {
      this.loading = false;
      this.error = 'Seanssi ei leitud. Alusta profiili täitmisest, et jõuda tegevuskavani.';
      this.redirectToStart();
      return;
    }

    this.riskApi
      .generateRoadmap({
        sessionId: sid,
        duration: this.duration
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.roadmap = res;
          this.loading = false;
          this.generating = false;
          try {
            localStorage.setItem('futureproofCompleted', 'true');
          } catch {
            // ignore storage errors
          }
        },
        error: (err) => {
          this.loading = false;
          this.generating = false;
          this.error = err?.error?.message || 'Tegevuskava laadimine ebaõnnestus. Proovi uuesti.';
        }
      });
  }

  private redirectToStart(): void {
    this.router.navigateByUrl('/futureproof/overview');
  }
}

