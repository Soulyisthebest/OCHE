/**
 * OCHE / CARCHECK AI — Vehicle Context Builder (FASE 8: Single Source of Truth)
 * Dynamically builds structured automotive grounding context from VehicleRepository
 * for Gemini multimodal models, eliminating hardcoded car trivia in prompts.
 */

import {
  GlobalVehicleComposite,
  Engine,
  KnownProblem,
  MaintenanceItem,
  VehicleSystem,
  Part,
  Repair,
  MarketConfiguration
} from '../types/vehicleKnowledge';
import { Vehicle } from '../types/vehicleEngine';
import { CountryProfile } from '../types/country';
import { CountryEngine } from './CountryEngine';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

export interface VehicleContextParams {
  vehicle?: Vehicle | GlobalVehicleComposite | null;
  engine?: Engine | null;
  marketConfig?: MarketConfiguration | null;
  countryProfile?: CountryProfile | null;
  knownProblems?: KnownProblem[];
  maintenanceItems?: MaintenanceItem[];
  systems?: VehicleSystem[];
  parts?: Part[];
  repairs?: Repair[];
  mileageKm?: number;
  askingPrice?: number;
}

export class VehicleContextBuilder {
  /**
   * Builds dynamic grounding prompt context for Gemini from repository domain entities.
   */
  static buildDynamicPromptContext(params: VehicleContextParams): string {
    const {
      vehicle,
      engine,
      marketConfig,
      countryProfile,
      knownProblems = [],
      maintenanceItems = [],
      parts = [],
      repairs = [],
      mileageKm,
      askingPrice
    } = params;

    const country = countryProfile || CountryEngine.getActiveCountryProfile();
    const currency = country.currencySymbol || country.currency || '€';

    const sections: string[] = [];

    sections.push(`=== BASE DE CONOCIMIENTO TÉCNICA GROUNDED (FUENTE ÚNICA DE VERDAD: VEHICLE REPOSITORY) ===`);

    if (vehicle) {
      const brand = 'brand' in vehicle && typeof vehicle.brand === 'object' ? vehicle.brand.officialName : (vehicle as Vehicle).brand;
      const model = 'model' in vehicle && typeof vehicle.model === 'object' ? vehicle.model.name : (vehicle as Vehicle).model;
      const gen = 'generation' in vehicle && typeof vehicle.generation === 'object' ? vehicle.generation.generationName : (vehicle as Vehicle).generation;
      const engineName = engine ? engine.name : ('engine' in vehicle ? (typeof vehicle.engine === 'object' ? vehicle.engine.name : String(vehicle.engine)) : 'Desconocido');
      const codes = engine?.engineCodes
        ? engine.engineCodes.map((c) => typeof c === 'string' ? c : c.engineCode).join(', ')
        : ('engine' in vehicle && (vehicle as Vehicle).engine?.code ? (vehicle as Vehicle).engine.code : 'N/D');

      sections.push(`VEHÍCULO DETECTADO / SELECCIONADO:
- Marca: ${brand}
- Modelo: ${model}
- Generación: ${gen}
- Motorización: ${engineName}
- Códigos de Motor Técnicos: ${codes}
- Mercado / País: ${country.countryName} (${country.countryCode}) — Moneda: ${currency}`);
    } else {
      sections.push(`VEHÍCULO: No especificado a priori. Identifica candidatos objetivos a partir de las fotos.`);
    }

    if (marketConfig) {
      sections.push(`CONFIGURACIÓN DE MERCADO:
- Nombre de versión: ${marketConfig.trimNames?.join(', ') || marketConfig.marketName || 'Estándar'}
- Nombre comercial: ${marketConfig.modelName || 'Estándar'}`);
    }

    if (knownProblems && knownProblems.length > 0) {
      const flawsFormatted = knownProblems.map((kp) => {
        const costStr = kp.estimatedRepair ? `[Estimado: ${kp.estimatedRepair.minimum} - ${kp.estimatedRepair.maximum} ${currency}]` : '';
        return `  * ${kp.title} (Severidad: ${kp.severity}) ${costStr}: ${kp.description}`;
      }).join('\n');
      sections.push(`PUNTOS DÉBILES Y AVERÍAS ENDÉMICAS CONOCIDAS DEL MODELO/MOTOR (REGLA: Trátalos como "KNOWN", NO como observados en este coche a menos que haya evidencia visual directa):\n${flawsFormatted}`);
    }

    if (maintenanceItems && maintenanceItems.length > 0) {
      const maintFormatted = maintenanceItems.map((m) => {
        const intervalMonthsStr = m.intervalMonths ? `${Math.round(m.intervalMonths / 12)} años` : 'N/D';
        return `  * ${m.item} cada ${m.intervalKm?.toLocaleString('es-ES') || 'N/D'} km o ${intervalMonthsStr}: ${m.notes || ''}`;
      }).join('\n');
      sections.push(`PLAN DE MANTENIMIENTO TÉCNICO:\n${maintFormatted}`);
    }

    if (parts && parts.length > 0) {
      const partsSummary = parts.slice(0, 10).map((p) => `  * ${p.name} (Sistema: ${p.systemId}): ${p.function || p.description}`).join('\n');
      sections.push(`COMPONENTES CLAVE A INSPECCIONAR:\n${partsSummary}`);
    }

    if (repairs && repairs.length > 0) {
      const repSummary = repairs.slice(0, 8).map((r) => `  * ${r.description}: Pieza nueva ~${r.partsCost.minimum}-${r.partsCost.maximum} ${currency}, Mano de obra ~${r.estimatedTimeHours}h`).join('\n');
      sections.push(`BAREMO DE REPARACIONES Y RECAMBIOS:\n${repSummary}`);
    }

    sections.push(`DATOS APORTADOS POR EL USUARIO:
- Kilómetros: ${mileageKm ? `${mileageKm.toLocaleString('es-ES')} km` : 'No especificados'}
- Precio pedido: ${askingPrice ? `${askingPrice.toLocaleString('es-ES')} ${currency}` : 'No especificado'}`);

    return sections.join('\n\n');
  }

  /**
   * Helper to build full context asynchronously from a vehicle ID or candidate query
   */
  static async buildContextForVehicle(vehicleId: string, mileageKm?: number, askingPrice?: number): Promise<string> {
    const composite = await localVehicleRepository.getGlobalVehicleById(vehicleId);
    const domainVehicle = await localVehicleRepository.getDomainVehicleById(vehicleId);
    const vehicle = composite || domainVehicle;

    let engine: Engine | null = null;
    if (composite?.engine) {
      engine = composite.engine;
    }

    const engineCodeOrId = engine?.engineId || domainVehicle?.engine.code || domainVehicle?.engine.name;
    const knownProblems = await localVehicleRepository.getKnownProblems(engineCodeOrId);
    const maintenanceItems = await localVehicleRepository.getMaintenanceItems(engine?.engineId);
    const systems = await localVehicleRepository.getVehicleSystems(vehicleId);
    const parts = await localVehicleRepository.getParts();

    return this.buildDynamicPromptContext({
      vehicle,
      engine,
      knownProblems,
      maintenanceItems,
      systems,
      parts,
      mileageKm,
      askingPrice
    });
  }
}
