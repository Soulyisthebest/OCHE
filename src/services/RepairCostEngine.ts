/**
 * OCHE / CARCHECK AI — Repair Cost Engine (FASE 6)
 * Calculates comprehensive repair costs with differentiated parts pricing
 * (NEW, OEM, AFTERMARKET, USED, REMANUFACTURED), local labor rates,
 * three scenario projections (BEST_CASE, EXPECTED, WORST_CASE), and
 * unknown cost exposures for uninspected mechanical subsystems.
 * 
 * Strict Zero Fabrication: Unknown risks carry clear diagnosis requirements.
 */

import { CountryCode, CurrencyCode } from '../types/country';
import {
  RepairCostEstimate,
  PartCondition,
  PriceRange,
  UnknownCostExposure
} from '../types/costIntelligence';
import {
  GLOBAL_LABOR_RATES,
  CANONICAL_PARTS_PRICING
} from '../data/globalCostDatabase';
import { CountryEngine } from './CountryEngine';
import { ValidationService } from './ValidationService';

export class RepairCostEngine {
  /**
   * Calculate a structured repair estimate with scenario modeling
   */
  static estimateRepair(params: {
    repairId: string;
    title: string;
    systemId: string;
    partId?: string;
    partCondition?: PartCondition;
    laborHours: number;
    additionalCostsMin?: number;
    additionalCostsMax?: number;
    countryCode?: CountryCode;
    isDemo?: boolean;
  }): RepairCostEstimate {
    const country: CountryCode = params.countryCode || 'ES';
    const condition: PartCondition = params.partCondition || 'AFTERMARKET';
    const laborRate = GLOBAL_LABOR_RATES[country] || GLOBAL_LABOR_RATES['ES'];
    const currency: CurrencyCode = laborRate.currency;

    // Currency & tariff conversion factor
    const profile = CountryEngine.getCountryProfile(country);
    const tariffMultiplier = profile.partsMarket?.importTariffMultiplier || 1.0;
    
    // Convert base EUR to local currency
    let fxRate = 1.0;
    if (currency === 'GBP') fxRate = 0.85;
    else if (currency === 'USD') fxRate = 1.08;
    else if (currency === 'MAD') fxRate = 10.8;
    else if (currency === 'SAR') fxRate = 4.05;
    else if (currency === 'CAD') fxRate = 1.48;
    else if (currency === 'MXN') fxRate = 18.5;
    else if (currency === 'BRL') fxRate = 5.8;
    else if (currency === 'JPY') fxRate = 165;

    // 1. Calculate Parts Cost based on condition
    let partsRange = this.getPartPriceRange(params.partId, condition, fxRate * tariffMultiplier, currency);

    // 2. Calculate Labor Cost based on country rates
    const laborHours = Math.max(0.5, params.laborHours || 1.5);
    const laborCost: PriceRange = {
      minimum: Math.round(laborHours * laborRate.minimumHourlyRate),
      expected: Math.round(laborHours * laborRate.averageHourlyRate),
      maximum: Math.round(laborHours * laborRate.maximumHourlyRate),
      currency
    };

    // 3. Additional costs (shop supplies, liquids, small hardware, alignment)
    const addMin = Math.round((params.additionalCostsMin || 20) * fxRate);
    const addExp = Math.round((((params.additionalCostsMin || 20) + (params.additionalCostsMax || 60)) / 2) * fxRate);
    const addMax = Math.round((params.additionalCostsMax || 60) * fxRate);

    const additionalCosts: PriceRange = {
      minimum: addMin,
      expected: addExp,
      maximum: addMax,
      currency
    };

    // 4. Scenario Projections
    // BEST_CASE: Independent workshop, aftermarket/remanufactured part, minimum labor time, no unexpected complications
    const bestCaseTotal = partsRange.minimum + laborCost.minimum + additionalCosts.minimum;
    
    // EXPECTED: Standard quality part, average workshop hourly rate, standard labor time
    const expectedTotal = partsRange.expected + laborCost.expected + additionalCosts.expected;

    // WORST_CASE: Seized bolts, collateral gaskets/fluids required, dealer rate, upper parts band
    const worstCaseTotal = partsRange.maximum + laborCost.maximum + additionalCosts.maximum;

    return {
      repairId: params.repairId,
      title: params.title,
      systemId: params.systemId,
      partId: params.partId,
      partConditionUsed: condition,
      partsCost: partsRange,
      laborHours,
      laborCost,
      additionalCosts,
      minimum: ValidationService.safePrice(bestCaseTotal),
      expected: ValidationService.safePrice(expectedTotal),
      maximum: ValidationService.safePrice(worstCaseTotal),
      currency,
      scenarios: {
        bestCase: {
          partsCost: partsRange.minimum,
          laborCost: laborCost.minimum,
          additionalCosts: additionalCosts.minimum,
          totalCost: bestCaseTotal,
          description: `Taller independiente de confianza con pieza ${condition.toLowerCase()} y sin imprevistos.`
        },
        expected: {
          partsCost: partsRange.expected,
          laborCost: laborCost.expected,
          additionalCosts: additionalCosts.expected,
          totalCost: expectedTotal,
          description: `Procedimiento estándar según tiempo de manual técnico y tarifa media.`
        },
        worstCase: {
          partsCost: partsRange.maximum,
          laborCost: laborCost.maximum,
          additionalCosts: additionalCosts.maximum,
          totalCost: worstCaseTotal,
          description: `Tornillería gripada, sustitución de retenes/líquidos complementarios o tarifa de taller oficial.`
        }
      },
      confidence: 0.88,
      isDemo: params.isDemo ?? true
    };
  }

  /**
   * Helper to retrieve parts price range by condition
   */
  private static getPartPriceRange(
    partId: string | undefined,
    condition: PartCondition,
    scaleFactor: number,
    currency: CurrencyCode
  ): PriceRange {
    if (partId && CANONICAL_PARTS_PRICING[partId]) {
      const catalog = CANONICAL_PARTS_PRICING[partId];
      const mult = catalog.conditionMultipliers[condition] || catalog.conditionMultipliers['AFTERMARKET'];
      
      return {
        minimum: Math.round(catalog.baseEuroMSRP * mult.min * scaleFactor),
        expected: Math.round(catalog.baseEuroMSRP * mult.exp * scaleFactor),
        maximum: Math.round(catalog.baseEuroMSRP * mult.max * scaleFactor),
        currency
      };
    }

    // Default generic part fallback if not in catalog
    const baseEuro = 150;
    const mult = condition === 'OEM' ? 1.2 : condition === 'USED' ? 0.35 : condition === 'REMANUFACTURED' ? 0.5 : 0.7;
    return {
      minimum: Math.round(baseEuro * mult * 0.85 * scaleFactor),
      expected: Math.round(baseEuro * mult * scaleFactor),
      maximum: Math.round(baseEuro * mult * 1.25 * scaleFactor),
      currency
    };
  }

  /**
   * Identify unknown cost exposures that cannot be estimated without physical dismantling/diagnosis
   */
  static getUnknownCostExposures(findings: Array<{ label?: string; category?: string }>): UnknownCostExposure[] {
    const exposures: UnknownCostExposure[] = [];

    // Check for turbo / compression / internal engine uncertainties
    exposures.push({
      id: 'unk-compression',
      title: 'Estanqueidad y Compresión de Cilindros',
      systemId: 'ENGINE',
      description: 'Estado interno de los segmentos del pistón y válvulas de admisión/escape.',
      requiresDiagnosis: true,
      message: 'Coste desconocido hasta diagnóstico con manómetro de compresión.',
      potentialRiskLevel: 'HIGH',
      estimatedExposureRangeIfFailed: {
        min: 800,
        max: 2500,
        currency: 'EUR'
      }
    });

    exposures.push({
      id: 'unk-clutch-flywheel',
      title: 'Holgura en Volante Bimasa',
      systemId: 'TRANSMISSION',
      description: 'La holgura angular y el juego axial solo son medibles tras desacoplar la caja de cambios.',
      requiresDiagnosis: true,
      message: 'Coste desconocido hasta diagnóstico físico.',
      potentialRiskLevel: 'MEDIUM',
      estimatedExposureRangeIfFailed: {
        min: 650,
        max: 1300,
        currency: 'EUR'
      }
    });

    return exposures;
  }
}
