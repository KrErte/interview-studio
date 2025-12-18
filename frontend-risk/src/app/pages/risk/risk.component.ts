import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RiskApiService } from '../../core/services/risk-api.service';
import {
  ExperienceInput,
  StartAssessmentRequest,
  RiskQuestion,
  AssessmentResult,
  RoadmapResponse,
  RoadmapDuration,
  GetNextQuestionResponse
} from '../../core/models/risk.models';

// Subcomponents
import { StepperHeaderComponent } from './components/stepper-header.component';
import { InlineQnAComponent, QnASubmitEvent } from './components/inline-qna.component';
import { SnapshotCardComponent } from './components/snapshot-card.component';
import { RoadmapPanelComponent } from './components/roadmap-panel.component';
import { CvUploadPanelComponent } from '../../shared/cv-upload/cv-upload-panel.component';
import { InterviewProfileDto } from '../../core/models/interview-session.model';
import { PersonaTheaterContainerComponent } from '../../features/persona-theater/persona-theater-container.component';
import { ObserverLogPanelComponent } from '../../features/observer-log/observer-log-panel.component';
import { Persona } from '../../features/persona-theater/persona.model';
import { PersonaContext } from '../../features/persona-theater/persona-context.service';

type FlowStep = 1 | 2 | 3 | 4;

interface ErrorState {
  message: string;
  canRetry: boolean;
}

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StepperHeaderComponent,
    InlineQnAComponent,
    SnapshotCardComponent,
    RoadmapPanelComponent,
    CvUploadPanelComponent,
    PersonaTheaterContainerComponent,
    ObserverLogPanelComponent
  ],
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.scss']
})
export class RiskComponent implements OnInit, OnDestroy {
  // Current step
  currentStep: FlowStep = 1;

  // Step 1: Inputs
  cvUploaded: boolean = false;
  cvFileId: string | null = null;
  experienceInput: ExperienceInput = {
    yearsOfExperience: 0,
    currentRole: '',
    seniority: 'Mid',
    industry: '',
    stack: ''
  };
  seniorityOptions = ['Junior', 'Mid', 'Senior', 'Lead'] as const;

  // Step 2: Questions
  sessionId: string | null = null;
  currentQuestion: RiskQuestion | null = null;
  questionIndex: number = 0;
  totalQuestions: number = 3;
  loadingQuestion: boolean = false;
  submittingAnswer: boolean = false;

  // Step 3: Assessment
  assessment: AssessmentResult | null = null;
  loadingAssessment: boolean = false;

  // Step 4: Roadmap
  roadmap: RoadmapResponse | null = null;
  selectedRoadmapDuration: RoadmapDuration = RoadmapDuration.SEVEN_DAYS;
  loadingRoadmap: boolean = false;

  // Error handling
  error: ErrorState | null = null;

  // Loading states
  startingAssessment: boolean = false;

  // UI state
  showObserverLog = false;
  toastMessage: string | null = null;

  private querySessionUuid: string | null = null;
  private destroy$ = new Subject<void>();
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private riskApi: RiskApiService,
    private route: ActivatedRoute,
    private personaContext: PersonaContext
  ) {}

  ngOnInit(): void {
    this.querySessionUuid = this.route.snapshot.queryParamMap.get('sessionUuid');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ============ STEP 1: INPUTS ============

  onCvUploaded(profile: InterviewProfileDto): void {
    this.cvUploaded = true;
    this.cvFileId = null;
    if (profile.sessionUuid) {
      this.querySessionUuid = profile.sessionUuid;
    }

    if (profile.experienceYearsEstimate !== null && profile.experienceYearsEstimate !== undefined) {
      this.experienceInput.yearsOfExperience = profile.experienceYearsEstimate;
    }
    if (profile.roleFocus) {
      this.experienceInput.currentRole = profile.roleFocus;
    }

    this.clearError();
  }

  canCalculateRisk(): boolean {
    return (
      (this.cvUploaded || this.cvFileId !== null) &&
      this.experienceInput.yearsOfExperience > 0 &&
      this.experienceInput.currentRole.trim().length > 0
    );
  }

  calculateRisk(): void {
    if (!this.canCalculateRisk()) {
      this.setError('Please upload CV and fill required fields (years of experience, current role).', false);
      return;
    }

    this.startingAssessment = true;
    this.clearError();

    const request: StartAssessmentRequest = {
      cvFileId: this.cvFileId || undefined,
      experience: this.experienceInput
    };

    this.riskApi.startAssessment(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.sessionId = response.sessionId;
          // keep the session uuid available for observer log view
          this.querySessionUuid = response.sessionId;
          this.currentStep = 2;
          this.startingAssessment = false;

          // Load first question
          this.loadNextQuestion();
        },
        error: (err) => {
          this.startingAssessment = false;
          this.setError('Failed to start assessment. Please try again.', true);
          console.error('Start assessment error:', err);
        }
      });
  }

  // ============ STEP 2: QUESTIONS ============

  loadNextQuestion(): void {
    if (!this.sessionId) {
      return;
    }

    this.loadingQuestion = true;
    this.clearError();

    this.riskApi.getNextQuestion(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GetNextQuestionResponse) => {
          this.currentQuestion = response.question;
          this.questionIndex = response.index;
          this.totalQuestions = response.total;
          this.loadingQuestion = false;
        },
        error: (err) => {
          this.loadingQuestion = false;

          // If no more questions, move to assessment
          if (this.questionIndex >= 3) {
            this.currentStep = 3;
            this.loadAssessment();
          } else {
            this.setError('Failed to load question. Please try again.', true);
            console.error('Load question error:', err);
          }
        }
      });
  }

  onSubmitAnswer(event: QnASubmitEvent): void {
    if (!this.sessionId || !this.currentQuestion) {
      return;
    }

    this.submittingAnswer = true;
    this.clearError();

    const request = {
      sessionId: this.sessionId,
      questionId: this.currentQuestion.id,
      answer: event.answer,
      skipped: event.skipped
    };

    this.riskApi.submitAnswer(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingAnswer = false;

          // Check if we've completed all questions
          if (this.questionIndex >= this.totalQuestions) {
            this.currentStep = 3;
            this.loadAssessment();
          } else {
            // Load next question
            this.loadNextQuestion();
          }
        },
        error: (err) => {
          this.submittingAnswer = false;
          this.setError('Failed to submit answer. Please try again.', true);
          console.error('Submit answer error:', err);
        }
      });
  }

  onSkipQuestion(): void {
    if (!this.sessionId || !this.currentQuestion) {
      return;
    }

    this.submittingAnswer = true;
    this.clearError();

    this.riskApi.skipQuestion(this.sessionId, this.currentQuestion.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingAnswer = false;

          // Check if we've completed all questions
          if (this.questionIndex >= this.totalQuestions) {
            this.currentStep = 3;
            this.loadAssessment();
          } else {
            // Load next question
            this.loadNextQuestion();
          }
        },
        error: (err) => {
          this.submittingAnswer = false;
          this.setError('Failed to skip question. Please try again.', true);
          console.error('Skip question error:', err);
        }
      });
  }

  // ============ STEP 3: ASSESSMENT ============

  loadAssessment(): void {
    if (!this.sessionId) {
      return;
    }

    this.loadingAssessment = true;
    this.clearError();

    this.riskApi.getAssessment(this.sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.assessment = result;
          this.loadingAssessment = false;
        },
        error: (err) => {
          this.loadingAssessment = false;
          this.setError('Failed to load assessment. Please try again.', true);
          console.error('Load assessment error:', err);
        }
      });
  }

  onGenerateRoadmap(): void {
    if (!this.sessionId) {
      return;
    }

    this.currentStep = 4;
    this.generateRoadmap(this.selectedRoadmapDuration);
  }

  // ============ STEP 4: ROADMAP ============

  generateRoadmap(duration: RoadmapDuration): void {
    if (!this.sessionId) {
      return;
    }

    this.loadingRoadmap = true;
    this.clearError();

    this.riskApi.generateRoadmap({
      sessionId: this.sessionId,
      duration
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.roadmap = response;
          this.selectedRoadmapDuration = duration;
          this.loadingRoadmap = false;
        },
        error: (err) => {
          this.loadingRoadmap = false;
          this.setError('Failed to generate roadmap. Please try again.', true);
          console.error('Generate roadmap error:', err);
        }
      });
  }

  onRoadmapDurationChange(duration: RoadmapDuration): void {
    this.generateRoadmap(duration);
  }

  // ============ UTILITY METHODS ============

  restartFlow(): void {
    // Reset all state
    this.currentStep = 1;
    this.cvUploaded = false;
    this.cvFileId = null;
    this.experienceInput = {
      yearsOfExperience: 0,
      currentRole: '',
      seniority: 'Mid',
      industry: '',
      stack: ''
    };
    this.sessionId = null;
    this.currentQuestion = null;
    this.questionIndex = 0;
    this.assessment = null;
    this.roadmap = null;
    this.showObserverLog = false;
    this.personaContext.resetPersona();
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
      this.toastMessage = null;
    }
    this.clearError();
  }

  setError(message: string, canRetry: boolean): void {
    this.error = { message, canRetry };
  }

  clearError(): void {
    this.error = null;
  }

  get activeSessionUuid(): string | null {
    return this.sessionId || this.querySessionUuid;
  }

  onPersonaChanged(persona: Persona | null): void {
    if (persona) {
      this.showToast(`Viewing as ${persona.name}`);
    } else {
      this.showToast('Balanced view');
    }
  }

  toggleObserverLog(): void {
    this.showObserverLog = !this.showObserverLog;
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = null;
    }, 2400);
  }

  retryLastAction(): void {
    if (!this.error?.canRetry) {
      return;
    }

    this.clearError();

    // Retry based on current step
    if (this.currentStep === 1 && this.startingAssessment) {
      this.calculateRisk();
    } else if (this.currentStep === 2 && this.loadingQuestion) {
      this.loadNextQuestion();
    } else if (this.currentStep === 3 && this.loadingAssessment) {
      this.loadAssessment();
    } else if (this.currentStep === 4 && this.loadingRoadmap) {
      this.generateRoadmap(this.selectedRoadmapDuration);
    }
  }
}
