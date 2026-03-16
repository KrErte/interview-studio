import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client.service';

export interface CheckoutResponse {
  checkoutUrl: string;
}

export interface PortalResponse {
  portalUrl: string;
}

export interface TierResponse {
  tier: string;
  purchasedAt: string | null;
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionEndsAt: string | null;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  current: boolean;
  popular: boolean;
  subscription: boolean;
  billingInterval: string | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  constructor(private api: ApiClient) {}

  createCheckout(tier: string, successUrl: string, cancelUrl: string): Observable<CheckoutResponse> {
    return this.api.post<CheckoutResponse>('/payment/checkout', {
      tier,
      successUrl,
      cancelUrl
    });
  }

  createPortalSession(): Observable<PortalResponse> {
    return this.api.post<PortalResponse>('/payment/portal', {});
  }

  getCurrentTier(): Observable<TierResponse> {
    return this.api.get<TierResponse>('/payment/tier');
  }

  getPricing(): Observable<PricingTier[]> {
    return this.api.get<PricingTier[]>('/pricing');
  }
}
