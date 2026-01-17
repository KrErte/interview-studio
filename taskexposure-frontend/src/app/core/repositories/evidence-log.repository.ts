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

import { Observable } from 'rxjs';
import {
  EvidenceEntry,
  EvidenceEntryCreate,
  EvidenceEntryUpdate,
  EvidenceStatus,
  EvidenceAuditPreview,
} from '../../shared/models/evidence-entry.model';

/**
 * Abstract repository interface for Evidence Log operations
 */
export abstract class EvidenceLogRepository {
  /**
   * Get all evidence entries
   * @param status - Optional status filter
   */
  abstract getAll(status?: EvidenceStatus): Observable<EvidenceEntry[]>;

  /**
   * Get a single evidence entry by ID
   */
  abstract getById(id: string): Observable<EvidenceEntry | null>;

  /**
   * Create a new evidence entry
   */
  abstract create(entry: EvidenceEntryCreate): Observable<EvidenceEntry>;

  /**
   * Update an existing evidence entry
   */
  abstract update(id: string, entry: EvidenceEntryUpdate): Observable<EvidenceEntry>;

  /**
   * Delete an evidence entry
   */
  abstract delete(id: string): Observable<void>;

  /**
   * Re-anchor an evidence entry (reset decay timer)
   */
  abstract anchor(id: string): Observable<EvidenceEntry>;

  /**
   * Get audit preview (silent metrics for evidence health)
   */
  abstract getAuditPreview(): Observable<EvidenceAuditPreview>;
}
