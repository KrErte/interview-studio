import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TokenStorageService } from '../core/auth/token-storage.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100">
      <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <a routerLink="/" class="font-extrabold tracking-tight text-slate-50 text-lg">
            Risk Assessment
          </a>

          <nav class="flex flex-wrap items-center gap-3 text-sm">
            <a
              routerLink="/"
              routerLinkActive="text-emerald-300"
              [routerLinkActiveOptions]="{ exact: true }"
              class="text-slate-300 hover:text-slate-50"
              >Home</a
            >
            <a
              routerLink="/risk"
              routerLinkActive="text-emerald-300"
              class="text-slate-300 hover:text-slate-50"
              >Risk</a
            >
            <ng-container *ngIf="loggedIn; else authLinks">
              <a
                routerLink="/dashboard"
                routerLinkActive="text-emerald-300"
                class="text-slate-300 hover:text-slate-50"
                >Dashboard</a
              >
              <button type="button" (click)="logout()"
                class="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:border-emerald-400">
                Logout
              </button>
            </ng-container>
            <ng-template #authLinks>
              <a routerLink="/login" routerLinkActive="text-emerald-300"
                 class="text-slate-300 hover:text-slate-50">Login</a>
              <a routerLink="/register" routerLinkActive="text-emerald-300"
                 class="text-slate-300 hover:text-slate-50">Register</a>
            </ng-template>
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent {
  constructor(private tokenStorage: TokenStorageService, private router: Router) {}

  get loggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/login');
  }
}
