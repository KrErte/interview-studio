import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type MarketplaceVisibilityMode = 'OFF' | 'ANON' | 'PUBLIC';

export interface MarketplaceVisibilitySettings {
  mode: MarketplaceVisibilityMode;
  /**
   * Threshold for showing you in searches, e.g. minimum match/fit score (0-100).
   */
  visibilityThreshold: number;
}

@Injectable({
  providedIn: 'root'
})
export class CandidateMarketplaceService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/candidate/marketplace`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Load current marketplace visibility settings for a candidate.
   * BACKEND: GET /api/candidate/marketplace/settings?email=...
   */
  getSettings(email: string): Observable<MarketplaceVisibilitySettings> {
    const params = new HttpParams().set('email', email);
    return this.http.get<MarketplaceVisibilitySettings>(`${this.baseUrl}/settings`, { params });
  }

  /**
   * Update marketplace visibility settings for a candidate.
   * BACKEND: PUT /api/candidate/marketplace/settings
   * Body: { email, mode, visibilityThreshold }
   */
  updateSettings(
    email: string,
    settings: MarketplaceVisibilitySettings
  ): Observable<MarketplaceVisibilitySettings> {
    const body = {
      email,
      mode: settings.mode,
      visibilityThreshold: settings.visibilityThreshold
    };
    return this.http.put<MarketplaceVisibilitySettings>(`${this.baseUrl}/settings`, body);
  }
}


