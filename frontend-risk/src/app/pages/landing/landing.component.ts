import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-5 text-slate-50">
      <p class="text-emerald-300 text-xs font-semibold uppercase tracking-wide">Tulevikukindlus</p>
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
        Avasta oma valmisolek ja loo tegevuskava samal lehel
      </h1>
      <p class="text-sm text-slate-400">Üks voog CV-st tegevuskavani.</p>
      <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button
          type="button"
          (click)="startAssessment()"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400"
        >
          Alusta tulevikukindluse voogu
        </button>
        <a
          routerLink="/login"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-200"
        >
          Login
        </a>
        <a
          routerLink="/register"
          class="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-emerald-400 hover:text-emerald-200"
        >
          Register
        </a>
      </div>
    </section>
  `
})
export class LandingComponent {
  constructor(private auth: AuthService, private router: Router) {}

  startAssessment(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/futureproof');
      return;
    }
    this.router.navigateByUrl('/login');
  }
}

