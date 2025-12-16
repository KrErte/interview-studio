import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../core/api/api-client.service';
import {
  CvUploadResponse,
  RiskAssessmentResult,
  RiskQuestion
} from './risk.model';

export interface RiskAssessmentPayload {
  cvId?: string;
  useLatestCv?: boolean;
  experience?: {
    years?: number | null;
    role?: string;
    industry?: string;
    country?: string;
  };
  answers?: Record<string, string | string[] | number | boolean>;
}

@Injectable({ providedIn: 'root' })
export class RiskApiService {
  constructor(private api: ApiClient) {}

  uploadCv(file: File): Observable<CvUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<CvUploadResponse>('/candidate/cv/upload', formData);
  }

  fetchQuestions(currentAnswers: Record<string, any>): Observable<RiskQuestion[]> {
    return this.api.post<RiskQuestion[]>('/risk/questions', { answers: currentAnswers });
  }

  assess(payload: RiskAssessmentPayload): Observable<RiskAssessmentResult> {
    return this.api.post<RiskAssessmentResult>('/risk/assess', payload);
  }
}

