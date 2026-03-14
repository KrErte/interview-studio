import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ApiClient } from '../api/api-client.service';
import { TokenStorageService } from './token-storage.service';
import { TierService } from '../services/tier.service';
import { PaymentApiService } from '../services/payment-api.service';

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  tier?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject: BehaviorSubject<string | null>;
  private readonly tierService = inject(TierService);
  private readonly paymentApi = inject(PaymentApiService);

  readonly token$;

  constructor(private api: ApiClient, private tokenStorage: TokenStorageService) {
    const initialToken = this.tokenStorage.getToken();
    this.tokenSubject = new BehaviorSubject<string | null>(initialToken);
    this.token$ = this.tokenSubject.asObservable();

    // On startup, decode tier from existing JWT if present
    if (initialToken) {
      this.decodeTierFromToken(initialToken);
      this.syncSubscriptionInfo();
    }
  }

  login(email: string, password: string) {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        this.persist(res);
        this.syncSubscriptionInfo();
      }),
      map(() => void 0)
    );
  }

  register(email: string, password: string, fullName?: string) {
    return this.api.post<AuthResponse>('/auth/register', { email, password, fullName: fullName || 'User' }).pipe(
      tap((res) => {
        this.persist(res);
        this.syncSubscriptionInfo();
      }),
      map(() => void 0)
    );
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  logout(): void {
    this.tokenStorage.clear();
    this.tokenSubject.next(null);
    this.tierService.reset();
  }

  refreshTier(): void {
    const token = this.tokenSubject.value;
    if (token) {
      this.decodeTierFromToken(token);
    }
  }

  syncSubscriptionInfo(): void {
    if (!this.isAuthenticated()) return;
    this.paymentApi.getCurrentTier().subscribe({
      next: (res) => {
        if (res.tier) {
          this.tierService.setTier(res.tier);
        }
        this.tierService.setSubscription(
          res.hasActiveSubscription ?? false,
          res.subscriptionStatus ?? null,
          res.subscriptionEndsAt ?? null
        );
      },
      error: () => { /* silently ignore */ }
    });
  }

  private persist(res: AuthResponse): void {
    const token = res?.accessToken ?? res?.token ?? '';
    if (token) {
      this.tokenStorage.setToken(token);
      this.tokenSubject.next(token);
    }
    if (res?.tier) {
      this.tierService.setTier(res.tier);
    } else if (token) {
      this.decodeTierFromToken(token);
    }
  }

  private decodeTierFromToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.tier) {
        this.tierService.setTier(payload.tier);
      }
    } catch {
      // Invalid token, ignore
    }
  }
}
