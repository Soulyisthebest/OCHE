/**
 * OCHE / CARCHECK AI — Global Vehicle Knowledge Core Types (FASE 5)
 * Standardized vehicle domain ontology, stable IDs, multi-market configurations,
 * and traceable provenance metadata.
 */

export type SourceType =
  | 'OFFICIAL'
  | 'MANUFACTURER'
  | 'TECHNICAL'
  | 'WORKSHOP'
  | 'MARKET'
  | 'USER'
  | 'AI'
  | 'DEMO'
  | 'UNKNOWN';

export type DataStatus =
  | 'KNOWN'
  | 'UNKNOWN'
  | 'NOT_AVAILABLE'
  | 'NEEDS_VERIFICATION';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type StandardSystemType =
  | 'ENGINE'
  | 'TRANSMISSION'
  | 'BRAKES'
  | 'SUSPENSION'
  | 'STEERING'
  | 'ELECTRICAL'
  | 'COOLING'
  | 'FUEL'
  | 'EXHAUST'
  | 'EMISSIONS'
  | 'BODY'
  | 'INTERIOR'
  | 'SAFETY'
  | 'AIR_CONDITIONING'
  | 'TYRES'
  | 'DRIVETRAIN';

export interface ProvenanceMetadata {
  source?: string;
  sourceType?: SourceType;
  sourceDate?: string;
  confidence?: number;
  isDemo?: boolean;
  dataStatus?: DataStatus;
  createdAt?: string;
  updatedAt?: string;
  dataVersion?: string;
}

export interface CostModel extends ProvenanceMetadata {
  minimum: number;
  expected: number;
  maximum: number;
  currency: string;
  countryCode: string;
  date?: string;
}

export interface Brand extends ProvenanceMetadata {
  brandId: string;
  officialName: string;
  aliases: string[];
  countryOfOrigin?: string;
  foundedYear?: number;
}

export interface VehicleModel extends ProvenanceMetadata {
  modelId: string;
  brandId: string;
  name: string;
  segment?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'J' | 'M' | 'S';
  category?: 'Hatchback' | 'Sedan' | 'Estate' | 'SUV' | 'Coupe' | 'Convertible' | 'Van';
  productionStartYear: number;
  productionEndYear: number | null;
  aliases?: string[];
}

export interface Restyling {
  id: string;
  generationId: string;
  name: string;
  yearFrom: number;
  yearTo: number | null;
  changesDescription?: string;
  visualDifferences?: string[];
}

export interface VehicleGeneration extends ProvenanceMetadata {
  generationId: string;
  modelId: string;
  generationName: string;
  internalCode?: string;
  yearFrom: number;
  yearTo: number | null;
  facelifts?: Restyling[];
  bodyStyles: ('Hatchback' | 'Sedan' | 'Estate' | 'SUV' | 'Coupe' | 'Convertible' | 'Van')[];
  availableEngineIds: string[];
  availableTransmissionOptions: ('Manual' | 'Automatic' | 'DualClutch' | 'CVT' | 'TorqueConverter')[];
  markets: string[];
}

export interface EngineCodeDetail {
  engineCode: string;
  engineFamily: string;
  engineVariant?: string;
  powerHp?: number;
  torqueNm?: number;
  timingType?: 'Belt' | 'Chain' | 'WetBelt' | 'Gear';
  notes?: string;
}

export interface Engine extends ProvenanceMetadata {
  engineId: string;
  manufacturer: string;
  family: string;
  name: string;
  engineCodes: (string | EngineCodeDetail)[];
  displacementCc: number;
  cylinders: number;
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP' | 'GNC';
  aspiration: 'NaturallyAspirated' | 'Turbocharged' | 'Supercharged' | 'TwinTurbo' | 'Electric';
  powerHp: number;
  torqueNm?: number;
  transmissionOptions: ('Manual' | 'Automatic' | 'DualClutch' | 'CVT' | 'TorqueConverter')[];
  timingType: 'Belt' | 'Chain' | 'WetBelt' | 'Gear';
  emissionStandard?: string;
  productionYears: { from: number; to: number | null };
  knownProblemIds: string[];
  maintenanceIds: string[];
}

export interface VehicleSystem {
  id: StandardSystemType;
  name: string;
  description: string;
  parts: string[];
  knownProblems: string[];
  maintenance: string[];
  repairs: string[];
}

export interface Part extends ProvenanceMetadata {
  id: string;
  name: string;
  systemId: StandardSystemType;
  description: string;
  function: string;
  location?: string;
  symptoms: string[];
  failureModes: string[];
  inspectionMethods: string[];
  maintenanceItems: string[];
  knownProblems: string[];
  repairOptions: string[];
  riskLevel: SeverityLevel;
  costRange?: CostModel;
}

export interface KnownProblem extends ProvenanceMetadata {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  affectedEngines: string[];
  affectedYears: number[] | { from: number; to: number };
  symptoms: string[];
  warningSigns: string[];
  inspectionMethod: string;
  recommendedAction: string;
  relatedParts: string[];
  relatedSystems: StandardSystemType[];
  estimatedRepair: CostModel;
}

export interface MaintenanceItem extends ProvenanceMetadata {
  id: string;
  vehicleConfigurationId?: string;
  engineId?: string;
  item: string;
  intervalKm?: number;
  intervalMonths?: number;
  severity: SeverityLevel;
  recommended: boolean;
  notes: string;
  estimatedCost?: CostModel;
}

export interface Repair extends ProvenanceMetadata {
  id: string;
  partId: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Complex' | 'SpecialistWorkshop' | 'Fácil' | 'Intermedio' | 'Complejo' | 'Taller Especializado';
  partsCost: CostModel;
  laborCost: CostModel;
  totalCost: CostModel;
  estimatedTimeHours: number;
  riskLevel: SeverityLevel;
}

export interface MarketConfiguration extends ProvenanceMetadata {
  id: string;
  vehicleConfigurationId: string;
  countryCode: string;
  marketName: string;
  modelName: string;
  trimNames: string[];
  availableEngines: string[];
  availableTransmissions: string[];
  availableFuelTypes: string[];
  productionYears: { from: number; to: number | null };
  localSpecifications: Record<string, string | number | boolean>;
  localUnits: {
    distance: string;
    speed: string;
    fuelEconomy: string;
    power: string;
    currency: string;
  };
  localNotes?: string[];
}

export interface VehicleConfiguration extends ProvenanceMetadata {
  vehicleConfigurationId: string;
  brandId: string;
  modelId: string;
  generationId: string;
  engineId: string;
  transmission: 'Manual' | 'Automatic' | 'DualClutch' | 'CVT';
  fuel: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico' | 'GLP' | 'GNC';
  bodyStyle: 'Hatchback' | 'Sedan' | 'Estate' | 'SUV' | 'Coupe' | 'Convertible';
  powerHp: number;
  productionYears: { from: number; to: number | null };
  systemIds: StandardSystemType[];
  partIds: string[];
  knownProblemIds: string[];
  maintenanceIds: string[];
  repairIds: string[];
  marketIds: string[];
}

export interface GlobalVehicleComposite extends ProvenanceMetadata {
  id: string;
  brand: Brand;
  model: VehicleModel;
  generation: VehicleGeneration;
  engine: Engine;
  configuration: VehicleConfiguration;
  marketConfigurations: MarketConfiguration[];
  systems: VehicleSystem[];
  parts: Part[];
  knownProblems: KnownProblem[];
  maintenance: MaintenanceItem[];
  repairs: Repair[];
  samplePrice?: number;
  sampleMileage?: number;
}
