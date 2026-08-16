/**
 * OCHE / CARCHECK AI — What-If Simulation Engine (FASE 6)
 * Simulates ownership cost variations, parts condition switching (OEM vs Aftermarket vs Used),
 * additional contingent repair scenarios, and recalculates real entry cost, deal score,
 * and target negotiation envelopes dynamically.
 */

import { CountryCode } from '../types/country';
import {
  WhatIfSimulationInput,
  WhatIfSimulationOutput,
  PartCondition,
  RepairCostEstimate
} from '../types/costIntelligence';
import { COMMON_WHAT_IF_SCENARIOS, WhatIfScenarioItem } from './CostEngine';
import { DealScoreEngine } from './DealScoreEngine';
import { NegotiationEngine } from './NegotiationEngine';
import { CountryEngine } from './CountryEngine';
import { ValidationService } from './ValidationService';

export class WhatIfEngine {
  /**
   * Run dynamic what-if simulation on a vehicle purchase scenario
   */
  static simulate(
    input: WhatIfSimulationInput,
    countryCode?: CountryCode
  ): WhatIfSimulationOutput {
    const country: CountryCode = countryCode || 'ES';
    const profile = CountryEngine.getCountryProfile(country);
    const conditionPreference: PartCondition = input.partConditionPreference || 'AFTERMARKET';

    // Base repairs sum
    const baseRepairsExp = (input.baseRepairs || []).reduce((sum, r) => sum + r.expected, 0);
    const baseMaintenanceExp = 300;
    const baseTotalExpected = input.baseAskingPrice + baseRepairsExp + baseMaintenanceExp;

    // Filter active what-if scenarios
    const allScenarios: WhatIfScenarioItem[] = [
      ...COMMON_WHAT_IF_SCENARIOS,
      ...(input.customScenarios || []).map((c) => ({
        id: c.id,
        name: c.name,
        category: 'Personalizado',
        costMin: c.costMin,
        costMax: c.costMax,
        laborHours: c.laborHours,
        riskImpact: c.riskImpact,
        description: 'Escenario añadido por el usuario.',
        icon: 'Wrench'
      }))
    ];

    const activeScenarios = allScenarios.filter((s) => input.selectedScenarioIds.includes(s.id));

    // Part condition multiplier adjustment
    // OEM = 1.25x, AFTERMARKET = 1.0x, USED = 0.55x, REMANUFACTURED = 0.7x
    let conditionMult = 1.0;
    if (conditionPreference === 'OEM') conditionMult = 1.25;
    else if (conditionPreference === 'USED') conditionMult = 0.55;
    else if (conditionPreference === 'REMANUFACTURED') conditionMult = 0.7;

    const extraMin = Math.round(activeScenarios.reduce((sum, s) => sum + s.costMin, 0) * conditionMult);
    const extraMax = Math.round(activeScenarios.reduce((sum, s) => sum + s.costMax, 0) * conditionMult);
    const extraExpected = Math.round((extraMin + extraMax) / 2);

    const simulatedTotalExpected = baseTotalExpected + extraExpected;
    const totalRepairExposure = baseRepairsExp + extraExpected;

    // Adjusted Vehicle Quality Score
    const totalRiskPenalty = activeScenarios.reduce((sum, s) => sum + s.riskImpact, 0);
    const adjustedVehicleScore = ValidationService.safeScore(
      input.baseVehicleScore + totalRiskPenalty,
      50
    );

    // Adjusted Deal Score
    const dealResult = DealScoreEngine.calculateDealScore({
      askingPrice: input.baseAskingPrice,
      fairMarketMedian: input.baseAskingPrice, // reference baseline
      vehicleQualityScore: adjustedVehicleScore,
      repairExposureExpected: totalRepairExposure,
      totalEntryCostExpected: simulatedTotalExpected,
      isDemo: true
    });

    // Adjusted Target Price
    const targetResult = NegotiationEngine.calculateTargetPrice({
      askingPrice: input.baseAskingPrice,
      repairExposureExpected: totalRepairExposure,
      maintenanceExposureExpected: baseMaintenanceExp,
      vehicleQualityScore: adjustedVehicleScore,
      countryCode: country,
      isDemo: true
    });

    // Generated Script
    const activeNames = activeScenarios.map((s) => s.name).join(', ');
    const negotiationScript: string[] = [
      `Hola. Hemos realizado la simulación de puesta a punto considerando: ${activeNames || 'reparaciones adicionales'}.`,
      `Utilizando recambios tipo ${conditionPreference} y mano de obra estándar, el coste adicional asciende a ${CountryEngine.formatMoney(extraExpected, profile)}.`,
      `Para mantener la compra dentro de un coste razonable, proponemos un precio objetivo de ${CountryEngine.formatMoney(targetResult.targetPrice, profile)} (máximo recomendable: ${CountryEngine.formatMoney(targetResult.maximumRecommendedPrice, profile)}).`
    ];

    return {
      baseTotalExpected,
      simulatedTotalExpected,
      costDifference: extraExpected,
      newTargetNegotiationMin: targetResult.targetPrice,
      newTargetNegotiationMax: targetResult.maximumRecommendedPrice,
      newMaxRecommendedPrice: targetResult.maximumRecommendedPrice,
      adjustedVehicleScore,
      adjustedDealScore: dealResult.dealScore,
      adjustedDealVerdict: dealResult.rating,
      appliedPartCondition: conditionPreference,
      negotiationScript
    };
  }
}
