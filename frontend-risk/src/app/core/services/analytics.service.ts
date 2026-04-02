import { Injectable, inject } from '@angular/core';
import { ApiClient } from '../api/api-client.service';
import { EMPTY, catchError } from 'rxjs';

export type AnalyticsEvent =
  | 'session_started'
  | 'session_completed'
  | 'checkout_initiated'
  | 'tier_upgraded'
  | 'share_created'
  | 'save_by_email'
  | 'arena_tool_used'
  | 'command_palette_opened'
  | 'shortcut_used'
  | 'page_view';

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiClient);
  private utmParams: UtmParams = {};

  constructor() {
    this.captureUtmParams();
  }

  private captureUtmParams(): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const keys: (keyof UtmParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    for (const key of keys) {
      const val = params.get(key);
      if (val) this.utmParams[key] = val;
    }
    // Persist UTM for the session
    if (Object.keys(this.utmParams).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(this.utmParams));
    } else {
      const saved = sessionStorage.getItem('utm_params');
      if (saved) {
        try { this.utmParams = JSON.parse(saved); } catch {}
      }
    }
  }

  getUtmParams(): UtmParams {
    return { ...this.utmParams };
  }

  trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    if (typeof console !== 'undefined') {
      console.debug('[Analytics]', event, properties ?? {});
    }

    const sessionId = typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('analyticsSessionId') || this.initSessionId()
      : 'unknown';

    this.api.post('/analytics/event', {
      event,
      properties: { ...this.utmParams, ...(properties ?? {}) },
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
