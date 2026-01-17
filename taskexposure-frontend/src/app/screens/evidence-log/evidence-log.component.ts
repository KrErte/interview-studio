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

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvidenceLogService } from '../../core/services/evidence-log.service';
import { TranslationService } from '../../core/services/translation.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  EvidenceEntry,
  EvidenceEntryCreate,
  EvidenceEntryUpdate,
  EvidenceLogFilter,
  EvidenceImpact,
  EvidenceInsights,
  EvidenceStatus,
  EvidenceAuditPreview,
} from '../../shared/models/evidence-entry.model';
import { formatDateWithWeek } from '../../shared/utils/date.utils';

@Component({
  selector: 'app-evidence-log',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './evidence-log.component.html',
  styleUrl: './evidence-log.component.scss',
})
export class EvidenceLogComponent implements OnInit {
  private readonly evidenceLogService = inject(EvidenceLogService);
  private readonly translationService = inject(TranslationService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  // Quick add form
  quickAddForm: FormGroup;
  showQuickAddDetails = false;
  tagInput = '';

  // Edit modal
  showEditModal = false;
  editForm: FormGroup;
  editingEntry: EvidenceEntry | null = null;
  editTagInput = '';

  // Delete confirmation
  showDeleteConfirm = false;
  deletingEntry: EvidenceEntry | null = null;

  // Filters
  filter = signal<EvidenceLogFilter>({
    searchText: '',
    impact: 'all',
    timeRange: 'all',
    tags: [],
    status: 'all',
  });

  // State
  entries = signal<EvidenceEntry[]>([]);
  allTags = signal<string[]>([]);
  insights = signal<EvidenceInsights>({
    totalLast30Days: 0,
    topTags: [],
    impactDistribution: { low: 0, medium: 0, high: 0 },
  });
  auditPreview = signal<EvidenceAuditPreview | null>(null);
  loading = signal<boolean>(true);

  // Computed filtered entries
  filteredEntries = computed(() => {
    const f = this.filter();
    let result = [...this.entries()];

    // Time range filter
    if (f.timeRange && f.timeRange !== 'all') {
      const days = f.timeRange === 'last7days' ? 7 : 30;
      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);
      threshold.setHours(0, 0, 0, 0);
      result = result.filter((e) => new Date(e.createdAt) >= threshold);
    }

    // Impact filter
    if (f.impact && f.impact !== 'all') {
      result = result.filter((e) => e.impact === f.impact);
    }

    // Tags filter
    if (f.tags && f.tags.length > 0) {
      result = result.filter((e) =>
        f.tags!.some((tag) => e.tags?.includes(tag.toLowerCase()))
      );
    }

    // Status filter
    if (f.status && f.status !== 'all') {
      result = result.filter((e) => e.status === f.status);
    }

    // Search text filter
    if (f.searchText && f.searchText.trim()) {
      const search = f.searchText.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.notes?.toLowerCase().includes(search) ||
          e.tags?.some((t) => t.toLowerCase().includes(search))
      );
    }

    return result;
  });

  // Expanded notes tracking
  expandedNotes = new Set<string>();

  constructor() {
    this.quickAddForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      notes: ['', [Validators.maxLength(1000)]],
      tags: [[] as string[]],
      impact: ['medium' as EvidenceImpact],
    });

    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(120)]],
      notes: ['', [Validators.maxLength(1000)]],
      tags: [[] as string[]],
      impact: ['medium' as EvidenceImpact],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.evidenceLogService.loadEntries().subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.updateTags(entries);
        this.updateInsights(entries);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error(this.t('evidenceLog.errors.loadFailed'));
      },
    });

    // Load audit preview
    this.evidenceLogService.getAuditPreview().subscribe({
      next: (preview) => this.auditPreview.set(preview),
      error: () => {} // Silent fail for audit preview
    });
  }

  private updateTags(entries: EvidenceEntry[]): void {
    const tagSet = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((t) => tagSet.add(t)));
    this.allTags.set(Array.from(tagSet).sort());
  }

  private updateInsights(entries: EvidenceEntry[]): void {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const last30Days = entries.filter((e) => new Date(e.createdAt) >= thirtyDaysAgo);

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

    this.insights.set({
      totalLast30Days: last30Days.length,
      topTags,
      impactDistribution,
    });
  }

  // Translation helper
  t(key: string, params?: Record<string, string | number>): string {
    return this.translationService.t(key, params);
  }

  // Language toggle
  get currentLang(): string {
    return this.translationService.language();
  }

  toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'et' : 'en';
    this.translationService.setLanguage(newLang);
  }

  // Format date with week
  formatDate(dateStr: string): string {
    const locale = this.currentLang === 'et' ? 'et-EE' : 'en-US';
    return formatDateWithWeek(dateStr, locale);
  }

  // Quick Add
  toggleQuickAddDetails(): void {
    this.showQuickAddDetails = !this.showQuickAddDetails;
  }

  addTag(input: string, isEdit = false): void {
    const tag = input.trim().toLowerCase();
    if (tag.length < 2 || tag.length > 24) return;

    const form = isEdit ? this.editForm : this.quickAddForm;
    const currentTags = form.get('tags')?.value as string[] || [];

    if (currentTags.length >= 5) return;
    if (currentTags.includes(tag)) return;

    form.patchValue({ tags: [...currentTags, tag] });
    if (isEdit) {
      this.editTagInput = '';
    } else {
      this.tagInput = '';
    }
  }

  removeTag(tag: string, isEdit = false): void {
    const form = isEdit ? this.editForm : this.quickAddForm;
    const currentTags = form.get('tags')?.value as string[] || [];
    form.patchValue({ tags: currentTags.filter((t) => t !== tag) });
  }

  onTagKeydown(event: KeyboardEvent, isEdit = false): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const input = isEdit ? this.editTagInput : this.tagInput;
      this.addTag(input, isEdit);
    }
  }

  submitQuickAdd(): void {
    if (this.quickAddForm.invalid) return;

    const data: EvidenceEntryCreate = {
      title: this.quickAddForm.value.title,
      notes: this.quickAddForm.value.notes || undefined,
      tags: this.quickAddForm.value.tags.length > 0 ? this.quickAddForm.value.tags : undefined,
      impact: this.quickAddForm.value.impact,
      source: 'manual',
    };

    this.evidenceLogService.create(data).subscribe({
      next: (entry) => {
        const current = this.entries();
        this.entries.set([entry, ...current]);
        this.updateTags(this.entries());
        this.updateInsights(this.entries());
        this.quickAddForm.reset({ title: '', notes: '', tags: [], impact: 'medium' });
        this.tagInput = '';
        this.showQuickAddDetails = false;
        this.toastService.success(this.t('evidenceLog.messages.saved'));
      },
      error: () => {
        this.toastService.error(this.t('evidenceLog.errors.saveFailed'));
      },
    });
  }

  // Edit
  openEditModal(entry: EvidenceEntry): void {
    this.editingEntry = entry;
    this.editForm.patchValue({
      title: entry.title,
      notes: entry.notes || '',
      tags: entry.tags || [],
      impact: entry.impact,
    });
    this.editTagInput = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingEntry = null;
  }

  submitEdit(): void {
    if (!this.editingEntry || this.editForm.invalid) return;

    const data: EvidenceEntryUpdate = {
      title: this.editForm.value.title,
      notes: this.editForm.value.notes || undefined,
      tags: this.editForm.value.tags.length > 0 ? this.editForm.value.tags : undefined,
      impact: this.editForm.value.impact,
    };

    this.evidenceLogService.update(this.editingEntry.id, data).subscribe({
      next: (updated) => {
        const current = this.entries();
        const index = current.findIndex((e) => e.id === updated.id);
        if (index !== -1) {
          const newEntries = [...current];
          newEntries[index] = updated;
          this.entries.set(newEntries);
          this.updateTags(newEntries);
          this.updateInsights(newEntries);
        }
        this.closeEditModal();
        this.toastService.success(this.t('evidenceLog.messages.updated'));
      },
      error: () => {
        this.toastService.error(this.t('evidenceLog.errors.updateFailed'));
      },
    });
  }

  // Delete
  openDeleteConfirm(entry: EvidenceEntry): void {
    this.deletingEntry = entry;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.deletingEntry = null;
  }

  confirmDelete(): void {
    if (!this.deletingEntry) return;

    this.evidenceLogService.delete(this.deletingEntry.id).subscribe({
      next: () => {
        const current = this.entries();
        const newEntries = current.filter((e) => e.id !== this.deletingEntry!.id);
        this.entries.set(newEntries);
        this.updateTags(newEntries);
        this.updateInsights(newEntries);
        this.closeDeleteConfirm();
        this.toastService.success(this.t('evidenceLog.messages.deleted'));
      },
      error: () => {
        this.toastService.error(this.t('evidenceLog.errors.deleteFailed'));
      },
    });
  }

  // Notes expansion
  toggleNotes(id: string): void {
    if (this.expandedNotes.has(id)) {
      this.expandedNotes.delete(id);
    } else {
      this.expandedNotes.add(id);
    }
  }

  isNotesExpanded(id: string): boolean {
    return this.expandedNotes.has(id);
  }

  shouldTruncateNotes(notes: string | undefined): boolean {
    if (!notes) return false;
    return notes.length > 150 || notes.split('\n').length > 2;
  }

  getTruncatedNotes(notes: string): string {
    if (notes.length <= 150 && notes.split('\n').length <= 2) return notes;
    const lines = notes.split('\n').slice(0, 2);
    let truncated = lines.join('\n');
    if (truncated.length > 150) {
      truncated = truncated.substring(0, 147) + '...';
    } else if (notes.split('\n').length > 2) {
      truncated += '...';
    }
    return truncated;
  }

  // Filters
  updateFilter(key: keyof EvidenceLogFilter, value: unknown): void {
    this.filter.update((f) => ({ ...f, [key]: value }));
  }

  toggleTagFilter(tag: string): void {
    const current = this.filter().tags || [];
    if (current.includes(tag)) {
      this.filter.update((f) => ({ ...f, tags: current.filter((t) => t !== tag) }));
    } else {
      this.filter.update((f) => ({ ...f, tags: [...current, tag] }));
    }
  }

  isTagSelected(tag: string): boolean {
    return this.filter().tags?.includes(tag) || false;
  }

  clearFilters(): void {
    this.filter.set({
      searchText: '',
      impact: 'all',
      timeRange: 'all',
      tags: [],
      status: 'all',
    });
  }

  hasActiveFilters(): boolean {
    const f = this.filter();
    return !!(
      f.searchText ||
      (f.impact && f.impact !== 'all') ||
      (f.timeRange && f.timeRange !== 'all') ||
      (f.tags && f.tags.length > 0) ||
      (f.status && f.status !== 'all')
    );
  }

  // Impact label helpers
  getImpactLabel(impact: EvidenceImpact): string {
    return this.t(`evidenceLog.impact.${impact}`);
  }

  getImpactClass(impact: EvidenceImpact): string {
    switch (impact) {
      case 'low':
        return 'impact-pill--low';
      case 'medium':
        return 'impact-pill--medium';
      case 'high':
        return 'impact-pill--high';
      default:
        return '';
    }
  }

  // Status helper methods
  getStatusLabel(status: EvidenceStatus | undefined): string {
    if (!status) return '';
    return this.t(`evidenceLog.status.${status.toLowerCase()}`);
  }

  getStatusClass(status: EvidenceStatus | undefined): string {
    if (!status) return '';
    return `status-badge--${status.toLowerCase()}`;
  }

  // Re-anchor entry
  anchorEntry(entry: EvidenceEntry): void {
    this.evidenceLogService.anchor(entry.id).subscribe({
      next: (updated) => {
        const current = this.entries();
        const index = current.findIndex((e) => e.id === updated.id);
        if (index !== -1) {
          const newEntries = [...current];
          newEntries[index] = updated;
          this.entries.set(newEntries);
        }
        this.toastService.success(this.t('evidenceLog.messages.anchored'));
        // Refresh audit preview
        this.evidenceLogService.getAuditPreview().subscribe({
          next: (preview) => this.auditPreview.set(preview),
          error: () => {}
        });
      },
      error: () => {
        this.toastService.error(this.t('evidenceLog.errors.anchorFailed'));
      },
    });
  }

  // Format weight as percentage
  formatWeight(weight: number | undefined): string {
    if (weight === undefined) return '';
    return `${Math.round(weight * 100)}%`;
  }
}
