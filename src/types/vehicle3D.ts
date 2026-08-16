/**
 * OCHE / CARCHECK AI — 3D Vehicle Knowledge System Domain Types (FASE 7)
 * Interactive vehicle visualization architecture, multi-format 3D support,
 * knowledge mapping, dynamic cost calculation, inspection guides, and chat bridging.
 */

import { StandardSystemType, SeverityLevel, Part, VehicleSystem, KnownProblem, MaintenanceItem, Repair, ProvenanceMetadata } from './vehicleKnowledge';
import { CountryCode } from './country';

export type Model3DType =
  | 'SVG'
  | 'CANVAS'
  | 'GLTF'
  | 'GLB'
  | 'THREE_JS'
  | 'FUTURE_MODEL'
  | 'INTERACTIVE_VECTOR';

export type CameraPresetId =
  | 'FULL_CAR'
  | 'ENGINE'
  | 'FRONT'
  | 'SIDE'
  | 'REAR'
  | 'UNDERBODY'
  | 'INTERIOR'
  | 'ROOF';

export type ExplanationLevel = 'BASIC' | 'ADVANCED';

export type VisualObservationStatus =
  | 'OBSERVED'
  | 'POSSIBLE'
  | 'KNOWN'
  | 'UNKNOWN';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface HotspotCoordinates {
  x: number; // 0-100 percentage or canvas X
  y: number; // 0-100 percentage or canvas Y
  z?: number;
  screenPosition?: { x: number; y: number };
  label?: string;
}

export interface CameraPreset {
  id: CameraPresetId;
  name: string;
  description: string;
  position: Vector3D;
  target: Vector3D;
  zoom: number;
  rotationAngle: number;
}

export interface Car3DPart {
  id: string;
  partId: string; // Stable foreign key to Part.id in VehicleKnowledge
  name: string;
  systemId: StandardSystemType;
  modelNodeId: string;
  position: Vector3D;
  rotation?: Vector3D;
  scale?: Vector3D;
  hotspot: HotspotCoordinates;
  description: string;
  interactable: boolean;
  zoneId: string;
  importance?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Car3DZone {
  id: string;
  name: string;
  icon?: string;
  summary: string;
  color: string;
  hotspotPosition: HotspotCoordinates;
  cameraPreset: CameraPresetId;
  systemIds: StandardSystemType[];
  partIds: string[];
}

export interface Car3DModel extends ProvenanceMetadata {
  id: string;
  vehicleConfigurationId: string;
  modelName: string;
  make?: string;
  model?: string;
  engine?: string;
  generation?: string;
  yearStart?: number;
  yearEnd?: number;
  modelType: Model3DType;
  assetPath: string;
  format: string;
  scale: Vector3D | number;
  rotation: Vector3D | number;
  camera: {
    position: Vector3D;
    target: Vector3D;
    fov?: number;
  };
  parts: Car3DPart[];
  zones: Car3DZone[];
  metadata: Record<string, any>;
  isDemo: boolean;
  license: string;
  source: string;
  author?: string;
  attribution?: string;
  usageRights?: string;
}

export interface InspectionGuide {
  whatToLookFor: string[];
  howToCheck: string[];
  whatIsNormal: string[];
  whatIsConcerning: string[];
  whenToCallMechanic: string[];
  safetyWarnings: string[];
}

export interface ObservationEvidenceItem {
  partId: string;
  status: VisualObservationStatus;
  label: string;
  details: string;
  severity: SeverityLevel;
  photoSlot?: string;
  reportSection?: string;
}

export interface SymptomCandidate {
  symptomId: string;
  symptomName: string;
  description: string;
  candidateSystems: {
    systemId: StandardSystemType;
    systemName: string;
    likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
    candidateParts: string[]; // partIds or part names
    inspectionTip: string;
  }[];
  safeDrivingAdvice: string;
}

export interface PartCostBreakdown {
  partNew: number;
  partOem: number;
  partAftermarket: number;
  partUsed: number;
  laborHours: number;
  laborCost: number;
  totalEstimatedExpected: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  currency: string;
  countryCode: CountryCode;
  confidence: number;
  isDemo: boolean;
  source: string;
}

export interface PartKnowledgeCard {
  part: Part;
  system: VehicleSystem | null;
  basicExplanation: string; // ELI5 (Explain Like I'm 5)
  advancedExplanation: string; // Technical
  knownProblems: KnownProblem[];
  maintenanceItems: MaintenanceItem[];
  repairs: Repair[];
  inspectionGuide: InspectionGuide;
  costBreakdown: PartCostBreakdown;
  observationStatus: VisualObservationStatus;
  observationEvidence?: ObservationEvidenceItem;
  riskLevel: SeverityLevel;
  zone: Car3DZone | null;
}

export interface ChatPartContext {
  vehicleName: string;
  partName: string;
  partId: string;
  systemName: string;
  riskLevel: SeverityLevel;
  keySymptoms: string[];
  estimatedCost: string;
  inspectionQuestion: string;
  initialPrompt: string;
}
