import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PaywallService } from '../../../core/paywall/paywall.service';

interface FailureReason {
  id: string;
  rank: number;
  title: string;
  titleEt: string;
  severity: 'critical' | 'high' | 'medium';
  probability: number;
  recruiterThought: string;
  recruiterThoughtEt: string;
  evidence: string[];
  evidenceEt: string[];
  fix: string;
  fixEt: string;
  timeToFix: string;
  locked?: boolean;
}

interface AutopsyResult {
  overallRisk: number;
  failureReasons: FailureReason[];
  recruiterVerdict: string;
  recruiterVerdictEt: string;
  survivalOdds: number;
  timeUntilReady: string;
}

@Component({
  selector: 'app-interview-autopsy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <!-- Warning Header -->
      <div class="bg-red-900/30 border-b border-red-500/30 py-3">
        <div class="max-w-4xl mx-auto px-6 flex items-center justify-center gap-2 text-red-400 text-sm">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ lang() === 'en' ? 'This analysis may be uncomfortable. That\'s the point.' : 'See analüüs võib olla ebamugav. See ongi mõte.' }}</span>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm mb-6">
            <span>🔬</span>
            <span>{{ lang() === 'en' ? 'INTERVIEW FAILURE AUTOPSY' : 'INTERVJUU LÄBIKUKKUMISE LAHKAMINE' }}</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black mb-4">
            {{ lang() === 'en' ? 'If You Fail This Interview,' : 'Kui Sa Kukud Sellel Intervjuul Läbi,' }}
            <br>
            <span class="text-red-400">{{ lang() === 'en' ? 'It Will Be Because of These' : 'Siis Just Nende Pärast' }}</span>
          </h1>

          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'We analyzed your profile against 10,000+ interview outcomes. Here\'s what will sink you.'
              : 'Analüüsisime sinu profiili 10,000+ intervjuu tulemuse vastu. Siin on, mis sind uppi ajab.' }}
          </p>
        </div>

        <!-- Risk Meter -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'Your Failure Probability' : 'Sinu Läbikukkumise Tõenäosus' }}</div>
              <div class="text-5xl font-black" [class]="result().overallRisk >= 70 ? 'text-red-400' : result().overallRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'">
                {{ result().overallRisk }}%
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'Survival Odds' : 'Ellujäämise Võimalused' }}</div>
              <div class="text-3xl font-bold text-slate-300">{{ result().survivalOdds }}%</div>
            </div>
          </div>

          <!-- Risk Bar -->
          <div class="h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              class="h-full rounded-full transition-all duration-1000"
              [class]="result().overallRisk >= 70 ? 'bg-gradient-to-r from-red-600 to-red-400' : result().overallRisk >= 40 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'"
              [style.width.%]="result().overallRisk">
            </div>
          </div>

          <div class="flex justify-between text-xs text-slate-500">
            <span>{{ lang() === 'en' ? 'Low Risk' : 'Madal Risk' }}</span>
            <span>{{ lang() === 'en' ? 'Moderate' : 'Mõõdukas' }}</span>
            <span>{{ lang() === 'en' ? 'High Risk' : 'Kõrge Risk' }}</span>
            <span>{{ lang() === 'en' ? 'Will Fail' : 'Kukub Läbi' }}</span>
          </div>
        </div>

        <!-- Recruiter Verdict -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              👔
            </div>
            <div>
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'What the recruiter will think (but never say):' : 'Mida värbaja mõtleb (aga kunagi ei ütle):' }}</div>
              <p class="text-lg text-slate-200 italic">
                "{{ lang() === 'en' ? result().recruiterVerdict : result().recruiterVerdictEt }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Top 3 Failure Reasons -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <span class="text-red-400">💀</span>
            {{ lang() === 'en' ? 'Your Top 3 Interview Killers' : 'Sinu Top 3 Intervjuu Tapjat' }}
          </h2>

          <div class="space-y-6">
            @for (reason of result().failureReasons.slice(0, 3); track reason.id) {
              <div
                class="bg-slate-900 border rounded-2xl overflow-hidden transition-all"
                [class]="reason.severity === 'critical' ? 'border-red-500/50' : reason.severity === 'high' ? 'border-amber-500/50' : 'border-slate-700'">

                <!-- Header -->
                <div class="p-6 border-b border-slate-800">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black"
                        [class]="reason.severity === 'critical' ? 'bg-red-500/20 text-red-400' : reason.severity === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'">
                        #{{ reason.rank }}
                      </div>
                      <div>
                        <h3 class="text-xl font-bold text-white">{{ lang() === 'en' ? reason.title : reason.titleEt }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span
                            class="px-2 py-0.5 rounded text-xs font-medium"
                            [class]="reason.severity === 'critical' ? 'bg-red-500/20 text-red-400' : reason.severity === 'high' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400'">
                            {{ reason.severity | uppercase }}
                          </span>
                          <span class="text-slate-500 text-sm">{{ reason.probability }}% {{ lang() === 'en' ? 'failure contribution' : 'läbikukkumise panus' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Recruiter Thought Bubble -->
                <div class="px-6 py-4 bg-slate-800/50 border-b border-slate-800">
                  <div class="flex items-start gap-3">
                    <div class="text-lg">💭</div>
                    <div>
                      <div class="text-xs text-slate-500 mb-1">{{ lang() === 'en' ? 'Recruiter\'s internal monologue:' : 'Värbaja sisemine monoloog:' }}</div>
                      <p class="text-slate-300 italic">"{{ lang() === 'en' ? reason.recruiterThought : reason.recruiterThoughtEt }}"</p>
                    </div>
                  </div>
                </div>

                <!-- Evidence -->
                <div class="p-6">
                  <div class="text-sm text-slate-400 mb-3">{{ lang() === 'en' ? 'Evidence from your profile:' : 'Tõendid sinu profiilist:' }}</div>
                  <ul class="space-y-2 mb-6">
                    @for (item of (lang() === 'en' ? reason.evidence : reason.evidenceEt); track item) {
                      <li class="flex items-start gap-2 text-slate-300">
                        <span class="text-red-400 mt-1">•</span>
                        <span>{{ item }}</span>
                      </li>
                    }
                  </ul>

                  <!-- Fix Preview -->
                  @if (!reason.locked) {
                    <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <div class="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                        <span>✓</span>
                        <span class="font-medium">{{ lang() === 'en' ? 'How to fix this:' : 'Kuidas seda parandada:' }}</span>
                        <span class="text-emerald-500/70">{{ reason.timeToFix }}</span>
                      </div>
                      <p class="text-slate-300">{{ lang() === 'en' ? reason.fix : reason.fixEt }}</p>
                    </div>
                  } @else {
                    <!-- Locked Fix -->
                    <div class="relative">
                      <div class="p-4 bg-slate-800 rounded-xl blur-sm">
                        <div class="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div class="h-4 bg-slate-700 rounded w-1/2"></div>
                      </div>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <button class="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition-colors flex items-center gap-2">
                          <span>🔓</span>
                          <span>{{ lang() === 'en' ? 'Unlock Fix' : 'Ava Lahendus' }}</span>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- More Failure Reasons (Locked) -->
        @if (!canAccessFull()) {
          <div class="relative mb-8">
            <div class="space-y-4 blur-sm pointer-events-none">
              @for (i of [4, 5, 6]; track i) {
                <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 font-bold">#{{ i }}</div>
                    <div class="flex-1">
                      <div class="h-5 bg-slate-800 rounded w-2/3 mb-2"></div>
                      <div class="h-3 bg-slate-800 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Unlock Overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">🔒</div>
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ lang() === 'en' ? '3 More Critical Issues Found' : '3 Kriitilist Probleemi Veel Leitud' }}
                </h3>
                <p class="text-slate-400 mb-6 max-w-sm">
                  {{ lang() === 'en'
                    ? 'Unlock the full autopsy report to see all failure points and detailed fixes.'
                    : 'Ava täielik lahkamisraport, et näha kõiki läbikukkumispunkte ja detailseid lahendusi.' }}
                </p>
                <button
                  (click)="openPaywall()"
                  class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-emerald-500/25">
                  {{ lang() === 'en' ? 'Unlock Full Report — €14.99' : 'Ava Täielik Raport — €14.99' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Time Until Ready -->
        <div class="bg-gradient-to-r from-purple-900/30 to-emerald-900/30 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'Estimated time until interview-ready:' : 'Hinnanguline aeg intervjuuvalmiduseni:' }}</div>
              <div class="text-3xl font-bold text-white">{{ result().timeUntilReady }}</div>
            </div>
            <a
              routerLink="/analysis/next-72h"
              class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-500 transition-colors flex items-center gap-2">
              <span>{{ lang() === 'en' ? 'See 72-Hour Action Plan' : 'Vaata 72-Tunnist Plaani' }}</span>
              <span>→</span>
            </a>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="text-center py-8">
          <p class="text-slate-400 mb-4">
            {{ lang() === 'en'
              ? 'Don\'t walk into your interview blind.'
              : 'Ära mine intervjuule pimesi.' }}
          </p>
          <button
            (click)="openPaywall()"
            class="px-10 py-5 bg-white text-slate-900 font-bold rounded-xl text-lg hover:scale-105 transition-transform shadow-2xl">
            {{ lang() === 'en' ? 'Get Full Interview Autopsy — €14.99' : 'Saa Täielik Intervjuu Lahkamine — €14.99' }}
          </button>
          <p class="text-xs text-slate-500 mt-3">
            {{ lang() === 'en' ? '30-day access • PDF export • Money-back guarantee' : '30-päevane ligipääs • PDF eksport • Raha tagasi garantii' }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class InterviewAutopsyComponent implements OnInit {
  lang = signal<'en' | 'et'>('en');

  result = signal<AutopsyResult>({
    overallRisk: 67,
    survivalOdds: 33,
    timeUntilReady: '2-3 weeks',
    recruiterVerdict: 'Decent skills but something feels off. Too senior for junior roles, not proven enough for senior. Classic case of stuck in the middle.',
    recruiterVerdictEt: 'Korralikud oskused, aga midagi tundub viltu. Liiga kogenud juunior rollideks, aga pole piisavalt tõestanud end seniori jaoks. Klassikaline keskel kinni jäämise juhtum.',
    failureReasons: [
      {
        id: '1',
        rank: 1,
        title: 'Unclear Career Narrative',
        titleEt: 'Ebaselge Karjäärilugu',
        severity: 'critical',
        probability: 35,
        recruiterThought: 'This person doesn\'t know what they want. If they don\'t know, how am I supposed to know if this role fits?',
        recruiterThoughtEt: 'See inimene ei tea, mida ta tahab. Kui tema ei tea, kuidas mina peaksin teadma, kas see roll sobib?',
        evidence: [
          'Job titles changed from Frontend → Backend → Full Stack → DevOps in 4 years',
          'No clear specialization or "T-shape" visible',
          'Summary section uses generic buzzwords without specifics'
        ],
        evidenceEt: [
          'Ametinimetused muutusid Frontend → Backend → Full Stack → DevOps 4 aasta jooksul',
          'Pole näha selget spetsialiseerumist ega "T-kujulist" profiili',
          'Kokkuvõtte sektsioon kasutab üldisi moesõnu ilma konkreetsuseta'
        ],
        fix: 'Pick one focus area. Rewrite your summary as: "I am a [specific role] who specializes in [2-3 specific things]. I\'ve helped companies [specific outcome]."',
        fixEt: 'Vali üks fookusala. Kirjuta oma kokkuvõte ümber: "Olen [konkreetne roll], kes spetsialiseerub [2-3 konkreetset asja]. Olen aidanud ettevõtetel [konkreetne tulemus]."',
        timeToFix: '2 hours',
        locked: false
      },
      {
        id: '2',
        rank: 2,
        title: 'No Quantified Impact',
        titleEt: 'Puudub Mõõdetav Mõju',
        severity: 'critical',
        probability: 28,
        recruiterThought: 'Cool, you "improved performance." So did everyone else who writes that. Prove it or I assume you\'re exaggerating.',
        recruiterThoughtEt: 'Lahe, sa "parandasid jõudlust." Nii kirjutab igaüks. Tõesta seda või eeldan, et liialdad.',
        evidence: [
          'Zero percentages, zero numbers, zero metrics in work history',
          '"Led team" but no team size mentioned',
          '"Improved system" but no before/after comparison'
        ],
        evidenceEt: [
          'Null protsenti, null numbrit, null mõõdikut töökogemuses',
          '"Juhtisin meeskonda" aga meeskonna suurust pole mainitud',
          '"Parandasin süsteemi" aga pole enne/pärast võrdlust'
        ],
        fix: 'Add at least one metric to each job. Even estimates work: "Reduced load time by ~40%" or "Managed team of 5 engineers." Numbers create trust.',
        fixEt: 'Lisa vähemalt üks mõõdik igale tööle. Isegi hinnangud töötavad: "Vähendasin laadimisaega ~40%" või "Juhtisin 5 inseneri meeskonda." Numbrid loovad usaldust.',
        timeToFix: '3 hours',
        locked: false
      },
      {
        id: '3',
        rank: 3,
        title: 'Skill Stack Mismatch',
        titleEt: 'Oskuste Sobimatus',
        severity: 'high',
        probability: 22,
        recruiterThought: 'They listed React but the job needs Vue. Close but not close enough when I have 50 other candidates.',
        recruiterThoughtEt: 'Nad mainisid Reacti, aga töö vajab Vue\'d. Lähedal, aga mitte piisavalt kui mul on veel 50 kandidaati.',
        evidence: [
          'Primary skills (React, Node) differ from most target job postings (Vue, Go)',
          'No cloud certifications while 80% of target roles require them',
          'Testing skills listed but no specific frameworks mentioned'
        ],
        evidenceEt: [
          'Põhioskused (React, Node) erinevad enamustest sihtrollide kuulutustest (Vue, Go)',
          'Pole pilvesertifikaate, kuigi 80% sihtrollidest nõuavad neid',
          'Testimisoskused on nimekirjas, aga konkreetseid raamistikke pole mainitud'
        ],
        fix: 'Don\'t fake skills, but highlight transferable ones. If you know React, say "Modern frontend frameworks (React; evaluating Vue for next project)." Shows growth mindset.',
        fixEt: 'Ära võltsi oskusi, aga tõsta esile ülekantavaid. Kui tead Reacti, ütle "Kaasaegsed frontend raamistikud (React; hindan Vue\'d järgmise projekti jaoks)." Näitab kasvumõtlemist.',
        timeToFix: '1 hour',
        locked: false
      },
      {
        id: '4',
        rank: 4,
        title: 'Employment Gap Red Flag',
        titleEt: 'Tööpausi Punane Lipp',
        severity: 'medium',
        probability: 10,
        recruiterThought: 'What happened in those 6 months? Did they get fired? Burnout? I\'ll ask, but already skeptical.',
        recruiterThoughtEt: 'Mis nende 6 kuu jooksul juhtus? Kas vallandati? Läbipõlemine? Küsin, aga olen juba skeptiline.',
        evidence: ['6-month gap between positions in 2023'],
        evidenceEt: ['6-kuuline tööpaus 2023. aastal'],
        fix: 'Address it proactively. Add a line: "Career break (2023): Focused on [learning X / family / relocation]. Now ready and energized for next challenge."',
        fixEt: 'Käsitle seda proaktiivselt. Lisa rida: "Karjääripaus (2023): Keskendusin [X õppimisele / perele / kolimisele]. Nüüd valmis ja energiline järgmiseks väljakutseks."',
        timeToFix: '30 min',
        locked: true
      },
      {
        id: '5',
        rank: 5,
        title: 'Seniority Signal Confusion',
        titleEt: 'Staaži Signaali Segadus',
        severity: 'medium',
        probability: 5,
        recruiterThought: '8 years of experience but no leadership mentions? Either not ambitious or bad at politics. Both concerning.',
        recruiterThoughtEt: '8 aastat kogemust, aga juhtimine pole mainitud? Kas pole ambitsioonikas või halb poliitikas. Mõlemad murettekitavad.',
        evidence: ['8 years experience, zero mentions of mentoring, leading, or architectural decisions'],
        evidenceEt: ['8 aastat kogemust, null mainimist mentorluse, juhtimise või arhitektuuriotsuste kohta'],
        fix: 'Add leadership signals even if informal: "Mentored 2 junior developers" or "Led technical design discussions for new features."',
        fixEt: 'Lisa juhtimise signaale isegi kui mitteametlikud: "Mentoreesin 2 juunior arendajat" või "Juhtisin tehnilisi disainiarutelusid uute funktsioonide jaoks."',
        timeToFix: '1 hour',
        locked: true
      }
    ]
  });

  constructor(private paywall: PaywallService) {}

  ngOnInit() {
    this.paywall.initFromStorage();

    // Detect language from browser or storage
    const storedLang = localStorage.getItem('preferredLang');
    if (storedLang === 'et') {
      this.lang.set('et');
    }
  }

  canAccessFull(): boolean {
    return this.paywall.canAccess('autopsy', 'full');
  }

  openPaywall(): void {
    // Navigate to paywall or open modal
    console.log('Opening paywall...');
  }

  toggleLang(): void {
    this.lang.update(l => l === 'en' ? 'et' : 'en');
    localStorage.setItem('preferredLang', this.lang());
  }
}
