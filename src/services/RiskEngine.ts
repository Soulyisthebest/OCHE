import { RiskAssessment, RiskFactor, RiskLevel } from '../types/risk';
import { CarAnalysisReport } from '../types';
import { RiskCategoryDetail } from '../types/analysisSession';
import { Vehicle } from '../types/vehicleEngine';
import { StructuredFinding } from '../types/evidence';
import { ValidationService } from './ValidationService';

export interface DetailedRiskOutput {
  assessment: RiskAssessment;
  details: {
    visualRisk: RiskCategoryDetail;
    knownProblemRisk: RiskCategoryDetail;
    maintenanceRisk: RiskCategoryDetail;
    repairRisk: RiskCategoryDetail;
    unknownRisk: RiskCategoryDetail;
    overallRisk: RiskCategoryDetail;
  };
}

export class RiskEngine {
  /**
   * Synthesize multi-source inputs into comprehensive structured risk details
   */
  static assessDetailedRisk(
    findings: StructuredFinding[],
    vehicle: Vehicle | null,
    mileageKm: number = 140000,
    askingPrice: number = 10000
  ): DetailedRiskOutput {
    // 1. Visual Risk
    const visualObs = findings.filter((f) => f.evidenceType === 'OBSERVED');
    const visualHasDanger = visualObs.some((f) => f.confidence >= 0.85 && f.description.toLowerCase().includes('grave'));
    const visualHasWarning = visualObs.length > 0;

    const visualLevel: RiskLevel = visualHasDanger ? 'HIGH' : visualHasWarning ? 'MEDIUM' : 'LOW';
    const visualCostMin = visualHasDanger ? 300 : visualHasWarning ? 120 : 0;
    const visualCostMax = visualHasDanger ? 800 : visualHasWarning ? 350 : 0;

    const visualRisk: RiskCategoryDetail = {
      riskType: 'visualRisk',
      label: 'Riesgo Visual y Carrocería',
      level: visualLevel,
      causes: visualObs.map((v) => `${v.title}: ${v.description}`),
      inspectionNeeded: [
        'Comprobar holguras y diferencias de tono en paneles contiguos.',
        'Inspeccionar bajos en elevador para descartar roces o corrosión.'
      ],
      estimatedCostExposure: { min: visualCostMin, max: visualCostMax },
      confidence: 0.88,
      explanation: visualLevel === 'LOW'
        ? 'El vehículo no muestra desalineaciones ni daños de chapa o faros importantes en las fotos.'
        : 'Existen desgastes o roces superficiales visibles que conviene tener en cuenta al negociar.',
      howToCheck: [
        'Pasa la yema de los dedos por los bordes de aletas y capó para notar si hay repintados ásperos.',
        'Abre y cierra todas las puertas comprobando que encajan con un sonido suave y seco.'
      ]
    };

    // 2. Known Problem Risk (Endemic engine/model flaws)
    const knownObs = findings.filter((f) => f.evidenceType === 'KNOWN');
    const endemicFlaws = vehicle?.knownProblems || [];
    const hasCriticalFlaw = endemicFlaws.some((p) => p.severity === 'critical' || p.severity === 'Crítica');
    const hasHighFlaw = endemicFlaws.some((p) => p.severity === 'high' || p.severity === 'Alta');

    const knownLevel: RiskLevel = hasCriticalFlaw ? 'HIGH' : (hasHighFlaw || knownObs.length > 0) ? 'MEDIUM' : 'LOW';
    const knownCostMin = endemicFlaws.reduce((s, p) => s + (p.estimatedCost?.min || 0), 0);
    const knownCostMax = endemicFlaws.reduce((s, p) => s + (p.estimatedCost?.max || 0), 0);

    const knownProblemRisk: RiskCategoryDetail = {
      riskType: 'knownProblemRisk',
      label: 'Fallos Endémicos del Modelo / Motor',
      level: knownLevel,
      causes: endemicFlaws.map((p) => `${p.title}: ${p.description}`),
      inspectionNeeded: [
        'Preguntar al vendedor si se han sustituido los componentes conflictivos con factura.',
        'Diagnóstico OBD para verificar que no hay códigos de avería almacenados en centralita.'
      ],
      estimatedCostExposure: {
        min: knownCostMin > 0 ? knownCostMin : 150,
        max: knownCostMax > 0 ? knownCostMax : 450
      },
      confidence: 0.92,
      explanation: knownLevel === 'LOW'
        ? 'Motor y chasis con excelente historial histórico y pocas incidencias documentadas.'
        : `Este bloque motor presenta puntos débiles conocidos (${endemicFlaws.map((p) => p.title).slice(0, 2).join(', ')}) que requieren vigilancia.`,
      howToCheck: [
        'Arranca el motor totalmente en frío y comprueba que no suene traqueteo metálico.',
        'Pide ver el libro de revisiones o facturas de los últimos 2 años.'
      ]
    };

    // 3. Maintenance & Mileage Risk
    let maintLevel: RiskLevel = 'LOW';
    let maintCostMin = 150;
    let maintCostMax = 350;
    const maintCauses: string[] = [];

    if (mileageKm > 200000) {
      maintLevel = 'HIGH';
      maintCostMin = 450;
      maintCostMax = 950;
      maintCauses.push(`Kilometraje elevado (${mileageKm.toLocaleString('es-ES')} km): ciclo de vida de suspensión, inyectores y turbo avanzado.`);
    } else if (mileageKm > 130000) {
      maintLevel = 'MEDIUM';
      maintCostMin = 300;
      maintCostMax = 650;
      maintCauses.push(`Kilometraje medio-alto (${mileageKm.toLocaleString('es-ES')} km): verificar cambio de correa de distribución y amortiguadores.`);
    } else {
      maintCauses.push(`Kilometraje bajo-moderado (${mileageKm.toLocaleString('es-ES')} km): mantenimiento rutinario de fluidos y filtros.`);
    }

    const maintenanceRisk: RiskCategoryDetail = {
      riskType: 'maintenanceRisk',
      label: 'Riesgo por Kilometraje y Mantenimiento',
      level: maintLevel,
      causes: maintCauses,
      inspectionNeeded: [
        'Comprobar fecha y km del último cambio de aceite y filtro.',
        'Comprobar fecha de sustitución de la correa o tensor de distribución.'
      ],
      estimatedCostExposure: { min: maintCostMin, max: maintCostMax },
      confidence: 0.85,
      explanation: `Por el kilometraje (${mileageKm.toLocaleString('es-ES')} km), se requiere una puesta a punto básica preventiva.`,
      howToCheck: [
        'Saca la varilla de aceite: el aceite debe estar a nivel y sin posos pastosos ("mayonesa") en el tapón.',
        'Observa el líquido refrigerante en el vaso de expansión: debe ser limpio y traslúcido (rosa, amarillo o azul), nunca marrón.'
      ]
    };

    // 4. Repair Risk (Visible / Inferred repairs)
    const repairObs = findings.filter((f) => f.evidenceType === 'INFERRED' || f.evidenceType === 'OBSERVED');
    const repairLevel: RiskLevel = repairObs.length > 2 ? 'MEDIUM' : 'LOW';
    const repairCostMin = 180;
    const repairCostMax = 420;

    const repairRisk: RiskCategoryDetail = {
      riskType: 'repairRisk',
      label: 'Reparaciones Inmediatas Previstas',
      level: repairLevel,
      causes: [
        'Pastillas / discos de freno a medio uso o renovación de neumáticos.',
        'Puesta al día de líquidos y filtros recomendada tras la compra.'
      ],
      inspectionNeeded: [
        'Medir grosor restante del forro de pastillas de freno.',
        'Comprobar fecha de fabricación (DOT) y profundidad del dibujo de neumáticos.'
      ],
      estimatedCostExposure: { min: repairCostMin, max: repairCostMax },
      confidence: 0.84,
      explanation: 'Costes normales de puesta a punto para empezar a rodar con tranquilidad y seguridad.',
      howToCheck: [
        'Frena progresivamente en una recta segura: el volante no debe vibrar ni desviarse hacia los lados.',
        'Gira la dirección a tope en parado y avanza despacio para verificar que no crujan las rótulas.'
      ]
    };

    // 5. Unknown Risk (Cannot be seen in 2D photos)
    const unknownRisk: RiskCategoryDetail = {
      riskType: 'unknownRisk',
      label: 'Mecánica Interna Oculta (No visible en foto)',
      level: 'MEDIUM',
      causes: [
        'La compresión interna de cilindros y el desgaste de aros de pistón no son visibles en fotografías.',
        'El desgaste del embrague, holgura de bimasa y estanqueidad del turbo solo se detectan en marcha.',
        'La ausencia de cargas administrativas o embargos requiere informe oficial DGT.'
      ],
      inspectionNeeded: [
        'Prueba de conducción dinámica de al menos 15 minutos en autovía y ciudad.',
        'Solicitar Informe Completo DGT con la matrícula del vehículo.',
        'Lectura de diagnosis OBD antes de firmar el contrato de compraventa.'
      ],
      estimatedCostExposure: { min: 250, max: 800 },
      confidence: 0.5,
      explanation: 'Las fotos muestran el exterior y el vano, pero los componentes de desgaste interno exigen prueba física.',
      howToCheck: [
        'Con el motor en marcha y freno de mano puesto, mete tercera y suelta el embrague poco a poco: el motor debe calarse de inmediato.',
        'En 4ª marcha a 2.000 rpm, acelera a fondo: las revoluciones y la velocidad deben subir parejas sin patinar.'
      ]
    };

    // 6. Overall Risk Synthesis
    const totalExposureMin = visualRisk.estimatedCostExposure.min + knownProblemRisk.estimatedCostExposure.min + maintenanceRisk.estimatedCostExposure.min + repairRisk.estimatedCostExposure.min;
    const totalExposureMax = visualRisk.estimatedCostExposure.max + knownProblemRisk.estimatedCostExposure.max + maintenanceRisk.estimatedCostExposure.max + repairRisk.estimatedCostExposure.max;

    let overallRiskScore = 15;
    if (visualRisk.level === 'HIGH') overallRiskScore += 25;
    if (visualRisk.level === 'MEDIUM') overallRiskScore += 10;
    if (knownProblemRisk.level === 'HIGH') overallRiskScore += 25;
    if (knownProblemRisk.level === 'MEDIUM') overallRiskScore += 12;
    if (maintenanceRisk.level === 'HIGH') overallRiskScore += 20;
    if (maintenanceRisk.level === 'MEDIUM') overallRiskScore += 10;

    overallRiskScore = ValidationService.safeScore(overallRiskScore, 25);

    let overallLevel: RiskLevel = 'LOW';
    if (overallRiskScore >= 50) overallLevel = 'HIGH';
    else if (overallRiskScore >= 25) overallLevel = 'MEDIUM';

    const overallRisk: RiskCategoryDetail = {
      riskType: 'overallRisk',
      label: 'Riesgo Global Consolidado',
      level: overallLevel,
      causes: [
        `Nivel visual: ${visualRisk.level}`,
        `Fiabilidad de motor: ${knownProblemRisk.level}`,
        `Exposición por kilometraje: ${maintenanceRisk.level}`
      ],
      inspectionNeeded: [
        'Prueba en carretera con aceleraciones progresivas.',
        'Revisión en taller de confianza en elevador antes de entregar señal.'
      ],
      estimatedCostExposure: { min: totalExposureMin, max: totalExposureMax },
      confidence: 0.87,
      explanation: overallLevel === 'LOW'
        ? 'El vehículo se encuentra en una franja de bajo riesgo mecánico, con costes previstos contenidos.'
        : overallLevel === 'MEDIUM'
        ? 'Riesgo moderado: existen desgastes normales o puntos de atención que aconsejan negociar el precio.'
        : 'Riesgo elevado: la suma de mantenimientos pendientes y posibles averías aconseja extremar precauciones.',
      howToCheck: [
        'Sigue la lista de comprobaciones paso a paso de OCHE antes de cerrar la compra.'
      ]
    };

    const factors: RiskFactor[] = [
      {
        id: 'rf-visual',
        category: 'visual',
        title: visualRisk.label,
        description: visualRisk.explanation,
        impactScore: visualRisk.level === 'HIGH' ? 25 : visualRisk.level === 'MEDIUM' ? 10 : 2,
        evidenceType: 'OBSERVED',
        confidence: visualRisk.confidence
      },
      {
        id: 'rf-known',
        category: 'model_flaw',
        title: knownProblemRisk.label,
        description: knownProblemRisk.explanation,
        impactScore: knownProblemRisk.level === 'HIGH' ? 25 : knownProblemRisk.level === 'MEDIUM' ? 15 : 5,
        evidenceType: 'KNOWN',
        confidence: knownProblemRisk.confidence
      },
      {
        id: 'rf-mileage',
        category: 'mileage',
        title: maintenanceRisk.label,
        description: maintenanceRisk.explanation,
        impactScore: maintenanceRisk.level === 'HIGH' ? 20 : maintenanceRisk.level === 'MEDIUM' ? 10 : 4,
        evidenceType: 'INFERRED',
        confidence: maintenanceRisk.confidence
      },
      {
        id: 'rf-unknown',
        category: 'unknown',
        title: unknownRisk.label,
        description: unknownRisk.explanation,
        impactScore: 8,
        evidenceType: 'UNKNOWN',
        confidence: unknownRisk.confidence
      }
    ];

    const assessment: RiskAssessment = {
      overallLevel,
      overallRiskScore,
      factors,
      summary: overallRisk.explanation,
      exposureCostEstimated: { min: totalExposureMin, max: totalExposureMax },
      criticalAlerts: overallLevel === 'HIGH'
        ? ['Revisar distribución y estado de inyectores antes de pagar señal.']
        : []
    };

    return {
      assessment,
      details: {
        visualRisk,
        knownProblemRisk,
        maintenanceRisk,
        repairRisk,
        unknownRisk,
        overallRisk
      }
    };
  }

  /**
   * Compatibility method for existing code
   */
  static assessVehicleRisk(report: CarAnalysisReport): RiskAssessment {
    const findings: StructuredFinding[] = [];

    (report.visualObservations || []).forEach((o) => {
      findings.push({
        id: `vis-${o.part}`,
        title: o.title,
        description: o.description,
        evidenceType: 'OBSERVED',
        confidence: 0.85,
        confidenceTier: 'Alta confianza',
        componentAffected: o.part,
        source: 'Inspección visual',
        isDemo: false
      });
    });

    (report.modelProsCons || []).forEach((pc) => {
      findings.push({
        id: `pc-${pc.title}`,
        title: pc.title,
        description: pc.description,
        evidenceType: pc.isModelGeneral ? 'KNOWN' : 'OBSERVED',
        confidence: 0.9,
        confidenceTier: 'Alta confianza',
        source: 'Base de conocimiento técnico',
        isDemo: false
      });
    });

    const detailed = this.assessDetailedRisk(
      findings,
      null,
      report.mileageKm || 140000,
      report.userPrice || 10000
    );

    return detailed.assessment;
  }
}
