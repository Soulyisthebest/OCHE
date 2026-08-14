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
  timingType?: 'Belt' | 'Chain' | 'Correa' | 'Cadena';
  emissionStandard?: 'Euro 4' | 'Euro 5' | 'Euro 6' | 'Euro 6d';
}

export interface KnownProblem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'Baja' | 'Media' | 'Alta' | 'Crítica';
  affectedComponent?: string;
  estimatedCost?: CostEstimate;
  failureRate?: 'Raro' | 'Ocasional' | 'Frecuente' | 'Endémico';
  preventionAdvice?: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  intervalKm?: number;
  intervalYears?: number;
  costEstimate: CostEstimate;
  description?: string;
  criticality?: 'Recomendado' | 'Obligatorio' | 'Preventivo';
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
  location?: string;
  importance?: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  failureModes?: string[];
  symptoms?: string[];
  inspectionMethods?: string[];
  commonSymptoms: string[];
  knownProblems: KnownProblem[];
  maintenanceInterval?: string;
  newPriceRange: CostEstimate;
  usedPriceRange: CostEstimate;
  laborCostRange: CostEstimate;
  repairDifficulty?: 'Fácil' | 'Intermedio' | 'Complejo' | 'Taller Especializado';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  source?: string;
  isDemo?: boolean;
}

export interface Repair {
  id: string;
  title: string;
  description: string;
  partId?: string;
  costEstimate: CostEstimate;
  urgency: 'low' | 'medium' | 'high' | 'Baja' | 'Media' | 'Alta';
  laborHoursEstimated?: number;
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

export interface VehicleIdentityDetails {
  brand: string;
  model: string;
  generation: string;
  facelift?: string;
  trim?: string;
  engineCode?: string;
  engineName: string;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP';
  transmission: 'Manual' | 'Automático';
  powerHp: number;
  bodyStyle?: 'Hatchback' | 'Sedán' | 'Familiar' | 'SUV' | 'Coupé';
  yearRange: string;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  generation: string;
  facelift?: string;
  trim?: string;
  bodyStyle?: 'Hatchback' | 'Sedán' | 'Familiar' | 'SUV' | 'Coupé';
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
