import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PracticeQuestion {
  id: string;
  text: string;
  blocker: string;
  tip: string;
}

export interface PracticeSessionResponse {
  sessionId: string;
  questions: PracticeQuestion[];
}

export interface PracticeAnswerResponse {
  score: number;
  feedback: string;
  suggestion: string;
}

export const BLOCKER_LABELS: Record<string, string> = {
  gap_over_18_months: 'Lünk CV-s (18+ kuud)',
  career_switch: 'Karjäärivahetus',
  urgency_weak: 'Kiire vajadus + nõrgad signaalid',
  experience_outdated: 'Vananenud kogemus',
  cv_positioning: 'CV positsioneering'
};

@Injectable({ providedIn: 'root' })
export class PracticeApiService {
  private readonly base = `${environment.apiBaseUrl}/api/practice`;

  constructor(private http: HttpClient) {}

  createSession(blockers: string[], targetRole: string): Observable<PracticeSessionResponse> {
    return this.http.post<PracticeSessionResponse>(`${this.base}/session`, {
      blockers,
      targetRole
    });
  }

  submitAnswer(
    sessionId: string,
    questionId: string,
    questionText: string,
    answer: string,
    blocker: string,
    targetRole: string
  ): Observable<PracticeAnswerResponse> {
    return this.http.post<PracticeAnswerResponse>(`${this.base}/answer`, {
      sessionId,
      questionId,
      questionText,
      answer,
      blocker,
      targetRole
    });
  }
}
