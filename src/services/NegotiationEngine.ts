/**
 * OCHE / CARCHECK AI — Negotiation Intelligence Engine (FASE 6)
 * Calculates target purchase price, maximum recommended threshold, walk-away price,
 * and builds factual, evidence-backed negotiation scripts based on physical inspection findings.
 */

import { CountryCode, CurrencyCode } from '../types/country';
import {
  TargetPriceResultExtended,
  NegotiationProposal,
  PriceConfidence
} from '../types/costIntelligence';
import { ValidationService } from './ValidationService';
import { CountryEngine } from './CountryEngine';

export interface TargetPriceParams {
  askingPrice: number;
  fairMarketRange?: { minimum: number; median: number; maximum: number };
  repairExposureExpected: number;
  maintenanceExposureExpected?: number;
  vehicleQualityScore?: number;
  countryCode?: CountryCode;
  isDemo?: boolean;
}

export class NegotiationEngine {
  /**
   * Calculate Target Price, Max Recommended, and Walk-Away Limits
   */
  static calculateTargetPrice(params: TargetPriceParams): TargetPriceResultExtended {
    const country: CountryCode = params.countryCode || 'ES';
    const profile = CountryEngine.getCountryProfile(country);
    const currency: CurrencyCode = profile.currency;

    const asking = ValidationService.safePrice(params.askingPrice, 0);
    const repairExp = ValidationService.safePrice(params.repairExposureExpected, 0);
    const maintExp = ValidationService.safePrice(params.maintenanceExposureExpected, 250);
    const totalExposure = repairExp + maintExp;

    const fairMin = params.fairMarketRange?.minimum || Math.round(asking * 0.88);
    const fairMedian = params.fairMarketRange?.median || asking;
    const fairMax = params.fairMarketRange?.maximum || Math.round(asking * 1.12);

    if (asking <= 0) {
      return {
        askingPrice: 0,
        fairPriceRange: { minimum: 0, median: 0, maximum: 0 },
        targetPrice: 0,
        maximumRecommendedPrice: 0,
        walkAwayPrice: 0,
        confidence: 'UNKNOWN',
        currency,
        isDemo: params.isDemo ?? true,
        reasoning: ['Se requiere un precio de venta para iniciar el análisis.']
      };
    }

    // Target price = fair median minus necessary repair/maintenance deductions
    // Seller should absorb at least 70% - 100% of necessary immediate mechanical repairs
    const targetPrice = Math.max(300, Math.round(Math.min(asking, fairMedian) - totalExposure * 0.85));
    
    // Maximum price you should ever pay without paying above market + repairs
    const maximumRecommendedPrice = Math.max(300, Math.round(Math.min(asking, fairMax) - repairExp * 0.5));

    // Walk away if seller asks for more than fair market maximum without discounting heavy repairs
    const walkAwayPrice = Math.round(fairMax);

    const confidence: PriceConfidence = asking > 0 && totalExposure > 0 ? 'HIGH' : 'MEDIUM';

    const reasoning: string[] = [
      `Precio anunciado por vendedor: ${CountryEngine.formatMoney(asking, profile)}`,
      `Valor medio estimado de mercado para modelo similar: ${CountryEngine.formatMoney(fairMedian, profile)}`,
      `Exposición estimada a taller y mantenimiento inicial: ${CountryEngine.formatMoney(totalExposure, profile)}`,
      `Oferta recomendada para no superar presupuesto global: ${CountryEngine.formatMoney(targetPrice, profile)}`
    ];

    return {
      askingPrice: asking,
      fairPriceRange: {
        minimum: fairMin,
        median: fairMedian,
        maximum: fairMax
      },
      targetPrice,
      maximumRecommendedPrice,
      walkAwayPrice,
      confidence,
      currency,
      isDemo: params.isDemo ?? true,
      reasoning
    };
  }

  /**
   * Generate comprehensive negotiation proposal with bulletproof arguments and objection handlers
   */
  static generateProposal(params: TargetPriceParams & {
    detectedDefects?: string[];
  }): NegotiationProposal {
    const country = params.countryCode || 'ES';
    const profile = CountryEngine.getCountryProfile(country);
    const targetResult = this.calculateTargetPrice(params);
    const totalExposure = params.repairExposureExpected + (params.maintenanceExposureExpected || 250);

    // Initial offer strategy (Start ~10-15% below target to leave room for negotiation)
    const initialSuggestedOffer = Math.max(
      300,
      Math.round(targetResult.targetPrice - (targetResult.askingPrice - targetResult.targetPrice) * 0.3)
    );

    const argumentsList: string[] = [
      `El vehículo es de nuestro interés, pero presenta una exposición estimada en taller de ${CountryEngine.formatMoney(totalExposure, profile)} para puesta a punto segura.`,
      params.detectedDefects && params.detectedDefects.length > 0
        ? `Puntos mecánicos prioritarios comprobados: ${params.detectedDefects.slice(0, 3).join(', ')}.`
        : `Mantenimiento preventivo de seguridad y puesta a punto de fluidos/filtros pendiente.`,
      `Nuestra oferta de ${CountryEngine.formatMoney(targetResult.targetPrice, profile)} permite cerrar la compra de forma rápida y en firme sin demoras.`
    ];

    const sellerObjectionsResponses = [
      {
        objection: 'Tengo a otros compradores interesados por el precio completo.',
        response: 'Lo comprendo perfectamente. Mi oferta es en firme, con pago inmediato y sin intermediarios. Si los otros interesados no concretan tras revisar el coche en taller, mi propuesta sigue en pie.'
      },
      {
        objection: 'El coche pasa la ITV sin problemas y funciona bien a diario.',
        response: 'La ITV solo valida estándares mínimos de seguridad básica en ese instante, pero no certifica el desgaste interno de elementos como embrague, distribución o componentes de suspensión que requerirán sustitución a corto plazo.'
      },
      {
        objection: 'Ya le he bajado el precio respecto a lo que me costó.',
        response: 'El mercado de ocasión cotiza el modelo en una media de ' + CountryEngine.formatMoney(targetResult.fairPriceRange.median, profile) + ', y sumando la puesta a punto necesaria mi oferta se sitúa exactamente en el valor real del mercado actual.'
      }
    ];

    return {
      askingPrice: targetResult.askingPrice,
      initialSuggestedOffer,
      targetPrice: targetResult.targetPrice,
      maximumRecommendedPrice: targetResult.maximumRecommendedPrice,
      walkAwayPrice: targetResult.walkAwayPrice,
      potentialExposureTotal: totalExposure,
      arguments: argumentsList,
      sellerObjectionsResponses,
      currency: targetResult.currency,
      isDemo: params.isDemo ?? true
    };
  }
}
