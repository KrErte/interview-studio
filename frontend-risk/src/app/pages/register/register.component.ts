import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';

type RegisterForm = {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
};

interface SkillTrend {
  name: string;
  demand: number;
  growth: string;
  color: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-140px)] flex">
      <!-- Left Panel - Skills Radar Visualization -->
      <div class="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <!-- Animated background pattern -->
        <div class="absolute inset-0">
          <div class="absolute inset-0 opacity-30">
            <svg class="w-full h-full">
              <pattern id="skillGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="currentColor" class="text-emerald-500/20"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#skillGrid)" />
            </svg>
          </div>
        </div>

        <div class="relative z-10 w-full max-w-md">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-4">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span class="text-xs text-emerald-300 font-semibold">TRENDING SKILLS</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Skills in High Demand</h2>
            <p class="text-slate-400 text-sm">See what skills are growing fastest in AI-resistant careers</p>
          </div>

          <!-- Skills bars -->
          <div class="space-y-4">
            <div *ngFor="let skill of skillTrends; let i = index" class="relative">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-sm font-medium text-slate-200">{{ skill.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold" [class]="skill.color">{{ skill.growth }}</span>
                  <span class="text-xs text-slate-500">demand</span>
                </div>
              </div>
              <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000 ease-out"
                  [class]="skill.color.replace('text-', 'bg-').replace('-400', '-500')"
                  [style.width.%]="animatedDemands[i]"
                ></div>
              </div>
            </div>
          </div>

          <!-- Bottom stats -->
          <div class="mt-10 grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-white">3 min</span>
              </div>
              <p class="text-xs text-slate-500">Average assessment time</p>
            </div>
            <div class="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <svg class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span class="text-2xl font-bold text-white">Free</span>
              </div>
              <p class="text-xs text-slate-500">No credit card required</p>
            </div>
          </div>

          <!-- Testimonial -->
          <div class="mt-8 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
            <p class="text-sm text-slate-300 italic mb-3">
              "The Career Disruption Index helped me identify skills I needed to stay relevant. I pivoted to AI product management and increased my salary by 40%."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-slate-900">
                SK
              </div>
              <div>
                <p class="text-sm font-semibold text-white">Sarah K.</p>
                <p class="text-xs text-slate-500">Product Manager, Tech</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Register Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div class="w-full max-w-md">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 mb-4">
              <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span class="text-xs text-slate-400">Start Free</span>
            </div>
            <h1 class="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p class="text-slate-400 text-sm">Get your personalized career disruption analysis</p>
          </div>

          <!-- Form -->
          <form class="space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2" for="fullName">
                Full Name <span class="text-slate-600">(optional)</span>
              </label>
              <div class="relative">
                <input
                  id="fullName"
                  type="text"
                  class="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors"
                  formControlName="fullName"
                  autocomplete="name"
                  placeholder="John Doe"
                />
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

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
                  autocomplete="new-password"
                  placeholder="Create a strong password"
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
              <!-- Password strength indicator -->
              <div class="mt-2 flex gap-1">
                <div class="h-1 flex-1 rounded-full" [class]="passwordStrength >= 1 ? 'bg-rose-500' : 'bg-slate-800'"></div>
                <div class="h-1 flex-1 rounded-full" [class]="passwordStrength >= 2 ? 'bg-amber-500' : 'bg-slate-800'"></div>
                <div class="h-1 flex-1 rounded-full" [class]="passwordStrength >= 3 ? 'bg-emerald-500' : 'bg-slate-800'"></div>
              </div>
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

            <!-- Success message -->
            <div *ngIf="success" class="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p class="text-sm text-emerald-400 flex items-center gap-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                Account created! Redirecting to login...
              </p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 transition-all duration-200"
              [disabled]="loading"
            >
              <span *ngIf="!loading" class="flex items-center justify-center gap-2">
                Create Account & Start Assessment
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
            <p class="text-xs text-slate-500 text-center">
              By creating an account, you agree to our
              <a href="#" class="text-emerald-400 hover:underline">Terms of Service</a>
              and
              <a href="#" class="text-emerald-400 hover:underline">Privacy Policy</a>
            </p>
          </form>

          <!-- Login link -->
          <div class="mt-8 text-center">
            <p class="text-sm text-slate-500">
              Already have an account?
            </p>
            <a routerLink="/login" class="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign in to your dashboard
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
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
export class RegisterComponent implements OnInit, OnDestroy {
  loading = false;
  error = '';
  success = false;
  showPassword = false;

  skillTrends: SkillTrend[] = [
    { name: 'AI/ML Engineering', demand: 94, growth: '+127%', color: 'text-emerald-400' },
    { name: 'Prompt Engineering', demand: 88, growth: '+340%', color: 'text-cyan-400' },
    { name: 'Data Architecture', demand: 82, growth: '+89%', color: 'text-emerald-400' },
    { name: 'Cloud Security', demand: 79, growth: '+67%', color: 'text-amber-400' },
    { name: 'Product Management', demand: 71, growth: '+45%', color: 'text-cyan-400' },
  ];

  animatedDemands: number[] = [];
  private animationInterval: any;

  form: FormGroup<RegisterForm>;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group<RegisterForm>({
      fullName: this.fb.nonNullable.control('', []),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)])
    });

    this.animatedDemands = this.skillTrends.map(() => 0);
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

  ngOnInit(): void {
    // Animate skill bars
    setTimeout(() => {
      this.animateSkillBars();
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.animationInterval) clearInterval(this.animationInterval);
  }

  private animateSkillBars(): void {
    const duration = 1200;
    const steps = 40;
    let currentStep = 0;

    this.animationInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      this.animatedDemands = this.skillTrends.map(skill => Math.round(skill.demand * eased));

      if (currentStep >= steps) {
        clearInterval(this.animationInterval);
      }
    }, duration / steps);
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

  fillMockData(): void {
    this.form.patchValue({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!'
    });
  }
}
