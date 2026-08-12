export interface ScoreBreakdown {
  reliability: number; // 25%
  visibleState: number; // 20%
  maintenance: number; // 20%
  priceValue: number; // 20%
  mechanicalRisk: number; // 15%
}

export type RecommendationCode = 'BUY' | 'NEGOTIATE' | 'AVOID';

export interface PurchaseRecommendation {
  code: RecommendationCode;
  verdictText: '🟢 COMPRAR' | '🟡 NEGOCIAR' | '🔴 NO COMPRAR';
  label: string;
  color: 'emerald' | 'amber' | 'red';
  reason: string;
}

export interface ScoreResult extends PurchaseRecommendation {
  score: number;
  verdict: 'COMPRAR' | 'NEGOCIAR' | 'NO COMPRAR';
}

export function getPurchaseRecommendation(score: number): PurchaseRecommendation {
  if (score >= 80) {
    return {
      code: 'BUY',
      verdictText: '🟢 COMPRAR',
      label: 'Vehículo recomendado (Buena oportunidad)',
      color: 'emerald',
      reason: 'El vehículo presenta buena puntuación general en fiabilidad, estado visible y precio.'
    };
  } else if (score >= 60) {
    return {
      code: 'NEGOTIATE',
      verdictText: '🟡 NEGOCIAR',
      label: 'Opción aceptable con margen de negociación',
      color: 'amber',
      reason: 'Existen detalles estéticos o de mantenimiento pendiente que justifican pedir una rebaja en el precio.'
    };
  } else {
    return {
      code: 'AVOID',
      verdictText: '🔴 NO COMPRAR',
      label: 'Alto riesgo de averías o precio excesivo',
      color: 'red',
      reason: 'El estado visible o la fiabilidad del modelo implican un riesgo elevado de reparación costosa.'
    };
  }
}

export function calculatePurchaseScore(breakdown: ScoreBreakdown): ScoreResult {
  const weighted =
    breakdown.reliability * 0.25 +
    breakdown.visibleState * 0.20 +
    breakdown.maintenance * 0.20 +
    breakdown.priceValue * 0.20 +
    breakdown.mechanicalRisk * 0.15;

  const score = Math.round(weighted);
  const rec = getPurchaseRecommendation(score);

  return {
    score,
    ...rec,
    verdict: rec.code === 'BUY' ? 'COMPRAR' : rec.code === 'NEGOTIATE' ? 'NEGOCIAR' : 'NO COMPRAR'
  };
}

export const calculateScore = calculatePurchaseScore;

