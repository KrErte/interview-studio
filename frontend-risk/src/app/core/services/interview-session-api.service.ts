import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  InterviewProgressResponse,
  InterviewProfileDto,
  InterviewSessionCreateRequest,
  InterviewSessionCreateResponse
} from '../models/interview-session.model';

@Injectable({ providedIn: 'root' })
export class InterviewSessionApiService {
  private readonly sessionBaseUrl = `/api/interview-sessions`;
  private readonly progressBaseUrl = `/api/interviews`;

  constructor(private http: HttpClient) {}

  createSession(request: InterviewSessionCreateRequest): Observable<InterviewSessionCreateResponse> {
    return this.http.post<InterviewSessionCreateResponse>(this.sessionBaseUrl, request);
  }

  uploadCv(file: File): Observable<InterviewProfileDto> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/api/interview-profile`;
    return this.http.post<InterviewProfileDto>(url, formData);
  }

  nextQuestion(sessionUuid: string, answer: string): Observable<InterviewProgressResponse> {
    const url = `${this.progressBaseUrl}/${encodeURIComponent(sessionUuid)}/next-question`;

    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('{') || lowerUrl.includes('%7b')) {
      // eslint-disable-next-line no-console
      console.error('InterviewSessionApiService.nextQuestion: refusing to call malformed URL', url);
      return throwError(
        () => new Error('Dev guard: malformed interview next-question URL, request was not sent.')
      );
    }

    return this.http.post<InterviewProgressResponse>(url, { answer });
  }
}





