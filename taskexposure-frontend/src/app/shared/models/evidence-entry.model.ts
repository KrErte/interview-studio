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

/**
 * Impact level for an evidence entry
 */
export type EvidenceImpact = 'low' | 'medium' | 'high';

/**
 * Source of the evidence entry
 */
export type EvidenceSource = 'manual' | 'prompt' | 'ai';

/**
 * Decay status for evidence entries
 * Based on 90-day half-life decay algorithm
 */
export type EvidenceStatus = 'FRESH' | 'STALE' | 'OLD' | 'ARCHIVE';

/**
 * Evidence Entry - A record of a moment of adaptation
 */
export interface EvidenceEntry {
  /** Unique identifier (UUID) */
  id: string;
  /** ISO timestamp of when the entry was created */
  createdAt: string;
  /** ISO timestamp of when the entry was last updated */
  updatedAt?: string;
  /** ISO timestamp of when the entry was last anchored (reset decay) */
  lastAnchoredAt?: string;
  /** Short title describing the adaptation moment (5-120 chars) */
  title: string;
  /** Optional detailed notes (up to 1000 chars) */
  notes?: string;
  /** Optional tags (0-5 tags, each 2-24 chars) */
  tags?: string[];
  /** Impact level of this adaptation (default: medium) */
  impact: EvidenceImpact;
  /** Source of the entry (default: manual) */
  source: EvidenceSource;
  /** Week key derived from createdAt (e.g., "2025-W52") */
  weekKey: string;

  // Computed decay fields (from backend)
  /** Days since last anchor (or creation if never anchored) */
  ageDays?: number;
  /** Decay weight 0.2–1.0, based on 90-day half-life */
  weight?: number;
  /** Current decay status */
  status?: EvidenceStatus;
  /** Whether entry needs re-anchoring (weight < 0.5) */
  needsReanchor?: boolean;
}

/**
 * DTO for creating a new evidence entry
 */
export interface EvidenceEntryCreate {
  title: string;
  notes?: string;
  tags?: string[];
  impact?: EvidenceImpact;
  source?: EvidenceSource;
}

/**
 * DTO for updating an existing evidence entry
 */
export interface EvidenceEntryUpdate {
  title?: string;
  notes?: string;
  tags?: string[];
  impact?: EvidenceImpact;
}

/**
 * Filter options for querying evidence entries
 */
export interface EvidenceLogFilter {
  /** Search text (matches title, notes, tags) */
  searchText?: string;
  /** Filter by impact level */
  impact?: EvidenceImpact | 'all';
  /** Filter by time range */
  timeRange?: 'last7days' | 'last30days' | 'all';
  /** Filter by specific tags */
  tags?: string[];
  /** Filter by decay status */
  status?: EvidenceStatus | 'all';
}

/**
 * Insights data for evidence log
 */
export interface EvidenceInsights {
  /** Total entries in the last 30 days */
  totalLast30Days: number;
  /** Top 3 most used tags */
  topTags: Array<{ tag: string; count: number }>;
  /** Distribution by impact */
  impactDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Audit preview data - silent metrics for evidence health
 */
export interface EvidenceAuditPreview {
  /** Total number of entries */
  totalEntries: number;
  /** Number of entries needing re-anchor */
  needsAttentionCount: number;
  /** Average weight across all entries */
  averageWeight: number;
  /** Distribution by status */
  statusDistribution: {
    fresh: number;
    stale: number;
    old: number;
    archive: number;
  };
  /** Weighted sum of all entries */
  weightedTotal: number;
}

/**
 * Response wrapper for evidence list from backend
 */
export interface EvidenceListResponse {
  entries: EvidenceEntry[];
  total: number;
  audit?: EvidenceAuditPreview;
}
