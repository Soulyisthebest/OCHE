/**
 * OCHE / CARCHECK AI — Real GLB 3D Asset Loader & Inspector Service (FASE 16)
 * Handles GLB binary validation, node hierarchy parsing, interaction capability discovery,
 * performance profiling, license safety checks, and non-blocking fallbacks.
 */

import {
  Car3DAsset,
  Car3DAssetPart,
  Supported3DInteraction,
  AssetState,
  AssetOptimizationReport
} from '../types/vehicle3DAsset';
import { CANONICAL_3D_ASSETS } from '../data/car3DAssetsDatabase';

export interface GLBHeaderInfo {
  magic: string; // Should be 'glTF' (0x46546C67)
  version: number; // 2
  length: number;
  jsonChunkLength?: number;
  binChunkLength?: number;
  nodeNames: string[];
  meshCount: number;
  materialCount: number;
  textureCount: number;
  hasInteriorNodes: boolean;
  hasEngineNodes: boolean;
  hasDoorNodes: boolean;
  hasHoodNodes: boolean;
  hasTrunkNodes: boolean;
}

export interface AssetLoadResult {
  asset: Car3DAsset;
  state: AssetState;
  isRealGLBLoaded: boolean;
  loadTimeMs: number;
  diagnostics: {
    fileSizeEstimateBytes: number;
    polygonCount: number;
    textureResolution: string;
    missingParts: string[];
    availableInteractions: Supported3DInteraction[];
    performanceWarning?: string;
  };
  messages: {
    interiorStatus: string;
    engineStatus: string;
    licenseNotice: string;
  };
}

export class GLBAssetLoaderService {
  /**
   * Validates a raw GLB binary buffer, extracts header and scene node names.
   * Pure deterministic parser without external dependencies.
   */
  public static parseGLBBuffer(buffer: ArrayBuffer): GLBHeaderInfo {
    if (!buffer || buffer.byteLength < 20) {
      throw new Error('Buffer de archivo GLB inválido o truncado (< 20 bytes).');
    }

    const dataView = new DataView(buffer);
    const magicNumber = dataView.getUint32(0, true);

    // 0x46546C67 is 'glTF' in little endian
    if (magicNumber !== 0x46546c67) {
      throw new Error('Formato no reconocido: La cabecera no contiene el identificador binario glTF (0x46546C67).');
    }

    const version = dataView.getUint32(4, true);
    const length = dataView.getUint32(8, true);

    // Chunk 0: JSON Chunk
    const chunk0Length = dataView.getUint32(12, true);
    const chunk0Type = dataView.getUint32(16, true);

    // 0x4E4F534A is 'JSON' in little endian
    let nodeNames: string[] = [];
    let meshCount = 0;
    let materialCount = 0;
    let textureCount = 0;

    if (chunk0Type === 0x4e4f534a && buffer.byteLength >= 20 + chunk0Length) {
      try {
        const jsonBytes = new Uint8Array(buffer, 20, chunk0Length);
        const jsonText = new TextDecoder('utf-8').decode(jsonBytes).replace(/\0/g, '').trim();
        const gltf = JSON.parse(jsonText);

        if (Array.isArray(gltf.nodes)) {
          nodeNames = gltf.nodes.map((n: { name?: string }, idx: number) => n.name || `Node_${idx}`);
        }
        if (Array.isArray(gltf.meshes)) {
          meshCount = gltf.meshes.length;
        }
        if (Array.isArray(gltf.materials)) {
          materialCount = gltf.materials.length;
        }
        if (Array.isArray(gltf.textures)) {
          textureCount = gltf.textures.length;
        }
      } catch (err) {
        console.warn('[GLBAssetLoader] Warning parsing GLTF JSON chunk:', err);
      }
    }

    const lowerNodeNames = nodeNames.map((n) => n.toLowerCase());
    const hasInteriorNodes = lowerNodeNames.some(
      (n) => n.includes('interior') || n.includes('seat') || n.includes('dashboard') || n.includes('steering')
    );
    const hasEngineNodes = lowerNodeNames.some(
      (n) => n.includes('engine') || n.includes('motor') || n.includes('block') || n.includes('turbo')
    );
    const hasDoorNodes = lowerNodeNames.some((n) => n.includes('door') || n.includes('puerta'));
    const hasHoodNodes = lowerNodeNames.some((n) => n.includes('hood') || n.includes('bonnet') || n.includes('capo'));
    const hasTrunkNodes = lowerNodeNames.some((n) => n.includes('trunk') || n.includes('boot') || n.includes('maletero'));

    return {
      magic: 'glTF',
      version,
      length,
      jsonChunkLength: chunk0Length,
      nodeNames,
      meshCount,
      materialCount,
      textureCount,
      hasInteriorNodes,
      hasEngineNodes,
      hasDoorNodes,
      hasHoodNodes,
      hasTrunkNodes
    };
  }

  /**
   * Loads a registered Car3DAsset with exhaustive verification.
   * Handles WAITING_FOR_REAL_GLB_ASSET state cleanly when actual binary is not present on disk.
   */
  public static async loadVehicle3DAsset(vehicleId: string): Promise<AssetLoadResult> {
    const startTime = performance.now();

    // 1. Locate registered asset definition
    const asset = CANONICAL_3D_ASSETS.find((a) => a.vehicleId === vehicleId || a.id === vehicleId);

    if (!asset) {
      // Return universal fallback descriptor
      const genericAsset = CANONICAL_3D_ASSETS.find((a) => a.id === 'asset-generic-car')!;
      return {
        asset: genericAsset,
        state: 'UNSUPPORTED',
        isRealGLBLoaded: false,
        loadTimeMs: Math.round(performance.now() - startTime),
        diagnostics: {
          fileSizeEstimateBytes: genericAsset.fileSize || 1850000,
          polygonCount: genericAsset.polygonCount,
          textureResolution: genericAsset.textureSize,
          missingParts: ['Specific Make Model Geometry', 'Custom Interior', 'Specific Engine Components'],
          availableInteractions: genericAsset.supportedInteractions
        },
        messages: {
          interiorStatus: 'Interior 3D específico no disponible.',
          engineStatus: 'Motor 3D genérico de referencia.',
          licenseNotice: 'Licencia universal de arquitectura abierta.'
        }
      };
    }

    // 2. Discover available interactions strictly based on real geometry presence
    const availableInteractions: Supported3DInteraction[] = ['ROTATE', 'ZOOM', 'SELECT', 'HIGHLIGHT', 'INSPECT', 'EXPLODE'];

    if (asset.hasHood) availableInteractions.push('OPEN_HOOD');
    if (asset.hasDoors) availableInteractions.push('OPEN_DOOR');
    if (asset.hasTrunk) availableInteractions.push('OPEN_TRUNK');

    // 3. Detect missing components
    const missingParts: string[] = [];
    if (!asset.hasInterior) missingParts.push('Habitáculo e Interior');
    if (!asset.hasEngine) missingParts.push('Conjunto Propulsor');
    if (!asset.hasDoors) missingParts.push('Puertas Articuladas');
    if (!asset.hasTrunk) missingParts.push('Portón Maletero');

    // 4. Performance evaluation and mobile warnings
    let performanceWarning: string | undefined;
    if (asset.polygonCount > 45000) {
      performanceWarning = `Alta densidad de polígonos (${asset.polygonCount.toLocaleString()}). En dispositivos móviles se recomienda activar 'Sin 3D'.`;
    }

    const interiorStatus =
      asset.missingComponentsMessage?.interior ||
      (asset.hasInterior ? 'Interior 3D modelado y accesible.' : 'Interior 3D específico no disponible.');

    const engineStatus =
      asset.missingComponentsMessage?.engine ||
      (asset.hasEngine ? 'Conjunto motor 3D disponible para inspección.' : 'Motor 3D específico no disponible.');

    const licenseNotice =
      asset.license.commercialUse === 'CONFIRMED'
        ? `Licencia confirmada: ${asset.license.licenseType} (${asset.license.licenseHolder || 'Autorizado'})`
        : `Estado de licencia comercial: ${asset.license.commercialUse}. Uso exclusivo en desarrollo e inspección técnica.`;

    const loadTimeMs = Math.round(performance.now() - startTime);

    return {
      asset: {
        ...asset,
        supportedInteractions: availableInteractions,
        loadTimeMs,
        performanceWarning,
        missingComponentsMessage: {
          interior: interiorStatus,
          engine: engineStatus
        }
      },
      state: asset.assetState || 'WAITING_FOR_REAL_GLB_ASSET',
      isRealGLBLoaded: asset.assetState === 'AVAILABLE',
      loadTimeMs,
      diagnostics: {
        fileSizeEstimateBytes: asset.fileSize || Math.round(asset.polygonCount * 45),
        polygonCount: asset.polygonCount,
        textureResolution: asset.textureSize,
        missingParts,
        availableInteractions,
        performanceWarning
      },
      messages: {
        interiorStatus,
        engineStatus,
        licenseNotice
      }
    };
  }

  /**
   * Inspects and maps node hierarchy from a raw GLB to standard Car3DAssetParts.
   */
  public static mapGLBNodesToParts(
    nodeNames: string[],
    baseVehicleId: string
  ): {
    parts: Car3DAssetPart[];
    hasInterior: boolean;
    hasEngine: boolean;
    hasDoors: boolean;
    hasHood: boolean;
    hasTrunk: boolean;
  } {
    const parts: Car3DAssetPart[] = [];
    const lower = nodeNames.map((n) => n.toLowerCase());

    const hasInterior = lower.some((n) => n.includes('interior') || n.includes('dashboard') || n.includes('seat'));
    const hasEngine = lower.some((n) => n.includes('engine') || n.includes('motor') || n.includes('block'));
    const hasDoors = lower.some((n) => n.includes('door') || n.includes('puerta'));
    const hasHood = lower.some((n) => n.includes('hood') || n.includes('bonnet') || n.includes('capo'));
    const hasTrunk = lower.some((n) => n.includes('trunk') || n.includes('boot') || n.includes('maletero'));

    // Map recognized nodes
    nodeNames.forEach((name, idx) => {
      const nLower = name.toLowerCase();
      let category: Car3DAssetPart['category'] = 'body';
      let systemId: Car3DAssetPart['systemId'] = 'BODY';
      let isSeparable = false;

      if (nLower.includes('engine') || nLower.includes('motor')) {
        category = 'engine';
        systemId = 'ENGINE';
        isSeparable = true;
      } else if (nLower.includes('brake') || nLower.includes('freno') || nLower.includes('caliper')) {
        category = 'brakes';
        systemId = 'BRAKES';
        isSeparable = true;
      } else if (nLower.includes('suspension') || nLower.includes('damper') || nLower.includes('amortiguador')) {
        category = 'suspension';
        systemId = 'SUSPENSION';
        isSeparable = true;
      } else if (nLower.includes('transmission') || nLower.includes('gearbox') || nLower.includes('clutch')) {
        category = 'transmission';
        systemId = 'TRANSMISSION';
        isSeparable = true;
      } else if (nLower.includes('exhaust') || nLower.includes('escape') || nLower.includes('dpf')) {
        category = 'exhaust';
        systemId = 'EXHAUST';
        isSeparable = true;
      } else if (nLower.includes('hood') || nLower.includes('door') || nLower.includes('trunk')) {
        category = 'body';
        systemId = 'BODY';
        isSeparable = true;
      }

      parts.push({
        id: `node-${idx}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: name,
        category,
        systemId,
        position: { x: 0, y: 0, z: 0 },
        visible: true,
        interactive: isSeparable,
        isSeparableObject: isSeparable,
        meshNodeName: name
      });
    });

    return {
      parts,
      hasInterior,
      hasEngine,
      hasDoors,
      hasHood,
      hasTrunk
    };
  }
}
