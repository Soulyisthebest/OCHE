export type EvidenceType = 'OBSERVED' | 'KNOWN' | 'INFERRED' | 'UNKNOWN';

export type ConfidenceTier = 'Alta confianza' | 'Confianza media' | 'Necesita revisión';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  description: string;
  confidence: number; // 0.0 to 1.0
  source?: string;
  isDemo?: boolean;
}

export interface StructuredFinding {
  id: string;
  title: string;
  description: string;
  evidenceType: EvidenceType;
  confidence: number;
  confidenceTier: ConfidenceTier;
  componentAffected?: string;
  recommendedAction?: string;
  source: string;
  isDemo: boolean;
}

export function getConfidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= 0.8) return 'Alta confianza';
  if (confidence >= 0.5) return 'Confianza media';
  return 'Necesita revisión';
}

export function getEvidenceBadge(type: EvidenceType): { label: string; bg: string; text: string; border: string; icon: string } {
  switch (type) {
    case 'OBSERVED':
      return {
        label: 'VISTO EN FOTO',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        icon: '📷'
      };
    case 'KNOWN':
      return {
        label: 'FALLO CONOCIDO DEL MOTOR',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        icon: '📘'
      };
    case 'INFERRED':
      return {
        label: 'DEDUCIDO POR USO / KM',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        icon: '⚡'
      };
    case 'UNKNOWN':
    default:
      return {
        label: 'NO COMPROBABLE EN FOTO',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        icon: '🔍'
      };
  }
}
