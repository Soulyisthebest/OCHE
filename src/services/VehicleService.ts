import { Vehicle, Part, KnownProblem, VehicleSystem, MaintenanceItem } from '../types/vehicleEngine';
import { VEHICLE_KNOWLEDGE_BASE } from '../data/vehicleKnowledgeDatabase';

export class VehicleService {
  private static vehicles: Vehicle[] = VEHICLE_KNOWLEDGE_BASE;

  /**
   * Get all registered vehicles in the knowledge base
   */
  static getAllVehicles(): Vehicle[] {
    return this.vehicles;
  }

  /**
   * Find vehicle by ID
   */
  static getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find((v) => v.id.toLowerCase() === id.toLowerCase());
  }

  /**
   * Find best matching vehicle by make, model, generation, and year
   */
  static findMatchingVehicle(
    make: string,
    model: string,
    year?: number,
    fuel?: string
  ): Vehicle | undefined {
    const cleanMake = make.trim().toLowerCase();
    const cleanModel = model.trim().toLowerCase();

    return this.vehicles.find((v) => {
      const matchBrand = v.brand.toLowerCase().includes(cleanMake) || cleanMake.includes(v.brand.toLowerCase());
      const matchModel = v.model.toLowerCase().includes(cleanModel) || cleanModel.includes(v.model.toLowerCase());

      let matchYear = true;
      if (year && v.yearFrom) {
        const toYear = typeof v.yearTo === 'number' ? v.yearTo : 2026;
        matchYear = year >= v.yearFrom && year <= toYear;
      }

      let matchFuel = true;
      if (fuel) {
        matchFuel = v.fuel.toLowerCase() === fuel.toLowerCase();
      }

      return matchBrand && matchModel && (matchYear || matchFuel);
    });
  }

  /**
   * Search knowledge base by query string
   */
  static searchVehicles(query: string): Vehicle[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.vehicles;

    return this.vehicles.filter((v) => {
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.generation.toLowerCase().includes(q) ||
        v.engine.name.toLowerCase().includes(q) ||
        (v.engine.code && v.engine.code.toLowerCase().includes(q))
      );
    });
  }

  /**
   * Get parts for a specific vehicle system
   */
  static getPartsBySystem(vehicleId: string, systemId: string): Part[] {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return [];

    return vehicle.parts.filter((p) => p.system.toLowerCase() === systemId.toLowerCase());
  }

  /**
   * Get known problems for a specific vehicle engine
   */
  static getKnownProblems(vehicleId: string): KnownProblem[] {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return [];

    return vehicle.knownProblems;
  }

  /**
   * Get maintenance schedule
   */
  static getMaintenanceSchedule(vehicleId: string): MaintenanceItem[] {
    const vehicle = this.getVehicleById(vehicleId);
    if (!vehicle) return [];

    return vehicle.maintenance;
  }
}
