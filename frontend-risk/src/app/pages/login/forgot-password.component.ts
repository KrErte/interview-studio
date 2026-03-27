import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-stone-900 mb-2">Reset Password</h1>
          <p class="text-stone-500 text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        <div class="border border-stone-200 bg-white p-8">
          <form *ngIf="!sent" class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
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

            <div *ngIf="error" class="p-3 border border-red-200 bg-red-50">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>

            <button
              type="submit"
              class="w-full py-3.5 bg-stone-900 text-sm font-bold text-white hover:bg-stone-800 disabled:opacity-40 transition-all"
              [disabled]="loading"
            >
              <span *ngIf="!loading">Send Reset Link</span>
              <span *ngIf="loading" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            </button>
          </form>

          <div *ngIf="sent" class="text-center py-4">
            <svg class="w-12 h-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 class="text-lg font-bold text-stone-900 mb-2">Check Your Email</h2>
            <p class="text-sm text-stone-500 mb-6">
              If an account exists with that email, we've sent a password reset link. Check your inbox and spam folder.
            </p>
          </div>

          <div class="mt-6 text-center border-t border-stone-200 pt-6">
            <a routerLink="/login" class="inline-flex items-center gap-1 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  loading = false;
  error = '';
  sent = false;

  form: FormGroup;

  get email(): FormControl<string> {
    return this.form.controls['email'] as FormControl<string>;
  }

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email])
    });
  }

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.auth.forgotPassword(this.form.getRawValue().email).subscribe({
      next: () => {
        this.loading = false;
        this.sent = true;
      },
      error: () => {
        this.loading = false;
        this.sent = true; // Don't leak whether email exists
      }
    });
  }
}
