import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api/api-client.service';

export interface CreateSessionRequest {
  mode: 'SIMPLE' | 'ADVANCED';
  targetRole: string;
  experienceLevel?: string;
  mainChallenge?: string;
  lastWorkedInRole?: string;
  urgency?: string;
  recentWorkExamples?: string;
  mainBlocker?: string;
  cvText?: string;
}

export interface PlanItem {
  week: number;
  title: string;
  description: string;
}

export interface SessionResponse {
  id: number;
  shareId: string;
  mode: string;
  targetRole: string;
  status: 'RED' | 'YELLOW' | 'GREEN';
  blockers: string[];
  teaserAction: string;
  paid: boolean;
  plan: PlanItem[] | null;
  cvRewriteBullets: string[] | null;
  rolesToAvoid: string[] | null;
  pivotSuggestion: string | null;
  createdAt: string;
}

export interface SessionSummary {
  id: number;
  shareId: string;
  mode: string;
  targetRole: string;
  status: 'RED' | 'YELLOW' | 'GREEN';
  paid: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class SessionApiService {
  constructor(private api: ApiClient) {}

  createSession(request: CreateSessionRequest): Observable<SessionResponse> {
    return this.api.post<SessionResponse>('/sessions', request);
  }

  getSession(id: number): Observable<SessionResponse> {
    return this.api.get<SessionResponse>(`/sessions/${id}`);
  }

  getHistory(): Observable<SessionSummary[]> {
    return this.api.get<SessionSummary[]>('/sessions/history');
  }

  getSharedSession(shareId: string): Observable<SessionResponse> {
    return this.api.get<SessionResponse>(`/sessions/share/${shareId}`);
  }
}
