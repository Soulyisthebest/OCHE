/**
 * OCHE / CARCHECK AI — Vehicle Data Importer (FASE 5)
 * Standardized importer interface for ingesting raw JSON, CSV or external vehicle records
 * into strictly typed, normalized Global Vehicle entities with full provenance tracking.
 */

import {
  Brand,
  VehicleModel,
  VehicleGeneration,
  Engine,
  GlobalVehicleComposite,
  SourceType,
  StandardSystemType
} from '../types/vehicleKnowledge';
import { VehicleResolverService } from '../services/VehicleResolverService';
import { STANDARD_VEHICLE_SYSTEMS_DEF } from './globalVehicleDatabase';

export interface RawVehicleRecord {
  brand: string;
  model: string;
  generation?: string;
  yearFrom: number;
  yearTo?: number | null;
  engineName: string;
  engineCode?: string;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP' | 'GNC';
  powerHp: number;
  displacementCc?: number;
  transmission?: 'Manual' | 'Automatic' | 'DualClutch' | 'CVT';
  bodyStyle?: 'Hatchback' | 'Sedan' | 'Estate' | 'SUV' | 'Coupe';
  source?: string;
  sourceType?: SourceType;
  confidence?: number;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  vehicles: GlobalVehicleComposite[];
  errors: Array<{ index: number; error: string; rawData: any }>;
}

export class VehicleDataImporter {
  /**
   * Ingests JSON array of raw vehicle objects and transforms them into verified GlobalVehicleComposites.
   */
  static importFromJson(jsonString: string, defaultSourceType: SourceType = 'TECHNICAL'): ImportResult {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      failedCount: 0,
      vehicles: [],
      errors: []
    };

    let parsed: any[];
    try {
      parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }
    } catch (e: any) {
      return {
        success: false,
        importedCount: 0,
        failedCount: 1,
        vehicles: [],
        errors: [{ index: 0, error: `Invalid JSON syntax: ${e.message}`, rawData: jsonString }]
      };
    }

    parsed.forEach((record: RawVehicleRecord, index: number) => {
      try {
        if (!record.brand || !record.model || !record.yearFrom || !record.engineName || !record.powerHp) {
          throw new Error('Missing mandatory fields (brand, model, yearFrom, engineName, powerHp)');
        }

        const normalizedBrand: Brand = VehicleResolverService.normalizeBrand(record.brand) || {
          brandId: `brand-${record.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          officialName: record.brand.trim(),
          aliases: [record.brand.trim()],
          sourceType: record.sourceType || defaultSourceType,
          confidence: record.confidence || 0.7,
          isDemo: false,
          createdAt: new Date().toISOString(),
          dataVersion: '1.0'
        };

        const modelId = `model-${normalizedBrand.brandId}-${record.model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const normalizedModel: VehicleModel = {
          modelId,
          brandId: normalizedBrand.brandId,
          name: record.model.trim(),
          productionStartYear: record.yearFrom,
          productionEndYear: record.yearTo || null,
          sourceType: record.sourceType || defaultSourceType,
          confidence: record.confidence || 0.8,
          isDemo: false
        };

        const generationId = `gen-${modelId}-${record.generation ? record.generation.toLowerCase().replace(/[^a-z0-9]/g, '-') : record.yearFrom}`;
        const normalizedGeneration: VehicleGeneration = {
          generationId,
          modelId,
          generationName: record.generation || `${record.model} (${record.yearFrom})`,
          yearFrom: record.yearFrom,
          yearTo: record.yearTo || null,
          bodyStyles: [record.bodyStyle || 'Hatchback'],
          availableEngineIds: [`eng-${generationId}-std`],
          availableTransmissionOptions: [record.transmission || 'Manual'],
          markets: ['EUROPE'],
          sourceType: record.sourceType || defaultSourceType,
          confidence: record.confidence || 0.8,
          isDemo: false
        };

        const engineId = `eng-${generationId}-${record.engineName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        const normalizedEngine: Engine = {
          engineId,
          manufacturer: normalizedBrand.officialName,
          family: record.engineName,
          name: record.engineName,
          engineCodes: record.engineCode ? [record.engineCode] : [],
          displacementCc: record.displacementCc || 1995,
          cylinders: 4,
          fuel: record.fuel || 'Gasolina',
          aspiration: 'NaturallyAspirated',
          powerHp: record.powerHp,
          transmissionOptions: [record.transmission || 'Manual'],
          timingType: 'Belt',
          productionYears: { from: record.yearFrom, to: record.yearTo || null },
          knownProblemIds: [],
          maintenanceIds: [],
          sourceType: record.sourceType || defaultSourceType,
          confidence: record.confidence || 0.8,
          isDemo: false
        };

        const vehicleConfigId = `vcfg-${generationId}-${engineId}`;

        const composite: GlobalVehicleComposite = {
          id: `${normalizedBrand.officialName.toLowerCase()}-${record.model.toLowerCase()}-${record.yearFrom}`.replace(/[^a-z0-9-]/g, '-'),
          brand: normalizedBrand,
          model: normalizedModel,
          generation: normalizedGeneration,
          engine: normalizedEngine,
          configuration: {
            vehicleConfigurationId: vehicleConfigId,
            brandId: normalizedBrand.brandId,
            modelId,
            generationId,
            engineId,
            transmission: record.transmission || 'Manual',
            fuel: record.fuel || 'Gasolina',
            bodyStyle: record.bodyStyle || 'Hatchback',
            powerHp: record.powerHp,
            productionYears: { from: record.yearFrom, to: record.yearTo || null },
            systemIds: Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[],
            partIds: [],
            knownProblemIds: [],
            maintenanceIds: [],
            repairIds: [],
            marketIds: []
          },
          marketConfigurations: [],
          systems: (Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[]).map((sysId) => ({
            id: sysId,
            name: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].name,
            description: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].description,
            parts: [],
            knownProblems: [],
            maintenance: [],
            repairs: []
          })),
          parts: [],
          knownProblems: [],
          maintenance: [],
          repairs: [],
          source: record.source || 'VehicleDataImporter Ingestion Pipeline',
          sourceType: record.sourceType || defaultSourceType,
          confidence: record.confidence || 0.85,
          isDemo: false,
          dataVersion: '1.0'
        };

        result.vehicles.push(composite);
        result.importedCount++;
      } catch (err: any) {
        result.failedCount++;
        result.errors.push({ index, error: err.message || String(err), rawData: record });
      }
    });

    result.success = result.failedCount === 0;
    return result;
  }
}
