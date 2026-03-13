import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  current: boolean;
  popular: boolean;
}

export interface TierResponse {
  tier: string;
  purchasedAt: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getTiers(): Observable<PricingTier[]> {
    return this.http.get<PricingTier[]>(`${this.baseUrl}/pricing`);
  }

  getCurrentTier(): Observable<TierResponse> {
    return this.http.get<TierResponse>(`${this.baseUrl}/payment/tier`);
  }

  createCheckout(tier: string, successUrl: string, cancelUrl: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.baseUrl}/payment/checkout`, {
      tier,
      successUrl,
      cancelUrl
    });
  }
}
