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
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { EvidenceLogRepository } from '../repositories/evidence-log.repository';
import { LocalEvidenceLogRepository } from '../repositories/local-evidence-log.repository';
import { HttpEvidenceLogRepository } from '../repositories/http-evidence-log.repository';
import {
  EvidenceEntry,
  EvidenceEntryCreate,
  EvidenceEntryUpdate,
  EvidenceLogFilter,
  EvidenceInsights,
  EvidenceStatus,
  EvidenceAuditPreview,
} from '../../shared/models/evidence-entry.model';
import { environment } from '../../../environments/environment';
import { isWithinLastDays } from '../../shared/utils/date.utils';

/**
 * Factory function to provide the correct repository based on environment config
 */
function evidenceLogRepositoryFactory(): EvidenceLogRepository {
  if (environment.evidenceLog?.mode === 'http') {
    return inject(HttpEvidenceLogRepository);
  }
  return inject(LocalEvidenceLogRepository);
}

/**
 * Evidence Log Service
 * Manages evidence entries and provides filtering, insights, and decay mechanics
 */
@Injectable({
  providedIn: 'root',
})
export class EvidenceLogService {
  private readonly repository: EvidenceLogRepository;

  private entriesSubject = new BehaviorSubject<EvidenceEntry[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private auditPreviewSubject = new BehaviorSubject<EvidenceAuditPreview | null>(null);

  /** Observable of all entries */
  readonly entries$ = this.entriesSubject.asObservable();
  /** Observable of loading state */
  readonly loading$ = this.loadingSubject.asObservable();
  /** Observable of audit preview */
  readonly auditPreview$ = this.auditPreviewSubject.asObservable();

  constructor() {
    // Use factory to select repository based on environment
    this.repository = evidenceLogRepositoryFactory();
  }

  /**
   * Load all entries from the repository
   * @param status - Optional status filter
   */
  loadEntries(status?: EvidenceStatus): Observable<EvidenceEntry[]> {
    this.loadingSubject.next(true);
    return this.repository.getAll(status).pipe(
      tap((entries) => {
        this.entriesSubject.next(entries);
        this.loadingSubject.next(false);
      })
    );
  }

  /**
   * Get filtered entries based on the provided filter
   */
  getFilteredEntries(filter: EvidenceLogFilter): Observable<EvidenceEntry[]> {
    return this.entries$.pipe(
      map((entries) => this.applyFilter(entries, filter))
    );
  }

  /**
   * Create a new evidence entry
   */
  create(data: EvidenceEntryCreate): Observable<EvidenceEntry> {
    return this.repository.create(data).pipe(
      tap((entry) => {
        const current = this.entriesSubject.value;
        this.entriesSubject.next([entry, ...current]);
        this.refreshAuditPreview();
      })
    );
  }

  /**
   * Update an existing evidence entry
   */
  update(id: string, data: EvidenceEntryUpdate): Observable<EvidenceEntry> {
    return this.repository.update(id, data).pipe(
      tap((updated) => {
        const current = this.entriesSubject.value;
        const index = current.findIndex((e) => e.id === id);
        if (index !== -1) {
          const newEntries = [...current];
          newEntries[index] = updated;
          this.entriesSubject.next(newEntries);
        }
      })
    );
  }

  /**
   * Delete an evidence entry
   */
  delete(id: string): Observable<void> {
    return this.repository.delete(id).pipe(
      tap(() => {
        const current = this.entriesSubject.value;
        this.entriesSubject.next(current.filter((e) => e.id !== id));
        this.refreshAuditPreview();
      })
    );
  }

  /**
   * Re-anchor an evidence entry (reset decay timer)
   */
  anchor(id: string): Observable<EvidenceEntry> {
    return this.repository.anchor(id).pipe(
      tap((updated) => {
        const current = this.entriesSubject.value;
        const index = current.findIndex((e) => e.id === id);
        if (index !== -1) {
          const newEntries = [...current];
          newEntries[index] = updated;
          this.entriesSubject.next(newEntries);
        }
        this.refreshAuditPreview();
      })
    );
  }

  /**
   * Get audit preview (silent metrics for evidence health)
   */
  getAuditPreview(): Observable<EvidenceAuditPreview> {
    return this.repository.getAuditPreview().pipe(
      tap((preview) => this.auditPreviewSubject.next(preview))
    );
  }

  /**
   * Refresh audit preview in background
   */
  private refreshAuditPreview(): void {
    this.repository.getAuditPreview().subscribe({
      next: (preview) => this.auditPreviewSubject.next(preview),
      error: () => {} // Silent fail for background refresh
    });
  }

  /**
   * Get all unique tags from entries
   */
  getAllTags(): Observable<string[]> {
    return this.entries$.pipe(
      map((entries) => {
        const tagSet = new Set<string>();
        entries.forEach((e) => e.tags?.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
      })
    );
  }

  /**
   * Calculate insights from the current entries
   */
  getInsights(): Observable<EvidenceInsights> {
    return this.entries$.pipe(
      map((entries) => this.calculateInsights(entries))
    );
  }

  /**
   * Get count of entries needing re-anchor
   */
  getNeedsAttentionCount(): Observable<number> {
    return this.entries$.pipe(
      map((entries) => entries.filter((e) => e.needsReanchor).length)
    );
  }

  private applyFilter(entries: EvidenceEntry[], filter: EvidenceLogFilter): EvidenceEntry[] {
    let result = [...entries];

    // Time range filter
    if (filter.timeRange && filter.timeRange !== 'all') {
      const days = filter.timeRange === 'last7days' ? 7 : 30;
      result = result.filter((e) => isWithinLastDays(e.createdAt, days));
    }

    // Impact filter
    if (filter.impact && filter.impact !== 'all') {
      result = result.filter((e) => e.impact === filter.impact);
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      result = result.filter((e) => e.status === filter.status);
    }

    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((e) =>
        filter.tags!.some((tag) => e.tags?.includes(tag.toLowerCase()))
      );
    }

    // Search text filter (matches title, notes, or tags)
    if (filter.searchText && filter.searchText.trim()) {
      const search = filter.searchText.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.notes?.toLowerCase().includes(search) ||
          e.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    return result;
  }

  private calculateInsights(entries: EvidenceEntry[]): EvidenceInsights {
    const last30Days = entries.filter((e) => isWithinLastDays(e.createdAt, 30));

    // Count tags
    const tagCounts = new Map<string, number>();
    last30Days.forEach((e) => {
      e.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Get top 3 tags
    const topTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag, count]) => ({ tag, count }));

    // Impact distribution
    const impactDistribution = {
      low: last30Days.filter((e) => e.impact === 'low').length,
      medium: last30Days.filter((e) => e.impact === 'medium').length,
      high: last30Days.filter((e) => e.impact === 'high').length,
    };

    return {
      totalLast30Days: last30Days.length,
      topTags,
      impactDistribution,
    };
  }
}
