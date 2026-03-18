import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-16">
      <!-- Hero -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-6">
          <span class="text-sm font-medium text-emerald-300">ABOUT US</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-6">We Help People Future-Proof Their Careers</h1>
        <p class="text-xl text-slate-400 max-w-2xl mx-auto">
          CareerRisk Index was built by a team passionate about helping professionals navigate the rapidly changing job market.
        </p>
      </div>

      <!-- Mission -->
      <div class="grid md:grid-cols-2 gap-8 mb-16">
        <div class="p-8 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Our Mission</h3>
          <p class="text-slate-400 leading-relaxed">
            To give every professional the data and insights they need to stay ahead of market disruptions.
            We believe that with the right information, anyone can adapt and thrive in the age of AI.
          </p>
        </div>

        <div class="p-8 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Our Approach</h3>
          <p class="text-slate-400 leading-relaxed">
            We combine real-time labor market data, AI advancement tracking, and proven career frameworks
            to deliver actionable insights &mdash; not vague predictions. Every score is backed by data.
          </p>
        </div>
      </div>

      <!-- Values -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-white text-center mb-8">What We Stand For</h2>
        <div class="grid sm:grid-cols-3 gap-6">
          <div class="text-center p-6">
            <div class="w-12 h-12 mx-auto rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 class="font-semibold text-white mb-2">Data-Driven</h4>
            <p class="text-sm text-slate-400">Every assessment is based on real market signals, not guesswork.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-12 h-12 mx-auto rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 class="font-semibold text-white mb-2">Privacy First</h4>
            <p class="text-sm text-slate-400">Your data stays yours. We never sell or share personal information.</p>
          </div>
          <div class="text-center p-6">
            <div class="w-12 h-12 mx-auto rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h4 class="font-semibold text-white mb-2">Actionable</h4>
            <p class="text-sm text-slate-400">We don't just show problems. Every report includes a concrete action plan.</p>
          </div>
        </div>
      </div>

      <!-- Team -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-white text-center mb-8">The Team</h2>
        <div class="max-w-lg mx-auto p-8 rounded-2xl border border-slate-800 bg-slate-900/50 text-center">
          <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-2xl font-bold text-slate-900 mb-4">
            KE
          </div>
          <h4 class="text-lg font-bold text-white">Kristo Erte</h4>
          <p class="text-emerald-400 text-sm mb-3">Founder & Developer</p>
          <p class="text-slate-400 text-sm leading-relaxed">
            Full-stack developer with a passion for career tech. Building tools that help people make better career decisions using data and AI.
          </p>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Ready to check your career risk?</h2>
        <a routerLink="/session/new"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl text-lg font-bold text-slate-900 hover:shadow-emerald-500/40 shadow-lg transition-all">
          Start Free Assessment
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>
    </div>
  `
})
export class AboutComponent {}
