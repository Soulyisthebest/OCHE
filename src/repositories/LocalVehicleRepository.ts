import { VehicleRepository } from './VehicleRepository';
import { Vehicle } from '../types/vehicleEngine';
import { SampleDemoCar, SAMPLE_DEMO_CARS } from '../data/sampleCars';
import { VEHICLE_KNOWLEDGE_BASE } from '../data/vehicleKnowledgeDatabase';
import { CountryCode, MarketCode, VehicleMarketVersion } from '../types/country';
import { COUNTRIES_DATA } from '../data/countries';

/**
 * LocalVehicleRepository (FASE 4: Global Vehicle Platform)
 * Implements VehicleRepository for multi-market and multi-country querying.
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

  async findByCountry(countryCode: CountryCode): Promise<Vehicle[]> {
    const profile = COUNTRIES_DATA[countryCode];
    if (!profile) return this.getAllDomainVehicles();
    return this.findByMarket(profile.market);
  }

  async findByMarket(market: MarketCode): Promise<Vehicle[]> {
    // In our multi-market architecture, return vehicles tailored or compatible with that market
    const all = await this.getAllDomainVehicles();
    if (market === 'EUROPE') {
      return all.filter((v) => ['Volkswagen', 'Peugeot', 'Renault', 'BMW', 'Toyota', 'Ford'].includes(v.brand));
    } else if (market === 'NORTH_AMERICA') {
      return all.filter((v) => ['Ford', 'Toyota', 'Volkswagen', 'BMW'].includes(v.brand));
    } else if (market === 'MENA') {
      return all.filter((v) => ['Renault', 'Peugeot', 'Volkswagen', 'Toyota'].includes(v.brand));
    } else if (market === 'ASIA_PACIFIC') {
      return all.filter((v) => ['Toyota', 'BMW', 'Volkswagen'].includes(v.brand));
    }
    return all;
  }

  async findByBrand(brand: string): Promise<Vehicle[]> {
    const b = brand.toLowerCase().trim();
    return this.vehicles.filter((v) => v.brand.toLowerCase() === b);
  }

  async findByModel(brand: string, model: string): Promise<Vehicle[]> {
    const b = brand.toLowerCase().trim();
    const m = model.toLowerCase().trim();
    return this.vehicles.filter(
      (v) => v.brand.toLowerCase() === b && v.model.toLowerCase() === m
    );
  }

  async findByGeneration(brand: string, model: string, generation: string): Promise<Vehicle[]> {
    const b = brand.toLowerCase().trim();
    const m = model.toLowerCase().trim();
    const g = generation.toLowerCase().trim();
    return this.vehicles.filter(
      (v) =>
        v.brand.toLowerCase() === b &&
        v.model.toLowerCase() === m &&
        v.generation.toLowerCase().includes(g)
    );
  }

  async findByEngine(brand: string, model: string, engineName: string): Promise<Vehicle[]> {
    const b = brand.toLowerCase().trim();
    const m = model.toLowerCase().trim();
    const e = engineName.toLowerCase().trim();
    return this.vehicles.filter(
      (v) =>
        v.brand.toLowerCase() === b &&
        v.model.toLowerCase() === m &&
        (v.engine.name.toLowerCase().includes(e) || (v.engine.code && v.engine.code.toLowerCase().includes(e)))
    );
  }

  async findByMarketVersion(countryCode: CountryCode, globalVehicleId: string): Promise<VehicleMarketVersion | null> {
    const vehicle = await this.getDomainVehicleById(globalVehicleId);
    if (!vehicle) return null;

    const profile = COUNTRIES_DATA[countryCode] || COUNTRIES_DATA.ES;

    let powerUnit: 'CV' | 'HP' | 'kW' | 'PS' = 'CV';
    let powerConverted = vehicle.engine.powerHp;

    if (profile.market === 'NORTH_AMERICA') {
      powerUnit = 'HP';
      powerConverted = Math.round(vehicle.engine.powerHp * 0.986);
    } else if (countryCode === 'DE') {
      powerUnit = 'PS';
    } else if (countryCode === 'UK') {
      powerUnit = 'HP';
    }

    return {
      globalVehicleId: vehicle.id,
      countryCode,
      market: profile.market,
      marketSpecificModel: vehicle.model,
      marketSpecificTrim: `${vehicle.generation} Standard`,
      powerUnit,
      powerConverted,
      emissionsStandard: profile.market === 'EUROPE' ? 'Euro 6 / Euro 5' : profile.market === 'NORTH_AMERICA' ? 'EPA Tier 3 / CARB' : 'Regional Standard',
      obdStandard: profile.market === 'NORTH_AMERICA' ? 'OBD-II' : 'EOBD',
      regulatoryBody: profile.inspectionSystem.governingBody,
      commonEngineCodes: vehicle.engine.code ? [vehicle.engine.code] : ['GEN-STD']
    };
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
