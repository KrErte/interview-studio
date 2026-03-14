import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';
import { TierService, UserTier } from '../../core/services/tier.service';
import { PaymentApiService, PricingTier } from '../../core/services/payment-api.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose your plan
        </h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          One-time plans or monthly subscription. Pick what works for you.
        </p>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      <!-- One-time Pricing Grid -->
      @if (!loading() && oneTimeTiers().length) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (tier of oneTimeTiers(); track tier.id) {
            <div
              class="relative rounded-2xl border p-6 flex flex-col"
              [class]="tier.popular
                ? 'border-emerald-500 bg-gradient-to-b from-emerald-950/50 to-slate-900 shadow-lg shadow-emerald-500/10'
                : 'border-slate-800 bg-slate-900/80'">

              @if (tier.popular) {
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-xs font-bold text-slate-900">
                  MOST POPULAR
                </div>
              }

              @if (currentTier() === tier.id) {
                <div class="absolute -top-3 right-4 px-3 py-1 rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
                  CURRENT
                </div>
              }

              <div class="mb-6">
                <h3 class="text-lg font-bold text-white mb-1">{{ tier.name }}</h3>
                <div class="flex items-baseline gap-1">
                  @if (tier.price === 0) {
                    <span class="text-3xl font-bold text-slate-300">Free</span>
                  } @else {
                    <span class="text-3xl font-bold text-white">\${{ tier.price }}</span>
                    <span class="text-sm text-slate-500">one-time</span>
                  }
                </div>
              </div>

              <ul class="space-y-3 mb-8 flex-1">
                @for (feature of tier.features; track feature) {
                  <li class="flex items-start gap-2 text-sm text-slate-300">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>

              @if (tier.id === 'FREE') {
                <button
                  class="w-full py-3 rounded-xl border border-slate-700 text-sm font-semibold text-slate-400 cursor-default">
                  Current plan
                </button>
              } @else if (currentTier() === tier.id) {
                <button
                  class="w-full py-3 rounded-xl border border-emerald-500/50 text-sm font-semibold text-emerald-400 cursor-default">
                  Active
                </button>
              } @else if (isTierIncluded(tier.id)) {
                <button
                  class="w-full py-3 rounded-xl border border-slate-700 text-sm font-semibold text-slate-500 cursor-default">
                  Included
                </button>
              } @else if (!auth.isAuthenticated()) {
                <a
                  routerLink="/register"
                  class="w-full py-3 rounded-xl text-sm font-bold text-center block transition-all"
                  [class]="tier.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'">
                  Sign up to unlock
                </a>
              } @else {
                <button
                  (click)="checkout(tier.id)"
                  [disabled]="checkoutLoading()"
                  class="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                  [class]="tier.popular
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'">
                  @if (checkoutLoading()) {
                    Processing...
                  } @else {
                    Upgrade to {{ tier.name }}
                  }
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- Subscription Section -->
      @if (!loading() && subscriptionTiers().length) {
        <div class="mt-16">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">Or subscribe monthly</h2>
            <p class="text-slate-400">Get Professional-level access with a flexible monthly plan.</p>
          </div>

          @for (tier of subscriptionTiers(); track tier.id) {
            <div class="max-w-lg mx-auto rounded-2xl border border-purple-500/50 bg-gradient-to-b from-purple-950/30 to-slate-900 p-8 shadow-lg shadow-purple-500/10">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-white">{{ tier.name }}</h3>
                @if (tierService.hasSubscription()) {
                  <span class="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">ACTIVE</span>
                }
              </div>

              <div class="flex items-baseline gap-1 mb-6">
                <span class="text-4xl font-bold text-white">\${{ tier.price }}</span>
                <span class="text-sm text-slate-400">/month</span>
              </div>

              <ul class="space-y-3 mb-8">
                @for (feature of tier.features; track feature) {
                  <li class="flex items-start gap-2 text-sm text-slate-300">
                    <svg class="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>

              @if (tierService.hasSubscription()) {
                <button
                  class="w-full py-3 rounded-xl border border-purple-500/50 text-sm font-semibold text-purple-400 cursor-default">
                  Active subscription
                </button>
              } @else if (tierService.isAtLeast('PROFESSIONAL')) {
                <button
                  class="w-full py-3 rounded-xl border border-slate-700 text-sm font-semibold text-slate-500 cursor-default">
                  Included in your plan
                </button>
              } @else if (!auth.isAuthenticated()) {
                <a
                  routerLink="/register"
                  class="w-full py-3 rounded-xl text-sm font-bold text-center block bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
                  Sign up to subscribe
                </a>
              } @else {
                <button
                  (click)="checkout(tier.id)"
                  [disabled]="checkoutLoading()"
                  class="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50">
                  @if (checkoutLoading()) {
                    Processing...
                  } @else {
                    Subscribe to {{ tier.name }}
                  }
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- FAQ -->
      <div class="mt-16 max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
        <div class="space-y-4">
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">What's the difference between one-time plans and Arena Pro?</h3>
            <p class="text-sm text-slate-400">One-time plans are a single payment you keep forever. Arena Pro is a monthly subscription that gives you Professional-level access as long as it's active.</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">Can I cancel Arena Pro anytime?</h3>
            <p class="text-sm text-slate-400">Yes! Cancel anytime. You'll keep access until the end of your billing period.</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">Can I upgrade later?</h3>
            <p class="text-sm text-slate-400">Yes! You only pay the difference when upgrading to a higher tier.</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">What does Lifetime include?</h3>
            <p class="text-sm text-slate-400">Everything we have now plus every feature we build in the future. No extra cost, ever.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly tierService = inject(TierService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly router = inject(Router);

  readonly allTiers = signal<PricingTier[]>([]);
  readonly loading = signal(true);
  readonly checkoutLoading = signal(false);

  readonly oneTimeTiers = computed(() => this.allTiers().filter(t => !t.subscription));
  readonly subscriptionTiers = computed(() => this.allTiers().filter(t => t.subscription));

  // Keep backward compat for template
  readonly tiers = this.oneTimeTiers;
  readonly currentTier = this.tierService.tier;

  isTierIncluded(tierId: string): boolean {
    return this.tierService.isAtLeast(tierId as UserTier);
  }

  ngOnInit() {
    this.paymentApi.getPricing().subscribe({
      next: (tiers) => {
        this.allTiers.set(tiers);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  checkout(tierId: string) {
    this.checkoutLoading.set(true);
    const successUrl = `${window.location.origin}/payment/success?tier=${tierId}`;
    const cancelUrl = `${window.location.origin}/pricing`;

    this.paymentApi.createCheckout(tierId, successUrl, cancelUrl).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: () => {
        this.checkoutLoading.set(false);
        alert('Failed to create checkout. Please try again.');
      }
    });
  }
}
