import { VehicleRepository } from './VehicleRepository';
import { Vehicle } from '../types/vehicleEngine';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';
import { VEHICLE_KNOWLEDGE_BASE } from '../data/vehicleKnowledgeDatabase';

/**
 * LocalVehicleRepository (FASE 2: Knowledge Engine)
 * Implements VehicleRepository for local 0 € Demo Mode.
 */
export class LocalVehicleRepository implements VehicleRepository {
  private vehicles: Vehicle[] = VEHICLE_KNOWLEDGE_BASE;
  private demoCars: SampleDemoCar[] = SAMPLE_DEMO_CARS;

  // Domain Vehicle Methods
  async getAllDomainVehicles(): Promise<Vehicle[]> {
    return Promise.resolve([...this.vehicles]);
  }

  async getDomainVehicleById(id: string): Promise<Vehicle | null> {
    const found = this.vehicles.find(
      (v) => v.id.toLowerCase() === id.toLowerCase()
    ) || null;
    return Promise.resolve(found);
  }

  async searchDomainVehicles(query: string): Promise<Vehicle[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllDomainVehicles();

    const filtered = this.vehicles.filter(
      (v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.generation.toLowerCase().includes(q) ||
        v.engine.name.toLowerCase().includes(q) ||
        (v.engine.code && v.engine.code.toLowerCase().includes(q))
    );

    return Promise.resolve(filtered);
  }

  // Legacy SampleDemoCar Methods (for existing UI compatibility)
  async getAllVehicles(): Promise<SampleDemoCar[]> {
    return Promise.resolve([...this.demoCars]);
  }

  async getVehicleById(id: string): Promise<SampleDemoCar | null> {
    const found = this.demoCars.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
    return Promise.resolve(found);
  }

  async searchVehicles(query: string): Promise<SampleDemoCar[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllVehicles();

    const filtered = this.demoCars.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.report.identity.make.toLowerCase().includes(q) ||
        c.report.identity.model.toLowerCase().includes(q) ||
        c.report.identity.engine.toLowerCase().includes(q)
    );

    return Promise.resolve(filtered);
  }
}

/** Default repository instance */
export const localVehicleRepository = new LocalVehicleRepository();
