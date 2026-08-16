/**
 * OCHE / CARCHECK AI — Total Entry Cost Engine (FASE 6)
 * Calculates the complete initial financial outlay required to put a used vehicle
 * safely on the road in any target country market.
 * 
 * Formula:
 * Estimated Entry Cost = Purchase Price + Immediate Repairs + Recommended Maintenance
 *                      + Registration Costs + Inspection Costs + Country Taxes & Fees
 */

import { CountryCode, CurrencyCode } from '../types/country';
import {
  RealPurchaseCostResult,
  RepairCostEstimate,
  UnknownCostExposure
} from '../types/costIntelligence';
import {
  GLOBAL_TAX_CONFIGURATIONS,
  GLOBAL_REGISTRATION_COSTS,
  GLOBAL_INSPECTION_COSTS
} from '../data/globalCostDatabase';
import { RepairCostEngine } from './RepairCostEngine';
import { ValidationService } from './ValidationService';
import { CountryEngine } from './CountryEngine';

export interface EntryCostParams {
  purchasePrice: number;
  countryCode: CountryCode;
  immediateRepairs?: RepairCostEstimate[];
  maintenanceCostMin?: number;
  maintenanceCostMax?: number;
  inspectionRequired?: boolean;
  isDemo?: boolean;
}

export class EntryCostEngine {
  /**
   * Calculate full real purchase & ownership entry cost
   */
  static calculateRealPurchaseCost(params: EntryCostParams): RealPurchaseCostResult {
    const country: CountryCode = params.countryCode || 'ES';
    const validPurchasePrice = ValidationService.safePrice(params.purchasePrice, 0);

    // Country configuration lookup
    const taxConfig = GLOBAL_TAX_CONFIGURATIONS[country] || GLOBAL_TAX_CONFIGURATIONS['ES'];
    const regConfig = GLOBAL_REGISTRATION_COSTS[country] || GLOBAL_REGISTRATION_COSTS['ES'];
    const inspConfig = GLOBAL_INSPECTION_COSTS[country] || GLOBAL_INSPECTION_COSTS['ES'];
    const currency: CurrencyCode = taxConfig.currency;

    // 1. Calculate Tax Exposure (e.g. ITP in Spain, Sales Tax in US)
    let taxExposure = 0;
    if (taxConfig.rate > 0) {
      taxExposure = Math.round(validPurchasePrice * taxConfig.rate);
      taxExposure = Math.max(taxConfig.minimum, Math.min(taxConfig.maximum, taxExposure));
    } else {
      taxExposure = Math.round((taxConfig.minimum + taxConfig.maximum) / 2);
    }

    // 2. Registration / Administrative Transfer Fees
    const registrationExposure = Math.round(regConfig.fixedFee || (regConfig.minimum + regConfig.maximum) / 2);

    // 3. Inspection Costs (ITV, MOT, TÜV, CT, etc.)
    const inspectionExposure = params.inspectionRequired !== false
      ? Math.round((inspConfig.minimum + inspConfig.maximum) / 2)
      : 0;

    // 4. Immediate Repairs Exposure
    const repairs = params.immediateRepairs || [];
    const repMin = repairs.reduce((sum, r) => sum + r.minimum, 0);
    const repExp = repairs.reduce((sum, r) => sum + r.expected, 0);
    const repMax = repairs.reduce((sum, r) => sum + r.maximum, 0);

    // 5. Recommended Initial Maintenance (Fluids, filters, basic tune-up)
    const profile = CountryEngine.getCountryProfile(country);
    let fxRate = 1.0;
    if (currency === 'GBP') fxRate = 0.85;
    else if (currency === 'USD') fxRate = 1.08;
    else if (currency === 'MAD') fxRate = 10.8;
    else if (currency === 'SAR') fxRate = 4.05;
    else if (currency === 'CAD') fxRate = 1.48;
    else if (currency === 'MXN') fxRate = 18.5;
    else if (currency === 'BRL') fxRate = 5.8;
    else if (currency === 'JPY') fxRate = 165;

    const baseMaintMin = params.maintenanceCostMin !== undefined ? params.maintenanceCostMin : Math.round(180 * fxRate);
    const baseMaintMax = params.maintenanceCostMax !== undefined ? params.maintenanceCostMax : Math.round(380 * fxRate);
    const baseMaintExp = Math.round((baseMaintMin + baseMaintMax) / 2);

    // 6. Other country specific buffers (documentation management / gestoría)
    const otherCosts = country === 'ES' || country === 'IT' ? Math.round(75 * fxRate) : 0;

    // 7. Totals
    const totalMinimum = validPurchasePrice + repMin + baseMaintMin + registrationExposure + inspectionExposure + taxExposure + otherCosts;
    const totalExpected = validPurchasePrice + repExp + baseMaintExp + registrationExposure + inspectionExposure + taxExposure + otherCosts;
    const totalMaximum = validPurchasePrice + repMax + baseMaintMax + registrationExposure + inspectionExposure + taxExposure + otherCosts;

    // Unknown contingent exposures
    const unknownExposures: UnknownCostExposure[] = RepairCostEngine.getUnknownCostExposures([]);

    // Structured breakdown for UI
    const breakdownItems = [
      {
        category: 'Compra',
        label: 'Precio de adquisición pactado',
        min: validPurchasePrice,
        expected: validPurchasePrice,
        max: validPurchasePrice,
        isObligatory: true
      },
      {
        category: 'Impuestos',
        label: taxConfig.taxType,
        min: taxExposure,
        expected: taxExposure,
        max: taxExposure,
        isObligatory: true,
        note: `Normativa fiscal de ${country}`
      },
      {
        category: 'Tráfico / Registro',
        label: 'Tasa oficial de cambio de titularidad',
        min: registrationExposure,
        expected: registrationExposure,
        max: registrationExposure,
        isObligatory: true
      },
      {
        category: 'Inspección',
        label: `${inspConfig.inspectionType} (si procede)`,
        min: inspectionExposure,
        expected: inspectionExposure,
        max: inspectionExposure,
        isObligatory: params.inspectionRequired !== false
      },
      {
        category: 'Mantenimiento',
        label: 'Puesta a cero preventiva (Fluidos y filtros)',
        min: baseMaintMin,
        expected: baseMaintExp,
        max: baseMaintMax,
        isObligatory: false,
        note: 'Recomendado para asegurar fiabilidad'
      },
      {
        category: 'Reparaciones',
        label: `Averías y desgastes identificados (${repairs.length} elementos)`,
        min: repMin,
        expected: repExp,
        max: repMax,
        isObligatory: repExp > 0
      }
    ];

    return {
      purchasePrice: validPurchasePrice,
      repairExposure: {
        minimum: repMin,
        expected: repExp,
        maximum: repMax
      },
      maintenanceExposure: {
        minimum: baseMaintMin,
        expected: baseMaintExp,
        maximum: baseMaintMax
      },
      registrationExposure,
      inspectionExposure,
      taxExposure,
      otherCountrySpecificCosts: otherCosts,
      totalMinimum: ValidationService.safePrice(totalMinimum),
      totalExpected: ValidationService.safePrice(totalExpected),
      totalMaximum: ValidationService.safePrice(totalMaximum),
      currency,
      confidence: 'HIGH',
      unknownExposures,
      isDemo: params.isDemo ?? true,
      breakdownItems
    };
  }
}
