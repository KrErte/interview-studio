import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ActionItem {
  id: string;
  day: number;
  hour: number;
  priority: 'critical' | 'high' | 'medium';
  title: string;
  titleEt: string;
  description: string;
  descriptionEt: string;
  duration: string;
  impact: string;
  impactEt: string;
  completed?: boolean;
  locked?: boolean;
}

interface DailyTheme {
  day: number;
  theme: string;
  themeEt: string;
  icon: string;
  focus: string;
  focusEt: string;
}

@Component({
  selector: 'app-action-plan-72h',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
            <span>⚡</span>
            <span>{{ lang() === 'en' ? '72-HOUR ACTION PLAN' : '72-TUNNINE TEGEVUSPLAAN' }}</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black mb-4">
            {{ lang() === 'en' ? 'Do This' : 'Tee Seda' }}
            <span class="text-emerald-400">{{ lang() === 'en' ? ' Before Your Interview' : ' Enne Intervjuud' }}</span>
          </h1>

          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'Specific, timed actions that will materially improve your chances. Not theory — tactics.'
              : 'Konkreetsed, ajastatud tegevused, mis oluliselt parandavad sinu võimalusi. Mitte teooria — taktika.' }}
          </p>
        </div>

        <!-- Countdown Timer -->
        <div class="bg-gradient-to-r from-emerald-900/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'Time until interview-ready:' : 'Aeg intervjuuvalmiduseni:' }}</div>
              <div class="text-3xl font-bold text-emerald-400">72:00:00</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ totalTasks() }}</div>
                <div class="text-xs text-slate-400">{{ lang() === 'en' ? 'Total Tasks' : 'Ülesandeid' }}</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-emerald-400">{{ completedTasks() }}</div>
                <div class="text-xs text-slate-400">{{ lang() === 'en' ? 'Completed' : 'Tehtud' }}</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-amber-400">{{ criticalTasks() }}</div>
                <div class="text-xs text-slate-400">{{ lang() === 'en' ? 'Critical' : 'Kriitilised' }}</div>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="progressPercent()"></div>
            </div>
          </div>
        </div>

        <!-- Daily Themes -->
        <div class="grid grid-cols-3 gap-4 mb-8">
          @for (dayTheme of dailyThemes(); track dayTheme.day) {
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center"
              [class.border-emerald-500]="currentDay() === dayTheme.day"
              [class.bg-emerald-500/5]="currentDay() === dayTheme.day">
              <div class="text-3xl mb-2">{{ dayTheme.icon }}</div>
              <div class="text-xs text-slate-400 mb-1">{{ lang() === 'en' ? 'Day' : 'Päev' }} {{ dayTheme.day }}</div>
              <div class="font-bold text-white">{{ lang() === 'en' ? dayTheme.theme : dayTheme.themeEt }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ lang() === 'en' ? dayTheme.focus : dayTheme.focusEt }}</div>
            </div>
          }
        </div>

        <!-- Action Items -->
        @for (dayTheme of dailyThemes(); track dayTheme.day) {
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                {{ dayTheme.icon }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-white">{{ lang() === 'en' ? 'Day' : 'Päev' }} {{ dayTheme.day }}: {{ lang() === 'en' ? dayTheme.theme : dayTheme.themeEt }}</h2>
                <p class="text-sm text-slate-400">{{ lang() === 'en' ? dayTheme.focus : dayTheme.focusEt }}</p>
              </div>
            </div>

            <div class="space-y-3">
              @for (action of getActionsForDay(dayTheme.day); track action.id) {
                <div class="bg-slate-900 border rounded-xl overflow-hidden transition-all"
                  [class]="action.completed ? 'border-emerald-500/50 bg-emerald-500/5' :
                           action.priority === 'critical' ? 'border-red-500/30' :
                           action.priority === 'high' ? 'border-amber-500/30' :
                           'border-slate-800'">
                  <div class="p-4">
                    <div class="flex items-start gap-4">
                      <!-- Checkbox -->
                      <button
                        (click)="toggleAction(action.id)"
                        class="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                        [class]="action.completed ? 'bg-emerald-500 border-emerald-500 text-white' :
                                 action.priority === 'critical' ? 'border-red-500/50 hover:border-red-500' :
                                 action.priority === 'high' ? 'border-amber-500/50 hover:border-amber-500' :
                                 'border-slate-600 hover:border-slate-400'">
                        @if (action.completed) {
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                      </button>

                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs px-2 py-0.5 rounded"
                            [class]="action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                                     action.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                                     'bg-slate-700 text-slate-400'">
                            {{ action.priority | uppercase }}
                          </span>
                          <span class="text-xs text-slate-500">{{ action.duration }}</span>
                          <span class="text-xs text-slate-600">•</span>
                          <span class="text-xs text-slate-500">{{ lang() === 'en' ? 'Hour' : 'Tund' }} {{ action.hour }}</span>
                        </div>

                        <h3 class="font-medium text-white" [class.line-through]="action.completed" [class.text-slate-500]="action.completed">
                          {{ lang() === 'en' ? action.title : action.titleEt }}
                        </h3>

                        @if (!action.locked) {
                          <p class="text-sm text-slate-400 mt-1">{{ lang() === 'en' ? action.description : action.descriptionEt }}</p>
                          <div class="mt-2 text-xs text-emerald-400">
                            {{ lang() === 'en' ? 'Impact:' : 'Mõju:' }} {{ lang() === 'en' ? action.impact : action.impactEt }}
                          </div>
                        } @else {
                          <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
                            <span>🔒</span>
                            <span>{{ lang() === 'en' ? 'Unlock to see details' : 'Ava detailide nägemiseks' }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Locked Advanced Actions -->
        @if (!canAccessFull()) {
          <div class="relative mb-8">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 blur-sm">
              <h2 class="text-xl font-bold mb-4">{{ lang() === 'en' ? 'Advanced Interview Tactics' : 'Täiustatud Intervjuu Taktikad' }}</h2>
              <div class="space-y-4">
                @for (i of [1,2,3,4]; track i) {
                  <div class="h-16 bg-slate-800 rounded-xl"></div>
                }
              </div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">🎯</div>
                <h3 class="text-xl font-bold text-white mb-2">
                  {{ lang() === 'en' ? '8 More High-Impact Actions' : '8 Suure Mõjuga Tegevust Veel' }}
                </h3>
                <p class="text-slate-400 mb-6 max-w-sm">
                  {{ lang() === 'en'
                    ? 'Including: Interview answer templates, salary negotiation scripts, and follow-up email templates.'
                    : 'Sisaldab: Intervjuu vastuste mallid, palgaläbirääkimiste skriptid ja järelmeilide mallid.' }}
                </p>
                <button class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">
                  {{ lang() === 'en' ? 'Unlock Full Plan — €14.99' : 'Ava Täielik Plaan — €14.99' }}
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Quick Win Section -->
        <div class="bg-gradient-to-r from-amber-900/30 to-slate-900 border border-amber-500/30 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>⚡</span>
            {{ lang() === 'en' ? 'Quick Win: Do This RIGHT NOW' : 'Kiire Võit: Tee Seda KOHE' }}
          </h2>

          <div class="p-4 bg-slate-900/50 rounded-xl">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 class="font-bold text-white mb-2">
                  {{ lang() === 'en'
                    ? 'Open your resume and add ONE specific metric to your current job'
                    : 'Ava oma CV ja lisa ÜKS konkreetne mõõdik oma praegusele tööle' }}
                </h3>
                <p class="text-slate-400 text-sm">
                  {{ lang() === 'en'
                    ? 'Example: "Improved API response time" → "Reduced API response time by 40%, handling 2M+ requests/day"'
                    : 'Näide: "Parandasin API vastuse aega" → "Vähendasin API vastuse aega 40%, käsitledes 2M+ päringut/päevas"' }}
                </p>
                <div class="mt-3 text-xs text-amber-400">
                  {{ lang() === 'en' ? '⏱️ Takes 5 minutes. Increases callback rate by 23%.' : '⏱️ Võtab 5 minutit. Tõstab tagasihelistamise määra 23%.' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="text-center py-8">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 inline-block">
            <div class="text-lg text-slate-300 mb-4">
              {{ lang() === 'en' ? 'Your interview is in' : 'Sinu intervjuu on' }}
              <span class="text-emerald-400 font-bold">{{ daysUntilInterview() }} {{ lang() === 'en' ? 'days' : 'päeva pärast' }}</span>
            </div>
            <div class="text-3xl font-black text-white mb-6">
              {{ lang() === 'en' ? 'Will you be ready?' : 'Kas sa oled valmis?' }}
            </div>
            <button class="px-10 py-5 bg-white text-slate-900 font-bold rounded-xl text-lg hover:scale-105 transition-transform shadow-2xl">
              {{ lang() === 'en' ? 'Get Complete Preparation Kit — €14.99' : 'Saa Täielik Ettevalmistuskomplekt — €14.99' }}
            </button>
            <p class="text-xs text-slate-500 mt-3">
              {{ lang() === 'en'
                ? 'Includes: Full autopsy report + Recruiter view + All 72h actions + Interview scripts'
                : 'Sisaldab: Täielik lahkamisraport + Värbaja vaade + Kõik 72h tegevused + Intervjuu skriptid' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActionPlan72hComponent {
  lang = signal<'en' | 'et'>('en');
  currentDay = signal(1);
  daysUntilInterview = signal(5);

  dailyThemes = signal<DailyTheme[]>([
    {
      day: 1,
      theme: 'Profile Surgery',
      themeEt: 'Profiili Operatsioon',
      icon: '🔪',
      focus: 'Fix critical profile issues',
      focusEt: 'Paranda kriitilised profiili vead'
    },
    {
      day: 2,
      theme: 'Story Crafting',
      themeEt: 'Loo Loomine',
      icon: '📖',
      focus: 'Perfect your narrative',
      focusEt: 'Viimistle oma narratiiv'
    },
    {
      day: 3,
      theme: 'Battle Prep',
      themeEt: 'Lahingu Ettevalmistus',
      icon: '⚔️',
      focus: 'Practice & polish',
      focusEt: 'Harjuta & lihvi'
    }
  ]);

  actions = signal<ActionItem[]>([
    // Day 1
    {
      id: '1-1',
      day: 1,
      hour: 1,
      priority: 'critical',
      title: 'Add metrics to your top 2 job entries',
      titleEt: 'Lisa mõõdikud oma 2 peamisele töökandele',
      description: 'Replace vague claims with specific numbers. "Improved performance" → "Reduced load time by 40%"',
      descriptionEt: 'Asenda ebamäärased väited konkreetsete numbritega. "Parandasin jõudlust" → "Vähendasin laadimisaega 40%"',
      duration: '45 min',
      impact: 'Increases recruiter interest by 31%',
      impactEt: 'Tõstab värbaja huvi 31%',
      completed: false
    },
    {
      id: '1-2',
      day: 1,
      hour: 3,
      priority: 'critical',
      title: 'Rewrite your summary in 3 sentences',
      titleEt: 'Kirjuta oma kokkuvõte ümber 3 lausega',
      description: 'Formula: "I am [role] who specializes in [2-3 things]. I\'ve helped [outcome]. I\'m looking for [what you want]."',
      descriptionEt: 'Valem: "Olen [roll], kes spetsialiseerub [2-3 asja]. Olen aidanud [tulemus]. Otsin [mida sa tahad]."',
      duration: '30 min',
      impact: 'First thing recruiters read — make it count',
      impactEt: 'Esimene asi, mida värbajad loevad — tee see loota',
      completed: false
    },
    {
      id: '1-3',
      day: 1,
      hour: 5,
      priority: 'high',
      title: 'Remove red flag triggers',
      titleEt: 'Eemalda punaste lippude päästikud',
      description: 'Delete: buzzwords without proof, unexplained gaps, inconsistent dates, skills you can\'t back up',
      descriptionEt: 'Kustuta: moesõnad ilma tõenditeta, seletamata pausid, ebajärjekindlad kuupäevad, oskused mida sa ei saa toetada',
      duration: '30 min',
      impact: 'Prevents 23% of instant rejections',
      impactEt: 'Hoiab ära 23% kohestest tagasilükkamistest',
      completed: false
    },
    {
      id: '1-4',
      day: 1,
      hour: 7,
      priority: 'medium',
      title: 'Update LinkedIn headline',
      titleEt: 'Uuenda LinkedIn pealkirja',
      description: 'Not just your title. Include: specialization + what you do + key result. "Senior Engineer | React & Node | Building products used by 1M+ users"',
      descriptionEt: 'Mitte ainult tiitel. Sisalda: spetsialiseerumine + mida sa teed + võtmetulemus. "Senior Insener | React & Node | Ehitan tooteid mida kasutab 1M+ kasutajat"',
      duration: '15 min',
      impact: 'Appears in recruiter searches',
      impactEt: 'Ilmub värbaja otsingutes',
      completed: false
    },

    // Day 2
    {
      id: '2-1',
      day: 2,
      hour: 1,
      priority: 'critical',
      title: 'Write your "career story" in 90 seconds',
      titleEt: 'Kirjuta oma "karjäärilugu" 90 sekundiga',
      description: 'The "tell me about yourself" answer. Structure: Past (how you got here) → Present (what you do now) → Future (why this role)',
      descriptionEt: '"Räägi endast" vastus. Struktuur: Minevik (kuidas sa siia said) → Olevik (mida sa nüüd teed) → Tulevik (miks see roll)',
      duration: '1 hour',
      impact: 'Sets the tone for entire interview',
      impactEt: 'Seab tooni kogu intervjuule',
      completed: false
    },
    {
      id: '2-2',
      day: 2,
      hour: 3,
      priority: 'critical',
      title: 'Prepare 3 STAR stories',
      titleEt: 'Valmista ette 3 STAR lugu',
      description: 'Situation-Task-Action-Result. Choose: 1 leadership, 1 technical challenge, 1 conflict resolution',
      descriptionEt: 'Olukord-Ülesanne-Tegevus-Tulemus. Vali: 1 juhtimine, 1 tehniline väljakutse, 1 konflikti lahendamine',
      duration: '1.5 hours',
      impact: 'Covers 80% of behavioral questions',
      impactEt: 'Katab 80% käitumuslikest küsimustest',
      completed: false
    },
    {
      id: '2-3',
      day: 2,
      hour: 6,
      priority: 'high',
      title: 'Research the company deeply',
      titleEt: 'Uuri ettevõtet põhjalikult',
      description: 'Not just the About page. Find: recent news, Glassdoor reviews, interviewer LinkedIn profiles, tech blog posts',
      descriptionEt: 'Mitte ainult Meist lehte. Leia: viimased uudised, Glassdoor arvustused, intervjueerija LinkedIn profiilid, tehnikablogi postitused',
      duration: '45 min',
      impact: 'Enables personalized questions that impress',
      impactEt: 'Võimaldab isikupärastatud küsimusi mis avaldavad muljet',
      completed: false
    },
    {
      id: '2-4',
      day: 2,
      hour: 8,
      priority: 'medium',
      title: 'Prepare 5 questions to ask them',
      titleEt: 'Valmista 5 küsimust neile',
      description: 'Not generic. Show you\'ve researched: "I saw you\'re migrating to microservices — what\'s been the biggest challenge?"',
      descriptionEt: 'Mitte üldised. Näita, et oled uurinud: "Nägin, et migreerite mikroteenustele — mis on olnud suurim väljakutse?"',
      duration: '30 min',
      impact: 'Candidates who ask smart questions get offers 40% more often',
      impactEt: 'Kandidaadid, kes küsivad tarku küsimusi, saavad pakkumisi 40% sagedamini',
      completed: false
    },

    // Day 3
    {
      id: '3-1',
      day: 3,
      hour: 1,
      priority: 'critical',
      title: 'Practice your intro out loud 5 times',
      titleEt: 'Harjuta oma sissejuhatust valjult 5 korda',
      description: 'Record yourself. Listen back. Cringe. Fix. Repeat. This is not optional.',
      descriptionEt: 'Salvesta ennast. Kuula tagasi. Piinlik. Paranda. Korda. See pole vabatahtlik.',
      duration: '30 min',
      impact: 'Reduces "ums" and "likes" by 60%',
      impactEt: 'Vähendab "öö"-sid ja "nagu"-sid 60%',
      completed: false
    },
    {
      id: '3-2',
      day: 3,
      hour: 3,
      priority: 'high',
      title: 'Run through STAR stories once',
      titleEt: 'Käi STAR lood üks kord läbi',
      description: 'Time yourself. Each story should be 2-3 minutes max. Cut the fluff.',
      descriptionEt: 'Mõõda aega. Iga lugu peaks olema max 2-3 minutit. Lõika üleliigne.',
      duration: '45 min',
      impact: 'Prevents rambling — top interview killer',
      impactEt: 'Hoiab ära jauramist — peamine intervjuu tapja',
      completed: false
    },
    {
      id: '3-3',
      day: 3,
      hour: 5,
      priority: 'high',
      title: 'Prep your environment',
      titleEt: 'Valmista oma keskkond',
      description: 'If video: test camera, mic, lighting, background. Have water ready. Silence notifications. Close tabs.',
      descriptionEt: 'Kui video: testi kaamera, mikrofon, valgus, taust. Valmista vesi. Vaigista teavitused. Sulge vahekaardid.',
      duration: '20 min',
      impact: 'Technical issues = instant negative impression',
      impactEt: 'Tehnilised probleemid = kohene negatiivne mulje',
      completed: false
    },
    {
      id: '3-4',
      day: 3,
      hour: 7,
      priority: 'medium',
      title: 'Review salary research',
      titleEt: 'Vaata üle palgauuring',
      description: 'Know your number. Know the range. Know your walk-away point. Don\'t wing this.',
      descriptionEt: 'Tea oma numbrit. Tea vahemikku. Tea oma lahkumispunkti. Ära improviseerinda.',
      duration: '15 min',
      impact: 'Prepared candidates negotiate 15% higher salaries',
      impactEt: 'Ettevalmistunud kandidaadid läbirääkivad 15% kõrgemaid palku',
      completed: false,
      locked: true
    },
    {
      id: '3-5',
      day: 3,
      hour: 8,
      priority: 'medium',
      title: 'Sleep 8 hours',
      titleEt: 'Maga 8 tundi',
      description: 'Seriously. Sleep-deprived candidates perform 25% worse on cognitive tasks. This is science.',
      descriptionEt: 'Tõsiselt. Unest ilma jäänud kandidaadid sooritavad 25% halvemini kognitiivseid ülesandeid. See on teadus.',
      duration: '8 hours',
      impact: 'Best ROI activity you can do',
      impactEt: 'Parim ROI tegevus mida saad teha',
      completed: false
    }
  ]);

  totalTasks = computed(() => this.actions().length);
  completedTasks = computed(() => this.actions().filter(a => a.completed).length);
  criticalTasks = computed(() => this.actions().filter(a => a.priority === 'critical' && !a.completed).length);
  progressPercent = computed(() => (this.completedTasks() / this.totalTasks()) * 100);

  getActionsForDay(day: number): ActionItem[] {
    return this.actions().filter(a => a.day === day);
  }

  toggleAction(id: string): void {
    this.actions.update(actions =>
      actions.map(a => a.id === id ? { ...a, completed: !a.completed } : a)
    );
  }

  canAccessFull(): boolean {
    return false;
  }
}
