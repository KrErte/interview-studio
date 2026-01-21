import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AIAnalysisRequest {
  type: 'career_assessment' | 'skill_gap' | 'interview_feedback' | 'salary_analysis' | 'team_risk';
  context: Record<string, any>;
  userId?: string;
  companyId?: string;
}

export interface AIAnalysisResponse {
  analysis: string;
  insights: string[];
  recommendations: string[];
  riskScore?: number;
  confidenceLevel: number;
  dataPoints: Record<string, any>;
}

export interface TeamAnalyticsRequest {
  companyId: string;
  employeeProfiles: EmployeeProfile[];
  industryContext: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  skills: string[];
  yearsExperience: number;
  lastAssessmentDate?: string;
  riskScore?: number;
}

export interface TeamAnalyticsResponse {
  overallRiskScore: number;
  skillGaps: SkillGap[];
  atRiskEmployees: AtRiskEmployee[];
  upskillRecommendations: UpskillRecommendation[];
  industryBenchmark: IndustryBenchmark;
  projectedSavings: number;
}

export interface SkillGap {
  skill: string;
  currentCoverage: number;
  marketDemand: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  affectedRoles: string[];
}

export interface AtRiskEmployee {
  employeeId: string;
  name: string;
  role: string;
  riskScore: number;
  riskFactors: string[];
  recommendedActions: string[];
}

export interface UpskillRecommendation {
  skill: string;
  targetEmployees: string[];
  estimatedCost: number;
  estimatedROI: number;
  timeToComplete: string;
  priority: number;
}

export interface IndustryBenchmark {
  industryAvgRiskScore: number;
  topSkillsInDemand: string[];
  avgSalaryGrowth: number;
  automationThreatLevel: number;
}

@Injectable({ providedIn: 'root' })
export class AIService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl || '/api';

  /**
   * Analyze career trajectory using AI
   */
  analyzeCareer(request: AIAnalysisRequest): Observable<AIAnalysisResponse> {
    // In production, this calls the real AI backend
    // For now, simulate intelligent response
    return this.http.post<AIAnalysisResponse>(`${this.apiUrl}/ai/analyze`, request).pipe(
      map(response => this.enrichResponse(response, request))
    );
  }

  /**
   * Get team-wide analytics for B2B customers
   */
  getTeamAnalytics(request: TeamAnalyticsRequest): Observable<TeamAnalyticsResponse> {
    return this.http.post<TeamAnalyticsResponse>(`${this.apiUrl}/b2b/team-analytics`, request);
  }

  /**
   * Real-time interview coaching feedback
   */
  getInterviewFeedback(answer: string, question: string, role: string): Observable<{
    score: number;
    feedback: string;
    improvements: string[];
    interviewerThought: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/ai/interview-feedback`, {
      answer,
      question,
      role,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Salary negotiation intelligence
   */
  getSalaryIntelligence(role: string, location: string, experience: number, skills: string[]): Observable<{
    marketRange: { min: number; mid: number; max: number };
    negotiationLeverage: string[];
    companyBudgetEstimate: number;
    bestTimeToNegotiate: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/ai/salary-intel`, {
      role,
      location,
      experience,
      skills
    });
  }

  /**
   * Bulk employee assessment for enterprises
   */
  bulkAssessEmployees(companyId: string, employees: EmployeeProfile[]): Observable<{
    assessments: Map<string, AIAnalysisResponse>;
    aggregateRisk: number;
    priorityActions: string[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/b2b/bulk-assess`, {
      companyId,
      employees,
      assessmentType: 'comprehensive'
    });
  }

  private enrichResponse(response: AIAnalysisResponse, request: AIAnalysisRequest): AIAnalysisResponse {
    // Add metadata and tracking
    return {
      ...response,
      dataPoints: {
        ...response.dataPoints,
        analysisTimestamp: new Date().toISOString(),
        requestType: request.type
      }
    };
  }
}
