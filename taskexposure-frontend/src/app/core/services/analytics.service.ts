import { Injectable } from '@angular/core';

export type AnalyticsEvent =
  | 'page_view'
  | 'session_started'
  | 'session_completed'
  | 'questionnaire_started'
  | 'questionnaire_completed'
  | 'result_viewed'
  | 'payment_initiated'
  | 'payment_completed'
  | 'share_clicked'
  | 'login_started'
  | 'login_completed'
  | 'register_started'
  | 'register_completed'
  | 'command_palette_opened'
  | 'shortcut_used';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean | null>;
  timestamp?: Date;
}

/**
 * Analytics service for tracking user events.
 * This is a stub implementation that logs to console.
 * In production, replace with actual analytics provider (Mixpanel, Amplitude, etc.)
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly enabled: boolean;
  private readonly events: AnalyticsEventData[] = [];

  constructor() {
    // Enable in production, disable in dev for cleaner console
    this.enabled = false; // Set to true when connecting real analytics
  }

  /**
   * Track an analytics event.
   */
  track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | null>): void {
    const eventData: AnalyticsEventData = {
      event,
      properties,
      timestamp: new Date(),
    };

    // Store locally for debugging
    this.events.push(eventData);

    if (this.enabled) {
      console.log('[Analytics]', event, properties);

      // TODO: Send to actual analytics provider
      // Example: mixpanel.track(event, properties);
      // Example: amplitude.track(event, properties);
    }
  }

  /**
   * Track a page view.
   */
  pageView(path: string, title?: string): void {
    this.track('page_view', { path, title: title || document.title });
  }

  /**
   * Identify a user (after login/register).
   */
  identify(userId: string, traits?: Record<string, string | number | boolean | null>): void {
    if (this.enabled) {
      console.log('[Analytics] Identify:', userId, traits);

      // TODO: Send to actual analytics provider
      // Example: mixpanel.identify(userId);
      // Example: mixpanel.people.set(traits);
    }
  }

  /**
   * Reset user identity (after logout).
   */
  reset(): void {
    if (this.enabled) {
      console.log('[Analytics] Reset');

      // TODO: Reset analytics provider
      // Example: mixpanel.reset();
    }
  }

  /**
   * Get all tracked events (for debugging).
   */
  getEvents(): AnalyticsEventData[] {
    return [...this.events];
  }

  /**
   * Clear tracked events.
   */
  clearEvents(): void {
    this.events.length = 0;
  }
}
