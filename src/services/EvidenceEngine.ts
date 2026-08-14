import { EvidenceItem, EvidenceType, StructuredFinding, getConfidenceTier } from '../types/evidence';
import { VisualObservation, ModelProCon, RepairItem } from '../types';

export class EvidenceEngine {
  /**
   * Classify a visual photo observation
   */
  static classifyVisualObservation(obs: VisualObservation): StructuredFinding {
    const isDirectlySeen = obs.status === 'warning' || obs.status === 'danger' || obs.status === 'good';
    const evidenceType: EvidenceType = isDirectlySeen ? 'OBSERVED' : 'UNKNOWN';
    const confidence = isDirectlySeen ? 0.88 : 0.4;

    return {
      id: `ev-vis-${Math.random().toString(36).substring(2, 9)}`,
      title: obs.title,
      description: obs.description,
      evidenceType,
      confidence,
      confidenceTier: getConfidenceTier(confidence),
      componentAffected: obs.part,
      recommendedAction: obs.actionRequired,
      source: 'Inspección fotográfica visual',
      isDemo: false
    };
  }

  /**
   * Classify a known model flaw / endemic issue
   */
  static classifyKnownModelFlaw(proCon: ModelProCon): StructuredFinding {
    const evidenceType: EvidenceType = proCon.isModelGeneral ? 'KNOWN' : 'OBSERVED';
    const confidence = proCon.isModelGeneral ? 0.95 : 0.8;

    return {
      id: `ev-known-${Math.random().toString(36).substring(2, 9)}`,
      title: proCon.title,
      description: proCon.description,
      evidenceType,
      confidence,
      confidenceTier: getConfidenceTier(confidence),
      source: 'Base de conocimiento técnico de modelos',
      isDemo: false
    };
  }

  /**
   * Classify an inferred maintenance or repair need from mileage and age
   */
  static classifyInferredMaintenance(repair: RepairItem, mileageKm?: number): StructuredFinding {
    const isDirectlyObserved = repair.priority === 'Alta' && !repair.isDemoData;
    const evidenceType: EvidenceType = isDirectlyObserved ? 'OBSERVED' : 'INFERRED';
    const confidence = isDirectlyObserved ? 0.85 : 0.65;

    return {
      id: `ev-rep-${repair.id}`,
      title: repair.partName,
      description: `${repair.whatItDoes} — ${repair.whyAttentionNeeded}`,
      evidenceType,
      confidence,
      confidenceTier: getConfidenceTier(confidence),
      componentAffected: repair.partName,
      source: mileageKm ? `Estimación por kilometraje (${mileageKm.toLocaleString('es-ES')} km)` : 'Evaluación preventiva',
      isDemo: Boolean(repair.isDemoData)
    };
  }

  /**
   * Categorize all findings of a report into evidence buckets
   */
  static categorizeFindings(
    visual: VisualObservation[],
    prosCons: ModelProCon[],
    repairs: RepairItem[],
    mileageKm?: number
  ): {
    observed: StructuredFinding[];
    known: StructuredFinding[];
    inferred: StructuredFinding[];
    unknown: StructuredFinding[];
  } {
    const observed: StructuredFinding[] = [];
    const known: StructuredFinding[] = [];
    const inferred: StructuredFinding[] = [];
    const unknown: StructuredFinding[] = [];

    // Process visual items
    visual.forEach((v) => {
      const finding = this.classifyVisualObservation(v);
      if (finding.evidenceType === 'OBSERVED') observed.push(finding);
      else unknown.push(finding);
    });

    // Process pros/cons
    prosCons.forEach((pc) => {
      const finding = this.classifyKnownModelFlaw(pc);
      if (finding.evidenceType === 'KNOWN') known.push(finding);
      else if (finding.evidenceType === 'OBSERVED') observed.push(finding);
      else inferred.push(finding);
    });

    // Process repairs
    repairs.forEach((rep) => {
      const finding = this.classifyInferredMaintenance(rep, mileageKm);
      if (finding.evidenceType === 'OBSERVED') observed.push(finding);
      else if (finding.evidenceType === 'INFERRED') inferred.push(finding);
      else unknown.push(finding);
    });

    // Add required internal dynamic test unknowns
    unknown.push({
      id: 'ev-unk-compression',
      title: 'Compresión interna y desgaste de cilindros',
      description: 'El estado interno de compresión del motor y desgaste de aros de pistón no puede comprobarse en foto.',
      evidenceType: 'UNKNOWN',
      confidence: 0.2,
      confidenceTier: 'Necesita revisión',
      recommendedAction: 'Prueba de compresión en taller o prueba en carretera sin tirones.',
      source: 'Límite de inspección fotográfica',
      isDemo: false
    });

    return { observed, known, inferred, unknown };
  }
}
