/**
 * OCHE / CARCHECK AI — 3D Asset Pipeline & Real Asset Integration Types (FASE 15 & 16)
 * Standardized 3D asset architecture, license metadata, part hierarchy,
 * supported interactions, optimization status, and Knowledge Engine integration.
 */

import { StandardSystemType, SeverityLevel } from './vehicleKnowledge';
import { Vector3D } from './vehicle3D';

export type AssetFormat = 'GLB' | 'GLTF' | 'FBX' | 'OBJ' | 'BLEND';

export type AssetSource =
  | 'local_catalog'
  | 'commercial_license'
  | 'editorial'
  | 'open_source'
  | 'custom_scan';

export type AssetLicenseType =
  | 'COMMERCIAL_AUTHORIZED'
  | 'EDITORIAL_ONLY'
  | 'ROYALTY_FREE'
  | 'CC_BY'
  | 'PROPRIETARY';

export type CommercialUseStatus = 'CONFIRMED' | 'UNKNOWN' | 'NON_COMMERCIAL';

export type AssetState =
  | 'AVAILABLE'
  | 'WAITING_FOR_REAL_GLB_ASSET'
  | 'CORRUPT'
  | 'UNSUPPORTED';

export interface AssetLicenseMetadata {
  licenseType: AssetLicenseType;
  licenseHolder?: string;
  assetAuthor?: string;
  sourceUrl?: string;
  licenseUrl?: string;
  attributionRequired: boolean;
  attributionText?: string;
  commercialUseAllowed: boolean;
  commercialUse: CommercialUseStatus;
  modificationAllowed: boolean;
  redistributionAllowed: boolean;
  acquiredDate?: string;
  expiresAt?: string;
}

export type OptimizationStatus = 'raw' | 'optimized' | 'lod_ready' | 'compressed';

export type CompressionFormat = 'DRACO' | 'EXT_meshopt_compression' | 'KTX2_BASIS' | 'NONE';

export type PartCategory =
  | 'body'
  | 'interior'
  | 'engine'
  | 'brakes'
  | 'suspension'
  | 'transmission'
  | 'electronics'
  | 'chassis'
  | 'wheels'
  | 'exhaust';

export type Supported3DInteraction =
  | 'ROTATE'
  | 'ZOOM'
  | 'SELECT'
  | 'HIGHLIGHT'
  | 'INSPECT'
  | 'EXPLODE'
  | 'OPEN_HOOD'
  | 'OPEN_DOOR'
  | 'OPEN_TRUNK';

export interface Car3DAssetPart {
  id: string;
  name: string;
  category: PartCategory;
  parentPartId?: string;
  systemId: StandardSystemType;
  partKnowledgeId?: string; // Stable foreign key to Part.id in VehicleKnowledge
  position: Vector3D;
  rotation?: Vector3D;
  scale?: Vector3D;
  visible: boolean;
  interactive: boolean;
  isSeparableObject: boolean;
  meshNodeName?: string;
}

export interface LodLevel {
  level: number; // 0 = highest detail, 1 = medium, 2 = low (mobile)
  polygonCount: number;
  fileUrl?: string;
  recommendedDistanceMin?: number;
}

export interface Car3DAsset {
  id: string;
  vehicleId: string;
  source: string;
  license: AssetLicenseMetadata;
  format: AssetFormat;
  fileUrl?: string;
  thumbnailUrl?: string;
  polygonCount: number;
  textureSize: string; // e.g. "2048x2048", "1024x1024"
  hasInterior: boolean;
  hasEngine: boolean;
  hasDoors: boolean;
  hasHood: boolean;
  hasTrunk: boolean;
  hasWheels: boolean;
  parts: Car3DAssetPart[];
  optimizationStatus: OptimizationStatus;
  lodLevels?: LodLevel[];
  compressionFormat?: CompressionFormat;
  supportedInteractions: Supported3DInteraction[];
  isReadyForWebProduction: boolean;
  // Phase 16 extensions
  assetState: AssetState;
  fileSize?: number; // Size in bytes
  textureCount?: number;
  textureResolution?: string;
  loadTimeMs?: number;
  performanceWarning?: string;
  missingComponentsMessage?: {
    interior?: string;
    engine?: string;
  };
}

export interface AssetOptimizationReport {
  isMobileReady: boolean;
  polygonBudgetScore: number; // 0-100
  textureBudgetScore: number; // 0-100
  hasLOD: boolean;
  isCompressed: boolean;
  recommendations: string[];
  maxDrawCalls: number;
}

export interface PartToKnowledgeChain {
  assetPartId: string;
  assetPartName: string;
  category: PartCategory;
  systemId: StandardSystemType;
  systemName: string;
  knowledgePart: {
    id: string;
    name: string;
    description: string;
    riskLevel: SeverityLevel;
  } | null;
  knownProblems: {
    id: string;
    title: string;
    severity: string;
    description: string;
  }[];
  repairs: {
    id: string;
    title: string;
    costRange: { min: number; max: number };
  }[];
  costEstimate: {
    partNew: number;
    partUsed: number;
    laborHours: number;
    laborCost: number;
    totalExpected: number;
  };
  disclaimer: string;
}
