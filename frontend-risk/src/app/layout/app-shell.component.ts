import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { NavContextService, NavState } from '../core/services/nav-context.service';
import { Observable, Subject, filter, takeUntil } from 'rxjs';
import { CareerriskStepperComponent } from './careerrisk-stepper.component';
import { UiModeToggleComponent } from '../shared/ui-mode-toggle/ui-mode-toggle.component';
import { UiModeService } from '../core/services/ui-mode.service';
import { TierService } from '../core/services/tier.service';
import { AuthService } from '../core/auth/auth-api.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, CareerriskStepperComponent, UiModeToggleComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <a routerLink="/careerrisk" class="font-extrabold tracking-tight text-slate-50 text-lg">
            CareerRisk
          </a>

          <!-- Quick Tools Links -->
          <div class="flex items-center gap-4 text-sm">
            <a routerLink="/start" class="text-slate-400 hover:text-emerald-400 transition-colors">
              📝 Assess Skills
            </a>
            <a routerLink="/tools/job-analyzer" class="text-slate-400 hover:text-emerald-400 transition-colors">
              🔬 Job X-Ray
            </a>
            <a routerLink="/pricing" class="text-slate-400 hover:text-emerald-400 transition-colors">
              Pricing
            </a>
            <div class="relative group">
              <button class="text-slate-400 hover:text-purple-400 transition-colors flex items-center gap-1">
                🏟️ Arena
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[200px]">
                <a routerLink="/arena/interview" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-purple-400 rounded-t-lg">
                  🎭 Interview Room
                </a>
                <a routerLink="/arena/negotiation" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-purple-400">
                  💰 Salary Dojo
                </a>
                <a routerLink="/arena/truth" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-purple-400">
                  🪞 Brutal Truth
                </a>
                <a routerLink="/arena/stress-test" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-purple-400 rounded-b-lg">
                  🔬 Stress Test
                </a>
              </div>
            </div>
          </div>

          <!-- Right side: UI Mode Toggle + Navigation -->
          <div class="flex items-center gap-4">
            <!-- Tier Badge -->
            <span *ngIf="auth.isAuthenticated() && !tierService.isFree()"
              class="px-2.5 py-1 rounded-full text-xs font-bold"
              [ngClass]="{
                'bg-emerald-500/20 text-emerald-300': tierService.tier() === 'ESSENTIALS',
                'bg-violet-500/20 text-violet-300': tierService.tier() === 'PROFESSIONAL',
                'bg-amber-500/20 text-amber-300': tierService.tier() === 'LIFETIME'
              }">
              {{ tierService.tier() }}
            </span>

            <!-- UI Mode Toggle (top-right) -->
            <app-ui-mode-toggle />

            <!-- Separator -->
            <div class="h-5 w-px bg-slate-700"></div>

            <nav class="flex flex-wrap items-center gap-3 text-sm" *ngIf="navState$ | async as nav">
              <ng-container [ngSwitch]="nav.mode">
                <ng-container *ngSwitchCase="'careerrisk'">
                  <ng-container *ngIf="!isOnboarding; else onboardingNavPlaceholder">
                    <button
                      *ngFor="let item of nav.items"
                      type="button"
                      class="rounded-lg border border-slate-700 px-3 py-1 text-sm font-semibold"
                      [ngClass]="{
                        'bg-emerald-500 text-slate-900': activeCareerRiskKey === item.key,
                        'text-slate-300 hover:text-slate-50 bg-slate-900': activeCareerRiskKey !== item.key
                      }"
                      (click)="onCareerRiskNav(item.key)"
                    >
                      {{ item.label }}
                    </button>
                  </ng-container>
                  <ng-template #onboardingNavPlaceholder>
                    <span class="text-xs text-slate-500">Onboarding</span>
                  </ng-template>
                  <button type="button" (click)="logout()"
                    class="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-emerald-400">
                    Logout
                  </button>
                </ng-container>
                <ng-container *ngSwitchDefault>
                  <a
                    routerLink="/careerrisk"
                    routerLinkActive="text-emerald-300"
                    class="text-slate-300 hover:text-slate-50"
                    >CareerRisk</a
                  >
                  <button type="button" (click)="logout()"
                    class="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-emerald-400">
                    Logout
                  </button>
                </ng-container>
              </ng-container>
            </nav>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-8">
        <app-careerrisk-stepper *ngIf="isCareerRiskRoute && isOnboarding"></app-careerrisk-stepper>
        <router-outlet />
      </main>
    </div>
  `
})
export class AppShellComponent implements OnDestroy {
  navState$: Observable<NavState>;
  activeCareerRiskKey: string | null = null;
  isCareerRiskRoute = false;
  isOnboarding = true;
  private destroy$ = new Subject<void>();

  /** Expose UI mode service for template conditional rendering */
  readonly uiMode: UiModeService;
  readonly tierService: TierService;
  readonly auth: AuthService;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private navContext: NavContextService,
    uiModeService: UiModeService,
    tierService: TierService,
    authService: AuthService
  ) {
    this.uiMode = uiModeService;
    this.tierService = tierService;
    this.auth = authService;
    this.navState$ = this.navContext.state$;
    this.navContext.activeKey$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => {
        this.activeCareerRiskKey = key;
      });

    this.isCareerRiskRoute = this.router.url.startsWith('/careerrisk');
    this.updateCompletionState();
    this.syncActiveFromUrl(this.router.url);
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event: any) => event?.urlAfterRedirects !== undefined)
      )
      .subscribe((event: any) => {
        this.isCareerRiskRoute = (event.urlAfterRedirects as string).startsWith('/careerrisk');
        this.updateCompletionState();
        this.syncActiveFromUrl(event.urlAfterRedirects as string);
      });
  }

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/login');
  }

  onCareerRiskNav(key: string): void {
    const path = this.pathForKey(key);
    this.navContext.setActiveKey(key);
    this.router.navigateByUrl(path);
  }

  private updateCompletionState(): void {
    const completedFlag = localStorage.getItem('careerriskCompleted') === 'true';
    this.isOnboarding = this.isCareerRiskRoute && !completedFlag;
  }

  private pathForKey(key: string): string {
    switch (key) {
      case 'OVERVIEW':
      case 'PROFILE':
        return '/careerrisk/overview';
      case 'QUESTIONS':
        return '/careerrisk/questions';
      case 'ANALYSIS':
        return '/careerrisk/assessment';
      case 'ROADMAP':
        return '/careerrisk/roadmap';
      default:
        return '/careerrisk/overview';
    }
  }

  private syncActiveFromUrl(url: string): void {
    if (!url.startsWith('/careerrisk')) {
      return;
    }
    if (url.startsWith('/careerrisk/assessment')) {
      this.navContext.setActiveKey('ANALYSIS');
      return;
    }
    if (url.startsWith('/careerrisk/questions')) {
      this.navContext.setActiveKey('QUESTIONS');
      return;
    }
    if (url.startsWith('/careerrisk/roadmap')) {
      this.navContext.setActiveKey('ROADMAP');
      return;
    }
    this.navContext.setActiveKey('OVERVIEW');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
