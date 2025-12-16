import { Component } from '@angular/core';
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
    <div class="max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-xl p-6 shadow-lg">
      <h1 class="text-2xl font-bold mb-4 text-slate-50">Create account</h1>

      <form class="space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <div>
          <label class="block text-sm text-slate-300 mb-1" for="fullName">Full name (optional)</label>
          <input
            id="fullName"
            type="text"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            formControlName="fullName"
            autocomplete="name"
          />
        </div>

        <div>
          <label class="block text-sm text-slate-300 mb-1" for="email">Email</label>
          <input
            id="email"
            type="email"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            formControlName="email"
            autocomplete="email"
          />
          <p class="mt-1 text-xs text-rose-400" *ngIf="email.touched && email.invalid">
            Email is required and must be valid.
          </p>
        </div>

        <div>
          <label class="block text-sm text-slate-300 mb-1" for="password">Password</label>
          <input
            id="password"
            type="password"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            formControlName="password"
            autocomplete="new-password"
          />
          <p class="mt-1 text-xs text-rose-400" *ngIf="password.touched && password.invalid">
            Password is required (min 6 chars).
          </p>
        </div>

        <button
          type="submit"
          class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400 disabled:opacity-60"
          [disabled]="loading"
        >
          {{ loading ? 'Creating...' : 'Create account' }}
        </button>

        <p class="text-xs text-rose-400" *ngIf="error">{{ error }}</p>

        <p class="text-xs text-slate-400 text-center">
          Already have an account?
          <a routerLink="/login" class="text-emerald-300 hover:text-emerald-200">Log in</a>.
        </p>
      </form>
    </div>
  `
})
export class RegisterComponent {
  loading = false;
  error = '';

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

  submit(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password, fullName } = this.form.getRawValue();

    this.auth.register(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
