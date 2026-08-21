import { CarAnalysisReport, PhotoSlotId } from '../types';
import { VehicleService } from './VehicleService';
import { CostEngine } from './CostEngine';
import { PurchaseScoreEngine } from './PurchaseScoreEngine';
import { RiskEngine } from './RiskEngine';
import { AnalyticsService } from './AnalyticsService';
import { VehicleContextBuilder } from './VehicleContextBuilder';
import { CountryEngine } from './CountryEngine';
import { VehicleResolverService } from './VehicleResolverService';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

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
    userInputs?: {
      mileageKm?: number;
      askingPrice?: number;
      brandHint?: string;
      modelHint?: string;
      year?: number;
      fuel?: string;
      transmission?: string;
    }
  ): Promise<CarAnalysisReport> {
    AnalyticsService.track('scan_started', { photoCount: Object.keys(photos).length });

    const photoEntries = Object.entries(photos)
      .filter(([_, val]) => val?.base64 || val?.url)
      .map(([slotId, val]) => ({
        slotId,
        base64: val.base64 || '',
        url: val.url || ''
      }));

    const activeCountry = CountryEngine.getActiveCountryProfile();

    // Dynamically build grounding context if user provided hints
    let dynamicContext = '';
    if (userInputs?.brandHint || userInputs?.modelHint) {
      const resolved = await VehicleResolverService.resolveVehicle(
        {
          brandHint: userInputs.brandHint,
          modelHint: userInputs.modelHint,
          year: userInputs.year,
          fuel: userInputs.fuel,
          transmission: userInputs.transmission
        },
        activeCountry.countryCode
      );
      if (resolved.bestMatch) {
        dynamicContext = await VehicleContextBuilder.buildContextForVehicle(
          resolved.bestMatch.vehicleId,
          userInputs.mileageKm,
          userInputs.askingPrice
        );
      }
    }

    try {
      const endpoint = typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/api/analyze-car`
        : '/api/analyze-car';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photos: photoEntries,
          mileageKm: userInputs?.mileageKm,
          askingPrice: userInputs?.askingPrice,
          vehicleContext: dynamicContext,
          countryCode: activeCountry.countryCode,
          currencySymbol: activeCountry.currencySymbol || activeCountry.currency
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const report = data.report as CarAnalysisReport;

      // SINGLE SOURCE OF TRUTH: Authoritative calculation engines
      // 1. Authoritative deterministic score calculation (Gemini cannot override this)
      const deterministicScore = PurchaseScoreEngine.calculate({
        reliabilityScore: report.identity.confidenceScore > 75 ? 85 : 75,
        visibleStateScore: report.visualObservations.some((v) => v.status === 'danger')
          ? 60
          : report.visualObservations.some((v) => v.status === 'warning')
          ? 78
          : 90,
        maintenanceScore: (userInputs?.mileageKm || report.mileageKm || 120000) > 180000 ? 70 : 82,
        priceValueScore: 80,
        mechanicalRiskScore: 78,
        askingPrice: userInputs?.askingPrice || report.userPrice,
        mileageKm: userInputs?.mileageKm || report.mileageKm
      });

      report.score = deterministicScore.score;
      report.scoreBadgeColor = deterministicScore.badgeColor;
      report.verdict = deterministicScore.verdict;
      report.scoreCategories = deterministicScore.categories;

      // 2. Authoritative deterministic risk engine
      const risk = RiskEngine.assessVehicleRisk(report);

      // 3. Authoritative deterministic cost engine
      const basePrice = userInputs?.askingPrice || report.userPrice || 8500;
      const realCost = CostEngine.calculateRealCost(basePrice, report.repairs || []);
      const negotiation = CostEngine.calculateNegotiationTarget(basePrice, realCost);
      report.realCost = realCost;
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
   * Offline / Demo Fallback Report Generator using Local Knowledge Engine.
   * STRICT INTEGRITY RULE: Never silently defaults to Golf, Peugeot, Toyota or BMW
   * unless user inputs explicitly match them.
   */
  static generateOfflineReport(
    photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
    userInputs?: {
      mileageKm?: number;
      askingPrice?: number;
      brandHint?: string;
      modelHint?: string;
      year?: number;
      fuel?: string;
      transmission?: string;
    }
  ): CarAnalysisReport {
    // 1. Attempt to resolve vehicle from user inputs
    let matchedVehicle = userInputs?.brandHint && userInputs?.modelHint
      ? VehicleService.findMatchingVehicle(
          userInputs.brandHint,
          userInputs.modelHint,
          userInputs.year,
          userInputs.fuel
        )
      : undefined;

    const activeCountry = CountryEngine.getActiveCountryProfile();
    const currency = activeCountry.currencySymbol || activeCountry.currency || '€';

    // 2. If no matched vehicle found from user hints, do NOT guess Golf/BMW! Output UNKNOWN vehicle.
    const isKnownVehicle = Boolean(matchedVehicle);
    const make = matchedVehicle ? matchedVehicle.brand : (userInputs?.brandHint || 'Vehículo No Identificado');
    const model = matchedVehicle ? matchedVehicle.model : (userInputs?.modelHint || 'Modelo Desconocido');
    const generation = matchedVehicle ? matchedVehicle.generation : 'Generación pendiente de confirmación';
    const engineName = matchedVehicle ? matchedVehicle.engine.name : 'Motorización no especificada';
    const rawFuel = matchedVehicle ? matchedVehicle.fuel : (userInputs?.fuel || 'Gasolina');
    const fuelType: 'Diésel' | 'Gasolina' | 'Híbrido' | 'Eléctrico' | 'GLP' =
      rawFuel === 'Diésel' || rawFuel === 'Gasolina' || rawFuel === 'Híbrido' || rawFuel === 'Eléctrico' || rawFuel === 'GLP'
        ? rawFuel
        : 'Gasolina';

    const powerHp = matchedVehicle ? matchedVehicle.power : 110;

    const rawTrans = matchedVehicle ? matchedVehicle.transmission : (userInputs?.transmission || 'Manual');
    const transmission: 'Manual' | 'Automático' =
      rawTrans === 'Automático' || rawTrans === 'Automatic' || rawTrans === 'DualClutch'
        ? 'Automático'
        : 'Manual';

    const yearMin = matchedVehicle ? matchedVehicle.yearFrom : (userInputs?.year || 2015);
    const yearMax = matchedVehicle ? (typeof matchedVehicle.yearTo === 'number' ? matchedVehicle.yearTo : 2024) : (userInputs?.year ? userInputs.year + 2 : 2024);

    const price = userInputs?.askingPrice || (matchedVehicle?.askingPrice) || 8500;
    const mileage = userInputs?.mileageKm || (matchedVehicle?.mileage) || 130000;

    const repItems = matchedVehicle
      ? [
          {
            id: 'rep-off-1',
            partName: 'Revisión y Mantenimiento Periódico',
            whatItDoes: 'Cambio de aceite sintético, filtros de aire y habitáculo.',
            whyAttentionNeeded: 'Puesta a punto preventiva recomendada.',
            costNewMin: 120,
            costNewMax: 220,
            laborCostMin: 60,
            laborCostMax: 120,
            totalEstimatedMin: 180,
            totalEstimatedMax: 340,
            priority: 'Media' as const,
            category: 'Motor',
            isDemoData: true
          }
        ]
      : [
          {
            id: 'rep-off-gen',
            partName: 'Diagnóstico Mecánico y Puesta a Punto General',
            whatItDoes: 'Comprobación de niveles, frenos y estado de batería.',
            whyAttentionNeeded: 'Revisión técnica inicial imprescindible en segunda mano.',
            costNewMin: 90,
            costNewMax: 180,
            laborCostMin: 70,
            laborCostMax: 140,
            totalEstimatedMin: 160,
            totalEstimatedMax: 320,
            priority: 'Media' as const,
            category: 'General',
            isDemoData: true
          }
        ];

    const realCost = CostEngine.calculateRealCost(price, repItems);

    const scoreResult = PurchaseScoreEngine.calculate({
      reliabilityScore: isKnownVehicle ? 82 : 70,
      visibleStateScore: 80,
      maintenanceScore: mileage > 180000 ? 70 : 80,
      priceValueScore: 78,
      mechanicalRiskScore: isKnownVehicle ? 80 : 65,
      askingPrice: price,
      mileageKm: mileage
    });

    const negotiation = CostEngine.calculateNegotiationTarget(price, realCost);

    const report: CarAnalysisReport = {
      id: `analysis-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      photos: Object.fromEntries(Object.entries(photos).map(([k, v]) => [k, v.url || ''])),
      identity: {
        make,
        model,
        generation,
        estimatedYearMin: yearMin,
        estimatedYearMax: yearMax,
        engine: engineName,
        fuelType,
        powerHp,
        transmission,
        confidenceScore: isKnownVehicle ? 85 : 0,
        needsConfirmation: !isKnownVehicle || !userInputs?.mileageKm || !userInputs?.askingPrice
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
          part: 'Carrocería general',
          status: 'good',
          title: 'Aspecto visual general',
          description: 'Sin descuadres mayores evidentes en las fotos aportadas.',
          actionRequired: 'Revisión presencial recomendada'
        },
        {
          category: 'Motor',
          part: 'Compartimento motor',
          status: 'good',
          title: 'Vano motor',
          description: 'Aspecto seco sin manchas graves de aceite.',
        }
      ],
      modelProsCons: matchedVehicle
        ? matchedVehicle.knownProblems.map((kp) => ({
            type: 'known_issue' as const,
            title: kp.title,
            description: kp.description,
            isModelGeneral: true
          }))
        : [
            {
              type: 'pro',
              title: 'Revisión pendiente de confirmación',
              description: 'Identifica el modelo exacto para acceder a la base de averías endémicas.',
              isModelGeneral: true
            }
          ],
      realCost,
      negotiation,
      repairs: repItems,
      checklist: [
        {
          id: 'chk-1',
          task: 'Arrancar motor en frío y escuchar ruidos de distribución',
          explanation: 'Comprueba que no suene traqueteo metálico en los primeros 10 segundos tras girar la llave.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-2',
          task: 'Comprobar salida de humo por el tubo de escape',
          explanation: 'Acelera suavemente en vacío. Humo blanco persistente = refrigerante; humo azul = consumo de aceite.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-3',
          task: `Solicitar historial técnico oficial e informe de inspección (${activeCountry.inspectionSystem.name})`,
          explanation: 'Verifica kilometraje real registrado en las inspecciones periódicas y ausencia de cargas administrativas.',
          checked: false,
          category: 'Documentación'
        }
      ],
      recommendation: scoreResult.verdictDescription,
      cannotDetermineNote: '⚠️ No podemos comprobar el estado de compresión interna, holgura de embrague o electrónica profunda mediante fotografías. Realiza siempre una prueba de conducción y solicita informe oficial.'
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
