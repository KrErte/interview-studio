import { Injectable, signal, computed } from '@angular/core';

export type UserTier = 'free' | 'pro';

export interface UserProfile {
  email: string | null;
  tier: UserTier;
  assessmentCount: number;
  subscribedAt: Date | null;
}

const STORAGE_KEY = 'userProfile';
const MAX_FREE_ASSESSMENTS = 1;

@Injectable({
  providedIn: 'root'
})
export class UserTierService {
  private profile = signal<UserProfile>(this.loadProfile());

  // Computed values
  readonly tier = computed(() => this.profile().tier);
  readonly email = computed(() => this.profile().email);
  readonly isPro = computed(() => this.profile().tier === 'pro');
  readonly isFree = computed(() => this.profile().tier === 'free');
  readonly assessmentCount = computed(() => this.profile().assessmentCount);
  readonly canDoAssessment = computed(() =>
    this.isPro() || this.profile().assessmentCount < MAX_FREE_ASSESSMENTS
  );
  readonly hasEmail = computed(() => !!this.profile().email);

  // Features available per tier
  readonly features = computed(() => ({
    overview: true, // Always available
    detailedAnalysis: this.isPro(),
    roadmap: this.isPro(),
    whatIf: this.isPro(),
    marketPulse: this.isPro(),
    skillDecay: this.isPro(),
    threatRadar: this.isPro(),
    skillMatrix: this.isPro(),
    careerVitals: this.isPro(),
    aiTimeline: this.isPro(),
    caseStudies: this.isPro(),
    tegevusplaan: this.isPro(),
    pdfExport: this.isPro(),
    emailReports: this.isPro(),
    twelvemonthPlan: this.isPro(),
  }));

  private loadProfile(): UserProfile {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          subscribedAt: parsed.subscribedAt ? new Date(parsed.subscribedAt) : null
        };
      } catch {
        // Invalid data, return default
      }
    }
    return {
      email: null,
      tier: 'free',
      assessmentCount: 0,
      subscribedAt: null
    };
  }

  private saveProfile(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile()));
  }

  setEmail(email: string): void {
    this.profile.update(p => ({ ...p, email }));
    this.saveProfile();
  }

  incrementAssessmentCount(): void {
    this.profile.update(p => ({ ...p, assessmentCount: p.assessmentCount + 1 }));
    this.saveProfile();
  }

  upgradeToPro(): void {
    this.profile.update(p => ({
      ...p,
      tier: 'pro',
      subscribedAt: new Date()
    }));
    this.saveProfile();
  }

  // For testing/demo purposes
  resetToFree(): void {
    this.profile.update(p => ({
      ...p,
      tier: 'free',
      subscribedAt: null
    }));
    this.saveProfile();
  }

  // Check if a specific feature is available
  canAccess(feature: keyof ReturnType<typeof this.features>): boolean {
    return this.features()[feature];
  }
}
