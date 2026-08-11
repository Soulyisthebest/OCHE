import { describe, it, expect } from 'vitest';
import { calculateScore } from '../utils/scoreCalculator';
import { calculateRealCost } from '../utils/costCalculator';

describe('CARCHECK AI — Score & Cost Calculators', () => {
  describe('calculateScore', () => {
    it('returns COMPRAR verdict for high score (>= 80)', () => {
      const result = calculateScore({
        reliability: 90,
        visibleState: 85,
        maintenance: 80,
        priceValue: 85,
        mechanicalRisk: 90
      });

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.verdict).toBe('COMPRAR');
      expect(result.color).toBe('emerald');
    });

    it('returns NEGOCIAR verdict for medium score (60 - 79)', () => {
      const result = calculateScore({
        reliability: 70,
        visibleState: 65,
        maintenance: 70,
        priceValue: 60,
        mechanicalRisk: 65
      });

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(80);
      expect(result.verdict).toBe('NEGOCIAR');
      expect(result.color).toBe('amber');
    });

    it('returns NO COMPRAR verdict for low score (< 60)', () => {
      const result = calculateScore({
        reliability: 40,
        visibleState: 50,
        maintenance: 30,
        priceValue: 40,
        mechanicalRisk: 30
      });

      expect(result.score).toBeLessThan(60);
      expect(result.verdict).toBe('NO COMPRAR');
      expect(result.color).toBe('red');
    });
  });

  describe('calculateRealCost', () => {
    it('calculates exact real cost ranges', () => {
      const result = calculateRealCost({
        askingPrice: 8500,
        transferFee: 200,
        initialMaintenancePrice: 400,
        repairsCostMin: 300,
        repairsCostMax: 700
      });

      expect(result.askingPrice).toBe(8500);
      expect(result.totalMin).toBe(8500 + 200 + 400 + 300); // 9400
      expect(result.totalMax).toBe(8500 + 200 + 400 + 700); // 9800
    });

    it('handles zero repairs correctly', () => {
      const result = calculateRealCost({
        askingPrice: 5000
      });

      expect(result.askingPrice).toBe(5000);
      expect(result.totalMin).toBe(5000 + 200 + 300); // 5500
      expect(result.totalMax).toBe(5500);
    });
  });
});
