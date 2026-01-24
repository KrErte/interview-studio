import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendResultsRequest {
  email: string;
  role: string;
  riskPercent: number;
  confidence: number;
  assessmentUrl: string;
}

export interface SendResultsResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailApiService {
  private readonly baseUrl = '/api/email';

  constructor(private http: HttpClient) {}

  sendAssessmentResults(request: SendResultsRequest): Observable<SendResultsResponse> {
    return this.http.post<SendResultsResponse>(`${this.baseUrl}/send-results`, request);
  }
}
