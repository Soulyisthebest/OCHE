import { EvidenceType } from './evidence';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface RiskFactor {
  id: string;
  category: 'visual' | 'model_flaw' | 'maintenance' | 'mileage' | 'financial' | 'unknown';
  title: string;
  description: string;
  impactScore: number; // 0 (no impact) to 30 (severe impact)
  evidenceType: EvidenceType;
  confidence: number;
}

export interface RiskAssessment {
  overallLevel: RiskLevel;
  overallRiskScore: number; // 0 (safest) to 100 (highest risk)
  factors: RiskFactor[];
  summary: string;
  exposureCostEstimated: {
    min: number;
    max: number;
  };
  criticalAlerts: string[];
}

export function getRiskLevelBadge(level: RiskLevel): { label: string; bg: string; text: string; border: string; emoji: string } {
  switch (level) {
    case 'LOW':
      return {
        label: 'RIESGO BAJO',
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        emoji: '🟢'
      };
    case 'MEDIUM':
      return {
        label: 'RIESGO MEDIO / NEGOCIAR',
        bg: 'bg-amber-500/20',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        emoji: '🟡'
      };
    case 'HIGH':
      return {
        label: 'ALTO RIESGO',
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        border: 'border-red-500/30',
        emoji: '🔴'
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'RIESGO INDETERMINADO',
        bg: 'bg-slate-500/20',
        text: 'text-slate-300',
        border: 'border-slate-500/30',
        emoji: '⚪'
      };
  }
}
