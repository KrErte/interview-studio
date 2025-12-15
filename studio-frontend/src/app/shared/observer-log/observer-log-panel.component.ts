import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DEMO_OBSERVER_LOG, ObserverLogEvent, ObserverLogService } from './observer-log.service';

@Component({
  selector: 'app-observer-log-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observer-log-panel.component.html'
})
export class ObserverLogPanelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() sessionUuid: string | null = null;

  readonly DEMO_OBSERVER_LOG = DEMO_OBSERVER_LOG;
  logs: ObserverLogEvent[] = [];
  loading = false;
  error: string | null = null;

  private sub?: Subscription;

  constructor(private readonly observerLogService: ObserverLogService) {}

  ngOnInit(): void {
    this.sub = this.observerLogService.logs$.subscribe((logs) => {
      this.logs = logs;
    });
    this.fetchLogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sessionUuid'] && !changes['sessionUuid'].firstChange) {
      this.fetchLogs();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  clear(): void {
    this.observerLogService.clear();
  }

  get hasEntries(): boolean {
    return (this.logs?.length ?? 0) > 0;
  }

  metaValue(event: ObserverLogEvent, key: string): string | null {
    const meta = (event as any)?.meta as Record<string, unknown> | undefined;
    if (!meta) return null;
    const value = meta[key];
    if (value === null || value === undefined) return null;
    return String(value);
  }

  private fetchLogs(): void {
    if (!this.sessionUuid) {
      this.logs = [];
      return;
    }
    this.loading = true;
    this.error = null;
    this.observerLogService.fetch(this.sessionUuid).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not load observer log.';
        this.loading = false;
      }
    });
  }
}
