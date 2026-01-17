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

import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EvidenceLogRepository } from './evidence-log.repository';
import {
  EvidenceEntry,
  EvidenceEntryCreate,
  EvidenceEntryUpdate,
  EvidenceStatus,
  EvidenceAuditPreview,
} from '../../shared/models/evidence-entry.model';
import { generateUUID, getWeekKey } from '../../shared/utils/date.utils';

const STORAGE_KEY = 'taskexposure.evidenceLog.v1';
const DECAY_HALF_LIFE_DAYS = 90;
const MIN_WEIGHT = 0.2;
const MAX_WEIGHT = 1.0;

/**
 * Local storage implementation of Evidence Log repository
 * Includes local decay computation using 90-day half-life algorithm
 */
@Injectable({
  providedIn: 'root',
})
export class LocalEvidenceLogRepository extends EvidenceLogRepository {

  private getStoredEntries(): EvidenceEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as EvidenceEntry[];
    } catch {
      console.error('Failed to parse evidence log data from localStorage');
      return [];
    }
  }

  private saveEntries(entries: EvidenceEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  /**
   * Compute decay fields for an entry
   */
  private computeDecay(entry: EvidenceEntry): EvidenceEntry {
    const anchorDate = entry.lastAnchoredAt || entry.createdAt;
    const ageDays = Math.floor(
      (Date.now() - new Date(anchorDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // weight = exp(-ln(2) * age_days / half_life)
    const rawWeight = Math.exp(-Math.LN2 * ageDays / DECAY_HALF_LIFE_DAYS);
    const weight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, rawWeight));

    // Determine status based on weight
    let status: EvidenceStatus;
    if (weight >= 0.8) {
      status = 'FRESH';
    } else if (weight >= 0.5) {
      status = 'STALE';
    } else if (weight >= 0.3) {
      status = 'OLD';
    } else {
      status = 'ARCHIVE';
    }

    const needsReanchor = weight < 0.5;

    return {
      ...entry,
      ageDays,
      weight: Math.round(weight * 100) / 100,
      status,
      needsReanchor,
    };
  }

  getAll(status?: EvidenceStatus): Observable<EvidenceEntry[]> {
    let entries = this.getStoredEntries();

    // Sort by createdAt descending (most recent first)
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Compute decay for all entries
    entries = entries.map((e) => this.computeDecay(e));

    // Filter by status if provided
    if (status) {
      entries = entries.filter((e) => e.status === status);
    }

    return of(entries);
  }

  getById(id: string): Observable<EvidenceEntry | null> {
    const entries = this.getStoredEntries();
    const entry = entries.find((e) => e.id === id) || null;
    return of(entry ? this.computeDecay(entry) : null);
  }

  create(data: EvidenceEntryCreate): Observable<EvidenceEntry> {
    const now = new Date().toISOString();
    const entry: EvidenceEntry = {
      id: generateUUID(),
      createdAt: now,
      lastAnchoredAt: now,
      title: data.title.trim(),
      notes: data.notes?.trim() || undefined,
      tags: data.tags?.map((t) => t.toLowerCase().trim()).filter((t) => t.length >= 2) || undefined,
      impact: data.impact || 'medium',
      source: data.source || 'manual',
      weekKey: getWeekKey(now),
    };

    const entries = this.getStoredEntries();
    entries.unshift(entry);
    this.saveEntries(entries);

    return of(this.computeDecay(entry));
  }

  update(id: string, data: EvidenceEntryUpdate): Observable<EvidenceEntry> {
    const entries = this.getStoredEntries();
    const index = entries.findIndex((e) => e.id === id);

    if (index === -1) {
      return throwError(() => new Error('Entry not found'));
    }

    const existing = entries[index];
    const updated: EvidenceEntry = {
      ...existing,
      updatedAt: new Date().toISOString(),
      title: data.title !== undefined ? data.title.trim() : existing.title,
      notes: data.notes !== undefined ? data.notes?.trim() || undefined : existing.notes,
      tags:
        data.tags !== undefined
          ? data.tags?.map((t) => t.toLowerCase().trim()).filter((t) => t.length >= 2) || undefined
          : existing.tags,
      impact: data.impact !== undefined ? data.impact : existing.impact,
    };

    entries[index] = updated;
    this.saveEntries(entries);

    return of(this.computeDecay(updated));
  }

  delete(id: string): Observable<void> {
    const entries = this.getStoredEntries();
    const filtered = entries.filter((e) => e.id !== id);

    if (filtered.length === entries.length) {
      return throwError(() => new Error('Entry not found'));
    }

    this.saveEntries(filtered);
    return of(void 0);
  }

  anchor(id: string): Observable<EvidenceEntry> {
    const entries = this.getStoredEntries();
    const index = entries.findIndex((e) => e.id === id);

    if (index === -1) {
      return throwError(() => new Error('Entry not found'));
    }

    const now = new Date().toISOString();
    const updated: EvidenceEntry = {
      ...entries[index],
      lastAnchoredAt: now,
      updatedAt: now,
    };

    entries[index] = updated;
    this.saveEntries(entries);

    return of(this.computeDecay(updated));
  }

  getAuditPreview(): Observable<EvidenceAuditPreview> {
    const entries = this.getStoredEntries().map((e) => this.computeDecay(e));

    const totalEntries = entries.length;
    const needsAttentionCount = entries.filter((e) => e.needsReanchor).length;

    const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
    const averageWeight = totalEntries > 0 ? Math.round((totalWeight / totalEntries) * 100) / 100 : 0;

    const statusDistribution = {
      fresh: entries.filter((e) => e.status === 'FRESH').length,
      stale: entries.filter((e) => e.status === 'STALE').length,
      old: entries.filter((e) => e.status === 'OLD').length,
      archive: entries.filter((e) => e.status === 'ARCHIVE').length,
    };

    return of({
      totalEntries,
      needsAttentionCount,
      averageWeight,
      statusDistribution,
      weightedTotal: Math.round(totalWeight * 100) / 100,
    });
  }
}
