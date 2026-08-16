import { describe, it, expect } from 'vitest';
import { MarketPriceEngine } from '../services/MarketPriceEngine';
import { RepairCostEngine } from '../services/RepairCostEngine';
import { EntryCostEngine } from '../services/EntryCostEngine';
import { DealScoreEngine } from '../services/DealScoreEngine';
import { NegotiationEngine } from '../services/NegotiationEngine';
import { WhatIfEngine } from '../services/WhatIfEngine';
import { CountryComparisonEngine } from '../services/CountryComparisonEngine';
import { CostEngine } from '../services/CostEngine';
import { GLOBAL_LABOR_RATES, GLOBAL_TAX_CONFIGURATIONS } from '../data/globalCostDatabase';

describe('FASE 6: Global Cost & Market Intelligence Engine', () => {
  describe('MarketPriceEngine', () => {
    it('should estimate fair market price from real observations if available', () => {
      const estimate = MarketPriceEngine.estimateMarketPrice({
        ageYears: 9,
        mileageKm: 145000,
        condition: 'GOOD',
        country: 'ES',
        engine: 'Golf',
        maintenanceHistory: 'FULL_OFFICIAL'
      });

      expect(estimate.status).toBe('AVAILABLE');
      expect(estimate.median).toBeGreaterThan(5000);
      expect(estimate.median).toBeLessThan(25000);
      expect(estimate.minimum).toBeLessThanOrEqual(estimate.median);
      expect(estimate.maximum).toBeGreaterThanOrEqual(estimate.median);
      expect(estimate.currency).toBe('EUR');
      expect(estimate.isDemo).toBe(true);
    });

    it('should calculate depreciation curve model for vehicles without direct observations', () => {
      const estimate = MarketPriceEngine.estimateMarketPrice({
        ageYears: 6,
        mileageKm: 85000,
        condition: 'EXCELLENT',
        country: 'DE',
        engine: '1.6 TDI',
        maintenanceHistory: 'REGULAR_INDEPENDENT'
      });

      expect(estimate.status).toBe('AVAILABLE');
      expect(estimate.median).toBeGreaterThan(4000);
      expect(estimate.confidence).toBeDefined();
      expect(estimate.currency).toBe('EUR');
    });

    it('should return INSUFFICIENT_DATA when invalid factors or missing country is supplied', () => {
      const estimate = MarketPriceEngine.estimateMarketPrice({
        ageYears: NaN,
        mileageKm: -50,
        condition: 'POOR',
        country: '' as any
      });

      expect(estimate.status).toBe('INSUFFICIENT_DATA');
      expect(estimate.median).toBe(0);
      expect(estimate.message).toBeDefined();
    });
  });

  describe('RepairCostEngine', () => {
    it('should differentiate parts pricing across OEM, AFTERMARKET, and USED conditions', () => {
      const repairOEM = RepairCostEngine.estimateRepair({
        repairId: 'rep-waterpump-1',
        title: 'Bomba de agua EA288',
        systemId: 'ENGINE',
        partId: 'part-vw-waterpump',
        partCondition: 'OEM',
        laborHours: 2.5,
        countryCode: 'ES'
      });

      const repairAftermarket = RepairCostEngine.estimateRepair({
        repairId: 'rep-waterpump-2',
        title: 'Bomba de agua EA288',
        systemId: 'ENGINE',
        partId: 'part-vw-waterpump',
        partCondition: 'AFTERMARKET',
        laborHours: 2.5,
        countryCode: 'ES'
      });

      const repairUsed = RepairCostEngine.estimateRepair({
        repairId: 'rep-waterpump-3',
        title: 'Bomba de agua EA288',
        systemId: 'ENGINE',
        partId: 'part-vw-waterpump',
        partCondition: 'USED',
        laborHours: 2.5,
        countryCode: 'ES'
      });

      expect(repairOEM.partsCost.expected).toBeGreaterThan(repairAftermarket.partsCost.expected);
      expect(repairAftermarket.partsCost.expected).toBeGreaterThan(repairUsed.partsCost.expected);
      expect(repairOEM.expected).toBeGreaterThan(repairAftermarket.expected);
    });

    it('should calculate local labor costs based on country rates (ES vs DE vs US)', () => {
      const repairES = RepairCostEngine.estimateRepair({
        repairId: 'rep-clutch',
        title: 'Kit Embrague',
        systemId: 'TRANSMISSION',
        partId: 'part-yaris-clutch',
        laborHours: 4.0,
        countryCode: 'ES'
      });

      const repairDE = RepairCostEngine.estimateRepair({
        repairId: 'rep-clutch',
        title: 'Kit Embrague',
        systemId: 'TRANSMISSION',
        partId: 'part-yaris-clutch',
        laborHours: 4.0,
        countryCode: 'DE'
      });

      // Germany hourly labor rate is significantly higher than Spain
      expect(repairDE.laborCost.expected).toBeGreaterThan(repairES.laborCost.expected);
    });

    it('should generate 3 scenarios: BEST_CASE, EXPECTED, WORST_CASE', () => {
      const repair = RepairCostEngine.estimateRepair({
        repairId: 'rep-generic-brakes',
        title: 'Discos y Pastillas Delanteras',
        systemId: 'BRAKES',
        partId: 'part-generic-brakes-front',
        partCondition: 'AFTERMARKET',
        laborHours: 1.5,
        countryCode: 'ES'
      });

      expect(repair.scenarios.bestCase.totalCost).toBeLessThanOrEqual(repair.scenarios.expected.totalCost);
      expect(repair.scenarios.expected.totalCost).toBeLessThanOrEqual(repair.scenarios.worstCase.totalCost);
      expect(repair.scenarios.bestCase.description).toBeDefined();
      expect(repair.scenarios.worstCase.description).toBeDefined();
    });

    it('should identify unknown cost exposures that require physical workshop diagnosis', () => {
      const exposures = RepairCostEngine.getUnknownCostExposures([]);
      expect(exposures.length).toBeGreaterThan(0);
      expect(exposures[0].requiresDiagnosis).toBe(true);
      expect(exposures[0].message).toContain('Coste desconocido hasta diagnóstico');
    });
  });

  describe('EntryCostEngine', () => {
    it('should calculate full real purchase cost with tax, registration, inspection, and repairs', () => {
      const mockRepair = RepairCostEngine.estimateRepair({
        repairId: 'rep-1',
        title: 'Bomba de agua',
        systemId: 'ENGINE',
        partId: 'part-vw-waterpump',
        laborHours: 2.0,
        countryCode: 'ES'
      });

      const entryCost = EntryCostEngine.calculateRealPurchaseCost({
        purchasePrice: 9500,
        countryCode: 'ES',
        immediateRepairs: [mockRepair],
        maintenanceCostMin: 180,
        maintenanceCostMax: 350,
        inspectionRequired: true
      });

      expect(entryCost.purchasePrice).toBe(9500);
      expect(entryCost.taxExposure).toBeGreaterThan(100); // Spain ITP
      expect(entryCost.registrationExposure).toBeGreaterThan(0); // DGT transfer fee
      expect(entryCost.inspectionExposure).toBeGreaterThan(0); // ITV
      expect(entryCost.totalExpected).toBeGreaterThan(entryCost.purchasePrice);
      expect(entryCost.totalMinimum).toBeLessThanOrEqual(entryCost.totalExpected);
      expect(entryCost.totalMaximum).toBeGreaterThanOrEqual(entryCost.totalExpected);
      expect(entryCost.breakdownItems.length).toBeGreaterThanOrEqual(5);
    });

    it('should adapt tax exposure to US sales tax and UK registration correctly', () => {
      const entryCostUS = EntryCostEngine.calculateRealPurchaseCost({
        purchasePrice: 12000,
        countryCode: 'US'
      });
      expect(entryCostUS.currency).toBe('USD');
      expect(entryCostUS.taxExposure).toBeGreaterThan(0);

      const entryCostUK = EntryCostEngine.calculateRealPurchaseCost({
        purchasePrice: 8500,
        countryCode: 'UK'
      });
      expect(entryCostUK.currency).toBe('GBP');
    });
  });

  describe('DealScoreEngine', () => {
    it('should evaluate a great car at an overpriced cost as a poor deal (separating vehicle quality from deal score)', () => {
      const result = DealScoreEngine.calculateDealScore({
        askingPrice: 15000,
        fairMarketMedian: 10000, // +50% overpriced
        vehicleQualityScore: 92, // Mechanically pristine
        repairExposureExpected: 200,
        totalEntryCostExpected: 15500
      });

      expect(result.vehicleQualityScore).toBe(92);
      expect(result.dealScore).toBeLessThan(45); // Bad deal
      expect(result.verdict).toMatch(/OVERPRICED|TERRIBLE_DEAL/);
    });

    it('should evaluate an average car at a bargain price as an attractive deal', () => {
      const result = DealScoreEngine.calculateDealScore({
        askingPrice: 6500,
        fairMarketMedian: 10000, // 35% discount
        vehicleQualityScore: 70, // Good average condition
        repairExposureExpected: 500,
        totalEntryCostExpected: 7400
      });

      expect(result.vehicleQualityScore).toBe(70);
      expect(result.dealScore).toBeGreaterThan(70);
      expect(result.rating).toMatch(/GOOD_DEAL|EXCELLENT_DEAL/);
    });
  });

  describe('NegotiationEngine', () => {
    it('should compute target price and maximum recommended threshold accounting for repairs', () => {
      const target = NegotiationEngine.calculateTargetPrice({
        askingPrice: 11000,
        fairMarketRange: { minimum: 9500, median: 10500, maximum: 11800 },
        repairExposureExpected: 1200,
        maintenanceExposureExpected: 300,
        countryCode: 'ES'
      });

      expect(target.targetPrice).toBeLessThan(10500);
      expect(target.maximumRecommendedPrice).toBeLessThanOrEqual(target.walkAwayPrice);
      expect(target.walkAwayPrice).toBe(11800);
      expect(target.reasoning.length).toBeGreaterThanOrEqual(3);
    });

    it('should generate structured negotiation proposals with counter-objections', () => {
      const proposal = NegotiationEngine.generateProposal({
        askingPrice: 11000,
        fairMarketRange: { minimum: 9500, median: 10500, maximum: 11800 },
        repairExposureExpected: 1200,
        maintenanceExposureExpected: 300,
        detectedDefects: ['Correa de distribución', 'Discos de freno desgastados'],
        countryCode: 'ES'
      });

      expect(proposal.initialSuggestedOffer).toBeLessThan(proposal.targetPrice);
      expect(proposal.arguments.length).toBeGreaterThanOrEqual(3);
      expect(proposal.sellerObjectionsResponses.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('WhatIfEngine', () => {
    it('should simulate cost reductions when switching to USED or AFTERMARKET parts', () => {
      const simAftermarket = WhatIfEngine.simulate({
        baseAskingPrice: 8000,
        baseVehicleScore: 75,
        baseRepairs: [],
        partConditionPreference: 'AFTERMARKET',
        selectedScenarioIds: ['wi-clutch', 'wi-brakes']
      });

      const simUsed = WhatIfEngine.simulate({
        baseAskingPrice: 8000,
        baseVehicleScore: 75,
        baseRepairs: [],
        partConditionPreference: 'USED',
        selectedScenarioIds: ['wi-clutch', 'wi-brakes']
      });

      expect(simUsed.simulatedTotalExpected).toBeLessThan(simAftermarket.simulatedTotalExpected);
      expect(simUsed.newTargetNegotiationMin).toBeGreaterThan(0);
      expect(simUsed.negotiationScript.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('CountryComparisonEngine', () => {
    it('should compare vehicle entry costs across multiple global markets', () => {
      const comparison = CountryComparisonEngine.compareOwnershipCost({
        vehicleName: 'Volkswagen Golf 2.0 TDI',
        basePriceEUR: 10000,
        year: 2015,
        mileageKm: 140000,
        standardLaborHours: 5.0
      });

      expect(comparison.comparisons.length).toBeGreaterThanOrEqual(5);

      const es = comparison.comparisons.find((c) => c.countryCode === 'ES');
      const de = comparison.comparisons.find((c) => c.countryCode === 'DE');
      const us = comparison.comparisons.find((c) => c.countryCode === 'US');
      const uk = comparison.comparisons.find((c) => c.countryCode === 'UK');

      expect(es).toBeDefined();
      expect(de).toBeDefined();
      expect(us).toBeDefined();
      expect(uk).toBeDefined();

      expect(es?.currency).toBe('EUR');
      expect(us?.currency).toBe('USD');
      expect(uk?.currency).toBe('GBP');
      expect(de?.laborRateHourlyLocal).toBeGreaterThan(es?.laborRateHourlyLocal || 0);
    });
  });

  describe('CostEngine Facade & Backwards Compatibility', () => {
    it('should maintain backwards compatibility with existing calculateRealCost', () => {
      const cost = CostEngine.calculateRealCost(9000, [
        {
          id: '1',
          partName: 'Filtro',
          whatItDoes: 'Filtra el aceite',
          whyAttentionNeeded: 'Mantenimiento',
          costNewMin: 20,
          costNewMax: 40,
          laborCostMin: 30,
          laborCostMax: 60,
          priority: 'Baja',
          category: 'Fluidos',
          totalEstimatedMin: 50,
          totalEstimatedMax: 100,
          isDemoData: true
        }
      ]);

      expect(cost.askingPrice).toBe(9000);
      expect(cost.visibleRepairsMin).toBe(50);
      expect(cost.visibleRepairsMax).toBe(100);
      expect(cost.totalMin).toBeGreaterThan(9000);
    });

    it('should expose Phase 6 modular methods via CostEngine facade', () => {
      const market = CostEngine.estimateMarketPrice({
        ageYears: 8,
        mileageKm: 120000,
        condition: 'GOOD',
        country: 'ES'
      });
      expect(market.status).toBe('AVAILABLE');

      const deal = CostEngine.calculateDealScore({
        askingPrice: 8500,
        fairMarketMedian: 8500,
        vehicleQualityScore: 80,
        repairExposureExpected: 300,
        totalEntryCostExpected: 9200
      });
      expect(deal.dealScore).toBeGreaterThan(0);
    });
  });
});
