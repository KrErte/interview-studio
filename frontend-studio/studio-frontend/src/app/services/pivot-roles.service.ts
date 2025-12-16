import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RoleMatch {
  id: string;
  targetRole: string;
  archetype?: string;
  matchPercent: number;
  overlapSkills: string[];
  gapSkills: string[];
  location?: string;
  seniority?: string;
}

export interface FutureProofScore {
  overall: number; // 0-100
  automationRisk: number; // lower is better
  adaptability: number;
  learningVelocity: number;
  explanation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PivotRolesService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/candidate/pivot-roles`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetches role matches for a candidate based on their latest profile / CV.
   * BACKEND: GET /api/candidate/pivot-roles/matches?email=...
   */
  getRoleMatches(email: string): Observable<RoleMatch[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<RoleMatch[]>(`${this.baseUrl}/matches`, { params });
  }

  /**
   * Fetches an aggregate future-proof score for the candidate.
   * BACKEND: GET /api/candidate/pivot-roles/future-proof-score?email=...
   */
  getFutureProofScore(email: string): Observable<FutureProofScore> {
    const params = new HttpParams().set('email', email);
    return this.http.get<FutureProofScore>(`${this.baseUrl}/future-proof-score`, { params });
  }
}


