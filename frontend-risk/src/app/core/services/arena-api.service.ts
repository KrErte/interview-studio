import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client.service';

export interface JobXrayResponse {
  seniority: string;
  realRequirements: string[];
  hiddenRequirements: string[];
  salaryEstimate: string;
  redFlags: string[];
  greenFlags: string[];
  atsKeywords: string[];
  cultureSignals: string;
  fitTips: string[];
  usageCount: number;
  usageLimit: number;
}

export interface InterviewSimResponse {
  sessionId: number;
  question: string;
  feedback: string;
  questionNumber: number;
  totalQuestions: number;
  isComplete: boolean;
  finalFeedback?: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    verdict: string;
    improvementPlan: string;
  };
}

export interface SalaryCoachResponse {
  sessionId: number;
  message: string;
  marketAnalysis: string;
  negotiationStrategies: string[];
  recommendedCounter: string;
  talkingPoints: string[];
}

export interface CvOptimizerResponse {
  atsScore: number;
  missingKeywords: string[];
  sectionFeedback: { section: string; status: string; suggestion: string }[];
  impactImprovements: string[];
  linkedInTips: string[];
  overallSummary: string;
}

@Injectable({ providedIn: 'root' })
export class ArenaApiService {
  constructor(private api: ApiClient) {}

  // Job X-Ray
  analyzeJob(jobDescription: string, targetRole?: string): Observable<JobXrayResponse> {
    return this.api.post<JobXrayResponse>('/arena/job-xray/analyze', {
      jobDescription,
      targetRole
    });
  }

  // Interview Simulator
  startInterview(targetRole: string, interviewType?: string, experienceLevel?: string): Observable<InterviewSimResponse> {
    return this.api.post<InterviewSimResponse>('/arena/interview-sim/start', {
      targetRole,
      interviewType,
      experienceLevel
    });
  }

  respondInterview(sessionId: number, answer: string): Observable<InterviewSimResponse> {
    return this.api.post<InterviewSimResponse>('/arena/interview-sim/respond', {
      sessionId,
      answer
    });
  }

  endInterview(sessionId: number): Observable<InterviewSimResponse> {
    return this.api.post<InterviewSimResponse>(`/arena/interview-sim/end/${sessionId}`, {});
  }

  // Salary Coach
  startSalaryCoach(data: {
    targetRole: string;
    currentSalary?: string;
    offeredSalary?: string;
    location?: string;
    experienceYears?: string;
  }): Observable<SalaryCoachResponse> {
    return this.api.post<SalaryCoachResponse>('/arena/salary-coach/start', data);
  }

  messageSalaryCoach(sessionId: number, message: string): Observable<SalaryCoachResponse> {
    return this.api.post<SalaryCoachResponse>('/arena/salary-coach/message', {
      sessionId,
      message
    });
  }

  // CV Optimizer
  analyzeCv(file: File, targetRole?: string): Observable<CvOptimizerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) {
      formData.append('targetRole', targetRole);
    }
    return this.api.postFormData<CvOptimizerResponse>('/arena/cv-optimizer/analyze', formData);
  }
}
