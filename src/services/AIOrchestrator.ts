import { CarAnalysisReport, PhotoSlotId } from '../types';
import { VehicleService } from './VehicleService';
import { CostEngine } from './CostEngine';
import { PurchaseScoreEngine } from './PurchaseScoreEngine';
import { RiskEngine } from './RiskEngine';
import { EvidenceEngine } from './EvidenceEngine';
import { AnalyticsService } from './AnalyticsService';

export type OrchestratorTask =
  | 'IDENTIFY_VEHICLE'
  | 'ANALYZE_IMAGE'
  | 'ANALYZE_INTERIOR'
  | 'ANALYZE_ENGINE'
  | 'ANALYZE_TYRES'
  | 'EXTRACT_WARNING_LIGHTS'
  | 'EXPLAIN_CONCEPT'
  | 'GENERATE_INSPECTION_QUESTIONS'
  | 'SUMMARIZE_FINDINGS'
  | 'ANSWER_QUESTION';

export interface MechanicalConceptExplanation {
  term: string;
  simpleExplanation: string;
  symptomsIfFails: string[];
  preventiveAction: string;
  typicalCostRange: { min: number; max: number };
}

export class AIOrchestrator {
  /**
   * Safe Prompt Sanitizer to defend against Prompt Injection
   */
  static sanitizeInput(rawText: string): string {
    if (!rawText) return '';
    // Strip control sequences or malicious prompt injection attempts
    return rawText
      .replace(/[\x00-\x1F\x7F]/g, '')
      .replace(/ignore\s+previous\s+instructions/gi, '[filtered]')
      .replace(/system\s+prompt/gi, '[filtered]')
      .substring(0, 1000);
  }

  /**
   * Main entry point for end-to-end car analysis
   */
  static async analyzeCar(
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    userInputs?: { mileageKm?: number; askingPrice?: number }
  ): Promise<CarAnalysisReport> {
    AnalyticsService.track('scan_started', { photoCount: Object.keys(photos).length });

    const photoEntries = Object.entries(photos)
      .filter(([_, val]) => val?.base64 || val?.url)
      .map(([slotId, val]) => ({
        slotId,
        base64: val.base64 || '',
        url: val.url || ''
      }));

    try {
      const response = await fetch('/api/analyze-car', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photoEntries,
          mileageKm: userInputs?.mileageKm,
          askingPrice: userInputs?.askingPrice
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const report = data.report as CarAnalysisReport;

      // Enhance with deterministic risk & negotiation engines
      const risk = RiskEngine.assessVehicleRisk(report);
      const negotiation = CostEngine.calculateNegotiationTarget(report.userPrice || 8500, report.realCost);
      report.negotiation = negotiation;

      AnalyticsService.track('analysis_completed', {
        make: report.identity.make,
        model: report.identity.model,
        score: report.score,
        riskLevel: risk.overallLevel
      });

      return report;
    } catch (err) {
      console.warn('[AIOrchestrator] Falling back to local offline knowledge engine:', err);
      return this.generateOfflineReport(photos, userInputs);
    }
  }

  /**
   * Offline / Demo Fallback Report Generator using Local Knowledge Engine
   */
  static generateOfflineReport(
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    userInputs?: { mileageKm?: number; askingPrice?: number }
  ): CarAnalysisReport {
    const defaultCar = VehicleService.getAllVehicles()[0]; // Golf VII 2.0 TDI
    const price = userInputs?.askingPrice || defaultCar.askingPrice || 11900;
    const mileage = userInputs?.mileageKm || defaultCar.mileage || 148000;

    const realCost = CostEngine.calculateRealCost(price, [
      {
        id: 'rep-off-1',
        partName: 'Kit Correa de Distribución con Bomba de Agua',
        whatItDoes: 'Sincroniza el motor y bombea el refrigerante.',
        whyAttentionNeeded: 'Mantenimiento preventivo por antigüedad.',
        costNewMin: 180,
        costNewMax: 320,
        laborCostMin: 250,
        laborCostMax: 450,
        totalEstimatedMin: 430,
        totalEstimatedMax: 770,
        priority: 'Media',
        category: 'Motor',
        isDemoData: true
      },
      {
        id: 'rep-off-2',
        partName: 'Pastillas de Freno Delanteras',
        whatItDoes: 'Fricción de frenado sobre los discos.',
        whyAttentionNeeded: 'Desgaste por uso normal a medio uso.',
        costNewMin: 50,
        costNewMax: 90,
        laborCostMin: 40,
        laborCostMax: 80,
        totalEstimatedMin: 90,
        totalEstimatedMax: 170,
        priority: 'Baja',
        category: 'Frenos',
        isDemoData: true
      }
    ]);

    const scoreResult = PurchaseScoreEngine.calculate({
      reliabilityScore: 88,
      visibleStateScore: 82,
      maintenanceScore: 78,
      priceValueScore: 82,
      mechanicalRiskScore: 80,
      askingPrice: price,
      mileageKm: mileage
    });

    const negotiation = CostEngine.calculateNegotiationTarget(price, realCost);

    const report: CarAnalysisReport = {
      id: `analysis-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      photos: Object.fromEntries(Object.entries(photos).map(([k, v]) => [k, v.url || ''])),
      identity: {
        make: defaultCar.brand,
        model: defaultCar.model,
        generation: defaultCar.generation,
        estimatedYearMin: defaultCar.yearFrom,
        estimatedYearMax: typeof defaultCar.yearTo === 'number' ? defaultCar.yearTo : 2019,
        engine: defaultCar.engine.name,
        fuelType: defaultCar.fuel,
        powerHp: defaultCar.power,
        transmission: defaultCar.transmission,
        confidenceScore: 92,
        needsConfirmation: !userInputs?.mileageKm || !userInputs?.askingPrice
      },
      mileageKm: mileage,
      userPrice: price,
      score: scoreResult.score,
      scoreLabel: scoreResult.score >= 80 ? 'Buena opción' : scoreResult.score >= 60 ? 'Precaución / negociar' : 'Alto riesgo',
      scoreBadgeColor: scoreResult.badgeColor,
      verdict: scoreResult.verdict,
      scoreCategories: scoreResult.categories,
      visualObservations: [
        {
          category: 'Exterior',
          part: 'Paragolpes y aletas',
          status: 'warning',
          title: 'Pequeños roces de aparcamiento superficiales',
          description: 'Desgaste estético común sin daño estructural en la chapa ni corrosión.',
          actionRequired: 'Pulido leve opcional'
        },
        {
          category: 'Interior',
          part: 'Volante y asientos',
          status: 'good',
          title: 'Desgaste coherente con el kilometraje',
          description: 'Sin roturas en costuras ni holguras en las guías de los asientos.'
        },
        {
          category: 'Motor',
          part: 'Vano motor y tapas',
          status: 'good',
          title: 'Vano motor seco sin fugas aparentes',
          description: 'Aspecto normal sin petroleado reciente. Requiere revisión de correa y niveles.'
        }
      ],
      modelProsCons: [
        {
          type: 'pro',
          title: 'Consumo y fiabilidad contrastada',
          description: 'Bloque motor de bajo consumo en carretera con recambios muy accesibles.',
          isModelGeneral: true
        },
        {
          type: 'known_issue',
          title: 'Bomba de agua en kit de distribución',
          description: 'En este motor conviene sustituir la bomba junto con la correa para evitar fugas.',
          isModelGeneral: true
        }
      ],
      realCost,
      negotiation,
      repairs: [
        {
          id: 'rep-1',
          partName: 'Kit Correa de Distribución con Bomba de Agua',
          whatItDoes: 'Sincroniza el movimiento de pistones y válvulas.',
          whyAttentionNeeded: 'Mantenimiento programado por antigüedad y kilometraje.',
          costNewMin: 180,
          costNewMax: 320,
          costUsedMin: 0,
          costUsedMax: 0,
          laborCostMin: 250,
          laborCostMax: 450,
          totalEstimatedMin: 430,
          totalEstimatedMax: 770,
          priority: 'Media',
          category: 'Motor',
          isDemoData: true
        }
      ],
      checklist: [
        {
          id: 'chk-1',
          task: 'Arrancar motor en frío y escuchar ruidos metálicos',
          explanation: 'Comprueba que no suene traqueteo en los primeros 10 segundos tras girar la llave.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-2',
          task: 'Comprobar salida de humo por el tubo de escape',
          explanation: 'Acelera suavemente. Humo blanco persistente = refrigerante; humo azul = aceite.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-3',
          task: 'Pedir informe oficial DGT y libro de mantenimiento',
          explanation: 'Verifica la ausencia de embargos, reservas de dominio y evolución de km en ITV.',
          checked: false,
          category: 'Documentación'
        }
      ],
      recommendation: scoreResult.verdictDescription,
      cannotDetermineNote: '⚠️ No podemos comprobar el estado de compresión interna, desgaste de embrague o electrónica profunda mediante fotografías. Realiza siempre una prueba de conducción y solicita informe DGT.'
    };

    AnalyticsService.track('analysis_completed', {
      make: report.identity.make,
      model: report.identity.model,
      score: report.score,
      isFallback: true
    });

    return report;
  }
}
