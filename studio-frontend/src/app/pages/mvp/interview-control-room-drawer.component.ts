import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InterviewDebugState,
  InterviewDebugStateService
} from '../../core/services/interview-debug-state.service';
import {
  AdminAuditApiService,
  AdminInterviewAuditEvent
} from '../../core/services/admin-audit-api.service';
import { ObserverLogPanelComponent } from '../../shared/observer-log/observer-log-panel.component';
import { InterviewProfileStateService } from '../../core/services/interview-profile-state.service';
import { InterviewProfileDto } from '../../core/models/interview-session.model';

@Component({
  selector: 'app-control-room-drawer',
  standalone: true,
  imports: [CommonModule, ObserverLogPanelComponent],
  templateUrl: './interview-control-room-drawer.component.html',
  styleUrls: ['./interview-control-room-drawer.component.scss']
})
export class InterviewControlRoomDrawerComponent {
  private static readonly OBSERVER_OPEN_STORAGE_KEY = 'aiInterview.controlRoom.observerOpen';

  readonly state$ = this.debugState.state$;
  observerOpen = false;

  readonly cvProfile$ = this.profileState.profile$;

  /**
   * View model for audit events with pre-computed, pretty-printed payload.
   * Keeps template simple and avoids doing heavy work during change detection.
   */
  auditEvents: (AdminInterviewAuditEvent & {
    payloadPretty: string | null;
    hasPayloadContent: boolean;
  })[] = [];
  auditLoading = false;
  auditError: string | null = null;
  auditFilterType: 'ALL' | 'ANSWER_RECORDED' | 'SUMMARY_UPDATED' | 'DECISION_MADE' = 'ALL';
  auditSearch = '';

  constructor(
    private readonly debugState: InterviewDebugStateService,
    private readonly auditApi: AdminAuditApiService,
    private readonly profileState: InterviewProfileStateService
  ) {
    // Load persisted observer log open/closed state.
    try {
      const raw = localStorage.getItem(InterviewControlRoomDrawerComponent.OBSERVER_OPEN_STORAGE_KEY);
      this.observerOpen = raw === 'true';
    } catch {
      this.observerOpen = false;
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(event: KeyboardEvent): void {
    // Close drawer on ESC if it is currently open. Guarded by state service.
    if (event.defaultPrevented) {
      return;
    }
    this.close();
  }

  close(): void {
    this.debugState.setDrawerOpen(false);
  }

  loadAudit(sessionUuid: string | null): void {
    if (!sessionUuid) {
      return;
    }
    this.auditLoading = true;
    this.auditError = null;
    this.auditApi.getAuditEvents(sessionUuid).subscribe({
      next: (events) => {
        // Newest last for natural reading order
        this.auditEvents = [...(events ?? [])]
          .sort((a, b) => (a.ts || '').localeCompare(b.ts || ''))
          .map((e) => this.toAuditEventView(e));
        this.auditLoading = false;
      },
      error: () => {
        this.auditError = 'Failed to load audit events.';
        this.auditLoading = false;
      }
    });
  }

  setAuditFilterType(
    type: 'ALL' | 'ANSWER_RECORDED' | 'SUMMARY_UPDATED' | 'DECISION_MADE'
  ): void {
    this.auditFilterType = type;
  }

  get filteredAuditEvents(): (AdminInterviewAuditEvent & {
    payloadPretty: string | null;
    hasPayloadContent: boolean;
  })[] {
    let events = this.auditEvents;

    if (this.auditFilterType !== 'ALL') {
      events = events.filter((e) => e.type === this.auditFilterType);
    }

    const q = (this.auditSearch || '').toLowerCase().trim();
    if (!q) {
      return events;
    }

    return events.filter((e) => {
      const haystack = `${e.type || ''} ${e.label || ''} ${e.message || ''} ${JSON.stringify(
        e.payload ?? ''
      )}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  /**
   * Build a stable view model for an audit event, including a pretty-printed
   * payload representation that is safe for all expected shapes:
   * - object/array
   * - stringified JSON
   * - primitive values
   * - null/empty
   */
  private toAuditEventView(
    event: AdminInterviewAuditEvent
  ): AdminInterviewAuditEvent & { payloadPretty: string | null; hasPayloadContent: boolean } {
    const { pretty, hasContent } = this.buildPayloadView(event.payload);
    return {
      ...event,
      payloadPretty: pretty,
      hasPayloadContent: hasContent
    };
  }

  /**
   * Normalises an arbitrary payload into a pretty-printed string and a
   * boolean flag indicating whether there is any meaningful content.
   *
   * Rules:
   * - If value is a string that looks like JSON, try to parse it, otherwise
   *   show it as plain text.
   * - If value is an object/array, pretty-print via JSON.stringify.
   * - If value is null/undefined or effectively empty, treat as no content.
   */
  private buildPayloadView(
    value: unknown
  ): {
    pretty: string | null;
    hasContent: boolean;
  } {
    if (value === null || value === undefined) {
      return { pretty: null, hasContent: false };
    }

    // Strings: either plain text or stringified JSON.
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return { pretty: null, hasContent: false };
      }

      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return {
            pretty: JSON.stringify(parsed, null, 2),
            hasContent: true
          };
        } catch {
          // Fall through to showing the raw string if parsing fails.
        }
      }

      // Plain string – show as-is.
      return {
        pretty: trimmed,
        hasContent: true
      };
    }

    // Arrays and objects: detect if they are effectively empty.
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { pretty: null, hasContent: false };
      }
      try {
        return {
          pretty: JSON.stringify(value, null, 2),
          hasContent: true
        };
      } catch {
        return { pretty: '«unserializable array»', hasContent: true };
      }
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length === 0) {
        return { pretty: null, hasContent: false };
      }
      try {
        return {
          pretty: JSON.stringify(obj, null, 2),
          hasContent: true
        };
      } catch {
        return { pretty: '«unserializable object»', hasContent: true };
      }
    }

    // Numbers, booleans, etc.
    try {
      return {
        pretty: JSON.stringify(value, null, 2),
        hasContent: true
      };
    } catch {
      return {
        pretty: String(value),
        hasContent: true
      };
    }
  }

  formatJson(value: unknown): string {
    try {
      if (value === null || value === undefined) {
        return 'null';
      }
      return JSON.stringify(value, null, 2);
    } catch {
      return '«unserializable»';
    }
  }

  copy(text: string | null | undefined): void {
    if (!text) {
      return;
    }
    if (navigator && 'clipboard' in navigator && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        // swallow copy errors
      });
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // ignore
    }
  }

  copyJson(value: unknown): void {
    this.copy(this.formatJson(value));
  }

  buildPostmanBody(state: InterviewDebugState): string {
    // Canonical session key: prefer UUID, fall back to sessionId string. Never empty.
    const rawUuid = (state.sessionInfo?.sessionUuid ?? '').toString().trim();
    const rawId = state.sessionInfo?.sessionId != null ? String(state.sessionInfo.sessionId).trim() : '';
    const sessionKey = rawUuid || rawId || '<missing-session-id>';

    const body = {
      sessionUuid: sessionKey,
      answer: '<answer placeholder>'
    };
    return JSON.stringify(body, null, 2);
  }

  toggleObserver(): void {
    this.observerOpen = !this.observerOpen;
    try {
      localStorage.setItem(
        InterviewControlRoomDrawerComponent.OBSERVER_OPEN_STORAGE_KEY,
        this.observerOpen ? 'true' : 'false'
      );
    } catch {
      // ignore storage failures
    }
  }
}


