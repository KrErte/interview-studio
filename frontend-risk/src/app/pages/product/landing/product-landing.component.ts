import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/*
===========================================
HEADLINE VARIANTS (for A/B testing)
===========================================
1. "If You Fail This Interview, It Will Be Because of These 3 Things"
2. "What Recruiters Think But Never Tell You"
3. "Your Interview Has a 67% Failure Rate. Here's Why."
4. "The Uncomfortable Truth About Your Resume"
5. "Why You Keep Getting Ghosted After Interviews"
6. "See Inside the Recruiter's Mind"
7. "Your Career Has 3 Fatal Flaws. Find Them."
8. "Stop Guessing Why You're Not Getting Offers"
9. "The Interview Autopsy: What's Killing Your Chances"
10. "Know Exactly Why You'll Fail (Before You Do)"
*/

@Component({
  selector: 'app-product-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- HERO SECTION -->
    <section class="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-b from-red-950/20 via-slate-950 to-slate-950"></div>
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <!-- Warning Badge -->
      <div class="mb-8 animate-pulse">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm">
          <span class="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>{{ lang() === 'en' ? 'WARNING: This analysis is brutally honest' : 'HOIATUS: See analüüs on karmanilmi aus' }}</span>
        </div>
      </div>

      <!-- Main Headline -->
      <h1 class="text-5xl md:text-7xl font-black text-white text-center max-w-4xl leading-tight mb-6">
        {{ lang() === 'en'
          ? 'If You Fail This Interview,'
          : 'Kui Sa Kukud Sellel Intervjuul Läbi,' }}
        <br>
        <span class="text-red-400">
          {{ lang() === 'en'
            ? 'It Will Be Because of These'
            : 'Siis Just Nende Pärast' }}
        </span>
      </h1>

      <!-- Subheadline -->
      <p class="text-xl md:text-2xl text-slate-400 text-center max-w-2xl mb-8">
        {{ lang() === 'en'
          ? 'We analyze your profile against 10,000+ interview outcomes. In 3 minutes, know exactly what will sink you - and how to fix it.'
          : 'Analüüsime sinu profiili 10,000+ intervjuu tulemuse vastu. 3 minutiga tea täpselt, mis sind uppi ajab - ja kuidas seda parandada.' }}
      </p>

      <!-- Social Proof -->
      <div class="flex items-center gap-6 mb-8 text-sm text-slate-500">
        <div class="flex items-center gap-2">
          <span class="text-emerald-400">✓</span>
          <span>{{ assessmentCount | number }} {{ lang() === 'en' ? 'assessments completed' : 'hindamist tehtud' }}</span>
        </div>
        <div class="h-4 w-px bg-slate-700"></div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-400">✓</span>
          <span>{{ lang() === 'en' ? 'Used by engineers at' : 'Kasutavad insenerid firmadest' }} Google, Meta, Stripe</span>
        </div>
      </div>

      <!-- CTA -->
      <button
        routerLink="/autopsy"
        class="group px-10 py-5 bg-white text-slate-900 font-bold text-xl rounded-xl hover:scale-105 transition-all shadow-2xl hover:shadow-white/20 mb-4">
        <span class="flex items-center gap-3">
          {{ lang() === 'en' ? 'Show Me My Failure Points' : 'Näita Minu Läbikukkumispunkte' }}
          <svg class="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      </button>
      <p class="text-sm text-slate-500">{{ lang() === 'en' ? 'Free preview • No signup required' : 'Tasuta eelvaade • Registreerimist pole vaja' }}</p>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- WHY YOU FAIL SECTION -->
    <section class="py-24 px-6 bg-slate-900/50">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'Why You Keep Getting Rejected' : 'Miks Sind Pidevalt Tagasi Lükatakse' }}
          </h2>
          <p class="text-slate-400 max-w-2xl mx-auto">
            {{ lang() === 'en'
              ? 'These are not generic tips. These are the specific reasons you - based on your actual profile - are not converting.'
              : 'Need pole uldised nouanded. Need on konkreetsed pohjused, miks sina - sinu tegeliku profiili pohjal - ei konverteeru.' }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Reason 1 -->
          <div class="bg-slate-900 border border-red-500/30 rounded-2xl p-6 hover:border-red-500/60 transition-colors">
            <div class="text-4xl mb-4">🎯</div>
            <div class="text-red-400 text-sm font-bold mb-2">{{ lang() === 'en' ? '#1 KILLER' : '#1 TAPJA' }}</div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ lang() === 'en' ? 'Unclear Career Story' : 'Ebaselge Karjäärilugu' }}
            </h3>
            <p class="text-slate-400 text-sm">
              {{ lang() === 'en'
                ? '"Why are you here?" - if you can\'t answer this clearly in 30 seconds, the interview is already lost.'
                : '"Miks sa siin oled?" - kui sa ei saa sellele selgelt 30 sekundiga vastata, on intervjuu juba kaotatud.' }}
            </p>
          </div>

          <!-- Reason 2 -->
          <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 hover:border-amber-500/60 transition-colors">
            <div class="text-4xl mb-4">📊</div>
            <div class="text-amber-400 text-sm font-bold mb-2">{{ lang() === 'en' ? '#2 KILLER' : '#2 TAPJA' }}</div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ lang() === 'en' ? 'Zero Proof of Impact' : 'Null Tõendit Mõjust' }}
            </h3>
            <p class="text-slate-400 text-sm">
              {{ lang() === 'en'
                ? '"Improved performance" means nothing. Numbers create trust. No numbers = you\'re probably exaggerating.'
                : '"Parandasin jõudlust" ei tähenda midagi. Numbrid loovad usaldust. Pole numbreid = sa ilmselt liialdad.' }}
            </p>
          </div>

          <!-- Reason 3 -->
          <div class="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/60 transition-colors">
            <div class="text-4xl mb-4">🪞</div>
            <div class="text-purple-400 text-sm font-bold mb-2">{{ lang() === 'en' ? '#3 KILLER' : '#3 TAPJA' }}</div>
            <h3 class="text-xl font-bold text-white mb-3">
              {{ lang() === 'en' ? 'Confidence Mismatch' : 'Enesekindluse Sobimatus' }}
            </h3>
            <p class="text-slate-400 text-sm">
              {{ lang() === 'en'
                ? 'You think you\'re Senior. They see Mid-Level. This gap is killing your callbacks.'
                : 'Sa arvad, et oled Senior. Nemad näevad Mid-Level. See lõhe tapab sinu tagasihelistamised.' }}
            </p>
          </div>
        </div>

        <div class="text-center mt-12">
          <a routerLink="/autopsy" class="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium">
            <span>{{ lang() === 'en' ? 'See your specific failure points' : 'Vaata oma konkreetseid läbikukkumispunkte' }}</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? '3 Minutes to Know Your Odds' : '3 Minutit Oma Võimaluste Teadmiseks' }}
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (step of steps(); track step.number) {
            <div class="text-center">
              <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-900 font-black text-2xl mx-auto mb-6">
                {{ step.number }}
              </div>
              <h3 class="text-xl font-bold text-white mb-3">{{ lang() === 'en' ? step.title : step.titleEt }}</h3>
              <p class="text-slate-400">{{ lang() === 'en' ? step.description : step.descriptionEt }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- WHAT YOU GET -->
    <section class="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'Your Complete Interview Autopsy' : 'Sinu Täielik Intervjuu Lahkamine' }}
          </h2>
          <p class="text-slate-400">{{ lang() === 'en' ? 'Everything you need to stop failing and start winning' : 'Kõik mida vajad, et lõpetada läbikukkumine ja alustada võitmist' }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          @for (feature of features(); track feature.title) {
            <div class="flex gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-colors">
              <div class="text-4xl flex-shrink-0">{{ feature.icon }}</div>
              <div>
                <h3 class="font-bold text-white mb-2">{{ lang() === 'en' ? feature.title : feature.titleEt }}</h3>
                <p class="text-slate-400 text-sm">{{ lang() === 'en' ? feature.description : feature.descriptionEt }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS / RESULTS -->
    <section class="py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'Real Results, Not Promises' : 'Tõelised Tulemused, Mitte Lubadused' }}
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-8 mb-12">
          @for (stat of stats(); track stat.value) {
            <div class="text-center">
              <div class="text-5xl font-black text-emerald-400 mb-2">{{ stat.value }}</div>
              <div class="text-slate-400">{{ lang() === 'en' ? stat.label : stat.labelEt }}</div>
            </div>
          }
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          @for (testimonial of testimonials(); track testimonial.name) {
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {{ testimonial.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-bold text-white">{{ testimonial.name }}</div>
                  <div class="text-sm text-slate-400">{{ testimonial.role }}</div>
                </div>
              </div>
              <p class="text-slate-300 italic">"{{ lang() === 'en' ? testimonial.quote : testimonial.quoteEt }}"</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section class="py-24 px-6 bg-slate-900/50">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'One Report. One Shot.' : 'Üks Raport. Üks Võimalus.' }}
          </h2>
          <p class="text-slate-400">
            {{ lang() === 'en'
              ? 'How much is not getting that job costing you? €14.99 vs months of uncertainty.'
              : 'Kui palju maksab sulle selle töö mitte saamine? €14.99 vs kuud ebakindlust.' }}
          </p>
        </div>

        <!-- Main CTA Card -->
        <div class="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto">
          <div class="text-sm text-emerald-400 font-bold mb-4">{{ lang() === 'en' ? 'INTERVIEW READINESS REPORT' : 'INTERVJUUVALMIDUSE RAPORT' }}</div>

          <div class="flex items-end justify-center gap-2 mb-6">
            <span class="text-6xl font-black text-white">€14.99</span>
            <span class="text-slate-400 mb-2">{{ lang() === 'en' ? 'one-time' : 'ühekordne' }}</span>
          </div>

          <ul class="text-left space-y-3 mb-8 max-w-sm mx-auto">
            <li class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">✓</span>
              {{ lang() === 'en' ? 'Full Interview Failure Autopsy' : 'Täielik Intervjuu Läbikukkumise Lahkamine' }}
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">✓</span>
              {{ lang() === 'en' ? 'Recruiter Perception Analysis' : 'Värbaja Tajumise Analüüs' }}
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">✓</span>
              {{ lang() === 'en' ? 'Confidence Reality Check' : 'Enesekindluse Reaalsuse Kontroll' }}
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">✓</span>
              {{ lang() === 'en' ? '72-Hour Action Plan' : '72-Tunnine Tegevusplaan' }}
            </li>
            <li class="flex items-center gap-2 text-slate-300">
              <span class="text-emerald-400">✓</span>
              {{ lang() === 'en' ? 'PDF export' : 'PDF eksport' }}
            </li>
          </ul>

          <button class="w-full py-5 bg-emerald-500 text-slate-900 font-bold text-xl rounded-xl hover:bg-emerald-400 transition-colors mb-4">
            {{ lang() === 'en' ? 'Get My Report Now' : 'Saa Oma Raport Kohe' }}
          </button>

          <p class="text-sm text-slate-500">
            🛡️ {{ lang() === 'en' ? '30-day money-back guarantee' : '30-päevane raha tagasi garantii' }}
          </p>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-black text-white mb-4">
            {{ lang() === 'en' ? 'Questions?' : 'Küsimused?' }}
          </h2>
        </div>

        <div class="space-y-4">
          @for (faq of faqs(); track faq.question) {
            <details class="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <summary class="flex items-center justify-between p-6 cursor-pointer list-none">
                <span class="font-medium text-white">{{ lang() === 'en' ? faq.question : faq.questionEt }}</span>
                <span class="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div class="px-6 pb-6 text-slate-400">
                {{ lang() === 'en' ? faq.answer : faq.answerEt }}
              </div>
            </details>
          }
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="py-24 px-6 bg-gradient-to-t from-red-950/20 to-slate-950">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl md:text-5xl font-black text-white mb-6">
          {{ lang() === 'en' ? 'Your Next Interview Is Coming.' : 'Sinu Järgmine Intervjuu On Tulemas.' }}
          <br>
          <span class="text-red-400">{{ lang() === 'en' ? 'Will You Be Ready?' : 'Kas Sa Oled Valmis?' }}</span>
        </h2>
        <p class="text-slate-400 text-lg mb-8">
          {{ lang() === 'en'
            ? 'Every week you wait is another opportunity lost to someone who prepared better.'
            : 'Iga nädal, mida sa ootad, on veel üks võimalus kaotatud kellelegi, kes valmistus paremini.' }}
        </p>
        <button routerLink="/autopsy" class="px-12 py-6 bg-white text-slate-900 font-bold text-xl rounded-xl hover:scale-105 transition-all shadow-2xl">
          {{ lang() === 'en' ? 'Start My Free Analysis →' : 'Alusta Minu Tasuta Analüüsi →' }}
        </button>
      </div>
    </section>
  `
})
export class ProductLandingComponent implements OnInit, OnDestroy {
  lang = signal<'en' | 'et'>('en');
  assessmentCount = 12847;
  private counterInterval: any;

  steps = signal([
    {
      number: 1,
      title: 'Share Your Profile',
      titleEt: 'Jaga Oma Profiili',
      description: 'Upload your resume or connect LinkedIn. Takes 60 seconds.',
      descriptionEt: 'Lae üles oma CV või ühenda LinkedIn. Võtab 60 sekundit.'
    },
    {
      number: 2,
      title: 'Get Autopsy Report',
      titleEt: 'Saa Lahkamisraport',
      description: 'AI analyzes your profile against 10,000+ interview outcomes.',
      descriptionEt: 'AI analüüsib sinu profiili 10,000+ intervjuu tulemuse vastu.'
    },
    {
      number: 3,
      title: 'Fix & Win',
      titleEt: 'Paranda & Võida',
      description: 'Follow your 72-hour action plan. Walk in prepared.',
      descriptionEt: 'Järgi oma 72-tunnist tegevusplaani. Mine sisse valmistunult.'
    }
  ]);

  features = signal([
    {
      icon: '💀',
      title: 'Interview Failure Autopsy',
      titleEt: 'Intervjuu Läbikukkumise Lahkamine',
      description: 'Your top 3 interview killers with specific fixes. What recruiters think but never say.',
      descriptionEt: 'Sinu top 3 intervjuu tapjat konkreetsete parandusega. Mida värbajad mõtlevad, aga kunagi ei ütle.'
    },
    {
      icon: '🪞',
      title: 'Recruiter Mirror View',
      titleEt: 'Värbaja Peeglivaade',
      description: 'See exactly how hiring managers perceive you in their 7.4-second scan.',
      descriptionEt: 'Vaata täpselt, kuidas personalijuhid sind tajuvad oma 7.4-sekundi skaneeringus.'
    },
    {
      icon: '⚖️',
      title: 'Confidence Delta',
      titleEt: 'Enesekindluse Delta',
      description: 'The gap between what you think you\'re worth and what the market says.',
      descriptionEt: 'Lõhe selle vahel, mida sa arvad end väärt olevat ja mida turg ütleb.'
    },
    {
      icon: '⚡',
      title: '72-Hour Action Plan',
      titleEt: '72-Tunnine Tegevusplaan',
      description: 'Specific, timed actions to fix critical issues before your interview.',
      descriptionEt: 'Konkreetsed, ajastatud tegevused kriitiliste probleemide parandamiseks enne intervjuud.'
    }
  ]);

  stats = signal([
    { value: '73%', label: 'increase in callback rate', labelEt: 'tagasihelistamise määra tõus' },
    { value: '2.3x', label: 'more offers received', labelEt: 'rohkem pakkumisi saadud' },
    { value: '89%', label: 'found critical blind spots', labelEt: 'leidsid kriitilised pimedad nurgad' }
  ]);

  testimonials = signal([
    {
      name: 'Marcus K.',
      role: 'Senior Engineer → Staff at Stripe',
      quote: 'The recruiter view was brutal but exactly what I needed. Landed my dream job 3 weeks later.',
      quoteEt: 'Värbaja vaade oli karm, aga täpselt mida ma vajasin. Sain oma unistuste töö 3 nädalat hiljem.'
    },
    {
      name: 'Sarah L.',
      role: 'Mid-Level → Senior at Meta',
      quote: 'I was overconfident about my system design skills. The delta analysis showed me the truth. Fixed it, got the offer.',
      quoteEt: 'Olin ülekindel oma süsteemi disaini oskuste osas. Delta analüüs näitas mulle tõde. Parandasin, sain pakkumise.'
    }
  ]);

  faqs = signal([
    {
      question: 'How accurate is the analysis?',
      questionEt: 'Kui täpne on analüüs?',
      answer: 'Our model is trained on 10,000+ real interview outcomes. It\'s not perfect, but it\'s significantly better than guessing or getting feedback from friends who don\'t want to hurt your feelings.',
      answerEt: 'Meie mudel on treenitud 10,000+ tegeliku intervjuu tulemusel. See pole täiuslik, aga see on oluliselt parem kui arvamine või tagasiside sõpradelt, kes ei taha sinu tundeid riivata.'
    },
    {
      question: 'What if I don\'t have an interview scheduled?',
      questionEt: 'Mis siis, kui mul pole intervjuud planeeritud?',
      answer: 'Even better. Fix your issues now so you\'re ready when the opportunity comes. Most people prepare when it\'s already too late.',
      answerEt: 'Veelgi parem. Paranda oma probleemid nüüd, et oleksid valmis, kui võimalus tuleb. Enamik inimesi valmistub, kui on juba liiga hilja.'
    },
    {
      question: 'Is my data safe?',
      questionEt: 'Kas mu andmed on turvalised?',
      answer: 'Yes. We don\'t share or sell your data. Analysis runs locally where possible. You can delete your data anytime.',
      answerEt: 'Jah. Me ei jaga ega müü sinu andmeid. Analüüs jookseb lokaalselt, kus võimalik. Saad oma andmed igal ajal kustutada.'
    },
    {
      question: 'What\'s the money-back guarantee?',
      questionEt: 'Mis on raha tagasi garantii?',
      answer: 'If you don\'t see value within 30 days, email us and we\'ll refund you. No questions asked.',
      answerEt: 'Kui sa ei näe väärtust 30 päeva jooksul, saada meile email ja me tagastame raha. Küsimusi ei esitata.'
    }
  ]);

  ngOnInit() {
    this.counterInterval = setInterval(() => {
      this.assessmentCount += Math.floor(Math.random() * 3);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.counterInterval) clearInterval(this.counterInterval);
  }
}
