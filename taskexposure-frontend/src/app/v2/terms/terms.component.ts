import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
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
          <h1 class="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          <p class="text-gray-400 text-sm mb-8">Last updated: January 2024</p>

          <div class="space-y-8 text-gray-300">
            <section>
              <h2 class="text-xl font-semibold text-white mb-3">1. Service description</h2>
              <p class="text-gray-400">CareerRisk.ee provides an online interview readiness assessment tool. Our service analyzes your inputs using deterministic scoring rules to provide career guidance and action plans.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">2. Pricing and payments</h2>
              <ul class="list-disc list-inside space-y-2 text-gray-400">
                <li>The free tier includes your status assessment and top blockers.</li>
                <li>The full plan costs a one-time fee of &euro;9.99 per session.</li>
                <li>Payments are processed securely via Stripe.</li>
                <li>Prices include applicable taxes.</li>
              </ul>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">3. Refund policy</h2>
              <p class="text-gray-400">We offer a 30-day money-back guarantee. If you are not satisfied with your purchase, contact us at <a href="mailto:hello&#64;careerrisk.ee" class="text-emerald-400 hover:text-emerald-300">hello&#64;careerrisk.ee</a> within 30 days for a full refund, no questions asked.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">4. Disclaimer</h2>
              <p class="text-gray-400">CareerRisk provides guidance based on market signals and hiring patterns. Our assessments are not guarantees of employment outcomes. Results depend on your individual circumstances and effort.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">5. Accounts</h2>
              <p class="text-gray-400">Creating an account is optional. If you create one, you are responsible for keeping your login credentials secure. You can request account deletion at any time by contacting us.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">6. Intellectual property</h2>
              <p class="text-gray-400">Your assessment results belong to you. You may share them freely. The CareerRisk methodology, branding, and software remain our property.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">7. Governing law</h2>
              <p class="text-gray-400">These terms are governed by the laws of the Republic of Estonia and the European Union.</p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-white mb-3">8. Contact</h2>
              <p class="text-gray-400">For questions about these terms, email <a href="mailto:hello&#64;careerrisk.ee" class="text-emerald-400 hover:text-emerald-300">hello&#64;careerrisk.ee</a>.</p>
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
export class TermsComponent {}
