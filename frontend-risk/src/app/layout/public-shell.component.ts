import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiModeToggleComponent } from '../shared/ui-mode-toggle/ui-mode-toggle.component';
import { CookieConsentComponent } from '../shared/cookie-consent/cookie-consent.component';
import { BackToTopComponent } from '../shared/back-to-top/back-to-top.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/auth/auth-api.service';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, UiModeToggleComponent, TranslateModule, CookieConsentComponent, BackToTopComponent],
  template: `
    <div class="min-h-screen bg-stone-50 text-stone-900 flex flex-col">

      <!-- Header — editorial, clean -->
      <header class="border-b border-stone-200 bg-white sticky top-0 z-50">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 group">
            <div class="w-7 h-7 bg-stone-900 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span class="font-black text-stone-900 text-sm tracking-tight">CareerRisk</span>
              <span class="text-red-600 text-sm font-black"> Index</span>
            </div>
          </a>

          <!-- Nav -->
          <div class="flex items-center gap-1">
            <button
              (click)="toggleLanguage()"
              class="px-2 py-1 text-xs font-bold border border-stone-300 text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors"
              [title]="currentLang === 'en' ? 'Switch to Estonian' : 'Switch to English'">
              {{ currentLang === 'en' ? 'ET' : 'EN' }}
            </button>

            <div class="h-4 w-px bg-stone-200 mx-2 hidden md:block"></div>

            <!-- Desktop nav -->
            <nav class="hidden md:flex items-center gap-1">
              <a routerLink="/" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="text-stone-900 font-semibold"
                class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'nav.home' | translate }}</a>

              <a routerLink="/pricing" routerLinkActive="text-stone-900 font-semibold"
                class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'nav.pricing' | translate }}</a>

              <!-- Arena Dropdown -->
              <div class="relative group">
                <button class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1">
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

              <div class="h-4 w-px bg-stone-200 mx-1"></div>

              @if (!auth.isAuthenticated()) {
                <a routerLink="/login" class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'nav.signIn' | translate }}</a>
                <a routerLink="/register" class="ml-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors">{{ 'nav.getStarted' | translate }}</a>
              } @else {
                <a routerLink="/careerrisk" class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">Dashboard</a>
                <button (click)="logout()" class="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'auth.logout' | translate }}</button>
              }
            </nav>

            <!-- Mobile hamburger -->
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="md:hidden ml-2 text-stone-500 hover:text-stone-900">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (!mobileMenuOpen) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Mobile menu -->
      @if (mobileMenuOpen) {
        <div class="md:hidden border-b border-stone-200 bg-white px-4 py-4 space-y-2">
          <a routerLink="/" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Home</a>
          <a routerLink="/pricing" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Pricing</a>
          <a routerLink="/session/new" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">New Session</a>
          <a routerLink="/start" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Assess Skills</a>
          <div class="pt-2 border-t border-stone-200">
            <span class="text-xs text-stone-400 uppercase tracking-wider">Arena</span>
            <a routerLink="/arena/interview-simulator" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Interview Simulator</a>
            <a routerLink="/arena/salary-coach" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Salary Coach</a>
            <a routerLink="/arena/cv-optimizer" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">CV Optimizer</a>
            <a routerLink="/arena/career-mentor" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Career Mentor</a>
          </div>
          <div class="pt-2 border-t border-stone-200">
            @if (!auth.isAuthenticated()) {
              <a routerLink="/login" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Sign in</a>
              <a routerLink="/register" (click)="mobileMenuOpen = false" class="block py-2 text-sm font-bold text-red-600">Get Started</a>
            } @else {
              <a routerLink="/careerrisk" (click)="mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Dashboard</a>
              <button (click)="logout(); mobileMenuOpen = false" class="block py-2 text-sm text-stone-600 hover:text-stone-900">Sign out</button>
            }
          </div>
        </div>
      }

      <!-- Main content -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- Footer — editorial -->
      <footer class="border-t border-stone-200 bg-white">
        <div class="mx-auto max-w-6xl px-4 py-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div class="col-span-2 md:col-span-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-6 h-6 bg-stone-900 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span class="font-black text-stone-900 text-sm">CareerRisk <span class="text-red-600">Index</span></span>
              </div>
              <p class="text-xs text-stone-400 leading-relaxed">Career risk assessment for the AI era.</p>
            </div>

            <div>
              <h4 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">{{ 'footer.product' | translate }}</h4>
              <div class="space-y-2">
                <a routerLink="/session/new" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.assessment' | translate }}</a>
                <a routerLink="/pricing" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'nav.pricing' | translate }}</a>
                <a routerLink="/start" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.skillCheck' | translate }}</a>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">{{ 'footer.company' | translate }}</h4>
              <div class="space-y-2">
                <a routerLink="/about" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.about' | translate }}</a>
                <a routerLink="/contact" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.contact' | translate }}</a>
              </div>
            </div>

            <div>
              <h4 class="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">{{ 'footer.legal' | translate }}</h4>
              <div class="space-y-2">
                <a routerLink="/privacy" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.privacy' | translate }}</a>
                <a routerLink="/terms" class="block text-sm text-stone-500 hover:text-stone-900 transition-colors">{{ 'footer.terms' | translate }}</a>
              </div>
            </div>
          </div>

          <div class="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-stone-400">{{ 'footer.copyright' | translate }}</p>
            <div class="flex items-center gap-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener" class="text-stone-400 hover:text-stone-900 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener" class="text-stone-400 hover:text-stone-900 transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <app-cookie-consent />
      <app-back-to-top />
    </div>
  `
})
export class PublicShellComponent {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  currentLang = this.translate.currentLang || 'en';
  mobileMenuOpen = false;

  toggleLanguage(): void {
    this.currentLang = this.currentLang === 'en' ? 'et' : 'en';
    this.translate.use(this.currentLang);
    localStorage.setItem('lang', this.currentLang);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  constructor() {
    const saved = localStorage.getItem('lang');
    if (saved && ['en', 'et'].includes(saved)) {
      this.currentLang = saved;
      this.translate.use(saved);
    }
  }
}
