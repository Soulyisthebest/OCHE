export type CountryCode =
  | 'ES'
  | 'FR'
  | 'DE'
  | 'IT'
  | 'PT'
  | 'UK'
  | 'US'
  | 'CA'
  | 'MX'
  | 'BR'
  | 'MA'
  | 'SA'
  | 'JP';

export type MarketCode =
  | 'EUROPE'
  | 'NORTH_AMERICA'
  | 'LATIN_AMERICA'
  | 'MENA'
  | 'ASIA_PACIFIC';

export type CurrencyCode =
  | 'EUR'
  | 'USD'
  | 'GBP'
  | 'CAD'
  | 'MXN'
  | 'BRL'
  | 'MAD'
  | 'SAR'
  | 'JPY';

export type LanguageCode =
  | 'es'
  | 'en'
  | 'fr'
  | 'ar'
  | 'de'
  | 'it'
  | 'pt'
  | 'ja';

export type TextDirection = 'ltr' | 'rtl';

export type DistanceUnit = 'km' | 'miles';
export type SpeedUnit = 'km/h' | 'mph';
export type TemperatureUnit = 'C' | 'F';
export type VolumeUnit = 'L' | 'gal';
export type FuelEconomyUnit = 'L/100km' | 'km/L' | 'MPG_US' | 'MPG_UK';

export interface Money {
  amount: number;
  currency: CurrencyCode;
  country: CountryCode;
  source?: string;
  date?: string;
  isDemo?: boolean;
}

export interface TaxConfiguration {
  country: CountryCode;
  taxType: string;
  rate: number;
  rules: string[];
  currency: CurrencyCode;
  effectiveDate: string;
}

export interface InspectionCheck {
  id: string;
  name: string;
  required: boolean;
  category: string;
}

export interface VehicleInspectionSystem {
  code: string;
  name: string;
  periodicityYears: number[];
  initialGraceYears: number;
  documentName: string;
  requiredChecks: InspectionCheck[];
  governingBody: string;
}

export type DocumentType =
  | 'inspection'
  | 'registration'
  | 'ownership'
  | 'maintenance'
  | 'insurance'
  | 'invoice'
  | 'title'
  | 'customs';

export interface VehicleDocument {
  type: DocumentType;
  title: string;
  issuingAuthority: string;
  requiredForTransfer: boolean;
  country: CountryCode;
  description: string;
}

export interface LaborMarket {
  country: CountryCode;
  currency: CurrencyCode;
  hourlyRateMin: number;
  hourlyRateExpected: number;
  hourlyRateMax: number;
}

export interface PartsMarketContext {
  country: CountryCode;
  currency: CurrencyCode;
  importTariffMultiplier: number;
  standardAvailabilityDays: number;
  partsVatRate: number;
}

export interface InsuranceContext {
  country: CountryCode;
  isAvailable: boolean;
  estimatedRange?: { min: number; max: number };
  note: string;
}

export interface RegistrationSystem {
  authorityName: string;
  transferFeeFixed: number;
  variableTaxPercentage: number;
  averageProcessingDays: number;
  digitalAvailable: boolean;
}

export interface MarketplaceConfig {
  allowedMarketplaces: string[];
  searchUrlTemplates?: Record<string, string>;
}

export interface CountryProfile {
  countryCode: CountryCode;
  countryName: string;
  market: MarketCode;
  currency: CurrencyCode;
  currencySymbol: string;
  locale: string;
  language: LanguageCode;
  direction: TextDirection;
  distanceUnit: DistanceUnit;
  speedUnit: SpeedUnit;
  temperatureUnit: TemperatureUnit;
  volumeUnit: VolumeUnit;
  fuelEconomyUnit: FuelEconomyUnit;
  dateFormat: string;
  numberFormat: {
    decimalSeparator: string;
    thousandSeparator: string;
  };
  taxSystem: TaxConfiguration;
  inspectionSystem: VehicleInspectionSystem;
  registrationSystem: RegistrationSystem;
  insuranceSystem: InsuranceContext;
  partsMarket: PartsMarketContext;
  laborMarket: LaborMarket;
  marketplaceConfig: MarketplaceConfig;
  requiredDocuments: VehicleDocument[];
}

export interface VehicleMarketVersion {
  globalVehicleId: string;
  countryCode: CountryCode;
  market: MarketCode;
  marketSpecificModel: string;
  marketSpecificTrim?: string;
  powerUnit: 'CV' | 'HP' | 'kW' | 'PS';
  powerConverted: number;
  emissionsStandard: string;
  obdStandard: string;
  regulatoryBody: string;
  commonEngineCodes: string[];
}

export interface VehicleMarketPrice {
  country: CountryCode;
  region?: string;
  vehicleId: string;
  year: number;
  mileage: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  price: Money;
  source: string;
  date: string;
  confidence: number;
  isDemo: boolean;
}

export interface DualScoreResult {
  vehicleQualityScore: number;
  dealScore: number;
  overallScore: number;
  verdict: 'GOOD_DEAL' | 'FAIR' | 'NEGOTIATE' | 'HIGH_RISK' | 'AVOID';
  explanation: string;
}
