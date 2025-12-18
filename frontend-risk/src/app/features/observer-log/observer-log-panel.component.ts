import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ObserverLogDto, ObserverStage } from './observer-log.model';
import { ObserverLogService } from './observer-log.service';
import { PersonaContext } from '../persona-theater/persona-context.service';
import { PersonaId } from '../persona-theater/persona.model';
import { adaptObserverExplanation, PersonaStyle } from '../persona-theater/persona-adapter';

@Component({
  selector: 'app-observer-log-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-end justify-end bg-slate-950/70 backdrop-blur-sm">
      <div class="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-slate-800 bg-slate-950 shadow-2xl shadow-emerald-500/20">
        <div class="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p class="text-sm font-semibold text-slate-100">Observer Log</p>
            <p class="text-xs text-slate-400" *ngIf="sessionUuid; else missingSession">Session: {{ sessionUuid }}</p>
            <ng-template #missingSession>
              <p class="text-xs text-amber-400">Session UUID not provided. Pass ?sessionUuid=... to view logs.</p>
            </ng-template>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              (click)="refresh()"
              [disabled]="loading"
            >
              Refresh
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
              (click)="close.emit()"
            >
              Close
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4">
          <ng-container *ngIf="sessionUuid; else noSession">
            <ng-container *ngIf="!error; else errorTpl">
              <div *ngIf="loading" class="space-y-3">
                <div *ngFor="let skeleton of skeletons" class="animate-pulse rounded-xl border border-slate-900 bg-slate-900/60 p-4">
                  <div class="mb-2 h-3 w-24 rounded bg-slate-800"></div>
                  <div class="mb-2 h-3 w-40 rounded bg-slate-800"></div>
                  <div class="h-16 rounded bg-slate-800"></div>
                </div>
              </div>

              <div *ngIf="!loading && logs.length === 0" class="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center">
                <p class="text-sm font-semibold text-slate-200">No observer logs yet</p>
                <p class="text-xs text-slate-400 mt-1">Run the assessment to see observer activity.</p>
              </div>

              <div *ngIf="!loading && logs.length > 0" class="space-y-4">
                <div
                  *ngFor="let log of logs"
                  class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-md shadow-emerald-500/10"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-2">
                      <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                        {{ stageLabel(log.stage) }}
                      </span>
                      <span class="text-xs text-slate-400">{{ log.createdAt | date: 'medium' }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-slate-300">
                      <span *ngIf="log.riskBefore !== null && log.riskBefore !== undefined">
                        Risk: <span class="font-semibold text-emerald-200">{{ log.riskBefore }}</span>
                        <span *ngIf="log.riskAfter !== null && log.riskAfter !== undefined">→ {{ log.riskAfter }}</span>
                      </span>
                      <span *ngIf="log.confidenceBefore !== null && log.confidenceBefore !== undefined">
                        Confidence: <span class="font-semibold text-emerald-200">{{ log.confidenceBefore }}%</span>
                        <span *ngIf="log.confidenceAfter !== null && log.confidenceAfter !== undefined">→ {{ log.confidenceAfter }}%</span>
                      </span>
                    </div>
                  </div>

                  <div class="mt-3 flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-slate-100">Explanation</p>
                      <p class="mt-1 whitespace-pre-line text-sm text-slate-200" [class.italic]="!log.rationaleSummary">
                        {{ explanationFor(log) || 'No rationale provided.' }}
                      </p>
                    </div>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-800 px-3 py-1.5 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-200"
                      (click)="copyRationale(log)"
                    >
                      {{ copiedId === log.id ? 'Copied' : 'Copy' }}
                    </button>
                  </div>

                  <div class="mt-3">
                    <button
                      type="button"
                      class="text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                      (click)="toggleExpanded(log.id)"
                    >
                      {{ expanded.has(log.id) ? 'Hide details' : 'Details' }}
                    </button>

                    <div *ngIf="expanded.has(log.id)" class="mt-2 space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200">
                      <ng-container *ngIf="formattedJson(log.signalsJson) as signals; else rawSignals">
                        <p class="font-semibold text-emerald-200">Signals</p>
                        <pre class="whitespace-pre-wrap rounded bg-slate-900/80 p-2 text-[11px] leading-relaxed text-slate-200">{{ signals }}</pre>
                      </ng-container>
                      <ng-template #rawSignals>
                        <p class="font-semibold text-emerald-200">Signals</p>
                        <p class="rounded bg-slate-900/60 p-2 text-[11px] text-slate-300">{{ log.signalsJson || '—' }}</p>
                      </ng-template>

                      <ng-container *ngIf="formattedJson(log.weaknessesJson) as weaknesses; else rawWeaknesses">
                        <p class="font-semibold text-emerald-200">Weaknesses</p>
                        <pre class="whitespace-pre-wrap rounded bg-slate-900/80 p-2 text-[11px] leading-relaxed text-slate-200">{{ weaknesses }}</pre>
                      </ng-container>
                      <ng-template #rawWeaknesses>
                        <p class="font-semibold text-emerald-200">Weaknesses</p>
                        <p class="rounded bg-slate-900/60 p-2 text-[11px] text-slate-300">{{ log.weaknessesJson || '—' }}</p>
                      </ng-template>
                    </div>
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-template #errorTpl>
              <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p class="text-sm font-semibold text-rose-200">Could not load observer logs</p>
                <p class="text-xs text-rose-100/80">{{ error }}</p>
                <button
                  type="button"
                  class="mt-3 rounded-lg border border-rose-400 px-3 py-1.5 text-xs font-semibold text-rose-50 transition hover:border-rose-300 hover:text-rose-50"
                  (click)="refresh()"
                >
                  Retry
                </button>
              </div>
            </ng-template>
          </ng-container>

          <ng-template #noSession>
            <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p class="text-sm font-semibold text-amber-200">No session UUID</p>
              <p class="text-xs text-amber-100/80">Provide a sessionUuid via query param or start an assessment to view logs.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class ObserverLogPanelComponent implements OnChanges, OnDestroy {
  @Input() sessionUuid: string | null = null;
  @Output() close = new EventEmitter<void>();

  logs: ObserverLogDto[] = [];
  loading = false;
  error = '';
  expanded = new Set<string>();
  copiedId: string | null = null;
  readonly skeletons = Array.from({ length: 3 });

  private readonly destroy$ = new Subject<void>();

  constructor(
    private observerLogService: ObserverLogService,
    private personaContext: PersonaContext
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionUuid'] && this.sessionUuid) {
      this.refresh();
    }
    if (changes['sessionUuid'] && !this.sessionUuid) {
      this.logs = [];
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    if (!this.sessionUuid) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.observerLogService
      .getLogs(this.sessionUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logs) => {
          this.logs = [...(logs || [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || err?.message || 'Unexpected error';
        }
      });
  }

  stageLabel(stage: ObserverStage): string {
    switch (stage) {
      case 'INITIAL_ASSESSMENT':
        return 'Initial';
      case 'CLARIFYING_Q1':
      case 'CLARIFYING_Q2':
      case 'CLARIFYING_Q3':
        return 'Clarifying';
      case 'REASSESSMENT':
        return 'Reassess';
      case 'ROADMAP_GENERATED':
        return 'Roadmap';
      default:
        return 'Other';
    }
  }

  toggleExpanded(id: string): void {
    if (this.expanded.has(id)) {
      this.expanded.delete(id);
    } else {
      this.expanded.add(id);
    }
  }

  formattedJson(raw?: string | null): string | null {
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  }

  copyRationale(log: ObserverLogDto): void {
    const text = this.explanationFor(log) || '';
    if (!text) {
      return;
    }
    navigator.clipboard?.writeText(text).catch(() => undefined);
    this.copiedId = log.id;
    setTimeout(() => {
      if (this.copiedId === log.id) {
        this.copiedId = null;
      }
    }, 1500);
  }

  explanationFor(log: ObserverLogDto): string {
    const persona = this.resolvePersona();
    const entry = {
      delta: this.computeDelta(log),
      reason: log.rationaleSummary,
      signals: this.extractSignals(log)
    };
    return adaptObserverExplanation(entry, persona);
  }

  private resolvePersona(): PersonaStyle {
    const id: PersonaId | null = this.personaContext.currentPersonaId;
    if (id === 'P1') return 'SKEPTIC';
    if (id === 'P3') return 'COACH';
    if (id === 'P5') return 'PRAGMATIST';
    if (id === 'P7' || id === null) return 'BALANCED';
    return 'BALANCED';
  }

  private computeDelta(log: ObserverLogDto): number {
    const before = log.riskBefore ?? 0;
    const after = log.riskAfter ?? before;
    return after - before;
  }

  private extractSignals(log: ObserverLogDto): string[] {
    if (!log.signalsJson) {
      return [];
    }
    try {
      const parsed = JSON.parse(log.signalsJson);
      if (Array.isArray(parsed)) {
        return parsed.filter((s) => typeof s === 'string') as string[];
      }
      return [];
    } catch {
      return [];
    }
  }
}

