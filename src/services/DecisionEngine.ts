import { PurchaseDecision } from '../types/analysisSession';
import { PurchaseScoreResult } from './PurchaseScoreEngine';
import { RiskAssessment } from '../types/risk';
import { RealCostBreakdown } from '../types';

export interface DecisionEngineInput {
  score: number;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  askingPrice?: number;
  estimatedCosts?: number;
  knownFlawsCount: number;
  hasStructuralDamage?: boolean;
}

export class DecisionEngine {
  /**
   * Deterministic logic translating score, mechanical exposure, asking price, and risk into a purchase decision
   */
  static calculatePurchaseDecision(input: DecisionEngineInput): PurchaseDecision {
    const { score, overallRiskLevel, askingPrice, estimatedCosts, knownFlawsCount, hasStructuralDamage } = input;

    // Critical veto rules
    if (hasStructuralDamage) {
      return 'AVOID';
    }

    if (score < 45 || overallRiskLevel === 'HIGH' && knownFlawsCount >= 3) {
      return 'AVOID';
    }

    if (score < 60 || overallRiskLevel === 'HIGH') {
      return 'HIGH_RISK';
    }

    // If repairs represent > 25% of asking price, strongly advise negotiating
    if (askingPrice && estimatedCosts && estimatedCosts > askingPrice * 0.25) {
      return 'NEGOTIATE';
    }

    if (score >= 82 && overallRiskLevel === 'LOW') {
      return 'GOOD_DEAL';
    }

    if (score >= 70) {
      return 'FAIR';
    }

    return 'NEGOTIATE';
  }

  /**
   * Translates PurchaseDecision to user-friendly badge and description
   */
  static getDecisionInfo(decision: PurchaseDecision): {
    label: string;
    description: string;
    color: string;
    bg: string;
    border: string;
    icon: string;
  } {
    switch (decision) {
      case 'GOOD_DEAL':
        return {
          label: 'BUENA OPORTUNIDAD',
          description: 'Vehículo en excelente estado aparente con bajo riesgo mecánico y precio competitivo.',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: '✅'
        };
      case 'FAIR':
        return {
          label: 'COMPRA RAZONABLE',
          description: 'Estado general acorde a su antigüedad. Requiere revisiones habituales sin averías graves.',
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          icon: '👍'
        };
      case 'NEGOTIATE':
        return {
          label: 'NEGOCIAR PRECIO',
          description: 'Interesante si el vendedor asume o descuenta los costes de mantenimiento o reparaciones detectados.',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: '⚖️'
        };
      case 'HIGH_RISK':
        return {
          label: 'ALTO RIESGO',
          description: 'Acumula desgastes severos o fallos endémicos costosos. Imprescindible revisión en taller mecánico antes de pagar señal.',
          color: 'text-orange-400',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          icon: '⚠️'
        };
      case 'AVOID':
      default:
        return {
          label: 'DESACONSEJADO / EVITAR',
          description: 'Los costes previstos de reparación y riesgos mecánicos desaconsejan su compra. Se recomienda buscar otra unidad.',
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: '🛑'
        };
    }
  }
}
