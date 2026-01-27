import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-v2-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 class="text-xl font-bold text-white">Interview Studio</h1>
          <div class="flex items-center gap-4">
            <button
              (click)="showShortcuts()"
              class="text-gray-500 hover:text-gray-300 text-sm"
              title="Keyboard shortcuts (?)"
            >
              <span class="hidden sm:inline">Shortcuts</span>
              <span class="sm:hidden">?</span>
            </button>
            @if (isAuthenticated()) {
              <a routerLink="/history" class="text-gray-400 hover:text-white text-sm">History</a>
              <button (click)="logout()" class="text-gray-400 hover:text-white text-sm">Logout</button>
            } @else {
              <a routerLink="/login" class="text-gray-400 hover:text-white text-sm">Login</a>
            }
          </div>
        </div>
      </header>

      <!-- Hero -->
      <main class="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-4xl sm:text-5xl font-bold text-white mb-4">
            Prepare for every interview
          </h2>
          <p class="text-gray-400 text-lg sm:text-xl mb-2">
            Get a clear assessment of your job market position
          </p>
          <p class="text-gray-500 text-base">
            Actionable 30-day plan. CV suggestions. Roles to target (and avoid).
          </p>
        </div>

        <!-- Mode Selection -->
        <div class="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <!-- Simple Mode -->
          <div
            class="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-emerald-600 transition-colors cursor-pointer group"
            (click)="startSimple()"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="bg-emerald-600/20 text-emerald-400 text-xs px-2 py-1 rounded">Recommended</span>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
              Quick Check
            </h3>
            <p class="text-gray-400 text-sm mb-4">
              3 questions. Get your assessment in under 2 minutes.
            </p>
            <ul class="text-gray-500 text-sm space-y-1">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                No account required
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Instant results
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Free preview
              </li>
            </ul>
          </div>

          <!-- Advanced Mode -->
          <div
            class="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-600 transition-colors cursor-pointer group"
            (click)="startAdvanced()"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <span class="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded">Full Analysis</span>
            </div>
            <h3 class="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Deep Dive
            </h3>
            <p class="text-gray-400 text-sm mb-4">
              5 questions + CV analysis. More personalized results.
            </p>
            <ul class="text-gray-500 text-sm space-y-1">
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                CV-based insights
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Save to history
              </li>
              <li class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                Shareable reports
              </li>
            </ul>
          </div>
        </div>

        <!-- Pricing teaser -->
        <div class="mt-12 text-center">
          <p class="text-gray-500 text-sm">
            Free preview. Full 30-day plan for
            <a routerLink="/pricing" class="text-emerald-400 hover:text-emerald-300">€9.99 one-time</a>.
          </p>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-800 py-6">
        <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>Interview Studio V2</p>
          <div class="flex gap-6">
            <a routerLink="/pricing" class="hover:text-gray-300">Pricing</a>
            <button (click)="showShortcuts()" class="hover:text-gray-300">
              Shortcuts <kbd class="ml-1 px-1.5 py-0.5 bg-gray-800 rounded text-xs">?</kbd>
            </button>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.analytics.pageView('/', 'Landing');
  }

  isAuthenticated = this.authService.isAuthenticated;

  startSimple(): void {
    this.analytics.track('session_started', { mode: 'simple' });
    this.router.navigate(['/session/new']);
  }

  startAdvanced(): void {
    this.analytics.track('session_started', { mode: 'advanced' });
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/session/new/advanced']);
    } else {
      // Redirect to login with return URL
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/session/new/advanced' } });
    }
  }

  showShortcuts(): void {
    // This will be handled by the keyboard shortcuts service
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
  }

  logout(): void {
    this.authService.logout();
  }
}
