import { Injectable, signal, computed } from '@angular/core';

export type PlanType = 'free' | 'report' | 'pro';
export type PaywallVariant = 'soft' | 'hard' | 'report';

export interface PricingPlan {
  id: PlanType;
  name: string;
  nameEt: string;
  price: number;
  period: 'once' | 'month' | 'year';
  features: string[];
  featuresEt: string[];
  cta: string;
  ctaEt: string;
  popular?: boolean;
}

export interface FeatureAccess {
  autopsy: { preview: boolean; full: boolean };
  recruiterView: { preview: boolean; full: boolean };
  confidenceDelta: { preview: boolean; full: boolean };
  actionPlan: { preview: boolean; full: boolean };
  interviewSim: { basic: boolean; advanced: boolean };
  salaryIntel: { preview: boolean; full: boolean };
}

@Injectable({ providedIn: 'root' })
export class PaywallService {
  // Current user plan
  currentPlan = signal<PlanType>('free');

  // Feature flags for A/B testing paywall variants
  paywallVariant = signal<PaywallVariant>('soft');

  // Pricing configuration (EUR)
  readonly pricing: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free Preview',
      nameEt: 'Tasuta Eelvaade',
      price: 0,
      period: 'once',
      features: [
        'Basic skill assessment',
        'Preview of failure points',
        'Limited recruiter view',
        '1 interview simulation'
      ],
      featuresEt: [
        'Põhiline oskuste hindamine',
        'Nõrkade kohtade eelvaade',
        'Piiratud värbaja vaade',
        '1 intervjuu simulatsioon'
      ],
      cta: 'Start Free',
      ctaEt: 'Alusta Tasuta'
    },
    {
      id: 'report',
      name: 'Interview Readiness Report',
      nameEt: 'Intervjuuvalmiduse Raport',
      price: 14.99,
      period: 'once',
      features: [
        'Full Interview Failure Autopsy',
        'Complete Recruiter Mirror View',
        'Confidence vs Reality Analysis',
        '72-Hour Action Plan',
        'Salary negotiation intel',
        'PDF export',
        'Valid for 30 days'
      ],
      featuresEt: [
        'Täielik Intervjuu Läbikukkumise Analüüs',
        'Täielik Värbaja Peegeldus',
        'Enesekindlus vs Reaalsus Analüüs',
        '72-Tunnine Tegevusplaan',
        'Palgaläbirääkimiste info',
        'PDF eksport',
        'Kehtib 30 päeva'
      ],
      cta: 'Get My Report — €14.99',
      ctaEt: 'Saa Oma Raport — €14.99',
      popular: true
    },
    {
      id: 'pro',
      name: 'Active Interview Mode',
      nameEt: 'Aktiivne Intervjuurežiim',
      price: 9.99,
      period: 'month',
      features: [
        'Everything in Report',
        'Unlimited interview simulations',
        'Real-time market salary data',
        'Weekly skill gap updates',
        'Priority support',
        'Cancel anytime'
      ],
      featuresEt: [
        'Kõik mis Raportis',
        'Piiramatud intervjuu simulatsioonid',
        'Reaalajas turuhinna andmed',
        'Iganädalased oskuslünga uuendused',
        'Prioriteetne tugi',
        'Tühista igal ajal'
      ],
      cta: 'Start Pro — €9.99/mo',
      ctaEt: 'Alusta Pro — €9.99/kuu'
    }
  ];

  // Computed access based on plan
  featureAccess = computed<FeatureAccess>(() => {
    const plan = this.currentPlan();

    if (plan === 'pro') {
      return {
        autopsy: { preview: true, full: true },
        recruiterView: { preview: true, full: true },
        confidenceDelta: { preview: true, full: true },
        actionPlan: { preview: true, full: true },
        interviewSim: { basic: true, advanced: true },
        salaryIntel: { preview: true, full: true }
      };
    }

    if (plan === 'report') {
      return {
        autopsy: { preview: true, full: true },
        recruiterView: { preview: true, full: true },
        confidenceDelta: { preview: true, full: true },
        actionPlan: { preview: true, full: true },
        interviewSim: { basic: true, advanced: false },
        salaryIntel: { preview: true, full: true }
      };
    }

    // Free tier
    return {
      autopsy: { preview: true, full: false },
      recruiterView: { preview: true, full: false },
      confidenceDelta: { preview: true, full: false },
      actionPlan: { preview: true, full: false },
      interviewSim: { basic: true, advanced: false },
      salaryIntel: { preview: true, full: false }
    };
  });

  canAccess(feature: keyof FeatureAccess, level: 'preview' | 'full' | 'basic' | 'advanced'): boolean {
    const access = this.featureAccess()[feature];
    return (access as any)[level] ?? false;
  }

  getPlan(id: PlanType): PricingPlan | undefined {
    return this.pricing.find(p => p.id === id);
  }

  // Mock purchase - replace with real Stripe later
  async purchasePlan(planId: PlanType): Promise<boolean> {
    console.log(`[MOCK] Purchasing plan: ${planId}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.currentPlan.set(planId);
    localStorage.setItem('userPlan', planId);
    return true;
  }

  // Initialize from storage
  initFromStorage(): void {
    const stored = localStorage.getItem('userPlan') as PlanType;
    if (stored && ['free', 'report', 'pro'].includes(stored)) {
      this.currentPlan.set(stored);
    }
  }
}
