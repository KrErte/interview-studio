import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TierService } from '../../core/services/tier.service';
import { PaymentApiService } from '../../core/services/payment-api.service';
import { AuthService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-lg mx-auto px-4 py-20 text-center">
      @if (verifying()) {
        <!-- Verifying payment -->
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin"></div>
        </div>
        <h1 class="text-2xl font-bold text-white mb-3">Verifying your payment...</h1>
        <p class="text-slate-400">This usually takes a few seconds.</p>
      } @else if (success()) {
        <!-- Success -->
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
            <svg class="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-white mb-3">Welcome to {{ tierName() }}!</h1>
        <p class="text-slate-400 mb-8">Your account has been upgraded. All features are now unlocked.</p>

        <div class="space-y-3">
          <a
            routerLink="/careerrisk/assessment"
            class="block w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-base font-bold text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all">
            Go to Assessment
          </a>
          <a
            routerLink="/arena/interview"
            class="block w-full py-3 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:border-slate-500 transition-colors">
            Try Arena Tools
          </a>
        </div>
      } @else {
        <!-- Error/timeout -->
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h1 class="text-2xl font-bold text-white mb-3">Payment processing</h1>
        <p class="text-slate-400 mb-8">
          Your payment is being processed. It may take a minute for your account to be upgraded.
          If this doesn't resolve, please contact support.
        </p>
        <button
          (click)="retry()"
          class="px-6 py-3 rounded-xl bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
          Check again
        </button>
      }
    </div>
  `
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private readonly tierService = inject(TierService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly verifying = signal(true);
  readonly success = signal(false);
  readonly tierName = signal('');

  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollCount = 0;
  private expectedTier = '';

  ngOnInit() {
    this.expectedTier = this.route.snapshot.queryParamMap.get('tier') || '';
    this.tierName.set(this.formatTierName(this.expectedTier));

    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.pollTier();
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  retry() {
    this.verifying.set(true);
    this.pollCount = 0;
    this.pollTier();
  }

  private pollTier() {
    this.pollTimer = setInterval(() => {
      this.pollCount++;

      this.paymentApi.getCurrentTier().subscribe({
        next: (res) => {
          const tier = res.tier || 'FREE';
          if (tier !== 'FREE' && tier.toUpperCase() === this.expectedTier.toUpperCase()) {
            this.tierService.setTier(tier);
            this.verifying.set(false);
            this.success.set(true);
            if (this.pollTimer) clearInterval(this.pollTimer);
          } else if (this.pollCount >= 15) {
            // Timeout after ~30 seconds
            this.verifying.set(false);
            if (this.pollTimer) clearInterval(this.pollTimer);
          }
        },
        error: () => {
          if (this.pollCount >= 15) {
            this.verifying.set(false);
            if (this.pollTimer) clearInterval(this.pollTimer);
          }
        }
      });
    }, 2000);
  }

  private formatTierName(tier: string): string {
    if (!tier) return '';
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  }
}
