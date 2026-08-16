/**
 * OCHE / CARCHECK AI — Global Cost & Market Intelligence Types (FASE 6)
 * Strictly typed interfaces for vehicle market valuation, differentiated parts pricing,
 * labor markets, country tax & registration costs, deal scoring, target pricing,
 * and negotiation strategy.
 */

import { CountryCode, CurrencyCode, MarketCode } from './country';
import { ProvenanceMetadata, SourceType } from './vehicleKnowledge';

export type MarketPriceSource =
  | 'DEALER'
  | 'MARKETPLACE'
  | 'AUCTION'
  | 'PUBLIC_DATABASE'
  | 'USER'
  | 'MANUAL'
  | 'AI'
  | 'DEMO'
  | 'UNKNOWN';

export type PriceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type PartCondition = 'NEW' | 'OEM' | 'AFTERMARKET' | 'USED' | 'REMANUFACTURED';

export type PartQuality = 'PREMIUM' | 'STANDARD' | 'BUDGET';

export type VehicleCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export type RepairScenarioType = 'BEST_CASE' | 'EXPECTED' | 'WORST_CASE';

export type DealRating =
  | 'EXCELLENT_DEAL'
  | 'GOOD_DEAL'
  | 'FAIR_PRICE'
  | 'OVERPRICED'
  | 'TERRIBLE_DEAL';

export interface PriceRange {
  minimum: number;
  expected: number;
  maximum: number;
  currency: CurrencyCode;
}

export interface PartPrice extends ProvenanceMetadata {
  partId: string;
  partName: string;
  countryCode: CountryCode;
  currency: CurrencyCode;
  condition: PartCondition;
  brand?: string;
  quality?: PartQuality;
  minimum: number;
  expected: number;
  maximum: number;
  source?: string;
  date?: string;
  confidence: number;
  isDemo: boolean;
}

export interface LaborRate extends ProvenanceMetadata {
  countryCode: CountryCode;
  region?: string;
  currency: CurrencyCode;
  minimumHourlyRate: number;
  averageHourlyRate: number;
  maximumHourlyRate: number;
  source?: string;
  date?: string;
  confidence: number;
  isDemo: boolean;
}

export interface RepairScenarioCost {
  partsCost: number;
  laborCost: number;
  additionalCosts: number;
  totalCost: number;
  description: string;
}

export interface RepairCostEstimate extends ProvenanceMetadata {
  repairId: string;
  title: string;
  systemId: string;
  partId?: string;
  partConditionUsed: PartCondition;
  partsCost: PriceRange;
  laborHours: number;
  laborCost: PriceRange;
  additionalCosts: PriceRange;
  minimum: number;
  expected: number;
  maximum: number;
  currency: CurrencyCode;
  scenarios: {
    bestCase: RepairScenarioCost;
    expected: RepairScenarioCost;
    worstCase: RepairScenarioCost;
  };
  confidence: number;
  isDemo: boolean;
}

export interface UnknownCostExposure {
  id: string;
  title: string;
  systemId?: string;
  description: string;
  requiresDiagnosis: boolean;
  message: string; // e.g. "Coste desconocido hasta diagnóstico."
  potentialRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedExposureRangeIfFailed?: {
    min: number;
    max: number;
    currency: CurrencyCode;
  };
}

export interface TaxCost extends ProvenanceMetadata {
  countryCode: CountryCode;
  taxType: string;
  rate: number; // e.g. 0.04 for 4% ITP in Spain or sales tax in US
  minimum: number;
  maximum: number;
  currency: CurrencyCode;
  source?: string;
  effectiveDate?: string;
  isDemo: boolean;
}

export interface RegistrationCost extends ProvenanceMetadata {
  country: CountryCode;
  countryCode?: CountryCode;
  region?: string;
  vehicleType?: string;
  fuel?: string;
  power?: number;
  engine?: string;
  fixedFee: number;
  minimum: number;
  maximum: number;
  currency: CurrencyCode;
  source?: string;
  isDemo: boolean;
}

export interface InspectionCost extends ProvenanceMetadata {
  country?: CountryCode;
  countryCode?: CountryCode;
  inspectionType: string; // e.g. "ITV", "TÜV", "MOT", "Smog Check"
  minimum: number;
  maximum: number;
  currency: CurrencyCode;
  source?: string;
  isDemo: boolean;
}

export interface InsuranceEstimate extends ProvenanceMetadata {
  country: CountryCode;
  region?: string;
  driverProfile?: string;
  vehicle?: string;
  coverage?: 'THIRD_PARTY' | 'COMPREHENSIVE' | 'THIRD_PARTY_EXTENDED';
  minimum: number;
  maximum: number;
  currency: CurrencyCode;
  source?: string;
  confidence: number;
  isDemo: boolean;
}

export interface PriceFactors {
  ageYears: number;
  mileageKm: number;
  condition: VehicleCondition;
  engine?: string;
  fuel?: string;
  transmission?: string;
  trim?: string;
  equipmentScore?: number;
  market?: MarketCode;
  country: CountryCode;
  region?: string;
  accidentHistory?: 'NONE' | 'MINOR' | 'STRUCTURAL' | 'UNKNOWN';
  maintenanceHistory?: 'FULL_OFFICIAL' | 'REGULAR_INDEPENDENT' | 'PARTIAL' | 'NONE' | 'UNKNOWN';
  ownersCount?: number;
  inspectionStatus?: 'VALID' | 'EXPIRED' | 'PENDING' | 'UNKNOWN';
}

export interface MarketPriceEstimate {
  minimum: number;
  median: number;
  maximum: number;
  confidence: PriceConfidence;
  confidenceScore: number; // 0.0 - 1.0
  source: MarketPriceSource;
  currency: CurrencyCode;
  date: string;
  isDemo: boolean;
  status: 'AVAILABLE' | 'INSUFFICIENT_DATA';
  message?: string;
  factorsApplied?: string[];
}

export interface PriceObservation {
  id: string;
  vehicleId?: string;
  make: string;
  model: string;
  generation?: string;
  year: number;
  mileage: number;
  fuel?: string;
  transmission?: string;
  trim?: string;
  condition?: VehicleCondition;
  country: CountryCode;
  region?: string;
  price: number;
  currency: CurrencyCode;
  date: string;
  source: MarketPriceSource;
  confidence: PriceConfidence;
  isDemo: boolean;
}

export interface RealPurchaseCostResult {
  purchasePrice: number;
  repairExposure: {
    minimum: number;
    expected: number;
    maximum: number;
  };
  maintenanceExposure: {
    minimum: number;
    expected: number;
    maximum: number;
  };
  registrationExposure: number;
  inspectionExposure: number;
  taxExposure: number;
  otherCountrySpecificCosts: number;
  totalMinimum: number;
  totalExpected: number;
  totalMaximum: number;
  currency: CurrencyCode;
  confidence: PriceConfidence;
  unknownExposures: UnknownCostExposure[];
  isDemo: boolean;
  breakdownItems: Array<{
    category: string;
    label: string;
    min: number;
    expected: number;
    max: number;
    isObligatory: boolean;
    note?: string;
  }>;
}

export interface DealScoreResult {
  dealScore: number; // 0 - 100
  rating: DealRating;
  vehicleQualityScore: number; // 0 - 100
  askingPrice: number;
  fairMarketMedian: number;
  priceDifferenceVsFair: number; // positive = overpriced, negative = discount
  percentageDifferenceVsFair: number; // % vs fair median
  repairExposureExpected: number;
  totalEntryCostExpected: number;
  verdict: 'EXCELLENT_DEAL' | 'GOOD_DEAL' | 'FAIR_PRICE' | 'OVERPRICED' | 'TERRIBLE_DEAL';
  explanation: string;
  isDemo: boolean;
}

export interface TargetPriceResultExtended {
  askingPrice: number;
  fairPriceRange: {
    minimum: number;
    median: number;
    maximum: number;
  };
  targetPrice: number;
  maximumRecommendedPrice: number;
  walkAwayPrice: number;
  confidence: PriceConfidence;
  currency: CurrencyCode;
  isDemo: boolean;
  reasoning: string[];
}

export interface NegotiationProposal {
  askingPrice: number;
  initialSuggestedOffer: number;
  targetPrice: number;
  maximumRecommendedPrice: number;
  walkAwayPrice: number;
  potentialExposureTotal: number;
  arguments: string[];
  sellerObjectionsResponses: Array<{ objection: string; response: string }>;
  currency: CurrencyCode;
  isDemo: boolean;
}

export interface WhatIfSimulationInput {
  baseAskingPrice: number;
  baseVehicleScore: number;
  baseRepairs: RepairCostEstimate[];
  partConditionPreference?: PartCondition; // e.g. switch to USED or AFTERMARKET
  selectedScenarioIds: string[];
  customScenarios?: Array<{
    id: string;
    name: string;
    costMin: number;
    costMax: number;
    laborHours: number;
    riskImpact: number;
  }>;
}

export interface WhatIfSimulationOutput {
  baseTotalExpected: number;
  simulatedTotalExpected: number;
  costDifference: number;
  newTargetNegotiationMin: number;
  newTargetNegotiationMax: number;
  newMaxRecommendedPrice: number;
  adjustedVehicleScore: number;
  adjustedDealScore: number;
  adjustedDealVerdict: DealRating;
  appliedPartCondition: PartCondition;
  negotiationScript: string[];
}

export interface CountryOwnershipComparisonItem {
  countryCode: CountryCode;
  countryName: string;
  currency: CurrencyCode;
  purchasePriceLocal: number;
  purchasePriceEUR: number;
  repairsExpectedLocal: number;
  laborRateHourlyLocal: number;
  taxAndRegistrationLocal: number;
  inspectionFeeLocal: number;
  totalEntryCostLocal: number;
  totalEntryCostEUR: number;
  isDemo: boolean;
}

export interface CountryOwnershipComparisonResult {
  vehicleDescription: string;
  baseYear: number;
  baseMileageKm: number;
  comparisons: CountryOwnershipComparisonItem[];
}

// -------------------------------------------------------------
// Provider interfaces for future external data integrations (Rule 29)
// -------------------------------------------------------------

export interface MarketDataProvider {
  getMarketPrice(factors: PriceFactors): Promise<MarketPriceEstimate>;
  getPriceObservations(make: string, model: string, country: CountryCode): Promise<PriceObservation[]>;
}

export interface PartPriceProvider {
  getPartPrices(partId: string, countryCode: CountryCode): Promise<PartPrice[]>;
}

export interface LaborRateProvider {
  getLaborRate(countryCode: CountryCode, region?: string): Promise<LaborRate>;
}

export interface TaxProvider {
  getTransferTax(countryCode: CountryCode, vehiclePrice: number, region?: string): Promise<TaxCost>;
}

export interface RegistrationProvider {
  getRegistrationCost(countryCode: CountryCode, vehicleType?: string): Promise<RegistrationCost>;
}

export interface InspectionProvider {
  getInspectionCost(countryCode: CountryCode): Promise<InspectionCost>;
}
