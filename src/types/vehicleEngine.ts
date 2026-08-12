export interface CostEstimate {
  min: number;
  max: number;
  currency?: string;
}

export interface Engine {
  id: string;
  name: string;
  code?: string;
  displacementCc?: number;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  powerHp: number;
  cylinders?: number;
  turbo?: boolean;
  knownIssues?: string[];
}

export interface KnownProblem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'Baja' | 'Media' | 'Alta' | 'Crítica';
  affectedComponent?: string;
  estimatedCost?: CostEstimate;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  intervalKm?: number;
  intervalYears?: number;
  costEstimate: CostEstimate;
  description?: string;
}

export interface VehicleSystem {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Part {
  id: string;
  name: string;
  system: string; // System ID or System Name
  function: string;
  commonSymptoms: string[];
  knownProblems: KnownProblem[];
  newPriceRange: CostEstimate;
  usedPriceRange: CostEstimate;
  laborCostRange: CostEstimate;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Repair {
  id: string;
  title: string;
  description: string;
  partId?: string;
  costEstimate: CostEstimate;
  urgency: 'low' | 'medium' | 'high' | 'Baja' | 'Media' | 'Alta';
}

export interface Car3DPart {
  id: string;
  name: string;
  zoneId: string;
  x: number;
  y: number;
  z: number;
  description?: string;
  issues?: string[];
  costEstimate?: CostEstimate;
}

export interface Car3DModel {
  id: string;
  name: string;
  zones: Car3DPart[];
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  generation: string;
  yearFrom: number;
  yearTo: number | 'present' | null;
  engine: Engine;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  power: number;
  transmission: 'Manual' | 'Automático';
  knownProblems: KnownProblem[];
  maintenance: MaintenanceItem[];
  systems: VehicleSystem[];
  parts: Part[];
  repairs: Repair[];
  model3D: Car3DModel;

  // Additional display / legacy fields
  subtitle?: string;
  thumbnail?: string;
  askingPrice?: number;
  mileage?: number;
  sampleReport?: any;
}
