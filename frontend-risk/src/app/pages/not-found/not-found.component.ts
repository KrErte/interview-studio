import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <!-- Header -->
      <header class="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center">
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg class="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span class="font-bold text-white text-sm tracking-tight">CareerRisk</span>
              <span class="block text-[10px] text-emerald-400 font-semibold tracking-widest">INDEX™</span>
            </div>
          </a>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 flex flex-col items-center justify-center px-6">
        <div class="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500 mb-4">404</div>
        <h1 class="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p class="text-slate-400 mb-8 text-center max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        <div class="flex items-center gap-4">
          <a routerLink="/"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20">
            Go home
          </a>
          <a routerLink="/session/new"
            class="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors">
            New assessment
          </a>
        </div>
      </div>

      <!-- Footer -->
      <footer class="border-t border-slate-800/50 py-6 text-center">
        <p class="text-xs text-slate-600">&copy; 2026 CareerRisk Index. All rights reserved.</p>
      </footer>
    </div>
  `
})
export class NotFoundComponent {}


