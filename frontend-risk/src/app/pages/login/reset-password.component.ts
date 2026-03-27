import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-stone-900 mb-2">Set New Password</h1>
          <p class="text-stone-500 text-sm">Enter your new password below</p>
        </div>

        <div class="border border-stone-200 bg-white p-8">
          <div *ngIf="!token" class="text-center py-4">
            <p class="text-sm text-red-600 mb-4">Invalid or missing reset token.</p>
            <a routerLink="/forgot-password" class="text-sm font-semibold text-stone-900 hover:underline">
              Request a new reset link
            </a>
          </div>

          <form *ngIf="token && !success" class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2" for="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                class="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
                formControlName="password"
                autocomplete="new-password"
                placeholder="At least 6 characters"
              />
              <p class="mt-1.5 text-xs text-red-600" *ngIf="password.touched && password.invalid">
                Password must be at least 6 characters
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-stone-700 mb-2" for="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                class="w-full border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none transition-colors"
                formControlName="confirmPassword"
                autocomplete="new-password"
                placeholder="Repeat your password"
              />
              <p class="mt-1.5 text-xs text-red-600" *ngIf="confirmPassword.touched && confirmPassword.value !== password.value">
                Passwords do not match
              </p>
            </div>

            <div *ngIf="error" class="p-3 border border-red-200 bg-red-50">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 bg-stone-900 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-40 transition-all"
              [disabled]="loading"
            >
              <span *ngIf="!loading">Reset Password</span>
              <span *ngIf="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            </button>
          </form>

          <div *ngIf="success" class="text-center py-4">
            <svg class="w-12 h-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-lg font-bold text-stone-900 mb-2">Password Reset Successfully</h2>
            <p class="text-sm text-stone-500 mb-6">You can now sign in with your new password.</p>
            <a routerLink="/login" class="inline-block py-3 px-8 bg-stone-900 text-sm font-bold text-white hover:bg-stone-800 transition-all">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  loading = false;
  error = '';
  success = false;

  form: FormGroup;

  get password(): FormControl<string> {
    return this.form.controls['password'] as FormControl<string>;
  }

  get confirmPassword(): FormControl<string> {
    return this.form.controls['confirmPassword'] as FormControl<string>;
  }

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit(): void {
    this.error = '';
    const { password, confirmPassword } = this.form.getRawValue();

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.resetPassword(this.token, password).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Reset link is invalid or expired. Please request a new one.';
      }
    });
  }
}
