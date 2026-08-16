/**
 * OCHE / CARCHECK AI — Deal Score Engine (FASE 6)
 * Quantifies financial deal quality independently from physical vehicle mechanical condition.
 * 
 * Strict Principle:
 * VehicleScore = "How mechanically sound is the vehicle?"
 * DealScore = "How attractive is the asking price relative to market value & repair exposure?"
 */

import { DealScoreResult, DealRating } from '../types/costIntelligence';
import { ValidationService } from './ValidationService';

export class DealScoreEngine {
  /**
   * Calculate independent Deal Score (0 to 100)
   */
  static calculateDealScore(params: {
    askingPrice: number;
    fairMarketMedian: number;
    vehicleQualityScore: number; // 0 - 100
    repairExposureExpected: number;
    totalEntryCostExpected: number;
    isDemo?: boolean;
  }): DealScoreResult {
    const askingPrice = ValidationService.safePrice(params.askingPrice, 0);
    const fairMedian = ValidationService.safePrice(params.fairMarketMedian, askingPrice || 10000);
    const vehicleScore = ValidationService.safeScore(params.vehicleQualityScore, 75);
    const repairExp = ValidationService.safePrice(params.repairExposureExpected, 0);

    if (askingPrice <= 0 || fairMedian <= 0) {
      return {
        dealScore: 50,
        rating: 'FAIR_PRICE',
        vehicleQualityScore: vehicleScore,
        askingPrice,
        fairMarketMedian: fairMedian,
        priceDifferenceVsFair: 0,
        percentageDifferenceVsFair: 0,
        repairExposureExpected: repairExp,
        totalEntryCostExpected: params.totalEntryCostExpected || askingPrice,
        verdict: 'FAIR_PRICE',
        explanation: 'Datos insuficientes para valorar el precio de mercado con precisión.',
        isDemo: params.isDemo ?? true
      };
    }

    // 1. Price relative to fair market median (positive = overpriced, negative = discount)
    const priceDiff = askingPrice - fairMedian;
    const percentageDiff = (priceDiff / fairMedian) * 100;

    // 2. Net Effective Value = Asking Price + Immediate Repair Exposure vs Fair Median
    const effectiveTotalCarCost = askingPrice + repairExp;
    const effectiveDiff = effectiveTotalCarCost - fairMedian;
    const effectivePercentageDiff = (effectiveDiff / fairMedian) * 100;

    // 3. Score calculation (Base 50 at fair market + repairs)
    // -20% effective price = +30 pts (Score 80)
    // +20% effective price = -30 pts (Score 20)
    let rawDealScore = 50 - (effectivePercentageDiff * 1.5);

    // Minor moderation by vehicle mechanical quality:
    // If the car is mechanically in bad shape (vehicleScore < 50), even a cheap price has execution risk
    if (vehicleScore < 50) {
      rawDealScore -= (50 - vehicleScore) * 0.3;
    } else if (vehicleScore > 85) {
      rawDealScore += (vehicleScore - 85) * 0.2; // premium for pristine condition
    }

    const dealScore = ValidationService.safeScore(rawDealScore);

    // 4. Rating & Verdict
    let rating: DealRating = 'FAIR_PRICE';
    let explanation = '';

    if (dealScore >= 85) {
      rating = 'EXCELLENT_DEAL';
      explanation = `Excelente oportunidad: el precio está un ${Math.abs(Math.round(percentageDiff))}% por debajo del valor medio de mercado incluso considerando las reparaciones necesarias.`;
    } else if (dealScore >= 70) {
      rating = 'GOOD_DEAL';
      explanation = `Buena oferta: precio competitivo acorde al estado del vehículo y costes de puesta a punto.`;
    } else if (dealScore >= 50) {
      rating = 'FAIR_PRICE';
      explanation = `Precio razonable de mercado: ni caro ni barato. Recomendable negociar para absorber los costes de taller.`;
    } else if (dealScore >= 35) {
      rating = 'OVERPRICED';
      explanation = `Sobreprecio detectado: el vehículo pide más de lo que vale considerando la exposición a reparaciones inmediatas.`;
    } else {
      rating = 'TERRIBLE_DEAL';
      explanation = `Operación desaconsejada: precio excesivo sumado a un alto coste de reparaciones para poner el coche al día.`;
    }

    return {
      dealScore,
      rating,
      vehicleQualityScore: vehicleScore,
      askingPrice,
      fairMarketMedian: fairMedian,
      priceDifferenceVsFair: priceDiff,
      percentageDifferenceVsFair: Math.round(percentageDiff * 10) / 10,
      repairExposureExpected: repairExp,
      totalEntryCostExpected: params.totalEntryCostExpected || effectiveTotalCarCost,
      verdict: rating,
      explanation,
      isDemo: params.isDemo ?? true
    };
  }
}
