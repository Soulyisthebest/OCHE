import { CountryCode } from '../types/country';

export interface MarketplaceListingSummary {
  rawUrl?: string;
  marketplaceName: string;
  country: CountryCode;
  detectedBrand?: string;
  detectedModel?: string;
  detectedYear?: number;
  detectedPrice?: number;
  detectedMileage?: number;
  currency: string;
  sellerType?: 'PRIVATE' | 'DEALER';
  location?: string;
}

export interface MarketplaceAdapter {
  readonly id: string;
  readonly name: string;
  readonly supportedCountries: CountryCode[];
  canHandle(urlOrText: string): boolean;
  parseListing(textOrUrl: string): Promise<MarketplaceListingSummary>;
  generateSearchUrl(criteria: {
    brand: string;
    model: string;
    maxPrice?: number;
    maxMileage?: number;
    yearFrom?: number;
  }): string;
}

export class GenericMarketplaceAdapter implements MarketplaceAdapter {
  readonly id = 'generic';
  readonly name = 'Global Web / Marketplace Parser';
  readonly supportedCountries: CountryCode[] = ['ES', 'FR', 'DE', 'UK', 'US', 'MA', 'SA', 'JP', 'IT', 'PT', 'CA', 'MX', 'BR'];

  canHandle(_input: string): boolean {
    return true;
  }

  async parseListing(input: string): Promise<MarketplaceListingSummary> {
    const raw = input.toLowerCase();

    let detectedBrand: string | undefined;
    let detectedModel: string | undefined;
    let detectedYear: number | undefined;
    let detectedPrice: number | undefined;
    let detectedMileage: number | undefined;

    // Detect Brands
    const knownBrands = ['volkswagen', 'peugeot', 'renault', 'bmw', 'toyota', 'audi', 'mercedes', 'ford', 'seat', 'nissan', 'hyundai'];
    for (const b of knownBrands) {
      if (raw.includes(b)) {
        detectedBrand = b.charAt(0).toUpperCase() + b.slice(1);
        break;
      }
    }

    // Detect Models
    if (detectedBrand === 'Volkswagen') {
      if (raw.includes('golf')) detectedModel = 'Golf';
      else if (raw.includes('polo')) detectedModel = 'Polo';
      else if (raw.includes('passat')) detectedModel = 'Passat';
      else if (raw.includes('tiguan')) detectedModel = 'Tiguan';
    } else if (detectedBrand === 'Peugeot') {
      if (raw.includes('308')) detectedModel = '308';
      else if (raw.includes('208')) detectedModel = '208';
      else if (raw.includes('3008')) detectedModel = '3008';
    } else if (detectedBrand === 'Renault') {
      if (raw.includes('megane')) detectedModel = 'Megane';
      else if (raw.includes('clio')) detectedModel = 'Clio';
    } else if (detectedBrand === 'BMW') {
      if (raw.includes('serie 3') || raw.includes('320')) detectedModel = 'Serie 3';
      else if (raw.includes('serie 1') || raw.includes('118')) detectedModel = 'Serie 1';
    }

    // Detect year (2000 - 2026)
    const yearMatch = input.match(/\b(199\d|20[0-2]\d)\b/);
    if (yearMatch) {
      detectedYear = parseInt(yearMatch[1], 10);
    }

    // Detect price (e.g. 5.500 €, $6,000, 45000 DH, etc.)
    const priceMatch = input.match(/(?:[$€£]\s*([\d.,]+)|([\d.,]+)\s*(?:€|eur|\$|usd|£|gbp|dh|mad|sar|¥|jpy|reais|r\$))/i);
    if (priceMatch) {
      const numStr = (priceMatch[1] || priceMatch[2]).replace(/\./g, '').replace(/,/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 300) {
        detectedPrice = parsed;
      }
    }

    // Detect mileage (e.g. 140.000 km, 85,000 miles)
    const kmMatch = input.match(/([\d.,]+)\s*(?:km|kms|kilómetros|kilometres|mi|miles)/i);
    if (kmMatch) {
      const numStr = kmMatch[1].replace(/\./g, '').replace(/,/g, '');
      const parsed = parseInt(numStr, 10);
      if (!isNaN(parsed) && parsed > 500) {
        detectedMileage = parsed;
      }
    }

    return {
      rawUrl: input.startsWith('http') ? input : undefined,
      marketplaceName: 'Auto-Detected Marketplace',
      country: 'ES',
      detectedBrand,
      detectedModel,
      detectedYear,
      detectedPrice,
      detectedMileage,
      currency: 'EUR'
    };
  }

  generateSearchUrl(criteria: {
    brand: string;
    model: string;
    maxPrice?: number;
    maxMileage?: number;
    yearFrom?: number;
  }): string {
    const q = encodeURIComponent(`${criteria.brand} ${criteria.model}`);
    return `https://www.google.com/search?q=${q}+used+cars`;
  }
}

export class MarketplaceRegistry {
  private static adapters: MarketplaceAdapter[] = [new GenericMarketplaceAdapter()];

  static getAdapterForUrl(url: string): MarketplaceAdapter {
    const found = this.adapters.find((a) => a.canHandle(url));
    return found || this.adapters[0];
  }

  static parseInput(urlOrText: string): Promise<MarketplaceListingSummary> {
    const adapter = this.getAdapterForUrl(urlOrText);
    return adapter.parseListing(urlOrText);
  }
}
