import { describe, it, expect } from 'vitest';
import { LocalVehicleRepository } from '../repositories/LocalVehicleRepository';
import { VehicleResolverService } from '../services/VehicleResolverService';
import { VehicleDataImporter } from '../data/VehicleDataImporter';
import { STANDARD_VEHICLE_SYSTEMS_DEF } from '../data/globalVehicleDatabase';
import { StandardSystemType } from '../types/vehicleKnowledge';

describe('Global Vehicle Knowledge Core (FASE 5)', () => {
  const repo = new LocalVehicleRepository();

  describe('1. Ontological Completeness & 16 Standard Systems', () => {
    it('should define all 16 standard automotive systems without gaps', () => {
      const systems = Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[];
      expect(systems).toHaveLength(16);
      expect(systems).toContain('ENGINE');
      expect(systems).toContain('TRANSMISSION');
      expect(systems).toContain('BRAKES');
      expect(systems).toContain('SUSPENSION');
      expect(systems).toContain('STEERING');
      expect(systems).toContain('ELECTRICAL');
      expect(systems).toContain('COOLING');
      expect(systems).toContain('FUEL');
      expect(systems).toContain('EXHAUST');
      expect(systems).toContain('EMISSIONS');
      expect(systems).toContain('BODY');
      expect(systems).toContain('INTERIOR');
      expect(systems).toContain('SAFETY');
      expect(systems).toContain('AIR_CONDITIONING');
      expect(systems).toContain('TYRES');
      expect(systems).toContain('DRIVETRAIN');
    });

    it('should return systems from repository with localized names and descriptions', async () => {
      const systems = await repo.getVehicleSystems();
      expect(systems.length).toBe(16);
      const engineSystem = systems.find((s) => s.id === 'ENGINE');
      expect(engineSystem).toBeDefined();
      expect(engineSystem?.name).toContain('Motor');
    });
  });

  describe('2. Canonical Brands, Models & Engines', () => {
    it('should contain the 4 core canonical brands with aliases', async () => {
      const brands = await repo.getBrands();
      expect(brands.length).toBeGreaterThanOrEqual(4);

      const vw = brands.find((b) => b.brandId === 'brand-vw');
      expect(vw).toBeDefined();
      expect(vw?.officialName).toBe('Volkswagen');
      expect(vw?.aliases).toContain('VW');
      expect(vw?.countryOfOrigin).toBe('DE');

      const peugeot = brands.find((b) => b.brandId === 'brand-peugeot');
      expect(peugeot).toBeDefined();
      expect(peugeot?.aliases).toContain('PSA');

      const bmw = brands.find((b) => b.brandId === 'brand-bmw');
      expect(bmw).toBeDefined();
      expect(bmw?.aliases).toContain('Bimmer');
    });

    it('should retrieve engines with verified engine codes', async () => {
      const engines = await repo.getEngines();
      expect(engines.length).toBeGreaterThanOrEqual(4);

      const ea288 = engines.find((e) => e.engineId === 'eng-ea288-20tdi');
      expect(ea288).toBeDefined();
      expect(ea288?.family).toBe('EA288');
      const codes = ea288?.engineCodes.map((c) => (typeof c === 'string' ? c : c.engineCode));
      expect(codes).toContain('CRBC');
      expect(codes).toContain('CRLB');

      const puretech = engines.find((e) => e.engineId === 'eng-puretech-12-110');
      expect(puretech).toBeDefined();
      expect(puretech?.timingType).toBe('WetBelt');

      const bmwEngine = engines.find((e) => e.engineId === 'eng-bmw-n47-b47-320d');
      expect(bmwEngine).toBeDefined();
      const bmwCodes = bmwEngine?.engineCodes.map((c) => (typeof c === 'string' ? c : c.engineCode));
      expect(bmwCodes).toContain('N47D20');
      expect(bmwCodes).toContain('B47D20');
    });
  });

  describe('3. Known Problems, Maintenance & Repairs with Provenance', () => {
    it('should store known problems with severity, symptoms and estimated repair costs', async () => {
      const problems = await repo.getKnownProblems();
      expect(problems.length).toBeGreaterThanOrEqual(6);

      const wetBeltProblem = problems.find((p) => p.id === 'prob-peug-wetbelt');
      expect(wetBeltProblem).toBeDefined();
      expect(wetBeltProblem?.severity).toBe('critical');
      expect(wetBeltProblem?.estimatedRepair.currency).toBe('EUR');
      expect(wetBeltProblem?.estimatedRepair.expected).toBeGreaterThan(500);
      expect(wetBeltProblem?.sourceType).toBe('OFFICIAL');
      expect(wetBeltProblem?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should retrieve maintenance items with precise intervals and cost models', async () => {
      const items = await repo.getMaintenanceItems('eng-ea288-20tdi');
      expect(items.length).toBeGreaterThanOrEqual(2);

      const timingBelt = items.find((i) => i.id === 'maint-vw-timingbelt');
      expect(timingBelt).toBeDefined();
      expect(timingBelt?.intervalKm).toBe(150000);
      expect(timingBelt?.estimatedCost?.expected).toBeGreaterThan(300);
    });

    it('should retrieve structured repair procedures with parts and labor breakdown', async () => {
      const repairs = await repo.getRepairs();
      expect(repairs.length).toBeGreaterThanOrEqual(4);

      const n47Chain = repairs.find((r) => r.id === 'rep-bmw-timingchain-replacement');
      expect(n47Chain).toBeDefined();
      expect(n47Chain?.partsCost.expected).toBeGreaterThan(300);
      expect(n47Chain?.laborCost.expected).toBeGreaterThan(500);
      expect(n47Chain?.estimatedTimeHours).toBeGreaterThan(5);
    });
  });

  describe('4. Multi-Market Configurations', () => {
    it('should support multiple country markets for a single global vehicle', async () => {
      const markets = await repo.getMarketConfigurations('vcfg-golf7-20tdi-man');
      expect(markets.length).toBeGreaterThanOrEqual(3);

      const esMarket = markets.find((m) => m.countryCode === 'ES');
      expect(esMarket).toBeDefined();
      expect(esMarket?.localUnits.fuelEconomy).toBe('L/100km');
      expect(esMarket?.localSpecifications.dgtLabel).toBe('C (Verde)');

      const ukMarket = markets.find((m) => m.countryCode === 'UK');
      expect(ukMarket).toBeDefined();
      expect(ukMarket?.localUnits.distance).toBe('miles');
      expect(ukMarket?.localUnits.fuelEconomy).toBe('MPG (UK)');
      expect(ukMarket?.localUnits.currency).toBe('GBP');
    });
  });

  describe('5. Vehicle Resolver & Incomplete Search (Rules 17 & 18)', () => {
    it('should normalize brand aliases accurately', () => {
      const vw1 = VehicleResolverService.normalizeBrand('VW');
      expect(vw1?.officialName).toBe('Volkswagen');

      const vw2 = VehicleResolverService.normalizeBrand('Volkswagen AG');
      expect(vw2?.officialName).toBe('Volkswagen');

      const psa = VehicleResolverService.normalizeBrand('PSA');
      expect(psa?.officialName).toBe('Peugeot');

      const bimmer = VehicleResolverService.normalizeBrand('Bimmer');
      expect(bimmer?.officialName).toBe('BMW');
    });

    it('should resolve "Golf 2.0 TDI" with high confidence and matched engine', async () => {
      const res = await repo.resolveVehicle('Golf 2.0 TDI');
      expect(res.candidates.length).toBeGreaterThan(0);
      expect(res.isAmbiguous).toBe(false);
      expect(res.bestMatch).toBeDefined();
      expect(res.bestMatch?.model.name).toBe('Golf');
      expect(res.bestMatch?.engine.family).toBe('EA288');
      expect(res.bestMatch?.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('should resolve "Peugeot 208 PureTech" accurately', async () => {
      const res = await repo.resolveVehicle('Peugeot 208 PureTech');
      expect(res.bestMatch?.brand.officialName).toBe('Peugeot');
      expect(res.bestMatch?.model.name).toBe('208');
      expect(res.bestMatch?.engine.family).toBe('EB2 / PureTech');
    });

    it('should resolve engine code "CRBC" to Volkswagen Golf 2.0 TDI', async () => {
      const res = await repo.resolveVehicle({ engineCode: 'CRBC' });
      expect(res.candidates.length).toBeGreaterThan(0);
      const match = res.candidates.find((c) => c.matchedEngineCode === 'CRBC');
      expect(match).toBeDefined();
      expect(match?.brand.officialName).toBe('Volkswagen');
    });
  });

  describe('6. Data Importer Pipeline (Rule 24)', () => {
    it('should successfully import valid raw vehicle records from JSON', () => {
      const rawJson = JSON.stringify([
        {
          brand: 'Toyota',
          model: 'Corolla',
          generation: 'XII (E210)',
          yearFrom: 2019,
          engineName: '2.0 Hybrid Dynamic Force',
          fuel: 'Híbrido',
          powerHp: 184,
          transmission: 'CVT',
          source: 'Toyota Global Spec Sheet',
          confidence: 0.95
        }
      ]);

      const result = VehicleDataImporter.importFromJson(rawJson);
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.vehicles[0].brand.officialName).toBe('Toyota');
      expect(result.vehicles[0].model.name).toBe('Corolla');
      expect(result.vehicles[0].configuration.powerHp).toBe(184);
    });

    it('should handle malformed records gracefully without throwing', () => {
      const malformedJson = JSON.stringify([
        {
          brand: 'Unknown',
          // missing mandatory fields
        }
      ]);

      const result = VehicleDataImporter.importFromJson(malformedJson);
      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.errors.length).toBe(1);
    });
  });

  describe('7. Backward Compatibility for Existing Demo UI', () => {
    it('should retain access to legacy sample cars without breaking existing components', async () => {
      const legacyCars = await repo.getAllVehicles();
      expect(legacyCars.length).toBeGreaterThanOrEqual(4);

      const golf = await repo.getVehicleById('golf-7-tdi');
      expect(golf).toBeDefined();
      expect(golf?.name).toContain('Golf');

      const searchResults = await repo.searchVehicles('BMW');
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });
});
