import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  QuestionType,
  RiskLevel,
  RiskQuestion,
  RiskQuestionAnswer
} from '../../core/models/risk.models';
import { RiskFlowState, RiskFlowStore } from '../../core/services/risk-flow.store';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss']
})
export class RiskComponent implements OnInit, OnDestroy {
  private readonly flow = inject(RiskFlowStore);
  readonly state$ = this.flow.stateChanges;
  readonly QuestionType = QuestionType;
  readonly RiskLevel = RiskLevel;
  readonly Array = Array;

  answer: RiskQuestionAnswer = '';
  private lastQuestionId: string | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.flow.stateChanges.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state.currentQuestion?.id !== this.lastQuestionId) {
        this.lastQuestionId = state.currentQuestion?.id ?? null;
        this.answer = this.defaultAnswer(state.currentQuestion);
      }
    });

    this.flow.startFlow().subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  restart(): void {
    this.lastQuestionId = null;
    this.answer = '';
    this.flow.startFlow().subscribe();
  }

  submitAnswer(state: RiskFlowState): void {
    const question = state.currentQuestion;
    if (!question) {
      return;
    }
    this.flow.submitAnswer(question.id, this.answer, false).subscribe();
  }

  skipQuestion(state: RiskFlowState): void {
    const question = state.currentQuestion;
    if (!question) {
      return;
    }
    this.flow.submitAnswer(question.id, null, true).subscribe();
  }

  evaluate(state: RiskFlowState): void {
    if (state.loadingEvaluate || !state.sessionId) {
      return;
    }
    this.flow.reEvaluate().subscribe();
  }

  canSubmit(state: RiskFlowState): boolean {
    const question = state.currentQuestion;
    if (!question) {
      return false;
    }
    if (state.loadingAnswer || state.loadingEvaluate) {
      return false;
    }
    if (!question.required) {
      return true;
    }
    return this.hasAnswer(question, this.answer);
  }

  onSelectSingle(value: string): void {
    this.answer = value;
  }

  toggleMulti(value: string, checked: boolean): void {
    const current = this.isArray(this.answer) ? [...this.answer] : [];
    const next = new Set(current);
    checked ? next.add(value) : next.delete(value);
    this.answer = Array.from(next);
  }

  setBoolean(val: boolean): void {
    this.answer = val;
  }

  private defaultAnswer(question: RiskQuestion | null): RiskQuestionAnswer {
    if (!question) {
      return '';
    }
    if (question.type === QuestionType.MULTI_CHOICE || question.type === 'multi-select') {
      return [];
    }
    if (question.type === QuestionType.BOOLEAN || question.type === 'boolean') {
      return null;
    }
    if (question.type === QuestionType.SCALE || question.type === 'scale') {
      return question.min ?? 0;
    }
    return '';
  }

  private hasAnswer(question: RiskQuestion, answer: RiskQuestionAnswer): boolean {
    if (question.type === QuestionType.MULTI_CHOICE || question.type === 'multi-select') {
      return this.isArray(answer) && answer.length > 0;
    }
    if (question.type === QuestionType.BOOLEAN || question.type === 'boolean') {
      return typeof answer === 'boolean';
    }
    if (answer === null || answer === undefined) {
      return false;
    }
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    if (typeof answer === 'number') {
      return true;
    }
    return String(answer).trim().length > 0;
  }

  isArray(value: RiskQuestionAnswer): value is string[] {
    return Array.isArray(value);
  }

  isMultiSelected(option: string): boolean {
    return this.isArray(this.answer) && this.answer.includes(option);
  }
}
