import { RealCostBreakdown, NegotiationTarget, RepairItem } from '../types';
import { CostDetailItem, ComprehensiveCostEstimate, TargetPriceResult } from '../types/analysisSession';
import { Vehicle } from '../types/vehicleEngine';
import { StructuredFinding } from '../types/evidence';
import { ValidationService } from './ValidationService';
import { CountryEngine } from './CountryEngine';
import { CountryProfile, CountryCode } from '../types/country';
import {
  PriceFactors,
  MarketPriceEstimate,
  RealPurchaseCostResult,
  DealScoreResult,
  TargetPriceResultExtended,
  NegotiationProposal,
  WhatIfSimulationInput,
  WhatIfSimulationOutput,
  CountryOwnershipComparisonResult,
  PartCondition,
  RepairCostEstimate
} from '../types/costIntelligence';
import { MarketPriceEngine } from './MarketPriceEngine';
import { RepairCostEngine } from './RepairCostEngine';
import { EntryCostEngine } from './EntryCostEngine';
import { DealScoreEngine } from './DealScoreEngine';
import { NegotiationEngine } from './NegotiationEngine';
import { WhatIfEngine } from './WhatIfEngine';
import { CountryComparisonEngine } from './CountryComparisonEngine';

export interface WhatIfScenarioItem {
  id: string;
  name: string;
  category: string;
  costMin: number;
  costMax: number;
  laborHours: number;
  riskImpact: number; // Impact on score (-5 to -20)
  description: string;
  icon: string;
}

export interface WhatIfSimulationResult {
  baseTotalExpected: number;
  simulatedTotalExpected: number;
  costDifference: number;
  newTargetNegotiationMin: number;
  newTargetNegotiationMax: number;
  newMaxRecommendedPrice: number;
  adjustedScore: number;
  adjustedVerdict: 'BUY' | 'NEGOTIATE' | 'AVOID';
  negotiationScript: string[];
}

export const COMMON_WHAT_IF_SCENARIOS: WhatIfScenarioItem[] = [
  {
    id: 'wi-clutch',
    name: 'Kit de Embrague + Volante Bimasa',
    category: 'Transmisión',
    costMin: 650,
    costMax: 1200,
    laborHours: 5.5,
    riskImpact: -12,
    description: 'Sustitución completa si patina o tiembla al arrancar en primera marcha.',
    icon: 'Settings'
  },
  {
    id: 'wi-timing',
    name: 'Correa de Distribución + Bomba de Agua',
    category: 'Motor',
    costMin: 380,
    costMax: 650,
    laborHours: 4.0,
    riskImpact: -10,
    description: 'Obligatorio si supera 5 años o no existe factura de cambio previo.',
    icon: 'Cpu'
  },
  {
    id: 'wi-brakes',
    name: 'Discos y Pastillas Completos (4 ruedas)',
    category: 'Frenos',
    costMin: 220,
    costMax: 450,
    laborHours: 2.0,
    riskImpact: -6,
    description: 'Renovación del equipo de fricción para garantizar seguridad total.',
    icon: 'Disc'
  },
  {
    id: 'wi-dpf',
    name: 'Filtro de Partículas (DPF / FAP)',
    category: 'Anticontaminación',
    costMin: 500,
    costMax: 1100,
    laborHours: 3.0,
    riskImpact: -14,
    description: 'Limpieza térmica o sustitución en motores diésel con uso urbano severo.',
    icon: 'Flame'
  },
  {
    id: 'wi-turbo',
    name: 'Turbocompresor Reconstruido',
    category: 'Sobrealimentación',
    costMin: 600,
    costMax: 1300,
    laborHours: 5.0,
    riskImpact: -18,
    description: 'Sustitución de turbo por holgura en el eje o silbido agudo.',
    icon: 'Wind'
  },
  {
    id: 'wi-tyres',
    name: 'Juego de 4 Neumáticos Nuevos + Alineación',
    category: 'Ruedas',
    costMin: 280,
    costMax: 520,
    laborHours: 1.5,
    riskImpact: -5,
    description: 'Neumáticos de primera marca equilibrados y alineados.',
    icon: 'CircleDot'
  }
];

export class CostEngine {
  /**
   * Calculate Real Cost Breakdown from asking price, maintenance, and repairs
   * Adapts transfer fees and currencies to the target CountryProfile.
   */
  static calculateRealCost(
    askingPrice: number,
    repairs: RepairItem[] = [],
    initialMaintenanceMin = 200,
    initialMaintenanceMax = 400,
    countryProfile?: CountryProfile
  ): RealCostBreakdown {
    const profile = countryProfile || CountryEngine.getCountryProfile();
    const validPrice = ValidationService.safePrice(askingPrice, 0);

    // Calculate real country-specific registration / transfer fee
    const transferFees = CountryEngine.calculateRegistrationCost(validPrice, profile);

    const visibleRepairsMin = (Array.isArray(repairs) ? repairs : []).reduce(
      (sum, r) => sum + ValidationService.safePrice(r.totalEstimatedMin, 0),
      0
    );
    const visibleRepairsMax = (Array.isArray(repairs) ? repairs : []).reduce(
      (sum, r) => sum + ValidationService.safePrice(r.totalEstimatedMax, 0),
      0
    );

    const totalMin = validPrice + transferFees + initialMaintenanceMin + visibleRepairsMin;
    const totalMax = validPrice + transferFees + initialMaintenanceMax + visibleRepairsMax;

    return {
      askingPrice: validPrice,
      transferFees,
      initialMaintenanceMin,
      initialMaintenanceMax,
      visibleRepairsMin,
      visibleRepairsMax,
      totalMin,
      totalMax,
      isDemoData: repairs.some((r) => r.isDemoData)
    };
  }

  /**
   * Calculate Comprehensive Cost with structured part and labor details
   */
  static calculateComprehensiveCost(
    askingPrice: number,
    vehicle: Vehicle | null,
    findings: StructuredFinding[],
    mileageKm: number = 140000,
    isDemo: boolean = true,
    countryProfile?: CountryProfile
  ): ComprehensiveCostEstimate {
    const profile = countryProfile || CountryEngine.getCountryProfile();
    const validPrice = ValidationService.safePrice(askingPrice, 0);
    const transferFees = CountryEngine.calculateRegistrationCost(validPrice, profile);
    const items: CostDetailItem[] = [];

    // Country multipliers
    const hourlyRate = profile.laborMarket.hourlyRateExpected;
    const tariffMultiplier = profile.partsMarket.importTariffMultiplier;

    // Helper to calculate labor & parts with country economics
    const calcLabor = (hours: number) => Math.round(hours * hourlyRate);
    const calcPart = (eurBase: number) => Math.round(eurBase * tariffMultiplier);

    // 1. Initial Fluids & Filters
    items.push(
      ValidationService.sanitizeCostItem({
        id: 'cost-fluids-filters',
        name: 'Mantenimiento Preventivo (Aceite + Filtros)',
        category: 'Fluidos y Filtros',
        urgency: 'Alta',
        partCost: {
          min: calcPart(70),
          expected: calcPart(110),
          max: calcPart(160)
        },
        laborCost: {
          min: calcLabor(1.0),
          expected: calcLabor(1.5),
          max: calcLabor(2.0)
        },
        isDemo,
        reason: 'Puesta a cero recomendada tras la compra de cualquier coche de ocasión.',
        howToCheck: [
          'Comprueba el color y viscosidad del aceite en la varilla.',
          'Pide la última factura sellada con el kilometraje anotado.'
        ]
      })
    );

    // 2. Timing Belt / Distribution if high mileage or interval reached
    if (mileageKm >= 120000 || vehicle?.engine?.timingType?.toLowerCase().includes('correa') || vehicle?.engine?.timingType?.toLowerCase().includes('belt')) {
      items.push(
        ValidationService.sanitizeCostItem({
          id: 'cost-timing-belt',
          name: 'Kit de Distribución + Bomba de Agua',
          category: 'Motor',
          urgency: mileageKm > 160000 ? 'Alta' : 'Media',
          partCost: {
            min: calcPart(140),
            expected: calcPart(220),
            max: calcPart(320)
          },
          laborCost: {
            min: calcLabor(3.5),
            expected: calcLabor(4.5),
            max: calcLabor(6.0)
          },
          isDemo,
          reason: 'Elemento crítico de seguridad: si no hay factura de cambio en los últimos 5 años / 120.000 km.',
          howToCheck: [
            'Inspecciona visualmente la correa retirando la tapa superior si es accesible: no debe presentar grietas ni deshilachados.',
            'Escucha la zona de la distribución con el motor al ralentí: no debe chirriar ni sonar a rodamiento seco.'
          ]
        })
      );
    }

    // 3. Brake wear item
    items.push(
      ValidationService.sanitizeCostItem({
        id: 'cost-brakes',
        name: 'Pastillas de Freno Delanteras',
        category: 'Frenos',
        urgency: 'Media',
        partCost: {
          min: calcPart(45),
          expected: calcPart(70),
          max: calcPart(105)
        },
        laborCost: {
          min: calcLabor(0.8),
          expected: calcLabor(1.2),
          max: calcLabor(1.8)
        },
        isDemo,
        reason: 'Elemento de desgaste periódico por uso.',
        howToCheck: [
          'Observa a través de los radios de la llanta: el forro de la pastilla debe tener más de 3 mm de espesor.',
          'Pasa el dedo con el disco frío: no debe tener un escalón o rebaba pronunciada en el borde exterior.'
        ]
      })
    );

    // 4. Any known problems from vehicle database
    if (vehicle?.knownProblems && vehicle.knownProblems.length > 0) {
      vehicle.knownProblems.slice(0, 2).forEach((prob, idx) => {
        const costMin = prob.estimatedCost?.min || 100;
        const costMax = prob.estimatedCost?.max || 350;
        items.push(
          ValidationService.sanitizeCostItem({
            id: `cost-known-${idx}`,
            name: prob.title,
            category: 'Puntos Específicos del Modelo',
            urgency: prob.severity === 'critical' || prob.severity === 'Crítica' ? 'Alta' : 'Media',
            partCost: {
              min: calcPart(costMin * 0.5),
              expected: calcPart((costMin + costMax) * 0.3),
              max: calcPart(costMax * 0.5)
            },
            laborCost: {
              min: calcLabor(1.5),
              expected: calcLabor(2.5),
              max: calcLabor(4.0)
            },
            isDemo,
            reason: prob.description,
            howToCheck: [
              prob.preventionAdvice || 'Revisar en elevador con mecánico antes de firmar la compra.'
            ]
          })
        );
      });
    }

    const immediateCost = items
      .filter((i) => i.urgency === 'Alta')
      .reduce((sum, i) => sum + i.expected, 0);

    const possibleCost = items
      .filter((i) => i.urgency !== 'Alta')
      .reduce((sum, i) => sum + i.expected, 0);

    const totalEstimatedCost = validPrice + transferFees + immediateCost + possibleCost;
    const unknownCost = Math.round(hourlyRate * 3.5 + 150); // Margen de imprevistos para vehículo usado

    return {
      askingPrice: validPrice,
      transferFees,
      immediateCost,
      possibleCost,
      totalEstimatedCost,
      unknownCost,
      isDemo,
      items
    };
  }

  /**
   * Calculate Target Negotiation Price & Price Envelope with country awareness
   */
  static calculateTargetPrice(
    askingPrice?: number,
    repairExposure: number = 400,
    riskAdjustment: number = 200,
    countryProfile?: CountryProfile
  ): TargetPriceResult {
    const profile = countryProfile || CountryEngine.getCountryProfile();

    if (!askingPrice || askingPrice <= 0) {
      return {
        askingPrice: 0,
        estimatedRepairExposure: 0,
        riskAdjustment: 0,
        targetPrice: 0,
        maximumPrice: 0,
        minimumNegotiationPrice: 0,
        hasSufficientData: false,
        message: 'Necesitamos más información para calcular un precio objetivo.',
        negotiationScript: []
      };
    }

    const safePrice = ValidationService.safePrice(askingPrice);
    const totalDeduction = repairExposure + riskAdjustment;

    const targetPrice = Math.max(500, Math.round(safePrice - totalDeduction));
    const maximumPrice = Math.max(500, Math.round(safePrice - repairExposure * 0.6));
    const minimumNegotiationPrice = Math.max(500, Math.round(safePrice - totalDeduction * 1.25));

    const script: string[] = [
      `Hola. He examinado el vehículo y su historial de mantenimiento preventivo.`,
      `Considerando la puesta a punto necesaria (aproximadamente ${CountryEngine.formatMoney(repairExposure, profile)} en taller),`,
      `mi oferta razonable para cerrar la compra esta semana es de ${CountryEngine.formatMoney(targetPrice, profile)}.`
    ];

    return {
      askingPrice: safePrice,
      estimatedRepairExposure: repairExposure,
      riskAdjustment,
      targetPrice,
      maximumPrice,
      minimumNegotiationPrice,
      hasSufficientData: true,
      negotiationScript: script
    };
  }

  /**
   * Calculate Target Negotiation Price & Maximum Recommended Price (legacy compatibility)
   */
  static calculateNegotiationTarget(
    askingPrice: number,
    realCost: RealCostBreakdown,
    countryProfile?: CountryProfile
  ): NegotiationTarget {
    const repairAndMaintMax = (realCost.visibleRepairsMax || 0) + (realCost.initialMaintenanceMax || 0);
    const target = this.calculateTargetPrice(askingPrice, repairAndMaintMax, 150, countryProfile);

    return {
      askingPrice: target.askingPrice,
      riskCost: repairAndMaintMax,
      targetPriceMin: target.minimumNegotiationPrice,
      targetPriceMax: target.targetPrice,
      maxRecommendedPrice: target.maximumPrice,
      disclaimer: 'Cálculo objetivo basado en los costes inmediatos de puesta a punto para proteger tu presupuesto total.'
    };
  }

  /**
   * "What If" simulation: recalculates ownership entry cost, target price, and score
   */
  static simulateWhatIf(
    baseAskingPrice: number,
    baseScore: number,
    baseRepairs: RepairItem[],
    selectedScenarioIds: string[],
    countryProfile?: CountryProfile
  ): WhatIfSimulationResult {
    const profile = countryProfile || CountryEngine.getCountryProfile();
    const selectedScenarios = COMMON_WHAT_IF_SCENARIOS.filter((s) => selectedScenarioIds.includes(s.id));

    const extraMin = selectedScenarios.reduce((sum, s) => sum + s.costMin, 0);
    const extraMax = selectedScenarios.reduce((sum, s) => sum + s.costMax, 0);
    const extraExpected = (extraMin + extraMax) / 2;

    const baseCost = this.calculateRealCost(baseAskingPrice, baseRepairs, 200, 400, profile);
    const baseTotalExpected = (baseCost.totalMin + baseCost.totalMax) / 2;
    const simulatedTotalExpected = baseTotalExpected + extraExpected;

    // Score deduction
    const totalRiskPenalty = selectedScenarios.reduce((sum, s) => sum + s.riskImpact, 0);
    const adjustedScore = ValidationService.safeScore(baseScore + totalRiskPenalty, 50);

    let adjustedVerdict: 'BUY' | 'NEGOTIATE' | 'AVOID' = 'BUY';
    if (adjustedScore >= 80) adjustedVerdict = 'BUY';
    else if (adjustedScore >= 60) adjustedVerdict = 'NEGOTIATE';
    else adjustedVerdict = 'AVOID';

    // New negotiation targets
    const simulatedCostBreakdown = {
      ...baseCost,
      visibleRepairsMax: baseCost.visibleRepairsMax + extraMax,
      visibleRepairsMin: baseCost.visibleRepairsMin + extraMin,
      totalMin: baseCost.totalMin + extraMin,
      totalMax: baseCost.totalMax + extraMax
    };

    const newTargets = this.calculateNegotiationTarget(baseAskingPrice, simulatedCostBreakdown, profile);

    // Negotiation script generation
    const negotiationScript: string[] = [
      `He revisado el vehículo y calculado los costes inmediatos de puesta a punto.`,
      `El vehículo requiere o tiene pendiente: ${selectedScenarios.map((s) => s.name).join(', ')}.`,
      `El coste adicional estimado en taller es de entre ${CountryEngine.formatMoney(extraMin, profile)} y ${CountryEngine.formatMoney(extraMax, profile)}.`,
      `Para que la operación sea viable y justa para ambas partes, mi oferta en firme es de ${CountryEngine.formatMoney(newTargets.targetPriceMin, profile)} a ${CountryEngine.formatMoney(newTargets.targetPriceMax, profile)}.`
    ];

    return {
      baseTotalExpected,
      simulatedTotalExpected,
      costDifference: extraExpected,
      newTargetNegotiationMin: newTargets.targetPriceMin,
      newTargetNegotiationMax: newTargets.targetPriceMax,
      newMaxRecommendedPrice: newTargets.maxRecommendedPrice,
      adjustedScore,
      adjustedVerdict,
      negotiationScript
    };
  }

  // -------------------------------------------------------------
  // FASE 6 Modular Engine Facades
  // -------------------------------------------------------------

  /**
   * Estimate vehicle fair market value (FASE 6)
   */
  static estimateMarketPrice(factors: PriceFactors): MarketPriceEstimate {
    return MarketPriceEngine.estimateMarketPrice(factors);
  }

  /**
   * Estimate repair cost with parts condition and scenario projections (FASE 6)
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
    return RepairCostEngine.estimateRepair(params);
  }

  /**
   * Calculate full real purchase & ownership entry cost (FASE 6)
   */
  static calculateRealPurchaseCost(params: {
    purchasePrice: number;
    countryCode: CountryCode;
    immediateRepairs?: RepairCostEstimate[];
    maintenanceCostMin?: number;
    maintenanceCostMax?: number;
    inspectionRequired?: boolean;
    isDemo?: boolean;
  }): RealPurchaseCostResult {
    return EntryCostEngine.calculateRealPurchaseCost(params);
  }

  /**
   * Calculate independent Deal Score (FASE 6)
   */
  static calculateDealScore(params: {
    askingPrice: number;
    fairMarketMedian: number;
    vehicleQualityScore: number;
    repairExposureExpected: number;
    totalEntryCostExpected: number;
    isDemo?: boolean;
  }): DealScoreResult {
    return DealScoreEngine.calculateDealScore(params);
  }

  /**
   * Calculate extended target price with walk-away limits (FASE 6)
   */
  static calculateTargetPriceExtended(params: {
    askingPrice: number;
    fairMarketRange?: { minimum: number; median: number; maximum: number };
    repairExposureExpected: number;
    maintenanceExposureExpected?: number;
    vehicleQualityScore?: number;
    countryCode?: CountryCode;
    isDemo?: boolean;
  }): TargetPriceResultExtended {
    return NegotiationEngine.calculateTargetPrice(params);
  }

  /**
   * Generate tactical negotiation proposal (FASE 6)
   */
  static generateNegotiationProposal(params: {
    askingPrice: number;
    fairMarketRange?: { minimum: number; median: number; maximum: number };
    repairExposureExpected: number;
    maintenanceExposureExpected?: number;
    vehicleQualityScore?: number;
    countryCode?: CountryCode;
    detectedDefects?: string[];
    isDemo?: boolean;
  }): NegotiationProposal {
    return NegotiationEngine.generateProposal(params);
  }

  /**
   * Run advanced what-if simulation (FASE 6)
   */
  static runWhatIfSimulation(
    input: WhatIfSimulationInput,
    countryCode?: CountryCode
  ): WhatIfSimulationOutput {
    return WhatIfEngine.simulate(input, countryCode);
  }

  /**
   * Compare ownership entry cost across global markets (FASE 6)
   */
  static compareOwnershipCost(params: {
    vehicleName: string;
    basePriceEUR: number;
    year: number;
    mileageKm: number;
    standardLaborHours?: number;
    targetCountries?: CountryCode[];
  }): CountryOwnershipComparisonResult {
    return CountryComparisonEngine.compareOwnershipCost(params);
  }
}
