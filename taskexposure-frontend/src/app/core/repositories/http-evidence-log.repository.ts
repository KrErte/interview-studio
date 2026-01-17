/*
 * Copyright 2025 TASKEXPOSURE
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EvidenceLogRepository } from './evidence-log.repository';
import {
  EvidenceEntry,
  EvidenceEntryCreate,
  EvidenceEntryUpdate,
  EvidenceStatus,
  EvidenceAuditPreview,
  EvidenceListResponse,
} from '../../shared/models/evidence-entry.model';
import { environment } from '../../../environments/environment';

/**
 * HTTP implementation of Evidence Log repository
 * Integrates with backend Evidence API with decay mechanics
 */
@Injectable({
  providedIn: 'root',
})
export class HttpEvidenceLogRepository extends EvidenceLogRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/evidence`;

  getAll(status?: EvidenceStatus): Observable<EvidenceEntry[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<EvidenceListResponse | EvidenceEntry[]>(this.baseUrl, { params }).pipe(
      map((response) => {
        // Handle both wrapped response and direct array
        if (Array.isArray(response)) {
          return response;
        }
        return response.entries || [];
      })
    );
  }

  getById(id: string): Observable<EvidenceEntry | null> {
    return this.http.get<EvidenceEntry>(`${this.baseUrl}/${id}`).pipe(
      map((entry) => entry || null)
    );
  }

  create(data: EvidenceEntryCreate): Observable<EvidenceEntry> {
    return this.http.post<EvidenceEntry>(this.baseUrl, data);
  }

  update(id: string, data: EvidenceEntryUpdate): Observable<EvidenceEntry> {
    return this.http.put<EvidenceEntry>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  anchor(id: string): Observable<EvidenceEntry> {
    return this.http.post<EvidenceEntry>(`${this.baseUrl}/${id}/anchor`, {});
  }

  getAuditPreview(): Observable<EvidenceAuditPreview> {
    return this.http.get<EvidenceAuditPreview>(`${this.baseUrl}/audit/preview`);
  }
}
