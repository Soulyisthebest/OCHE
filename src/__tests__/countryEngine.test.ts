import { describe, it, expect } from 'vitest';
import { CountryEngine, CURRENCY_RATES_TO_EUR } from '../services/CountryEngine';
import { LocalizationService } from '../services/LocalizationService';
import { COUNTRIES_DATA } from '../data/countries';
import { GenericMarketplaceAdapter, MarketplaceRegistry } from '../adapters/MarketplaceAdapter';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';

describe('FASE 4: Global Vehicle Platform Tests', () => {
  describe('Country Profiles & Regional Data Integrity', () => {
    it('contains valid profiles for all major target countries', () => {
      const requiredCountries = ['ES', 'FR', 'DE', 'UK', 'US', 'MA', 'SA', 'JP', 'IT', 'PT', 'CA', 'MX', 'BR'] as const;
      requiredCountries.forEach((code) => {
        const profile = COUNTRIES_DATA[code];
        expect(profile).toBeDefined();
        expect(profile.countryCode).toBe(code);
        expect(profile.currency).toBeDefined();
        expect(profile.currencySymbol).toBeDefined();
        expect(profile.distanceUnit).toMatch(/^(km|miles)$/);
        expect(profile.speedUnit).toMatch(/^(km\/h|mph)$/);
        expect(profile.taxSystem).toBeDefined();
        expect(profile.inspectionSystem).toBeDefined();
        expect(profile.laborMarket.hourlyRateExpected).toBeGreaterThan(0);
        expect(profile.requiredDocuments.length).toBeGreaterThan(0);
      });
    });

    it('has non-empty inspection and tax systems tailored per country', () => {
      expect(COUNTRIES_DATA.ES.inspectionSystem.code).toBe('ITV');
      expect(COUNTRIES_DATA.FR.inspectionSystem.code).toBe('CT');
      expect(COUNTRIES_DATA.DE.inspectionSystem.code).toBe('TUV');
      expect(COUNTRIES_DATA.UK.inspectionSystem.code).toBe('MOT');
      expect(COUNTRIES_DATA.US.inspectionSystem.code).toBe('STATE_SMOG');
      expect(COUNTRIES_DATA.MA.inspectionSystem.code).toBe('VT');
      expect(COUNTRIES_DATA.SA.inspectionSystem.code).toBe('FAHAS');
      expect(COUNTRIES_DATA.JP.inspectionSystem.code).toBe('SHAKEN');
    });
  });

  describe('CountryEngine Unit & Currency Formatting', () => {
    it('formats money properly for different currencies and locales', () => {
      CountryEngine.setActiveCountryCode('US');
      const usFormatted = CountryEngine.formatMoney(8500, COUNTRIES_DATA.US);
      expect(usFormatted).toContain('8,500');
      expect(usFormatted).toContain('$');

      const deFormatted = CountryEngine.formatMoney(8500, COUNTRIES_DATA.DE);
      expect(deFormatted).toContain('8.500');
      expect(deFormatted).toContain('€');

      const ukFormatted = CountryEngine.formatMoney(8500, COUNTRIES_DATA.UK);
      expect(ukFormatted).toContain('8,500');
      expect(ukFormatted).toContain('£');

      const saFormatted = CountryEngine.formatMoney(8500, COUNTRIES_DATA.SA);
      expect(saFormatted).toBeDefined();
    });

    it('converts distances between km and miles accurately', () => {
      expect(CountryEngine.convertKmToMiles(100)).toBe(62);
      expect(CountryEngine.convertMilesToKm(62)).toBe(100);

      const kmFormat = CountryEngine.formatDistance(140000, 'km', COUNTRIES_DATA.DE);
      expect(kmFormat).toContain('km');

      const miFormat = CountryEngine.formatDistance(140000, 'miles', COUNTRIES_DATA.US);
      expect(miFormat).toContain('mi');
    });

    it('formats fuel economy according to national standards', () => {
      const l100km = CountryEngine.formatFuelEconomy(5.5, 'L/100km');
      expect(l100km).toBe('5.5 L/100km');

      const mpgUs = CountryEngine.formatFuelEconomy(5.5, 'MPG_US');
      expect(mpgUs).toContain('MPG (US)');

      const mpgUk = CountryEngine.formatFuelEconomy(5.5, 'MPG_UK');
      expect(mpgUk).toContain('MPG (UK)');

      const kmL = CountryEngine.formatFuelEconomy(5.5, 'km/L');
      expect(kmL).toContain('km/L');
    });

    it('converts temperatures correctly between C and F', () => {
      expect(CountryEngine.formatTemperature(20, 'C')).toBe('20°C');
      expect(CountryEngine.formatTemperature(20, 'F')).toBe('68°F');
    });

    it('converts currencies using market rate conversions', () => {
      const eurToUsd = CountryEngine.convertCurrency(100, 'EUR', 'USD');
      expect(eurToUsd).toBe(108);

      const usdToEur = CountryEngine.convertCurrency(108, 'USD', 'EUR');
      expect(usdToEur).toBe(100);
    });

    it('calculates registration transfer costs according to country rules', () => {
      const esCost = CountryEngine.calculateRegistrationCost(10000, COUNTRIES_DATA.ES);
      // ES: 55.70 + 4% of 10000 = 455.7 ~ 456
      expect(esCost).toBe(456);

      const deCost = CountryEngine.calculateRegistrationCost(10000, COUNTRIES_DATA.DE);
      // DE: fixed 30 + 0% = 30
      expect(deCost).toBe(30);
    });

    it('calculates dual score (Vehicle Mechanical Quality vs Deal Price Ratio)', () => {
      // High quality, bargain price -> GOOD_DEAL
      const goodDeal = CountryEngine.calculateDualScore(85, 7000, 9000);
      expect(goodDeal.vehicleQualityScore).toBe(85);
      expect(goodDeal.dealScore).toBeGreaterThanOrEqual(80);
      expect(goodDeal.verdict).toBe('GOOD_DEAL');

      // High quality, overpriced -> NEGOTIATE
      const negotiate = CountryEngine.calculateDualScore(85, 12000, 8000);
      expect(negotiate.verdict).toBe('NEGOTIATE');

      // Low quality -> HIGH_RISK or AVOID
      const lowQuality = CountryEngine.calculateDualScore(35, 3000, 6000);
      expect(lowQuality.verdict).toMatch(/^(HIGH_RISK|AVOID)$/);
    });
  });

  describe('LocalizationService & Multi-Language Support', () => {
    it('translates core UI keys in all supported languages', () => {
      const languages = ['es', 'en', 'fr', 'de', 'ar', 'it', 'pt', 'ja'] as const;
      languages.forEach((lang) => {
        expect(LocalizationService.t('app_title', lang)).toBeDefined();
        expect(LocalizationService.t('score', lang)).toBeDefined();
        expect(LocalizationService.t('asking_price', lang)).toBeDefined();
        expect(LocalizationService.t('what_to_ask_seller', lang)).toBeDefined();
      });
    });

    it('identifies RTL text direction for Arabic', () => {
      expect(LocalizationService.getTextDirection('ar')).toBe('rtl');
      expect(LocalizationService.getTextDirection('en')).toBe('ltr');
      expect(LocalizationService.getTextDirection('es')).toBe('ltr');
    });
  });

  describe('Marketplace Adapters & Parsing', () => {
    it('extracts brand, model, year and price from freeform listing input', async () => {
      const adapter = new GenericMarketplaceAdapter();
      const listing = await adapter.parseListing('Volkswagen Golf 2017 140.000 km por 8.500 €');
      expect(listing.detectedBrand).toBe('Volkswagen');
      expect(listing.detectedModel).toBe('Golf');
      expect(listing.detectedYear).toBe(2017);
      expect(listing.detectedMileage).toBe(140000);
      expect(listing.detectedPrice).toBe(8500);
    });

    it('handles Registry lookup and parsing correctly', async () => {
      const parsed = await MarketplaceRegistry.parseInput('Peugeot 308 2016 110.000 km 7200 €');
      expect(parsed.detectedBrand).toBe('Peugeot');
      expect(parsed.detectedModel).toBe('308');
    });
  });

  describe('LocalVehicleRepository Multi-Market Capabilities', () => {
    it('finds market specific specifications and regulatory body', async () => {
      const usVersion = await localVehicleRepository.findByMarketVersion('US', 'golf-7-tdi');
      expect(usVersion).not.toBeNull();
      expect(usVersion?.powerUnit).toBe('HP');
      expect(usVersion?.obdStandard).toBe('OBD-II');

      const deVersion = await localVehicleRepository.findByMarketVersion('DE', 'golf-7-tdi');
      expect(deVersion?.powerUnit).toBe('PS');
    });
  });
});
