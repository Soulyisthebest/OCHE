/**
 * OCHE / CARCHECK AI — Application Configuration & Real Test Mode
 */

export const APP_CONFIG = {
  APP_NAME: 'OCHE / CARCHECK AI',
  VERSION: '1.0.0-MVP',
  REAL_TEST_MODE: true, // Enables test mode indicators and debugging info for real validation
  DEFAULT_COUNTRY: 'ES',
  MAX_UPLOAD_SIZE_MB: 10,
  AUTO_COMPRESS_QUALITY: 0.8,
  MAX_PHOTO_DIMENSION: 1600,
  TRUST_DISCLAIMERS: {
    PROFESSIONAL_INSPECTION: 'OCHE no sustituye una inspección mecánica profesional previa a la compra.',
    ESTIMATED_COSTS: 'Las estimaciones de costes y baremos de reparación son orientativas basadas en datos de mercado.'
  }
};
