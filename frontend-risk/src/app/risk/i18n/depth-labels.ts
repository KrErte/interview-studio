export const DEPTH_LABELS = {
  et: {
    sectionTitle: 'Analüüsi sügavus',
    quick: {
      title: 'Kiire ülevaade',
      bullets: ['3 küsimust', '~5 minutit', 'Kohene tulemus'],
      tooltip:
        'Saad üldise pildi oma tulevikukindlusest. Sobib kiireks enesehinnangu kontrolliks.'
    },
    deep: {
      title: 'Põhjalik analüüs',
      bullets: ['6–8 küsimust', '~12 minutit', '+ Isiklik tegevuskava'],
      tooltip:
        'Põhjalikum hindamine annab täpsema skoori ja konkreetse tegevuskava oskuste arendamiseks.'
    },
    advanced: {
      show: 'Näita täpsemaid seadeid',
      hide: 'Peida täpsemad seaded',
      personaTitle: 'Analüüsija persona',
      personaSubtitle: 'Vali, millise nurga alt soovid tagasisidet',
      personaNote: 'Persona mõjutab tagasiside tooni ja fookust, mitte hindamise täpsust.',
      personaDisabled: 'Persona valik on saadaval põhjaliku analüüsi puhul.'
    },
    badge: {
      quick: 'Kiire',
      deep: 'Põhjalik',
      tooltipQuick: 'Kiire ülevaade: 3 küsimust, üldine skoor',
      tooltipDeep: 'Põhjalik analüüs: 6–8 küsimust, täpne skoor, tegevuskava'
    },
    personas: {
      BALANCED: { name: 'Tasakaal', subtitle: 'Neutraalne ülevaade' },
      NAVIGATOR: { name: 'Navigaator', subtitle: 'Süsteemne lähenemine' },
      ANALYST: { name: 'Analüütik', subtitle: 'Andmepõhine tagasiside' },
      ENGINEER: { name: 'Insener', subtitle: 'Tehniline fookus' },
      EVALUATOR: { name: 'Hindaja', subtitle: 'Objektiivne skoor' },
      RISK_OFFICER: { name: 'Riskijuht', subtitle: 'Ohud ja maandused' },
      COACH: { name: 'Koutš', subtitle: 'Inimlik tagasiside' }
    }
  },
  en: {
    sectionTitle: 'Analysis Depth',
    quick: {
      title: 'Quick Overview',
      bullets: ['3 questions', '~5 minutes', 'Instant result'],
      tooltip: 'Get a general picture of your futureproofing. Good for a quick self-check.'
    },
    deep: {
      title: 'Deep Analysis',
      bullets: ['6–8 questions', '~12 minutes', '+ Personal action plan'],
      tooltip: 'A thorough assessment gives you a more accurate score and a concrete action plan.'
    },
    advanced: {
      show: 'Show advanced settings',
      hide: 'Hide advanced settings',
      personaTitle: 'Analyst Persona',
      personaSubtitle: 'Choose your feedback perspective',
      personaNote: 'Persona affects feedback tone and focus, not assessment accuracy.',
      personaDisabled: 'Persona selection is available for deep analysis.'
    },
    badge: {
      quick: 'Quick',
      deep: 'Deep',
      tooltipQuick: 'Quick overview: 3 questions, general score',
      tooltipDeep: 'Deep analysis: 6–8 questions, precise score, action plan'
    },
    personas: {
      BALANCED: { name: 'Balanced', subtitle: 'Neutral overview' },
      NAVIGATOR: { name: 'Navigator', subtitle: 'Systems-first lens' },
      ANALYST: { name: 'Analyst', subtitle: 'Data-grounded feedback' },
      ENGINEER: { name: 'Engineer', subtitle: 'Technical focus' },
      EVALUATOR: { name: 'Evaluator', subtitle: 'Objective scoring' },
      RISK_OFFICER: { name: 'Risk Officer', subtitle: 'Risks & mitigations' },
      COACH: { name: 'Coach', subtitle: 'Human-centered feedback' }
    }
  }
} as const;

export type SupportedLang = keyof typeof DEPTH_LABELS;
export type DepthLabels = (typeof DEPTH_LABELS)[SupportedLang];

