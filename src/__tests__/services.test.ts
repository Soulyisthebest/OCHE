import { describe, it, expect } from 'vitest';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { RiskEngine } from '../services/RiskEngine';
import { PurchaseScoreEngine } from '../services/PurchaseScoreEngine';
import { CostEngine } from '../services/CostEngine';
import { VINService } from '../services/VINService';
import { AIOrchestrator } from '../services/AIOrchestrator';

describe('OCHE Service Layer Suite', () => {
  describe('VINService', () => {
    it('validates VIN length and format', () => {
      expect(VINService.validate('WVWZZZ1KZ9W123456')).toBe(true);
      expect(VINService.validate('INVALID_VIN')).toBe(false);
      expect(VINService.validate('12345678901234567')).toBe(true);
    });

    it('decodes WMI correctly', () => {
      const decoded = VINService.decode('WVWZZZ1KZ9W123456');
      expect(decoded.isValid).toBe(true);
      expect(decoded.make).toBe('Volkswagen');
      expect(decoded.country).toBe('Alemania');
    });
  });

  describe('EvidenceEngine', () => {
    it('categorizes findings into structured tiers', () => {
      const result = EvidenceEngine.categorizeFindings(
        [
          {
            category: 'Exterior',
            part: 'Aleta',
            status: 'warning',
            title: 'Arañazo visible en foto',
            description: 'Laca dañada'
          }
        ],
        [
          {
            type: 'known_issue',
            title: 'Válvula EGR',
            description: 'Carbonilla frecuente en este motor',
            isModelGeneral: true
          }
        ],
        [],
        120000
      );

      expect(result.observed.length).toBeGreaterThan(0);
      expect(result.known.length).toBeGreaterThan(0);
      expect(result.unknown.length).toBeGreaterThan(0);
    });
  });

  describe('CostEngine & What-If Simulator', () => {
    it('calculates real total cost with margins', () => {
      const cost = CostEngine.calculateRealCost(10000, [
        {
          id: '1',
          partName: 'Pastillas freno',
          whatItDoes: 'Frena',
          whyAttentionNeeded: 'Desgaste',
          costNewMin: 50,
          costNewMax: 100,
          laborCostMin: 40,
          laborCostMax: 60,
          totalEstimatedMin: 90,
          totalEstimatedMax: 160,
          priority: 'Media',
          category: 'Frenos'
        }
      ]);

      expect(cost.askingPrice).toBe(10000);
      expect(cost.totalMin).toBeGreaterThan(10000);
      expect(cost.totalMax).toBeGreaterThan(cost.totalMin);
    });

    it('simulates what-if scenarios accurately', () => {
      const sim = CostEngine.simulateWhatIf(8000, 80, [], ['wi-timing', 'wi-clutch']);
      expect(sim.simulatedTotalExpected).toBeGreaterThan(8000);
      expect(sim.adjustedScore).toBeLessThan(80);
      expect(sim.newTargetNegotiationMin).toBeLessThan(8000);
    });
  });

  describe('AIOrchestrator Offline Determinism', () => {
    it('generates a full structured report in offline mode', async () => {
      const report = await AIOrchestrator.analyzeCar(
        { front: { url: 'https://example.com/car.jpg' } },
        { mileageKm: 140000, askingPrice: 7500 }
      );

      expect(report.id).toBeDefined();
      expect(report.identity.make).toBeDefined();
      expect(report.score).toBeGreaterThan(0);
      expect(report.score).toBeLessThanOrEqual(100);
      expect(report.realCost.totalMin).toBeGreaterThan(7000);
    });
  });
});
