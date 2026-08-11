import { describe, it, expect } from 'vitest';
import { DemoVehicleAdapter } from '../repositories/DemoVehicleAdapter';

describe('DemoVehicleAdapter (VehicleRepository)', () => {
  const repo = new DemoVehicleAdapter();

  it('fetches all demo vehicles', async () => {
    const vehicles = await repo.getAllVehicles();
    expect(vehicles.length).toBeGreaterThan(0);
  });

  it('fetches vehicle by ID', async () => {
    const vehicle = await repo.getVehicleById('golf-7-tdi');
    expect(vehicle).not.toBeNull();
    expect(vehicle?.report.identity.make).toBe('Volkswagen');
  });

  it('searches vehicles by keyword', async () => {
    const results = await repo.searchVehicles('Golf');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('golf-7-tdi');
  });
});
