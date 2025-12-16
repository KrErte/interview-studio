import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AdminAuditEventType =
  | 'ANSWER_RECORDED'
  | 'SUMMARY_UPDATED'
  | 'DECISION_MADE'
  | string;

export interface AdminInterviewAuditEvent {
  id: string;
  ts: string;
  type: AdminAuditEventType;
  label?: string;
  message?: string;
  payload?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdminAuditApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/admin/interviews`;

  constructor(private readonly http: HttpClient) {}

  getAuditEvents(sessionUuid: string): Observable<AdminInterviewAuditEvent[]> {
    const url = `${this.baseUrl}/${encodeURIComponent(sessionUuid)}/audit`;
    return this.http.get<AdminInterviewAuditEvent[]>(url);
  }
}


