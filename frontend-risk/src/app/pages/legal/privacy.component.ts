import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-16">
      <h1 class="text-3xl font-black text-stone-900 mb-2">Privacy Policy</h1>
      <p class="text-stone-400 text-sm mb-10">Last updated: March 14, 2026</p>

      <div class="space-y-8 text-stone-600 leading-relaxed">
        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">1. Introduction</h2>
          <p>
            CareerRisk Index ("we", "our", "us") respects your privacy and is committed to protecting your personal data.
            This policy explains how we collect, use, and protect your information when you use our platform at careerisk.ee.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">2. Data We Collect</h2>
          <ul class="list-disc list-inside space-y-2 text-stone-500">
            <li><span class="text-stone-700">Account data:</span> email address, name (when you register)</li>
            <li><span class="text-stone-700">Assessment data:</span> target role, experience level, challenges, CV text (when provided)</li>
            <li><span class="text-stone-700">Usage data:</span> pages visited, features used, session duration</li>
            <li><span class="text-stone-700">Payment data:</span> processed securely by our payment provider (we do not store card details)</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">3. How We Use Your Data</h2>
          <ul class="list-disc list-inside space-y-2 text-stone-500">
            <li>To generate your personalized career risk assessment</li>
            <li>To save your session history (authenticated users only)</li>
            <li>To improve our assessment algorithms and user experience</li>
            <li>To send important account-related notifications</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">4. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your personal data with third parties for marketing purposes.
            We may share data with service providers (hosting, payment processing) who assist in operating our platform,
            under strict data protection agreements.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">5. Data Retention</h2>
          <p>
            Guest session data is stored locally in your browser and is not retained on our servers.
            Authenticated user data is retained as long as your account is active.
            You can request deletion of your data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">6. Your Rights (GDPR)</h2>
          <p class="mb-2">Under the General Data Protection Regulation, you have the right to:</p>
          <ul class="list-disc list-inside space-y-2 text-stone-500">
            <li>Access the personal data we hold about you</li>
            <li>Rectify inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing of your data</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management.
            We use analytics cookies to understand how our platform is used.
            You can disable non-essential cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-stone-900 mb-3">8. Contact</h2>
          <p>
            For privacy-related questions or data requests, contact us at:
            <a href="mailto:privacy&#64;careerisk.ee" class="text-red-600 hover:underline">privacy&#64;careerisk.ee</a>
          </p>
        </section>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
