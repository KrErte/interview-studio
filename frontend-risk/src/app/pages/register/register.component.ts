import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';

type RegisterForm = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-stone-900 mb-2">Create Your Account</h1>
          <p class="text-stone-500 text-sm">Get your personalized career risk assessment</p>
        </div>

        <!-- Form -->
        <div class="border border-stone-200 bg-white p-8">
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2" for="fullName">
                Full Name <span class="text-stone-400">(optional)</span>
              </label>
              <input
                id="fullName"
                type="text"
                class="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
                formControlName="fullName"
                autocomplete="name"
                placeholder="John Doe"
              />
            </div>

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
                  autocomplete="new-password"
                  placeholder="Create a strong password"
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
              <!-- Password strength indicator -->
              <div class="mt-2 flex gap-1">
                <div class="h-1 flex-1" [class]="passwordStrength >= 1 ? 'bg-red-500' : 'bg-stone-200'"></div>
                <div class="h-1 flex-1" [class]="passwordStrength >= 2 ? 'bg-amber-500' : 'bg-stone-200'"></div>
                <div class="h-1 flex-1" [class]="passwordStrength >= 3 ? 'bg-green-500' : 'bg-stone-200'"></div>
              </div>
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

            <!-- Success message -->
            <div *ngIf="success" class="p-3 border border-green-200 bg-green-50">
              <p class="text-sm text-green-700 flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Account created! Redirecting to login...
              </p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="w-full py-3.5 bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-40 transition-all"
              [disabled]="loading"
            >
              <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                Create Account
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <span *ngIf="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </span>
            </button>

            <!-- Terms -->
            <p class="text-xs text-stone-400 text-center">
              By creating an account, you agree to our
              <a routerLink="/terms" class="text-stone-900 hover:underline">Terms of Service</a>
              and
              <a routerLink="/privacy" class="text-stone-900 hover:underline">Privacy Policy</a>
            </p>
          </form>

          <!-- Login link -->
          <div class="mt-6 text-center border-t border-stone-200 pt-6">
            <p class="text-sm text-stone-500">
              Already have an account?
            </p>
            <a routerLink="/login" class="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
              Sign in to your dashboard
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  loading = false;
  error = '';
  success = false;
  showPassword = false;

  form: FormGroup<RegisterForm>;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group<RegisterForm>({
      fullName: this.fb.nonNullable.control('', []),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  get fullName(): FormControl<string> {
    return this.form.controls.fullName;
  }

  get email(): FormControl<string> {
    return this.form.controls.email;
  }

  get password(): FormControl<string> {
    return this.form.controls.password;
  }

  get passwordStrength(): number {
    const pwd = this.password.value;
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (pwd.length >= 10 && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }

  submit(): void {
    this.error = '';
    this.success = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password, fullName } = this.form.getRawValue();

    this.auth.register(email, password, fullName || undefined).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
