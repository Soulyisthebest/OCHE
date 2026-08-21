import { describe, it, expect, vi } from 'vitest';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { VehicleResolverService } from '../services/VehicleResolverService';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

describe('FASE 10 — Critical Identification Pipeline Debug', () => {
  it('Scenario 1: Supported Vehicle (Toyota Yaris) -> Resolver matches repository', async () => {
    const resolverResult = await VehicleResolverService.resolveVehicle({
      brandHint: 'Toyota',
      modelHint: 'Yaris',
      year: 2016,
      fuel: 'Gasolina'
    });

    expect(resolverResult.candidates.length).toBeGreaterThan(0);
    expect(resolverResult.bestMatch).toBeDefined();
    expect(resolverResult.bestMatch?.vehicleId).toBe('toyota-yaris-hybrid');

    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Toyota',
        modelHint: 'Yaris',
        year: 2016,
        fuel: 'Gasolina'
      },
      localVehicleRepository
    );

    expect(identification.brand).toBe('Toyota');
    expect(identification.model).toBe('Yaris');
    expect(identification.matchedVehicle).not.toBeNull();
    expect(identification.matchedVehicle?.id).toBe('toyota-yaris-10');
    expect(identification.candidates.length).toBeGreaterThan(0);
    expect(identification.candidates[0].vehicleId).toBe('toyota-yaris-10');
  });

  it('Scenario 2: Unsupported Vehicle (Ford Focus) -> IDENTIFIED_BUT_UNSUPPORTED without selecting demo cars', async () => {
    const resolverResult = await VehicleResolverService.resolveVehicle({
      brandHint: 'Ford',
      modelHint: 'Focus',
      year: 2019,
      fuel: 'Gasolina'
    });

    // Ford Focus is not in the canonical repository
    expect(resolverResult.candidates.length).toBe(0);
    expect(resolverResult.bestMatch).toBeNull();

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

    // Must NOT be Golf, Peugeot, Toyota, or BMW!
    expect(identification.brand).toBe('Ford');
    expect(identification.model).toBe('Focus');
    expect(identification.matchedVehicle).toBeNull();
    expect(identification.candidates.length).toBe(0);
  });

  it('Scenario 3: Low Confidence / Unknown Visual -> NEEDS_VERIFICATION / UNKNOWN without guessing', async () => {
    const identification = await VehicleIdentificationService.identifyVehicle(
      {},
      {},
      localVehicleRepository
    );

    expect(identification.matchedVehicle).toBeNull();
    expect(identification.confidence).toBe(0);
    expect(identification.candidates.length).toBe(0);
    expect(identification.brand).toBe('Vehículo No Identificado');
  });

  it('Pipeline Trace Integrity: Diagnostic logs must match schema', async () => {
    const logSpy = vi.spyOn(console, 'log');

    await VehicleIdentificationService.identifyVehicle(
      {},
      {
        brandHint: 'Peugeot',
        modelHint: '208',
        year: 2017
      },
      localVehicleRepository
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[OCHE_DIAGNOSTIC] resolverResult:'),
      expect.objectContaining({
        candidatesCount: expect.any(Number),
        candidateScores: expect.any(Array)
      })
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[OCHE_DIAGNOSTIC] repositoryResult:'),
      expect.objectContaining({
        searchedMake: 'Peugeot',
        searchedModel: '208'
      })
    );

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('[OCHE_DIAGNOSTIC] finalResult:'),
      expect.objectContaining({
        vehicleName: expect.stringContaining('Peugeot 208')
      })
    );

    logSpy.mockRestore();
  });
});
