import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface SimpleSessionRequest {
  targetRole: string;
  experienceLevel: string;
  mainChallenge: string;
}

export interface AdvancedSessionRequest {
  targetRole: string;
  lastWorkedInRole: string;
  urgency: string;
  recentWorkExamples: string;
  mainBlocker: string;
  cvText?: string;
}

export interface PlanAction {
  day: number;
  action: string;
  outcome: string;
}

export interface SessionResponse {
  id: number;
  shareId: string | null;
  mode: 'SIMPLE' | 'ADVANCED';
  targetRole: string;
  status: 'RED' | 'YELLOW' | 'GREEN' | null;
  blockers: string[];
  teaserAction: string | null;
  paid: boolean;
  plan: PlanAction[] | null;
  cvRewriteBullets: string[] | null;
  rolesToAvoid: string[] | null;
  pivotSuggestion: string | null;
  createdAt: string;
}

export interface SessionSummary {
  id: number;
  shareId: string | null;
  targetRole: string;
  status: 'RED' | 'YELLOW' | 'GREEN' | null;
  paid: boolean;
  createdAt: string;
}

export interface PaymentRequest {
  sessionId: number;
  paymentIntentId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudioApiService {
  private readonly apiUrl = `${environment.apiUrl}/studio/v2`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Create a simple session (guest mode, no auth).
   */
  createSimpleSession(request: SimpleSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.apiUrl}/sessions/simple`, request);
  }

  /**
   * Create an advanced session (requires auth).
   */
  createAdvancedSession(request: AdvancedSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(
      `${this.apiUrl}/sessions/advanced`,
      request,
      { headers: this.authHeaders() }
    );
  }

  /**
   * Get a session by ID.
   */
  getSession(id: number): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.apiUrl}/sessions/${id}`);
  }

  /**
   * Get full (paid) session content.
   */
  getFullSession(id: number): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.apiUrl}/sessions/${id}/full`);
  }

  /**
   * Get a session by share ID (public).
   */
  getSharedSession(shareId: string): Observable<SessionResponse> {
    return this.http.get<SessionResponse>(`${this.apiUrl}/share/${shareId}`);
  }

  /**
   * Get session history for current user (requires auth).
   */
  getSessionHistory(): Observable<SessionSummary[]> {
    return this.http.get<SessionSummary[]>(
      `${this.apiUrl}/sessions/history`,
      { headers: this.authHeaders() }
    );
  }

  /**
   * Mark a session as paid (stubbed payment).
   */
  payForSession(sessionId: number): Observable<SessionResponse> {
    const request: PaymentRequest = { sessionId };
    return this.http.post<SessionResponse>(`${this.apiUrl}/sessions/pay`, request);
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }
}
