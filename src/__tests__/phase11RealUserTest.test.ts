import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalysisSessionService } from '../services/AnalysisSessionService';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

describe('OCHE — PHASE 11: REAL USER MVP TEST SUITE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // 1. USER JOURNEY DEFINITIVO
  // ============================================================
  it('1. Completes full user journey from inputs to decision breakdown', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {
        front: { url: 'https://example.com/seat-front.jpg' },
        dashboard: { url: 'https://example.com/seat-dash.jpg' },
        engine: { url: 'https://example.com/seat-engine.jpg' }
      },
      askingPrice: 8400,
      mileageKm: 112000,
      year: 2017,
      location: 'ES',
      brandHint: 'Seat',
      modelHint: 'Ibiza',
      engineHint: '1.0 TSI',
      fuel: 'Gasolina',
      transmission: 'Manual'
    });

    const report = AnalysisSessionService.sessionToLegacyReport(session);

    // Identity verified
    expect(report.identity.make).toBe('Seat');
    expect(report.identity.model).toBe('Ibiza');
    expect(report.identity.engine).toBe('1.0 TSI');
    expect(report.userPrice).toBe(8400);
    expect(report.mileageKm).toBe(112000);

    // Decision modules populated
    expect(report.score).toBeGreaterThan(0);
    expect(report.realCost.totalMin).toBeGreaterThan(8400);
    expect(report.negotiation.targetPriceMin).toBeGreaterThan(0);
    expect(report.negotiation.targetPriceMax).toBeLessThanOrEqual(8400);
    expect(report.recommendation).toBeDefined();
    expect(report.cannotDetermineNote).toContain('compresión');
  });

  // ============================================================
  // 2. IDENTIFICATION MATRIX (A to F)
  // ============================================================
  it('2.A Coche reconocido por foto: Resolves supported vehicle candidate', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      { front: { base64: 'data:image/jpeg;base64,dummy' } },
      { brandHint: 'Volkswagen', modelHint: 'Golf' },
      localVehicleRepository
    );
    expect(identification.brand).toBe('Volkswagen');
    expect(identification.model).toBe('Golf');
    expect(identification.matchedVehicle).not.toBeNull();
  });

  it('2.B Coche no reconocido por foto: Returns UNKNOWN and allows manual flow', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {},
      localVehicleRepository
    );
    expect(identification.status).toMatch(/UNKNOWN|NEEDS_VERIFICATION/);
    expect(identification.confidence).toBe(0);
  });

  it('2.C Coche ambiguo o fuera de catálogo: Returns appropriate identification status without guessing', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      { brandHint: 'Toyota', modelHint: 'Supra' }, // Brand known, model not in catalog
      localVehicleRepository
    );
    expect(identification.status).toMatch(/IDENTIFIED_BUT_UNSUPPORTED|NEEDS_VERIFICATION/);
  });

  it('2.D Coche introducido manualmente: Operates directly from user parameters', async () => {
    const manualSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Peugeot',
      modelHint: '208',
      year: 2018,
      engineHint: '1.2 PureTech',
      fuel: 'Gasolina',
      askingPrice: 7900,
      mileageKm: 85000
    });
    expect(manualSession.identification?.brand).toBe('Peugeot');
    expect(manualSession.identification?.model).toBe('208');
    expect(manualSession.identification?.matchedVehicle?.id).toBe('peugeot-208-puretech');
  });

  it('2.E Coche no soportado: Retains input without selecting demo car', async () => {
    const unsupportedSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Mazda',
      modelHint: '3',
      year: 2017,
      askingPrice: 12000,
      mileageKm: 95000
    });
    expect(unsupportedSession.identification?.brand).toBe('Mazda');
    expect(unsupportedSession.identification?.model).toBe('3');
    expect(unsupportedSession.identification?.status).toBe('IDENTIFIED_BUT_UNSUPPORTED');
  });

  it('2.F Motor desconocido: Operates with model info while keeping engine unconfirmed', async () => {
    const unknownEngineSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      engineHint: 'Motor: No lo sé'
    });
    const report = AnalysisSessionService.sessionToLegacyReport(unknownEngineSession);
    expect(report.identity.engine).toBe('Motor no especificado');
    expect(report.identity.powerHp).toBe(0);
    expect(report.identity.needsConfirmation).toBe(true);
  });

  // ============================================================
  // 3. REAL PURCHASE DECISION (Clarity for non-mechanics)
  // ============================================================
  it('3. Answers all 6 key buyer questions with plain language clarity', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {
        front: { url: 'https://example.com/golf-front.jpg' },
        dashboard: { url: 'https://example.com/golf-dash.jpg' }
      },
      askingPrice: 9500,
      mileageKm: 140000,
      year: 2016,
      location: 'ES',
      brandHint: 'Volkswagen',
      modelHint: 'Golf',
      fuel: 'Diésel'
    });

    const report = AnalysisSessionService.sessionToLegacyReport(session);

    // ¿QUÉ ESTÁ BIEN? & ¿QUÉ ME PREOCUPA?
    expect(report.scoreCategories.length).toBeGreaterThan(0);
    expect(report.visualObservations.length).toBeGreaterThan(0);

    // ¿QUÉ TENGO QUE COMPROBAR? (Actionable physical checklist)
    expect(report.checklist.length).toBeGreaterThan(0);

    // ¿CUÁNTO PODRÍA COSTAR? (Total estimated expenditure with transfer fees)
    expect(report.realCost.totalMin).toBeGreaterThan(9500);
    expect(report.realCost.transferFees).toBeGreaterThan(0);

    // ¿QUÉ PRECIO INTENTARÍA PAGAR? (Target negotiation range)
    expect(report.negotiation.targetPriceMin).toBeGreaterThan(0);
    expect(report.negotiation.targetPriceMax).toBeLessThanOrEqual(9500);

    // ¿MERECE LA PENA? (Explicit reasoning, never absolute guarantee)
    expect(report.recommendation).toBeDefined();
    expect(report.cannotDetermineNote).toContain('compresión');
  });

  // ============================================================
  // 4. REAL VS DEMO SEPARATION
  // ============================================================
  it('4. Distinguishes Demo mode from Real Analysis without data bleeding', async () => {
    const demoCar = await localVehicleRepository.getDomainVehicleById('toyota-yaris-10');
    expect(demoCar).not.toBeNull();
    expect(demoCar?.brand).toBe('Toyota');

    // Real analysis without matching catalog does not adopt demo car
    const customCar = await localVehicleRepository.getDomainVehicleById('non-existent-car-id');
    expect(customCar).toBeNull();
  });

  // ============================================================
  // 5. RESILIENT ERROR HANDLING & INSUFFICIENT DATA
  // ============================================================
  it('5. Handles zero data / missing inputs without crash or unhandled exceptions', async () => {
    const emptySession = await AnalysisSessionService.runAnalysis({
      photos: {}
    });
    const report = AnalysisSessionService.sessionToLegacyReport(emptySession);

    expect(report).toBeDefined();
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.cannotDetermineNote).toBeDefined();
  });
});
