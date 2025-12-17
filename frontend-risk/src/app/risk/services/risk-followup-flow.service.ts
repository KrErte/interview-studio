import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { RiskApiService, RiskQuestion, RiskSummary } from '../../core/services/risk-api.service';

interface PersistedFollowupState {
  askedIds: string[];
  answers: FollowupAnswer[];
  currentIndex: number;
  sessionKey: string;
}

interface FollowupAnswer {
  questionKey: string;
  answer: string;
  dedupeKey?: string;
}

@Injectable({ providedIn: 'root' })
export class RiskFollowupFlowService {
  private readonly STORAGE_KEY = 'riskFollowup:v1';
  private readonly MAX_QUESTIONS = 3;
  private readonly RETRY_LIMIT = 3;
  private readonly RETRY_DELAY_MS = 200;

  private askedIds = new Set<string>();
  private answers: FollowupAnswer[] = [];
  private sessionKey = this.generateSessionKey();

  private currentQuestionSubject = new BehaviorSubject<RiskQuestion | null>(null);
  readonly currentQuestion$ = this.currentQuestionSubject.asObservable();

  private questionIndexSubject = new BehaviorSubject<number>(0);
  readonly questionIndex$ = this.questionIndexSubject.asObservable();

  private totalQuestionsSubject = new BehaviorSubject<number>(this.MAX_QUESTIONS);
  readonly totalQuestions$ = this.totalQuestionsSubject.asObservable();

  private qaErrorSubject = new BehaviorSubject<string>('');
  readonly qaError$ = this.qaErrorSubject.asObservable();

  private isLoadingQuestionSubject = new BehaviorSubject<boolean>(false);
  readonly isLoadingQuestion$ = this.isLoadingQuestionSubject.asObservable();

  private isSubmittingAnswerSubject = new BehaviorSubject<boolean>(false);
  readonly isSubmittingAnswer$ = this.isSubmittingAnswerSubject.asObservable();

  private isReevaluatingSubject = new BehaviorSubject<boolean>(false);
  readonly isReevaluating$ = this.isReevaluatingSubject.asObservable();

  private isDoneSubject = new BehaviorSubject<boolean>(false);
  readonly isDone$ = this.isDoneSubject.asObservable();

  constructor(private riskApi: RiskApiService) {
    this.restoreState();
  }

  beginCycle(): Observable<RiskQuestion | null> {
    if (!this.isDoneSubject.value && (this.askedIds.size > 0 || this.questionIndexSubject.value > 0)) {
      return this.resumeCycle();
    }
    return this.startCycle();
  }

  startCycle(): Observable<RiskQuestion | null> {
    this.isDoneSubject.next(false);
    this.qaErrorSubject.next('');
    this.currentQuestionSubject.next(null);
    this.questionIndexSubject.next(0);
    this.askedIds.clear();
    this.answers = [];
    this.persistState();
    return this.loadNextQuestion();
  }

  resumeCycle(): Observable<RiskQuestion | null> {
    if (this.isDoneSubject.value) {
      return of(null);
    }
    if (this.currentQuestionSubject.value) {
      return of(this.currentQuestionSubject.value);
    }
    return this.loadNextQuestion();
  }

  loadNextQuestion(): Observable<RiskQuestion | null> {
    if (this.isLoadingQuestionSubject.value || this.isDoneSubject.value) {
      return of(null);
    }
    if (this.questionIndexSubject.value >= this.MAX_QUESTIONS) {
      this.isDoneSubject.next(true);
      return of(null);
    }
    this.isLoadingQuestionSubject.next(true);
    this.qaErrorSubject.next('');
    return this.fetchUniqueQuestion(1).pipe(
      tap((q) => {
        if (q) {
          this.currentQuestionSubject.next(q);
        }
      }),
      finalize(() => this.isLoadingQuestionSubject.next(false))
    );
  }

  submitAnswer(answer: string): Observable<RiskSummary | null> {
    if (this.isSubmittingAnswerSubject.value || this.isDoneSubject.value) {
      return of(null);
    }
    const currentQuestion = this.currentQuestionSubject.value;
    if (!currentQuestion) {
      return of(null);
    }
    this.isSubmittingAnswerSubject.next(true);
    this.qaErrorSubject.next('');
    const dedupeKey = this.buildDedupeKey(currentQuestion);
    const submit$ = this.riskApi.submitAnswer(currentQuestion.signalKey, answer).pipe(
      catchError((err) => {
        this.qaErrorSubject.next(err?.error?.message || 'Could not submit answer.');
        return of(null);
      })
    );

    return submit$.pipe(
      switchMap((result) => {
        if (result === null) {
          return of(null);
        }
        this.answers.push({ questionKey: currentQuestion.signalKey, answer, dedupeKey });
        const nextIndex = this.questionIndexSubject.value + 1;
        this.questionIndexSubject.next(nextIndex);
        this.persistState();

        if (nextIndex >= this.MAX_QUESTIONS) {
          return this.triggerReEvaluate();
        }
        this.currentQuestionSubject.next(null);
        return this.loadNextQuestion();
      }),
      finalize(() => this.isSubmittingAnswerSubject.next(false))
    );
  }

  skipQuestion(): Observable<RiskSummary | null> {
    if (this.isSubmittingAnswerSubject.value || this.isDoneSubject.value) {
      return of(null);
    }
    const currentQuestion = this.currentQuestionSubject.value;
    if (!currentQuestion) {
      return of(null);
    }
    this.isSubmittingAnswerSubject.next(true);
    this.qaErrorSubject.next('');
    const dedupeKey = this.buildDedupeKey(currentQuestion);
    const skip$ = this.riskApi.skipQuestion(currentQuestion.signalKey).pipe(
      catchError((err) => {
        this.qaErrorSubject.next(err?.error?.message || 'Could not skip question.');
        return of(null);
      })
    );
    return skip$.pipe(
      switchMap((result) => {
        if (result === null) {
          return of(null);
        }
        this.answers.push({ questionKey: currentQuestion.signalKey, answer: '', dedupeKey });
        const nextIndex = this.questionIndexSubject.value + 1;
        this.questionIndexSubject.next(nextIndex);
        this.persistState();

        if (nextIndex >= this.MAX_QUESTIONS) {
          return this.triggerReEvaluate();
        }
        this.currentQuestionSubject.next(null);
        return this.loadNextQuestion();
      }),
      finalize(() => this.isSubmittingAnswerSubject.next(false))
    );
  }

  resetCycle(): void {
    this.isDoneSubject.next(false);
    this.qaErrorSubject.next('');
    this.currentQuestionSubject.next(null);
    this.questionIndexSubject.next(0);
    this.askedIds.clear();
    this.answers = [];
    this.persistState();
  }

  private fetchUniqueQuestion(attempt: number): Observable<RiskQuestion | null> {
    return this.riskApi.getNextQuestion().pipe(
      switchMap((question) => {
        if (!question) {
          return of(null);
        }
        const dedupeKey = this.buildDedupeKey(question);
        if (dedupeKey && this.askedIds.has(dedupeKey)) {
          if (attempt >= this.RETRY_LIMIT) {
            this.qaErrorSubject.next(
              'Could not fetch a new unique question. Please re-evaluate or try again.'
            );
            this.isDoneSubject.next(true);
            return of(null);
          }
          return timer(this.RETRY_DELAY_MS).pipe(switchMap(() => this.fetchUniqueQuestion(attempt + 1)));
        }
        if (dedupeKey) {
          this.askedIds.add(dedupeKey);
          this.persistState();
        }
        return of(question);
      }),
      catchError((err) => {
        this.qaErrorSubject.next(err?.error?.message || 'Could not load question.');
        return of(null);
      })
    );
  }

  private triggerReEvaluate(): Observable<RiskSummary | null> {
    if (this.isReevaluatingSubject.value) {
      return of(null);
    }
    this.isReevaluatingSubject.next(true);
    this.qaErrorSubject.next('');
    return this.riskApi.reEvaluate().pipe(
      tap((summary) => {
        this.isDoneSubject.next(true);
        this.currentQuestionSubject.next(null);
        this.answers = [];
        this.askedIds.clear();
        this.clearState();
      }),
      catchError((err) => {
        this.qaErrorSubject.next(err?.error?.message || 'Could not re-evaluate risk.');
        return of(null);
      }),
      finalize(() => this.isReevaluatingSubject.next(false))
    );
  }

  private buildDedupeKey(question: RiskQuestion): string {
    if (question.id) {
      return question.id;
    }
    const text = question.questionText || question.question || '';
    return text ? this.hashString(text) : `${question.signalKey}`;
  }

  private hashString(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return `h${Math.abs(hash)}`;
  }

  private generateSessionKey(): string {
    return `sess_${Math.random().toString(36).slice(2, 10)}`;
  }

  private persistState(): void {
    const payload: PersistedFollowupState = {
      askedIds: Array.from(this.askedIds),
      answers: this.answers,
      currentIndex: this.questionIndexSubject.value,
      sessionKey: this.sessionKey
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage errors
    }
  }

  private restoreState(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as PersistedFollowupState;
      this.sessionKey = parsed.sessionKey || this.sessionKey;
      this.askedIds = new Set(parsed.askedIds || []);
      this.answers = parsed.answers || [];
      if (typeof parsed.currentIndex === 'number') {
        this.questionIndexSubject.next(parsed.currentIndex);
      }
    } catch {
      // ignore parse errors
    }
  }

  private clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }
}

