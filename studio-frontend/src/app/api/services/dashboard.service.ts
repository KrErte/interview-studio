import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardJobAnalysis, DashboardResponse } from '../models/dashboard.model';

export interface RunJobMatchPayload {
  targetRole: string;
  jobDescription?: string | null;
}

export interface JobMatchDto {
  id?: string | null;
  role?: string | null;
  scorePercent?: number | null;
  createdAt?: string | null;
  summary?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/api/me/dashboard`);
  }

  runJobMatch(payload: RunJobMatchPayload): Observable<JobMatchDto[]> {
    return this.http.post<JobMatchDto[]>(`${this.baseUrl}/api/job-match/match`, payload);
  }

  getJobMatchSessions(): Observable<DashboardJobAnalysis[]> {
    return this.http.get<DashboardJobAnalysis[]>(`${this.baseUrl}/api/job-match/sessions`);
  }
}


