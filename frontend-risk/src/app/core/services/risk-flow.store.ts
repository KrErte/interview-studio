import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import {
  QuestionType,
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskFlowEvaluateRequest,
  RiskFlowEvaluateResponse,
  RiskFlowStartRequest,
  RiskFlowStartResponse,
  RiskFlowNextResponse,
  RiskQuestion,
  RiskQuestionAnswer
} from '../models/risk.models';
import { RiskApiService } from './risk-api.service';

export interface RiskFlowState {
  sessionId: string | null;
  currentQuestion: RiskQuestion | null;
  answeredQuestionIds: string[];
  totalQuestions: number;
  isComplete: boolean;
  finalResult: RiskFlowEvaluateResponse | null;
  error: string | null;
  loadingStart: boolean;
  loadingQuestion: boolean;
  loadingAnswer: boolean;
  loadingEvaluate: boolean;
}

const initialState: RiskFlowState = {
  sessionId: null,
  currentQuestion: null,
  answeredQuestionIds: [],
  totalQuestions: 0,
  isComplete: false,
  finalResult: null,
  error: null,
  loadingStart: false,
  loadingQuestion: false,
  loadingAnswer: false,
  loadingEvaluate: false
};

@Injectable({ providedIn: 'root' })
export class RiskFlowStore {
  private readonly state = new BehaviorSubject<RiskFlowState>({ ...initialState });
  readonly stateChanges = this.state.asObservable();

  constructor(private riskApi: RiskApiService) {}

  get snapshot(): RiskFlowState {
    return this.state.value;
  }

  startFlow(payload: RiskFlowStartRequest = {}): Observable<RiskFlowState> {
    this.patchState({
      ...initialState,
      loadingStart: true,
      error: null
    });

    return this.riskApi.start(payload).pipe(
      tap((res: RiskFlowStartResponse) => {
        if (!res?.sessionId) {
          this.patchState(
            this.setErrorState('No session returned from start (dev-only guard).', { loadingStart: false })
          );
          return;
        }

        const nextState: RiskFlowState = {
          ...initialState,
          sessionId: res.sessionId,
          currentQuestion: res.firstQuestion ?? null,
          totalQuestions: res.totalQuestions ?? 0,
          answeredQuestionIds: [],
          isComplete: false,
          finalResult: null,
          error: null,
          loadingStart: false,
          loadingQuestion: false,
          loadingAnswer: false,
          loadingEvaluate: false
        };

        this.patchState(nextState);
        if (!res.firstQuestion) {
          this.fetchNextQuestion(res.sessionId).subscribe();
        }
      }),
      // ensure observable emits RiskFlowState
      map((_res): RiskFlowState => this.snapshot),
      catchError((err): Observable<RiskFlowState> =>
        of(this.setErrorState(this.resolveError(err), { loadingStart: false }))
      ),
      finalize(() => {
        if (this.snapshot.loadingStart) {
          this.patchState({ ...this.snapshot, loadingStart: false });
        }
      })
    );
  }

  submitAnswer(questionId: string, answer: RiskQuestionAnswer, skipped = false): Observable<RiskFlowState> {
    if (!this.snapshot.sessionId) {
      this.patchState({ ...this.snapshot, error: 'No active session' });
      return of(this.snapshot);
    }

    const payload: RiskFlowAnswerRequest = {
      sessionId: this.snapshot.sessionId,
      questionId,
      answer,
      skipped
    };

    this.patchState({ ...this.snapshot, loadingAnswer: true, error: null });

    return this.riskApi.answer(payload).pipe(
      tap((res: RiskFlowAnswerResponse) => {
        const answeredQuestionIds = this.mergeAnswered(this.snapshot.answeredQuestionIds, questionId);
        const currentQuestion = res.nextQuestion ?? null;

        this.patchState({
          ...this.snapshot,
          sessionId: res.sessionId || this.snapshot.sessionId,
          answeredQuestionIds,
          totalQuestions: res.totalQuestions ?? this.snapshot.totalQuestions,
          isComplete: !!res.isComplete,
          currentQuestion,
          loadingAnswer: false,
          error: null
        });
        if (!currentQuestion && !res.isComplete) {
          this.fetchNextQuestion(this.snapshot.sessionId as string).subscribe();
        }
      }),
      map((_res): RiskFlowState => this.snapshot),
      catchError((err): Observable<RiskFlowState> => of(this.handleFlowError(err))),
      finalize(() => {
        if (this.snapshot.loadingAnswer) {
          this.patchState({ ...this.snapshot, loadingAnswer: false });
        }
      })
    );
  }

  reEvaluate(forceRecalculate = false): Observable<RiskFlowState> {
    if (!this.snapshot.sessionId) {
      this.patchState({ ...this.snapshot, error: 'No active session' });
      return of(this.snapshot);
    }

    const payload: RiskFlowEvaluateRequest = {
      sessionId: this.snapshot.sessionId,
      forceRecalculate
    };

    this.patchState({ ...this.snapshot, loadingEvaluate: true, error: null });

    return this.riskApi.evaluate(payload).pipe(
      tap((res: RiskFlowEvaluateResponse) => {
        this.patchState({
          ...this.snapshot,
          sessionId: res.sessionId || this.snapshot.sessionId,
          isComplete: res.isComplete,
          finalResult: res,
          currentQuestion: null,
          loadingEvaluate: false,
          error: null
        });
      }),
      map((_res): RiskFlowState => this.snapshot),
      catchError((err): Observable<RiskFlowState> => of(this.handleFlowError(err))),
      finalize(() => {
        if (this.snapshot.loadingEvaluate) {
          this.patchState({ ...this.snapshot, loadingEvaluate: false });
        }
      })
    );
  }

  private patchState(next: RiskFlowState): void {
    this.state.next(next);
  }

  private fetchNextQuestion(sessionId: string): Observable<RiskFlowState> {
    if (!sessionId) {
      return of(this.setErrorState('No active session'));
    }
    this.patchState({ ...this.snapshot, loadingQuestion: true });
    return this.riskApi.next({ sessionId }).pipe(
      tap((res: RiskFlowNextResponse) => {
        const totalQuestions = res.totalPlanned ?? this.snapshot.totalQuestions;
        const isDone = !!res.done;

        if (isDone) {
          this.patchState({
            ...this.snapshot,
            isComplete: true,
            currentQuestion: null,
            totalQuestions,
            loadingQuestion: false,
            error: null
          });
          return;
        }

        const nextQuestion =
          res.question && res.questionId
            ? ({
                id: res.questionId,
                type: QuestionType.TEXT,
                text: res.question
              } as RiskQuestion)
            : null;

        if (!nextQuestion) {
          this.patchState({
            ...this.snapshot,
            currentQuestion: null,
            totalQuestions,
            loadingQuestion: false,
            error: 'No questions available.'
          });
          return;
        }

        this.patchState({
          ...this.snapshot,
          currentQuestion: nextQuestion,
          totalQuestions,
          loadingQuestion: false,
          error: null
        });
      }),
      map((): RiskFlowState => this.snapshot),
      catchError((err): Observable<RiskFlowState> => of(this.handleFlowError(err))),
      finalize(() => {
        if (this.snapshot.loadingQuestion) {
          this.patchState({ ...this.snapshot, loadingQuestion: false });
        }
      })
    );
  }

  private handleFlowError(err: any): RiskFlowState {
    const status = err?.status;
    if (status === 404 || status === 410) {
      return this.clearSession('Session expired, restart');
    }
    if (status === 401) {
      return this.setErrorState('Session expired, please login.');
    }
    const next = this.setErrorState(this.resolveError(err));
    this.patchState(next);
    return next;
  }

  private clearSession(message: string): RiskFlowState {
    const next: RiskFlowState = {
      ...initialState,
      error: message
    };
    this.patchState(next);
    return next;
  }

  private resolveError(err: any): string {
    if (err?.status === 0) {
      return 'Backend unreachable (is it running on :8082?)';
    }
    return err?.error?.message || err?.message || 'Something went wrong. Please try again.';
  }

  private setErrorState(message: string, patch: Partial<RiskFlowState> = {}): RiskFlowState {
    const next: RiskFlowState = {
      ...this.snapshot,
      ...patch,
      error: message,
      loadingStart: false,
      loadingAnswer: false,
      loadingEvaluate: false
    };
    this.patchState(next);
    return next;
  }

  private mergeAnswered(current: string[], questionId: string): string[] {
    if (!questionId) return current;
    const next = new Set(current);
    next.add(questionId);
    return Array.from(next);
  }
}

