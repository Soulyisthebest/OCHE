export interface ScoreBreakdown {
  reliability: number; // 25%
  visibleState: number; // 20%
  maintenance: number; // 20%
  priceValue: number; // 20%
  mechanicalRisk: number; // 15%
}

export interface ScoreResult {
  score: number;
  label: string;
  verdict: 'COMPRAR' | 'NEGOCIAR' | 'NO COMPRAR';
  color: 'emerald' | 'amber' | 'red';
}

export function calculateScore(breakdown: ScoreBreakdown): ScoreResult {
  const weighted =
    breakdown.reliability * 0.25 +
    breakdown.visibleState * 0.20 +
    breakdown.maintenance * 0.20 +
    breakdown.priceValue * 0.20 +
    breakdown.mechanicalRisk * 0.15;

  const score = Math.round(weighted);

  if (score >= 80) {
    return {
      score,
      label: 'Vehículo recomendado (Buena oportunidad)',
      verdict: 'COMPRAR',
      color: 'emerald'
    };
  } else if (score >= 60) {
    return {
      score,
      label: 'Opción aceptable con margen de negociación',
      verdict: 'NEGOCIAR',
      color: 'amber'
    };
  } else {
    return {
      score,
      label: 'Alto riesgo de averías o precio excesivo',
      verdict: 'NO COMPRAR',
      color: 'red'
    };
  }
}
