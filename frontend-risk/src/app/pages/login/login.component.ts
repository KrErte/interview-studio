import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';

type LoginForm = {
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex">
      <!-- Left Panel - Threat Visualization -->
      <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <!-- Animated circles -->
        <div class="absolute inset-0">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/10 animate-[spin_30s_linear_infinite]"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-cyan-500/10 animate-[spin_25s_linear_infinite_reverse]"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-emerald-500/20 animate-[spin_20s_linear_infinite]"></div>
        </div>

        <!-- Central threat meter -->
        <div class="relative z-10 text-center">
          <div class="relative w-48 h-48 mx-auto mb-8">
            <!-- Circular progress -->
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-slate-800"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="url(#threatGradient)"
                stroke-width="4"
                stroke-linecap="round"
                stroke-dasharray="283"
                [attr.stroke-dashoffset]="283 - (threatLevel * 2.83)"
                class="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="threatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#10b981" />
                  <stop offset="50%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <!-- Center content -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-4xl font-black text-white">{{ threatLevel }}%</span>
              <span class="text-xs text-slate-500 mt-1">AVG. THREAT LEVEL</span>
            </div>
          </div>

          <h2 class="text-2xl font-bold text-white mb-2">Global Workforce Alert</h2>
          <p class="text-slate-400 text-sm max-w-xs mx-auto mb-8">
            AI is reshaping {{ affectedJobs | number }} jobs this quarter. Sign in to check your personal risk assessment.
          </p>

          <!-- Live stats -->
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div class="text-lg font-bold text-emerald-400">{{ assessmentsToday | number }}</div>
              <div class="text-[10px] text-slate-500 uppercase">Scans Today</div>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div class="text-lg font-bold text-amber-400">47%</div>
              <div class="text-[10px] text-slate-500 uppercase">At Risk</div>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
              <div class="text-lg font-bold text-cyan-400">3m</div>
              <div class="text-[10px] text-slate-500 uppercase">Avg Time</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 mb-4">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-xs text-slate-400">System Online</span>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p class="text-slate-400 text-sm">Access your career threat assessment dashboard</p>
          </div>

          <!-- Form -->
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2" for="email">
                Email Address
              </label>
              <div class="relative">
                <input
                  id="email"
                  type="email"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="you@company.com"
                />
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p class="mt-1.5 text-xs text-rose-400" *ngIf="email.touched && email.invalid">
                Please enter a valid email address
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2" for="password">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                  (click)="showPassword = !showPassword"
                >
                  <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg *ngIf="showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
              <p class="mt-1.5 text-xs text-rose-400" *ngIf="password.touched && password.invalid">
                Password must be at least 6 characters
              </p>
            </div>

            <!-- Error message -->
            <div *ngIf="error" class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p class="text-sm text-rose-400 flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ error }}
              </p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all duration-200"
              [disabled]="loading"
            >
              <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                Access Dashboard
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span *ngIf="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            </button>
          </form>

          <!-- Register link -->
          <div class="mt-8 text-center">
            <p class="text-sm text-slate-500">
              New to Career Disruption Index?
            </p>
            <a routerLink="/register" class="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Create your account
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <!-- Security badge -->
          <div class="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>256-bit encrypted • Your data stays private</span>
          </div>
        </div>
      </div>

      <!-- Mock Data Button -->
      <button
        class="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-purple-500 text-white font-semibold shadow-lg shadow-purple-500/40 hover:bg-purple-600 hover:-translate-y-0.5 transition-all"
        (click)="fillMockData()"
        title="Fill with test data"
      >
        🧪 Mock
      </button>
    </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  showPassword = false;
  threatLevel = 0;
  affectedJobs = 2450000;
  assessmentsToday = 3847;

  private animationInterval: any;
  private counterInterval: any;

  form: FormGroup<LoginForm>;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group<LoginForm>({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  get email(): FormControl<string> {
    return this.form.controls.email;
  }

  get password(): FormControl<string> {
    return this.form.controls.password;
  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/futureproof');
      return;
    }

    // Animate threat level
    setTimeout(() => {
      this.animateThreatLevel();
    }, 300);

    // Simulate live counter
    this.counterInterval = setInterval(() => {
      this.assessmentsToday += Math.floor(Math.random() * 5) + 1;
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.counterInterval) clearInterval(this.counterInterval);
  }

  private animateThreatLevel(): void {
    const target = 47;
    const duration = 1500;
    const steps = 50;
    const increment = target / steps;
    let current = 0;

    this.animationInterval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(this.animationInterval);
      }
      this.threatLevel = Math.round(current);
    }, duration / steps);
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/futureproof');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Authentication failed. Please check your credentials.';
      }
    });
  }

  fillMockData(): void {
    this.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
  }
}
