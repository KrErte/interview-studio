import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DeltaMetric {
  id: string;
  area: string;
  areaEt: string;
  selfRating: number;
  marketRating: number;
  delta: number;
  interpretation: 'overconfident' | 'underconfident' | 'accurate';
  insight: string;
  insightEt: string;
  evidence: string;
  evidenceEt: string;
}

@Component({
  selector: 'app-confidence-delta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-sm mb-6">
            <span>⚖️</span>
            <span>{{ lang() === 'en' ? 'CONFIDENCE VS REALITY' : 'ENESEKINDLUS VS REAALSUS' }}</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black mb-4">
            {{ lang() === 'en' ? 'The Gap Between' : 'Lõhe' }}
            <br>
            <span class="text-amber-400">{{ lang() === 'en' ? 'What You Think & What\'s True' : 'Mida Sa Arvad & Mis On Tõde' }}</span>
          </h1>

          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'Your self-assessment vs. how the market actually values your profile. Uncomfortable but necessary.'
              : 'Sinu enesehinnang vs. kuidas turg tegelikult sinu profiili hindab. Ebamugav, aga vajalik.' }}
          </p>
        </div>

        <!-- Overall Delta Score -->
        <div class="bg-gradient-to-r from-amber-900/30 to-slate-900 border border-amber-500/30 rounded-2xl p-8 mb-8">
          <div class="text-center">
            <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'Your Confidence Delta' : 'Sinu Enesekindluse Delta' }}</div>
            <div class="text-6xl font-black mb-4"
              [class]="overallDelta() > 15 ? 'text-red-400' : overallDelta() > 5 ? 'text-amber-400' : overallDelta() < -10 ? 'text-blue-400' : 'text-emerald-400'">
              {{ overallDelta() > 0 ? '+' : '' }}{{ overallDelta() }}%
            </div>
            <div class="text-lg"
              [class]="overallDelta() > 15 ? 'text-red-400' : overallDelta() > 5 ? 'text-amber-400' : overallDelta() < -10 ? 'text-blue-400' : 'text-emerald-400'">
              {{ getOverallVerdict() }}
            </div>
          </div>

          <!-- Visual Scale -->
          <div class="mt-8">
            <div class="flex justify-between text-xs text-slate-500 mb-2">
              <span>{{ lang() === 'en' ? 'Underconfident' : 'Alakindel' }}</span>
              <span>{{ lang() === 'en' ? 'Accurate' : 'Täpne' }}</span>
              <span>{{ lang() === 'en' ? 'Overconfident' : 'Ülekindel' }}</span>
            </div>
            <div class="relative h-4 bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500 rounded-full">
              <div
                class="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-white rounded shadow-lg"
                [style.left.%]="50 + overallDelta()">
              </div>
            </div>
          </div>
        </div>

        <!-- Emotional Reality Check -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
          <div class="flex items-start gap-4">
            <div class="text-4xl">{{ getEmoji() }}</div>
            <div>
              <h2 class="text-xl font-bold text-white mb-2">{{ lang() === 'en' ? 'The Hard Truth' : 'Karm Tõde' }}</h2>
              <p class="text-slate-300 text-lg leading-relaxed">
                {{ lang() === 'en' ? getHardTruth() : getHardTruthEt() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Breakdown by Area -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-6">{{ lang() === 'en' ? 'Area-by-Area Breakdown' : 'Valdkondlik Jaotus' }}</h2>

          <div class="space-y-4">
            @for (metric of deltaMetrics(); track metric.id) {
              <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div class="p-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-white">{{ lang() === 'en' ? metric.area : metric.areaEt }}</h3>
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-1 rounded text-xs font-medium"
                        [class]="metric.interpretation === 'overconfident' ? 'bg-red-500/20 text-red-400' :
                                 metric.interpretation === 'underconfident' ? 'bg-blue-500/20 text-blue-400' :
                                 'bg-emerald-500/20 text-emerald-400'">
                        {{ metric.interpretation === 'overconfident' ? (lang() === 'en' ? 'OVERCONFIDENT' : 'ÜLEKINDEL') :
                           metric.interpretation === 'underconfident' ? (lang() === 'en' ? 'UNDERCONFIDENT' : 'ALAKINDEL') :
                           (lang() === 'en' ? 'ACCURATE' : 'TÄPNE') }}
                      </span>
                    </div>
                  </div>

                  <!-- Rating Bars -->
                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'Your self-rating' : 'Sinu enesehinnang' }}</div>
                      <div class="flex items-center gap-3">
                        <div class="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div class="h-full bg-blue-500 rounded-full" [style.width.%]="metric.selfRating * 10"></div>
                        </div>
                        <span class="text-blue-400 font-mono w-8">{{ metric.selfRating }}/10</span>
                      </div>
                    </div>
                    <div>
                      <div class="text-sm text-slate-400 mb-2">{{ lang() === 'en' ? 'Market assessment' : 'Turu hinnang' }}</div>
                      <div class="flex items-center gap-3">
                        <div class="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                          <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="metric.marketRating * 10"></div>
                        </div>
                        <span class="text-emerald-400 font-mono w-8">{{ metric.marketRating }}/10</span>
                      </div>
                    </div>
                  </div>

                  <!-- Delta Visualization -->
                  <div class="flex items-center justify-center mb-4">
                    <div class="text-3xl font-bold"
                      [class]="metric.delta > 0 ? 'text-red-400' : metric.delta < 0 ? 'text-blue-400' : 'text-emerald-400'">
                      {{ metric.delta > 0 ? '+' : '' }}{{ metric.delta }}
                    </div>
                    <div class="text-slate-500 ml-2">{{ lang() === 'en' ? 'point gap' : 'punkti vahe' }}</div>
                  </div>

                  <!-- Insight -->
                  <div class="p-4 bg-slate-800/50 rounded-xl">
                    <div class="text-sm text-slate-300 mb-2">{{ lang() === 'en' ? metric.insight : metric.insightEt }}</div>
                    <div class="text-xs text-slate-500">{{ lang() === 'en' ? 'Evidence:' : 'Tõend:' }} {{ lang() === 'en' ? metric.evidence : metric.evidenceEt }}</div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- What This Means -->
        <div class="bg-gradient-to-r from-purple-900/30 to-slate-900 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-4">{{ lang() === 'en' ? 'What This Means For Your Job Search' : 'Mida See Tähendab Sinu Tööotsingu Jaoks' }}</h2>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <div class="text-sm text-slate-400">{{ lang() === 'en' ? 'You\'re likely targeting:' : 'Sa sihtid ilmselt:' }}</div>
              <div class="p-4 bg-slate-800/50 rounded-xl">
                <div class="text-xl font-bold text-white">{{ targetingLevel() }}</div>
                <div class="text-sm text-slate-400">({{ lang() === 'en' ? 'based on your applications' : 'sinu kandideerimiste põhjal' }})</div>
              </div>
            </div>
            <div class="space-y-3">
              <div class="text-sm text-slate-400">{{ lang() === 'en' ? 'You should target:' : 'Sa peaksid sihtima:' }}</div>
              <div class="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div class="text-xl font-bold text-emerald-400">{{ recommendedLevel() }}</div>
                <div class="text-sm text-emerald-400/70">({{ lang() === 'en' ? 'for highest success rate' : 'kõrgeima edukuse jaoks' }})</div>
              </div>
            </div>
          </div>

          <div class="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div class="flex items-start gap-3">
              <span class="text-amber-400">💡</span>
              <div class="text-sm text-slate-300">
                {{ lang() === 'en'
                  ? 'Tip: Applying one level below your "dream role" and overperforming is a stronger strategy than barely qualifying for reach roles.'
                  : 'Nõuanne: Kandideerimine üks tase alla oma "unistuste rolli" ja üle sooritamine on tugevam strateegia kui napilt kvalifitseerumine kaugete rollide jaoks.' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Locked Detailed Analysis -->
        @if (!canAccessFull()) {
          <div class="relative mb-8">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 blur-sm">
              <h2 class="text-xl font-bold mb-4">{{ lang() === 'en' ? 'Salary Expectation Reality Check' : 'Palgaootuse Reaalsuse Kontroll' }}</h2>
              <div class="h-40 bg-slate-800 rounded-xl"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">💰</div>
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ lang() === 'en' ? 'Is Your Salary Expectation Realistic?' : 'Kas Sinu Palgaootus On Realistlik?' }}
                </h3>
                <p class="text-slate-400 mb-6">
                  {{ lang() === 'en'
                    ? 'See how your expected salary compares to what the market actually pays for your profile.'
                    : 'Vaata kuidas sinu oodatav palk võrdleb sellega, mida turg tegelikult sinu profiili eest maksab.' }}
                </p>
                <button class="px-8 py-4 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">
                  {{ lang() === 'en' ? 'Unlock Salary Reality — €14.99' : 'Ava Palgareaalsus — €14.99' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- CTA -->
        <div class="text-center py-8">
          <p class="text-slate-400 mb-4">
            {{ lang() === 'en' ? 'Now you know. Time to act.' : 'Nüüd sa tead. Aeg tegutseda.' }}
          </p>
          <a routerLink="/analysis/next-72h" class="inline-block px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">
            {{ lang() === 'en' ? 'Get Your 72-Hour Action Plan →' : 'Saa Oma 72-Tunnine Tegevusplaan →' }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class ConfidenceDeltaComponent {
  lang = signal<'en' | 'et'>('en');

  deltaMetrics = signal<DeltaMetric[]>([
    {
      id: '1',
      area: 'Technical Depth',
      areaEt: 'Tehniline Sügavus',
      selfRating: 8,
      marketRating: 6,
      delta: 2,
      interpretation: 'overconfident',
      insight: 'You rate your technical skills higher than what your profile demonstrates. Recruiters see claims but lack proof.',
      insightEt: 'Sa hindad oma tehnilisi oskusi kõrgemalt kui sinu profiil näitab. Värbajad näevad väiteid, aga puudub tõend.',
      evidence: 'No open source contributions, no technical blog, certifications expired',
      evidenceEt: 'Pole avatud lähtekoodiga panuseid, pole tehnilist blogi, sertifikaadid aegunud'
    },
    {
      id: '2',
      area: 'Leadership Experience',
      areaEt: 'Juhtimiskogemus',
      selfRating: 7,
      marketRating: 4,
      delta: 3,
      interpretation: 'overconfident',
      insight: 'You consider yourself a leader, but your resume shows zero leadership keywords or team management experience.',
      insightEt: 'Sa pead end juhiks, aga sinu CV ei näita ühtegi juhtimise märksõna ega meeskonna juhtimise kogemust.',
      evidence: 'No "led," "managed," "mentored," or "architected" in work descriptions',
      evidenceEt: 'Pole "juhtisin," "haldsin," "mentoreesin" või "projekteerisin" töökirjeldustes'
    },
    {
      id: '3',
      area: 'Communication Skills',
      areaEt: 'Suhtlemisoskused',
      selfRating: 5,
      marketRating: 7,
      delta: -2,
      interpretation: 'underconfident',
      insight: 'You undersell your communication. Your profile actually shows clear articulation and structured thinking.',
      insightEt: 'Sa alahindad oma suhtlemist. Sinu profiil näitab tegelikult selget väljendust ja struktureeritud mõtlemist.',
      evidence: 'Well-written LinkedIn posts, clear project descriptions',
      evidenceEt: 'Hästi kirjutatud LinkedIn postitused, selged projektikirjeldused'
    },
    {
      id: '4',
      area: 'System Design',
      areaEt: 'Süsteemi Disain',
      selfRating: 8,
      marketRating: 5,
      delta: 3,
      interpretation: 'overconfident',
      insight: 'High self-rating but no evidence of architectural work. Most candidates overrate this area significantly.',
      insightEt: 'Kõrge enesehinnang, aga pole tõendeid arhitektuuritööst. Enamik kandidaate ülehindab seda valdkonda oluliselt.',
      evidence: 'No architectural decisions, no system design projects mentioned',
      evidenceEt: 'Pole arhitektuuriotsuseid, pole mainitud süsteemi disaini projekte'
    },
    {
      id: '5',
      area: 'Market Value',
      areaEt: 'Turuväärtus',
      selfRating: 8,
      marketRating: 6,
      delta: 2,
      interpretation: 'overconfident',
      insight: 'Your salary expectations likely exceed what similar profiles command. You may be pricing yourself out.',
      insightEt: 'Sinu palgaootused ületavad ilmselt seda, mida sarnased profiilid nõuavad. Sa võid end turult välja hinnata.',
      evidence: 'Targeting roles at $150K+ but profile matches $120K median',
      evidenceEt: 'Sihtid rolle $150K+ aga profiil vastab $120K mediaanile'
    }
  ]);

  overallDelta = computed(() => {
    const metrics = this.deltaMetrics();
    const avg = metrics.reduce((sum, m) => sum + m.delta, 0) / metrics.length;
    return Math.round(avg * 10);
  });

  targetingLevel = signal('Senior Engineer ($140K-160K)');
  recommendedLevel = signal('Mid-Senior Engineer ($115K-135K)');

  getOverallVerdict(): string {
    const delta = this.overallDelta();
    if (this.lang() === 'en') {
      if (delta > 15) return 'Significantly Overconfident';
      if (delta > 5) return 'Moderately Overconfident';
      if (delta < -10) return 'Underselling Yourself';
      if (delta < -5) return 'Slightly Underconfident';
      return 'Reasonably Calibrated';
    } else {
      if (delta > 15) return 'Oluliselt Ülekindel';
      if (delta > 5) return 'Mõõdukalt Ülekindel';
      if (delta < -10) return 'Müüd End Alla';
      if (delta < -5) return 'Veidi Alakindel';
      return 'Mõistlikult Kalibreeritud';
    }
  }

  getEmoji(): string {
    const delta = this.overallDelta();
    if (delta > 15) return '😬';
    if (delta > 5) return '🤔';
    if (delta < -10) return '😶';
    if (delta < -5) return '🙂';
    return '✅';
  }

  getHardTruth(): string {
    const delta = this.overallDelta();
    if (delta > 15) return 'You\'re significantly overestimating your market position. This explains why interviews aren\'t converting — you\'re likely coming across as arrogant or unaware. The market doesn\'t care what you think you\'re worth; it cares what you can prove.';
    if (delta > 5) return 'You have a mild case of inflated self-assessment. You\'re probably targeting roles slightly above your current level without the evidence to back it up. This leads to getting ghosted after interviews.';
    if (delta < -10) return 'You\'re underselling yourself significantly. This might feel humble, but it\'s costing you money and opportunities. Companies are paying for confidence too — if you don\'t value yourself, why would they?';
    return 'Your self-assessment is reasonably aligned with market reality. This is rare and healthy. Focus on closing specific gaps rather than recalibrating your entire view.';
  }

  getHardTruthEt(): string {
    const delta = this.overallDelta();
    if (delta > 15) return 'Sa ülehindad oluliselt oma turupositsiooni. See selgitab, miks intervjuud ei konverteeru — sa tuled ilmselt üle ülbe või teadmatuna. Turgu ei huvita, mida sa arvad, et sa väärt oled; teda huvitab, mida sa tõestada saad.';
    if (delta > 5) return 'Sul on kerge paisutatud enesehinnangu juhtum. Sa sihtid ilmselt rolle veidi üle oma praeguse taseme ilma tõenditeta seda toetada. See viib selleni, et sind ignoreeritakse pärast intervjuusid.';
    if (delta < -10) return 'Sa müüd end oluliselt alla. See võib tunduda tagasihoidlik, aga see maksab sulle raha ja võimalusi. Ettevõtted maksavad ka enesekindluse eest — kui sa ennast ei väärtusta, miks peaksid nemad?';
    return 'Sinu enesehinnang on mõistlikult kooskõlas turu reaalsusega. See on haruldane ja tervislik. Keskendu konkreetsete lünkade sulgemisele, mitte kogu vaate ümberkalibreerimus.';
  }

  canAccessFull(): boolean {
    return false;
  }
}
