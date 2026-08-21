export type AnalyticsEventName =
  | 'scan_started'
  | 'photo_added'
  | 'photo_captured'
  | 'vehicle_identified'
  | 'analysis_completed'
  | 'report_viewed'
  | 'share_clicked'
  | 'report_shared'
  | 'feedback_submitted'
  | 'quick_check_started'
  | 'full_check_started'
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

export interface PilotSessionState {
  sessionId: string;
  sessionStarted: string;
  identificationMethod: 'photo' | 'manual' | 'both' | 'none';
  vehicleIdentified: string | null;
  vehicleConfirmed: boolean;
  photosProvided: number;
  analysisCompleted: boolean;
  reportViewed: boolean;
  shareClicked: boolean;
  feedbackSubmitted: {
    helpful: boolean | null;
    comment?: string;
    timestamp: string;
  } | null;
}

export class AnalyticsService {
  private static eventsLog: AnalyticsEventPayload[] = [];
  private static activePilotSession: PilotSessionState = AnalyticsService.createInitialPilotSession();

  private static createInitialPilotSession(): PilotSessionState {
    return {
      sessionId: `pilot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionStarted: new Date().toISOString(),
      identificationMethod: 'none',
      vehicleIdentified: null,
      vehicleConfirmed: false,
      photosProvided: 0,
      analysisCompleted: false,
      reportViewed: false,
      shareClicked: false,
      feedbackSubmitted: null
    };
  }

  /**
   * Start or reset a pilot session locally (in memory & localStorage)
   */
  static startPilotSession(): PilotSessionState {
    this.activePilotSession = this.createInitialPilotSession();
    this.persistPilotSession();
    return this.activePilotSession;
  }

  /**
   * Update active pilot session fields
   */
  static updatePilotSession(patch: Partial<PilotSessionState>): PilotSessionState {
    this.activePilotSession = {
      ...this.activePilotSession,
      ...patch
    };
    this.persistPilotSession();
    return this.activePilotSession;
  }

  /**
   * Retrieve active pilot session data
   */
  static getActivePilotSession(): PilotSessionState {
    return { ...this.activePilotSession };
  }

  private static persistPilotSession() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('oche_active_pilot_session', JSON.stringify(this.activePilotSession));
      }
    } catch {
      // Local storage may be restricted in sandboxes; memory state persists
    }
  }

  /**
   * Track non-sensitive user action for product analytics
   * Strictly NO PII, no images, no secrets. Local only.
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

  static trackScanStarted(photoCount: number, mode: 'quick' | 'full' = 'full') {
    this.track('scan_started', { photoCount, mode });
  }

  static trackVehicleIdentified(make: string, model: string, confidence: number) {
    this.track('vehicle_identified', { make, model, confidence });
  }

  static trackAnalysisCompleted(make: string, model: string, score: number, isDemo: boolean = false) {
    this.track('analysis_completed', { make, model, score, isDemo });
  }

  static trackReportViewed(reportId: string, vehicleName: string) {
    this.track('report_viewed', { reportId, vehicleName });
  }

  static trackShareClicked(reportId: string, shareMethod: string) {
    this.track('share_clicked', { reportId, shareMethod });
  }

  static trackReportShared(reportId: string, shareMethod: string) {
    this.track('report_shared', { reportId, shareMethod });
  }

  static trackFeedbackSubmitted(reportId: string, helpful: boolean, feedbackText?: string) {
    this.track('feedback_submitted', { reportId, helpful, feedbackLength: feedbackText?.length || 0 });
  }

  static trackFeedback(reportId: string, rating: 'helpful' | 'not_helpful', feedbackText?: string) {
    this.track('feedback_submitted', { reportId, helpful: rating === 'helpful', feedbackText: feedbackText || '' });
  }

  /**
   * Get logged events (debugging / local telemetry inspection)
   */
  static getRecentEvents(): AnalyticsEventPayload[] {
    return [...this.eventsLog];
  }

  /**
   * Clear local telemetry log
   */
  static clearEvents() {
    this.eventsLog = [];
  }
}


