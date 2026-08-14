import { PurchaseVerdict, ScoreCategory } from '../types';
import { ValidationService } from './ValidationService';

export interface ScoreEngineInput {
  reliabilityScore: number; // 0-100
  visibleStateScore: number; // 0-100
  maintenanceScore: number; // 0-100
  priceValueScore: number; // 0-100
  mechanicalRiskScore: number; // 0-100 (higher = safer / less risk)
  askingPrice?: number;
  mileageKm?: number;
  knownFlawsCount?: number;
  repairsCostMax?: number;
}

export interface PurchaseScoreResult {
  score: number; // 0 to 100
  verdict: PurchaseVerdict;
  verdictText: string;
  verdictDescription: string;
  badgeColor: 'green' | 'yellow' | 'red';
  categories: ScoreCategory[];
  positiveFactors: string[];
  negativeFactors: string[];
  unknownFactors: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
}

export class PurchaseScoreEngine {
  /**
   * Deterministic calculation of purchase score and factor breakdown
   */
  static calculate(input: ScoreEngineInput): PurchaseScoreResult {
    const weights = {
      reliability: 0.25,
      visibleState: 0.20,
      maintenance: 0.20,
      priceValue: 0.20,
      mechanicalRisk: 0.15
    };

    const weightedScore = Math.round(
      ValidationService.safeScore(input.reliabilityScore, 75) * weights.reliability +
      ValidationService.safeScore(input.visibleStateScore, 75) * weights.visibleState +
      ValidationService.safeScore(input.maintenanceScore, 75) * weights.maintenance +
      ValidationService.safeScore(input.priceValueScore, 75) * weights.priceValue +
      ValidationService.safeScore(input.mechanicalRiskScore, 75) * weights.mechanicalRisk
    );

    const finalScore = ValidationService.safeScore(weightedScore, 70);

    const positiveFactors: string[] = [];
    const negativeFactors: string[] = [];
    const unknownFactors: string[] = [];

    // Analyze positive factors
    if (input.reliabilityScore >= 80) {
      positiveFactors.push('Motorización con excelente reputación de durabilidad y recambios económicos.');
    }
    if (input.visibleStateScore >= 80) {
      positiveFactors.push('Carrocería e interiores bien cuidados sin signos de maltrato grave.');
    }
    if (input.priceValueScore >= 75) {
      positiveFactors.push('Precio anunciado competitivo en comparación con el mercado actual.');
    }
    if (input.maintenanceScore >= 80) {
      positiveFactors.push('Mantenimientos rutinarios al día con desgaste acorde a los kilómetros.');
    }

    // Analyze negative factors
    if (input.reliabilityScore < 65) {
      negativeFactors.push('Este motor tiene incidencias endémicas conocidas que requieren vigilancia estricta.');
    }
    if (input.visibleStateScore < 65) {
      negativeFactors.push('Desperfectos visuales o desgastes acusados en elementos de mando.');
    }
    if (input.repairsCostMax && input.repairsCostMax > 600) {
      negativeFactors.push(`Coste acumulado de reparaciones o puesta a punto visible (~${Math.round(input.repairsCostMax)} €).`);
    }
    if (input.knownFlawsCount && input.knownFlawsCount > 2) {
      negativeFactors.push('Múltiples puntos críticos documentados en este bloque mecánico.');
    }

    // Analyze unknown factors
    unknownFactors.push('Estado interno del embrague y holgura del volante bimasa en caliente.');
    unknownFactors.push('Compresión real de cilindros y estanqueidad del turbocompresor.');
    unknownFactors.push('Cargas administrativas, embargos o historial de ITV pendiente de cotejar con informe DGT.');

    let verdict: PurchaseVerdict = 'BUY';
    let verdictText = '🟢 BUENA OPCIÓN / COMPRA RECOMENDADA';
    let verdictDescription = 'El coche presenta un equilibrio favorable entre fiabilidad, estado aparente y coste estimado.';
    let badgeColor: 'green' | 'yellow' | 'red' = 'green';
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (finalScore >= 80) {
      verdict = 'BUY';
      verdictText = '🟢 COMPRA RECOMENDADA';
      verdictDescription = 'Vehículo en condiciones óptimas. Procede con la revisión física estándar y prueba de conducción.';
      badgeColor = 'green';
      riskLevel = 'LOW';
    } else if (finalScore >= 60) {
      verdict = 'NEGOTIATE';
      verdictText = '🟡 PRECAUCIÓN / NEGOCIAR PRECIO';
      verdictDescription = 'Interesante únicamente si el vendedor descuenta el importe de las averías o mantenimientos detectados.';
      badgeColor = 'yellow';
      riskLevel = 'MEDIUM';
    } else {
      verdict = 'AVOID';
      verdictText = '🔴 ALTO RIESGO / DESACONSEJADO';
      verdictDescription = 'El coste total de puesta a punto y los riesgos mecánicos superan el valor del vehículo. Se aconseja buscar otra unidad.';
      badgeColor = 'red';
      riskLevel = 'HIGH';
    }

    const categories: ScoreCategory[] = [
      {
        name: 'Fiabilidad',
        score: ValidationService.safeScore(input.reliabilityScore, 75),
        weight: 25,
        description: 'Reputación histórica del motor, caja de cambios y arquitectura eléctrica.'
      },
      {
        name: 'Estado visible',
        score: ValidationService.safeScore(input.visibleStateScore, 75),
        weight: 20,
        description: 'Conservación exterior, interior, ópticas, cristales y neumáticos.'
      },
      {
        name: 'Mantenimiento',
        score: ValidationService.safeScore(input.maintenanceScore, 75),
        weight: 20,
        description: 'Estado de la correa de distribución, bomba de agua, filtros y aceites.'
      },
      {
        name: 'Riesgo mecánico',
        score: ValidationService.safeScore(input.mechanicalRiskScore, 75),
        weight: 15,
        description: 'Exposición a fallos graves costosos en turbo, inyección o catalizadores.'
      },
      {
        name: 'Relación calidad/precio',
        score: ValidationService.safeScore(input.priceValueScore, 75),
        weight: 20,
        description: 'Alineación del precio con el estado real y las reparaciones inmediatas.'
      }
    ];

    return {
      score: finalScore,
      verdict,
      verdictText,
      verdictDescription,
      badgeColor,
      categories,
      positiveFactors,
      negativeFactors,
      unknownFactors,
      riskLevel
    };
  }

  /**
   * Helper to calculate score directly from session components
   */
  static calculatePurchaseScore(sessionData: {
    reliabilityScore?: number;
    visibleStateScore?: number;
    maintenanceScore?: number;
    priceValueScore?: number;
    mechanicalRiskScore?: number;
    askingPrice?: number;
    mileageKm?: number;
    knownFlawsCount?: number;
    repairsCostMax?: number;
  }): PurchaseScoreResult {
    return this.calculate({
      reliabilityScore: sessionData.reliabilityScore ?? 82,
      visibleStateScore: sessionData.visibleStateScore ?? 80,
      maintenanceScore: sessionData.maintenanceScore ?? 75,
      priceValueScore: sessionData.priceValueScore ?? 80,
      mechanicalRiskScore: sessionData.mechanicalRiskScore ?? 80,
      askingPrice: sessionData.askingPrice,
      mileageKm: sessionData.mileageKm,
      knownFlawsCount: sessionData.knownFlawsCount,
      repairsCostMax: sessionData.repairsCostMax
    });
  }
}
