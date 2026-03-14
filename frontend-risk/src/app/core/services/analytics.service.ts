import { Injectable } from '@angular/core';

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
  trackEvent(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
    // Stub: replace with actual analytics provider (Mixpanel, Amplitude, etc.)
    if (typeof console !== 'undefined') {
      console.debug('[Analytics]', event, properties ?? {});
    }
  }

  trackPageView(path: string): void {
    this.trackEvent('page_view', { path });
  }
}
