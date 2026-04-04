import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-v2-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Sticky top bar -->
      <header class="border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span class="text-lg font-bold text-white tracking-tight">CareerRisk</span>
          <div class="flex items-center gap-4">
            @if (isAuthenticated()) {
              <a routerLink="/history" class="text-gray-400 hover:text-white text-sm">History</a>
              <button (click)="logout()" class="text-gray-400 hover:text-white text-sm">Logout</button>
            } @else {
              <a routerLink="/login" class="text-gray-400 hover:text-white text-sm">Sign in</a>
            }
          </div>
        </div>
      </header>

      <main class="flex-1">
        <!-- Hero — single focused message -->
        <section class="px-4 pt-16 pb-12 sm:pt-24 sm:pb-16">
          <div class="max-w-2xl mx-auto text-center">
            <!-- Clean badge -->
            <div class="inline-flex items-center gap-2 bg-gray-800/60 border border-gray-700/40 rounded-full px-4 py-1.5 mb-8">
              <span class="text-gray-300 text-sm font-medium">Free &bull; 2 min &bull; No signup</span>
            </div>

            <h1 class="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
              Not getting interviews?<br>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Find out why.</span>
            </h1>

            <p class="text-gray-400 text-lg sm:text-xl mb-4 max-w-lg mx-auto">
              Answer 3 questions. Get an honest assessment of your job search — and a plan to fix it.
            </p>

            <p class="text-gray-500 text-sm mb-8">Used by job seekers in 30+ countries.</p>

            <!-- Inline role input + CTA -->
            <div class="max-w-md mx-auto">
              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="targetRole"
                  placeholder="What role are you targeting?"
                  class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-base"
                  (keyup.enter)="targetRole.trim() && startCheck()"
                />
                <button
                  (click)="startCheck()"
                  [disabled]="!targetRole.trim()"
                  class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-6 py-3.5 rounded-lg transition-all text-base whitespace-nowrap shadow-lg shadow-emerald-900/30"
                >
                  Check Now
                </button>
              </div>

              <!-- Quick role chips -->
              <div class="flex flex-wrap justify-center gap-2 mt-4">
                @for (role of quickRoles; track role) {
                  <button
                    (click)="targetRole = role; startCheck()"
                    class="text-xs bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors"
                  >
                    {{ role }}
                  </button>
                }
              </div>
            </div>
          </div>
        </section>

        <!-- Pain points — what you'll discover -->
        <section class="px-4 py-12 border-t border-gray-800/50">
          <div class="max-w-4xl mx-auto">
            <h2 class="text-center text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">
              In 2 minutes you'll know
            </h2>

            <div class="grid sm:grid-cols-3 gap-6">
              <div class="text-center p-6">
                <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-950/60 border border-red-800/30 flex items-center justify-center">
                  <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <h3 class="text-white font-semibold mb-2">Your real status</h3>
                <p class="text-gray-500 text-sm">RED, YELLOW, or GREEN — how the market actually sees you right now.</p>
              </div>

              <div class="text-center p-6">
                <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-amber-950/60 border border-amber-800/30 flex items-center justify-center">
                  <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 0A9 9 0 015.636 18.364"/>
                  </svg>
                </div>
                <h3 class="text-white font-semibold mb-2">What's blocking you</h3>
                <p class="text-gray-500 text-sm">The top 3 reasons your applications aren't landing.</p>
              </div>

              <div class="text-center p-6">
                <div class="w-14 h-14 mx-auto mb-4 rounded-xl bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center">
                  <svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
                <h3 class="text-white font-semibold mb-2">What to do next</h3>
                <p class="text-gray-500 text-sm">A specific 30-day action plan to go from stuck to interviews.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- How it works — dead simple -->
        <section class="px-4 py-12 border-t border-gray-800/50 bg-gray-900/30">
          <div class="max-w-3xl mx-auto">
            <h2 class="text-center text-2xl font-bold text-white mb-10">How it works</h2>

            <div class="grid sm:grid-cols-3 gap-8">
              <div class="text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-600/20 text-emerald-400 font-bold text-lg flex items-center justify-center">1</div>
                <h3 class="text-white font-medium mb-1">Answer 3 questions</h3>
                <p class="text-gray-500 text-sm">Role, experience, biggest challenge.</p>
              </div>
              <div class="text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-600/20 text-emerald-400 font-bold text-lg flex items-center justify-center">2</div>
                <h3 class="text-white font-medium mb-1">Get your assessment</h3>
                <p class="text-gray-500 text-sm">Instant status + blockers. Free.</p>
              </div>
              <div class="text-center">
                <div class="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-600/20 text-emerald-400 font-bold text-lg flex items-center justify-center">3</div>
                <h3 class="text-white font-medium mb-1">Unlock your plan</h3>
                <p class="text-gray-500 text-sm">30-day action plan + CV rewrite for just 9.99.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Objection handling -->
        <section class="px-4 py-12 border-t border-gray-800/50">
          <div class="max-w-2xl mx-auto text-center">
            <h2 class="text-2xl font-bold text-white mb-8">Still on the fence?</h2>

            <div class="grid sm:grid-cols-2 gap-4 text-left">
              <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <p class="text-white font-medium mb-1">"I can figure it out myself"</p>
                <p class="text-gray-500 text-sm">You probably can. But how many months have you already spent applying with no results?</p>
              </div>
              <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <p class="text-white font-medium mb-1">"It's too expensive"</p>
                <p class="text-gray-500 text-sm">One coffee costs more. One wasted month of job searching costs you thousands in lost salary.</p>
              </div>
              <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <p class="text-white font-medium mb-1">"How is this different from ChatGPT?"</p>
                <p class="text-gray-500 text-sm">We don't generate fluff. Our scoring is deterministic — based on real hiring patterns, not generic AI advice.</p>
              </div>
              <div class="bg-gray-900 border border-gray-800 rounded-lg p-5">
                <p class="text-white font-medium mb-1">"What if it says I'm RED?"</p>
                <p class="text-gray-500 text-sm">Then you just avoided wasting months applying to the wrong roles. That's worth knowing now.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Final CTA -->
        <section class="px-4 py-16 border-t border-gray-800/50 bg-gradient-to-b from-gray-950 to-gray-900">
          <div class="max-w-lg mx-auto text-center">
            <h2 class="text-3xl font-bold text-white mb-4">
              Every day you wait is a day wasted.
            </h2>
            <p class="text-gray-400 mb-8">
              Check your status in 2 minutes. It's free.
            </p>
            <button
              (click)="scrollToTop()"
              class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-4 rounded-lg transition-all text-lg shadow-lg shadow-emerald-900/30"
            >
              Check My Interview Readiness
            </button>
            <p class="text-gray-600 text-xs mt-4">No signup. No credit card. Just answers.</p>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-800 py-8">
        <div class="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4 text-sm text-gray-600">
          <div class="flex flex-wrap justify-center gap-6">
            <a routerLink="/pricing" class="hover:text-gray-400 transition-colors">Pricing</a>
            <a routerLink="/privacy" class="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a routerLink="/terms" class="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="mailto:hello&#64;careerrisk.ee" class="hover:text-gray-400 transition-colors">Contact</a>
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <span>&copy; 2024 CareerRisk.ee</span>
            <span>&bull;</span>
            <span>Made in Estonia</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent implements OnInit {
  targetRole = '';

  quickRoles = [
    'Software Engineer',
    'Product Manager',
    'Sales Manager',
    'Data Analyst',
    'Project Manager',
    'Marketing Manager',
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.analytics.pageView('/', 'Landing');
  }

  isAuthenticated = this.authService.isAuthenticated;

  startCheck(): void {
    if (!this.targetRole.trim()) return;
    this.analytics.track('session_started', { mode: 'simple', fromLanding: true });
    // Store the role so session-new can pre-fill it
    sessionStorage.setItem('prefill_role', this.targetRole.trim());
    this.router.navigate(['/session/new']);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    }, 500);
  }

  showShortcuts(): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
  }

  logout(): void {
    this.authService.logout();
  }
}
