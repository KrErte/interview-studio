import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UiModeToggleComponent } from '../shared/ui-mode-toggle/ui-mode-toggle.component';

@Component({
  selector: 'app-public-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, UiModeToggleComponent],
  template: `
    <!-- Animated Background -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
      <div class="absolute inset-0 opacity-15" style="background-image:
        linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
        background-size: 40px 40px;">
      </div>
      <!-- Glowing orbs -->
      <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl"></div>
    </div>

    <div class="min-h-screen text-slate-100 flex flex-col">
      <!-- Header -->
      <header class="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="relative">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <svg class="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div class="hidden sm:block">
              <span class="font-bold text-white text-sm tracking-tight">CareerRisk</span>
              <span class="block text-[10px] text-emerald-400 font-semibold tracking-widest">INDEX™</span>
            </div>
          </a>

          <!-- Navigation + UI Mode Toggle -->
          <div class="flex items-center gap-4">
            <!-- UI Mode Toggle (top-right) -->
            <app-ui-mode-toggle />

            <!-- Separator -->
            <div class="h-4 w-px bg-slate-800"></div>

            <nav class="flex items-center gap-1">
              <a
                routerLink="/"
                routerLinkActive="bg-slate-800/50 text-white"
                [routerLinkActiveOptions]="{ exact: true }"
                class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition-colors"
              >Home</a>

              <a
                routerLink="/pricing"
                routerLinkActive="bg-slate-800/50 text-white"
                class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition-colors"
              >Pricing</a>

              <div class="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

              <a
                routerLink="/login"
                routerLinkActive="text-emerald-400"
                class="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
              >Sign In</a>

              <a
                routerLink="/register"
                routerLinkActive="ring-emerald-400"
                class="ml-1 px-4 py-1.5 rounded-lg text-sm font-semibold text-slate-900 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all shadow-lg shadow-emerald-500/20"
              >Get Started</a>
            </nav>
          </div>
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="border-t border-slate-800/50 bg-slate-950/80 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <!-- Brand -->
            <div class="col-span-2 md:col-span-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span class="font-bold text-white text-sm">CareerRisk Index™</span>
              </div>
              <p class="text-xs text-slate-500 leading-relaxed">
                AI-powered career risk assessment. Know where you stand in the changing job market.
              </p>
            </div>

            <!-- Product -->
            <div>
              <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Product</h4>
              <div class="space-y-2">
                <a routerLink="/session/new" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Assessment</a>
                <a routerLink="/pricing" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Pricing</a>
                <a routerLink="/start" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Skill Check</a>
              </div>
            </div>

            <!-- Company -->
            <div>
              <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Company</h4>
              <div class="space-y-2">
                <a routerLink="/about" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">About</a>
                <a routerLink="/contact" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Contact</a>
              </div>
            </div>

            <!-- Legal -->
            <div>
              <h4 class="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Legal</h4>
              <div class="space-y-2">
                <a routerLink="/privacy" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Privacy Policy</a>
                <a routerLink="/terms" class="block text-sm text-slate-500 hover:text-emerald-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>

          <!-- Bottom bar -->
          <div class="border-t border-slate-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-slate-600">&copy; 2026 CareerRisk Index. All rights reserved.</p>
            <div class="flex items-center gap-4">
              <!-- LinkedIn -->
              <a href="https://linkedin.com" target="_blank" rel="noopener" class="text-slate-600 hover:text-emerald-400 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <!-- Twitter/X -->
              <a href="https://x.com" target="_blank" rel="noopener" class="text-slate-600 hover:text-emerald-400 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicShellComponent {}
