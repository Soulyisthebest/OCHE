import { SampleDemoCar } from '../data/sampleCars';
import { Vehicle } from '../types/vehicleEngine';

export interface VehicleRepository {
  /** Get all structured domain vehicles */
  getAllDomainVehicles(): Promise<Vehicle[]>;

  /** Get domain vehicle by unique ID */
  getDomainVehicleById(id: string): Promise<Vehicle | null>;

  /** Search domain vehicles by brand, model, generation or engine */
  searchDomainVehicles(query: string): Promise<Vehicle[]>;

  /** Get all available demo/cached legacy vehicles (for existing UI) */
  getAllVehicles(): Promise<SampleDemoCar[]>;

  /** Get legacy vehicle by unique identifier */
  getVehicleById(id: string): Promise<SampleDemoCar | null>;

  /** Search legacy vehicles by query text */
  searchVehicles(query: string): Promise<SampleDemoCar[]>;
}
