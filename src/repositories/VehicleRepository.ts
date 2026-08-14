import { SampleDemoCar } from '../data/sampleCars';
import { Vehicle } from '../types/vehicleEngine';
import { CountryCode, MarketCode, VehicleMarketVersion } from '../types/country';

export interface VehicleRepository {
  /** Get all structured domain vehicles */
  getAllDomainVehicles(): Promise<Vehicle[]>;

  /** Get domain vehicle by unique ID */
  getDomainVehicleById(id: string): Promise<Vehicle | null>;

  /** Search domain vehicles by brand, model, generation or engine */
  searchDomainVehicles(query: string): Promise<Vehicle[]>;

  /** Filter vehicles by Country Code */
  findByCountry(countryCode: CountryCode): Promise<Vehicle[]>;

  /** Filter vehicles by Market Region */
  findByMarket(market: MarketCode): Promise<Vehicle[]>;

  /** Find vehicles by brand */
  findByBrand(brand: string): Promise<Vehicle[]>;

  /** Find vehicles by brand and model */
  findByModel(brand: string, model: string): Promise<Vehicle[]>;

  /** Find vehicles by brand, model and generation */
  findByGeneration(brand: string, model: string, generation: string): Promise<Vehicle[]>;

  /** Find vehicles by engine */
  findByEngine(brand: string, model: string, engineName: string): Promise<Vehicle[]>;

  /** Find specific country market version of vehicle */
  findByMarketVersion(countryCode: CountryCode, globalVehicleId: string): Promise<VehicleMarketVersion | null>;

  /** Get all available demo/cached legacy vehicles (for existing UI) */
  getAllVehicles(): Promise<SampleDemoCar[]>;

  /** Get legacy vehicle by unique identifier */
  getVehicleById(id: string): Promise<SampleDemoCar | null>;

  /** Search legacy vehicles by query text */
  searchVehicles(query: string): Promise<SampleDemoCar[]>;
}
