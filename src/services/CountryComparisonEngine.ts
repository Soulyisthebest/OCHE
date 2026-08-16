/**
 * OCHE / CARCHECK AI — Multi-Country Ownership Comparison Engine (FASE 6)
 * Compares the total ownership entry cost of the same vehicle across different
 * country markets (Spain, France, Germany, UK, USA, Morocco, Saudi Arabia, etc.)
 * considering local currencies, labor rates, transfer taxes, and inspection systems.
 */

import { CountryCode, CurrencyCode } from '../types/country';
import {
  CountryOwnershipComparisonResult,
  CountryOwnershipComparisonItem
} from '../types/costIntelligence';
import {
  GLOBAL_LABOR_RATES,
  GLOBAL_TAX_CONFIGURATIONS,
  GLOBAL_REGISTRATION_COSTS,
  GLOBAL_INSPECTION_COSTS
} from '../data/globalCostDatabase';
import { CountryEngine } from './CountryEngine';
import { ValidationService } from './ValidationService';

export class CountryComparisonEngine {
  /**
   * Compare ownership entry cost across multiple global markets
   */
  static compareOwnershipCost(params: {
    vehicleName: string;
    basePriceEUR: number;
    year: number;
    mileageKm: number;
    standardLaborHours?: number;
    targetCountries?: CountryCode[];
  }): CountryOwnershipComparisonResult {
    const targetCountries: CountryCode[] = params.targetCountries || [
      'ES',
      'FR',
      'DE',
      'UK',
      'US',
      'MA',
      'SA'
    ];

    const laborHours = params.standardLaborHours || 6.0; // Typical preparation work
    const basePriceEUR = ValidationService.safePrice(params.basePriceEUR, 8000);

    const comparisons: CountryOwnershipComparisonItem[] = targetCountries.map((country) => {
      const profile = CountryEngine.getCountryProfile(country);
      const labor = GLOBAL_LABOR_RATES[country] || GLOBAL_LABOR_RATES['ES'];
      const tax = GLOBAL_TAX_CONFIGURATIONS[country] || GLOBAL_TAX_CONFIGURATIONS['ES'];
      const reg = GLOBAL_REGISTRATION_COSTS[country] || GLOBAL_REGISTRATION_COSTS['ES'];
      const insp = GLOBAL_INSPECTION_COSTS[country] || GLOBAL_INSPECTION_COSTS['ES'];

      // Exchange rate from EUR to local currency
      let fxRate = 1.0;
      if (profile.currency === 'GBP') fxRate = 0.85;
      else if (profile.currency === 'USD') fxRate = 1.08;
      else if (profile.currency === 'MAD') fxRate = 10.8;
      else if (profile.currency === 'SAR') fxRate = 4.05;
      else if (profile.currency === 'CAD') fxRate = 1.48;
      else if (profile.currency === 'MXN') fxRate = 18.5;
      else if (profile.currency === 'BRL') fxRate = 5.8;
      else if (profile.currency === 'JPY') fxRate = 165;

      const purchasePriceLocal = Math.round(basePriceEUR * fxRate);

      // Taxes (ITP in ES, Sales tax in US, etc.)
      let taxAmount = 0;
      if (tax.rate > 0) {
        taxAmount = Math.round(purchasePriceLocal * tax.rate);
        taxAmount = Math.max(tax.minimum, Math.min(tax.maximum, taxAmount));
      } else {
        taxAmount = Math.round((tax.minimum + tax.maximum) / 2);
      }

      const regAmount = Math.round(reg.fixedFee || (reg.minimum + reg.maximum) / 2);
      const inspAmount = Math.round((insp.minimum + insp.maximum) / 2);
      const taxAndReg = taxAmount + regAmount;

      // Labor & Repairs
      const laborRateLocal = labor.averageHourlyRate;
      const partsLocal = Math.round(350 * fxRate * (profile.partsMarket?.importTariffMultiplier || 1.0));
      const repairsExpectedLocal = Math.round(laborHours * laborRateLocal + partsLocal);

      // Total Entry Cost Local
      const totalEntryCostLocal = purchasePriceLocal + taxAndReg + inspAmount + repairsExpectedLocal;

      // Total Entry Cost converted back to EUR for benchmark comparison
      const totalEntryCostEUR = Math.round(totalEntryCostLocal / fxRate);

      return {
        countryCode: country,
        countryName: profile.countryName,
        currency: profile.currency,
        purchasePriceLocal,
        purchasePriceEUR: basePriceEUR,
        repairsExpectedLocal,
        laborRateHourlyLocal: laborRateLocal,
        taxAndRegistrationLocal: taxAndReg,
        inspectionFeeLocal: inspAmount,
        totalEntryCostLocal,
        totalEntryCostEUR,
        isDemo: true
      };
    });

    return {
      vehicleDescription: params.vehicleName,
      baseYear: params.year,
      baseMileageKm: params.mileageKm,
      comparisons
    };
  }
}
