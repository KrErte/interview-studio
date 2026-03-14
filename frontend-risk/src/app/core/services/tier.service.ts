import { Injectable, signal, computed } from '@angular/core';

export type UserTier = 'FREE' | 'ESSENTIALS' | 'PROFESSIONAL' | 'LIFETIME';

const TIER_ORDER: UserTier[] = ['FREE', 'ESSENTIALS', 'PROFESSIONAL', 'LIFETIME'];

export interface TierFeatures {
  fullAssessmentTabs: boolean;
  actionPlan: boolean;
  arenaTools: boolean;
  roadmap: boolean;
  jobAnalyzerUnlimited: boolean;
}

@Injectable({ providedIn: 'root' })
export class TierService {
  private readonly _tier = signal<UserTier>('FREE');
  private readonly _hasSubscription = signal(false);
  private readonly _subscriptionStatus = signal<string | null>(null);
  private readonly _subscriptionEndsAt = signal<string | null>(null);

  readonly tier = this._tier.asReadonly();
  readonly hasSubscription = this._hasSubscription.asReadonly();
  readonly subscriptionStatus = this._subscriptionStatus.asReadonly();
  readonly subscriptionEndsAt = this._subscriptionEndsAt.asReadonly();

  readonly features = computed<TierFeatures>(() => {
    const t = this._tier();
    const idx = TIER_ORDER.indexOf(t);
    return {
      fullAssessmentTabs: idx >= 1,   // ESSENTIALS+
      actionPlan: idx >= 1,           // ESSENTIALS+
      arenaTools: idx >= 2,           // PROFESSIONAL+
      roadmap: idx >= 2,              // PROFESSIONAL+
      jobAnalyzerUnlimited: idx >= 2  // PROFESSIONAL+
    };
  });

  readonly canAccessFullAssessment = computed(() => this.features().fullAssessmentTabs);
  readonly canAccessArena = computed(() => this.features().arenaTools);
  readonly canAccessRoadmap = computed(() => this.features().roadmap);
  readonly canAccessUnlimitedAnalyzer = computed(() => this.features().jobAnalyzerUnlimited);

  readonly isFree = computed(() => this._tier() === 'FREE');
  readonly isEssentials = computed(() => TIER_ORDER.indexOf(this._tier()) >= 1);
  readonly isProfessional = computed(() => TIER_ORDER.indexOf(this._tier()) >= 2);
  readonly isLifetime = computed(() => this._tier() === 'LIFETIME');

  setTier(tier: UserTier | string): void {
    const normalized = (tier || 'FREE').toUpperCase() as UserTier;
    if (TIER_ORDER.includes(normalized)) {
      this._tier.set(normalized);
    } else {
      this._tier.set('FREE');
    }
  }

  setSubscription(hasSubscription: boolean, status: string | null, endsAt: string | null): void {
    this._hasSubscription.set(hasSubscription);
    this._subscriptionStatus.set(status);
    this._subscriptionEndsAt.set(endsAt);
  }

  isAtLeast(required: UserTier): boolean {
    return TIER_ORDER.indexOf(this._tier()) >= TIER_ORDER.indexOf(required);
  }

  reset(): void {
    this._tier.set('FREE');
    this._hasSubscription.set(false);
    this._subscriptionStatus.set(null);
    this._subscriptionEndsAt.set(null);
  }
}
