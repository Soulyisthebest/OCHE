import { Vehicle, KnownProblem, MaintenanceItem, Part, Repair, CostEstimate } from './vehicleEngine';
import { StructuredFinding, EvidenceType } from './evidence';
import { RiskAssessment, RiskLevel } from './risk';
import { RealCostBreakdown, NegotiationTarget, PurchaseVerdict, ScoreCategory, ChecklistItem, PhotoSlotId } from '../types';
import { PurchaseScoreResult } from '../services/PurchaseScoreEngine';

export type AnalysisStatus = 
  | 'CREATED'
  | 'SCANNING'
  | 'IDENTIFYING'
  | 'ANALYZING'
  | 'CALCULATING'
  | 'READY'
  | 'ERROR';

export type PurchaseDecision = 'GOOD_DEAL' | 'FAIR' | 'NEGOTIATE' | 'HIGH_RISK' | 'AVOID';

export type ObservationSource = 
  | 'PHOTO'
  | 'USER'
  | 'VEHICLE_DATABASE'
  | 'AI'
  | 'CALCULATED'
  | 'UNKNOWN';

export interface ImageAnalysisItem {
  id: string;
  type: PhotoSlotId;
  uri: string;
  analysisStatus: 'pending' | 'analyzing' | 'analyzed' | 'error';
  observations: StructuredFinding[];
  confidence: number;
  errors: string[];
}

export interface VehicleIdentificationCandidate {
  vehicleId: string;
  brand: string;
  model: string;
  generation: string;
  engine: string;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  power: number;
  transmission: 'Manual' | 'Automático';
  yearRange: string;
  confidence: number;
  matchingTraits: string[];
}

export interface VehicleIdentificationResult {
  brand: string;
  model: string;
  generation: string;
  year?: number;
  engine: string;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  power: number;
  transmission: 'Manual' | 'Automático';
  confidence: number;
  evidence: string[];
  unknowns: string[];
  candidates: VehicleIdentificationCandidate[];
  matchedVehicle?: Vehicle | null;
  status?: 'CONFIRMED' | 'NEEDS_VERIFICATION' | 'IDENTIFIED_BUT_UNSUPPORTED' | 'UNKNOWN';
  isEngineKnown?: boolean;
  isContradictory?: boolean;
  conflictingDetectedVehicle?: {
    brand: string;
    model: string;
    generation?: string;
    confidence?: number;
  };
}

export interface RiskCategoryDetail {
  riskType: 'visualRisk' | 'knownProblemRisk' | 'maintenanceRisk' | 'repairRisk' | 'unknownRisk' | 'overallRisk';
  label: string;
  level: RiskLevel;
  causes: string[];
  inspectionNeeded: string[];
  estimatedCostExposure: { min: number; max: number };
  confidence: number;
  explanation: string;
  howToCheck: string[];
}

export interface CostDetailItem {
  id: string;
  name: string;
  partCost: { min: number; expected: number; max: number };
  laborCost: { min: number; expected: number; max: number };
  minimum: number;
  expected: number;
  maximum: number;
  isDemo: boolean;
  category: string;
  urgency: 'Baja' | 'Media' | 'Alta';
  reason: string;
  howToCheck: string[];
}

export interface ComprehensiveCostEstimate {
  askingPrice: number;
  transferFees: number;
  immediateCost: number;
  possibleCost: number;
  totalEstimatedCost: number;
  unknownCost: number;
  isDemo: boolean;
  items: CostDetailItem[];
}

export interface TargetPriceResult {
  askingPrice: number;
  estimatedRepairExposure: number;
  riskAdjustment: number;
  targetPrice: number;
  maximumPrice: number;
  minimumNegotiationPrice: number;
  hasSufficientData: boolean;
  message?: string;
  negotiationScript: string[];
}

export interface VehicleAnalysisSession {
  id: string;
  createdAt: string;
  status: AnalysisStatus;
  vehicle: Vehicle | null;
  identification: VehicleIdentificationResult | null;
  askingPrice?: number;
  mileage?: number;
  year?: number;
  location?: string;
  fuel?: string;
  transmission?: string;
  photos: ImageAnalysisItem[];
  observations: StructuredFinding[];
  knownProblems: KnownProblem[];
  maintenanceFindings: MaintenanceItem[];
  riskFindings: RiskAssessment;
  riskDetails: {
    visualRisk: RiskCategoryDetail;
    knownProblemRisk: RiskCategoryDetail;
    maintenanceRisk: RiskCategoryDetail;
    repairRisk: RiskCategoryDetail;
    unknownRisk: RiskCategoryDetail;
    overallRisk: RiskCategoryDetail;
  };
  costEstimate: RealCostBreakdown;
  comprehensiveCost: ComprehensiveCostEstimate;
  targetPrice: TargetPriceResult;
  score: PurchaseScoreResult;
  decision: PurchaseDecision;
  recommendation: string;
  confidence: number;
  sellerQuestions: string[];
  mechanicChecklist: ChecklistItem[];
  unknownFactors: string[];
  isDemoMode: boolean;
}
