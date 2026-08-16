import {
  CountryProfile,
  CountryCode,
  CurrencyCode,
  DistanceUnit,
  SpeedUnit,
  TemperatureUnit,
  FuelEconomyUnit,
  Money,
  DualScoreResult
} from '../types/country';
import { COUNTRIES_DATA } from '../data/countries';

// Indicative conversion rates for multi-currency calculations
export const CURRENCY_RATES_TO_EUR: Record<CurrencyCode, number> = {
  EUR: 1.0,
  USD: 1.08,
  GBP: 0.85,
  CAD: 1.48,
  MXN: 21.5,
  BRL: 5.60,
  MAD: 10.85,
  SAR: 4.05,
  JPY: 165.0
};

export class CountryEngine {
  private static activeCountryCode: CountryCode = 'ES';

  /**
   * Get active country code
   */
  static getActiveCountryCode(): CountryCode {
    return this.activeCountryCode;
  }

  /**
   * Set active country code
   */
  static setActiveCountryCode(code: CountryCode): void {
    if (COUNTRIES_DATA[code]) {
      this.activeCountryCode = code;
    }
  }

  /**
   * Get active Country Profile
   */
  static getActiveCountryProfile(): CountryProfile {
    return this.getCountryProfile(this.activeCountryCode);
  }

  /**
   * Get Country Profile by code
   */
  static getCountryProfile(code?: CountryCode): CountryProfile {
    const targetCode = code || this.activeCountryCode;
    return COUNTRIES_DATA[targetCode] || COUNTRIES_DATA.ES;
  }

  /**
   * List all available country profiles
   */
  static getAllCountryProfiles(): CountryProfile[] {
    return Object.values(COUNTRIES_DATA);
  }

  /**
   * Auto-detect country based on browser language/timezone with fallback
   */
  static autoDetectCountry(): CountryProfile {
    try {
      const navLang = typeof navigator !== 'undefined' ? navigator.language : 'es-ES';
      const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '';

      if (timezone.includes('Paris')) return COUNTRIES_DATA.FR;
      if (timezone.includes('Berlin')) return COUNTRIES_DATA.DE;
      if (timezone.includes('London')) return COUNTRIES_DATA.UK;
      if (timezone.includes('New_York') || timezone.includes('Los_Angeles') || timezone.includes('Chicago')) return COUNTRIES_DATA.US;
      if (timezone.includes('Toronto') || timezone.includes('Vancouver')) return COUNTRIES_DATA.CA;
      if (timezone.includes('Mexico')) return COUNTRIES_DATA.MX;
      if (timezone.includes('Sao_Paulo')) return COUNTRIES_DATA.BR;
      if (timezone.includes('Casablanca')) return COUNTRIES_DATA.MA;
      if (timezone.includes('Riyadh')) return COUNTRIES_DATA.SA;
      if (timezone.includes('Tokyo')) return COUNTRIES_DATA.JP;
      if (timezone.includes('Rome')) return COUNTRIES_DATA.IT;
      if (timezone.includes('Lisbon')) return COUNTRIES_DATA.PT;

      if (navLang.startsWith('fr')) return COUNTRIES_DATA.FR;
      if (navLang.startsWith('de')) return COUNTRIES_DATA.DE;
      if (navLang.startsWith('en-GB')) return COUNTRIES_DATA.UK;
      if (navLang.startsWith('en')) return COUNTRIES_DATA.US;
      if (navLang.startsWith('ar-MA')) return COUNTRIES_DATA.MA;
      if (navLang.startsWith('ar')) return COUNTRIES_DATA.SA;
      if (navLang.startsWith('ja')) return COUNTRIES_DATA.JP;
      if (navLang.startsWith('it')) return COUNTRIES_DATA.IT;
      if (navLang.startsWith('pt-BR')) return COUNTRIES_DATA.BR;
      if (navLang.startsWith('pt')) return COUNTRIES_DATA.PT;
      if (navLang.startsWith('es-MX')) return COUNTRIES_DATA.MX;
    } catch {
      // ignore
    }

    return COUNTRIES_DATA.ES;
  }

  /**
   * Format money into localized currency string
   */
  static formatMoney(
    amount: number | Money,
    profileOrCurrency?: CountryProfile | CurrencyCode
  ): string {
    const rawAmount = typeof amount === 'number' ? amount : amount.amount;
    if (isNaN(rawAmount) || rawAmount === null || rawAmount === undefined) {
      return '0';
    }

    let profile: CountryProfile = this.getCountryProfile();
    let currency: CurrencyCode = profile.currency;

    if (typeof profileOrCurrency === 'string') {
      currency = profileOrCurrency;
      const matched = Object.values(COUNTRIES_DATA).find((c) => c.currency === currency);
      if (matched) profile = matched;
    } else if (profileOrCurrency) {
      profile = profileOrCurrency;
      currency = profile.currency;
    }

    try {
      return new Intl.NumberFormat(profile.locale, {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
      }).format(rawAmount);
    } catch {
      return `${Math.round(rawAmount)} ${profile.currencySymbol}`;
    }
  }

  /**
   * Convert km to miles
   */
  static convertKmToMiles(km: number): number {
    return Math.round(km * 0.621371);
  }

  /**
   * Convert miles to km
   */
  static convertMilesToKm(miles: number): number {
    return Math.round(miles / 0.621371);
  }

  /**
   * Format distance with unit according to country
   */
  static formatDistance(km: number, targetUnit?: DistanceUnit, profile?: CountryProfile): string {
    const p = profile || this.getCountryProfile();
    const unit = targetUnit || p.distanceUnit;

    if (unit === 'miles') {
      const miles = this.convertKmToMiles(km);
      return `${miles.toLocaleString(p.locale)} mi`;
    }
    return `${km.toLocaleString(p.locale)} km`;
  }

  /**
   * Format speed according to country
   */
  static formatSpeed(kmh: number, targetUnit?: SpeedUnit, profile?: CountryProfile): string {
    const p = profile || this.getCountryProfile();
    const unit = targetUnit || p.speedUnit;

    if (unit === 'mph') {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${kmh} km/h`;
  }

  /**
   * Format fuel economy
   */
  static formatFuelEconomy(lPer100Km: number, targetUnit?: FuelEconomyUnit): string {
    const p = this.getCountryProfile();
    const unit = targetUnit || p.fuelEconomyUnit;

    switch (unit) {
      case 'MPG_US': {
        const mpgUs = (235.215 / Math.max(0.1, lPer100Km)).toFixed(1);
        return `${mpgUs} MPG (US)`;
      }
      case 'MPG_UK': {
        const mpgUk = (282.481 / Math.max(0.1, lPer100Km)).toFixed(1);
        return `${mpgUk} MPG (UK)`;
      }
      case 'km/L': {
        const kmL = (100 / Math.max(0.1, lPer100Km)).toFixed(1);
        return `${kmL} km/L`;
      }
      case 'L/100km':
      default:
        return `${lPer100Km.toFixed(1)} L/100km`;
    }
  }

  /**
   * Format temperature
   */
  static formatTemperature(celsius: number, targetUnit?: TemperatureUnit): string {
    const p = this.getCountryProfile();
    const unit = targetUnit || p.temperatureUnit;

    if (unit === 'F') {
      const fahrenheit = Math.round((celsius * 9) / 5 + 32);
      return `${fahrenheit}°F`;
    }
    return `${celsius}°C`;
  }

  /**
   * Convert currency between supported codes
   */
  static convertCurrency(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): number {
    if (fromCurrency === toCurrency) return amount;
    const fromRate = CURRENCY_RATES_TO_EUR[fromCurrency] || 1.0;
    const toRate = CURRENCY_RATES_TO_EUR[toCurrency] || 1.0;

    // Convert from source to EUR, then EUR to destination
    const inEur = amount / fromRate;
    const converted = inEur * toRate;
    return Math.round(converted);
  }

  /**
   * Calculate Registration & Transfer Cost based on Country Profile
   */
  static calculateRegistrationCost(askingPrice: number, profile?: CountryProfile): number {
    const p = profile || this.getCountryProfile();
    const fixed = p.registrationSystem.transferFeeFixed;
    const variable = askingPrice * (p.registrationSystem.variableTaxPercentage / 100);
    return Math.round(fixed + variable);
  }

  /**
   * Calculate Dual Score: Separates Vehicle Quality Score from Deal Value Score
   */
  static calculateDualScore(
    vehicleQualityScore: number,
    askingPrice: number,
    marketExpectedPrice: number
  ): DualScoreResult {
    const quality = Math.max(0, Math.min(100, Math.round(vehicleQualityScore)));

    let dealRatio = 1.0;
    if (marketExpectedPrice > 0 && askingPrice > 0) {
      dealRatio = marketExpectedPrice / askingPrice;
    }

    // Deal score: >1 means asking is cheaper than market (better deal)
    let dealScore = 75;
    if (dealRatio >= 1.2) dealScore = 95;
    else if (dealRatio >= 1.05) dealScore = 85;
    else if (dealRatio >= 0.95) dealScore = 75;
    else if (dealRatio >= 0.85) dealScore = 60;
    else if (dealRatio >= 0.70) dealScore = 40;
    else dealScore = 20;

    // Weighted Overall Score: 60% Vehicle Mechanical Quality, 40% Deal Price Value
    const overallScore = Math.round(quality * 0.6 + dealScore * 0.4);

    let verdict: DualScoreResult['verdict'] = 'FAIR';
    let explanation = 'Relación estado-precio equilibrada en el mercado local.';

    if (quality >= 80 && dealScore >= 80) {
      verdict = 'GOOD_DEAL';
      explanation = 'Excelente oportunidad: coche fiable y precio por debajo del mercado local.';
    } else if (quality >= 75 && dealScore < 50) {
      verdict = 'NEGOTIATE';
      explanation = 'Vehículo en buen estado pero sobrevalorado; se recomienda negociar el precio.';
    } else if (quality < 50) {
      verdict = 'HIGH_RISK';
      explanation = 'Alto riesgo mecánico independientemente del precio anunciado.';
    } else if (quality < 40 || overallScore < 40) {
      verdict = 'AVOID';
      explanation = 'Compra desaconsejada: costes de reparación desproporcionados.';
    }

    return {
      vehicleQualityScore: quality,
      dealScore,
      overallScore,
      verdict,
      explanation
    };
  }
}
