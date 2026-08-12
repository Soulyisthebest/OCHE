import { describe, it, expect } from 'vitest';
import { LocalVehicleRepository } from '../repositories/LocalVehicleRepository';

describe('CARCHECK AI — Motor de Conocimiento de Vehículos (Knowledge Engine)', () => {
  const repo = new LocalVehicleRepository();

  it('1. Los 4 vehículos demo existen en el repositorio', async () => {
    const vehicles = await repo.getAllDomainVehicles();
    expect(vehicles.length).toBe(4);

    const brands = vehicles.map((v) => v.brand);
    expect(brands).toContain('Volkswagen');
    expect(brands).toContain('BMW');
    expect(brands).toContain('Peugeot');
    expect(brands).toContain('Toyota');
  });

  it('2. Cada vehículo tiene un motor asignado con especificaciones', async () => {
    const vehicles = await repo.getAllDomainVehicles();

    vehicles.forEach((vehicle) => {
      expect(vehicle.engine).toBeDefined();
      expect(vehicle.engine.name).toBeTruthy();
      expect(vehicle.engine.fuel).toBeTruthy();
      expect(vehicle.engine.powerHp).toBeGreaterThan(0);
    });
  });

  it('3. Cada vehículo puede tener problemas conocidos registrados', async () => {
    const vehicles = await repo.getAllDomainVehicles();

    vehicles.forEach((vehicle) => {
      expect(Array.isArray(vehicle.knownProblems)).toBe(true);
      expect(vehicle.knownProblems.length).toBeGreaterThan(0);
      expect(vehicle.knownProblems[0].title).toBeTruthy();
      expect(vehicle.knownProblems[0].severity).toBeTruthy();
    });
  });

  it('4. Las piezas están relacionadas con sistemas del vehículo', async () => {
    const vehicles = await repo.getAllDomainVehicles();

    vehicles.forEach((vehicle) => {
      expect(Array.isArray(vehicle.systems)).toBe(true);
      expect(vehicle.systems.length).toBeGreaterThan(0);

      const systemIds = vehicle.systems.map((s) => s.id);

      vehicle.parts.forEach((part) => {
        expect(part.system).toBeTruthy();
        expect(systemIds).toContain(part.system);
        expect(part.newPriceRange.min).toBeGreaterThanOrEqual(0);
      });
    });
  });

  it('5. VehicleRepository puede buscar por marca o modelo', async () => {
    const vwResults = await repo.searchDomainVehicles('Volkswagen');
    expect(vwResults.length).toBe(1);
    expect(vwResults[0].model).toBe('Golf');

    const peugResults = await repo.searchDomainVehicles('Peugeot');
    expect(peugResults.length).toBe(1);
    expect(peugResults[0].model).toBe('208');

    const yarisResults = await repo.searchDomainVehicles('Yaris');
    expect(yarisResults.length).toBe(1);
    expect(yarisResults[0].brand).toBe('Toyota');
  });

  it('6. Un vehículo puede recuperarse por su ID único', async () => {
    const golf = await repo.getDomainVehicleById('golf-7-tdi');
    expect(golf).not.toBeNull();
    expect(golf?.brand).toBe('Volkswagen');
    expect(golf?.model).toBe('Golf');
    expect(golf?.engine.code).toBe('EA288');

    const peugeot = await repo.getDomainVehicleById('peugeot-208-puretech');
    expect(peugeot).not.toBeNull();
    expect(peugeot?.brand).toBe('Peugeot');
    expect(peugeot?.engine.code).toBe('EB2');

    const nonExistent = await repo.getDomainVehicleById('non-existent-car');
    expect(nonExistent).toBeNull();
  });
});
