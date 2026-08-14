import { VehicleAnalysisSession, ImageAnalysisItem, CostDetailItem, TargetPriceResult } from '../types/analysisSession';
import { PurchaseScoreResult } from './PurchaseScoreEngine';
import { RiskAssessment } from '../types/risk';
import { StructuredFinding } from '../types/evidence';

export class ValidationService {
  /**
   * Clamp a number safely between min and max, preventing NaN or Infinity
   */
  static clampNumber(value: any, min: number, max: number, defaultValue: number = min): number {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Safe positive monetary value
   */
  static safePrice(value: any, defaultValue: number = 0): number {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value < 0) {
      return Math.max(0, defaultValue);
    }
    return Math.round(value * 100) / 100;
  }

  /**
   * Safe score between 0 and 100
   */
  static safeScore(value: any, defaultValue: number = 50): number {
    return Math.round(this.clampNumber(value, 0, 100, defaultValue));
  }

  /**
   * Safe confidence between 0.0 and 1.0
   */
  static safeConfidence(value: any, defaultValue: number = 0.5): number {
    const num = this.clampNumber(value, 0.0, 1.0, defaultValue);
    return Math.round(num * 100) / 100;
  }

  /**
   * Safe non-empty string fallback
   */
  static safeString(value: any, fallback: string = ''): string {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  /**
   * Validate and sanitize an entire StructuredFinding
   */
  static sanitizeFinding(finding: Partial<StructuredFinding>): StructuredFinding {
    const confidence = this.safeConfidence(finding.confidence, 0.7);
    return {
      id: this.safeString(finding.id, `finding-${Math.random().toString(36).substring(2, 8)}`),
      title: this.safeString(finding.title, 'Observación sin título'),
      description: this.safeString(finding.description, 'Sin descripción detallada.'),
      evidenceType: finding.evidenceType || 'UNKNOWN',
      confidence,
      confidenceTier: confidence >= 0.8 ? 'Alta confianza' : confidence >= 0.5 ? 'Confianza media' : 'Necesita revisión',
      componentAffected: finding.componentAffected ? this.safeString(finding.componentAffected) : undefined,
      recommendedAction: finding.recommendedAction ? this.safeString(finding.recommendedAction) : undefined,
      source: this.safeString(finding.source, 'Inspección del sistema'),
      isDemo: Boolean(finding.isDemo)
    };
  }

  /**
   * Validate and sanitize a CostDetailItem
   */
  static sanitizeCostItem(item: Partial<CostDetailItem>): CostDetailItem {
    const minPart = this.safePrice(item.partCost?.min, 0);
    const maxPart = this.safePrice(item.partCost?.max, minPart);
    const expPart = this.safePrice(item.partCost?.expected, (minPart + maxPart) / 2);

    const minLabor = this.safePrice(item.laborCost?.min, 0);
    const maxLabor = this.safePrice(item.laborCost?.max, minLabor);
    const expLabor = this.safePrice(item.laborCost?.expected, (minLabor + maxLabor) / 2);

    const minimum = minPart + minLabor;
    const maximum = maxPart + maxLabor;
    const expected = expPart + expLabor;

    return {
      id: this.safeString(item.id, `cost-item-${Math.random().toString(36).substring(2, 8)}`),
      name: this.safeString(item.name, 'Elemento de reparación'),
      category: this.safeString(item.category, 'Mantenimiento general'),
      urgency: item.urgency || 'Media',
      partCost: { min: minPart, expected: expPart, max: maxPart },
      laborCost: { min: minLabor, expected: expLabor, max: maxLabor },
      minimum,
      expected,
      maximum,
      isDemo: Boolean(item.isDemo),
      reason: this.safeString(item.reason, 'Revisión por kilometraje o estado visual.'),
      howToCheck: Array.isArray(item.howToCheck) && item.howToCheck.length > 0
        ? item.howToCheck.map((s) => this.safeString(s))
        : ['Comprobar holguras y fugas visualmente.', 'Realizar prueba de funcionamiento en marcha.']
    };
  }

  /**
   * Validate and sanitize a complete VehicleAnalysisSession
   */
  static sanitizeSession(session: Partial<VehicleAnalysisSession>): VehicleAnalysisSession {
    const askingPrice = typeof session.askingPrice === 'number'
      ? this.safePrice(session.askingPrice, 0)
      : undefined;

    const mileage = typeof session.mileage === 'number'
      ? (isNaN(session.mileage) ? 120000 : this.safePrice(session.mileage, 120000))
      : undefined;

    const year = typeof session.year === 'number'
      ? Math.round(this.clampNumber(session.year, 1970, new Date().getFullYear() + 1, 2015))
      : undefined;

    return {
      id: this.safeString(session.id, `session-${Date.now()}`),
      createdAt: this.safeString(session.createdAt, new Date().toISOString()),
      status: session.status || 'READY',
      vehicle: session.vehicle || null,
      identification: session.identification || null,
      askingPrice,
      mileage,
      year,
      location: session.location ? this.safeString(session.location) : undefined,
      fuel: session.fuel ? this.safeString(session.fuel) : undefined,
      transmission: session.transmission ? this.safeString(session.transmission) : undefined,
      photos: Array.isArray(session.photos) ? session.photos : [],
      observations: Array.isArray(session.observations) ? session.observations.map(this.sanitizeFinding.bind(this)) : [],
      knownProblems: Array.isArray(session.knownProblems) ? session.knownProblems : [],
      maintenanceFindings: Array.isArray(session.maintenanceFindings) ? session.maintenanceFindings : [],
      riskFindings: session.riskFindings || {
        overallLevel: 'LOW',
        overallRiskScore: 20,
        factors: [],
        summary: 'Evaluación preliminar completada.',
        exposureCostEstimated: { min: 0, max: 0 },
        criticalAlerts: []
      },
      riskDetails: session.riskDetails || {
        visualRisk: { riskType: 'visualRisk', label: 'Riesgo Visual', level: 'LOW', causes: [], inspectionNeeded: [], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.8, explanation: 'Aspecto visual general aceptable.', howToCheck: [] },
        knownProblemRisk: { riskType: 'knownProblemRisk', label: 'Fallos Conocidos', level: 'LOW', causes: [], inspectionNeeded: [], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.9, explanation: 'Sin averías endémicas graves.', howToCheck: [] },
        maintenanceRisk: { riskType: 'maintenanceRisk', label: 'Mantenimiento', level: 'LOW', causes: [], inspectionNeeded: [], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.85, explanation: 'Desgaste acorde a los kilómetros.', howToCheck: [] },
        repairRisk: { riskType: 'repairRisk', label: 'Reparaciones Inmediatas', level: 'LOW', causes: [], inspectionNeeded: [], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.85, explanation: 'Sin reparaciones urgentes.', howToCheck: [] },
        unknownRisk: { riskType: 'unknownRisk', label: 'Elementos Ocultos', level: 'MEDIUM', causes: ['Imposible ver compresión en foto'], inspectionNeeded: ['Prueba de compresión'], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.5, explanation: 'Mecánica profunda no visible.', howToCheck: [] },
        overallRisk: { riskType: 'overallRisk', label: 'Riesgo Global', level: 'LOW', causes: [], inspectionNeeded: [], estimatedCostExposure: { min: 0, max: 0 }, confidence: 0.85, explanation: 'Vehículo en rango seguro.', howToCheck: [] }
      },
      costEstimate: session.costEstimate || {
        askingPrice: askingPrice || 0,
        transferFees: 200,
        initialMaintenanceMin: 200,
        initialMaintenanceMax: 400,
        visibleRepairsMin: 0,
        visibleRepairsMax: 0,
        totalMin: (askingPrice || 0) + 400,
        totalMax: (askingPrice || 0) + 600,
        isDemoData: true
      },
      comprehensiveCost: session.comprehensiveCost || {
        askingPrice: askingPrice || 0,
        transferFees: 200,
        immediateCost: 0,
        possibleCost: 300,
        totalEstimatedCost: (askingPrice || 0) + 500,
        unknownCost: 400,
        isDemo: true,
        items: []
      },
      targetPrice: session.targetPrice || {
        askingPrice: askingPrice || 0,
        estimatedRepairExposure: 300,
        riskAdjustment: 200,
        targetPrice: askingPrice ? Math.max(500, askingPrice - 500) : 0,
        maximumPrice: askingPrice || 0,
        minimumNegotiationPrice: askingPrice ? Math.max(500, askingPrice - 800) : 0,
        hasSufficientData: Boolean(askingPrice),
        negotiationScript: []
      },
      score: session.score || {
        score: 75,
        verdict: 'BUY',
        verdictText: '🟢 BUENA OPCIÓN',
        verdictDescription: 'Vehículo en condiciones adecuadas para compra.',
        badgeColor: 'green',
        categories: [],
        positiveFactors: [],
        negativeFactors: [],
        unknownFactors: []
      },
      decision: session.decision || 'GOOD_DEAL',
      recommendation: this.safeString(session.recommendation, 'Revisar documentación y realizar prueba en carretera.'),
      confidence: this.safeConfidence(session.confidence, 0.85),
      sellerQuestions: Array.isArray(session.sellerQuestions) ? session.sellerQuestions : [],
      mechanicChecklist: Array.isArray(session.mechanicChecklist) ? session.mechanicChecklist : [],
      unknownFactors: Array.isArray(session.unknownFactors) ? session.unknownFactors : [],
      isDemoMode: Boolean(session.isDemoMode)
    };
  }
}
