import { VehicleRepository } from './VehicleRepository';
import { SAMPLE_DEMO_CARS, SampleDemoCar } from '../data/sampleCars';

/**
 * Local static data adapter for Demo Mode (0 € cost)
 */
export class DemoVehicleAdapter implements VehicleRepository {
  async getAllVehicles(): Promise<SampleDemoCar[]> {
    return Promise.resolve([...SAMPLE_DEMO_CARS]);
  }

  async getVehicleById(id: string): Promise<SampleDemoCar | null> {
    const found = SAMPLE_DEMO_CARS.find((c) => c.id === id) || null;
    return Promise.resolve(found);
  }

  async searchVehicles(query: string): Promise<SampleDemoCar[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllVehicles();

    const filtered = SAMPLE_DEMO_CARS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.report.identity.make.toLowerCase().includes(q) ||
        c.report.identity.model.toLowerCase().includes(q) ||
        c.report.identity.engine.toLowerCase().includes(q)
    );

    return Promise.resolve(filtered);
  }
}

/** Singleton instance for application usage */
export const defaultVehicleRepository: VehicleRepository = new DemoVehicleAdapter();
