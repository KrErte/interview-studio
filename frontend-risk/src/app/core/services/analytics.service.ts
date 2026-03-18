import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../api/api-client.service';
import { EMPTY, catchError } from 'rxjs';

export type AnalyticsEvent =
  | 'session_started'
  | 'session_completed'
  | 'checkout_initiated'
  | 'tier_upgraded'
  | 'share_created'
  | 'arena_tool_used'
  | 'command_palette_opened'
  | 'shortcut_used'
  | 'page_view';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiClient);

  trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    if (typeof console !== 'undefined') {
      console.debug('[Analytics]', event, properties ?? {});
    }

    const sessionId = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('analyticsSessionId') || this.initSessionId()
      : 'unknown';

    this.api.post('/analytics/event', {
      event,
      properties: properties ?? {},
      timestamp: new Date().toISOString(),
      sessionId
    }).pipe(
      catchError(() => EMPTY)
    ).subscribe();
  }

  trackPageView(path: string): void {
    this.trackEvent('page_view', { path });
  }

  private initSessionId(): string {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('analyticsSessionId', id);
    return id;
  }
}
