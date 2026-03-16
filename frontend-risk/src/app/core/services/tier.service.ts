import { Injectable, signal, computed } from '@angular/core';

export type UserTier = 'FREE' | 'ARENA_PRO';

const TIER_ORDER: UserTier[] = ['FREE', 'ARENA_PRO'];

export interface TierFeatures {
  fullAssessmentTabs: boolean;
  actionPlan: boolean;
  arenaTools: boolean;
  roadmap: boolean;
  jobAnalyzerUnlimited: boolean;
  interviewSimulator: boolean;
  salaryCoach: boolean;
  cvOptimizer: boolean;
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
    const isPro = this._tier() === 'ARENA_PRO';
    return {
      fullAssessmentTabs: isPro,
      actionPlan: isPro,
      arenaTools: isPro,
      roadmap: isPro,
      jobAnalyzerUnlimited: isPro,
      interviewSimulator: isPro,
      salaryCoach: isPro,
      cvOptimizer: isPro
    };
  });

  readonly canAccessFullAssessment = computed(() => this.features().fullAssessmentTabs);
  readonly canAccessArena = computed(() => this.features().arenaTools);
  readonly canAccessRoadmap = computed(() => this.features().roadmap);
  readonly canAccessUnlimitedAnalyzer = computed(() => this.features().jobAnalyzerUnlimited);

  readonly isFree = computed(() => this._tier() === 'FREE');
  readonly isPro = computed(() => this._tier() === 'ARENA_PRO');

  setTier(tier: UserTier | string): void {
    const normalized = (tier || 'FREE').toUpperCase() as UserTier;
    if (TIER_ORDER.includes(normalized)) {
      this._tier.set(normalized);
    } else {
      // Map old tiers to new ones
      if (['ESSENTIALS', 'PROFESSIONAL', 'LIFETIME'].includes(normalized)) {
        this._tier.set('ARENA_PRO');
      } else {
        this._tier.set('FREE');
      }
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
