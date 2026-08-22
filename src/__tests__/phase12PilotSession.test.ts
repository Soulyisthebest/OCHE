import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService, PilotSessionState } from '../services/AnalyticsService';
import { PilotSessionService } from '../services/PilotSessionService';
import { PilotUserFeedback } from '../types/pilotSession';

describe('OCHE — PHASE 12: REAL USER PILOT SESSION TRACKING', () => {
  beforeEach(() => {
    AnalyticsService.clearEvents();
    AnalyticsService.startPilotSession();
    PilotSessionService.clearAllSessions();
    PilotSessionService.startSession(true);
  });

  it('1. Initializes clean pilot session with required structure and timestamps', () => {
    const session: PilotSessionState = AnalyticsService.getActivePilotSession();
    expect(session.sessionId).toMatch(/^pilot_/);
    expect(session.sessionStarted).toBeDefined();
    expect(session.identificationMethod).toBe('none');
    expect(session.vehicleIdentified).toBeNull();
    expect(session.vehicleConfirmed).toBe(false);
    expect(session.photosProvided).toBe(0);
    expect(session.analysisCompleted).toBe(false);
    expect(session.reportViewed).toBe(false);
    expect(session.shareClicked).toBe(false);
    expect(session.feedbackSubmitted).toBeNull();
  });

  it('2. Tracks progressive milestone updates without external network dependencies', () => {
    // Step A: Photos provided
    AnalyticsService.updatePilotSession({
      identificationMethod: 'photo',
      photosProvided: 4
    });
    expect(AnalyticsService.getActivePilotSession().identificationMethod).toBe('photo');
    expect(AnalyticsService.getActivePilotSession().photosProvided).toBe(4);

    // Step B: Vehicle identified & analysis completed
    AnalyticsService.updatePilotSession({
      analysisCompleted: true,
      vehicleIdentified: 'Seat Ibiza 1.0 TSI'
    });
    expect(AnalyticsService.getActivePilotSession().analysisCompleted).toBe(true);
    expect(AnalyticsService.getActivePilotSession().vehicleIdentified).toBe('Seat Ibiza 1.0 TSI');

    // Step C: Vehicle confirmed
    AnalyticsService.updatePilotSession({
      vehicleConfirmed: true
    });
    expect(AnalyticsService.getActivePilotSession().vehicleConfirmed).toBe(true);

    // Step D: Report viewed & share clicked
    AnalyticsService.updatePilotSession({
      reportViewed: true,
      shareClicked: true
    });
    expect(AnalyticsService.getActivePilotSession().reportViewed).toBe(true);
    expect(AnalyticsService.getActivePilotSession().shareClicked).toBe(true);

    // Step E: Feedback submitted (thumbs up + optional comment)
    AnalyticsService.updatePilotSession({
      feedbackSubmitted: {
        helpful: true,
        comment: 'Muy claro el desglose del ITP y el precio objetivo',
        timestamp: new Date().toISOString()
      }
    });

    const finalState = AnalyticsService.getActivePilotSession();
    expect(finalState.feedbackSubmitted?.helpful).toBe(true);
    expect(finalState.feedbackSubmitted?.comment).toContain('ITP');
  });

  it('3. Resets session correctly on new scan initiation', () => {
    AnalyticsService.updatePilotSession({
      vehicleIdentified: 'Ford Focus',
      photosProvided: 2
    });
    expect(AnalyticsService.getActivePilotSession().photosProvided).toBe(2);

    // Start next user session
    AnalyticsService.startPilotSession();
    const newSession = AnalyticsService.getActivePilotSession();
    expect(newSession.photosProvided).toBe(0);
    expect(newSession.vehicleIdentified).toBeNull();
    expect(newSession.feedbackSubmitted).toBeNull();
  });

  it('4. PilotSessionService records immutable snapshot and aggregated metrics', () => {
    // Record photos & step
    PilotSessionService.recordPhotoTaken('mission_front', true);
    PilotSessionService.recordPhotoTaken('mission_wheels', false, true);
    PilotSessionService.recordStepCompletion('mission_front', 'Frontal y Matrícula', 'COMPLETED', 4500, 0);

    // Seal immutable snapshot
    PilotSessionService.finalizeInspection({
      score: 82,
      confidence: 0.9,
      verdict: 'COMPRAR',
      realCostCalculated: 10450,
      negotiationTargetPrice: 9400,
      topRisksIdentified: ['Neumáticos delanteros desgastados'],
      hasProfessionalEscalation: false
    });

    // Record User feedback
    const feedback: PilotUserFeedback = {
      easeOfUseRating: 5,
      understandChecksRating: 4,
      confidenceRating: 5,
      wouldUseAgain: 'YES',
      mostUsefulFeature: 'helped_negotiate',
      whatWasMostUseful: 'El argumento para negociar con el vendedor',
      submittedAt: new Date().toISOString()
    };
    PilotSessionService.recordUserFeedback(feedback);

    const metrics = PilotSessionService.getAggregatedMetrics();
    expect(metrics.totalSessions).toBe(1);
    expect(metrics.completedSessions).toBe(1);
    expect(metrics.completionRate).toBe(100);
    expect(metrics.avgEaseRating).toBe(5);

    // Export dataset as JSON
    const exportedJSON = PilotSessionService.exportPilotDatasetAsJSON();
    expect(exportedJSON).toContain('pilot_');
    expect(exportedJSON).toContain('helped_negotiate');
  });
});

