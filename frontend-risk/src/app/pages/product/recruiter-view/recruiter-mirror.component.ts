import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface SignalItem {
  type: 'positive' | 'negative' | 'neutral';
  signal: string;
  signalEt: string;
  recruiterReads: string;
  recruiterReadsEt: string;
  weight: number;
}

interface RedFlag {
  id: string;
  severity: 'deal_breaker' | 'concern' | 'minor';
  title: string;
  titleEt: string;
  explanation: string;
  explanationEt: string;
  howRecruitersSeeIt: string;
  howRecruitersSeeItEt: string;
}

interface SeniorityAnalysis {
  claimedLevel: string;
  perceivedLevel: string;
  mismatch: 'over' | 'under' | 'match';
  mismatchDegree: number;
  signals: string[];
  signalsEt: string[];
}

@Component({
  selector: 'app-recruiter-mirror',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
            <span>🪞</span>
            <span>{{ lang() === 'en' ? 'RECRUITER MIRROR VIEW' : 'VÄRBAJA PEEGLIVAADE' }}</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black mb-4">
            {{ lang() === 'en' ? 'This Is How They See You' : 'Nii Nad Sind Näevad' }}
          </h1>

          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'The hiring manager will spend 7.4 seconds on your profile. Here is what registers - and what does not.'
              : 'Personalijuht kulutab sinu profiilile 7.4 sekundit. Siin on, mis registreerub - ja mis mitte.' }}
          </p>
        </div>

        <!-- 7-Second Scan Visualization -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold">
              {{ lang() === 'en' ? 'The 7.4-Second Scan' : '7.4-Sekundiline Skanneering' }}
            </h2>
            <div class="flex items-center gap-2 text-sm text-slate-400">
              <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>{{ lang() === 'en' ? 'Eye-tracking based' : 'Pilgujälgimise põhine' }}</span>
            </div>
          </div>

          <!-- Heat Map Representation -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-red-400">2.1s</div>
              <div class="text-sm text-slate-400">{{ lang() === 'en' ? 'Name & Title' : 'Nimi & Tiitel' }}</div>
              <div class="text-xs text-red-400 mt-2">{{ lang() === 'en' ? 'FIRST IMPRESSION' : 'ESMAMULJE' }}</div>
            </div>
            <div class="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-amber-400">2.8s</div>
              <div class="text-sm text-slate-400">{{ lang() === 'en' ? 'Current Company' : 'Praegune Ettevõte' }}</div>
              <div class="text-xs text-amber-400 mt-2">{{ lang() === 'en' ? 'CREDIBILITY CHECK' : 'USALDUSE KONTROLL' }}</div>
            </div>
            <div class="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4 text-center">
              <div class="text-2xl font-bold text-emerald-400">2.5s</div>
              <div class="text-sm text-slate-400">{{ lang() === 'en' ? 'Skills & Keywords' : 'Oskused & Märksõnad' }}</div>
              <div class="text-xs text-emerald-400 mt-2">{{ lang() === 'en' ? 'MATCH SCAN' : 'SOBIVUSE SKANEERING' }}</div>
            </div>
          </div>

          <div class="p-4 bg-slate-800/50 rounded-xl">
            <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'What they probably skipped:' : 'Mida nad ilmselt vahele jätsid:' }}</div>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">{{ lang() === 'en' ? 'Your detailed job descriptions' : 'Sinu detailsed töökirjeldused' }}</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">{{ lang() === 'en' ? 'Education section' : 'Hariduse sektsioon' }}</span>
              <span class="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">{{ lang() === 'en' ? 'Personal projects (probably)' : 'Isiklikud projektid (ilmselt)' }}</span>
            </div>
          </div>
        </div>

        <!-- Signal vs Noise -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📡</span>
            {{ lang() === 'en' ? 'Signal vs Noise' : 'Signaal vs Müra' }}
          </h2>

          <div class="space-y-4">
            @for (item of signals(); track item.signal) {
              <div class="flex items-start gap-4 p-4 rounded-xl"
                [class]="item.type === 'positive' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                         item.type === 'negative' ? 'bg-red-500/10 border border-red-500/20' :
                         'bg-slate-800/50 border border-slate-700'">
                <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  [class]="item.type === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                           item.type === 'negative' ? 'bg-red-500/20 text-red-400' :
                           'bg-slate-700 text-slate-400'">
                  {{ item.type === 'positive' ? '✓' : item.type === 'negative' ? '✗' : '○' }}
                </div>
                <div class="flex-1">
                  <div class="font-medium text-white">{{ lang() === 'en' ? item.signal : item.signalEt }}</div>
                  <div class="text-sm mt-1"
                    [class]="item.type === 'positive' ? 'text-emerald-400' :
                             item.type === 'negative' ? 'text-red-400' :
                             'text-slate-400'">
                    {{ lang() === 'en' ? 'Recruiter reads:' : 'Värbaja loeb:' }} "{{ lang() === 'en' ? item.recruiterReads : item.recruiterReadsEt }}"
                  </div>
                </div>
                <div class="text-sm font-mono"
                  [class]="item.type === 'positive' ? 'text-emerald-400' :
                           item.type === 'negative' ? 'text-red-400' :
                           'text-slate-500'">
                  {{ item.weight > 0 ? '+' : '' }}{{ item.weight }}
                </div>
              </div>
            }
          </div>

          <div class="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
            <div class="text-slate-400">{{ lang() === 'en' ? 'Net Signal Score' : 'Signaali Skoor' }}</div>
            <div class="text-3xl font-bold" [class]="netScore() > 0 ? 'text-emerald-400' : netScore() < 0 ? 'text-red-400' : 'text-slate-400'">
              {{ netScore() > 0 ? '+' : '' }}{{ netScore() }}
            </div>
          </div>
        </div>

        <!-- Red Flags Section -->
        <div class="bg-slate-900 border border-red-500/30 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
            <span>🚩</span>
            {{ lang() === 'en' ? 'Red Flags Detected' : 'Punased Lipud Tuvastatud' }}
          </h2>

          <div class="space-y-4">
            @for (flag of redFlags(); track flag.id) {
              <div class="border rounded-xl overflow-hidden"
                [class]="flag.severity === 'deal_breaker' ? 'border-red-500/50 bg-red-500/5' :
                         flag.severity === 'concern' ? 'border-amber-500/50 bg-amber-500/5' :
                         'border-slate-700 bg-slate-800/30'">
                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-white">{{ lang() === 'en' ? flag.title : flag.titleEt }}</h3>
                    <span class="px-2 py-0.5 rounded text-xs font-medium"
                      [class]="flag.severity === 'deal_breaker' ? 'bg-red-500/20 text-red-400' :
                               flag.severity === 'concern' ? 'bg-amber-500/20 text-amber-400' :
                               'bg-slate-700 text-slate-400'">
                      {{ flag.severity === 'deal_breaker' ? (lang() === 'en' ? 'DEAL BREAKER' : 'KATKESTAB TEHINGU') :
                         flag.severity === 'concern' ? (lang() === 'en' ? 'CONCERN' : 'MURE') :
                         (lang() === 'en' ? 'MINOR' : 'VÄIKE') }}
                    </span>
                  </div>
                  <p class="text-slate-400 text-sm mb-3">{{ lang() === 'en' ? flag.explanation : flag.explanationEt }}</p>
                  <div class="p-3 bg-slate-900/50 rounded-lg">
                    <div class="text-xs text-slate-500 mb-1">{{ lang() === 'en' ? 'How recruiters interpret this:' : 'Kuidas värbajad seda tõlgendavad:' }}</div>
                    <p class="text-slate-300 italic text-sm">"{{ lang() === 'en' ? flag.howRecruitersSeeIt : flag.howRecruitersSeeItEt }}"</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Seniority Mismatch -->
        <div class="bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📊</span>
            {{ lang() === 'en' ? 'Seniority Perception Gap' : 'Staaži Tajumise Lõhe' }}
          </h2>

          <div class="grid grid-cols-2 gap-8 mb-6">
            <div class="text-center">
              <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'What you claim' : 'Mida sa väidad' }}</div>
              <div class="text-3xl font-bold text-white">{{ seniority().claimedLevel }}</div>
            </div>
            <div class="text-center">
              <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'How you\'re perceived' : 'Kuidas sind tajutakse' }}</div>
              <div class="text-3xl font-bold"
                [class]="seniority().mismatch === 'under' ? 'text-amber-400' :
                         seniority().mismatch === 'over' ? 'text-red-400' :
                         'text-emerald-400'">
                {{ seniority().perceivedLevel }}
              </div>
            </div>
          </div>

          @if (seniority().mismatch !== 'match') {
            <div class="p-4 rounded-xl"
              [class]="seniority().mismatch === 'over' ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'">
              <div class="font-medium mb-2"
                [class]="seniority().mismatch === 'over' ? 'text-red-400' : 'text-amber-400'">
                {{ seniority().mismatch === 'over'
                  ? (lang() === 'en' ? '⚠️ You appear overqualified' : '⚠️ Sa tundud üle kvalifitseeritud')
                  : (lang() === 'en' ? '⚠️ You appear underqualified' : '⚠️ Sa tundud ala kvalifitseeritud') }}
              </div>
              <p class="text-sm text-slate-300">
                {{ lang() === 'en' ? 'Based on:' : 'Põhineb:' }}
              </p>
              <ul class="mt-2 space-y-1">
                @for (sig of (lang() === 'en' ? seniority().signals : seniority().signalsEt); track sig) {
                  <li class="text-sm text-slate-400 flex items-center gap-2">
                    <span class="text-xs">•</span>
                    {{ sig }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <!-- Locked Full Report -->
        @if (!canAccessFull()) {
          <div class="relative">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 blur-sm">
              <h2 class="text-xl font-bold mb-4">{{ lang() === 'en' ? 'Complete Perception Analysis' : 'Täielik Tajumise Analüüs' }}</h2>
              <div class="space-y-4">
                <div class="h-20 bg-slate-800 rounded-xl"></div>
                <div class="h-20 bg-slate-800 rounded-xl"></div>
                <div class="h-20 bg-slate-800 rounded-xl"></div>
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">🔒</div>
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ lang() === 'en' ? 'See the Complete Picture' : 'Näe Täielikku Pilti' }}
                </h3>
                <p class="text-slate-400 mb-6 max-w-sm">
                  {{ lang() === 'en'
                    ? 'Includes: Company perception score, title trajectory analysis, and compensation positioning.'
                    : 'Sisaldab: Ettevõtte tajumise skoor, tiitli trajektoori analüüs ja kompensatsiooni positsioneerimine.' }}
                </p>
                <button class="px-8 py-4 bg-gradient-to-r from-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-transform">
                  {{ lang() === 'en' ? 'Unlock Full Analysis — €14.99' : 'Ava Täielik Analüüs — €14.99' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- CTA -->
        <div class="text-center py-12">
          <p class="text-slate-400 mb-4">
            {{ lang() === 'en' ? 'Stop guessing how you come across.' : 'Lõpeta arvamine, kuidas sa üle tuled.' }}
          </p>
          <a routerLink="/autopsy" class="inline-block px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">
            {{ lang() === 'en' ? 'See What Will Sink You →' : 'Vaata Mis Sind Uppi Ajab →' }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class RecruiterMirrorComponent {
  lang = signal<'en' | 'et'>('en');

  signals = signal<SignalItem[]>([
    {
      type: 'positive',
      signal: 'Current role at recognized company',
      signalEt: 'Praegune roll tuntud ettevõttes',
      recruiterReads: 'Someone already vetted them. Good sign.',
      recruiterReadsEt: 'Keegi on neid juba kontrollinud. Hea märk.',
      weight: 15
    },
    {
      type: 'positive',
      signal: '5+ years of experience',
      signalEt: '5+ aastat kogemust',
      recruiterReads: 'Decent experience. Not too green.',
      recruiterReadsEt: 'Korralik kogemus. Pole liiga roheline.',
      weight: 10
    },
    {
      type: 'negative',
      signal: 'Generic summary with buzzwords',
      signalEt: 'Üldine kokkuvõte moesõnadega',
      recruiterReads: 'Copy-pasted like everyone else. Boring.',
      recruiterReadsEt: 'Kopeeritud nagu kõik teised. Igav.',
      weight: -8
    },
    {
      type: 'negative',
      signal: 'No specific metrics or achievements',
      signalEt: 'Pole konkreetseid mõõdikuid ega saavutusi',
      recruiterReads: 'Probably exaggerating or hiding something.',
      recruiterReadsEt: 'Ilmselt liialdab või peidab midagi.',
      weight: -12
    },
    {
      type: 'neutral',
      signal: 'CS degree from average university',
      signalEt: 'IT kraad tavalisest ülikoolist',
      recruiterReads: 'Checks the box. Nothing special.',
      recruiterReadsEt: 'Täidab nõude. Midagi erilist.',
      weight: 0
    },
    {
      type: 'negative',
      signal: 'Job titles don\'t show clear progression',
      signalEt: 'Ametinimetused ei näita selget edasiminekut',
      recruiterReads: 'Stuck? Couldn\'t get promoted? Red flag.',
      recruiterReadsEt: 'Kinni jäänud? Ei saanud edutada? Punane lipp.',
      weight: -10
    }
  ]);

  redFlags = signal<RedFlag[]>([
    {
      id: '1',
      severity: 'concern',
      title: 'Unexplained Job Hop Pattern',
      titleEt: 'Seletamatu Töövahetuse Muster',
      explanation: 'Three jobs in 3 years, all lateral moves with no clear growth story.',
      explanationEt: 'Kolm tööd 3 aastaga, kõik horisontaalsed liikumised ilma selge kasvu loota.',
      howRecruitersSeeIt: 'This person gets bored or has issues with teams. Will they leave us in 8 months too?',
      howRecruitersSeeItEt: 'See inimene tüdineb või tal on probleeme meeskondadega. Kas ta lahkub meilt ka 8 kuu pärast?'
    },
    {
      id: '2',
      severity: 'minor',
      title: 'No Online Presence',
      titleEt: 'Pole Online Kohalolekut',
      explanation: 'No GitHub, no blog, no LinkedIn activity.',
      explanationEt: 'Pole GitHubi, pole blogi, pole LinkedIn aktiivsust.',
      howRecruitersSeeIt: 'Not passionate about tech? Or hiding something? Hard to verify claims.',
      howRecruitersSeeItEt: 'Pole tehnikast kirglik? Või peidab midagi? Raske väiteid kontrollida.'
    }
  ]);

  seniority = signal<SeniorityAnalysis>({
    claimedLevel: 'Senior Engineer',
    perceivedLevel: 'Mid-Level',
    mismatch: 'over',
    mismatchDegree: 2,
    signals: [
      'No leadership or mentoring mentioned',
      'Work described as tasks, not outcomes',
      'No architectural decisions highlighted'
    ],
    signalsEt: [
      'Pole mainitud juhtimist ega mentorlust',
      'Töö kirjeldatud ülesannetena, mitte tulemustena',
      'Pole tõstetud esile arhitektuuriotsuseid'
    ]
  });

  netScore = signal(-5);

  canAccessFull(): boolean {
    return false; // Mock - replace with PaywallService
  }
}
