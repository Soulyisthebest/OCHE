import { describe, it, expect } from 'vitest';
import { ValidationService } from '../services/ValidationService';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { RiskEngine } from '../services/RiskEngine';
import { CostEngine } from '../services/CostEngine';
import { PurchaseScoreEngine } from '../services/PurchaseScoreEngine';
import { DecisionEngine } from '../services/DecisionEngine';
import { AnalysisSessionService } from '../services/AnalysisSessionService';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

describe('Phase 3 Real Vehicle Analysis Engine Pipeline', () => {
  describe('ValidationService', () => {
    it('sanitizes numbers and prevents NaN', () => {
      expect(ValidationService.clampNumber(NaN, 0, 100, 50)).toBe(50);
      expect(ValidationService.clampNumber(-10, 0, 100, 50)).toBe(0);
      expect(ValidationService.clampNumber(150, 0, 100, 50)).toBe(100);
      expect(ValidationService.safePrice(-500, 0)).toBe(0);
      expect(ValidationService.safePrice(NaN, 1000)).toBe(1000);
    });

    it('sanitizes complete session object without crashing', () => {
      const sanitized = ValidationService.sanitizeSession({
        id: 'test-session',
        status: 'READY',
        askingPrice: -100,
        mileage: NaN
      });

      expect(sanitized.id).toBe('test-session');
      expect(sanitized.status).toBe('READY');
      expect(sanitized.askingPrice).toBe(0);
      expect(sanitized.mileage).toBe(120000);
      expect(sanitized.score.score).toBeGreaterThanOrEqual(0);
      expect(sanitized.score.score).toBeLessThanOrEqual(100);
    });
  });

  describe('VehicleIdentificationService', () => {
    it('identifies top candidate based on user hints and database match', async () => {
      const result = await VehicleIdentificationService.identifyVehicle(
        { front: { url: 'data:image/jpeg;base64,sample' } },
        {
          askingPrice: 8500,
          mileageKm: 140000,
          year: 2015,
          fuel: 'Diésel',
          brandHint: 'Volkswagen',
          modelHint: 'Golf'
        },
        localVehicleRepository
      );

      expect(result.brand).toBe('Volkswagen');
      expect(result.model).toBe('Golf');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.candidates.length).toBeGreaterThan(0);
      expect(result.evidence.length).toBeGreaterThan(0);
    });

    it('generates context-specific photo analysis', () => {
      const frontItem = VehicleIdentificationService.analyzePhotoContext('front', 'http://photo.jpg');
      const engineItem = VehicleIdentificationService.analyzePhotoContext('engine', 'http://engine.jpg');

      expect(frontItem.type).toBe('front');
      expect(frontItem.observations[0].componentAffected).toContain('faros');

      expect(engineItem.type).toBe('engine');
      expect(engineItem.observations[0].componentAffected).toContain('motor');
    });
  });

  describe('RiskEngine', () => {
    it('computes 6 distinct detailed risk categories with explanations', async () => {
      const golf = await localVehicleRepository.getDomainVehicleById('golf-7-tdi');

      const detailed = RiskEngine.assessDetailedRisk(
        [
          {
            id: 'obs-1',
            title: 'Fuga leve',
            description: 'Rezume en manguito secundario',
            evidenceType: 'OBSERVED',
            confidence: 0.85,
            confidenceTier: 'Alta confianza',
            source: 'Foto motor',
            isDemo: false
          }
        ],
        golf,
        150000,
        9000
      );

      expect(detailed.details.visualRisk).toBeDefined();
      expect(detailed.details.knownProblemRisk).toBeDefined();
      expect(detailed.details.maintenanceRisk).toBeDefined();
      expect(detailed.details.repairRisk).toBeDefined();
      expect(detailed.details.unknownRisk).toBeDefined();
      expect(detailed.details.overallRisk).toBeDefined();

      expect(detailed.details.visualRisk.howToCheck.length).toBeGreaterThan(0);
      expect(detailed.details.unknownRisk.causes.length).toBeGreaterThan(0);
      expect(detailed.assessment.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(detailed.assessment.overallRiskScore).toBeLessThanOrEqual(100);
    });
  });

  describe('CostEngine', () => {
    it('calculates comprehensive costs with part and labor details', async () => {
      const golf = await localVehicleRepository.getDomainVehicleById('golf-7-tdi');
      const costEstimate = CostEngine.calculateComprehensiveCost(
        8500,
        golf,
        [],
        145000,
        true
      );

      expect(costEstimate.askingPrice).toBe(8500);
      expect(costEstimate.transferFees).toBeGreaterThan(0);
      expect(costEstimate.immediateCost).toBeGreaterThan(0);
      expect(costEstimate.items.length).toBeGreaterThan(0);
      expect(costEstimate.totalEstimatedCost).toBeGreaterThan(costEstimate.askingPrice);

      const firstItem = costEstimate.items[0];
      expect(firstItem.partCost.expected).toBeGreaterThan(0);
      expect(firstItem.laborCost.expected).toBeGreaterThan(0);
      expect(firstItem.howToCheck.length).toBeGreaterThan(0);
    });

    it('calculates target negotiation price envelope', () => {
      const target = CostEngine.calculateTargetPrice(10000, 600, 200);

      expect(target.hasSufficientData).toBe(true);
      expect(target.targetPrice).toBeLessThan(10000);
      expect(target.maximumPrice).toBeLessThanOrEqual(10000);
      expect(target.minimumNegotiationPrice).toBeLessThan(target.targetPrice);
      expect(target.negotiationScript.length).toBeGreaterThan(0);
    });

    it('recalculates what-if scenario simulation without mutating original data', () => {
      const result = CostEngine.simulateWhatIf(
        9000,
        85,
        [],
        ['wi-clutch', 'wi-timing']
      );

      expect(result.simulatedTotalExpected).toBeGreaterThan(result.baseTotalExpected);
      expect(result.adjustedScore).toBeLessThan(85);
      expect(result.negotiationScript.length).toBeGreaterThan(0);
    });
  });

  describe('PurchaseScoreEngine & DecisionEngine', () => {
    it('calculates bounded purchase score and 5 pillar breakdown', () => {
      const scoreRes = PurchaseScoreEngine.calculate({
        reliabilityScore: 90,
        visibleStateScore: 85,
        maintenanceScore: 80,
        priceValueScore: 75,
        mechanicalRiskScore: 85,
        askingPrice: 9000,
        mileageKm: 120000
      });

      expect(scoreRes.score).toBeGreaterThanOrEqual(80);
      expect(scoreRes.verdict).toBe('BUY');
      expect(scoreRes.categories.length).toBe(5);
      expect(scoreRes.positiveFactors.length).toBeGreaterThan(0);
    });

    it('calculates deterministic purchase decision', () => {
      const decisionBuy = DecisionEngine.calculatePurchaseDecision({
        score: 85,
        overallRiskLevel: 'LOW',
        askingPrice: 10000,
        estimatedCosts: 300,
        knownFlawsCount: 1
      });
      expect(decisionBuy).toBe('GOOD_DEAL');

      const decisionAvoid = DecisionEngine.calculatePurchaseDecision({
        score: 35,
        overallRiskLevel: 'HIGH',
        askingPrice: 10000,
        estimatedCosts: 4000,
        knownFlawsCount: 4,
        hasStructuralDamage: true
      });
      expect(decisionAvoid).toBe('AVOID');
    });
  });

  describe('AnalysisSessionService End-to-End', () => {
    it('executes full pipeline and outputs valid session and legacy report', async () => {
      const progressSteps: string[] = [];

      const session = await AnalysisSessionService.runAnalysis(
        {
          photos: {
            front: { url: 'http://test.com/front.jpg' },
            engine: { url: 'http://test.com/engine.jpg' }
          },
          askingPrice: 8900,
          mileageKm: 145000,
          year: 2015,
          fuel: 'Diésel'
        },
        (status) => progressSteps.push(status)
      );

      expect(session.id).toBeDefined();
      expect(session.status).toBe('READY');
      expect(session.score.score).toBeGreaterThan(0);
      expect(session.comprehensiveCost.items.length).toBeGreaterThan(0);
      expect(session.sellerQuestions.length).toBeGreaterThan(0);
      expect(session.mechanicChecklist.length).toBeGreaterThan(0);

      // Verify progress callbacks fired
      expect(progressSteps).toContain('SCANNING');
      expect(progressSteps).toContain('IDENTIFYING');
      expect(progressSteps).toContain('ANALYZING');
      expect(progressSteps).toContain('CALCULATING');
      expect(progressSteps).toContain('READY');

      // Verify legacy conversion
      const legacyReport = AnalysisSessionService.sessionToLegacyReport(session);
      expect(legacyReport.identity.make).toBeDefined();
      expect(legacyReport.realCost.totalMin).toBeGreaterThan(0);
      expect(legacyReport.repairs.length).toBeGreaterThan(0);
    });
  });
});
