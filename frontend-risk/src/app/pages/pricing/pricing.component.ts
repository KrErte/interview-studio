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
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-black text-stone-900 mb-4">
          {{ 'pricing.title' | translate }}
        </h1>
        <p class="text-lg text-stone-500 max-w-2xl mx-auto">
          {{ 'pricing.subtitle' | translate }}
        </p>
      </div>

      <!-- Social Proof Bar -->
      <div class="flex flex-wrap items-center justify-center gap-6 mb-10 py-4 px-6 bg-stone-100 border border-stone-200">
        <div class="flex items-center gap-2 text-sm">
          <span class="text-red-600 font-bold">2,500+</span>
          <span class="text-stone-500">professionals</span>
        </div>
        <div class="w-px h-4 bg-stone-300 hidden sm:block"></div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-amber-500">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
          <span class="text-stone-500">4.8/5 rating</span>
        </div>
        <div class="w-px h-4 bg-stone-300 hidden sm:block"></div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-stone-900 font-bold">40+</span>
          <span class="text-stone-500">countries</span>
        </div>
      </div>

      <!-- Billing Toggle -->
      <div class="flex items-center justify-center gap-4 mb-10">
        <span class="text-sm font-medium" [class]="!isAnnual() ? 'text-stone-900' : 'text-stone-400'">
          {{ 'pricing.monthly' | translate }}
        </span>
        <button
          (click)="toggleBilling()"
          class="relative w-14 h-7 transition-colors duration-300"
          [class]="isAnnual() ? 'bg-stone-900' : 'bg-stone-300'">
          <div
            class="absolute top-0.5 w-6 h-6 bg-white shadow transition-transform duration-300"
            [class]="isAnnual() ? 'translate-x-7' : 'translate-x-0.5'">
          </div>
        </button>
        <span class="text-sm font-medium" [class]="isAnnual() ? 'text-stone-900' : 'text-stone-400'">
          {{ 'pricing.annual' | translate }}
        </span>
        @if (isAnnual()) {
          <span class="px-2.5 py-1 bg-red-600 text-white text-xs font-bold">
            {{ 'pricing.saveBadge' | translate }}
          </span>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <div class="w-10 h-10 border-4 border-stone-200 border-t-stone-900 animate-spin"></div>
        </div>
      }

      <!-- Pricing Grid: 3 Tiers -->
      @if (!loading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          @for (tier of allTiers(); track tier.id) {
            <div
              class="relative border p-8 flex flex-col"
              [class]="tierCardClass(tier)">

              <!-- Badge -->
              @if (tier.badge) {
                <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-stone-900 text-white'
                    : 'bg-red-600 text-white'">
                  {{ tier.badge }}
                </div>
              }

              @if (currentTier() === tier.id) {
                <div class="absolute -top-3 right-4 px-3 py-1 bg-stone-200 text-xs font-semibold text-stone-700">
                  {{ 'pricing.current' | translate }}
                </div>
              }

              <div class="mb-6">
                <h3 class="text-xl font-bold text-stone-900 mb-1">{{ tier.name }}</h3>
                <div class="text-xs text-stone-400 mb-2">{{ tier.features.length }} features included</div>
                <div class="flex items-baseline gap-1">
                  @if (tier.price === 0) {
                    <span class="text-4xl font-bold text-stone-400">{{ 'pricing.free' | translate }}</span>
                    <span class="text-sm text-stone-400">{{ 'pricing.forever' | translate }}</span>
                  } @else if (isAnnual() && tier.annualMonthlyPrice) {
                    <span class="text-4xl font-bold text-stone-900">&euro;{{ tier.annualMonthlyPrice | number:'1.2-2' }}</span>
                    <span class="text-sm text-stone-500">{{ 'pricing.perMonth' | translate }}</span>
                    <span class="ml-2 text-sm text-stone-400 line-through">&euro;{{ tier.price }}</span>
                  } @else {
                    <span class="text-4xl font-bold text-stone-900">&euro;{{ tier.price }}</span>
                    <span class="text-sm text-stone-500">{{ 'pricing.perMonth' | translate }}</span>
                  }
                </div>
                @if (isAnnual() && tier.annualPrice) {
                  <div class="text-xs text-stone-400 mt-1">
                    {{ 'pricing.billedAnnually' | translate }} &euro;{{ tier.annualPrice }}
                  </div>
                }
              </div>

              <!-- Pro tier gets category headers -->
              @if (tier.id === 'ARENA_PRO') {
                <div class="space-y-4 mb-8 flex-1">
                  <ul class="space-y-2">
                    @for (feature of getProBaseFeatures(tier); track feature) {
                      <li class="flex items-start gap-2 text-sm text-stone-600">
                        <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {{ feature }}
                      </li>
                    }
                  </ul>

                  <div>
                    <div class="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 mt-3">AI Tools</div>
                    <ul class="space-y-2">
                      @for (feature of getProAiFeatures(tier); track feature) {
                        <li class="flex items-start gap-2 text-sm text-stone-600">
                          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          @if (isNewFeature(feature)) {
                            <span class="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white mr-1">NEW</span>
                          }
                          {{ stripNewPrefix(feature) }}
                        </li>
                      }
                    </ul>
                  </div>

                  <div>
                    <div class="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 mt-3">Analytics & Unlimited</div>
                    <ul class="space-y-2">
                      @for (feature of getProExtraFeatures(tier); track feature) {
                        <li class="flex items-start gap-2 text-sm text-stone-600">
                          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {{ feature }}
                        </li>
                      }
                    </ul>
                  </div>
                </div>
              } @else {
                <ul class="space-y-3 mb-8 flex-1">
                  @for (feature of tier.features; track feature) {
                    <li class="flex items-start gap-2 text-sm text-stone-600">
                      <svg class="w-5 h-5 flex-shrink-0 mt-0.5" [class]="tierCheckClass(tier)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {{ feature }}
                    </li>
                  }
                </ul>
              }

              @if (tier.id === 'FREE') {
                <a
                  routerLink="/session/new"
                  class="w-full py-3 border border-stone-300 text-sm font-semibold text-stone-600 text-center block hover:border-stone-900 hover:text-stone-900 transition-all">
                  {{ 'pricing.getStartedFree' | translate }}
                </a>
              } @else if (currentTier() === tier.id && tierService.hasSubscription()) {
                <button
                  (click)="manageSubscription()"
                  class="w-full py-3 border text-sm font-semibold transition-all border-stone-300 text-stone-600 hover:border-stone-900 hover:text-stone-900">
                  {{ 'pricing.manageSubscription' | translate }}
                </button>
              } @else if (!auth.isAuthenticated()) {
                <a
                  routerLink="/register"
                  class="w-full py-3 text-sm font-bold text-center block transition-all"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-red-600 text-white hover:bg-red-700'">
                  {{ 'pricing.signUpToSubscribe' | translate }}
                </a>
              } @else {
                <button
                  (click)="checkout(tier.id)"
                  [disabled]="checkoutLoading()"
                  class="w-full py-3 text-sm font-bold transition-all disabled:opacity-50"
                  [class]="tier.id === 'STARTER'
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-red-600 text-white hover:bg-red-700'">
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

      <!-- Checkout stub banner -->
      @if (checkoutError === 'payments_coming_soon') {
        <div class="mt-6 max-w-xl mx-auto border border-amber-300 bg-amber-50 px-5 py-4 text-center">
          <p class="text-sm font-semibold text-amber-800 mb-1">Maksed on varsti saadaval</p>
          <p class="text-xs text-stone-500">Stripe integratsioon on seadistamisel. Saadame sulle e-kirja, kui tellimused avanevad.</p>
          <button (click)="checkoutError = ''" class="mt-3 text-xs text-stone-400 hover:text-stone-900 underline">Sulge</button>
        </div>
      }

      <!-- FAQ -->
      <div class="mt-16 max-w-2xl mx-auto">
        <h2 class="text-2xl font-black text-stone-900 text-center mb-8">{{ 'pricing.faq' | translate }}</h2>
        <div class="space-y-4">
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqFreeTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqFreeDesc' | translate }}</p>
          </div>
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqStarterTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqStarterDesc' | translate }}</p>
          </div>
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqProTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqProDesc' | translate }}</p>
          </div>
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqCancelTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqCancelDesc' | translate }}</p>
          </div>
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqBillingTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqBillingDesc' | translate }}</p>
          </div>
          <div class="border border-stone-200 bg-white p-5">
            <h3 class="font-semibold text-stone-900 mb-2">{{ 'pricing.faqAnnualTitle' | translate }}</h3>
            <p class="text-sm text-stone-500">{{ 'pricing.faqAnnualDesc' | translate }}</p>
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
      return 'border-stone-900 bg-white shadow-lg';
    }
    if (tier.id === 'ARENA_PRO') {
      return 'border-red-600 bg-white shadow-lg';
    }
    return 'border-stone-200 bg-white';
  }

  tierCheckClass(tier: PricingTier): string {
    if (tier.id === 'STARTER') return 'text-stone-900';
    if (tier.id === 'ARENA_PRO') return 'text-red-600';
    return 'text-stone-400';
  }

  isNewFeature(feature: string): boolean {
    return feature.startsWith('NEW:');
  }

  stripNewPrefix(feature: string): string {
    return feature.startsWith('NEW:') ? feature.substring(4) : feature;
  }

  getProBaseFeatures(tier: PricingTier): string[] {
    return tier.features.filter(f => f === 'Everything in Starter');
  }

  getProAiFeatures(tier: PricingTier): string[] {
    const aiKeywords = ['Interview Simulator', 'Salary Negotiation', 'CV/LinkedIn', 'Career Mentor', 'Company-Specific', 'LinkedIn Summary', 'Cover Letter', 'Salary Benchmark'];
    return tier.features.filter(f => aiKeywords.some(k => f.includes(k)));
  }

  getProExtraFeatures(tier: PricingTier): string[] {
    const base = this.getProBaseFeatures(tier);
    const ai = this.getProAiFeatures(tier);
    return tier.features.filter(f => !base.includes(f) && !ai.includes(f));
  }

  checkoutError = '';

  checkout(tierId: string) {
    this.checkoutLoading.set(true);
    this.checkoutError = '';
    const billingInterval = this.isAnnual() ? 'year' : 'month';
    const successUrl = `${window.location.origin}/payment/success?tier=${tierId}`;
    const cancelUrl = `${window.location.origin}/pricing`;

    this.paymentApi.createCheckout(tierId, successUrl, cancelUrl, billingInterval).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: () => {
        this.checkoutLoading.set(false);
        this.checkoutError = 'payments_coming_soon';
      }
    });
  }

  manageSubscription() {
    this.paymentApi.createPortalSession().subscribe({
      next: (res) => {
        window.location.href = res.portalUrl;
      },
      error: () => {
        this.checkoutError = 'payments_coming_soon';
      }
    });
  }
}
