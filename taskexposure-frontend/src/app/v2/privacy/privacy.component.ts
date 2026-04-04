import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <header class="border-b border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">CareerRisk</a>
          <a routerLink="/" class="text-gray-400 hover:text-white text-sm">Back to Home</a>
        </div>
      </header>

      <main class="flex-1 px-4 py-12">
        <div class="max-w-2xl mx-auto prose-invert">
          <h1 class="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          <p class="text-gray-400 text-sm mb-8">Last updated: January 2024</p>

          <div class="space-y-8 text-gray-300">
            <section>
              <h2 class="text-xl font-semibold text-white mb-3">Who we are</h2>
              <p>CareerRisk.ee is operated from Estonia, European Union. We provide an online interview readiness assessment tool.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">What data we collect</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-400">
                <li><strong class="text-gray-300">Session data:</strong> Your answers to the questionnaire (target role, experience level, challenges). This is used solely to generate your assessment.</li>
                <li><strong class="text-gray-300">Account data (optional):</strong> Email address and password if you choose to create an account.</li>
                <li><strong class="text-gray-300">Payment data:</strong> Payments are processed by Stripe. We do not store your card details.</li>
                <li><strong class="text-gray-300">Usage data:</strong> Basic analytics (page views, button clicks) to improve the service.</li>
              </ul>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">How we use your data</h2>
              <p class="text-gray-400">We use your data exclusively to:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-400 mt-2">
                <li>Generate your interview readiness assessment</li>
                <li>Save your session history (if you have an account)</li>
                <li>Process payments</li>
                <li>Improve our service</li>
              </ul>
              <p class="text-gray-400 mt-2">We do not sell your data to third parties. Ever.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">GDPR compliance</h2>
              <p class="text-gray-400">As an EU-based service, we comply with the General Data Protection Regulation (GDPR). You have the right to:</p>
              <ul class="list-disc list-inside space-y-2 text-gray-400 mt-2">
                <li>Access your personal data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p class="text-gray-400 mt-2">To exercise any of these rights, contact us at <a href="mailto:hello&#64;careerrisk.ee" class="text-emerald-400 hover:text-emerald-300">hello&#64;careerrisk.ee</a>.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">Cookies</h2>
              <p class="text-gray-400">We use essential cookies for authentication (JWT tokens). We do not use third-party tracking cookies.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">Contact</h2>
              <p class="text-gray-400">For any privacy-related questions, email us at <a href="mailto:hello&#64;careerrisk.ee" class="text-emerald-400 hover:text-emerald-300">hello&#64;careerrisk.ee</a>.</p>
            </section>
          </div>
        </div>
      </main>

      <footer class="border-t border-gray-800 py-8">
        <div class="max-w-4xl mx-auto px-4 flex flex-col items-center gap-4 text-sm text-gray-600">
          <div class="flex flex-wrap justify-center gap-6">
            <a routerLink="/pricing" class="hover:text-gray-400 transition-colors">Pricing</a>
            <a routerLink="/privacy" class="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a routerLink="/terms" class="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="mailto:hello&#64;careerrisk.ee" class="hover:text-gray-400 transition-colors">Contact</a>
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <span>&copy; 2024 CareerRisk.ee</span>
            <span>&bull;</span>
            <span>Made in Estonia</span>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class PrivacyComponent {}
