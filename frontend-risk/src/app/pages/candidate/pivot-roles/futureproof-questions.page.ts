import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavContextService } from '../../../core/services/nav-context.service';
import { RiskApiService } from '../../../core/services/risk-api.service';
import { ExperienceInput, RiskQuestion } from '../../../core/models/risk.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-futureproof-questions-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './futureproof-questions.page.html'
})
export class FutureproofQuestionsPageComponent implements OnInit, OnDestroy {
  sessionId: string | null = null;
  question: RiskQuestion | null = null;
  questionIndex = 0;
  totalQuestions = 3;

  answerText = '';

  loadingStart = false;
  loadingQuestion = false;
  submitting = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private riskApi: RiskApiService,
    private navContext: NavContextService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.navContext.setFutureproofNav([
      { label: 'Ülevaade', key: 'OVERVIEW' },
      { label: 'Profiil', key: 'PROFILE' },
      { label: 'Küsimused', key: 'QUESTIONS' },
      { label: 'Analüüs', key: 'ANALYSIS' },
      { label: 'Tegevuskava', key: 'ROADMAP' }
    ]);
    this.navContext.setActiveKey('QUESTIONS');
    this.startAssessment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startAssessment(): void {
    this.loadingStart = true;
    this.error = null;
    const experience: ExperienceInput = {
      yearsOfExperience: 0,
      currentRole: '',
      seniority: 'Mid',
      industry: '',
      stack: ''
    };
    const request = {
      cvFileId: undefined as string | undefined,
      experience
    };
    this.riskApi
      .startAssessment(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.sessionId = res.sessionId;
          if (this.sessionId) {
            sessionStorage.setItem('fp_session', this.sessionId);
          }
          this.loadingStart = false;
          this.loadNextQuestion();
        },
        error: (err) => {
          this.loadingStart = false;
          this.error = err?.error?.message || 'Ei saanud küsimusi alustada. Proovi uuesti.';
        }
      });
  }

  loadNextQuestion(): void {
    if (!this.sessionId) {
      this.error = 'Seanssi ei leitud. Alusta uuesti.';
      return;
    }
    this.loadingQuestion = true;
    this.error = null;
    this.riskApi
      .getNextQuestion(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.question = res.question || null;
          this.questionIndex = res.index ?? 0;
          this.totalQuestions = res.total ?? 3;
          this.answerText = '';
          this.loadingQuestion = false;
        },
        error: () => {
          this.loadingQuestion = false;
          // If no more questions, proceed to assessment
          if (this.questionIndex >= this.totalQuestions) {
            this.navigateToAssessment();
          } else {
            this.error = 'Küsimust ei õnnestu laadida. Proovi uuesti.';
          }
        }
      });
  }

  submitAnswer(): void {
    if (!this.sessionId || !this.question) {
      return;
    }
    this.submitting = true;
    this.error = null;
    this.riskApi
      .submitAnswer({
        sessionId: this.sessionId,
        questionId: this.question.id,
        answer: this.answerText,
        skipped: false
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          if (this.questionIndex >= this.totalQuestions) {
            this.navigateToAssessment();
          } else {
            this.loadNextQuestion();
          }
        },
        error: (err) => {
          this.submitting = false;
          this.error = err?.error?.message || 'Vastus ei läinud läbi. Proovi uuesti.';
        }
      });
  }

  skipQuestion(): void {
    if (!this.sessionId || !this.question) {
      return;
    }
    this.submitting = true;
    this.error = null;
    this.riskApi
      .skipQuestion(this.sessionId, this.question.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          if (this.questionIndex >= this.totalQuestions) {
            this.navigateToAssessment();
          } else {
            this.loadNextQuestion();
          }
        },
        error: (err) => {
          this.submitting = false;
          this.error = err?.error?.message || 'Vahelejätmine ebaõnnestus. Proovi uuesti.';
        }
      });
  }

  navigateToAssessment(): void {
    const sessionId = this.sessionId || sessionStorage.getItem('fp_session');
    const queryParams = sessionId ? { sessionId } : {};
    this.router.navigate(['/futureproof/assessment'], { queryParams });
  }
}

