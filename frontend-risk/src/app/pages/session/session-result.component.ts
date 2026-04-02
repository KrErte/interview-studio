import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionApiService, SessionResponse } from '../../core/services/session-api.service';
import { AuthService } from '../../core/auth/auth-api.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PaymentApiService } from '../../core/services/payment-api.service';

@Component({
  selector: 'app-session-result',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-12">
      @if (loading()) {
        <div class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-stone-200 border-t-stone-900 animate-spin"></div>
        </div>
      }

      @if (!loading() && session()) {
        <!-- Status Badge + Risk Score -->
        <div class="text-center mb-8">
          <!-- Risk Score Ring -->
          <div class="flex justify-center mb-5">
            <div class="relative w-36 h-36">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10" class="text-stone-200" stroke="currentColor"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke-width="10"
                  [attr.stroke]="riskColor()"
                  stroke-linecap="square"
                  [attr.stroke-dasharray]="314"
                  [attr.stroke-dashoffset]="314 - (314 * riskPercent() / 100)"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-stone-900">{{ riskPercent() }}%</span>
                <span class="text-[10px] text-stone-400 uppercase tracking-wider">Risk Score</span>
              </div>
            </div>
          </div>
          <div class="inline-flex items-center gap-3 px-6 py-3 border mb-4"
            [class]="statusClasses()">
            <div class="w-4 h-4" [class]="dotClass()"></div>
            <span class="text-xl font-bold">{{ statusLabel() }}</span>
          </div>
          <h1 class="text-3xl font-black text-stone-900 mt-4">{{ session()!.targetRole }}</h1>
          <p class="text-stone-400 mt-1">{{ session()!.mode === 'ADVANCED' ? 'Advanced' : 'Quick' }} Assessment</p>
        </div>

        <!-- Countdown Timer + Loss-frame warning -->
        @if (!session()!.paid) {
          <!-- Countdown urgency bar -->
          <div class="border border-red-400 bg-red-600 text-white p-4 mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-sm font-bold">Your personalized analysis is ready</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs opacity-80">Expires in</span>
              <span class="font-mono font-bold text-lg tabular-nums bg-red-700 px-2 py-0.5">{{ countdownMinutes }}:{{ countdownSeconds }}</span>
            </div>
          </div>

          <div class="border border-red-300 bg-red-50 p-5 mb-6">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 class="font-bold text-red-800">{{ lossFrameTitle() }}</h3>
                <p class="text-sm text-red-700 mt-1">{{ lossFrameMessage() }}</p>
              </div>
            </div>
          </div>

          <!-- Before / After comparison -->
          <div class="grid grid-cols-2 gap-0 mb-6 border border-stone-200">
            <div class="p-5 bg-red-50 border-r border-stone-200">
              <div class="text-xs text-red-600 font-bold uppercase tracking-widest mb-3">Without plan</div>
              <div class="space-y-2.5">
                <div class="flex items-center gap-2 text-sm text-red-800">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Gaps keep growing
                </div>
                <div class="flex items-center gap-2 text-sm text-red-800">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Competitors advance
                </div>
                <div class="flex items-center gap-2 text-sm text-red-800">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Risk score increases
                </div>
                <div class="flex items-center gap-2 text-sm text-red-800">
                  <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  Same CV, fewer callbacks
                </div>
              </div>
            </div>
            <div class="p-5 bg-emerald-50">
              <div class="text-xs text-emerald-700 font-bold uppercase tracking-widest mb-3">With full plan</div>
              <div class="space-y-2.5">
                <div class="flex items-center gap-2 text-sm text-emerald-900">
                  <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  30-day action roadmap
                </div>
                <div class="flex items-center gap-2 text-sm text-emerald-900">
                  <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  AI interview practice
                </div>
                <div class="flex items-center gap-2 text-sm text-emerald-900">
                  <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  CV optimized for role
                </div>
                <div class="flex items-center gap-2 text-sm text-emerald-900">
                  <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  Risk score drops 40%+
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="border border-stone-200 bg-white p-5 mb-6">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-stone-900">Your Career Defense Plan</h3>
              <span class="text-xs text-stone-400">2 of 8 steps completed</span>
            </div>
            <div class="h-2 bg-stone-100 overflow-hidden mb-2">
              <div class="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000" style="width: 25%"></div>
            </div>
            <p class="text-xs text-stone-500">Unlock the full plan to complete all 8 steps and close your career gaps.</p>
          </div>
        }

        <!-- Blockers — show titles only, content blurred for free -->
        <div class="border border-stone-200 bg-white p-6 mb-6">
          <h2 class="text-lg font-bold text-stone-900 mb-4">Key Blockers</h2>
          <div class="space-y-3">
            @for (blocker of session()!.blockers; track blocker; let i = $index) {
              @if (i === 0 || session()!.paid) {
                <div class="flex items-start gap-3 p-3 bg-stone-50 border border-stone-100">
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-sm text-stone-700">{{ blocker }}</span>
                </div>
              } @else {
                <div class="flex items-start gap-3 p-3 bg-stone-50 border border-stone-100 relative overflow-hidden">
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-sm text-stone-700 blur-[5px] select-none">{{ blocker }}</span>
                </div>
              }
            }
          </div>
        </div>

        <!-- Teaser Action — first step visible, rest locked -->
        <div class="border border-red-200 bg-red-50 p-6 mb-6">
          <h2 class="text-lg font-bold text-red-600 mb-2">Your First Action</h2>
          <p class="text-stone-700">{{ session()!.teaserAction }}</p>
        </div>

        <!-- Email Capture (shown before blurred content for free users) -->
        @if (!session()!.paid && !saved()) {
          <div class="border-2 border-stone-900 bg-stone-50 p-6 mb-6">
            <div class="text-center mb-4">
              <h3 class="text-xl font-black text-stone-900">Get your full 30-day plan by email — free</h3>
              <p class="text-sm text-stone-500 mt-1">We'll send Week 1 immediately. No spam.</p>
            </div>
            <div class="flex justify-center gap-2 max-w-md mx-auto">
              <input type="email" [(ngModel)]="saveEmail"
                placeholder="your@email.com"
                class="flex-1 px-4 py-2.5 border border-stone-300 text-sm focus:outline-none focus:border-stone-900 transition-colors"
              />
              <button (click)="saveByEmail()"
                [disabled]="saving()"
                class="px-5 py-2.5 bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50 whitespace-nowrap">
                {{ saving() ? 'Sending...' : 'Save & send' }}
              </button>
            </div>
            <p class="text-center text-xs text-stone-400 mt-3">
              Or <a href="#upgrade-cta" class="underline hover:text-stone-600">unlock everything instantly →</a>
            </p>
          </div>
        }
        @if (!session()!.paid && saved()) {
          <div class="border-2 border-green-200 bg-green-50 p-6 mb-6 text-center">
            <svg class="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <h3 class="text-lg font-bold text-green-800">Check your inbox!</h3>
            <p class="text-sm text-green-600 mt-1">We sent your Week 1 plan to {{ saveEmail }}</p>
          </div>
        }

        <!-- Paid Content OR Upgrade CTA -->
        @if (session()!.paid) {

          <!-- Mock Interview CTA -->
          <div class="border border-stone-900 bg-stone-900 p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h2 class="text-base font-bold text-white mb-1">Practice your interview</h2>
                <p class="text-sm text-stone-400 mb-3">
                  5 questions tailored to your blockers. Each question targets a specific gap we identified — with live AI feedback.
                </p>
                <a [routerLink]="['/session', session()!.id, 'mock-interview']"
                  class="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition-all">
                  Start Mock Interview
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <!-- 30-Day Plan -->
          @if (session()!.plan?.length) {
            <div class="border border-stone-200 bg-white p-6 mb-6">
              <h2 class="text-lg font-bold text-stone-900 mb-4">30-Day Action Plan</h2>
              <div class="space-y-4">
                @for (item of session()!.plan; track item.title) {
                  <div class="flex gap-4 p-4 bg-stone-50 border border-stone-100">
                    <div class="flex-shrink-0 w-12 h-12 bg-stone-900 flex items-center justify-center">
                      <span class="text-sm font-bold text-white">W{{ item.week }}</span>
                    </div>
                    <div>
                      <div class="font-semibold text-stone-900">{{ item.title }}</div>
                      <div class="text-sm text-stone-500 mt-1">{{ item.description }}</div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- CV Rewrite Bullets -->
          @if (session()!.cvRewriteBullets?.length) {
            <div class="border border-stone-200 bg-white p-6 mb-6">
              <h2 class="text-lg font-bold text-stone-900 mb-4">CV Rewrite Suggestions</h2>
              <ul class="space-y-2">
                @for (bullet of session()!.cvRewriteBullets; track bullet) {
                  <li class="flex items-start gap-2 text-sm text-stone-600">
                    <svg class="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ bullet }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Roles to Avoid -->
          @if (session()!.rolesToAvoid?.length) {
            <div class="border border-red-200 bg-red-50 p-6 mb-6">
              <h2 class="text-lg font-bold text-red-600 mb-4">Roles to Avoid</h2>
              <ul class="space-y-2">
                @for (role of session()!.rolesToAvoid; track role) {
                  <li class="flex items-start gap-2 text-sm text-stone-700">
                    <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ role }}
                  </li>
                }
              </ul>
            </div>
          }

          <!-- Pivot Suggestion -->
          @if (session()!.pivotSuggestion) {
            <div class="border border-stone-300 bg-stone-100 p-6 mb-6">
              <h2 class="text-lg font-bold text-stone-900 mb-2">Pivot Suggestion</h2>
              <p class="text-stone-600">{{ session()!.pivotSuggestion }}</p>
            </div>
          }
        } @else {
          <!-- Blurred 30-Day Plan Preview -->
          <div class="border border-stone-200 bg-white p-6 mb-6 relative overflow-hidden">
            <h2 class="text-lg font-bold text-stone-900 mb-4">Your 30-Day Action Plan</h2>
            <div class="space-y-3">
              <div class="flex gap-4 p-4 bg-stone-50 border border-stone-100">
                <div class="flex-shrink-0 w-12 h-12 bg-stone-900 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">W1</span>
                </div>
                <div>
                  <div class="font-semibold text-stone-900">Update your positioning & online profiles</div>
                  <div class="text-sm text-stone-500 mt-1">Reframe your experience using current {{ session()!.targetRole }} terminology...</div>
                </div>
              </div>
              <div class="flex gap-4 p-4 bg-stone-50 border border-stone-100 blur-[6px] select-none" aria-hidden="true">
                <div class="flex-shrink-0 w-12 h-12 bg-stone-900 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">W2</span>
                </div>
                <div>
                  <div class="font-semibold text-stone-900">Build a portfolio project demonstrating key skills</div>
                  <div class="text-sm text-stone-500 mt-1">Create a hands-on project that showcases your strongest competencies...</div>
                </div>
              </div>
              <div class="flex gap-4 p-4 bg-stone-50 border border-stone-100 blur-[6px] select-none" aria-hidden="true">
                <div class="flex-shrink-0 w-12 h-12 bg-stone-900 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">W3</span>
                </div>
                <div>
                  <div class="font-semibold text-stone-900">Target 15 companies and customize your applications</div>
                  <div class="text-sm text-stone-500 mt-1">Research companies actively hiring for your role and tailor each...</div>
                </div>
              </div>
              <div class="flex gap-4 p-4 bg-stone-50 border border-stone-100 blur-[6px] select-none" aria-hidden="true">
                <div class="flex-shrink-0 w-12 h-12 bg-stone-900 flex items-center justify-center">
                  <span class="text-sm font-bold text-white">W4</span>
                </div>
                <div>
                  <div class="font-semibold text-stone-900">Interview prep and salary negotiation strategy</div>
                  <div class="text-sm text-stone-500 mt-1">Practice with AI mock interviews and prepare your negotiation...</div>
                </div>
              </div>
            </div>
            <!-- Locked overlay -->
            <div class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-4">
              <div class="flex items-center gap-2 text-sm text-stone-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                Unlock to see your full personalized plan
              </div>
            </div>
          </div>

          <!-- Blurred CV Rewrite Preview -->
          <div class="border border-stone-200 bg-white p-6 mb-6 relative overflow-hidden">
            <h2 class="text-lg font-bold text-stone-900 mb-4">CV Rewrite Suggestions</h2>
            <div class="space-y-2 blur-[6px] select-none" aria-hidden="true">
              <div class="flex items-start gap-2 text-sm text-stone-600">
                <svg class="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Replace "responsible for" with impact-driven language showing measurable outcomes
              </div>
              <div class="flex items-start gap-2 text-sm text-stone-600">
                <svg class="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Add a skills section matching the top 8 keywords from job descriptions
              </div>
              <div class="flex items-start gap-2 text-sm text-stone-600">
                <svg class="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Restructure experience to lead with most relevant role achievements
              </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
          </div>

          <!-- Upgrade CTA -->
          <div id="upgrade-cta" class="border-2 border-red-200 bg-gradient-to-b from-red-50 to-white p-8 mb-6">
            <div class="text-center mb-2">
              <div class="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 mb-4 uppercase tracking-wider">
                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {{ urgencyBadge() }}
              </div>
              <h2 class="text-2xl font-black text-stone-900 mb-2">{{ upgradeTitle() }}</h2>
              <p class="text-stone-500 max-w-md mx-auto">{{ upgradeMessage() }}</p>
            </div>

            <!-- What's included -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 my-6 max-w-md mx-auto">
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Full 30-day action plan
              </div>
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                CV rewrite suggestions
              </div>
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                AI mock interview (5 Qs)
              </div>
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Roles to avoid warning
              </div>
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Career pivot analysis
              </div>
              <div class="flex items-center gap-2 text-sm text-stone-700">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Shareable report link
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <button (click)="checkout('STARTER')" [disabled]="checkoutLoading()"
                class="flex-1 px-6 py-4 bg-stone-900 text-center transition-all hover:bg-stone-800 hover:scale-[1.02] disabled:opacity-50 cursor-pointer">
                <div class="text-white font-bold text-lg">{{ checkoutLoading() ? 'Redirecting...' : 'Unlock Full Report — ' + starterPrice() }}</div>
                <div class="text-stone-400 text-sm">One-time, no subscription</div>
              </button>
              <button (click)="checkout('ARENA_PRO')" [disabled]="checkoutLoading()"
                class="flex-1 px-6 py-4 bg-red-600 text-center transition-all hover:bg-red-700 hover:scale-[1.02] ring-2 ring-red-300 ring-offset-2 disabled:opacity-50 cursor-pointer">
                <div class="text-white font-bold text-lg">{{ checkoutLoading() ? 'Redirecting...' : 'Get Pro — ' + proPrice() + ' per year' }}</div>
                <div class="text-red-100 text-sm">Interview simulator + quarterly score updates</div>
              </button>
            </div>

            <div class="flex items-center justify-center gap-2 mt-4 text-xs text-stone-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Secure payment via Stripe
            </div>
          </div>
        }

        <!-- Share Section -->
        <div class="border border-stone-200 bg-white p-6 mb-6 mt-8">
          <h2 class="text-lg font-bold text-stone-900 mb-2 text-center">Share Your Risk Score</h2>
          <p class="text-sm text-stone-500 text-center mb-5">Let others know about their career risk too</p>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <!-- LinkedIn -->
            <button (click)="shareLinkedIn()"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2] text-white text-sm font-semibold hover:bg-[#004182] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </button>
            <!-- Twitter/X -->
            <button (click)="shareTwitter()"
              class="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-semibold hover:bg-stone-800 transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Twitter
            </button>
            <!-- Facebook -->
            <button (click)="shareFacebook()"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white text-sm font-semibold hover:bg-[#0C5DC7] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <!-- WhatsApp -->
            <button (click)="shareWhatsApp()"
              class="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1DA851] transition-colors">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <!-- Copy link -->
            <button (click)="copyShareLink()"
              class="flex items-center gap-2 px-4 py-2.5 border border-stone-300 text-stone-600 text-sm font-semibold hover:border-stone-900 hover:text-stone-900 transition-colors">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              {{ copied() ? 'Copied!' : 'Copy link' }}
            </button>
          </div>
        </div>

        <div class="flex justify-center mt-4">
          <a routerLink="/session/new"
            class="px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors">
            New assessment
          </a>
        </div>
      }
    </div>
  `
})
export class SessionResultComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionApi = inject(SessionApiService);
  private readonly analytics = inject(AnalyticsService);
  private readonly paymentApi = inject(PaymentApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loading = signal(true);
  checkoutLoading = signal(false);
  session = signal<SessionResponse | null>(null);
  copied = signal(false);
  starterPrice = signal('$9');
  proPrice = signal('$19');
  saveEmail = '';
  saving = signal(false);
  saved = signal(false);

  // Countdown timer
  countdownMinutes = '14';
  countdownSeconds = '59';
  private countdownTotal = 14 * 60 + 59;
  private countdownInterval: any;

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  private startCountdown(): void {
    // Check if there's a saved countdown for this session
    const sessionId = this.route.snapshot.paramMap.get('id');
    const savedEnd = sessionStorage.getItem('countdown_' + sessionId);
    if (savedEnd) {
      const remaining = Math.max(0, Math.floor((parseInt(savedEnd) - Date.now()) / 1000));
      this.countdownTotal = remaining;
    } else {
      sessionStorage.setItem('countdown_' + sessionId, String(Date.now() + this.countdownTotal * 1000));
    }

    this.updateCountdownDisplay();
    this.countdownInterval = setInterval(() => {
      if (this.countdownTotal > 0) {
        this.countdownTotal--;
        this.updateCountdownDisplay();
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private updateCountdownDisplay(): void {
    const m = Math.floor(this.countdownTotal / 60);
    const s = this.countdownTotal % 60;
    this.countdownMinutes = String(m).padStart(2, '0');
    this.countdownSeconds = String(s).padStart(2, '0');
  }

  ngOnInit() {
    this.paymentApi.getPricing().subscribe(tiers => {
      const symbol = tiers[0]?.currency === 'EUR' ? '€' : '$';
      const starter = tiers.find(t => t.id === 'STARTER');
      const pro = tiers.find(t => t.id === 'ARENA_PRO');
      if (starter) this.starterPrice.set(symbol + Math.round(starter.price));
      if (pro) this.proPrice.set(symbol + Math.round(pro.price));
    });
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.sessionApi.getSession(id).subscribe({
        next: (s) => { this.session.set(s); this.loading.set(false); if (!s.paid) this.startCountdown(); },
        error: () => {
          const cached = sessionStorage.getItem('lastSession');
          if (cached) {
            this.session.set(JSON.parse(cached));
          }
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }

  riskPercent(): number {
    const s = this.session()?.status;
    const blockers = this.session()?.blockers?.length ?? 0;
    if (s === 'RED') return Math.min(95, 72 + blockers * 4);
    if (s === 'GREEN') return Math.max(10, 22 - blockers * 3);
    return Math.min(68, 44 + blockers * 4);
  }

  riskColor(): string {
    const s = this.session()?.status;
    if (s === 'RED') return '#dc2626';
    if (s === 'GREEN') return '#16a34a';
    return '#d97706';
  }

  statusClasses(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'border-red-300 bg-red-50 text-red-700';
    if (s === 'GREEN') return 'border-green-300 bg-green-50 text-green-700';
    return 'border-amber-300 bg-amber-50 text-amber-700';
  }

  dotClass(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'bg-red-600';
    if (s === 'GREEN') return 'bg-green-600';
    return 'bg-amber-500';
  }

  statusLabel(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'High Risk \u2014 Significant gaps detected';
    if (s === 'GREEN') return 'Low Risk \u2014 Strong alignment';
    return 'Medium Risk \u2014 Some areas need work';
  }

  lossFrameTitle(): string {
    const s = this.session()?.status;
    const risk = this.riskPercent();
    if (s === 'RED') return `At ${risk}% risk, your earning potential could drop significantly within 2 years`;
    if (s === 'GREEN') return `Low risk now — but ${risk}% of your tasks are still automatable`;
    return `At ${risk}% risk, competitors with AI skills are already pulling ahead`;
  }

  lossFrameMessage(): string {
    const role = this.session()?.targetRole || 'your role';
    const s = this.session()?.status;
    if (s === 'RED') return `Professionals in ${role} who don't adapt now face salary cuts of 20-40% as automation increases. Your full defense plan is ready — don't leave without it.`;
    if (s === 'GREEN') return `You're well positioned, but the gap between prepared and unprepared professionals in ${role} is widening fast. Lock in your advantage now.`;
    return `${role} professionals who invest in career defense now will be 3x more competitive in 18 months. Your personalized plan has 8 steps — you've only completed 2.`;
  }

  upgradeTitle(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'You need a plan \u2014 urgently';
    if (s === 'GREEN') return 'You\'re close \u2014 get the edge';
    return 'Unlock your full action plan';
  }

  urgencyBadge(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'Action needed this week';
    if (s === 'GREEN') return 'Small gaps closing fast';
    return 'Don\'t wait — gaps grow over time';
  }

  upgradeMessage(): string {
    const s = this.session()?.status;
    if (s === 'RED') return 'Your assessment shows significant gaps. Get a full 30-day roadmap with step-by-step tasks, AI career tools, and interview prep to close those gaps fast.';
    if (s === 'GREEN') return 'You have strong alignment! Unlock your full plan to refine your positioning, optimize your CV, and practice with AI interview simulation.';
    return 'Get your complete 30-day action plan, task tracking, session history, shareable reports, and 8 AI-powered career tools.';
  }

  checkout(tier: string): void {
    if (this.checkoutLoading()) return;

    // If not authenticated, redirect to register with return URL
    if (!this.authService.isAuthenticated()) {
      const returnUrl = window.location.pathname;
      this.router.navigate(['/register'], { queryParams: { returnUrl } });
      return;
    }

    this.checkoutLoading.set(true);
    this.analytics.trackEvent('checkout_initiated', { tier, sessionId: this.session()?.id });

    const successUrl = `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = window.location.href;
    const interval = tier === 'ARENA_PRO' ? 'year' : 'month';

    this.paymentApi.createCheckout(tier, successUrl, cancelUrl, interval).subscribe({
      next: (res) => {
        window.location.href = res.checkoutUrl;
      },
      error: () => {
        this.checkoutLoading.set(false);
        // Fallback to pricing page
        this.router.navigate(['/pricing']);
      }
    });
  }

  saveByEmail() {
    if (!this.saveEmail || this.saving()) return;
    this.saving.set(true);
    this.sessionApi.saveByEmail(this.session()!.id!, this.saveEmail).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.analytics.trackEvent('save_by_email', { sessionId: this.session()?.id });
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  private getShareUrl(): string {
    const shareId = this.session()?.shareId;
    if (shareId) return `${window.location.origin}/share/${shareId}?utm_source=share&utm_medium=social`;
    return `${window.location.origin}/session/new?utm_source=share&utm_medium=social`;
  }

  private getShareText(): string {
    const role = this.session()?.targetRole || 'my role';
    const risk = this.riskPercent();
    return `I just checked my career AI risk — ${role} has a ${risk}% automation risk. Check yours free:`;
  }

  shareLinkedIn(): void {
    const url = encodeURIComponent(this.getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=600,height=500');
    this.analytics.trackEvent('share_created', { sessionId: this.session()?.id, platform: 'linkedin' });
  }

  shareTwitter(): void {
    const url = encodeURIComponent(this.getShareUrl());
    const text = encodeURIComponent(this.getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=500');
    this.analytics.trackEvent('share_created', { sessionId: this.session()?.id, platform: 'twitter' });
  }

  shareFacebook(): void {
    const url = encodeURIComponent(this.getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=500');
    this.analytics.trackEvent('share_created', { sessionId: this.session()?.id, platform: 'facebook' });
  }

  shareWhatsApp(): void {
    const url = this.getShareUrl();
    const text = encodeURIComponent(`${this.getShareText()} ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    this.analytics.trackEvent('share_created', { sessionId: this.session()?.id, platform: 'whatsapp' });
  }

  copyShareLink() {
    const url = this.getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.copied.set(true);
      this.analytics.trackEvent('share_created', { sessionId: this.session()?.id, platform: 'copy' });
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
