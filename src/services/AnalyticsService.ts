export type AnalyticsEventName =
  | 'scan_started'
  | 'photo_added'
  | 'vehicle_identified'
  | 'analysis_completed'
  | 'report_viewed'
  | 'part_opened'
  | '3d_opened'
  | 'chat_started'
  | 'vehicle_saved'
  | 'comparison_created'
  | 'what_if_simulated'
  | 'inspection_step_completed';

export interface AnalyticsEventPayload {
  eventName: AnalyticsEventName;
  timestamp: string;
  vehicleId?: string;
  properties?: Record<string, string | number | boolean>;
}

export class AnalyticsService {
  private static eventsLog: AnalyticsEventPayload[] = [];

  /**
   * Track non-sensitive user action for product analytics
   * Strictly NO PII, no images, no secrets.
   */
  static track(eventName: AnalyticsEventName, properties?: Record<string, string | number | boolean>, vehicleId?: string) {
    const event: AnalyticsEventPayload = {
      eventName,
      timestamp: new Date().toISOString(),
      vehicleId,
      properties
    };

    this.eventsLog.push(event);

    // Keep log in memory limited to last 100 events
    if (this.eventsLog.length > 100) {
      this.eventsLog.shift();
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${eventName}:`, properties || {});
    }
  }

  /**
   * Get logged events (debugging / local telemetry inspection)
   */
  static getRecentEvents(): AnalyticsEventPayload[] {
    return [...this.eventsLog];
  }
}
