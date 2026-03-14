import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p class="text-slate-500 text-sm mb-10">Last updated: March 14, 2026</p>

      <div class="space-y-8 text-slate-300 leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using CareerRisk Index ("the Service"), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use the Service.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
          <p>
            CareerRisk Index provides AI-powered career risk assessments, personalized action plans,
            and interactive training tools. The Service is available in free and paid tiers.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
          <ul class="list-disc list-inside space-y-2 text-slate-400">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must be at least 16 years old to use the Service</li>
            <li>One account per person; no shared or automated accounts</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">4. Payments & Refunds</h2>
          <p>
            Paid features are available as one-time purchases or subscriptions.
            All prices are displayed in EUR and include applicable taxes.
            Refund requests can be submitted within 14 days of purchase if you are unsatisfied with the service.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
          <p>
            All content, algorithms, and designs on CareerRisk Index are owned by us.
            Your assessment results and uploaded data remain your property.
            You may share your results but may not reproduce our proprietary analysis methodology.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">6. Disclaimer</h2>
          <p>
            CareerRisk Index provides informational assessments based on market data and AI analysis.
            Our assessments are not professional career advice and should not be treated as such.
            We do not guarantee employment outcomes based on our recommendations.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, CareerRisk Index shall not be liable for any indirect,
            incidental, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the Republic of Estonia.
            Any disputes shall be resolved in the courts of Tallinn, Estonia.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-white mb-3">9. Contact</h2>
          <p>
            Questions about these terms? Contact us at:
            <a href="mailto:info&#64;careerisk.ee" class="text-emerald-400 hover:underline">info&#64;careerisk.ee</a>
          </p>
        </section>
      </div>
    </div>
  `
})
export class TermsComponent {}
