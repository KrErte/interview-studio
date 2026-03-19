import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-api.service';
import { TierService } from '../../core/services/tier.service';
import { PaymentApiService, PricingTier } from '../../core/services/payment-api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          {{ 'pricing.title' | translate }}
        </h1>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          {{ 'pricing.subtitle' | translate }}
        </p>
      </div>

      <!-- Billing Toggle -->
      <div class="flex items-center justify-center gap-4 mb-10">
        <span class="text-sm font-medium" [class]="!isAnnual() ? 'text-white' : 'text-slate-500'">
          {{ 'pricing.monthly' | translate }}
        </span>
        <button
          (click)="toggleBilling()"
          class="relative w-14 h-7 rounded-full transition-colors duration-300"
          [class]="isAnnual() ? 'bg-emerald-500' : 'bg-slate-700'">
          <div
            class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300"
            [class]="isAnnual() ? 'translate-x-7' : 'translate-x-0.5'">
          </div>
        </button>
        <span class="text-sm font-medium" [class]="isAnnual() ? 'text-white' : 'text-slate-500'">
          {{ 'pricing.annual' | translate }}
        </span>
        @if (isAnnual()) {
          <span class="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
            {{ 'pricing.saveBadge' | translate }}
          </span>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      }

      <!-- Pricing Grid: 3 Tiers -->
      @if (!loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          @for (tier of allTiers(); track tier.id) {
            <div
              class="relative rounded-2xl border p-8 flex flex-col"
              [class]="tierCardClass(tier)">

              <!-- Badge -->
              @if (tier.badge) {
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-emerald-500 text-slate-900'
                    : 'bg-purple-500 text-white'">
                  {{ tier.badge }}
                </div>
              }

              @if (currentTier() === tier.id) {
                <div class="absolute -top-3 right-4 px-3 py-1 rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
                  {{ 'pricing.current' | translate }}
                </div>
              }

              <div class="mb-6">
                <h3 class="text-xl font-bold text-white mb-2">{{ tier.name }}</h3>
                <div class="flex items-baseline gap-1">
                  @if (tier.price === 0) {
                    <span class="text-4xl font-bold text-slate-300">{{ 'pricing.free' | translate }}</span>
                    <span class="text-sm text-slate-500">{{ 'pricing.forever' | translate }}</span>
                  } @else if (isAnnual() && tier.annualMonthlyPrice) {
                    <span class="text-4xl font-bold text-white">&euro;{{ tier.annualMonthlyPrice | number:'1.2-2' }}</span>
                    <span class="text-sm text-slate-500">{{ 'pricing.perMonth' | translate }}</span>
                    <span class="ml-2 text-sm text-slate-500 line-through">&euro;{{ tier.price }}</span>
                  } @else {
                    <span class="text-4xl font-bold text-white">&euro;{{ tier.price }}</span>
                    <span class="text-sm text-slate-500">{{ 'pricing.perMonth' | translate }}</span>
                  }
                </div>
                @if (isAnnual() && tier.annualPrice) {
                  <div class="text-xs text-slate-500 mt-1">
                    {{ 'pricing.billedAnnually' | translate }} &euro;{{ tier.annualPrice }}
                  </div>
                }
              </div>

              <ul class="space-y-3 mb-8 flex-1">
                @for (feature of tier.features; track feature) {
                  <li class="flex items-start gap-2 text-sm text-slate-300">
                    <svg class="w-5 h-5 flex-shrink-0 mt-0.5" [class]="tierCheckClass(tier)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ feature }}
                  </li>
                }
              </ul>

              @if (tier.id === 'FREE') {
                <a
                  routerLink="/session/new"
                  class="w-full py-3 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 text-center block hover:bg-slate-800 transition-all">
                  {{ 'pricing.getStartedFree' | translate }}
                </a>
              } @else if (currentTier() === tier.id && tierService.hasSubscription()) {
                <button
                  (click)="manageSubscription()"
                  class="w-full py-3 rounded-xl border text-sm font-semibold transition-all"
                  [class]="tier.id === 'STARTER'
                    ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-purple-500/50 text-purple-400 hover:bg-purple-500/10'">
                  {{ 'pricing.manageSubscription' | translate }}
                </button>
              } @else if (!auth.isAuthenticated()) {
                <a
                  routerLink="/register"
                  class="w-full py-3 rounded-xl text-sm font-bold text-center block shadow-lg transition-all"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40'">
                  {{ 'pricing.signUpToSubscribe' | translate }}
                </a>
              } @else {
                <button
                  (click)="checkout(tier.id)"
                  [disabled]="checkoutLoading()"
                  class="w-full py-3 rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40'">
                  @if (checkoutLoading()) {
                    {{ 'pricing.processing' | translate }}
                  } @else {
                    {{ tier.id === 'STARTER' ? ('pricing.subscribeStarter' | translate) : ('pricing.subscribePro' | translate) }}
                  }
                </button>
              }
            </div>
          }
        </div>
      }

      <!-- FAQ -->
      <div class="mt-16 max-w-2xl mx-auto">
        <h2 class="text-2xl font-bold text-white text-center mb-8">{{ 'pricing.faq' | translate }}</h2>
        <div class="space-y-4">
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqFreeTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqFreeDesc' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqStarterTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqStarterDesc' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqProTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqProDesc' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqCancelTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqCancelDesc' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqBillingTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqBillingDesc' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
            <h3 class="font-semibold text-white mb-2">{{ 'pricing.faqAnnualTitle' | translate }}</h3>
            <p class="text-sm text-slate-400">{{ 'pricing.faqAnnualDesc' | translate }}</p>
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
  readonly isAnnual = signal(false);
  readonly currentTier = this.tierService.tier;

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

  toggleBilling() {
    this.isAnnual.update(v => !v);
  }

  tierCardClass(tier: PricingTier): string {
    if (tier.id === 'STARTER') {
      return 'border-emerald-500 bg-gradient-to-b from-emerald-950/50 to-slate-900 shadow-lg shadow-emerald-500/10';
    }
    if (tier.id === 'ARENA_PRO') {
      return 'border-purple-500 bg-gradient-to-b from-purple-950/50 to-slate-900 shadow-lg shadow-purple-500/10';
    }
    return 'border-slate-800 bg-slate-900/80';
  }

  tierCheckClass(tier: PricingTier): string {
    if (tier.id === 'STARTER') return 'text-emerald-400';
    if (tier.id === 'ARENA_PRO') return 'text-purple-400';
    return 'text-slate-500';
  }

  checkout(tierId: string) {
    this.checkoutLoading.set(true);
    const billingInterval = this.isAnnual() ? 'year' : 'month';
    const successUrl = `${window.location.origin}/payment/success?tier=${tierId}`;
    const cancelUrl = `${window.location.origin}/pricing`;

    this.paymentApi.createCheckout(tierId, successUrl, cancelUrl, billingInterval).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: () => {
        this.checkoutLoading.set(false);
        alert('Failed to create checkout. Please try again.');
      }
    });
  }

  manageSubscription() {
    this.paymentApi.createPortalSession().subscribe({
      next: (res) => {
        window.location.href = res.portalUrl;
      },
      error: () => {
        alert('Failed to open billing portal. Please try again.');
      }
    });
  }
}
