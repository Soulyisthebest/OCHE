/**
 * OCHE / CARCHECK AI — 3D Asset Pipeline & Knowledge Bridge (FASE 15)
 * Manages 3D asset optimization analysis, LOD validation, progressive loading,
 * strict non-diagnostic boundary enforcement, and multi-tier Knowledge Engine linking.
 */

import {
  Car3DAsset,
  Car3DAssetPart,
  Supported3DInteraction,
  AssetOptimizationReport,
  PartToKnowledgeChain
} from '../types/vehicle3DAsset';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { local3DAssetProvider } from './Vehicle3DAssetProvider';
import { STANDARD_VEHICLE_SYSTEMS_DEF } from '../data/globalVehicleDatabase';

export class Car3DAssetPipeline {
  /**
   * CRITICAL SYSTEM INVARIANT:
   * The 3D view represents model architecture and technical reference, NEVER the diagnosis of a specific vehicle unit.
   */
  static getNonDiagnosticSafetyNotice(): string {
    return 'El modelo 3D representa la arquitectura general y puntos técnicos de referencia del modelo. Las observaciones y estado real provienen exclusivamente de la inspección visual fotográfica y datos del vendedor.';
  }

  /**
   * Evaluates if a 3D asset meets web and mobile production performance budgets
   * Mobile budget: <= 50,000 polygons, <= 2048x2048 textures, DRACO/Meshopt compression, LOD tiers.
   */
  static evaluateAssetOptimization(asset: Car3DAsset): AssetOptimizationReport {
    const recommendations: string[] = [];
    let polygonBudgetScore = 100;
    let textureBudgetScore = 100;

    // 1. Polygon Count Assessment (Target: < 45,000 for mobile web smooth 60fps)
    if (asset.polygonCount > 100000) {
      polygonBudgetScore = 20;
      recommendations.push('Reducir polígonos urgentemente (>100k puede provocar congelamientos en GPU móvil).');
    } else if (asset.polygonCount > 50000) {
      polygonBudgetScore = 60;
      recommendations.push('Aplicar simplificación de malla para situarse por debajo de 50.000 polígonos en LOD0.');
    } else if (asset.polygonCount > 30000) {
      polygonBudgetScore = 85;
    }

    // 2. Texture Resolution Assessment
    if (asset.textureSize.includes('4096') || asset.textureSize.includes('8192')) {
      textureBudgetScore = 30;
      recommendations.push('Texturas 4K/8K exceden el límite de VRAM móvil. Comprimir a 1024x1024 o 2048x2048 con KTX2/Basis.');
    } else if (asset.textureSize.includes('2048')) {
      textureBudgetScore = 80;
    } else {
      textureBudgetScore = 100;
    }

    // 3. Compression & LOD Assessment
    const isCompressed = asset.compressionFormat === 'DRACO' || asset.compressionFormat === 'EXT_meshopt_compression';
    if (!isCompressed) {
      recommendations.push('Compresión de geometría ausente. Se recomienda aplicar DRACO o Meshopt en exportación GLB.');
    }

    const hasLOD = Boolean(asset.lodLevels && asset.lodLevels.length > 1);
    if (!hasLOD) {
      recommendations.push('Generar niveles LOD1 y LOD2 para dispositivos con bajo rendimiento o vista lejana.');
    }

    const isMobileReady = polygonBudgetScore >= 60 && textureBudgetScore >= 70 && (isCompressed || asset.polygonCount < 35000);

    return {
      isMobileReady,
      polygonBudgetScore,
      textureBudgetScore,
      hasLOD,
      isCompressed,
      recommendations,
      maxDrawCalls: asset.parts.length + 2
    };
  }

  /**
   * Links a 3D Part node to canonical Knowledge Engine layers:
   * 3D Part -> Part -> VehicleSystem -> KnownProblem[] -> Repair[] -> CostEstimate
   */
  static async link3DPartToKnowledge(
    assetPart: Car3DAssetPart,
    vehicleId: string
  ): Promise<PartToKnowledgeChain> {
    const domainVehicles = await localVehicleRepository.getAllDomainVehicles();
    const matchedVehicle = domainVehicles.find(
      (v) => v.id.toLowerCase() === vehicleId.toLowerCase()
    );

    // Find system definition
    const sysDefObj = (STANDARD_VEHICLE_SYSTEMS_DEF as Record<string, { name: string; description: string }>)[assetPart.systemId];
    const systemName = sysDefObj ? sysDefObj.name : 'Sistema Mecánico General';

    // Find canonical Part in domain repository
    let knowledgePart: {
      id: string;
      name: string;
      description: string;
      riskLevel: any;
    } | null = null;

    let knownProblems: {
      id: string;
      title: string;
      severity: string;
      description: string;
    }[] = [];

    let repairs: {
      id: string;
      title: string;
      costRange: { min: number; max: number };
    }[] = [];

    let costEstimate = {
      partNew: 120,
      partUsed: 60,
      laborHours: 1.5,
      laborCost: 90,
      totalExpected: 210
    };

    if (matchedVehicle) {
      // Look up part in vehicle's part catalog
      const foundPart = matchedVehicle.parts.find(
        (p) => p.id === assetPart.partKnowledgeId || p.system === assetPart.systemId || p.name.toLowerCase().includes(assetPart.name.toLowerCase())
      );

      if (foundPart) {
        knowledgePart = {
          id: foundPart.id,
          name: foundPart.name,
          description: foundPart.function,
          riskLevel: foundPart.riskLevel
        };

        knownProblems = foundPart.knownProblems.map((kp) => ({
          id: kp.id,
          title: kp.title,
          severity: kp.severity,
          description: kp.description
        }));

        const partRepairs = matchedVehicle.repairs.filter((r) => r.partId === foundPart.id);
        if (partRepairs.length > 0) {
          repairs = partRepairs.map((r) => ({
            id: r.id,
            title: r.title,
            costRange: { min: r.costEstimate.min, max: r.costEstimate.max }
          }));
        }

        costEstimate = {
          partNew: foundPart.newPriceRange.min,
          partUsed: foundPart.usedPriceRange.min,
          laborHours: 2.0,
          laborCost: foundPart.laborCostRange.min,
          totalExpected: foundPart.newPriceRange.min + foundPart.laborCostRange.min
        };
      }
    }

    return {
      assetPartId: assetPart.id,
      assetPartName: assetPart.name,
      category: assetPart.category,
      systemId: assetPart.systemId,
      systemName,
      knowledgePart,
      knownProblems,
      repairs,
      costEstimate,
      disclaimer: Car3DAssetPipeline.getNonDiagnosticSafetyNotice()
    };
  }

  /**
   * Validates if an interaction is supported without fake simulation
   */
  static validateInteraction(
    asset: Car3DAsset,
    interaction: Supported3DInteraction
  ): { allowed: boolean; reason?: string } {
    if (['ROTATE', 'ZOOM', 'SELECT', 'HIGHLIGHT', 'INSPECT', 'EXPLODE'].includes(interaction)) {
      return { allowed: true };
    }

    if (interaction === 'OPEN_HOOD') {
      if (!asset.hasHood) {
        return {
          allowed: false,
          reason: 'El modelo 3D no contiene el capó como un objeto geométrico independiente.'
        };
      }
      return { allowed: true };
    }

    if (interaction === 'OPEN_DOOR') {
      if (!asset.hasDoors) {
        return {
          allowed: false,
          reason: 'El modelo 3D no contiene puertas articulables independientes.'
        };
      }
      return { allowed: true };
    }

    if (interaction === 'OPEN_TRUNK') {
      if (!asset.hasTrunk) {
        return {
          allowed: false,
          reason: 'El modelo 3D no contiene portón o maletero articulable independiente.'
        };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'Interacción no soportada en este modelo.' };
  }

  /**
   * Returns generic universal blueprint when specific vehicle asset is not available
   */
  static getFallbackArchitecture(): Car3DAsset {
    return local3DAssetProvider.getGenericBlueprint();
  }
}
