import { PhotoSlotId, CarAnalysisReport } from '../types';
import {
  VehicleAnalysisSession,
  AnalysisStatus,
  ImageAnalysisItem
} from '../types/analysisSession';
import { VehicleIdentificationService } from './VehicleIdentificationService';
import { RiskEngine } from './RiskEngine';
import { CostEngine } from './CostEngine';
import { PurchaseScoreEngine } from './PurchaseScoreEngine';
import { DecisionEngine } from './DecisionEngine';
import { EvidenceEngine } from './EvidenceEngine';
import { ValidationService } from './ValidationService';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { AnalyticsService } from './AnalyticsService';

export interface CreateSessionInput {
  photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>;
  askingPrice?: number;
  mileageKm?: number;
  year?: number;
  location?: string;
  fuel?: string;
  transmission?: string;
  brandHint?: string;
  modelHint?: string;
}

export class AnalysisSessionService {
  /**
   * Run the end-to-end vehicle analysis session pipeline
   */
  static async runAnalysis(
    input: CreateSessionInput,
    onProgress?: (status: AnalysisStatus, progressPercent: number, stageMessage: string) => void
  ): Promise<VehicleAnalysisSession> {
    const sessionId = `oche-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    AnalyticsService.track('scan_started', { photoCount: Object.keys(input.photos).length });

    try {
      // 1. SCANNING & CONTEXTUAL PHOTO PROCESSING
      onProgress?.('SCANNING', 20, 'Escaneando fotografías y clasificando perspectivas...');
      const photoItems: ImageAnalysisItem[] = Object.entries(input.photos)
        .filter(([_, val]) => val?.url || val?.base64)
        .map(([slotId, val]) => {
          return VehicleIdentificationService.analyzePhotoContext(
            slotId as PhotoSlotId,
            val.url || val.base64 || ''
          );
        });

      // 2. VEHICLE IDENTIFICATION & KNOWLEDGE MATCHING
      onProgress?.('IDENTIFYING', 45, 'Identificando marca, modelo, generación y bloque motor...');
      const identification = await VehicleIdentificationService.identifyVehicle(
        input.photos,
        {
          askingPrice: input.askingPrice,
          mileageKm: input.mileageKm,
          year: input.year,
          fuel: input.fuel,
          transmission: input.transmission,
          brandHint: input.brandHint,
          modelHint: input.modelHint
        },
        localVehicleRepository
      );

      const matchedVehicle = identification.matchedVehicle || null;

      // 3. EVIDENCE SYNTHESIS & OBSERVATION EXTRACTION
      onProgress?.('ANALYZING', 65, 'Sintetizando evidencias mecánicas y contrastando base de datos...');
      const allObservations = photoItems.flatMap((p) => p.observations);

      const categorizedEvidence = EvidenceEngine.categorizeFindings(
        [
          {
            category: 'Exterior',
            part: 'Carrocería',
            status: 'good',
            title: 'Chapa y pintura',
            description: 'Líneas de carrocería sin descuadres evidentes en las fotos aportadas.'
          },
          {
            category: 'Motor',
            part: 'Vano motor',
            status: 'good',
            title: 'Aspecto del vano motor',
            description: 'Niveles aparentes correctos y sin señales visibles de fugas de aceite activas.'
          }
        ],
        matchedVehicle?.knownProblems.map((kp) => ({
          type: 'known_issue' as const,
          title: kp.title,
          description: kp.description,
          isModelGeneral: true
        })) || [],
        [],
        input.mileageKm || 140000
      );

      // 4. RISK & COST & SCORE COMPUTATION
      onProgress?.('CALCULATING', 85, 'Calculando matriz de riesgo, costes reales y precio objetivo...');

      const detailedRisk = RiskEngine.assessDetailedRisk(
        [...allObservations, ...categorizedEvidence.known, ...categorizedEvidence.inferred, ...categorizedEvidence.unknown],
        matchedVehicle,
        input.mileageKm || 140000,
        input.askingPrice || 10000
      );

      const comprehensiveCost = CostEngine.calculateComprehensiveCost(
        input.askingPrice || 10000,
        matchedVehicle,
        allObservations,
        input.mileageKm || 140000,
        true
      );

      const targetPrice = CostEngine.calculateTargetPrice(
        input.askingPrice,
        comprehensiveCost.immediateCost + comprehensiveCost.possibleCost,
        detailedRisk.assessment.overallRiskScore * 5
      );

      const scoreResult = PurchaseScoreEngine.calculate({
        reliabilityScore: matchedVehicle ? 85 : 78,
        visibleStateScore: 82,
        maintenanceScore: (input.mileageKm || 140000) > 180000 ? 70 : 82,
        priceValueScore: targetPrice.hasSufficientData ? 82 : 75,
        mechanicalRiskScore: 100 - detailedRisk.assessment.overallRiskScore,
        askingPrice: input.askingPrice,
        mileageKm: input.mileageKm,
        knownFlawsCount: matchedVehicle?.knownProblems.length || 1,
        repairsCostMax: comprehensiveCost.immediateCost + comprehensiveCost.possibleCost
      });

      const decision = DecisionEngine.calculatePurchaseDecision({
        score: scoreResult.score,
        overallRiskLevel: detailedRisk.assessment.overallLevel,
        askingPrice: input.askingPrice,
        estimatedCosts: comprehensiveCost.immediateCost + comprehensiveCost.possibleCost,
        knownFlawsCount: matchedVehicle?.knownProblems.length || 0
      });

      // 5. SELLER QUESTIONS & MECHANIC CHECKLIST GENERATION
      const sellerQuestions: string[] = [
        `¿Dispone de facturas selladas que acrediten el último cambio de correa de distribución y bomba de agua?`,
        `¿Se ha sustituido alguna vez el embrague o el volante bimasa? ¿Muestra holgura en frío?`,
        `¿Cuándo se realizó la última revisión de aceite y filtros (con qué especificación y viscosidad)?`,
        `¿Ha pasado la ITV favorablemente sin defectos leves ni graves registrados?`,
        `¿Es el vehículo de un único propietario particular o procede de renting/importación?`
      ];

      const mechanicChecklist = [
        {
          id: 'mech-1',
          task: 'Inspección en elevador de bajos, rótulas y silentblocks',
          explanation: 'Descartar holguras en trapecios de suspensión y roces estructurales en piso.',
          checked: false,
          category: 'Exterior/Interior' as const
        },
        {
          id: 'mech-2',
          task: 'Diagnóstico electrónico OBD (lectura de DTCs)',
          explanation: 'Comprobar que no hay fallos latentes de inyección, sonda lambda o DPF borrados recientemente.',
          checked: false,
          category: 'Motor' as const
        },
        {
          id: 'mech-3',
          task: 'Comprobar estanqueidad de retén de cigüeñal y turbo',
          explanation: 'Verificar ausencia de rezumes de aceite bajo la campana del cambio.',
          checked: false,
          category: 'Motor' as const
        },
        {
          id: 'mech-4',
          task: 'Prueba de presión del circuito de refrigeración',
          explanation: 'Asegurar que no hay sobrepresión ni consumo anormal de anticongelante.',
          checked: false,
          category: 'Motor' as const
        },
        {
          id: 'mech-5',
          task: 'Prueba en carretera: aceleración progresiva y frenada de emergencia',
          explanation: 'Comprobar tacto de pedal, mordida de frenos sin desvíos y respuesta de la caja de cambios.',
          checked: false,
          category: 'Conducción' as const
        }
      ];

      const rawSession: Partial<VehicleAnalysisSession> = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        status: 'READY',
        vehicle: matchedVehicle,
        identification,
        askingPrice: input.askingPrice,
        mileage: input.mileageKm,
        year: input.year || matchedVehicle?.yearFrom,
        location: input.location,
        fuel: input.fuel || matchedVehicle?.fuel,
        transmission: input.transmission || matchedVehicle?.transmission,
        photos: photoItems,
        observations: [...allObservations, ...categorizedEvidence.known, ...categorizedEvidence.inferred],
        knownProblems: matchedVehicle?.knownProblems || [],
        maintenanceFindings: matchedVehicle?.maintenance || [],
        riskFindings: detailedRisk.assessment,
        riskDetails: detailedRisk.details,
        costEstimate: {
          askingPrice: input.askingPrice || 0,
          transferFees: 200,
          initialMaintenanceMin: 200,
          initialMaintenanceMax: 400,
          visibleRepairsMin: comprehensiveCost.immediateCost * 0.8,
          visibleRepairsMax: (comprehensiveCost.immediateCost + comprehensiveCost.possibleCost) * 1.1,
          totalMin: (input.askingPrice || 0) + 200 + 200 + comprehensiveCost.immediateCost * 0.8,
          totalMax: (input.askingPrice || 0) + 200 + 400 + (comprehensiveCost.immediateCost + comprehensiveCost.possibleCost) * 1.1,
          isDemoData: true
        },
        comprehensiveCost,
        targetPrice,
        score: scoreResult,
        decision,
        recommendation: scoreResult.verdictDescription,
        confidence: identification.confidence,
        sellerQuestions,
        mechanicChecklist,
        unknownFactors: scoreResult.unknownFactors,
        isDemoMode: true
      };

      const cleanSession = ValidationService.sanitizeSession(rawSession);

      onProgress?.('READY', 100, 'Informe técnico completo generado.');

      AnalyticsService.track('analysis_completed', {
        make: cleanSession.identification?.brand || 'Desconocido',
        model: cleanSession.identification?.model || 'Desconocido',
        score: cleanSession.score.score,
        decision: cleanSession.decision
      });

      return cleanSession;
    } catch (error) {
      console.error('[AnalysisSessionService] Analysis failed, generating safe fallback session:', error);
      onProgress?.('ERROR', 100, 'El análisis inteligente no está disponible ahora. Continuando en Modo Demo local.');

      // Return a safe sanitized default session
      return ValidationService.sanitizeSession({
        id: sessionId,
        createdAt: new Date().toISOString(),
        status: 'READY',
        askingPrice: input.askingPrice || 8500,
        mileage: input.mileageKm || 140000,
        isDemoMode: true
      });
    }
  }

  /**
   * Convert VehicleAnalysisSession to legacy CarAnalysisReport format for backward compatibility with existing views
   */
  static sessionToLegacyReport(session: VehicleAnalysisSession): CarAnalysisReport {
    const defaultMake = session.identification?.brand || session.vehicle?.brand || 'Volkswagen';
    const defaultModel = session.identification?.model || session.vehicle?.model || 'Golf';
    const defaultGen = session.identification?.generation || session.vehicle?.generation || 'VII';

    const photoUrls: Partial<Record<PhotoSlotId, string>> = {};
    session.photos.forEach((p) => {
      photoUrls[p.type] = p.uri;
    });

    return {
      id: session.id,
      createdAt: session.createdAt,
      photos: photoUrls,
      identity: {
        make: defaultMake,
        model: defaultModel,
        generation: defaultGen,
        estimatedYearMin: session.year || session.vehicle?.yearFrom || 2012,
        estimatedYearMax: typeof session.vehicle?.yearTo === 'number' ? session.vehicle.yearTo : 2019,
        engine: session.identification?.engine || session.vehicle?.engine.name || '2.0 TDI CR 150 CV',
        fuelType: (session.fuel as any) || session.vehicle?.fuel || 'Diésel',
        powerHp: session.identification?.power || session.vehicle?.power || 150,
        transmission: (session.transmission as any) || session.vehicle?.transmission || 'Manual',
        confidenceScore: Math.round((session.confidence || 0.85) * 100),
        needsConfirmation: !session.askingPrice || !session.mileage
      },
      mileageKm: session.mileage,
      userPrice: session.askingPrice,
      score: session.score.score,
      scoreLabel: session.score.score >= 80 ? 'Buena opción' : session.score.score >= 60 ? 'Precaución / negociar' : 'Alto riesgo',
      scoreBadgeColor: session.score.badgeColor,
      verdict: session.score.verdict,
      scoreCategories: session.score.categories,
      visualObservations: session.observations
        .filter((o) => o.evidenceType === 'OBSERVED')
        .map((o) => ({
          category: 'Exterior',
          part: o.componentAffected || 'Carrocería',
          status: o.confidenceTier === 'Alta confianza' ? 'good' : 'warning',
          title: o.title,
          description: o.description,
          actionRequired: o.recommendedAction
        })),
      modelProsCons: (session.vehicle?.knownProblems || []).map((kp) => ({
        type: 'known_issue' as const,
        title: kp.title,
        description: kp.description,
        isModelGeneral: true
      })),
      realCost: session.costEstimate,
      negotiation: {
        askingPrice: session.targetPrice.askingPrice,
        riskCost: session.targetPrice.estimatedRepairExposure,
        targetPriceMin: session.targetPrice.minimumNegotiationPrice,
        targetPriceMax: session.targetPrice.targetPrice,
        maxRecommendedPrice: session.targetPrice.maximumPrice,
        disclaimer: 'Cálculo de precio objetivo basado en las revisiones y riesgos técnicos detectados.'
      },
      repairs: session.comprehensiveCost.items.map((item) => ({
        id: item.id,
        partName: item.name,
        whatItDoes: item.category,
        whyAttentionNeeded: item.reason,
        costNewMin: item.partCost.min,
        costNewMax: item.partCost.max,
        laborCostMin: item.laborCost.min,
        laborCostMax: item.laborCost.max,
        totalEstimatedMin: item.minimum,
        totalEstimatedMax: item.maximum,
        priority: item.urgency,
        category: item.category,
        isDemoData: item.isDemo
      })),
      checklist: session.mechanicChecklist,
      recommendation: session.recommendation,
      cannotDetermineNote: '⚠️ No podemos comprobar el estado de compresión interna, desgaste de embrague o electrónica profunda mediante fotografías. Realiza siempre una prueba de conducción y solicita informe DGT.'
    };
  }
}
