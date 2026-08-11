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

export interface VehicleIdentity {
  make: string;
  model: string;
  generation?: string;
  estimatedYearMin: number;
  estimatedYearMax: number;
  engine?: string;
  fuelType?: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  powerHp?: number;
  transmission?: 'Manual' | 'Automático';
  confidenceScore: number; // 0 to 100
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
  scoreCategories: ScoreCategory[];
  visualObservations: VisualObservation[];
  modelProsCons: ModelProCon[];
  realCost: RealCostBreakdown;
  repairs: RepairItem[];
  checklist: ChecklistItem[];
  recommendation: string;
  cannotDetermineNote: string;
}

export interface AssistantStep {
  id: number;
  title: string;
  zone: string;
  instruction: string;
  question: string;
  options: {
    label: string;
    type: 'yes' | 'no' | 'unsure';
    advice: string;
    riskLevel: 'low' | 'medium' | 'high';
  }[];
}

export interface CarPartInfo {
  id: string;
  name: string;
  description: string;
  priceNew?: string;
  priceRefurbished?: string;
  priceUsed?: string;
  laborCost?: string;
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
