import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { AnalysisSessionService } from '../services/AnalysisSessionService';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { VisualObservation, ModelProCon } from '../types';

describe('OCHE — PHASE 10.5 MANUAL IDENTIFICATION VALIDATION (Tests A – J)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==============================================
  // 1. TEST A — FOTO CORRECTA
  // ==============================================
  it('TEST A — FOTO CORRECTA: Identifies supported vehicle with candidates and requires user confirmation', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      { front: { url: 'https://example.com/yaris-front.jpg' } },
      {
        brandHint: 'Toyota',
        modelHint: 'Yaris',
        year: 2016,
        fuel: 'Gasolina',
        transmission: 'Manual'
      },
      localVehicleRepository
    );

    // Candidates must be present and matched with repository
    expect(identification.candidates.length).toBeGreaterThan(0);
    expect(identification.matchedVehicle).not.toBeNull();
    expect(identification.matchedVehicle?.brand).toBe('Toyota');
    expect(identification.matchedVehicle?.model).toBe('Yaris');
    expect(identification.status).toMatch(/CONFIRMED|NEEDS_VERIFICATION/);

    // In the session, candidate confirmation view is presented
    const session = await AnalysisSessionService.runAnalysis({
      photos: { front: { url: 'https://example.com/yaris-front.jpg' } },
      askingPrice: 8500,
      mileageKm: 110000,
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      year: 2016
    });

    const legacyReport = AnalysisSessionService.sessionToLegacyReport(session);
    expect(legacyReport.identity.make).toBe('Toyota');
    expect(legacyReport.identity.model).toBe('Yaris');
    expect(session.identification?.candidates.length).toBeGreaterThan(0);
  });

  // ==============================================
  // 2. TEST B — FOTO INCORRECTA
  // ==============================================
  it('TEST B — FOTO INCORRECTA: Ambiguous or unrecognized photo produces UNKNOWN / NEEDS_VERIFICATION', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {}, // Empty/ambiguous photo input
      {}, // No hints
      localVehicleRepository
    );

    expect(identification.status).toBe('UNKNOWN');
    expect(identification.confidence).toBe(0);
    expect(identification.matchedVehicle).toBeNull();
    expect(identification.brand).toBe('Vehículo No Identificado');
    expect(identification.model).toBe('Modelo Desconocido');
    expect(identification.candidates.length).toBe(0);
  });

  // ==============================================
  // 3. TEST C — IDENTIFICACIÓN MANUAL
  // ==============================================
  it('TEST C — IDENTIFICACIÓN MANUAL: User manual input overrides photo and correctly identifies vehicle', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {}, // Photo missing or failed
      {
        brandHint: 'Volkswagen',
        modelHint: 'Golf',
        year: 2015,
        engineHint: '2.0 TDI',
        fuel: 'Diésel',
        transmission: 'Manual'
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Volkswagen');
    expect(identification.model).toBe('Golf');
    expect(identification.fuel).toBe('Diésel');
    expect(identification.transmission).toBe('Manual');
    expect(identification.matchedVehicle).not.toBeNull();
    expect(identification.matchedVehicle?.id).toBe('golf-7-tdi');
  });

  // ==============================================
  // 4. TEST D — INFORMACIÓN PARCIAL
  // ==============================================
  it('TEST D — INFORMACIÓN PARCIAL: Partial input with unknown engine does NOT invent engine specifications', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Peugeot',
        modelHint: '208',
        year: 2017,
        engineHint: 'Motor: No lo sé'
      },
      localVehicleRepository
    );

    expect(identification.isEngineKnown).toBe(false);
    expect(identification.engine).toBe('Motor no especificado');
    expect(identification.power).toBe(0);
    expect(identification.brand).toBe('Peugeot');
    expect(identification.model).toBe('208');

    // In session to legacy report
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      askingPrice: 7900,
      mileageKm: 95000,
      brandHint: 'Peugeot',
      modelHint: '208',
      year: 2017,
      engineHint: 'Motor no especificado'
    });

    const legacyReport = AnalysisSessionService.sessionToLegacyReport(session);
    expect(legacyReport.identity.engine).toBe('Motor no especificado');
    expect(legacyReport.identity.powerHp).toBe(0);
    expect(legacyReport.identity.needsConfirmation).toBe(true);
  });

  // ==============================================
  // 5. TEST E — VEHÍCULO NO SOPORTADO
  // ==============================================
  it('TEST E — VEHÍCULO NO SOPORTADO: Unsupported vehicle returns IDENTIFIED_BUT_UNSUPPORTED without converting to demo cars', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Ford',
        modelHint: 'Focus',
        year: 2019,
        fuel: 'Gasolina'
      },
      localVehicleRepository
    );

    expect(identification.status).toBe('IDENTIFIED_BUT_UNSUPPORTED');
    expect(identification.brand).toBe('Ford');
    expect(identification.model).toBe('Focus');
    expect(identification.matchedVehicle).toBeNull();
    // Must NOT assign any demo car IDs
    expect(identification.candidates.length).toBe(0);
  });

  // ==============================================
  // 6. TEST F — FOTO CONTRADICTORIA
  // ==============================================
  it('TEST F — FOTO CONTRADICTORIA: Contradiction between manual input and photo detection is flagged', async () => {
    // Mock global fetch to simulate Gemini identifying a BMW Serie 3
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        report: {
          identity: {
            make: 'BMW',
            model: 'Serie 3',
            generation: 'F30',
            confidenceScore: 90,
            engine: '2.0 Diesel',
            fuelType: 'Diésel',
            powerHp: 150,
            transmission: 'Automático',
            estimatedYearMin: 2014,
            estimatedYearMax: 2018,
            needsConfirmation: true
          }
        }
      })
    }) as any;

    const identification = await VehicleIdentificationService.identifyVehicle(
      { front: { url: 'https://example.com/bmw.jpg' } },
      {
        brandHint: 'Toyota',
        modelHint: 'Yaris', // User selected Toyota Yaris, but photo is BMW
        year: 2016
      },
      localVehicleRepository
    );

    // Retains user's selection while flagging contradiction
    expect(identification.isContradictory).toBe(true);
    expect(identification.conflictingDetectedVehicle).toBeDefined();
    expect(identification.conflictingDetectedVehicle?.brand).toBe('BMW');
    expect(identification.conflictingDetectedVehicle?.model).toBe('Serie 3');
    expect(identification.brand).toBe('Toyota');
    expect(identification.model).toBe('Yaris');

    global.fetch = originalFetch;
  });

  // ==============================================
  // 7. TEST G — MODELO SIN MOTOR CONOCIDO
  // ==============================================
  it('TEST G — MODELO SIN MOTOR CONOCIDO: Operates with model info while keeping engine unconfirmed', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Toyota',
        modelHint: 'Yaris',
        year: 2016,
        engineHint: 'UNKNOWN'
      },
      localVehicleRepository
    );

    expect(identification.isEngineKnown).toBe(false);
    expect(identification.engine).toBe('Motor no especificado');
    expect(identification.power).toBe(0);
    expect(identification.brand).toBe('Toyota');
    expect(identification.model).toBe('Yaris');
  });

  // ==============================================
  // 8. TEST H — DATOS DE COMPRA
  // ==============================================
  it('TEST H — DATOS DE COMPRA: Purchase parameters remain strictly in economic layers', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      askingPrice: 12500,
      mileageKm: 85000,
      year: 2018,
      location: 'ES',
      brandHint: 'Volkswagen',
      modelHint: 'Golf'
    });

    // Economic fields reside in session / cost structures
    expect(session.askingPrice).toBe(12500);
    expect(session.mileage).toBe(85000);
    expect(session.location).toBe('ES');
    expect(session.costEstimate.askingPrice).toBe(12500);

    // Vehicle specifications remain independent
    expect(session.vehicle?.brand).toBe('Volkswagen');
    expect(session.vehicle?.model).toBe('Golf');
    expect(session.vehicle?.engine).toBeDefined();
    expect(session.vehicle?.fuel).toBe('Diésel');
  });

  // ==============================================
  // 9. TEST I — KNOWLEDGE ENGINE
  // ==============================================
  it('TEST I — KNOWLEDGE ENGINE: Real data for cataloged vehicles, zero fabrications for uncataloged', async () => {
    // 1. Cataloged vehicle (Toyota Yaris)
    const catalogedSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      askingPrice: 8000,
      mileageKm: 90000
    });
    expect(catalogedSession.vehicle?.knownProblems.length).toBeGreaterThan(0);
    const catalogedReport = AnalysisSessionService.sessionToLegacyReport(catalogedSession);
    expect(catalogedReport.modelProsCons.length).toBeGreaterThan(0);

    // 2. Uncataloged vehicle (Ford Focus)
    const uncatalogedSession = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Ford',
      modelHint: 'Focus',
      askingPrice: 9000,
      mileageKm: 120000
    });
    expect(uncatalogedSession.vehicle).toBeNull();
    expect(uncatalogedSession.knownProblems.length).toBe(0);
    const uncatalogedReport = AnalysisSessionService.sessionToLegacyReport(uncatalogedSession);
    expect(uncatalogedReport.modelProsCons.length).toBe(0);
  });

  // ==============================================
  // 10. TEST J — ANÁLISIS DE LA UNIDAD
  // ==============================================
  it('TEST J — ANÁLISIS DE LA UNIDAD: MODEL KNOWLEDGE and ACTUAL OBSERVATIONS are strictly separated', () => {
    const visualObs: VisualObservation[] = [
      {
        category: 'Exterior',
        part: 'Aleta delantera derecha',
        status: 'warning',
        title: 'Microarañazo superficial',
        description: 'Rayón de 3cm sin deformación de chapa'
      }
    ];

    const modelFlaws: ModelProCon[] = [
      {
        type: 'known_issue',
        title: 'Desgaste prematuro de correa bañada en aceite',
        description: 'Afecta a la serie de motores 1.2 PureTech fabricados entre 2014 y 2018',
        isModelGeneral: true
      }
    ];

    const categorized = EvidenceEngine.categorizeFindings(visualObs, modelFlaws, []);

    expect(categorized.observed.length).toBe(1);
    expect(categorized.observed[0].title).toBe('Microarañazo superficial');
    expect(categorized.observed[0].evidenceType).toBe('OBSERVED');
    expect(categorized.observed[0].source).toContain('Inspección fotográfica');

    expect(categorized.known.length).toBe(1);
    expect(categorized.known[0].title).toBe('Desgaste prematuro de correa bañada en aceite');
    expect(categorized.known[0].evidenceType).toBe('KNOWN');
    expect(categorized.known[0].source).toContain('Base de conocimiento técnico');
  });
});
