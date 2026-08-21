/**
 * OCHE / CARCHECK AI — Vehicle Resolver & Search Engine (FASE 5)
 * Handles vehicle resolution from incomplete text/hints, brand alias normalization,
 * generation matching, engine code resolution, and multi-market disambiguation.
 */

import {
  Brand,
  VehicleModel,
  VehicleGeneration,
  Engine,
  MarketConfiguration,
  GlobalVehicleComposite,
  EngineCodeDetail
} from '../types/vehicleKnowledge';
import {
  GLOBAL_BRANDS,
  GLOBAL_MODELS,
  GLOBAL_GENERATIONS,
  GLOBAL_ENGINES,
  CANONICAL_GLOBAL_VEHICLES,
  GLOBAL_MARKET_CONFIGURATIONS
} from '../data/globalVehicleDatabase';

export interface PartialVehicleInput {
  text?: string;
  brandHint?: string;
  modelHint?: string;
  generationHint?: string;
  engineHint?: string;
  engineCode?: string;
  year?: number;
  fuel?: string;
  transmission?: string;
  countryCode?: string;
}

export interface VehicleResolutionCandidate {
  vehicleId: string;
  brand: Brand;
  model: VehicleModel;
  generation: VehicleGeneration;
  engine: Engine;
  marketConfig?: MarketConfiguration;
  matchedEngineCode?: string;
  confidence: number;
  matchScore: number;
  matchReasons: string[];
  faceliftApplied?: string;
  isExactMatch: boolean;
}

export interface VehicleResolutionResult {
  inputQuery: string;
  candidates: VehicleResolutionCandidate[];
  bestMatch: VehicleResolutionCandidate | null;
  isAmbiguous: boolean;
  ambiguityReason?: string;
  normalizedBrand?: Brand;
  normalizedModel?: VehicleModel;
}

export class VehicleResolverService {
  /**
   * Normalize brand using official names and brand aliases (e.g. "VW" -> "Volkswagen")
   */
  static normalizeBrand(brandInput: string): Brand | null {
    if (!brandInput) return null;
    const clean = brandInput.trim().toLowerCase();

    for (const b of GLOBAL_BRANDS) {
      if (b.officialName.toLowerCase() === clean) return b;
      if (b.aliases.some((a) => a.toLowerCase() === clean || clean.includes(a.toLowerCase()))) {
        return b;
      }
    }
    return null;
  }

  /**
   * Find vehicle model by name or alias under a brand
   */
  static findModel(brandId: string, modelInput: string): VehicleModel | null {
    if (!modelInput) return null;
    const clean = modelInput.trim().toLowerCase();

    const models = GLOBAL_MODELS.filter((m) => m.brandId === brandId);
    for (const m of models) {
      if (m.name.toLowerCase() === clean || clean.includes(m.name.toLowerCase())) {
        return m;
      }
      if (m.aliases && m.aliases.some((a) => a.toLowerCase() === clean || clean.includes(a.toLowerCase()))) {
        return m;
      }
    }
    return null;
  }

  /**
   * Resolves vehicle candidate matches from free text or structured partial input.
   * Never silently guesses when multiple valid candidates exist.
   */
  static async resolveVehicle(
    input: string | PartialVehicleInput,
    countryCode = 'ES'
  ): Promise<VehicleResolutionResult> {
    const parsedInput: PartialVehicleInput =
      typeof input === 'string' ? this.parseFreeformText(input) : { ...input };

    const queryText = typeof input === 'string' ? input : (input.text || `${input.brandHint || ''} ${input.modelHint || ''} ${input.year || ''}`).trim();

    // 1. Identify Brand & Model
    let brand: Brand | null = parsedInput.brandHint ? this.normalizeBrand(parsedInput.brandHint) : null;
    let model: VehicleModel | null = null;

    if (!brand && typeof input === 'string') {
      for (const b of GLOBAL_BRANDS) {
        const textLower = input.toLowerCase();
        if (textLower.includes(b.officialName.toLowerCase()) || b.aliases.some((a) => textLower.includes(a.toLowerCase()))) {
          brand = b;
          break;
        }
      }
    }

    if (brand && parsedInput.modelHint) {
      model = this.findModel(brand.brandId, parsedInput.modelHint);
    } else if (brand && typeof input === 'string') {
      model = this.findModel(brand.brandId, input);
    }

    // 2. Score all known vehicle composites
    const candidates: VehicleResolutionCandidate[] = [];

    for (const veh of CANONICAL_GLOBAL_VEHICLES) {
      let score = 0;
      const reasons: string[] = [];
      let matchedCode: string | undefined = undefined;

      // Brand matching (Strict prior: if brand is provided, mismatch must be discarded)
      if (brand) {
        if (veh.brand.brandId === brand.brandId) {
          score += 35;
          reasons.push(`Marca coincidente: ${veh.brand.officialName}`);
        } else {
          // Incompatible brand -> Discard
          continue;
        }
      } else if (parsedInput.brandHint) {
        if (veh.brand.officialName.toLowerCase().includes(parsedInput.brandHint.toLowerCase())) {
          score += 30;
          reasons.push(`Marca inferida: ${veh.brand.officialName}`);
        } else {
          // Incompatible brand -> Discard
          continue;
        }
      }

      // Model matching (Strict prior: if model is provided, mismatch must be discarded)
      if (model) {
        if (veh.model.modelId === model.modelId) {
          score += 30;
          reasons.push(`Modelo coincidente: ${veh.model.name}`);
        } else {
          // Incompatible model -> Discard
          continue;
        }
      } else if (parsedInput.modelHint) {
        if (veh.model.name.toLowerCase().includes(parsedInput.modelHint.toLowerCase())) {
          score += 25;
          reasons.push(`Modelo inferido: ${veh.model.name}`);
        } else {
          // Incompatible model -> Discard
          continue;
        }
      }

      // Year & Generation matching
      if (parsedInput.year) {
        const toYear = veh.generation.yearTo || new Date().getFullYear();
        if (parsedInput.year >= veh.generation.yearFrom && parsedInput.year <= toYear) {
          score += 20;
          reasons.push(`Año ${parsedInput.year} dentro de generación ${veh.generation.generationName} (${veh.generation.yearFrom}–${toYear})`);
        } else {
          score -= 30;
        }
      }

      // Generation hint matching
      if (parsedInput.generationHint) {
        const gHint = parsedInput.generationHint.toLowerCase();
        if (
          veh.generation.generationName.toLowerCase().includes(gHint) ||
          (veh.generation.internalCode && veh.generation.internalCode.toLowerCase().includes(gHint))
        ) {
          score += 20;
          reasons.push(`Generación coincide con ${veh.generation.generationName}`);
        }
      }

      // Engine & Engine Code matching
      if (parsedInput.engineCode) {
        const inputCode = parsedInput.engineCode.toUpperCase().trim();
        const codeFound = veh.engine.engineCodes.find((c) => {
          if (typeof c === 'string') return c.toUpperCase() === inputCode;
          return c.engineCode.toUpperCase() === inputCode;
        });

        if (codeFound) {
          matchedCode = typeof codeFound === 'string' ? codeFound : codeFound.engineCode;
          score += 35;
          reasons.push(`Código de motor verificado: ${matchedCode}`);
        }
      }

      // Engine name/family matching
      if (parsedInput.engineHint) {
        const eHint = parsedInput.engineHint.toLowerCase();
        if (veh.engine.name.toLowerCase().includes(eHint) || veh.engine.family.toLowerCase().includes(eHint)) {
          score += 25;
          reasons.push(`Motorización coincide: ${veh.engine.name}`);
        }
      }

      // Fuel matching
      if (parsedInput.fuel) {
        if (veh.engine.fuel.toLowerCase() === parsedInput.fuel.toLowerCase()) {
          score += 10;
          reasons.push(`Combustible coincide: ${veh.engine.fuel}`);
        } else {
          score -= 20;
        }
      }

      // Transmission matching
      if (parsedInput.transmission) {
        if (veh.configuration.transmission.toLowerCase().includes(parsedInput.transmission.toLowerCase())) {
          score += 10;
          reasons.push(`Transmisión coincide: ${veh.configuration.transmission}`);
        }
      }

      // Freeform string query matches
      if (typeof input === 'string') {
        const qLower = input.toLowerCase();
        if (qLower.includes('puretech') && veh.engine.family.toLowerCase().includes('puretech')) {
          score += 25;
          reasons.push('Bloque PureTech detectado en la consulta');
        }
        if (qLower.includes('tdi') && veh.engine.name.toLowerCase().includes('tdi')) {
          score += 25;
          reasons.push('Inyección TDI detectada en la consulta');
        }
        if (qLower.includes('320d') && (veh.id.includes('320d') || veh.model.name.includes('Serie 3'))) {
          score += 30;
          reasons.push('Denominación comercial 320d detectada');
        }
        if (qLower.includes('vvt-i') && veh.engine.name.toLowerCase().includes('vvt-i')) {
          score += 25;
          reasons.push('Distribución variable VVT-i detectada');
        }
      }

      // Check market configuration
      const marketConfig =
        veh.marketConfigurations.find((m) => m.countryCode === countryCode) ||
        veh.marketConfigurations[0];

      const confidence = Math.max(0.05, Math.min(0.99, Number((score / 100).toFixed(2))));

      if (score >= 20) {
        candidates.push({
          vehicleId: veh.id,
          brand: veh.brand,
          model: veh.model,
          generation: veh.generation,
          engine: veh.engine,
          marketConfig,
          matchedEngineCode: matchedCode,
          confidence,
          matchScore: score,
          matchReasons: reasons,
          isExactMatch: confidence >= 0.85
        });
      }
    }

    // Sort descending by confidence
    candidates.sort((a, b) => b.confidence - a.confidence);

    const best = candidates[0] || null;
    let isAmbiguous = false;
    let ambiguityReason: string | undefined = undefined;

    if (candidates.length > 1) {
      const top1 = candidates[0];
      const top2 = candidates[1];
      if (top1.confidence < 0.85 || Math.abs(top1.confidence - top2.confidence) < 0.15) {
        isAmbiguous = true;
        ambiguityReason = `Existen ${candidates.length} configuraciones compatibles (${top1.generation.generationName} vs ${top2.generation.generationName}). Selecciona la versión específica.`;
      }
    } else if (candidates.length === 0) {
      isAmbiguous = false;
      ambiguityReason = 'No se encontró ningún vehículo compatible en la base de datos de conocimiento.';
    }

    return {
      inputQuery: queryText,
      candidates,
      bestMatch: isAmbiguous ? null : best,
      isAmbiguous,
      ambiguityReason,
      normalizedBrand: brand || undefined,
      normalizedModel: model || undefined
    };
  }

  /**
   * Parse free text into candidate vehicle hints
   */
  private static parseFreeformText(text: string): PartialVehicleInput {
    const input: PartialVehicleInput = { text };
    const lower = text.toLowerCase();

    // Brand parsing
    if (lower.includes('volkswagen') || lower.includes('vw') || lower.includes('golf')) {
      input.brandHint = 'Volkswagen';
    } else if (lower.includes('peugeot') || lower.includes('208') || lower.includes('puretech')) {
      input.brandHint = 'Peugeot';
    } else if (lower.includes('toyota') || lower.includes('yaris')) {
      input.brandHint = 'Toyota';
    } else if (lower.includes('bmw') || lower.includes('320d') || lower.includes('bimmer')) {
      input.brandHint = 'BMW';
    }

    // Model parsing
    if (lower.includes('golf')) input.modelHint = 'Golf';
    if (lower.includes('208')) input.modelHint = '208';
    if (lower.includes('yaris')) input.modelHint = 'Yaris';
    if (lower.includes('320d') || lower.includes('serie 3') || lower.includes('3 series')) input.modelHint = 'Serie 3';

    // Year parsing (4 digits 1990-2029)
    const yearMatch = text.match(/\b(19\d\d|20[0-2]\d)\b/);
    if (yearMatch) {
      input.year = parseInt(yearMatch[1], 10);
    }

    // Engine code regex
    const codeMatch = text.match(/\b(CRBC|CRLB|DEJA|EB2DT|EB2ADT|1KR-FE|N47D20|B47D20)\b/i);
    if (codeMatch) {
      input.engineCode = codeMatch[1].toUpperCase();
    }

    // Engine hint
    if (lower.includes('2.0 tdi') || lower.includes('ea288')) input.engineHint = '2.0 TDI';
    if (lower.includes('puretech') || lower.includes('1.2 puretech')) input.engineHint = 'PureTech';
    if (lower.includes('1.0') || lower.includes('vvt-i')) input.engineHint = '1.0 VVT-i';
    if (lower.includes('320d') || lower.includes('twinpower')) input.engineHint = '2.0d';

    // Fuel parsing
    if (lower.includes('diesel') || lower.includes('diésel') || lower.includes('tdi') || lower.includes('320d')) {
      input.fuel = 'Diésel';
    } else if (lower.includes('gasolina') || lower.includes('petrol') || lower.includes('puretech') || lower.includes('vvt-i')) {
      input.fuel = 'Gasolina';
    }

    return input;
  }
}
