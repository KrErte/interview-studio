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
    <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-stone-900 mb-2">Welcome Back</h1>
          <p class="text-stone-500 text-sm">Sign in to access your career assessment dashboard</p>
        </div>

        <!-- Form -->
        <div class="border border-stone-200 bg-white p-8">
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2" for="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                class="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
                formControlName="email"
                autocomplete="email"
                placeholder="you@company.com"
              />
              <p class="mt-1.5 text-xs text-red-600" *ngIf="email.touched && email.invalid">
                Please enter a valid email address
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2" for="password">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="w-full border border-stone-300 bg-white px-4 py-3 pr-12 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition-colors"
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
              <p class="mt-1.5 text-xs text-red-600" *ngIf="password.touched && password.invalid">
                Password must be at least 6 characters
              </p>
            </div>

            <!-- Error message -->
            <div *ngIf="error" class="p-3 border border-red-200 bg-red-50">
              <p class="text-sm text-red-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                {{ error }}
              </p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="w-full py-3.5 bg-stone-900 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-40 transition-all"
              [disabled]="loading"
            >
              <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                Sign In
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
          <div class="mt-6 text-center border-t border-stone-200 pt-6">
            <p class="text-sm text-stone-500">
              New to CareerRisk Index?
            </p>
            <a routerLink="/register" class="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
              Create your account
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Security badge -->
        <div class="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span>256-bit encrypted &middot; Your data stays private</span>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loading = false;
  error = '';
  showPassword = false;

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
      this.router.navigateByUrl('/careerrisk');
      return;
    }
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
        this.router.navigateByUrl('/careerrisk');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Authentication failed. Please check your credentials.';
      }
    });
  }
}
