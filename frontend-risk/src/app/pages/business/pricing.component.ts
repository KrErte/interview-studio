import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface PricingTier {
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
  employeeLimit: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-white py-16 px-4">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            Workforce Intelligence
            <span class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl mx-auto">
            Protect your workforce from disruption. Get AI-powered insights into skill gaps,
            automation risk, and upskilling ROI.
          </p>

          <!-- Annual/Monthly Toggle -->
          <div class="flex items-center justify-center gap-4 mt-8">
            <span class="text-slate-400" [class.text-white]="!isAnnual()">Monthly</span>
            <button
              (click)="toggleBilling()"
              class="relative w-14 h-7 bg-slate-700 rounded-full transition-colors"
              [class.bg-emerald-600]="isAnnual()">
              <div
                class="absolute top-1 w-5 h-5 bg-white rounded-full transition-transform"
                [class.left-1]="!isAnnual()"
                [class.left-8]="isAnnual()">
              </div>
            </button>
            <span class="text-slate-400" [class.text-white]="isAnnual()">
              Annual
              <span class="text-emerald-400 text-sm ml-1">Save 20%</span>
            </span>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div class="grid md:grid-cols-3 gap-8 mb-16">
          @for (tier of pricingTiers(); track tier.name) {
            <div
              class="rounded-2xl p-8 transition-all"
              [class]="tier.highlighted
                ? 'bg-gradient-to-b from-emerald-900/50 to-slate-900 border-2 border-emerald-500 scale-105'
                : 'bg-slate-900 border border-slate-800'">

              @if (tier.highlighted) {
                <div class="text-center mb-4">
                  <span class="px-3 py-1 bg-emerald-500 text-slate-900 text-sm font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              }

              <h3 class="text-2xl font-bold mb-2">{{ tier.name }}</h3>
              <p class="text-slate-400 text-sm mb-4">{{ tier.description }}</p>

              <div class="mb-6">
                <span class="text-4xl font-bold">
                  \${{ getDisplayPrice(tier) }}
                </span>
                <span class="text-slate-400">/{{ isAnnual() ? 'year' : 'month' }}</span>
                <div class="text-sm text-slate-500 mt-1">{{ tier.employeeLimit }}</div>
              </div>

              <button
                class="w-full py-3 rounded-lg font-semibold mb-6 transition-colors"
                [class]="tier.highlighted
                  ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                  : 'bg-slate-800 text-white hover:bg-slate-700'">
                {{ tier.cta }}
              </button>

              <ul class="space-y-3">
                @for (feature of tier.features; track feature) {
                  <li class="flex items-start gap-2 text-sm">
                    <svg class="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span class="text-slate-300">{{ feature }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Enterprise Section -->
        <div class="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-500/30 rounded-2xl p-8 md:p-12">
          <div class="flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="flex-1">
              <h2 class="text-3xl font-bold mb-4">Enterprise</h2>
              <p class="text-slate-300 mb-4">
                For organizations with 500+ employees. Custom pricing, dedicated support,
                and advanced integrations.
              </p>
              <ul class="grid md:grid-cols-2 gap-2 text-sm text-slate-400">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> Unlimited employees
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> HRIS/ATS integrations
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> Custom AI models
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> Dedicated success manager
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> SSO & advanced security
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span> SLA guarantees
                </li>
              </ul>
            </div>
            <div class="text-center md:text-right">
              <div class="text-sm text-slate-400 mb-2">Starting at</div>
              <div class="text-4xl font-bold mb-4">\$15,000<span class="text-lg text-slate-400">/year</span></div>
              <button class="px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mt-16">
          <h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            @for (faq of faqs(); track faq.question) {
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 class="font-semibold mb-2">{{ faq.question }}</h3>
                <p class="text-slate-400 text-sm">{{ faq.answer }}</p>
              </div>
            }
          </div>
        </div>

        <!-- CTA Section -->
        <div class="mt-16 text-center">
          <h2 class="text-2xl font-bold mb-4">Ready to future-proof your workforce?</h2>
          <p class="text-slate-400 mb-6">Start with a free trial. No credit card required.</p>
          <div class="flex justify-center gap-4">
            <button class="px-8 py-3 bg-emerald-500 text-slate-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors">
              Start Free Trial
            </button>
            <button class="px-8 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PricingComponent {
  isAnnual = signal(true);

  pricingTiers = signal<PricingTier[]>([
    {
      name: 'Starter',
      price: 299,
      period: 'month',
      description: 'Perfect for small teams getting started with workforce intelligence.',
      employeeLimit: 'Up to 50 employees',
      highlighted: false,
      cta: 'Start Free Trial',
      features: [
        'Individual skill assessments',
        'Basic risk scoring',
        'Skill gap identification',
        'Monthly reports',
        'Email support',
        '5 manager accounts'
      ]
    },
    {
      name: 'Business',
      price: 799,
      period: 'month',
      description: 'Advanced analytics and AI-powered recommendations.',
      employeeLimit: 'Up to 200 employees',
      highlighted: true,
      cta: 'Start Free Trial',
      features: [
        'Everything in Starter',
        'AI-powered career coaching',
        'Department-level analytics',
        'Upskilling ROI tracking',
        'Custom training plans',
        'API access',
        'Priority support',
        'Unlimited managers'
      ]
    },
    {
      name: 'Scale',
      price: 1999,
      period: 'month',
      description: 'For growing organizations with complex needs.',
      employeeLimit: 'Up to 500 employees',
      highlighted: false,
      cta: 'Start Free Trial',
      features: [
        'Everything in Business',
        'Advanced AI simulations',
        'Industry benchmarking',
        'Workforce planning tools',
        'Custom integrations',
        'Dedicated account manager',
        'Training workshops',
        'Quarterly strategy reviews'
      ]
    }
  ]);

  faqs = signal([
    {
      question: 'How does the risk scoring work?',
      answer: 'Our AI analyzes skills against market trends, automation potential, and industry shifts to generate a disruption risk score from 0-100.'
    },
    {
      question: 'Can employees see their own data?',
      answer: 'Yes! Employees get their own portal with assessments, personalized recommendations, and career development tools.'
    },
    {
      question: 'How long does onboarding take?',
      answer: 'Most teams are fully onboarded within 1-2 weeks. We handle data import and provide training for your HR team.'
    },
    {
      question: 'What integrations are available?',
      answer: 'We integrate with major HRIS systems (Workday, BambooHR, etc.), learning platforms, and provide a REST API for custom integrations.'
    },
    {
      question: 'Is my employee data secure?',
      answer: 'Yes. We are SOC 2 Type II certified, use encryption at rest and in transit, and never share individual employee data.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Annual plans are billed upfront but can be cancelled with prorated refunds.'
    }
  ]);

  toggleBilling() {
    this.isAnnual.update(v => !v);
  }

  getDisplayPrice(tier: PricingTier): number {
    if (this.isAnnual()) {
      return Math.round(tier.price * 12 * 0.8); // 20% discount
    }
    return tier.price;
  }
}
