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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, CareerriskStepperComponent, UiModeToggleComponent, TranslateModule],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <header class="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <!-- Mobile hamburger -->
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="md:hidden text-stone-500 hover:text-stone-900">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <a routerLink="/careerrisk" class="flex items-center gap-2">
              <div class="w-7 h-7 bg-stone-900 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="font-black text-stone-900 text-sm tracking-tight">CareerRisk</span>
              <span class="text-red-600 text-sm font-black">Index</span>
            </a>
          </div>

          <!-- Quick Tools Links -->
          <div class="hidden md:flex items-center gap-1 text-sm">
            <a routerLink="/session/new" class="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap">
              New Session
            </a>
            <a routerLink="/start" class="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap">
              Assess Skills
            </a>
            <a routerLink="/pricing" class="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors whitespace-nowrap">
              Pricing
            </a>
            <!-- Arena -->
            <div class="relative group">
              <button class="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 whitespace-nowrap">
                Arena
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div class="absolute top-full right-0 mt-1 bg-white border border-stone-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[200px]">
                <a routerLink="/tools/job-analyzer" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Job X-Ray</a>
                <a routerLink="/arena/interview-simulator" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Interview Simulator</a>
                <a routerLink="/arena/salary-coach" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Salary Coach</a>
                <a routerLink="/arena/cv-optimizer" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">CV Optimizer</a>
                <a routerLink="/arena/career-mentor" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Career Mentor</a>
                <a routerLink="/arena/company-prep" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Company Prep</a>
                <a routerLink="/arena/linkedin-generator" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">LinkedIn Generator</a>
                <a routerLink="/arena/cover-letter" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Cover Letter</a>
                <a routerLink="/arena/salary-benchmark" class="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900">Salary Benchmark</a>
              </div>
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Tier Badge -->
            <span *ngIf="auth.isAuthenticated() && tierService.isPro()"
              class="px-2.5 py-1 text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              Pro
            </span>
            <span *ngIf="auth.isAuthenticated() && !tierService.isPro() && tierService.isStarter()"
              class="px-2.5 py-1 text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
              Starter
            </span>

            <!-- Language Switcher -->
            <button
              (click)="toggleLanguage()"
              class="px-2 py-1 text-xs font-bold border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors"
              [title]="currentLang === 'en' ? 'Switch to Estonian' : 'Switch to English'">
              {{ currentLang === 'en' ? 'ET' : 'EN' }}
            </button>

            <!-- UI Mode Toggle (top-right) -->
            <app-ui-mode-toggle />

            <!-- Separator -->
            <div class="h-4 w-px bg-stone-200 mx-1"></div>

            <nav class="flex items-center gap-1 text-sm overflow-x-auto" *ngIf="navState$ | async as nav">
              <ng-container [ngSwitch]="nav.mode">
                <ng-container *ngSwitchCase="'careerrisk'">
                  <ng-container *ngIf="!isOnboarding; else onboardingNavPlaceholder">
                    <button
                      *ngFor="let item of nav.items"
                      type="button"
                      class="px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors"
                      [ngClass]="{
                        'bg-stone-900 text-white': activeCareerRiskKey === item.key,
                        'text-stone-500 hover:text-stone-900': activeCareerRiskKey !== item.key
                      }"
                      (click)="onCareerRiskNav(item.key)"
                    >
                      {{ item.label }}
                    </button>
                  </ng-container>
                  <ng-template #onboardingNavPlaceholder>
                    <a routerLink="/careerrisk/overview" class="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer">
                      Onboarding
                    </a>
                  </ng-template>
                  <button type="button" (click)="logout()"
                    class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    Logout
                  </button>
                </ng-container>
                <ng-container *ngSwitchDefault>
                  <a
                    routerLink="/careerrisk"
                    routerLinkActive="text-stone-900 font-bold"
                    class="text-stone-500 hover:text-stone-900"
                    >Dashboard</a
                  >
                  <button type="button" (click)="logout()"
                    class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">
                    Logout
                  </button>
                </ng-container>
              </ng-container>
            </nav>
          </div>
        </div>
      </header>

      <!-- Mobile menu -->
      <div *ngIf="mobileMenuOpen" class="md:hidden border-b border-stone-200 bg-white px-4 py-4 space-y-2">
        <a routerLink="/session/new" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">New Session</a>
        <a routerLink="/start" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Assess Skills</a>
        <a routerLink="/tools/job-analyzer" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Job X-Ray</a>
        <a routerLink="/pricing" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Pricing</a>
        <a *ngIf="auth.isAuthenticated()" routerLink="/history" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">History</a>
        <div class="pt-2 border-t border-stone-200">
          <span class="text-xs text-stone-400 uppercase tracking-wider">Arena</span>
          <a routerLink="/arena/interview-simulator" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Interview Simulator</a>
          <a routerLink="/arena/salary-coach" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Salary Coach</a>
          <a routerLink="/arena/cv-optimizer" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">CV Optimizer</a>
          <a routerLink="/arena/career-mentor" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Career Mentor</a>
          <a routerLink="/arena/company-prep" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Company Prep</a>
          <a routerLink="/arena/linkedin-generator" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">LinkedIn Generator</a>
          <a routerLink="/arena/cover-letter" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Cover Letter</a>
          <a routerLink="/arena/salary-benchmark" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Salary Benchmark</a>
        </div>
      </div>

      <main class="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
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
  mobileMenuOpen = false;
  currentLang = 'en';
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
    authService: AuthService,
    private translateService: TranslateService
  ) {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && ['en', 'et'].includes(savedLang)) {
      this.currentLang = savedLang;
      this.translateService.use(savedLang);
    }
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

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'et' : 'en';
    this.translateService.use(this.currentLang);
    localStorage.setItem('lang', this.currentLang);
  }

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
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
