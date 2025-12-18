import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RiskCalculateRequest,
  RiskCalculateResponse,
  RiskFlowAnswerRequest,
  RiskFlowAnswerResponse,
  RiskRoadmapRequest,
  RiskRoadmapResponse,
} from './risk.models';

@Injectable({
  providedIn: 'root',
})
export class RiskApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  calculate(payload: RiskCalculateRequest): Observable<RiskCalculateResponse> {
    return this.http.post<RiskCalculateResponse>(
      `${this.baseUrl}/api/risk/flow/calculate`,
      payload
    );
  }

  answer(payload: RiskFlowAnswerRequest): Observable<RiskFlowAnswerResponse> {
    return this.http.post<RiskFlowAnswerResponse>(
      `${this.baseUrl}/api/risk/flow/answer`,
      payload
    );
  }

  roadmap(payload: RiskRoadmapRequest): Observable<RiskRoadmapResponse> {
    return this.http.post<RiskRoadmapResponse>(
      `${this.baseUrl}/api/risk/flow/roadmap`,
      payload
    );
  }
}
