import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-business-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-950 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <!-- Logo -->
        <div class="p-6 border-b border-slate-800">
          <a routerLink="/business" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">WI</span>
            </div>
            <span class="text-white font-bold">Workforce Intel</span>
          </a>
        </div>

        <!-- Company Selector -->
        <div class="p-4 border-b border-slate-800">
          <button class="w-full flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-xs font-bold">A</div>
              <span class="text-sm">{{ companyName() }}</span>
            </div>
            <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4">
          <ul class="space-y-1">
            @for (item of navItems(); track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-emerald-500/10 text-emerald-400 border-emerald-500"
                  [routerLinkActiveOptions]="{ exact: item.path === '/business' }"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent">
                  <span class="text-lg">{{ item.icon }}</span>
                  <span class="text-sm">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>

          <div class="mt-8 pt-4 border-t border-slate-800">
            <p class="text-xs text-slate-500 px-3 mb-2">Quick Links</p>
            <ul class="space-y-1">
              <li>
                <a routerLink="/business/settings" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <span class="text-lg">⚙️</span>
                  <span class="text-sm">Settings</span>
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <span class="text-lg">📖</span>
                  <span class="text-sm">Documentation</span>
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <span class="text-lg">💬</span>
                  <span class="text-sm">Support</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center text-white font-medium">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">{{ userName() }}</div>
              <div class="text-xs text-slate-500 truncate">{{ userEmail() }}</div>
            </div>
            <button (click)="logout()" class="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col">
        <!-- Top Bar -->
        <header class="h-16 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-6">
          <div class="flex items-center gap-4">
            <h1 class="text-lg font-semibold text-white">{{ pageTitle() }}</h1>
          </div>

          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <button class="relative p-2 text-slate-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- Upgrade Banner -->
            @if (showUpgradeBanner()) {
              <a routerLink="/pricing" class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-emerald-600 text-white text-sm rounded-lg hover:opacity-90 transition-opacity">
                <span>⚡</span>
                <span>Upgrade Plan</span>
              </a>
            }
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 p-6 overflow-auto">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class BusinessShellComponent {
  companyName = signal('Acme Corporation');
  userName = signal('John Admin');
  userEmail = signal('john@acme.com');
  userInitials = signal('JA');
  pageTitle = signal('Dashboard');
  showUpgradeBanner = signal(true);

  navItems = signal<NavItem[]>([
    { label: 'Dashboard', path: '/business', icon: '📊' },
    { label: 'Team', path: '/business/team', icon: '👥' },
    { label: 'Analytics', path: '/business/analytics', icon: '📈' },
    { label: 'Training Plans', path: '/business/training', icon: '🎓' },
    { label: 'Integrations', path: '/business/integrations', icon: '🔗' }
  ]);

  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router
  ) {}

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
