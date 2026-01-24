import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';
import { NavContextService, NavState } from '../core/services/nav-context.service';
import { Observable, Subject, filter, takeUntil } from 'rxjs';
import { FutureproofStepperComponent } from './futureproof-stepper.component';
import { UiModeToggleComponent } from '../shared/ui-mode-toggle/ui-mode-toggle.component';
import { UiModeService } from '../core/services/ui-mode.service';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FutureproofStepperComponent, UiModeToggleComponent],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div class="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-2">
          <a routerLink="/futureproof" class="font-extrabold tracking-tight text-slate-50 text-lg shrink-0">
            Tulevikukindlus
          </a>

          <!-- Quick Tools Links - hidden on smaller screens and in futureproof view -->
          <div class="hidden xl:flex items-center gap-3 text-sm" *ngIf="!isFutureproofRoute">
            <a routerLink="/start" class="text-slate-400 hover:text-emerald-400 transition-colors whitespace-nowrap">
              📝 Hinda oskusi
            </a>
            <a routerLink="/tools/job-analyzer" class="text-slate-400 hover:text-emerald-400 transition-colors whitespace-nowrap">
              🔬 Job X-Ray
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
          <div class="flex items-center gap-2">
            <!-- UI Mode Toggle (top-right) -->
            <app-ui-mode-toggle class="hidden sm:block" />

            <!-- Separator -->
            <div class="hidden sm:block h-5 w-px bg-slate-700"></div>

            <nav class="flex flex-wrap items-center gap-1 sm:gap-2 text-sm" *ngIf="navState$ | async as nav">
              <ng-container [ngSwitch]="nav.mode">
                <ng-container *ngSwitchCase="'futureproof'">
                  <ng-container *ngIf="!isOnboarding; else onboardingNavPlaceholder">
                    <button
                      *ngFor="let item of nav.items"
                      type="button"
                      class="rounded-md border border-slate-700 px-2 py-1 text-xs sm:text-sm font-semibold whitespace-nowrap"
                      [ngClass]="{
                        'bg-emerald-500 text-slate-900': activeFutureproofKey === item.key,
                        'text-slate-300 hover:text-slate-50 bg-slate-900': activeFutureproofKey !== item.key
                      }"
                      (click)="onFutureproofNav(item.key)"
                    >
                      {{ item.label }}
                    </button>
                  </ng-container>
                  <ng-template #onboardingNavPlaceholder>
                    <span class="text-xs text-slate-500">Onboarding</span>
                  </ng-template>
                  <button type="button" (click)="logout()"
                    class="rounded-md border border-slate-700 px-2 py-1 text-xs sm:text-sm text-slate-200 hover:border-emerald-400 whitespace-nowrap">
                    Logout
                  </button>
                </ng-container>
                <ng-container *ngSwitchDefault>
                  <a
                    routerLink="/futureproof"
                    routerLinkActive="text-emerald-300"
                    class="text-slate-300 hover:text-slate-50"
                    >Futureproof</a
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
        <app-futureproof-stepper *ngIf="isFutureproofRoute && isOnboarding"></app-futureproof-stepper>
        <router-outlet />
      </main>
    </div>
  `
})
export class AppShellComponent implements OnDestroy {
  navState$: Observable<NavState>;
  activeFutureproofKey: string | null = null;
  isFutureproofRoute = false;
  isOnboarding = true;
  private destroy$ = new Subject<void>();

  /** Expose UI mode service for template conditional rendering */
  readonly uiMode: UiModeService;

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private navContext: NavContextService,
    uiModeService: UiModeService
  ) {
    this.uiMode = uiModeService;
    this.navState$ = this.navContext.state$;
    this.navContext.activeKey$
      .pipe(takeUntil(this.destroy$))
      .subscribe((key) => {
        this.activeFutureproofKey = key;
      });

    this.isFutureproofRoute = this.router.url.startsWith('/futureproof');
    this.updateCompletionState();
    this.syncActiveFromUrl(this.router.url);
    this.router.events
      .pipe(
        takeUntil(this.destroy$),
        filter((event: any) => event?.urlAfterRedirects !== undefined)
      )
      .subscribe((event: any) => {
        this.isFutureproofRoute = (event.urlAfterRedirects as string).startsWith('/futureproof');
        this.updateCompletionState();
        this.syncActiveFromUrl(event.urlAfterRedirects as string);
      });
  }

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/login');
  }

  onFutureproofNav(key: string): void {
    const path = this.pathForKey(key);
    this.navContext.setActiveKey(key);
    this.router.navigateByUrl(path);
  }

  private updateCompletionState(): void {
    const completedFlag = localStorage.getItem('futureproofCompleted') === 'true';
    this.isOnboarding = this.isFutureproofRoute && !completedFlag;
  }

  private pathForKey(key: string): string {
    switch (key) {
      case 'OVERVIEW':
      case 'PROFILE':
        return '/futureproof/overview';
      case 'QUESTIONS':
        return '/futureproof/questions';
      case 'ANALYSIS':
        return '/futureproof/assessment';
      case 'ROADMAP':
        return '/futureproof/roadmap';
      default:
        return '/futureproof/overview';
    }
  }

  private syncActiveFromUrl(url: string): void {
    if (!url.startsWith('/futureproof')) {
      return;
    }
    if (url.startsWith('/futureproof/assessment')) {
      this.navContext.setActiveKey('ANALYSIS');
      return;
    }
    if (url.startsWith('/futureproof/questions')) {
      this.navContext.setActiveKey('QUESTIONS');
      return;
    }
    if (url.startsWith('/futureproof/roadmap')) {
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
