import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { AnalysisSessionService } from '../services/AnalysisSessionService';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { VisualObservation, ModelProCon } from '../types';

describe('OCHE — PHASE 14.5 MANUAL VEHICLE IDENTIFICATION TESTS (1 – 14)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. MANUAL_FULL_IDENTIFICATION
  // =========================================================================
  it('1. MANUAL_FULL_IDENTIFICATION: Complete manual vehicle data is correctly parsed and preserved', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Volkswagen',
        modelHint: 'Golf',
        generationHint: 'VII',
        year: 2018,
        engineHint: '2.0 TDI',
        fuel: 'Diésel',
        powerHint: 150,
        transmission: 'Manual',
        trimHint: 'Sport',
        askingPrice: 12500,
        mileageKm: 145000
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Volkswagen');
    expect(identification.model).toBe('Golf');
    expect(identification.generation).toContain('VII');
    expect(identification.year).toBe(2018);
    expect(identification.engine).toContain('2.0 TDI');
    expect(identification.fuel).toBe('Diésel');
    expect(identification.power).toBe(150);
    expect(identification.transmission).toBe('Manual');
    expect(identification.matchedVehicle).not.toBeNull();
    expect(identification.matchedVehicle?.id).toBe('golf-7-tdi');
  });

  // =========================================================================
  // 2. MANUAL_PARTIAL_IDENTIFICATION
  // =========================================================================
  it('2. MANUAL_PARTIAL_IDENTIFICATION: Partial inputs without engine/power register clean default state', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Peugeot',
        modelHint: '208',
        year: 2019
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Peugeot');
    expect(identification.model).toBe('208');
    expect(identification.year).toBe(2019);
    expect(identification.isEngineKnown).toBe(false);
    expect(identification.engine).toBe('Motor no especificado');
    expect(identification.power).toBe(0);
  });

  // =========================================================================
  // 3. MANUAL_UNKNOWN_ENGINE
  // =========================================================================
  it('3. MANUAL_UNKNOWN_ENGINE: Explicitly unknown engine does not invent engine specifications', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Toyota',
        modelHint: 'Yaris',
        year: 2017,
        isEngineUnknown: true
      },
      localVehicleRepository
    );

    expect(identification.isEngineKnown).toBe(false);
    expect(identification.engine).toBe('Motor no especificado');
    expect(identification.power).toBe(0);
    expect(identification.brand).toBe('Toyota');
    expect(identification.model).toBe('Yaris');
  });

  // =========================================================================
  // 4. MANUAL_UNKNOWN_POWER
  // =========================================================================
  it('4. MANUAL_UNKNOWN_POWER: Engine provided without power keeps power unassigned without crash', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'BMW',
        modelHint: 'Serie 3',
        year: 2003,
        engineHint: '2.0d M47N',
        fuel: 'Diésel'
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('BMW');
    expect(identification.model).toBe('Serie 3');
    expect(identification.engine).toBe('2.0d M47N');
    expect(identification.fuel).toBe('Diésel');
    expect(identification.matchedVehicle).not.toBeNull();
  });

  // =========================================================================
  // 5. MANUAL_UNKNOWN_TRANSMISSION
  // =========================================================================
  it('5. MANUAL_UNKNOWN_TRANSMISSION: Unknown transmission operates cleanly without blocking', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Seat',
      modelHint: 'León',
      year: 2018,
      askingPrice: 11000,
      mileageKm: 98000
    });

    expect(session.identification?.brand).toBe('Seat');
    expect(session.identification?.model).toBe('León');
    expect(session.status).toBe('READY');
  });

  // =========================================================================
  // 6. MANUAL_UNKNOWN_GENERATION
  // =========================================================================
  it('6. MANUAL_UNKNOWN_GENERATION: Unspecified generation is gracefully handled', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Ford',
        modelHint: 'Focus',
        year: 2016
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Ford');
    expect(identification.model).toBe('Focus');
    expect(identification.generation).toBeDefined();
    expect(identification.status).toBe('IDENTIFIED_BUT_UNSUPPORTED');
  });

  // =========================================================================
  // 7. MANUAL_UNKNOWN_TRIM
  // =========================================================================
  it('7. MANUAL_UNKNOWN_TRIM: Omission of trim version does not degrade vehicle identification', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Volkswagen',
        modelHint: 'Golf',
        engineHint: '2.0 TDI',
        year: 2017
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Volkswagen');
    expect(identification.model).toBe('Golf');
    expect(identification.matchedVehicle?.id).toBe('golf-7-tdi');
  });

  // =========================================================================
  // 8. MANUAL_UNSUPPORTED_VEHICLE
  // =========================================================================
  it('8. MANUAL_UNSUPPORTED_VEHICLE: Unsupported car returns IDENTIFIED_BUT_UNSUPPORTED without fake defects', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Hyundai',
      modelHint: 'i30',
      year: 2020,
      askingPrice: 14000,
      mileageKm: 65000
    });

    expect(session.identification?.status).toBe('IDENTIFIED_BUT_UNSUPPORTED');
    expect(session.identification?.brand).toBe('Hyundai');
    expect(session.identification?.model).toBe('i30');
    expect(session.vehicle).toBeNull();
    expect(session.knownProblems.length).toBe(0);
  });

  // =========================================================================
  // 9. MANUAL_SUPPORTED_VEHICLE_MATCH
  // =========================================================================
  it('9. MANUAL_SUPPORTED_VEHICLE_MATCH: Supported vehicle correctly matches domain repository', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'BMW',
        modelHint: 'Serie 3',
        generationHint: 'E46',
        engineHint: '2.0d M47N',
        fuel: 'Diésel',
        year: 2003
      },
      localVehicleRepository
    );

    expect(identification.matchedVehicle).not.toBeNull();
    expect(identification.matchedVehicle?.id).toBe('bmw-e46-320d');
    expect(identification.matchedVehicle?.knownProblems.length).toBeGreaterThan(0);
  });

  // =========================================================================
  // 10. MANUAL_VS_AI_CONFLICT
  // =========================================================================
  it('10. MANUAL_VS_AI_CONFLICT: Flags contradiction between manual input and AI vision detection', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        report: {
          identity: {
            make: 'BMW',
            model: '320d',
            generation: 'F30',
            confidenceScore: 92
          }
        }
      })
    }) as any;

    const identification = await VehicleIdentificationService.identifyVehicle(
      { front: { url: 'https://example.com/bmw.jpg' } },
      {
        brandHint: 'Peugeot',
        modelHint: '208',
        year: 2018
      },
      localVehicleRepository
    );

    expect(identification.isContradictory).toBe(true);
    expect(identification.conflictingDetectedVehicle?.brand).toBe('BMW');
    expect(identification.brand).toBe('Peugeot');
    expect(identification.model).toBe('208');

    global.fetch = originalFetch;
  });

  // =========================================================================
  // 11. MANUAL_IDENTIFICATION_WITHOUT_PHOTOS
  // =========================================================================
  it('11. MANUAL_IDENTIFICATION_WITHOUT_PHOTOS: Runs full pipeline without any photos', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      year: 2016,
      engineHint: '1.0 VVT-i',
      askingPrice: 8200,
      mileageKm: 115000
    });

    expect(session.status).toBe('READY');
    expect(session.vehicle?.brand).toBe('Toyota');
    expect(session.vehicle?.model).toBe('Yaris');
    expect(session.costEstimate.askingPrice).toBe(8200);
    expect(session.costEstimate.totalMin).toBeGreaterThan(0);
  });

  // =========================================================================
  // 12. MANUAL_IDENTIFICATION_WITH_PHOTOS
  // =========================================================================
  it('12. MANUAL_IDENTIFICATION_WITH_PHOTOS: Combines photo slots with manual hints without collisions', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {
        front: { url: 'https://example.com/front.jpg' },
        back: { url: 'https://example.com/back.jpg' }
      },
      brandHint: 'Volkswagen',
      modelHint: 'Golf',
      year: 2015,
      engineHint: '2.0 TDI',
      askingPrice: 10500,
      mileageKm: 130000
    });

    expect(session.status).toBe('READY');
    expect(session.photos.length).toBe(2);
    expect(session.vehicle?.brand).toBe('Volkswagen');
    expect(session.vehicle?.model).toBe('Golf');
  });

  // =========================================================================
  // 13. MANUAL_IDENTIFICATION_DATA_SEPARATION
  // =========================================================================
  it('13. MANUAL_IDENTIFICATION_DATA_SEPARATION: Maintains strict separation between technical and economic layers', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Peugeot',
      modelHint: '208',
      year: 2017,
      askingPrice: 7900,
      mileageKm: 95000
    });

    // Technical attributes
    expect(session.identification?.brand).toBe('Peugeot');
    expect(session.identification?.model).toBe('208');
    expect(session.identification?.year).toBe(2017);

    // Economic attributes
    expect(session.askingPrice).toBe(7900);
    expect(session.mileage).toBe(95000);
    expect(session.costEstimate.askingPrice).toBe(7900);
    expect(session.costEstimate.totalMin).toBeGreaterThan(0);
  });

  // =========================================================================
  // 14. MANUAL_IDENTIFICATION_KNOWLEDGE_ISOLATION
  // =========================================================================
  it('14. MANUAL_IDENTIFICATION_KNOWLEDGE_ISOLATION: Ensures zero fabrication of endemic defects for unsupported cars', async () => {
    const session = await AnalysisSessionService.runAnalysis({
      photos: {},
      brandHint: 'Renault',
      modelHint: 'Clio',
      year: 2019,
      askingPrice: 10200,
      mileageKm: 80000
    });

    expect(session.vehicle).toBeNull();
    expect(session.knownProblems.length).toBe(0);

    const legacyReport = AnalysisSessionService.sessionToLegacyReport(session);
    expect(legacyReport.modelProsCons.length).toBe(0);
  });
});
