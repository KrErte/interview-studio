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
              <span class="font-bold text-white text-sm tracking-tight">Career Momentum</span>
              <span class="block text-[10px] text-emerald-400 font-semibold tracking-widest">PLATFORM™</span>
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
      <footer class="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Career Momentum™</span>
            </div>
            <div class="flex items-center gap-4">
              <span>Powered by AI career intelligence</span>
              <span class="hidden sm:inline">•</span>
              <span class="hidden sm:inline">Updated daily</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicShellComponent {}
