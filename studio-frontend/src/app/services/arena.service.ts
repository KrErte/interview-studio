import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ── Job X-Ray ──
export interface JobXrayRequest {
  jobDescription: string;
  targetRole?: string;
}

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

// ── Interview Simulator ──
export interface InterviewSimStartRequest {
  targetRole: string;
  interviewType: string;
  experienceLevel: string;
}

export interface InterviewSimRespondRequest {
  sessionId: number;
  answer: string;
}

export interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
  improvementPlan: string;
}

export interface InterviewSimResponse {
  sessionId: number;
  question: string;
  feedback: string;
  questionNumber: number;
  totalQuestions: number;
  isComplete: boolean;
  finalFeedback: InterviewFeedback | null;
}

// ── Salary Coach ──
export interface SalaryCoachStartRequest {
  targetRole: string;
  currentSalary?: string;
  offeredSalary?: string;
  location?: string;
  experienceYears?: string;
}

export interface SalaryCoachMessageRequest {
  sessionId: number;
  message: string;
}

export interface SalaryCoachResponse {
  sessionId: number;
  message: string;
  marketAnalysis: string;
  negotiationStrategies: string[];
  recommendedCounter: string;
  talkingPoints: string[];
}

// ── CV Optimizer ──
export interface SectionFeedback {
  section: string;
  status: string;
  suggestion: string;
}

export interface CvOptimizerResponse {
  atsScore: number;
  missingKeywords: string[];
  sectionFeedback: SectionFeedback[];
  impactImprovements: string[];
  linkedInTips: string[];
  overallSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArenaService {
  private readonly baseUrl = `${environment.apiUrl}/api/arena`;

  constructor(private http: HttpClient) {}

  // ── Job X-Ray ──
  analyzeJob(jobDescription: string, targetRole?: string): Observable<JobXrayResponse> {
    return this.http.post<JobXrayResponse>(`${this.baseUrl}/job-xray/analyze`, {
      jobDescription,
      targetRole
    });
  }

  // ── Interview Simulator ──
  startInterview(targetRole: string, interviewType: string, experienceLevel: string): Observable<InterviewSimResponse> {
    return this.http.post<InterviewSimResponse>(`${this.baseUrl}/interview-sim/start`, {
      targetRole,
      interviewType,
      experienceLevel
    });
  }

  respondInterview(sessionId: number, answer: string): Observable<InterviewSimResponse> {
    return this.http.post<InterviewSimResponse>(`${this.baseUrl}/interview-sim/respond`, {
      sessionId,
      answer
    });
  }

  endInterview(sessionId: number): Observable<InterviewSimResponse> {
    return this.http.post<InterviewSimResponse>(`${this.baseUrl}/interview-sim/end/${sessionId}`, {});
  }

  // ── Salary Coach ──
  startSalaryCoach(request: SalaryCoachStartRequest): Observable<SalaryCoachResponse> {
    return this.http.post<SalaryCoachResponse>(`${this.baseUrl}/salary-coach/start`, request);
  }

  messageSalaryCoach(sessionId: number, message: string): Observable<SalaryCoachResponse> {
    return this.http.post<SalaryCoachResponse>(`${this.baseUrl}/salary-coach/message`, {
      sessionId,
      message
    });
  }

  // ── CV Optimizer ──
  analyzeCv(file: File, targetRole?: string): Observable<CvOptimizerResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) {
      formData.append('targetRole', targetRole);
    }
    return this.http.post<CvOptimizerResponse>(`${this.baseUrl}/cv-optimizer/analyze`, formData);
  }
}
