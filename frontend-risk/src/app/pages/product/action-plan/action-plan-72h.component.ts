import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950 text-white">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-6">
            <span>*</span>
            <span>{{ lang() === 'en' ? '72-HOUR ACTION PLAN' : '72-TUNNINE TEGEVUSPLAAN' }}</span>
          </div>

          <h1 class="text-4xl md:text-5xl font-black mb-4">
            {{ lang() === 'en' ? 'Do This' : 'Tee Seda' }}
            <span class="text-emerald-400">{{ lang() === 'en' ? ' Before Your Interview' : ' Enne Intervjuud' }}</span>
          </h1>

          <p class="text-slate-400 text-lg max-w-2xl mx-auto">
            {{ lang() === 'en' ? 'Specific, timed actions that will materially improve your chances. Not theory - tactics.' : 'Konkreetsed, ajastatud tegevused, mis oluliselt parandavad sinu voimalusi. Mitte teooria - taktika.' }}
          </p>
        </div>

        <div class="bg-gradient-to-r from-emerald-900/30 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-slate-400 mb-1">{{ lang() === 'en' ? 'Time until interview-ready:' : 'Aeg intervjuuvalmiduseni:' }}</div>
              <div class="text-3xl font-bold text-emerald-400">72:00:00</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-white">{{ totalTasks() }}</div>
                <div class="text-xs text-slate-400">{{ lang() === 'en' ? 'Total Tasks' : 'Ulesandeid' }}</div>
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
          <div class="mt-4">
            <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="progressPercent()"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-8">
          <ng-container *ngFor="let dayTheme of dailyThemes()">
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center" [ngClass]="{'border-emerald-500': currentDay() === dayTheme.day, 'bg-emerald-500-5': currentDay() === dayTheme.day}">
              <div class="text-3xl mb-2">{{ dayTheme.icon }}</div>
              <div class="text-xs text-slate-400 mb-1">{{ lang() === 'en' ? 'Day' : 'Paev' }} {{ dayTheme.day }}</div>
              <div class="font-bold text-white">{{ lang() === 'en' ? dayTheme.theme : dayTheme.themeEt }}</div>
              <div class="text-xs text-slate-500 mt-1">{{ lang() === 'en' ? dayTheme.focus : dayTheme.focusEt }}</div>
            </div>
          </ng-container>
        </div>

        <ng-container *ngFor="let dayTheme of dailyThemes()">
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">{{ dayTheme.icon }}</div>
              <div>
                <h2 class="text-xl font-bold text-white">{{ lang() === 'en' ? 'Day' : 'Paev' }} {{ dayTheme.day }}: {{ lang() === 'en' ? dayTheme.theme : dayTheme.themeEt }}</h2>
                <p class="text-sm text-slate-400">{{ lang() === 'en' ? dayTheme.focus : dayTheme.focusEt }}</p>
              </div>
            </div>

            <div class="space-y-3">
              <ng-container *ngFor="let action of getActionsForDay(dayTheme.day)">
                <div class="bg-slate-900 border rounded-xl overflow-hidden transition-all" [ngClass]="getActionClasses(action)">
                  <div class="p-4">
                    <div class="flex items-start gap-4">
                      <button (click)="toggleAction(action.id)" class="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors" [ngClass]="getCheckboxClasses(action)">
                        <svg *ngIf="action.completed" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>

                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-xs px-2 py-0.5 rounded" [ngClass]="getPriorityClasses(action.priority)">{{ action.priority | uppercase }}</span>
                          <span class="text-xs text-slate-500">{{ action.duration }}</span>
                          <span class="text-xs text-slate-600">-</span>
                          <span class="text-xs text-slate-500">{{ lang() === 'en' ? 'Hour' : 'Tund' }} {{ action.hour }}</span>
                        </div>

                        <h3 class="font-medium text-white" [class.line-through]="action.completed" [class.text-slate-500]="action.completed">{{ lang() === 'en' ? action.title : action.titleEt }}</h3>

                        <ng-container *ngIf="!action.locked">
                          <p class="text-sm text-slate-400 mt-1">{{ lang() === 'en' ? action.description : action.descriptionEt }}</p>
                          <div class="mt-2 text-xs text-emerald-400">{{ lang() === 'en' ? 'Impact:' : 'Moju:' }} {{ lang() === 'en' ? action.impact : action.impactEt }}</div>
                        </ng-container>
                        <div *ngIf="action.locked" class="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <span>locked</span>
                          <span>{{ lang() === 'en' ? 'Unlock to see details' : 'Ava detailide nagemiseks' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </ng-container>

        <div *ngIf="!canAccessFull()" class="relative mb-8">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 blur-sm">
            <h2 class="text-xl font-bold mb-4">{{ lang() === 'en' ? 'Advanced Interview Tactics' : 'Taiustatud Intervjuu Taktikad' }}</h2>
            <div class="space-y-4">
              <div class="h-16 bg-slate-800 rounded-xl"></div>
              <div class="h-16 bg-slate-800 rounded-xl"></div>
              <div class="h-16 bg-slate-800 rounded-xl"></div>
              <div class="h-16 bg-slate-800 rounded-xl"></div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-2xl">
            <div class="text-center p-8">
              <div class="text-4xl mb-4">target</div>
              <h3 class="text-xl font-bold text-white mb-2">{{ lang() === 'en' ? '8 More High-Impact Actions' : '8 Suure Mojuga Tegevust Veel' }}</h3>
              <p class="text-slate-400 mb-6 max-w-sm">{{ lang() === 'en' ? 'Including: Interview answer templates, salary negotiation scripts, and follow-up email templates.' : 'Sisaldab: Intervjuu vastuste mallid, palgalabirakimiste skriptid ja jarelmeilide mallid.' }}</p>
              <button class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform">{{ lang() === 'en' ? 'Unlock Full Plan - 14.99 EUR' : 'Ava Taielik Plaan - 14.99 EUR' }}</button>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-amber-900/30 to-slate-900 border border-amber-500/30 rounded-2xl p-8 mb-8">
          <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>*</span>
            {{ lang() === 'en' ? 'Quick Win: Do This RIGHT NOW' : 'Kiire Voit: Tee Seda KOHE' }}
          </h2>

          <div class="p-4 bg-slate-900/50 rounded-xl">
            <div class="flex items-start gap-4">
              <div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 font-bold flex-shrink-0">1</div>
              <div>
                <h3 class="font-bold text-white mb-2">{{ lang() === 'en' ? 'Open your resume and add ONE specific metric to your current job' : 'Ava oma CV ja lisa UKS konkreetne moodik oma praegusele toole' }}</h3>
                <p class="text-slate-400 text-sm">{{ lang() === 'en' ? 'Example: Improved API response time becomes Reduced API response time by 40%' : 'Naide: Parandasin API vastuse aega muutub Vahendasin API vastuse aega 40%' }}</p>
                <div class="mt-3 text-xs text-amber-400">{{ lang() === 'en' ? 'Takes 5 minutes. Increases callback rate by 23%.' : 'Votab 5 minutit. Tostab tagasihelistamise maara 23%.' }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center py-8">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 inline-block">
            <div class="text-lg text-slate-300 mb-4">
              {{ lang() === 'en' ? 'Your interview is in' : 'Sinu intervjuu on' }}
              <span class="text-emerald-400 font-bold">{{ daysUntilInterview() }} {{ lang() === 'en' ? 'days' : 'paeva parast' }}</span>
            </div>
            <div class="text-3xl font-black text-white mb-6">{{ lang() === 'en' ? 'Will you be ready?' : 'Kas sa oled valmis?' }}</div>
            <button class="px-10 py-5 bg-white text-slate-900 font-bold rounded-xl text-lg hover:scale-105 transition-transform shadow-2xl">{{ lang() === 'en' ? 'Get Complete Preparation Kit - 14.99 EUR' : 'Saa Taielik Ettevalmistuskomplekt - 14.99 EUR' }}</button>
            <p class="text-xs text-slate-500 mt-3">{{ lang() === 'en' ? 'Includes: Full autopsy report + Recruiter view + All 72h actions + Interview scripts' : 'Sisaldab: Taielik lahkamisraport + Varbaja vaade + Koik 72h tegevused + Intervjuu skriptid' }}</p>
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
    { day: 1, theme: 'Profile Surgery', themeEt: 'Profiili Operatsioon', icon: 'knife', focus: 'Fix critical profile issues', focusEt: 'Paranda kriitilised profiili vead' },
    { day: 2, theme: 'Story Crafting', themeEt: 'Loo Loomine', icon: 'book', focus: 'Perfect your narrative', focusEt: 'Viimistle oma narratiiv' },
    { day: 3, theme: 'Battle Prep', themeEt: 'Lahingu Ettevalmistus', icon: 'swords', focus: 'Practice and polish', focusEt: 'Harjuta ja lihvi' }
  ]);

  actions = signal<ActionItem[]>([
    { id: '1-1', day: 1, hour: 1, priority: 'critical', title: 'Add metrics to your top 2 job entries', titleEt: 'Lisa moodikud oma 2 peamisele tookandele', description: 'Replace vague claims with specific numbers.', descriptionEt: 'Asenda ebamaarased vaited konkreetsete numbritega.', duration: '45 min', impact: 'Increases recruiter interest by 31%', impactEt: 'Tostab varbaja huvi 31%', completed: false },
    { id: '1-2', day: 1, hour: 3, priority: 'critical', title: 'Rewrite your summary in 3 sentences', titleEt: 'Kirjuta oma kokkuvote umber 3 lausega', description: 'Formula: I am role who specializes in 2-3 things.', descriptionEt: 'Valem: Olen roll, kes spetsialiseerub 2-3 asja.', duration: '30 min', impact: 'First thing recruiters read - make it count', impactEt: 'Esimene asi, mida varbajad loevad - tee see loota', completed: false },
    { id: '1-3', day: 1, hour: 5, priority: 'high', title: 'Remove red flag triggers', titleEt: 'Eemalda punaste lippude paastikud', description: 'Delete buzzwords without proof and unexplained gaps.', descriptionEt: 'Kustuta moeshonad ilma toenditeta ja seletamata pausid.', duration: '30 min', impact: 'Prevents 23% of instant rejections', impactEt: 'Hoiab ara 23% kohestest tagasilukkamistest', completed: false },
    { id: '1-4', day: 1, hour: 7, priority: 'medium', title: 'Update LinkedIn headline', titleEt: 'Uuenda LinkedIn pealkirja', description: 'Include specialization and key results.', descriptionEt: 'Sisalda spetsialiseerumine ja votmetulemused.', duration: '15 min', impact: 'Appears in recruiter searches', impactEt: 'Ilmub varbaja otsingutes', completed: false },
    { id: '2-1', day: 2, hour: 1, priority: 'critical', title: 'Write your career story in 90 seconds', titleEt: 'Kirjuta oma karjaarilugu 90 sekundiga', description: 'Structure: Past, Present, Future.', descriptionEt: 'Struktuur: Minevik, Olevik, Tulevik.', duration: '1 hour', impact: 'Sets the tone for entire interview', impactEt: 'Seab tooni kogu intervjuule', completed: false },
    { id: '2-2', day: 2, hour: 3, priority: 'critical', title: 'Prepare 3 STAR stories', titleEt: 'Valmista ette 3 STAR lugu', description: 'Situation-Task-Action-Result format.', descriptionEt: 'Olukord-Ulesanne-Tegevus-Tulemus formaat.', duration: '1.5 hours', impact: 'Covers 80% of behavioral questions', impactEt: 'Katab 80% kaitumuslikest kusimustest', completed: false },
    { id: '2-3', day: 2, hour: 6, priority: 'high', title: 'Research the company deeply', titleEt: 'Uuri ettevotet pohjalikult', description: 'Find recent news and interviewer profiles.', descriptionEt: 'Leia viimased uudised ja intervjueerija profiilid.', duration: '45 min', impact: 'Enables personalized questions', impactEt: 'Voimaldab isikuparastatud kusimusi', completed: false },
    { id: '2-4', day: 2, hour: 8, priority: 'medium', title: 'Prepare 5 questions to ask them', titleEt: 'Valmista 5 kusimust neile', description: 'Show that you have researched the company.', descriptionEt: 'Naita, et oled ettevotet uurinud.', duration: '30 min', impact: 'Smart questions get offers 40% more often', impactEt: 'Targad kusimused saavad pakkumisi 40% sagedamini', completed: false },
    { id: '3-1', day: 3, hour: 1, priority: 'critical', title: 'Practice your intro out loud 5 times', titleEt: 'Harjuta oma sissejuhatust valjult 5 korda', description: 'Record yourself, listen, fix, repeat.', descriptionEt: 'Salvesta ennast, kuula, paranda, korda.', duration: '30 min', impact: 'Reduces filler words by 60%', impactEt: 'Vahendab taitesonu 60%', completed: false },
    { id: '3-2', day: 3, hour: 3, priority: 'high', title: 'Run through STAR stories once', titleEt: 'Kai STAR lood uks kord labi', description: 'Each story should be 2-3 minutes max.', descriptionEt: 'Iga lugu peaks olema max 2-3 minutit.', duration: '45 min', impact: 'Prevents rambling - top interview killer', impactEt: 'Hoiab ara jauramist - peamine intervjuu tapja', completed: false },
    { id: '3-3', day: 3, hour: 5, priority: 'high', title: 'Prep your environment', titleEt: 'Valmista oma keskkond', description: 'Test camera, mic, lighting if video call.', descriptionEt: 'Testi kaamera, mikrofon, valgus kui video.', duration: '20 min', impact: 'Technical issues create negative impression', impactEt: 'Tehnilised probleemid loovad negatiivse mulje', completed: false },
    { id: '3-4', day: 3, hour: 7, priority: 'medium', title: 'Review salary research', titleEt: 'Vaata ule palgauuring', description: 'Know your number and walk-away point.', descriptionEt: 'Tea oma numbrit ja lahkumispunkti.', duration: '15 min', impact: 'Prepared candidates negotiate 15% higher', impactEt: 'Ettevalmistunud kandidaadid labirrakivad 15% korgemaid', completed: false, locked: true },
    { id: '3-5', day: 3, hour: 8, priority: 'medium', title: 'Sleep 8 hours', titleEt: 'Maga 8 tundi', description: 'Sleep-deprived candidates perform 25% worse.', descriptionEt: 'Unest ilma jaanud kandidaadid sooritavad 25% halvemini.', duration: '8 hours', impact: 'Best ROI activity you can do', impactEt: 'Parim ROI tegevus mida saad teha', completed: false }
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

  getActionClasses(action: ActionItem): Record<string, boolean> {
    return {
      'border-emerald-500/50 bg-emerald-500/5': !!action.completed,
      'border-red-500/30': !action.completed && action.priority === 'critical',
      'border-amber-500/30': !action.completed && action.priority === 'high',
      'border-slate-800': !action.completed && action.priority === 'medium'
    };
  }

  getCheckboxClasses(action: ActionItem): Record<string, boolean> {
    return {
      'bg-emerald-500 border-emerald-500 text-white': !!action.completed,
      'border-red-500/50 hover:border-red-500': !action.completed && action.priority === 'critical',
      'border-amber-500/50 hover:border-amber-500': !action.completed && action.priority === 'high',
      'border-slate-600 hover:border-slate-400': !action.completed && action.priority === 'medium'
    };
  }

  getPriorityClasses(priority: string): Record<string, boolean> {
    return {
      'bg-red-500/20 text-red-400': priority === 'critical',
      'bg-amber-500/20 text-amber-400': priority === 'high',
      'bg-slate-700 text-slate-400': priority === 'medium'
    };
  }

  canAccessFull(): boolean {
    return false;
  }
}
