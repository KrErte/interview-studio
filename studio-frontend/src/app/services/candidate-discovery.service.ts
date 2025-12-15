import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarketplaceVisibilityMode } from './candidate-marketplace.service';

export interface CandidateDiscoveryFilters {
  query?: string;
  minScore?: number | null;
  visibilityModes?: MarketplaceVisibilityMode[];
}

export interface CandidateSummary {
  id: string;
  name: string;
  headline: string;
  location?: string;
  currentRole?: string;
  seniority?: string;
  overlapPercent: number;
  futureProofScore?: number;
  topTransferableSkills: string[];
  humanEdgeBullets: string[];
  visibilityMode: MarketplaceVisibilityMode;
  lastActiveAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateDiscoveryService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/interviewer/candidates`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Query candidates for interviewer discovery.
   * BACKEND: GET /api/interviewer/candidates?q=&minScore=&visibility=
   * Where visibility is a comma-separated list of modes (OFF,ANON,PUBLIC).
   */
  searchCandidates(filters: CandidateDiscoveryFilters): Observable<CandidateSummary[]> {
    let params = new HttpParams();

    if (filters.query && filters.query.trim()) {
      params = params.set('q', filters.query.trim());
    }
    if (filters.minScore != null) {
      params = params.set('minScore', String(filters.minScore));
    }
    if (filters.visibilityModes && filters.visibilityModes.length) {
      params = params.set('visibility', filters.visibilityModes.join(','));
    }

    return this.http.get<CandidateSummary[]>(this.baseUrl, { params });
  }
}


