import { SampleDemoCar } from '../data/sampleCars';

export interface VehicleRepository {
  /** Get all available demo/cached vehicles */
  getAllVehicles(): Promise<SampleDemoCar[]>;

  /** Get vehicle by unique identifier */
  getVehicleById(id: string): Promise<SampleDemoCar | null>;

  /** Search vehicles by query text (make, model, engine) */
  searchVehicles(query: string): Promise<SampleDemoCar[]>;
}
