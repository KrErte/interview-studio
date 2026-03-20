import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StreakService } from '../../services/streak.service';
import { InterviewSessionApiService } from '../../core/services/interview-session-api.service';
import {
  InterviewProgressResponse,
  InterviewSessionCreateRequest,
  InterviewSessionCreateResponse,
  InterviewSummaryResponse,
  InterviewSeniority,
  InterviewerStyle,
  InterviewFitSnapshot,
  InterviewFitBreakdown
} from '../../core/models/interview-session.model';
import {
  SoftSkillCatalogService,
  SoftSkillDimension
} from '../../core/services/soft-skill-catalog.service';
import {
  InterviewDebugStateService,
  InterviewDebugSessionInfo
} from '../../core/services/interview-debug-state.service';
import { InterviewControlRoomDrawerComponent } from './interview-control-room-drawer.component';
import { FitIndicatorComponent } from '../../shared/fit-indicator/fit-indicator.component';
import { FitExplainPanelComponent } from '../../shared/fit-explain-panel/fit-explain-panel.component';
import { CandidateSummaryPanelComponent } from '../../shared/candidate-summary/candidate-summary-panel.component';
import { CandidateSummaryStateService } from '../../shared/candidate-summary/candidate-summary-state.service';
import { CvUploadPanelComponent } from '../../shared/cv-upload/cv-upload-panel.component';
import { InterviewProfileStateService } from '../../core/services/interview-profile-state.service';
import { InterviewProfileDto } from '../../core/models/interview-session.model';
import { ObserverLogService } from '../../shared/observer-log/observer-log.service';

interface InterviewTranscriptEntry {
  questionNumber: number;
  question: string;
  answer: string;
  decision?: string;
}

interface InterviewStudioVm {
  /**
   * Transcript must be built ONLY from interview answers history (session answers).
   * It must never contain observer/debug events or internal logs.
   */
  currentQuestion: string | null;
  decision: string | null;
  progress: any | null;
  questionCount: number | null;
  fitScore: number | null;
  fitTrend: string | null;
  sessionComplete: boolean;
  transcript: InterviewTranscriptEntry[];
  fit: InterviewFitSnapshot | null;
  fitBreakdown: InterviewFitBreakdown | null;
}

@Component({
  selector: 'app-interview-studio-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InterviewControlRoomDrawerComponent,
    FitIndicatorComponent,
    FitExplainPanelComponent,
    CandidateSummaryPanelComponent,
    CvUploadPanelComponent
  ],
  templateUrl: './interview-studio-page.component.html'
})
export class InterviewStudioPageComponent implements OnInit {
  companyName = '';
  roleTitle = '';
  candidateEmail = '';
  seniority: InterviewSeniority = 'MID';
  interviewerStyle: InterviewerStyle = 'HR';

  private readonly uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  loading = false;
  isSubmitting = false;
  error = '';

  currentSessionId: string | null = null;
  displaySessionId: string | null = null;
  totalQuestions: number | null = null;
  currentQuestionNumber: number | null = null;
  currentQuestion: { question: string; modelAnswerHint?: string } | null = null;

  summary: InterviewSummaryResponse | null = null;
  currentAnswerText = '';
  lastLocalAnalysis: { detectedStrengths: string[]; detectedRisks: string[] } | null = null;

  isFitExplainOpen = false;

  /** Latest CV-derived interview profile, if any. */
  cvProfile: InterviewProfileDto | null = null;

  // ── Variable Reward Schedule (Skinner) ───────────────────────────────────
  variableReward: { message: string; type: 'insight' | 'challenge' | 'nudge' } | null = null;

  private readonly rewardPools = {
    insight: [
      'Sinu kommunikatsioonistiil on selge — see on suur pluss.',
      'Struktureeritud mõtlemine tuleb läbi. Jätka nii.',
      'AI märkas midagi huvitavat sinu vastuses.',
      'See vastus andis rohkem signaale kui arvad.',
      'Tugev fookus — seda hindavad intervjueerijad.',
    ],
    challenge: [
      'Kas saaksid seda konkreetsema näitega illustreerida?',
      'Intervjueerija oleks siinkohal küsinud: "Miks just nii?"',
      'Tugev punkt — aga puudub mõõdetav tulemus.',
      'Väldi abstraktsust — konkreetsed numbrid veenvad rohkem.',
      'Hea suund, aga vastus jäi veidi pealiskaudseks.',
    ],
    nudge: [
      'Oled juba üle poole teel — ära peatu nüüd.',
      'Huvitav suund — järgmine küsimus läheb sügavamale.',
      'Sinu profiil kujuneb — jätka vastamist.',
      'Iga vastus täpsustab sinu sobivuspilti.',
    ],
  };

  vm: InterviewStudioVm = {
    currentQuestion: null,
    decision: null,
    progress: null,
    questionCount: null,
    fitScore: null,
    fitTrend: null,
    sessionComplete: false,
    transcript: [],
    fit: null,
    fitBreakdown: null
  };

  readonly seniorityOptions: InterviewSeniority[] = ['JUNIOR', 'MID', 'SENIOR'];
  readonly styleOptions: InterviewerStyle[] = ['HR', 'TECH', 'TEAM_LEAD', 'MIXED'];

  dimensionsMap: Record<string, SoftSkillDimension> = {};
  expandedDimensions = new Set<string>();

  private static readonly FIT_READY_STORAGE_KEY = 'aiInterview.fitReadySessions';
  private static readonly fitReadySeenSessionUuids = new Set<string>();
  private static readonly SESSION_PERSIST_KEY = 'is.savedSession';

  /** Saved session loaded from localStorage on init — shown as resume banner. */
  savedSession: { roleTitle: string; companyName: string; progressPct: number } | null = null;
  private _savedSessionRaw: any = null;

  /**
   * Dev-only helper message shown when we automatically resync session state
   * after detecting a "request next question first" style backend error.
   */
  syncNotice = '';

  constructor(
    private sessionApi: InterviewSessionApiService,
    private catalog: SoftSkillCatalogService,
    private debugState: InterviewDebugStateService,
    private observerLog: ObserverLogService,
    private candidateSummaryState: CandidateSummaryStateService,
    private interviewProfileState: InterviewProfileStateService,
    private streak: StreakService
  ) {}

  ngOnInit(): void {
    this.loadDimensions();
    this.checkSavedSession();

    // Keep local CV profile in sync with shared state so the candidate
    // preview reflects uploads even across minor re-renders.
    this.interviewProfileState.profile$.subscribe((profile) => {
      this.cvProfile = profile;
    });
  }

  /* =========================
     REQUIRED BY TEMPLATE
     ========================= */

  toggleControlRoom(): void {
    this.debugState.toggleDrawer();
  }

  get effectiveQuestionCount(): number {
    return this.vm.progress?.questionCount ?? this.vm.questionCount ?? this.currentQuestionNumber ?? 0;
  }

  /** Progress bar width — minimum 15% (Endowed Progress Effect: user already feels invested). */
  get progressBarWidth(): number {
    const answered = (this.vm.questionCount || this.currentQuestionNumber) ?? 0;
    const total = this.totalQuestions || 1;
    const real = (answered / total) * 100;
    return Math.max(15, real);
  }

  /**
   * Identity label computed from role title + seniority (Point 3 — Identity Anchoring).
   * Shown as a badge below the role input once the user has typed 3+ characters.
   */
  get identityLabel(): string | null {
    const role = this.roleTitle.trim().toLowerCase();
    if (role.length < 3) return null;
    const s = this.seniority;

    if (s === 'JUNIOR') {
      if (role.includes('engineer') || role.includes('developer') || role.includes('dev')) return 'Rising Engineer';
      if (role.includes('manager') || role.includes('lead')) return 'Aspiring Leader';
      if (role.includes('designer')) return 'Creative Starter';
      if (role.includes('analyst')) return 'Junior Analyst';
      return 'Rising Talent';
    }
    if (s === 'SENIOR') {
      if (role.includes('engineer') || role.includes('developer') || role.includes('dev')) return 'Senior Tech Leader';
      if (role.includes('manager')) return 'Seasoned Manager';
      if (role.includes('product')) return 'Product Strategist';
      if (role.includes('designer')) return 'Senior Creative';
      if (role.includes('analyst') || role.includes('data')) return 'Senior Analyst';
      return 'Senior Specialist';
    }
    // MID
    if (role.includes('engineer') || role.includes('developer') || role.includes('dev')) return 'Mid-Level Builder';
    if (role.includes('manager')) return 'Emerging Manager';
    if (role.includes('analyst') || role.includes('data')) return 'Data-Driven Thinker';
    if (role.includes('designer')) return 'Creative Professional';
    if (role.includes('product')) return 'Product Thinker';
    return 'Career Professional';
  }

  /** Resume banner: dismiss and clear localStorage. */
  dismissSavedSession(): void {
    this.savedSession = null;
    this._savedSessionRaw = null;
    try { localStorage.removeItem(InterviewStudioPageComponent.SESSION_PERSIST_KEY); } catch { /* ignore */ }
  }

  /** Resume banner: restore form + session state, then fetch current question. */
  resumeSavedSession(): void {
    const raw = this._savedSessionRaw;
    if (!raw) return;

    this.roleTitle = raw.roleTitle ?? '';
    this.companyName = raw.companyName ?? '';
    this.candidateEmail = raw.candidateEmail ?? '';
    this.seniority = raw.seniority ?? 'MID';
    this.interviewerStyle = raw.interviewerStyle ?? 'HR';
    this.currentSessionId = raw.sessionId ?? null;
    this.displaySessionId = raw.displaySessionId ?? null;
    this.totalQuestions = raw.totalQuestions ?? null;
    this.currentQuestionNumber = raw.questionNumber ?? null;
    this.vm = {
      ...this.vm,
      transcript: raw.transcript ?? [],
      questionCount: raw.questionNumber ?? null,
    };

    this.savedSession = null;
    this._savedSessionRaw = null;

    if (this.currentSessionId) {
      this.requestNextQuestionWithoutAnswer();
    }
  }

  /**
   * Canonical session key used for both debug UI and observer logs.
   * Prefer a real UUID when currentSessionId is a UUID, else fall back to
   * displaySessionId / currentSessionId string. Never returns an empty string.
   */
  private getSessionKey(): string | null {
    const candidates = [
      this.currentSessionId,
      this.displaySessionId
    ];

    for (const raw of candidates) {
      if (!raw) continue;
      const trimmed = String(raw).trim();
      if (!trimmed) continue;
      return trimmed;
    }

    return null;
  }

  /**
   * Whether the main fit widget should still show the exploration state
   * ("Tutvume sinuga") instead of a numeric fit.
   */
  get isFitInExploration(): boolean {
    const q = this.effectiveQuestionCount;
    const fit = this.vm.fit;
    if (!fit) {
      return true;
    }
    if (q < 3) {
      return true;
    }
    if (fit.computed !== true) {
      return true;
    }
    if (fit.overall === null || fit.overall === undefined) {
      return true;
    }
    return false;
  }

  /**
   * Canonical overall fit percent label as string, relying only on backend
   * value (fit.overall already in percent).
   */
  get fitOverallLabel(): string | null {
    const v = this.vm.fit?.overall;
    if (v === null || v === undefined) {
      return null;
    }
    const n = Number(v);
    if (Number.isNaN(n)) {
      return null;
    }
    return Math.round(n).toString();
  }

  /**
   * Whether to show a trend badge in the main widget.
   * Shown only when we have at least 5 answers and a trend label.
   */
  get showFitTrend(): boolean {
    const q = this.effectiveQuestionCount;
    if (q < 5) {
      return false;
    }
    const trend = (this.vm.fit?.trend || '').toString().trim();
    return trend.length > 0;
  }

  get fitTrendSymbol(): string {
    const raw = (this.vm.fit?.trend || '').toString().trim().toUpperCase();
    if (raw === 'IMPROVING') return '↑';
    if (raw === 'DECLINING') return '↓';
    if (raw === 'FLAT') return '→';
    return '→';
  }

  get fitTrendText(): string {
    const raw = (this.vm.fit?.trend || '').toString().trim().toUpperCase();
    if (raw === 'IMPROVING') return 'Tõusuteel';
    if (raw === 'DECLINING') return 'Languses';
    if (raw === 'FLAT') return 'Stabiilne';
    return 'Stabiilne';
  }

  /**
   * Small, subtle focus dimension label, based on fit.currentDimension.
   */
  get focusDimensionLabel(): string | null {
    const fit = this.vm.fit;
    if (!fit || fit.computed !== true) {
      return null;
    }
    const label = (fit.currentDimension || '').toString().trim();
    return label.length > 0 ? label : null;
  }

  openFitExplain(): void {
    this.isFitExplainOpen = true;
  }

  closeFitExplain(): void {
    this.isFitExplainOpen = false;
  }

  // ── Zeigarnik Effect — dimensiooniuurija ─────────────────────────────────
  /**
   * Returns all known dimensions with explored/unexplored status.
   * Unexplored dims create the "unfinished task" feeling (Zeigarnik).
   */
  get zeigarnikAreas(): { key: string; label: string; explored: boolean; scorePercent: number | null }[] {
    const allKeys = Object.keys(this.dimensionsMap);
    const breakdown = this.vm.fitBreakdown;
    const exploredMap = new Map<string, number | null>();

    if (breakdown?.dimensions) {
      for (const d of breakdown.dimensions) {
        if (d.scorePercent !== null && d.scorePercent !== undefined) {
          exploredMap.set(d.key, d.scorePercent);
        }
      }
    }

    return allKeys.slice(0, 7).map(key => ({
      key,
      label: this.dimensionsMap[key]?.label ?? key,
      explored: exploredMap.has(key),
      scorePercent: exploredMap.get(key) ?? null,
    }));
  }

  get zeigarnikExploredCount(): number {
    return this.zeigarnikAreas.filter(a => a.explored).length;
  }

  get zeigarnikTotalCount(): number {
    return this.zeigarnikAreas.length;
  }

  // ── Variable Reward — pick after each answer ─────────────────────────────
  private pickVariableReward(questionCount: number): void {
    // Variable interval schedule: NOT every answer gets feedback.
    // Pattern per question mod 8: insight=1,4 | challenge=2,6 | nudge=5 | nothing=0,3,7
    const n = questionCount % 8;
    if (n === 1 || n === 4) {
      const pool = this.rewardPools.insight;
      this.variableReward = { message: pool[Math.floor(Math.random() * pool.length)], type: 'insight' };
    } else if (n === 2 || n === 6) {
      const pool = this.rewardPools.challenge;
      this.variableReward = { message: pool[Math.floor(Math.random() * pool.length)], type: 'challenge' };
    } else if (n === 5) {
      const pool = this.rewardPools.nudge;
      this.variableReward = { message: pool[Math.floor(Math.random() * pool.length)], type: 'nudge' };
    } else {
      // No reward — silence makes the rewarded turns feel special
      this.variableReward = null;
    }
  }

  /* ========================= */

  runInterview(): void {
    if (!this.candidateEmail.trim()) {
      this.error = 'Please provide your email.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.resetSessionState(false);

    const payload: InterviewSessionCreateRequest = {
      email: this.candidateEmail.trim()
    };

    this.sessionApi.createSession(payload).subscribe({
      next: (res: InterviewSessionCreateResponse) => {
        // Prefer UUID when available and valid; fall back to numeric sessionId for
        // backends that use numeric identifiers.
        let canonicalId: string | null = null;
        if (res.sessionUuid && this.uuidPattern.test(res.sessionUuid)) {
          canonicalId = res.sessionUuid;
        } else if (res.sessionId !== undefined && res.sessionId !== null) {
          canonicalId = String(res.sessionId);
        }

        if (!canonicalId) {
          this.error = 'Invalid session id from backend.';
          this.loading = false;
          return;
        }

        this.currentSessionId = canonicalId;
        this.displaySessionId = String(res.sessionId ?? canonicalId);
        this.currentQuestionNumber = null;
        this.streak.recordActivity();
        this.savedSession = null;
        this._savedSessionRaw = null;

        const debugInfo: InterviewDebugSessionInfo = {
          sessionId: this.displaySessionId,
          sessionUuid: res.sessionUuid ?? null,
          email: this.candidateEmail.trim()
        };
        this.debugState.setSessionInfo(debugInfo);

        // Immediately ask backend for the first question so that the server
        // persists currentQuestion state before the user can answer.
        this.requestNextQuestionWithoutAnswer();
      },
      error: () => {
        this.error = 'Failed to start interview.';
        this.loading = false;
      }
    });
  }

  submitAnswer(): void {
    const trimmedAnswer = this.currentAnswerText.trim();

    // Do not allow submitting unless backend has confirmed an active question.
    if (!this.currentSessionId || !trimmedAnswer) {
      return;
    }
    if (!this.vm.currentQuestion) {
      // Session exists but UI is out of sync with backend; try to resync first.
      this.syncNotice = 'Sünkroniseerin sessiooni...';
      this.requestNextQuestionWithoutAnswer();
      return;
    }

    const sessionKey = this.getSessionKey();

    if (sessionKey) {
      this.observerLog.info(
        'ANSWER_SUBMITTED',
        'Answer submitted',
        { length: trimmedAnswer.length },
        sessionKey
      );
    }

    this.isSubmitting = true;
    this.loading = true;

    this.sessionApi
      .nextQuestion(this.currentSessionId, trimmedAnswer)
      .subscribe({
        next: (res: InterviewProgressResponse) => {
          const prevQ = this.vm.currentQuestion ?? '';
          const prevN = this.vm.questionCount ?? 1;

          this.vm.transcript.push({
            questionNumber: prevN,
            question: prevQ,
            answer: trimmedAnswer,
            decision: res.decision ?? undefined
          });

          this.vm = {
            ...this.vm,
            currentQuestion: res.question,
            decision: res.decision ?? null,
            progress: res.progress ?? null,
            questionCount: res.progress?.questionCount ?? prevN + 1,
            fitScore: res.fitScore ?? null,
            fitTrend: res.fitTrend ?? null,
            sessionComplete: !!res.sessionComplete,
            fit: res.fit ?? null,
            fitBreakdown: res.fitBreakdown ?? null
          };

          this.currentQuestion = { question: res.question };
          this.currentQuestionNumber = this.vm.questionCount;
          this.currentAnswerText = '';
          this.loading = false;
          this.isSubmitting = false;
          this.syncNotice = '';

          // Update candidate summary from backend, if provided.
          this.candidateSummaryState.setSummary(res.candidateSummary ?? null);

          // Persist progress and record streak activity after each answer.
          this.streak.recordActivity();
          this.persistSession();
          this.pickVariableReward(this.vm.questionCount ?? 0);

          // Optional dev-only observer log when fit becomes ready
          const q = this.effectiveQuestionCount;
          const fit = this.vm.fit;
          const isNowReady =
            !!fit &&
            fit.computed === true &&
            fit.overall !== null &&
            fit.overall !== undefined &&
            q >= 3;

          const sessionUuid = this.currentSessionId ?? null;

          if (isNowReady && sessionUuid && !this.hasFitReadyBeenEmitted(sessionUuid)) {
            const fitSessionKey = this.getSessionKey();

            this.observerLog.info(
              'FIT_READY',
              'Fit computed after 3 answers',
              {
                questionCount: q,
                overall: fit.overall,
                trend: fit.trend
              },
              fitSessionKey ?? sessionUuid
            );
            this.markFitReadyEmitted(sessionUuid);
          }
        },
        error: (err) => {
          const message = this.extractErrorMessage(err) || '';
          const lower = message.toLowerCase();

          // If backend indicates that we must request next question first,
          // automatically recover by syncing and showing a small dev-only hint.
          if (lower.includes('request next question first')) {
            this.syncNotice = 'Sünkroniseerin sessiooni...';
            this.requestNextQuestionWithoutAnswer();
          } else {
            this.error = 'Failed to submit answer.';
          }
          this.loading = false;
          this.isSubmitting = false;
        }
      });
  }

  restart(): void {
    this.resetSessionState(true);
  }

  hasValidSessionId(): boolean {
    return !!this.currentSessionId && this.uuidPattern.test(this.currentSessionId);
  }

  dimensionWidth(score: number): number {
    return Math.max(0, Math.min((score ?? 0) * 100, 100));
  }

  humanLabel(key: string): string {
    return this.dimensionsMap[key]?.label ?? key;
  }

  dimensionMeta(key: string): SoftSkillDimension | null {
    return this.dimensionsMap[key] ?? null;
  }

  toggleDim(key: string): void {
    this.expandedDimensions.has(key)
      ? this.expandedDimensions.delete(key)
      : this.expandedDimensions.add(key);
    this.expandedDimensions = new Set(this.expandedDimensions);
  }

  isExpanded(key: string): boolean {
    return this.expandedDimensions.has(key);
  }

  private loadDimensions(): void {
    this.catalog.getDimensions().subscribe({
      next: dims => {
        this.dimensionsMap = dims.reduce((acc, d) => {
          acc[d.key] = d;
          return acc;
        }, {} as Record<string, SoftSkillDimension>);
      },
      error: () => (this.dimensionsMap = {})
    });
  }

  /** Persist current session state to localStorage so user can resume after page close (Point 4). */
  private persistSession(): void {
    if (!this.currentSessionId) return;
    const answered = (this.vm.questionCount || this.currentQuestionNumber) ?? 0;
    const total = this.totalQuestions || 1;
    const progressPct = Math.round((answered / total) * 100);
    const data = {
      sessionId: this.currentSessionId,
      displaySessionId: this.displaySessionId,
      roleTitle: this.roleTitle,
      companyName: this.companyName,
      candidateEmail: this.candidateEmail,
      seniority: this.seniority,
      interviewerStyle: this.interviewerStyle,
      questionNumber: answered,
      totalQuestions: total,
      transcript: this.vm.transcript,
      progressPct,
      savedAt: new Date().toISOString()
    };
    try { localStorage.setItem(InterviewStudioPageComponent.SESSION_PERSIST_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }

  /** On init: check if there is a paused session in localStorage and show resume banner. */
  private checkSavedSession(): void {
    try {
      const raw = localStorage.getItem(InterviewStudioPageComponent.SESSION_PERSIST_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data?.sessionId || !data?.roleTitle) return;
      // Only offer resume if session was saved recently (< 24h)
      const savedAt = new Date(data.savedAt).getTime();
      if (Date.now() - savedAt > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(InterviewStudioPageComponent.SESSION_PERSIST_KEY);
        return;
      }
      this._savedSessionRaw = data;
      this.savedSession = {
        roleTitle: data.roleTitle,
        companyName: data.companyName,
        progressPct: data.progressPct ?? 0
      };
    } catch { /* ignore */ }
  }

  private resetSessionState(resetForm: boolean): void {
    this.currentSessionId = null;
    this.displaySessionId = null;
    this.currentQuestion = null;
    this.currentQuestionNumber = null;
    this.currentAnswerText = '';
    this.summary = null;
    this.syncNotice = '';
    this.vm = {
      currentQuestion: null,
      decision: null,
      progress: null,
      questionCount: null,
      fitScore: null,
      fitTrend: null,
      sessionComplete: false,
      transcript: [],
      fit: null,
      fitBreakdown: null
    };

    // Reset any CV-derived interview profile for a fresh session.
    this.interviewProfileState.reset();

    if (resetForm) {
      this.companyName = '';
      this.roleTitle = '';
      this.candidateEmail = '';
      this.seniority = 'MID';
      this.interviewerStyle = 'HR';
    }

    // Reset candidate summary state for new / cleared session.
    this.candidateSummaryState.reset();

    // Clear persisted session so resume banner doesn't show stale data.
    try { localStorage.removeItem(InterviewStudioPageComponent.SESSION_PERSIST_KEY); } catch { /* ignore */ }
  }

  /**
   * Returns true when a FIT_READY observer event has already been emitted
   * for the given session UUID in this browser (either during this runtime
   * or a previous page load). Uses an in-memory Set plus localStorage.
   */
  private hasFitReadyBeenEmitted(sessionUuid: string): boolean {
    if (!sessionUuid) {
      return false;
    }

    if (InterviewStudioPageComponent.fitReadySeenSessionUuids.has(sessionUuid)) {
      return true;
    }

    try {
      const raw = localStorage.getItem(InterviewStudioPageComponent.FIT_READY_STORAGE_KEY);
      if (!raw) {
        return false;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.includes(sessionUuid)) {
        InterviewStudioPageComponent.fitReadySeenSessionUuids.add(sessionUuid);
        return true;
      }
    } catch {
      // Ignore storage errors and fall back to runtime-only guard
      return false;
    }

    return false;
  }

  /**
   * Marks that a FIT_READY observer event has been emitted for the given
   * session UUID. Updates both in-memory cache and localStorage so that
   * the guard survives page refresh but resets for new session UUIDs.
   */
  private markFitReadyEmitted(sessionUuid: string): void {
    if (!sessionUuid) {
      return;
    }

    InterviewStudioPageComponent.fitReadySeenSessionUuids.add(sessionUuid);

    try {
      const key = InterviewStudioPageComponent.FIT_READY_STORAGE_KEY;
      const raw = localStorage.getItem(key);
      let list: string[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed as string[];
        }
      }

      if (!list.includes(sessionUuid)) {
        list.push(sessionUuid);
      }

      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Ignore storage errors – logging is best-effort only
    }
  }

  /**
   * Request the next question from backend without submitting an answer.
   * Used to obtain the very first question after starting a session and to
   * recover from desynchronised states where backend expects "request next
   * question first".
   */
  private requestNextQuestionWithoutAnswer(): void {
    if (!this.currentSessionId) {
      return;
    }

    this.loading = true;
    this.sessionApi.nextQuestion(this.currentSessionId, '').subscribe({
      next: (res: InterviewProgressResponse) => {
        this.vm = {
          ...this.vm,
          currentQuestion: res.question,
          decision: res.decision ?? null,
          progress: res.progress ?? null,
          questionCount: res.progress?.questionCount ?? this.vm.questionCount ?? 1,
          fitScore: res.fitScore ?? null,
          fitTrend: res.fitTrend ?? null,
          sessionComplete: !!res.sessionComplete,
          fit: res.fit ?? null,
          fitBreakdown: res.fitBreakdown ?? null
        };

        this.currentQuestion = { question: res.question };
        this.currentQuestionNumber = this.vm.questionCount;
        this.loading = false;
        this.syncNotice = '';

        // Update candidate summary from backend, if provided.
        this.candidateSummaryState.setSummary(res.candidateSummary ?? null);

        const sessionKey = this.getSessionKey();
        if (sessionKey) {
          this.observerLog.info(
            'NEXT_QUESTION',
            'Question served',
            {
              decision: res.decision ?? null,
              questionCount: res.progress?.questionCount ?? null,
              dimension: res.progress?.currentDimension ?? null
            },
            sessionKey
          );
        }
      },
      error: () => {
        this.error = 'Failed to fetch next question.';
        this.loading = false;
      }
    });
  }

  private extractErrorMessage(error: unknown): string | null {
    if (!error) {
      return null;
    }
    const anyErr: any = error as any;
    if (typeof anyErr.error === 'string') {
      return anyErr.error;
    }
    if (anyErr.error && typeof anyErr.error.message === 'string') {
      return anyErr.error.message;
    }
    if (typeof anyErr.message === 'string') {
      return anyErr.message;
    }
    return null;
  }
}
