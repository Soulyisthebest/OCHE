import { describe, it, expect } from 'vitest';
import { calculatePurchaseScore, getPurchaseRecommendation } from '../utils/scoreCalculator';
import { calculateRealCost } from '../utils/costCalculator';

describe('CARCHECK AI — Score, Cost & Recommendation Engines', () => {
  describe('calculatePurchaseScore', () => {
    it('returns COMPRAR verdict for high score (>= 80)', () => {
      const result = calculatePurchaseScore({
        reliability: 90,
        visibleState: 85,
        maintenance: 80,
        priceValue: 85,
        mechanicalRisk: 90
      });

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.code).toBe('BUY');
      expect(result.verdictText).toBe('🟢 COMPRAR');
      expect(result.color).toBe('emerald');
    });

    it('returns NEGOCIAR verdict for medium score (60 - 79)', () => {
      const result = calculatePurchaseScore({
        reliability: 70,
        visibleState: 65,
        maintenance: 70,
        priceValue: 60,
        mechanicalRisk: 65
      });

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThan(80);
      expect(result.code).toBe('NEGOTIATE');
      expect(result.verdictText).toBe('🟡 NEGOCIAR');
      expect(result.color).toBe('amber');
    });

    it('returns NO COMPRAR verdict for low score (< 60)', () => {
      const result = calculatePurchaseScore({
        reliability: 40,
        visibleState: 50,
        maintenance: 30,
        priceValue: 40,
        mechanicalRisk: 30
      });

      expect(result.score).toBeLessThan(60);
      expect(result.code).toBe('AVOID');
      expect(result.verdictText).toBe('🔴 NO COMPRAR');
      expect(result.color).toBe('red');
    });
  });

  describe('getPurchaseRecommendation', () => {
    it('returns BUY for 85', () => {
      const rec = getPurchaseRecommendation(85);
      expect(rec.code).toBe('BUY');
      expect(rec.verdictText).toBe('🟢 COMPRAR');
      expect(rec.reason).toBeTruthy();
    });

    it('returns NEGOTIATE for 70', () => {
      const rec = getPurchaseRecommendation(70);
      expect(rec.code).toBe('NEGOTIATE');
      expect(rec.verdictText).toBe('🟡 NEGOCIAR');
      expect(rec.reason).toBeTruthy();
    });

    it('returns AVOID for 45', () => {
      const rec = getPurchaseRecommendation(45);
      expect(rec.code).toBe('AVOID');
      expect(rec.verdictText).toBe('🔴 NO COMPRAR');
      expect(rec.reason).toBeTruthy();
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

