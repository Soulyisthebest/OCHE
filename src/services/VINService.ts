export interface DecodedVIN {
  vin: string;
  isValid: boolean;
  country?: string;
  manufacturer?: string;
  make?: string;
  modelYear?: number;
  plantCode?: string;
  sequentialNumber?: string;
  source: 'Local VIN Parser (ISO 3779)';
  isDemo: boolean;
  disclaimer: string;
}

export class VINService {
  private static WMI_TABLE: Record<string, { country: string; manufacturer: string }> = {
    'WVW': { country: 'Alemania', manufacturer: 'Volkswagen' },
    'WAU': { country: 'Alemania', manufacturer: 'Audi' },
    'WBA': { country: 'Alemania', manufacturer: 'BMW' },
    'WDB': { country: 'Alemania', manufacturer: 'Mercedes-Benz' },
    'VF1': { country: 'Francia', manufacturer: 'Renault' },
    'VF3': { country: 'Francia', manufacturer: 'Peugeot' },
    'VF7': { country: 'Francia', manufacturer: 'Citroën' },
    'JT1': { country: 'Japón', manufacturer: 'Toyota' },
    'JTD': { country: 'Japón', manufacturer: 'Toyota' },
    'SB1': { country: 'Reino Unido', manufacturer: 'Toyota' },
    'VSS': { country: 'España', manufacturer: 'SEAT' },
    'ZFA': { country: 'Italia', manufacturer: 'Fiat' },
    'WP0': { country: 'Alemania', manufacturer: 'Porsche' },
    'KL1': { country: 'Corea del Sur', manufacturer: 'Chevrolet / Daewoo' },
    'KMH': { country: 'Corea del Sur', manufacturer: 'Hyundai' },
    'KNA': { country: 'Corea del Sur', manufacturer: 'Kia' },
    'SAL': { country: 'Reino Unido', manufacturer: 'Land Rover' }
  };

  private static YEAR_CODES: Record<string, number> = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014, 'F': 2015,
    'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019, 'L': 2020, 'M': 2021,
    'N': 2022, 'P': 2023, 'R': 2024, 'S': 2025, 'T': 2026
  };

  /**
   * Validate standard ISO 3779 17-character VIN
   */
  static validate(vin: string): boolean {
    const clean = vin.trim().toUpperCase();
    if (clean.length !== 17) return false;
    // VIN cannot contain I, O, Q
    const invalidChars = /[IOQ]/;
    if (invalidChars.test(clean)) return false;
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/;
    return validPattern.test(clean);
  }

  /**
   * Decode basic standardized VIN fields
   */
  static decode(vin: string): DecodedVIN {
    const clean = vin.trim().toUpperCase();
    const isValid = this.validate(clean);

    if (!isValid) {
      return {
        vin: clean,
        isValid: false,
        source: 'Local VIN Parser (ISO 3779)',
        isDemo: true,
        disclaimer: 'El número de bastidor (VIN) debe tener exactamente 17 caracteres alfanuméricos válidos (sin I, O, Q).'
      };
    }

    const wmi = clean.substring(0, 3);
    const manufacturerData = this.WMI_TABLE[wmi] || { country: 'Internacional / No clasificado', manufacturer: 'Fabricante detectado por WMI' };

    const yearChar = clean.charAt(9);
    const modelYear = this.YEAR_CODES[yearChar] || undefined;
    const plantCode = clean.charAt(10);
    const sequentialNumber = clean.substring(11, 17);

    return {
      vin: clean,
      isValid: true,
      country: manufacturerData.country,
      manufacturer: manufacturerData.manufacturer,
      make: manufacturerData.manufacturer,
      modelYear,
      plantCode,
      sequentialNumber,
      source: 'Local VIN Parser (ISO 3779)',
      isDemo: false,
      disclaimer: 'Datos decodificados conforme a la norma internacional ISO 3779. Para informe de cargas DGT se requiere consulta oficial.'
    };
  }
}
