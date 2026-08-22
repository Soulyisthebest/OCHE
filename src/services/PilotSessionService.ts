import { RealPilotSession, PilotUserFeedback, PilotTesterObservation, PilotOutcomeFollowup } from '../types/pilotSession';
import { AnalyticsEventName, AnalyticsEventPayload } from './AnalyticsService';

const PILOT_STORAGE_KEY = 'oche_real_pilot_sessions_v1';
const PILOT_FLAG_KEY = 'oche_pilot_mode_enabled';

export class PilotSessionService {
  private static activeSession: RealPilotSession | null = null;
  private static sessionStartTime: number = Date.now();
  private static inMemorySessions: RealPilotSession[] = [];

  /**
   * Check if pilot mode is active via feature flag or dev environment
   */
  static isPilotModeEnabled(): boolean {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(PILOT_FLAG_KEY) === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  }

  static setPilotMode(enabled: boolean) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PILOT_FLAG_KEY, enabled ? 'true' : 'false');
      }
    } catch {
      // ignore
    }
  }

  /**
   * Start a brand new real pilot session
   */
  static startSession(isRealWorld: boolean = true): RealPilotSession {
    this.sessionStartTime = Date.now();
    const session: RealPilotSession = {
      sessionId: `pilot_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      isRealWorldSession: isRealWorld,
      vehicle: {
        brand: 'UNKNOWN',
        model: 'UNKNOWN',
        isConfirmedByHuman: false
      },
      inspectionMetrics: {
        durationSeconds: 0,
        totalPhotosTaken: 0,
        photoRetries: 0,
        completedSteps: 0,
        skippedSteps: 0,
        abandonmentStage: 'none'
      },
      stepRecords: [],
      completionStatus: 'IN_PROGRESS'
    };

    this.activeSession = session;
    this.persistActiveSession();
    return session;
  }

  static getActiveSession(): RealPilotSession | null {
    if (!this.activeSession) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('oche_current_active_pilot');
          if (stored) {
            this.activeSession = JSON.parse(stored);
          }
        }
      } catch {
        // ignore
      }
    }
    return this.activeSession;
  }

  static updateActiveSession(patch: Partial<RealPilotSession>): RealPilotSession | null {
    if (!this.activeSession) {
      this.startSession();
    }
    if (this.activeSession) {
      this.activeSession = {
        ...this.activeSession,
        ...patch,
        vehicle: {
          ...this.activeSession.vehicle,
          ...(patch.vehicle || {})
        },
        inspectionMetrics: {
          ...this.activeSession.inspectionMetrics,
          ...(patch.inspectionMetrics || {})
        }
      };
      this.persistActiveSession();
    }
    return this.activeSession;
  }

  static recordPhotoTaken(missionId: string, accepted: boolean, isRetry: boolean = false) {
    if (!this.activeSession) return;
    this.activeSession.inspectionMetrics.totalPhotosTaken += 1;
    if (isRetry) {
      this.activeSession.inspectionMetrics.photoRetries += 1;
    }
    this.persistActiveSession();
  }

  static recordStepCompletion(missionId: string, missionTitle: string, status: 'COMPLETED' | 'SKIPPED' | 'FAILED', durationMs: number = 0, retryCount: number = 0) {
    if (!this.activeSession) return;
    if (status === 'COMPLETED') {
      this.activeSession.inspectionMetrics.completedSteps += 1;
    } else if (status === 'SKIPPED') {
      this.activeSession.inspectionMetrics.skippedSteps += 1;
    }

    this.activeSession.stepRecords.push({
      missionId,
      missionTitle,
      photoAccepted: status === 'COMPLETED',
      retryCount,
      durationMs,
      status
    });

    this.persistActiveSession();
  }

  /**
   * Finalize and seal the immutable result snapshot
   */
  static finalizeInspection(resultSnapshot: {
    score: number;
    confidence: number;
    verdict: 'COMPRAR' | 'NEGOCIAR' | 'EVITAR';
    realCostCalculated: number;
    negotiationTargetPrice: number;
    topRisksIdentified: string[];
    hasProfessionalEscalation: boolean;
  }) {
    if (!this.activeSession) {
      this.startSession();
    }
    if (this.activeSession) {
      const elapsedSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
      this.activeSession.inspectionMetrics.durationSeconds = elapsedSeconds;
      this.activeSession.inspectionMetrics.timeToFinalDecisionSeconds = elapsedSeconds;
      this.activeSession.completionStatus = 'COMPLETED';
      this.activeSession.immutableResultSnapshot = resultSnapshot;
      this.persistActiveSession();
      this.archiveActiveSession();
    }
  }

  /**
   * Record human end-user feedback (minimal 4 questions)
   */
  static recordUserFeedback(feedback: PilotUserFeedback) {
    if (this.activeSession) {
      this.activeSession.userFeedback = feedback;
      this.persistActiveSession();
      this.archiveActiveSession();
    }
  }

  /**
   * Record human tester observation
   */
  static recordTesterObservation(obs: PilotTesterObservation) {
    if (this.activeSession) {
      this.activeSession.testerObservation = obs;
      this.persistActiveSession();
      this.archiveActiveSession();
    }
  }

  /**
   * Record post-purchase outcome follow-up
   */
  static recordOutcomeFollowup(sessionId: string, followup: PilotOutcomeFollowup) {
    const sessions = this.getAllStoredSessions();
    const target = sessions.find((s) => s.sessionId === sessionId);
    if (target) {
      target.outcomeFollowup = followup;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(PILOT_STORAGE_KEY, JSON.stringify(sessions));
        }
      } catch {
        // ignore
      }
    }
  }

  /**
   * Get all archived pilot sessions
   */
  static getAllStoredSessions(): RealPilotSession[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(PILOT_STORAGE_KEY);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch {
      // ignore
    }
    return [...this.inMemorySessions];
  }

  /**
   * Clear all pilot sessions (with confirmation in UI)
   */
  static clearAllSessions() {
    this.inMemorySessions = [];
    this.activeSession = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(PILOT_STORAGE_KEY);
        window.localStorage.removeItem('oche_current_active_pilot');
      }
    } catch {
      // ignore
    }
  }

  /**
   * Export anonymized pilot dataset as JSON
   */
  static exportPilotDatasetAsJSON(): string {
    const sessions = this.getAllStoredSessions();
    // Sanitize: ensure no personal identifiable info
    const anonymized = sessions.map((s) => ({
      sessionId: s.sessionId,
      timestamp: s.timestamp,
      isRealWorld: s.isRealWorldSession,
      vehicle: {
        brand: s.vehicle.brand,
        model: s.vehicle.model,
        year: s.vehicle.year,
        mileage: s.vehicle.mileage,
        askingPrice: s.vehicle.askingPrice
      },
      metrics: s.inspectionMetrics,
      result: s.immutableResultSnapshot,
      steps: s.stepRecords,
      userFeedback: s.userFeedback,
      testerObservation: s.testerObservation,
      outcome: s.outcomeFollowup,
      status: s.completionStatus
    }));

    return JSON.stringify(anonymized, null, 2);
  }

  /**
   * Calculate aggregated Pilot Dashboard Analytics
   */
  static getAggregatedMetrics() {
    const sessions = this.getAllStoredSessions();
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.completionStatus === 'COMPLETED').length;
    const abandonedSessions = sessions.filter((s) => s.completionStatus === 'ABANDONED').length;
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const completedDurations = sessions
      .filter((s) => s.completionStatus === 'COMPLETED' && s.inspectionMetrics.durationSeconds > 0)
      .map((s) => s.inspectionMetrics.durationSeconds);
    const avgDurationSeconds = completedDurations.length > 0
      ? Math.round(completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length)
      : 0;

    const feedbacks = sessions.map((s) => s.userFeedback).filter((f): f is PilotUserFeedback => !!f);
    const avgEaseRating = feedbacks.length > 0
      ? Number((feedbacks.reduce((a, b) => a + b.easeOfUseRating, 0) / feedbacks.length).toFixed(1))
      : 0;
    const avgTrustRating = feedbacks.length > 0
      ? Number((feedbacks.reduce((a, b) => a + (b.trustScore || b.confidenceRating), 0) / feedbacks.length).toFixed(1))
      : 0;

    const totalPhotos = sessions.reduce((acc, s) => acc + (s.inspectionMetrics?.totalPhotosTaken || 0), 0);
    const totalRetries = sessions.reduce((acc, s) => acc + (s.inspectionMetrics?.photoRetries || 0), 0);
    const retryRate = totalPhotos > 0 ? Math.round((totalRetries / totalPhotos) * 100) : 0;

    // Real cars tested vs simulated
    const realWorldCount = sessions.filter((s) => s.isRealWorldSession).length;
    const simulatedCount = sessions.filter((s) => !s.isRealWorldSession).length;

    return {
      totalSessions,
      completedSessions,
      abandonedSessions,
      completionRate,
      avgDurationSeconds,
      avgEaseRating,
      avgTrustRating,
      totalPhotos,
      totalRetries,
      retryRate,
      sampleSize: totalSessions,
      realWorldCount,
      simulatedCount,
      feedbackCount: feedbacks.length
    };
  }

  private static persistActiveSession() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && this.activeSession) {
        window.localStorage.setItem('oche_current_active_pilot', JSON.stringify(this.activeSession));
      }
    } catch {
      // ignore
    }
  }

  private static archiveActiveSession() {
    if (!this.activeSession) return;
    const session = { ...this.activeSession };
    const memIdx = this.inMemorySessions.findIndex((s) => s.sessionId === session.sessionId);
    if (memIdx >= 0) {
      this.inMemorySessions[memIdx] = session;
    } else {
      this.inMemorySessions.push(session);
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PILOT_STORAGE_KEY, JSON.stringify(this.inMemorySessions));
      }
    } catch {
      // ignore
    }
  }
}
