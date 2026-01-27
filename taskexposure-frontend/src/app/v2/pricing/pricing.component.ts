import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 flex flex-col">
      <!-- Header -->
      <header class="border-b border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            Interview Studio
          </a>
          <a routerLink="/" class="text-gray-400 hover:text-white text-sm">Back to Home</a>
        </div>
      </header>

      <main class="flex-1 px-4 py-12">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12">
            <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Fair Pricing</h1>
            <p class="text-gray-400 text-lg max-w-xl mx-auto">
              Get your assessment for free. Pay only when you want the full plan.
            </p>
          </div>

          <!-- Pricing cards -->
          <div class="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <!-- Free tier -->
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div class="mb-6">
                <h2 class="text-xl font-semibold text-white mb-2">Free Preview</h2>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-bold text-white">€0</span>
                </div>
              </div>

              <ul class="space-y-3 mb-6">
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Red / Yellow / Green status
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Your top 3 blockers
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  First action teaser
                </li>
                <li class="flex items-start gap-2 text-gray-500">
                  <svg class="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  Full 30-day plan
                </li>
                <li class="flex items-start gap-2 text-gray-500">
                  <svg class="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  CV rewrite suggestions
                </li>
              </ul>

              <a
                routerLink="/session/new"
                class="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Start Free
              </a>
            </div>

            <!-- Paid tier -->
            <div class="bg-gradient-to-b from-emerald-900/30 to-gray-900 border border-emerald-800/50 rounded-xl p-6 relative">
              <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <span class="bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Value
                </span>
              </div>

              <div class="mb-6">
                <h2 class="text-xl font-semibold text-white mb-2">Full Plan</h2>
                <div class="flex items-baseline gap-1">
                  <span class="text-4xl font-bold text-white">€9.99</span>
                  <span class="text-gray-400">one-time</span>
                </div>
              </div>

              <ul class="space-y-3 mb-6">
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Everything in Free
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <strong>Complete 30-day action plan</strong>
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  CV rewrite suggestions
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Roles to target and avoid
                </li>
                <li class="flex items-start gap-2 text-gray-300">
                  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Pivot suggestions (if applicable)
                </li>
              </ul>

              <a
                routerLink="/session/new"
                class="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Get Started
              </a>
              <p class="text-center text-gray-500 text-sm mt-3">
                Pay after you see your free preview
              </p>
            </div>
          </div>

          <!-- FAQ -->
          <div class="mt-16 max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold text-white mb-8 text-center">Common Questions</h2>

            <div class="space-y-6">
              <div>
                <h3 class="text-white font-medium mb-2">Is this a subscription?</h3>
                <p class="text-gray-400">No. You pay once per session. No recurring charges, ever.</p>
              </div>

              <div>
                <h3 class="text-white font-medium mb-2">Can I try before I pay?</h3>
                <p class="text-gray-400">Yes! Every session starts with a free preview showing your status and blockers. You only pay if you want the full 30-day plan.</p>
              </div>

              <div>
                <h3 class="text-white font-medium mb-2">What if I don't like it?</h3>
                <p class="text-gray-400">Contact us within 24 hours for a full refund, no questions asked.</p>
              </div>

              <div>
                <h3 class="text-white font-medium mb-2">Do I need an account?</h3>
                <p class="text-gray-400">Not for the Quick Check. Create an account only if you want to save your history and share reports.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-800 py-6">
        <div class="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Interview Studio V2 — Simple tools for job seekers.</p>
        </div>
      </footer>
    </div>
  `,
})
export class PricingComponent implements OnInit {
  constructor(private analytics: AnalyticsService) {}

  ngOnInit(): void {
    this.analytics.pageView('/pricing', 'Pricing');
  }
}
