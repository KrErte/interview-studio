import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-md mx-auto px-4 py-4">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
        </div>
      </header>

      <main class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-sm">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p class="text-gray-400">Sign in to access your sessions</p>
          </div>

          <form (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="block text-gray-300 text-sm mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="form.email"
                name="email"
                placeholder="you&#64;example.com"
                class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                [disabled]="loading()"
                required
              />
            </div>

            <div>
              <label class="block text-gray-300 text-sm mb-2">Password</label>
              <input
                type="password"
                [(ngModel)]="form.password"
                name="password"
                placeholder="••••••••"
                class="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                [disabled]="loading()"
                required
              />
            </div>

            @if (error()) {
              <div class="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                {{ error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="loading() || !isValid()"
              class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-400">
              Don't have an account?
              <a routerLink="/register" [queryParams]="returnUrlParams" class="text-emerald-400 hover:text-emerald-300">
                Sign up
              </a>
            </p>
          </div>

          <div class="mt-8 pt-8 border-t border-gray-800 text-center">
            <p class="text-gray-500 text-sm">
              Or continue as guest with
              <a routerLink="/session/new" class="text-emerald-400 hover:text-emerald-300">Quick Check</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);

  form: LoginRequest = {
    email: '',
    password: '',
  };

  returnUrl = '/';
  returnUrlParams: Record<string, string> = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private analytics: AnalyticsService
  ) {}

  ngOnInit(): void {
    this.analytics.pageView('/login', 'Login');
    this.analytics.track('login_started');

    // Get return URL from query params
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
        this.returnUrlParams = { returnUrl: this.returnUrl };
      }
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  isValid(): boolean {
    return !!this.form.email && !!this.form.password;
  }

  submit(): void {
    if (this.loading() || !this.isValid()) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.form).subscribe({
      next: () => {
        this.analytics.track('login_completed');
        this.analytics.identify(this.form.email);
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.error.set('Invalid email or password');
        } else {
          this.error.set(err.error?.message || 'Login failed. Please try again.');
        }
      },
    });
  }
}
