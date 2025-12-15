import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {
  InterviewProgressResponse,
  InterviewProfileDto,
  InterviewSessionCreateRequest,
  InterviewSessionCreateResponse
} from '../models/interview-session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InterviewSessionApiService {
  private readonly sessionBaseUrl = `${environment.apiBaseUrl}/api/interview-sessions`;
  private readonly progressBaseUrl = `${environment.apiBaseUrl}/api/interviews`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new interview session.
   * Backend: POST /api/interview-sessions
   */
  createSession(request: InterviewSessionCreateRequest): Observable<InterviewSessionCreateResponse> {
    return this.http.post<InterviewSessionCreateResponse>(this.sessionBaseUrl, request);
  }

  /**
   * Upload a CV file and obtain an interview profile derived from it.
   * Backend: POST /api/interview-profile
   *
   * The request is sent as multipart/form-data with a single "file" field.
   */
  uploadCv(file: File): Observable<InterviewProfileDto> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${environment.apiBaseUrl}/api/interview-profile`;
    return this.http.post<InterviewProfileDto>(url, formData);
  }

  /**
   * Submit an answer and get the next question.
   * Backend: POST /api/interviews/{sessionUuid}/next-question
   *
   * The request body must be JSON:
   *   { "answer": "<string>" }
   *
   * The caller is responsible for ensuring that `sessionUuid` is a valid UUID string.
   */
  nextQuestion(sessionUuid: string, answer: string): Observable<InterviewProgressResponse> {
    const url = `${this.progressBaseUrl}/${encodeURIComponent(sessionUuid)}/next-question`;

    // Dev-only guard: if URL still contains template braces, do not send a broken request.
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
