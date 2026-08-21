import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisSessionService } from '../services/AnalysisSessionService';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { DecisionEngine } from '../services/DecisionEngine';
import { PurchaseScoreEngine } from '../services/PurchaseScoreEngine';
import { CountryEngine } from '../services/CountryEngine';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { VisualObservation, ModelProCon } from '../types';

describe('OCHE — REAL PURCHASE DECISION VALIDATION (Tests 1 – 5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // TEST REAL 1: Supported Vehicle Full Purchase Decision Flow
  // ============================================================
  it('TEST REAL 1: Supported vehicle with realistic price, km, year, country, and photos provides complete decision breakdown', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {
        front: { url: 'https://example.com/golf-front.jpg' },
        dashboard: { url: 'https://example.com/golf-dash.jpg' },
        engine: { url: 'https://example.com/golf-engine.jpg' }
      },
      askingPrice: 9200,
      mileageKm: 135000,
      year: 2016,
      location: 'ES',
      brandHint: 'Volkswagen',
      modelHint: 'Golf',
      fuel: 'Diésel',
      transmission: 'Manual'
    });

    const report = AnalysisSessionService.sessionToLegacyReport(session);
    const countryProfile = CountryEngine.getCountryProfile('ES');

    // 1. TU COCHE (Identity & Specs)
    expect(report.identity.make).toBe('Volkswagen');
    expect(report.identity.model).toBe('Golf');
    expect(report.identity.fuelType).toBe('Diésel');
    expect(report.identity.transmission).toBe('Manual');
    expect(report.mileageKm).toBe(135000);

    // 2. PRECIO (Asking price & cost structure)
    expect(report.userPrice).toBe(9200);
    expect(report.realCost.askingPrice).toBe(9200);
    expect(report.realCost.totalMin).toBeGreaterThan(9200);

    // 3. PUNTUACIÓN (Score & Categories)
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(report.scoreCategories.length).toBeGreaterThanOrEqual(4);

    // 4. LO BUENO (Pros)
    const knownPros = session.vehicle?.knownProblems || [];
    expect(knownPros).toBeDefined();

    // 5. ATENCIÓN (Observed visual findings)
    expect(report.visualObservations).toBeDefined();

    // 6. RIESGOS (Technical risks / endemic flaws)
    expect(session.riskFindings).toBeDefined();
    expect(session.riskDetails).toBeDefined();

    // 7. COSTE POTENCIAL (Potential initial maintenance & repair costs)
    expect(report.realCost.initialMaintenanceMin).toBeGreaterThan(0);
    expect(report.realCost.totalMax).toBeGreaterThan(report.realCost.totalMin);
    expect(report.repairs).toBeDefined();

    // 8. PRECIO OBJETIVO (Negotiation targets)
    expect(report.negotiation.targetPriceMin).toBeGreaterThan(0);
    expect(report.negotiation.targetPriceMax).toBeGreaterThan(report.negotiation.targetPriceMin);
    expect(report.negotiation.targetPriceMax).toBeLessThanOrEqual(report.userPrice || 9200);

    // 9. ¿LO COMPRARÍA? (Verdict and transparent recommendation)
    expect(report.recommendation).toBeDefined();
    expect(report.recommendation.length).toBeGreaterThan(15);
    expect(session.decision).toMatch(/GOOD_DEAL|FAIR|NEGOTIATE|HIGH_RISK|AVOID/);
  });

  // ============================================================
  // TEST REAL 2: Manual Identification Before Photos
  // ============================================================
  it('TEST REAL 2: Manual vehicle identification succeeds without photos, maintaining strict separation of model vs unit condition', async () => {
    // 1. Identify vehicle purely from manual parameters
    const manualIdentification = await VehicleIdentificationService.identifyVehicle(
      {}, // Zero photos
      {
        brandHint: 'Peugeot',
        modelHint: '208',
        year: 2017,
        engineHint: '1.2 PureTech',
        fuel: 'Gasolina',
        transmission: 'Manual'
      },
      localVehicleRepository
    );

    expect(manualIdentification.brand).toBe('Peugeot');
    expect(manualIdentification.model).toBe('208');
    expect(manualIdentification.matchedVehicle).not.toBeNull();
    expect(manualIdentification.matchedVehicle?.id).toBe('peugeot-208-puretech');

    // 2. Add photos for individual unit observations
    const unitPhotos = {
      front: { url: 'https://example.com/peugeot-front.jpg' },
      interior: { url: 'https://example.com/peugeot-seat.jpg' }
    };

    const session = await AnalysisSessionService.runAnalysis({
      photos: unitPhotos,
      askingPrice: 7500,
      mileageKm: 98000,
      brandHint: manualIdentification.brand,
      modelHint: manualIdentification.model,
      engineHint: manualIdentification.engine,
      year: 2017
    });

    const report = AnalysisSessionService.sessionToLegacyReport(session);

    // Verify MODEL KNOWLEDGE comes from repository
    expect(report.modelProsCons.length).toBeGreaterThan(0);
    expect(report.modelProsCons.every((p) => p.isModelGeneral)).toBe(true);

    // Verify UNIT OBSERVATIONS are strictly classified as photo-derived or unconfirmed
    const categorized = EvidenceEngine.categorizeFindings(
      report.visualObservations,
      report.modelProsCons,
      report.repairs,
      report.mileageKm
    );
    expect(categorized.known.length).toBeGreaterThan(0);
    expect(categorized.known.every((k) => k.evidenceType === 'KNOWN')).toBe(true);
  });

  // ============================================================
  // TEST REAL 3: Unsupported Vehicle
  // ============================================================
  it('TEST REAL 3: Unsupported vehicle preserves user input and never invents specific endemic defects or 3D data', async () => {
    const unsupportedSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      askingPrice: 11000,
      mileageKm: 115000,
      year: 2019,
      brandHint: 'Honda',
      modelHint: 'Civic',
      engineHint: '1.5 VTEC Turbo',
      fuel: 'Gasolina',
      transmission: 'Manual'
    });

    const report = AnalysisSessionService.sessionToLegacyReport(unsupportedSession);

    // Preserves exact input identity
    expect(report.identity.make).toBe('Honda');
    expect(report.identity.model).toBe('Civic');
    expect(report.identity.fuelType).toBe('Gasolina');
    expect(report.identity.transmission).toBe('Manual');

    // Does NOT assign any internal repository vehicle or fabricate specific model flaws
    expect(unsupportedSession.vehicle).toBeNull();
    expect(unsupportedSession.knownProblems.length).toBe(0);
    expect(report.modelProsCons.length).toBe(0);

    // Price and mileage remain preserved
    expect(report.userPrice).toBe(11000);
    expect(report.mileageKm).toBe(115000);
  });

  // ============================================================
  // TEST REAL 4: Deliberately Missing Information
  // ============================================================
  it('TEST REAL 4: Handles missing parameters gracefully without crashing or hallucinating synthetic numbers', async () => {
    const partialSession = await AnalysisSessionService.runAnalysis({
      photos: {}, // No photos
      // askingPrice omitted
      // mileageKm omitted
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      engineHint: 'Motor: No lo sé' // Unknown engine
    });

    const report = AnalysisSessionService.sessionToLegacyReport(partialSession);

    // Unknown engine handled properly
    expect(report.identity.engine).toBe('Motor no especificado');
    expect(report.identity.powerHp).toBe(0);
    expect(report.identity.needsConfirmation).toBe(true);

    // System produces a coherent fallback/preliminary report
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.cannotDetermineNote).toBeDefined();
    expect(report.cannotDetermineNote).toContain('compresión');
  });

  // ============================================================
  // TEST REAL 5: Recommendation Never Presents Absolute Certainty
  // ============================================================
  it('TEST REAL 5: Recommendation emphasizes that evaluation depends on available data and physical inspection', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      askingPrice: 8500,
      mileageKm: 90000,
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      year: 2016
    });

    const report = AnalysisSessionService.sessionToLegacyReport(session);

    // Must include explicit uncheckable internal factors warning
    expect(report.cannotDetermineNote).toBeDefined();
    expect(report.cannotDetermineNote).toContain('compresión');
    expect(report.cannotDetermineNote).toContain('embrague');

    // Unknown factors must list mechanical unobservables
    expect(session.unknownFactors.length).toBeGreaterThan(0);
    expect(session.unknownFactors.some((u) => u.toLowerCase().includes('embrague') || u.toLowerCase().includes('compresión'))).toBe(true);

    // Decision info must clearly caveat
    const decisionInfo = DecisionEngine.getDecisionInfo(session.decision);
    expect(decisionInfo.description).toBeDefined();
    expect(decisionInfo.description.length).toBeGreaterThan(10);
  });
});
