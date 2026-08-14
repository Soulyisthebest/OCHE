export type PhotoSlotId = 
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'interior'
  | 'dashboard'
  | 'engine'
  | 'tires'
  | 'trunk'
  | 'docs';

export interface PhotoSlot {
  id: PhotoSlotId;
  label: string;
  guide: string;
  iconName: string;
  required?: boolean;
  capturedUrl?: string;
  capturedBase64?: string;
}

export type ConfidenceLevel = 'CONFIRMADO' | 'PROBABLE' | 'DESCONOCIDO';
export type PurchaseVerdict = 'BUY' | 'NEGOTIATE' | 'AVOID';

export interface VehicleIdentity {
  make: string;
  model: string;
  generation?: string;
  version?: string;
  bodyStyle?: string;
  estimatedYearMin: number;
  estimatedYearMax: number;
  engine?: string;
  fuelType?: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  powerHp?: number;
  transmission?: 'Manual' | 'Automático';
  confidenceScore: number; // 0 to 100
  confidenceMap?: Record<string, ConfidenceLevel>;
  needsConfirmation: boolean;
}

export interface VisualObservation {
  category: 'Exterior' | 'Interior' | 'Neumáticos' | 'Motor' | 'Cuadro de mandos';
  part: string;
  status: 'good' | 'warning' | 'danger';
  title: string;
  description: string;
  actionRequired?: string;
}

export interface ModelProCon {
  type: 'pro' | 'con' | 'known_issue';
  title: string;
  description: string;
  isModelGeneral: boolean; // true if general model property, false if observed in this car
}

export interface RepairItem {
  id: string;
  partName: string;
  whatItDoes: string;
  whyAttentionNeeded: string;
  costNewMin: number;
  costNewMax: number;
  costUsedMin?: number;
  costUsedMax?: number;
  laborCostMin: number;
  laborCostMax: number;
  totalEstimatedMin: number;
  totalEstimatedMax: number;
  priority: 'Baja' | 'Media' | 'Alta';
  category: string;
  isDemoData?: boolean;
}

export interface ChecklistItem {
  id: string;
  task: string;
  explanation: string;
  checked: boolean;
  category: 'Motor' | 'Conducción' | 'Documentación' | 'Exterior/Interior';
}

export interface ScoreCategory {
  name: string;
  score: number; // 0-100
  weight: number;
  description: string;
}

export interface RealCostBreakdown {
  askingPrice: number;
  transferFees: number;
  initialMaintenanceMin: number;
  initialMaintenanceMax: number;
  visibleRepairsMin: number;
  visibleRepairsMax: number;
  totalMin: number;
  totalMax: number;
  isDemoData?: boolean;
}

export interface NegotiationTarget {
  askingPrice: number;
  riskCost: number;
  targetPriceMin: number;
  targetPriceMax: number;
  maxRecommendedPrice: number;
  disclaimer: string;
}

export interface CarAnalysisReport {
  id: string;
  createdAt: string;
  photos: Partial<Record<PhotoSlotId, string>>;
  identity: VehicleIdentity;
  mileageKm?: number;
  userPrice?: number;
  score: number; // 0 to 100
  scoreLabel: 'Buena opción' | 'Precaución / negociar' | 'Alto riesgo';
  scoreBadgeColor: 'green' | 'yellow' | 'red';
  verdict?: PurchaseVerdict;
  scoreCategories: ScoreCategory[];
  visualObservations: VisualObservation[];
  modelProsCons: ModelProCon[];
  realCost: RealCostBreakdown;
  negotiation?: NegotiationTarget;
  repairs: RepairItem[];
  checklist: ChecklistItem[];
  recommendation: string;
  cannotDetermineNote: string;
}

export interface InspectionStepOption {
  label: string;
  type: 'yes' | 'no' | 'unsure';
  advice: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextStepId?: number;
}

export interface InspectionStep {
  id: number;
  title: string;
  zone: string;
  description?: string;
  instruction?: string;
  question: string;
  options: InspectionStepOption[];
  riskLevel?: 'low' | 'medium' | 'high';
  explanation?: string;
}

export type AssistantStep = InspectionStep;

export interface CarPartInfo {
  id: string;
  name: string;
  system?: string;
  location?: string;
  whatItDoes?: string;
  description: string;
  whatCanFail?: string;
  symptoms?: string[];
  maintenance?: string;
  priceNew?: string;
  priceRefurbished?: string;
  priceUsed?: string;
  laborCost?: string;
  totalCost?: string;
  commonIssues: string[];
}

export interface CarZone3D {
  id: string;
  name: string;
  icon: string;
  summary: string;
  color: string;
  x: number; // percentage on canvas layout
  y: number;
  z: number;
  parts: CarPartInfo[];
}

export * from './types/vehicleEngine';
