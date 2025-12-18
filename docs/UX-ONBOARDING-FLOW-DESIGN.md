# Tulevikukindlus – Uus Lineaarne Kasutajateekonna Disain
## UX Flow Design Document v1.0

---

# OSA A: EESTI KEELES

## 1. SAMM-SAMMULT UX VOOG

### Ülevaade
Kasutaja läbib **4 põhietappi**, iga etapp ühe peamise tegevusega:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. PROFIIL │ →  │ 2. KÜSIMUSED│ →  │ 3. HINNANG  │ →  │ 4. TEGEVUS- │
│    (Profiil)│    │  (Küsimused)│    │  (Hinnang)  │    │    KAVA     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

### Samm 1: PROFIIL
**Eesmärk:** Koguda kasutaja taustandmed (CV + roll + kogemus)

| Element | Kirjeldus |
|---------|-----------|
| **Pealkiri** | "Alustame sinu profiiliga" |
| **Abikirjeldus** | "Lae üles CV ja täida põhiandmed, et saaksime sinu oskusi analüüsida." |
| **Edusammude näidik** | "Samm 1/4 – Profiil" |
| **Peamine CTA** | "Jätka küsimustega →" (aktiivne ainult kui kohustuslikud väljad täidetud) |
| **Sekundaarne CTA** | "Salvesta ja jätka hiljem" (link-stiilis) |

**Andmeväljad:**
- CV üleslaadimine (PDF) – **kohustuslik**
- Praegune roll (tekstiväli) – **kohustuslik**
- Sihtroll (tekstiväli) – **kohustuslik**
- Kogemuse aastad (number) – **kohustuslik**
- Põhioskused (komaga eraldatud) – valikuline

---

### Samm 2: KÜSIMUSED (3 küsimust, üks korraga)
**Eesmärk:** Täpsustada kasutaja eesmärke ja konteksti

| Element | Kirjeldus |
|---------|-----------|
| **Pealkiri** | "Küsimus [1/3]", "Küsimus [2/3]", "Küsimus [3/3]" |
| **Abikirjeldus** | "Sinu vastused aitavad meil koostada personaalse hinnangu." |
| **Edusammude näidik** | "Samm 2/4 – Küsimused" |
| **Peamine CTA** | "Järgmine küsimus →" (küsimus 1-2), "Näita hinnangut →" (küsimus 3) |
| **Sekundaarne CTA** | "← Tagasi" |

**Näiteküsimused:**
1. "Milline on sinu suurim väljakutse praeguses rollis?"
2. "Mis on sinu karjääri peamine eesmärk järgmise aasta jooksul?"
3. "Milliseid oskusi soovid kõige rohkem arendada?"

---

### Samm 3: HINNANG
**Eesmärk:** Näidata analüüsi tulemusi (skoor + usaldusväärsus + nõrkused)

| Element | Kirjeldus |
|---------|-----------|
| **Pealkiri** | "Sinu hinnang" |
| **Abikirjeldus** | "Siin on meie analüüs sinu profiili ja vastuste põhjal." |
| **Edusammude näidik** | "Samm 3/4 – Hinnang" |
| **Peamine CTA** | "Koosta tegevuskava →" |
| **Sekundaarne CTA** | "Vaata detaile" (accordion/modal) |

**Kuvatavad andmed:**
- **Sobivusskoor** (0-100%) – suur number
- **Usaldusväärsus** (Madal/Keskmine/Kõrge) – badge
- **TOP 3 arendamist vajavat oskust** – nummerdatud nimekiri
- **Tugevused** – märgiste rida (max 5)

---

### Samm 4: TEGEVUSKAVA
**Eesmärk:** Näidata personaalset arengukava ja alustada tegevust

| Element | Kirjeldus |
|---------|-----------|
| **Pealkiri** | "Sinu tegevuskava" |
| **Abikirjeldus** | "Personaalne plaan sinu eesmärkide saavutamiseks." |
| **Edusammude näidik** | "Samm 4/4 – Tegevuskava" (lõpetatud!) |
| **Peamine CTA** | "Alusta treeningut →" |
| **Sekundaarne CTA** | "Ekspordi PDF-ina" |

**Kuvatavad andmed:**
- **Perioodi valik:** 7 päeva / 30 päeva / 90 päeva (tab-stiilis)
- **Päeva kaardid:** Iga päev näitab: pealkiri, kirjeldus, praktikaülesanne
- **Edenemise riba:** X/Y ülesannet täidetud

---

## 2. LEHE PAIGUTUSE KIRJELDUSED (Wireframe)

### Samm 1: PROFIIL
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR: Logo | ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ | Kasutaja ▼ | Logi välja] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ EDUSAMMUDE RIBA: [●━━○━━○━━○] Samm 1/4 – Profiil    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON A: PEALKIRI                                    │  │
│  │ H1: "Alustame sinu profiiliga"                       │  │
│  │ p: "Lae üles CV ja täida põhiandmed..."             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │ TSOON B: CV UPLOAD   │  │ TSOON C: VORM            │  │
│  │                      │  │                          │  │
│  │  ┌──────────────┐    │  │  Praegune roll: [____]   │  │
│  │  │   📄 PDF     │    │  │  Sihtroll: [____]        │  │
│  │  │  Lohista või │    │  │  Kogemus: [__] aastat    │  │
│  │  │   vali fail  │    │  │  Oskused: [____]         │  │
│  │  └──────────────┘    │  │                          │  │
│  │  ✓ CV üles laetud   │  │                          │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON D: TEGEVUSED                                   │  │
│  │                                                      │  │
│  │  [Salvesta ja jätka hiljem]    [Jätka küsimustega →]│  │
│  │  (link)                        (primary button)      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Samm 2: KÜSIMUSED
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ EDUSAMMUDE RIBA: [●━━●━━○━━○] Samm 2/4 – Küsimused  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON A: KÜSIMUSE PEALKIRI                          │  │
│  │                                                      │  │
│  │ H2: "Küsimus 1/3"                                    │  │
│  │ p (väike): "Sinu vastused aitavad meil..."          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON B: KÜSIMUSE KAART (keskele joondatud)         │  │
│  │                                                      │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  "Milline on sinu suurim väljakutse           │  │  │
│  │  │   praeguses rollis?"                          │  │  │
│  │  │                                               │  │  │
│  │  │  ┌─────────────────────────────────────────┐  │  │  │
│  │  │  │                                         │  │  │  │
│  │  │  │  [Textarea: 3-5 rida]                   │  │  │  │
│  │  │  │                                         │  │  │  │
│  │  │  └─────────────────────────────────────────┘  │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON C: NAVIGEERIMINE                              │  │
│  │                                                      │  │
│  │  [← Tagasi]                    [Järgmine küsimus →] │  │
│  │  (ghost button)                (primary button)      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Samm 3: HINNANG
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ EDUSAMMUDE RIBA: [●━━●━━●━━○] Samm 3/4 – Hinnang    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON A: PEALKIRI                                    │  │
│  │ H1: "Sinu hinnang"                                   │  │
│  │ p: "Siin on meie analüüs sinu profiili põhjal."     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ TSOON B: SKOOR  │  │ TSOON C: NÕRKUSED               │ │
│  │                 │  │                                 │ │
│  │   ┌───────┐     │  │  Arendamist vajavad oskused:    │ │
│  │   │  78%  │     │  │                                 │ │
│  │   │ SKOOR │     │  │  1. Tehniline kommunikatsioon   │ │
│  │   └───────┘     │  │  2. Konfliktide lahendamine     │ │
│  │                 │  │  3. Projekti juhtimine          │ │
│  │  Usaldusväärsus:│  │                                 │ │
│  │  [KÕRGE]        │  │  ─────────────────────────────  │ │
│  │                 │  │                                 │ │
│  └─────────────────┘  │  Tugevused:                     │ │
│                       │  [Python] [SQL] [Analüütika]    │ │
│                       └─────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON D: TEGEVUSED                                   │  │
│  │                                                      │  │
│  │  [Vaata detaile]              [Koosta tegevuskava →]│  │
│  │  (secondary)                  (primary button)       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Samm 4: TEGEVUSKAVA
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ EDUSAMMUDE RIBA: [●━━●━━●━━●] Samm 4/4 – Valmis! ✓  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON A: PEALKIRI                                    │  │
│  │ H1: "Sinu tegevuskava"                               │  │
│  │ p: "Personaalne plaan sinu eesmärkide saavutamiseks."│  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON B: PERIOODI VALIK                              │  │
│  │                                                      │  │
│  │  [ 7 päeva ]  [ 30 päeva ]  [ 90 päeva ]            │  │
│  │      ▲ (valitud)                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON C: PÄEVADE LOEND (scrollable)                 │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ PÄEV 1                                         │ │  │
│  │  │ "Põhialuste ülevaade"                          │ │  │
│  │  │ Kirjeldus: Lorem ipsum dolor sit amet...       │ │  │
│  │  │ 📝 Ülesanne: Loe artikkel X ja tee kokkuvõte   │ │  │
│  │  │                                    [□ Tehtud]  │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ PÄEV 2 ...                                     │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ TSOON D: TEGEVUSED                                   │  │
│  │                                                      │  │
│  │  [Ekspordi PDF-ina]             [Alusta treeningut →]│  │
│  │  (secondary)                    (primary button)     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. TERMINOLOOGIA KAART

| Termin (EE) | Termin (EN) | Definitsioon | Kus kasutatakse |
|-------------|-------------|--------------|-----------------|
| **Profiil** | Profile | Kasutaja taustandmed: CV, roll, kogemus | Samm 1, navbar, seaded |
| **Küsimused** | Questions | 3 täpsustavat küsimust konteksti kogumiseks | Samm 2 |
| **Hinnang** | Assessment | AI analüüsi tulemused: skoor, nõrkused, tugevused | Samm 3, ülevaade |
| **Tegevuskava** | Roadmap | Personaalne arenguplaan (7/30/90 päeva) | Samm 4, treening |
| **Sobivusskoor** | Fit Score | Protsent (0-100%), mis näitab sobivust sihtrolliga | Hinnang, ülevaade |
| **Usaldusväärsus** | Confidence | Hinnangu täpsuse tase (Madal/Keskmine/Kõrge) | Hinnang |
| **Nõrkused** | Weaknesses | Oskused, mis vajavad arendamist | Hinnang, tegevuskava |
| **Tugevused** | Strengths | Oskused, mis on juba tugevad | Hinnang |
| **Treening** | Training | Aktiivne õppeprotsess tegevuskava põhjal | Pärast onboardingut |
| **Ülevaade** | Overview | Koondseis (dashboard) pärast onboardingu lõppu | Navbar, avaleht |

### Terminite hierarhia
```
Tulevikukindlus (app)
├── Ülevaade (pärast onboardingut nähtav dashboard)
├── Profiil (kasutaja andmed)
├── Hinnang (analüüsi tulemused)
├── Tegevuskava (arenguplaan)
│   ├── 7-päevane
│   ├── 30-päevane
│   └── 90-päevane
└── Treening (aktiivne harjutamine)
```

---

## 4. MARSRUUTIDE PLAAN

### Valik A: Hierarhilised URL-id (SOOVITATUD ✓)

```
/login                         → Sisselogimine
/register                      → Registreerimine

/onboarding                    → Redirect → /onboarding/profile
/onboarding/profile            → Samm 1: Profiil
/onboarding/questions          → Samm 2: Küsimused (küsimuse nr query paramina)
/onboarding/questions?q=1      → Küsimus 1/3
/onboarding/questions?q=2      → Küsimus 2/3
/onboarding/questions?q=3      → Küsimus 3/3
/onboarding/assessment         → Samm 3: Hinnang
/onboarding/roadmap            → Samm 4: Tegevuskava

/overview                      → Ülevaade (pärast onboardingut)
/training                      → Treening (olemasolev)
/profile                       → Profiili muutmine (olemasolev)
```

**Plussid:**
- Selge struktuur – kasutaja näeb URL-ist, kus ta on
- Brauseri ajalugu töötab korrektselt
- Jagamiseks sobiv (deeplink toetab)
- SEO-sõbralik (kui kunagi avalik)

**Miinused:**
- Rohkem marsruute hallata
- Guard-loogika keerukam (kas kasutaja on sammu lõpetanud?)

---

### Valik B: Query parameetrid

```
/onboarding?step=profile
/onboarding?step=questions&q=1
/onboarding?step=assessment
/onboarding?step=roadmap
```

**Plussid:**
- Üks marsruut, lihtsam guard
- Vähem faile

**Miinused:**
- URL ei peegelda selgelt asukohta
- Brauseri tagasi-nupp käitumine ebamäärasem
- Vähem SEO-sõbralik

---

### OTSUS: Valik A (hierarhilised URL-id)

Põhjendus: Kasutajakogemus on selgem, brauseri navigeerimine töötab loomulikumalt, ja tulevikus on lihtsam lisada uusi samme.

---

## 5. KOMPONENTIDE JAOTUS

### Uued komponendid

| Komponent | Sisend (Input) | Väljund (Output) | Kirjeldus |
|-----------|----------------|------------------|-----------|
| `OnboardingShellComponent` | `currentStep: number` | – | Wrapper koos progress bar'iga |
| `OnboardingProgressComponent` | `currentStep`, `totalSteps`, `stepLabels[]` | – | Edusammude näidik |
| `ProfileStepComponent` | `existingProfile?: UserProfile` | `profileCompleted: EventEmitter` | CV upload + vorm |
| `QuestionsStepComponent` | `questionIndex: number`, `questions[]` | `answerSubmitted: EventEmitter<{q, a}>` | Üks küsimus korraga |
| `AssessmentStepComponent` | `assessmentResult: AssessmentResult` | `continueClicked: EventEmitter` | Skoori ja nõrkuste kuvamine |
| `RoadmapStepComponent` | `roadmapData: RoadmapData`, `selectedPeriod` | `startTraining: EventEmitter` | Tegevuskava kuvamine |
| `CvUploadZoneComponent` | `acceptedTypes: string[]` | `fileUploaded: EventEmitter<File>` | Drag-drop CV upload |
| `ScoreDisplayComponent` | `score: number`, `confidence: string` | – | Suur skoori number + badge |
| `WeaknessListComponent` | `weaknesses: string[]` | – | TOP nõrkuste nimekiri |
| `StrengthTagsComponent` | `strengths: string[]` | – | Tugevuste märgised |
| `RoadmapDayCardComponent` | `day: RoadmapDay` | `taskToggled: EventEmitter` | Ühe päeva kaart |
| `PeriodSelectorComponent` | `options: number[]`, `selected` | `periodChanged: EventEmitter` | 7/30/90 päeva valik |

### Olemasolevad komponendid, mida taaskasutada

| Komponent | Praegune asukoht | Muudatused |
|-----------|------------------|------------|
| `NavbarComponent` | `/navbar` | Lisa onboarding režiim (peidetud lingid) |
| `DashboardComponent` | `/pages/dashboard` | Nimetada ümber → `OverviewComponent` |
| `TrainingComponent` | `/pages/training` | Säilitada, link tegevuskavast |
| `ProfileComponent` | `/pages/profile` | Säilitada profiili muutmiseks |

### Andmemudelid

```typescript
// Uus: Onboarding olek
interface OnboardingState {
  currentStep: 'profile' | 'questions' | 'assessment' | 'roadmap' | 'completed';
  profile: OnboardingProfile | null;
  answers: ClarifyingAnswer[];
  assessment: AssessmentResult | null;
  roadmap: RoadmapData | null;
}

interface OnboardingProfile {
  cvText: string;
  cvFileName: string;
  currentRole: string;
  targetRole: string;
  yearsOfExperience: number;
  skills?: string;
}

interface ClarifyingAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
}

interface AssessmentResult {
  fitScore: number;              // 0-100
  confidence: 'low' | 'medium' | 'high';
  topWeaknesses: string[];       // max 3
  strengths: string[];           // max 5
  summary: string;
}

interface RoadmapData {
  selectedPeriod: 7 | 30 | 90;
  overallGoal: string;
  days: RoadmapDay[];
}

interface RoadmapDay {
  dayNumber: number;
  title: string;
  description: string;
  practiceTask: string;
  completed: boolean;
}
```

---

## 6. VEA/TÜHJA/LAADIMISE OLEKUD

### Samm 1: PROFIIL

| Olek | UI käitumine |
|------|-------------|
| **Laadimine** | Skeleton placeholder profiiliväljadel, CTA disabled |
| **CV upload käimas** | Progress bar upload-tsoonis, "Laen üles..." tekst |
| **CV upload ebaõnnestus** | Punane ääris, veateade: "CV üleslaadimine ebaõnnestus. Proovi uuesti." |
| **CV vigane formaat** | Veateade: "Palun lae üles PDF-fail." |
| **Kohustuslik väli tühi** | CTA disabled, välja all veateade: "See väli on kohustuslik" |
| **Salvestamine ebaõnnestus** | Toast: "Salvestamine ebaõnnestus. Proovi uuesti." + retry nupp |

### Samm 2: KÜSIMUSED

| Olek | UI käitumine |
|------|-------------|
| **Küsimuse laadimine** | Skeleton küsimuse tekstil |
| **Vastus tühi** | CTA disabled kuni min 10 tähemärki sisestatud |
| **Salvestamine** | CTA näitab spinner'it, disabled |
| **Võrguühendus puudub** | Banner ülaosas: "Võrguühendus puudub. Vastused salvestatakse, kui ühendus taastub." |

### Samm 3: HINNANG

| Olek | UI käitumine |
|------|-------------|
| **Analüüs käimas** | Suur spinner keskelt, tekst: "Analüüsime sinu profiili..." (15-30 sek) |
| **Analüüs ebaõnnestus** | Veateade keskelt: "Analüüs ebaõnnestus." + "Proovi uuesti" nupp |
| **Andmed puudulikud** | Redirect tagasi profiili juurde toast'iga |
| **Madal usaldusväärsus** | Info-badge: "Täpsema hinnangu saamiseks täienda oma profiili" |

### Samm 4: TEGEVUSKAVA

| Olek | UI käitumine |
|------|-------------|
| **Kava genereerimine** | Skeleton cards, tekst: "Koostame tegevuskava..." |
| **Kava tühi** | Veateade: "Tegevuskava koostamine ebaõnnestus." + retry |
| **Perioodi vahetus** | Skeleton päevakaartidel, säilitada tab-valik |
| **Ekspordiviga** | Toast: "PDF eksport ebaõnnestus. Proovi uuesti." |

### Globaalsed olekud

| Olek | UI käitumine |
|------|-------------|
| **Sessioon aegunud** | Modal: "Sinu sessioon on aegunud. Logi uuesti sisse." → redirect /login |
| **Server error (5xx)** | Full-page error: "Midagi läks valesti. Proovi hiljem uuesti." |
| **Offline** | Sticky banner ülaosas |

---

## 7. MIGRATSIOONIPLAAN

### Eemaldada / Ühendada

| Praegune | Tegevus | Põhjendus |
|----------|---------|-----------|
| `/upload-cv` | **EEMALDADA** → ühendada ProfileStep'i | Duplikaat, CV upload on nüüd onboardingus |
| `/job-match` | **EEMALDADA** → ühendada AssessmentStep'i | Duplikaat, analüüs on nüüd onboardingus |
| `/job-analysis` | **EEMALDADA** → ühendada AssessmentStep'i | Duplikaat |
| `/dashboard` | **ÜMBER NIMETADA** → `/overview` | Terminoloogia ühtlustamine |
| `job-match.page.ts` | **DEPRECATE** | Asendatud AssessmentStepComponent'iga |
| `job-analysis.component.ts` | **DEPRECATE** | Asendatud AssessmentStepComponent'iga |
| `upload-cv.component.ts` | **DEPRECATE** | Asendatud CvUploadZoneComponent'iga |

### Navbar muudatused

**Praegune:**
```
Dashboard | Upload CV | Job Match | Job Analysis | Training | Profile
```

**Uus (onboardingu ajal):**
```
[Logo] | ─ ─ ─ ─ ─ ─ ─ ─ ─ | [Kasutaja] | Logi välja
```
(Lingid peidetud, et vältida segadust)

**Uus (pärast onboardingut):**
```
[Logo] | Ülevaade | Tegevuskava | Treening | Profiil | [Kasutaja ▼]
```

### Redirecti loogika

```typescript
// AuthGuard + OnboardingGuard loogika

if (!isLoggedIn) → redirect('/login')
else if (!onboardingCompleted) → redirect('/onboarding/profile')
else → allow navigation

// Onboardingu sees:
if (step === 'profile' && !profileComplete) → stay
if (step === 'questions' && !profileComplete) → redirect('/onboarding/profile')
if (step === 'assessment' && !questionsComplete) → redirect('/onboarding/questions')
if (step === 'roadmap' && !assessmentComplete) → redirect('/onboarding/assessment')
```

### Andmete migratsioon

| Vana väli | Uus väli | Tegevus |
|-----------|----------|---------|
| `latestFitScore` | `assessmentResult.fitScore` | Mapping |
| `lastAnalysisSummary` | `assessmentResult.summary` | Mapping |
| `cvUploaded` | `onboardingState.profile.cvText` | Boolean → string |
| `trainingProgressPercent` | – | Säilitada (Training moodul) |

---

---

# PART B: ENGLISH VERSION

## 1. STEP-BY-STEP UX FLOW

### Overview
User completes **4 main steps**, each with one primary action:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. PROFILE  │ →  │ 2. QUESTIONS│ →  │3. ASSESSMENT│ →  │ 4. ROADMAP  │
│             │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

### Step 1: PROFILE
**Goal:** Collect user background data (CV + role + experience)

| Element | Description |
|---------|-------------|
| **Title** | "Let's start with your profile" |
| **Subtitle** | "Upload your CV and fill in the basics so we can analyze your skills." |
| **Progress** | "Step 1/4 – Profile" |
| **Primary CTA** | "Continue to questions →" (enabled only when required fields complete) |
| **Secondary CTA** | "Save and continue later" (link style) |

**Data fields:**
- CV upload (PDF) – **required**
- Current role (text) – **required**
- Target role (text) – **required**
- Years of experience (number) – **required**
- Key skills (comma-separated) – optional

---

### Step 2: QUESTIONS (3 questions, one at a time)
**Goal:** Clarify user goals and context

| Element | Description |
|---------|-------------|
| **Title** | "Question [1/3]", "Question [2/3]", "Question [3/3]" |
| **Subtitle** | "Your answers help us create a personalized assessment." |
| **Progress** | "Step 2/4 – Questions" |
| **Primary CTA** | "Next question →" (Q1-2), "Show assessment →" (Q3) |
| **Secondary CTA** | "← Back" |

**Example questions:**
1. "What is your biggest challenge in your current role?"
2. "What is your main career goal for the next year?"
3. "Which skills do you most want to develop?"

---

### Step 3: ASSESSMENT
**Goal:** Display analysis results (score + confidence + weaknesses)

| Element | Description |
|---------|-------------|
| **Title** | "Your assessment" |
| **Subtitle** | "Here's our analysis based on your profile and answers." |
| **Progress** | "Step 3/4 – Assessment" |
| **Primary CTA** | "Create roadmap →" |
| **Secondary CTA** | "View details" (accordion/modal) |

**Displayed data:**
- **Fit Score** (0-100%) – large number
- **Confidence** (Low/Medium/High) – badge
- **TOP 3 skills to develop** – numbered list
- **Strengths** – tag row (max 5)

---

### Step 4: ROADMAP
**Goal:** Display personalized development plan and start action

| Element | Description |
|---------|-------------|
| **Title** | "Your roadmap" |
| **Subtitle** | "A personalized plan to achieve your goals." |
| **Progress** | "Step 4/4 – Roadmap" (complete!) |
| **Primary CTA** | "Start training →" |
| **Secondary CTA** | "Export as PDF" |

**Displayed data:**
- **Period selector:** 7 days / 30 days / 90 days (tab-style)
- **Day cards:** Each day shows: title, description, practice task
- **Progress bar:** X/Y tasks completed

---

## 2. WIREFRAME DESCRIPTIONS

### Step 1: PROFILE
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR: Logo | ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ | User ▼ | Logout]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PROGRESS BAR: [●━━○━━○━━○] Step 1/4 – Profile       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE A: HEADER                                       │  │
│  │ H1: "Let's start with your profile"                  │  │
│  │ p: "Upload your CV and fill in the basics..."       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │ ZONE B: CV UPLOAD    │  │ ZONE C: FORM             │  │
│  │                      │  │                          │  │
│  │  ┌──────────────┐    │  │  Current role: [____]    │  │
│  │  │   📄 PDF     │    │  │  Target role: [____]     │  │
│  │  │  Drag or     │    │  │  Experience: [__] years  │  │
│  │  │  select file │    │  │  Skills: [____]          │  │
│  │  └──────────────┘    │  │                          │  │
│  │  ✓ CV uploaded       │  │                          │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE D: ACTIONS                                      │  │
│  │                                                      │  │
│  │  [Save and continue later]    [Continue to questions→]│  │
│  │  (link)                       (primary button)       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 2: QUESTIONS
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PROGRESS BAR: [●━━●━━○━━○] Step 2/4 – Questions     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE A: QUESTION HEADER                              │  │
│  │                                                      │  │
│  │ H2: "Question 1/3"                                   │  │
│  │ p (small): "Your answers help us..."                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE B: QUESTION CARD (centered)                     │  │
│  │                                                      │  │
│  │  ┌───────────────────────────────────────────────┐  │  │
│  │  │                                               │  │  │
│  │  │  "What is your biggest challenge              │  │  │
│  │  │   in your current role?"                      │  │  │
│  │  │                                               │  │  │
│  │  │  ┌─────────────────────────────────────────┐  │  │  │
│  │  │  │                                         │  │  │  │
│  │  │  │  [Textarea: 3-5 rows]                   │  │  │  │
│  │  │  │                                         │  │  │  │
│  │  │  └─────────────────────────────────────────┘  │  │  │
│  │  │                                               │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE C: NAVIGATION                                   │  │
│  │                                                      │  │
│  │  [← Back]                         [Next question →] │  │
│  │  (ghost button)                   (primary button)   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 3: ASSESSMENT
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PROGRESS BAR: [●━━●━━●━━○] Step 3/4 – Assessment    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE A: HEADER                                       │  │
│  │ H1: "Your assessment"                                │  │
│  │ p: "Here's our analysis based on your profile."     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ ZONE B: SCORE   │  │ ZONE C: WEAKNESSES              │ │
│  │                 │  │                                 │ │
│  │   ┌───────┐     │  │  Skills to develop:             │ │
│  │   │  78%  │     │  │                                 │ │
│  │   │ SCORE │     │  │  1. Technical communication     │ │
│  │   └───────┘     │  │  2. Conflict resolution         │ │
│  │                 │  │  3. Project management          │ │
│  │  Confidence:    │  │                                 │ │
│  │  [HIGH]         │  │  ─────────────────────────────  │ │
│  │                 │  │                                 │ │
│  └─────────────────┘  │  Strengths:                     │ │
│                       │  [Python] [SQL] [Analytics]     │ │
│                       └─────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE D: ACTIONS                                      │  │
│  │                                                      │  │
│  │  [View details]                  [Create roadmap →] │  │
│  │  (secondary)                     (primary button)    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Step 4: ROADMAP
```
┌────────────────────────────────────────────────────────────┐
│ [NAVBAR]                                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ PROGRESS BAR: [●━━●━━●━━●] Step 4/4 – Complete! ✓   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE A: HEADER                                       │  │
│  │ H1: "Your roadmap"                                   │  │
│  │ p: "A personalized plan to achieve your goals."     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE B: PERIOD SELECTOR                              │  │
│  │                                                      │  │
│  │  [ 7 days ]  [ 30 days ]  [ 90 days ]               │  │
│  │      ▲ (selected)                                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE C: DAY LIST (scrollable)                        │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ DAY 1                                          │ │  │
│  │  │ "Fundamentals overview"                        │ │  │
│  │  │ Description: Lorem ipsum dolor sit amet...     │ │  │
│  │  │ 📝 Task: Read article X and summarize          │ │  │
│  │  │                                    [□ Done]    │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │ DAY 2 ...                                      │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ZONE D: ACTIONS                                      │  │
│  │                                                      │  │
│  │  [Export as PDF]                 [Start training →] │  │
│  │  (secondary)                     (primary button)    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 3. TERMINOLOGY MAP

| Term (ET) | Term (EN) | Definition | Where Used |
|-----------|-----------|------------|------------|
| **Profiil** | Profile | User background: CV, role, experience | Step 1, navbar, settings |
| **Küsimused** | Questions | 3 clarifying questions to gather context | Step 2 |
| **Hinnang** | Assessment | AI analysis results: score, weaknesses, strengths | Step 3, overview |
| **Tegevuskava** | Roadmap | Personalized development plan (7/30/90 days) | Step 4, training |
| **Sobivusskoor** | Fit Score | Percentage (0-100%) showing alignment with target role | Assessment, overview |
| **Usaldusväärsus** | Confidence | Accuracy level of assessment (Low/Medium/High) | Assessment |
| **Nõrkused** | Weaknesses | Skills that need development | Assessment, roadmap |
| **Tugevused** | Strengths | Skills that are already strong | Assessment |
| **Treening** | Training | Active learning process based on roadmap | Post-onboarding |
| **Ülevaade** | Overview | Summary dashboard after onboarding completion | Navbar, home |

### Terminology Hierarchy
```
Tulevikukindlus (app)
├── Overview (dashboard visible after onboarding)
├── Profile (user data)
├── Assessment (analysis results)
├── Roadmap (development plan)
│   ├── 7-day
│   ├── 30-day
│   └── 90-day
└── Training (active practice)
```

---

## 4. ROUTE PLAN

### Option A: Hierarchical URLs (RECOMMENDED ✓)

```
/login                         → Login
/register                      → Registration

/onboarding                    → Redirect → /onboarding/profile
/onboarding/profile            → Step 1: Profile
/onboarding/questions          → Step 2: Questions (question # as query param)
/onboarding/questions?q=1      → Question 1/3
/onboarding/questions?q=2      → Question 2/3
/onboarding/questions?q=3      → Question 3/3
/onboarding/assessment         → Step 3: Assessment
/onboarding/roadmap            → Step 4: Roadmap

/overview                      → Overview (post-onboarding)
/training                      → Training (existing)
/profile                       → Profile editing (existing)
```

**Pros:**
- Clear structure – user sees location from URL
- Browser history works correctly
- Shareable (deeplink support)
- SEO-friendly (if ever public)

**Cons:**
- More routes to manage
- Guard logic more complex (has user completed step?)

---

### Option B: Query Parameters

```
/onboarding?step=profile
/onboarding?step=questions&q=1
/onboarding?step=assessment
/onboarding?step=roadmap
```

**Pros:**
- Single route, simpler guard
- Fewer files

**Cons:**
- URL doesn't clearly reflect location
- Browser back button behavior ambiguous
- Less SEO-friendly

---

### DECISION: Option A (hierarchical URLs)

Rationale: User experience is clearer, browser navigation works more naturally, and it's easier to add new steps in the future.

---

## 5. COMPONENT BREAKDOWN

### New Components

| Component | Input | Output | Description |
|-----------|-------|--------|-------------|
| `OnboardingShellComponent` | `currentStep: number` | – | Wrapper with progress bar |
| `OnboardingProgressComponent` | `currentStep`, `totalSteps`, `stepLabels[]` | – | Progress indicator |
| `ProfileStepComponent` | `existingProfile?: UserProfile` | `profileCompleted: EventEmitter` | CV upload + form |
| `QuestionsStepComponent` | `questionIndex: number`, `questions[]` | `answerSubmitted: EventEmitter<{q, a}>` | One question at a time |
| `AssessmentStepComponent` | `assessmentResult: AssessmentResult` | `continueClicked: EventEmitter` | Score and weaknesses display |
| `RoadmapStepComponent` | `roadmapData: RoadmapData`, `selectedPeriod` | `startTraining: EventEmitter` | Roadmap display |
| `CvUploadZoneComponent` | `acceptedTypes: string[]` | `fileUploaded: EventEmitter<File>` | Drag-drop CV upload |
| `ScoreDisplayComponent` | `score: number`, `confidence: string` | – | Large score number + badge |
| `WeaknessListComponent` | `weaknesses: string[]` | – | TOP weaknesses list |
| `StrengthTagsComponent` | `strengths: string[]` | – | Strength tags |
| `RoadmapDayCardComponent` | `day: RoadmapDay` | `taskToggled: EventEmitter` | Single day card |
| `PeriodSelectorComponent` | `options: number[]`, `selected` | `periodChanged: EventEmitter` | 7/30/90 day selector |

### Existing Components to Reuse

| Component | Current Location | Changes |
|-----------|-----------------|---------|
| `NavbarComponent` | `/navbar` | Add onboarding mode (hidden links) |
| `DashboardComponent` | `/pages/dashboard` | Rename → `OverviewComponent` |
| `TrainingComponent` | `/pages/training` | Keep, link from roadmap |
| `ProfileComponent` | `/pages/profile` | Keep for profile editing |

### Data Models

```typescript
// New: Onboarding state
interface OnboardingState {
  currentStep: 'profile' | 'questions' | 'assessment' | 'roadmap' | 'completed';
  profile: OnboardingProfile | null;
  answers: ClarifyingAnswer[];
  assessment: AssessmentResult | null;
  roadmap: RoadmapData | null;
}

interface OnboardingProfile {
  cvText: string;
  cvFileName: string;
  currentRole: string;
  targetRole: string;
  yearsOfExperience: number;
  skills?: string;
}

interface ClarifyingAnswer {
  questionId: string;
  questionText: string;
  answerText: string;
}

interface AssessmentResult {
  fitScore: number;              // 0-100
  confidence: 'low' | 'medium' | 'high';
  topWeaknesses: string[];       // max 3
  strengths: string[];           // max 5
  summary: string;
}

interface RoadmapData {
  selectedPeriod: 7 | 30 | 90;
  overallGoal: string;
  days: RoadmapDay[];
}

interface RoadmapDay {
  dayNumber: number;
  title: string;
  description: string;
  practiceTask: string;
  completed: boolean;
}
```

---

## 6. ERROR/EMPTY/LOADING STATES

### Step 1: PROFILE

| State | UI Behavior |
|-------|-------------|
| **Loading** | Skeleton placeholder on profile fields, CTA disabled |
| **CV upload in progress** | Progress bar in upload zone, "Uploading..." text |
| **CV upload failed** | Red border, error message: "CV upload failed. Try again." |
| **CV invalid format** | Error message: "Please upload a PDF file." |
| **Required field empty** | CTA disabled, error below field: "This field is required" |
| **Save failed** | Toast: "Save failed. Try again." + retry button |

### Step 2: QUESTIONS

| State | UI Behavior |
|-------|-------------|
| **Question loading** | Skeleton on question text |
| **Answer empty** | CTA disabled until min 10 characters entered |
| **Saving** | CTA shows spinner, disabled |
| **No network** | Banner at top: "No network connection. Answers will be saved when connection returns." |

### Step 3: ASSESSMENT

| State | UI Behavior |
|-------|-------------|
| **Analysis in progress** | Large spinner centered, text: "Analyzing your profile..." (15-30 sec) |
| **Analysis failed** | Error message centered: "Analysis failed." + "Try again" button |
| **Insufficient data** | Redirect back to profile with toast |
| **Low confidence** | Info badge: "For a more accurate assessment, complete your profile" |

### Step 4: ROADMAP

| State | UI Behavior |
|-------|-------------|
| **Plan generating** | Skeleton cards, text: "Creating your roadmap..." |
| **Plan empty** | Error message: "Roadmap creation failed." + retry |
| **Period switch** | Skeleton on day cards, preserve tab selection |
| **Export error** | Toast: "PDF export failed. Try again." |

### Global States

| State | UI Behavior |
|-------|-------------|
| **Session expired** | Modal: "Your session has expired. Please log in again." → redirect /login |
| **Server error (5xx)** | Full-page error: "Something went wrong. Please try again later." |
| **Offline** | Sticky banner at top |

---

## 7. MIGRATION PLAN

### Remove / Merge

| Current | Action | Rationale |
|---------|--------|-----------|
| `/upload-cv` | **REMOVE** → merge into ProfileStep | Duplicate, CV upload now in onboarding |
| `/job-match` | **REMOVE** → merge into AssessmentStep | Duplicate, analysis now in onboarding |
| `/job-analysis` | **REMOVE** → merge into AssessmentStep | Duplicate |
| `/dashboard` | **RENAME** → `/overview` | Terminology alignment |
| `job-match.page.ts` | **DEPRECATE** | Replaced by AssessmentStepComponent |
| `job-analysis.component.ts` | **DEPRECATE** | Replaced by AssessmentStepComponent |
| `upload-cv.component.ts` | **DEPRECATE** | Replaced by CvUploadZoneComponent |

### Navbar Changes

**Current:**
```
Dashboard | Upload CV | Job Match | Job Analysis | Training | Profile
```

**New (during onboarding):**
```
[Logo] | ─ ─ ─ ─ ─ ─ ─ ─ ─ | [User] | Logout
```
(Links hidden to avoid confusion)

**New (after onboarding):**
```
[Logo] | Overview | Roadmap | Training | Profile | [User ▼]
```

### Redirect Logic

```typescript
// AuthGuard + OnboardingGuard logic

if (!isLoggedIn) → redirect('/login')
else if (!onboardingCompleted) → redirect('/onboarding/profile')
else → allow navigation

// Within onboarding:
if (step === 'profile' && !profileComplete) → stay
if (step === 'questions' && !profileComplete) → redirect('/onboarding/profile')
if (step === 'assessment' && !questionsComplete) → redirect('/onboarding/questions')
if (step === 'roadmap' && !assessmentComplete) → redirect('/onboarding/assessment')
```

### Data Migration

| Old Field | New Field | Action |
|-----------|-----------|--------|
| `latestFitScore` | `assessmentResult.fitScore` | Mapping |
| `lastAnalysisSummary` | `assessmentResult.summary` | Mapping |
| `cvUploaded` | `onboardingState.profile.cvText` | Boolean → string |
| `trainingProgressPercent` | – | Keep (Training module) |

---

## 8. BACKEND API REQUIREMENTS (Inputs/Outputs Only)

The following APIs are needed. **Do not implement** – just define inputs and outputs.

### API 1: Save Profile Step
```
POST /api/onboarding/profile
Input: { cvFile: File, currentRole, targetRole, yearsOfExperience, skills? }
Output: { success: boolean, profileId: string, cvText: string }
```

### API 2: Get Clarifying Questions
```
GET /api/onboarding/questions?profileId={id}
Output: { questions: [{ id, text }] } // 3 questions
```

### API 3: Submit Answer
```
POST /api/onboarding/answers
Input: { profileId, questionId, answerText }
Output: { success: boolean, nextQuestionId?: string }
```

### API 4: Generate Assessment
```
POST /api/onboarding/assessment
Input: { profileId }
Output: { fitScore, confidence, topWeaknesses[], strengths[], summary }
```

### API 5: Generate Roadmap
```
POST /api/onboarding/roadmap
Input: { profileId, period: 7 | 30 | 90 }
Output: { overallGoal, days: [{ dayNumber, title, description, practiceTask }] }
```

### API 6: Mark Onboarding Complete
```
POST /api/onboarding/complete
Input: { profileId }
Output: { success: boolean }
```

### API 7: Get Onboarding State (for resumption)
```
GET /api/onboarding/state
Output: { currentStep, profile?, answers?, assessment?, roadmap? }
```

---

## 9. IMPLEMENTATION PRIORITY

### Phase 1: Core Flow (MVP)
1. `OnboardingShellComponent` + `OnboardingProgressComponent`
2. `ProfileStepComponent` with `CvUploadZoneComponent`
3. `QuestionsStepComponent`
4. `AssessmentStepComponent` with `ScoreDisplayComponent`
5. `RoadmapStepComponent` with `RoadmapDayCardComponent`
6. Route configuration + guards

### Phase 2: Polish
1. `WeaknessListComponent` + `StrengthTagsComponent`
2. `PeriodSelectorComponent`
3. Loading/error states for all steps
4. Navbar onboarding mode

### Phase 3: Migration
1. Remove deprecated routes
2. Rename Dashboard → Overview
3. Update redirects
4. Data migration scripts

---

## 10. ACCEPTANCE CRITERIA CHECKLIST

- [ ] User can complete profile with CV upload
- [ ] User answers 3 questions one at a time
- [ ] User sees assessment with score, confidence, top 3 weaknesses
- [ ] User can select 7/30/90 day roadmap
- [ ] Progress indicator shows current step (1-4)
- [ ] Each step has exactly one primary CTA
- [ ] Back navigation works correctly
- [ ] "Save and continue later" saves state
- [ ] Returning user resumes from last incomplete step
- [ ] Navbar shows minimal options during onboarding
- [ ] All loading states show appropriate feedback
- [ ] All error states show actionable messages

---

*Document version: 1.0*
*Created: 2025-12-18*
*Author: UX Design System*
