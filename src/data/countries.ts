import { CountryProfile, CountryCode } from '../types/country';

export const COUNTRIES_DATA: Record<CountryCode, CountryProfile> = {
  ES: {
    countryCode: 'ES',
    countryName: 'España',
    market: 'EUROPE',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
    language: 'es',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimalSeparator: ',',
      thousandSeparator: '.'
    },
    taxSystem: {
      country: 'ES',
      taxType: 'ITP (Transmisiones Patrimoniales)',
      rate: 0.04,
      rules: ['Varía entre 4% y 8% según comunidad autónoma.', 'Exento si se compra a concesionario (aplica IVA/REBU).'],
      currency: 'EUR',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'ITV',
      name: 'Inspección Técnica de Vehículos (ITV)',
      periodicityYears: [4, 6, 8, 10],
      initialGraceYears: 4,
      documentName: 'Tarjeta ITV y Ficha Técnica',
      governingBody: 'DGT / Ministerio de Industria',
      requiredChecks: [
        { id: 'es-emissions', name: 'Emisiones opacidad/gases CO', required: true, category: 'Emisiones' },
        { id: 'es-brakes', name: 'Eficacia frenómetro por eje', required: true, category: 'Frenado' },
        { id: 'es-obd', name: 'Lectura OBD anticontaminación', required: true, category: 'Electrónica' },
        { id: 'es-lighting', name: 'Reglaje y homologación de luces', required: true, category: 'Visibilidad' }
      ]
    },
    registrationSystem: {
      authorityName: 'DGT (Dirección General de Tráfico)',
      transferFeeFixed: 55.70,
      variableTaxPercentage: 4.0,
      averageProcessingDays: 1,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'ES',
      isAvailable: true,
      estimatedRange: { min: 280, max: 750 },
      note: 'Seguro obligatorio de Responsabilidad Civil requerido para circular.'
    },
    partsMarket: {
      country: 'ES',
      currency: 'EUR',
      importTariffMultiplier: 1.0,
      standardAvailabilityDays: 2,
      partsVatRate: 0.21
    },
    laborMarket: {
      country: 'ES',
      currency: 'EUR',
      hourlyRateMin: 45,
      hourlyRateExpected: 65,
      hourlyRateMax: 110
    },
    marketplaceConfig: {
      allowedMarketplaces: ['coches.net', 'wallapop', 'milanuncios', 'autohero', 'autocasion']
    },
    requiredDocuments: [
      { type: 'registration', title: 'Permiso de Circulación', issuingAuthority: 'DGT', requiredForTransfer: true, country: 'ES', description: 'Acredita la titularidad y matriculación.' },
      { type: 'inspection', title: 'Tarjeta ITV en vigor', issuingAuthority: 'Estación ITV', requiredForTransfer: true, country: 'ES', description: 'Informe favorable de inspección técnica.' },
      { type: 'invoice', title: 'Contrato de compraventa / Factura', issuingAuthority: 'Particular / Compraventa', requiredForTransfer: true, country: 'ES', description: 'Justificante formal de transmisión.' }
    ]
  },

  FR: {
    countryCode: 'FR',
    countryName: 'France',
    market: 'EUROPE',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'fr-FR',
    language: 'fr',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimalSeparator: ',',
      thousandSeparator: ' '
    },
    taxSystem: {
      country: 'FR',
      taxType: 'Taxe Régionale Carte Grise (Y.1)',
      rate: 0.0,
      rules: ['Calculée par cheval fiscal selon la région (de 35€ à 60€/CV).', 'Exonération partielle véhicules > 10 ans.'],
      currency: 'EUR',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'CT',
      name: 'Contrôle Technique',
      periodicityYears: [4, 6, 8, 10],
      initialGraceYears: 4,
      documentName: 'Rapport de Contrôle Technique (< 6 mois pour la vente)',
      governingBody: 'UTAC / Ministère des Transports',
      requiredChecks: [
        { id: 'fr-critair', name: 'Contrôle pollution et vignette Crit’Air', required: true, category: 'Pollution' },
        { id: 'fr-liaisons', name: 'Liaisons au sol et amortisseurs', required: true, category: 'Sécurité' },
        { id: 'fr-freinage', name: 'Mesure freinage et liquide', required: true, category: 'Freinage' }
      ]
    },
    registrationSystem: {
      authorityName: 'ANTS (Agence Nationale des Titres Sécurisés)',
      transferFeeFixed: 13.76,
      variableTaxPercentage: 0,
      averageProcessingDays: 3,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'FR',
      isAvailable: true,
      estimatedRange: { min: 320, max: 850 },
      note: 'Assurance au tiers minimum obligatoire.'
    },
    partsMarket: {
      country: 'FR',
      currency: 'EUR',
      importTariffMultiplier: 1.0,
      standardAvailabilityDays: 2,
      partsVatRate: 0.20
    },
    laborMarket: {
      country: 'FR',
      currency: 'EUR',
      hourlyRateMin: 55,
      hourlyRateExpected: 80,
      hourlyRateMax: 135
    },
    marketplaceConfig: {
      allowedMarketplaces: ['leboncoin', 'lacentrale', 'autoscout24']
    },
    requiredDocuments: [
      { type: 'registration', title: 'Certificat d’immatriculation (Carte Grise)', issuingAuthority: 'ANTS / Ministère de l’Intérieur', requiredForTransfer: true, country: 'FR', description: 'Barré avec date et heure de vente.' },
      { type: 'inspection', title: 'Contrôle Technique de moins de 6 mois', issuingAuthority: 'Centre agréé', requiredForTransfer: true, country: 'FR', description: 'Obligatoire pour vente particulier.' },
      { type: 'ownership', title: 'Certificat de situation administrative (Non-gage)', issuingAuthority: 'Ministère de l’Intérieur', requiredForTransfer: true, country: 'FR', description: 'Prouve l’absence d’opposition ou de saisie.' }
    ]
  },

  DE: {
    countryCode: 'DE',
    countryName: 'Deutschland',
    market: 'EUROPE',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
    language: 'de',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: {
      decimalSeparator: ',',
      thousandSeparator: '.'
    },
    taxSystem: {
      country: 'DE',
      taxType: 'Kraftfahrzeugsteuer (Kfz-Steuer)',
      rate: 0.0,
      rules: ['Jährliche Steuer nach Hubraum und CO2-Ausstoß.', 'Ummeldegebühr bei Zulassungsstelle.'],
      currency: 'EUR',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'TUV',
      name: 'Hauptuntersuchung (HU) & Abgasuntersuchung (AU)',
      periodicityYears: [3, 5, 7, 9],
      initialGraceYears: 3,
      documentName: 'HU-Prüfbericht (TÜV/DEKRA/GTÜ)',
      governingBody: 'KBA / TÜV / DEKRA',
      requiredChecks: [
        { id: 'de-hu', name: 'Hauptuntersuchung Sicherheitsprüfung', required: true, category: 'Sicherheit' },
        { id: 'de-au', name: 'Abgasuntersuchung AU', required: true, category: 'Umwelt' },
        { id: 'de-rost', name: 'Korrosionsprüfung Unterboden/Träger', required: true, category: 'Karosserie' }
      ]
    },
    registrationSystem: {
      authorityName: 'Kfz-Zulassungsstelle',
      transferFeeFixed: 30.00,
      variableTaxPercentage: 0,
      averageProcessingDays: 1,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'DE',
      isAvailable: true,
      estimatedRange: { min: 350, max: 900 },
      note: 'eVB-Nummer für Zulassung zwingend erforderlich.'
    },
    partsMarket: {
      country: 'DE',
      currency: 'EUR',
      importTariffMultiplier: 1.0,
      standardAvailabilityDays: 1,
      partsVatRate: 0.19
    },
    laborMarket: {
      country: 'DE',
      currency: 'EUR',
      hourlyRateMin: 70,
      hourlyRateExpected: 105,
      hourlyRateMax: 170
    },
    marketplaceConfig: {
      allowedMarketplaces: ['mobile.de', 'autoscout24.de', 'kleinanzeigen']
    },
    requiredDocuments: [
      { type: 'registration', title: 'Zulassungsbescheinigung Teil I (Fahrzeugschein)', issuingAuthority: 'Zulassungsbehörde', requiredForTransfer: true, country: 'DE', description: 'Fahrzeugschein.' },
      { type: 'ownership', title: 'Zulassungsbescheinigung Teil II (Fahrzeugbrief)', issuingAuthority: 'Zulassungsbehörde', requiredForTransfer: true, country: 'DE', description: 'Eigentumsnachweis.' },
      { type: 'inspection', title: 'Gültiger HU/AU-Prüfbericht', issuingAuthority: 'TÜV/DEKRA', requiredForTransfer: true, country: 'DE', description: 'Nachweis der Verkehrssicherheit.' }
    ]
  },

  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    market: 'EUROPE',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
    language: 'en',
    direction: 'ltr',
    distanceUnit: 'miles',
    speedUnit: 'mph',
    temperatureUnit: 'C',
    volumeUnit: 'gal',
    fuelEconomyUnit: 'MPG_UK',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    taxSystem: {
      country: 'UK',
      taxType: 'Vehicle Excise Duty (VED / Road Tax)',
      rate: 0.0,
      rules: ['Calculated annually on CO2 emissions or flat standard rate.'],
      currency: 'GBP',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'MOT',
      name: 'Ministry of Transport Test (MOT)',
      periodicityYears: [3, 4, 5, 6, 7, 8, 9, 10],
      initialGraceYears: 3,
      documentName: 'MOT Certificate',
      governingBody: 'DVSA (Driver and Vehicle Standards Agency)',
      requiredChecks: [
        { id: 'uk-mot-struct', name: 'Structural integrity & corrosion', required: true, category: 'Structure' },
        { id: 'uk-mot-emissions', name: 'Emissions limits by fuel type', required: true, category: 'Emissions' },
        { id: 'uk-mot-brakes', name: 'Roller brake tester efficiency', required: true, category: 'Braking' }
      ]
    },
    registrationSystem: {
      authorityName: 'DVLA (Driver and Vehicle Licensing Agency)',
      transferFeeFixed: 0.00,
      variableTaxPercentage: 0,
      averageProcessingDays: 1,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'UK',
      isAvailable: true,
      estimatedRange: { min: 450, max: 1300 },
      note: 'Continuous Insurance Enforcement (CIE) applies.'
    },
    partsMarket: {
      country: 'UK',
      currency: 'GBP',
      importTariffMultiplier: 1.05,
      standardAvailabilityDays: 2,
      partsVatRate: 0.20
    },
    laborMarket: {
      country: 'UK',
      currency: 'GBP',
      hourlyRateMin: 50,
      hourlyRateExpected: 80,
      hourlyRateMax: 140
    },
    marketplaceConfig: {
      allowedMarketplaces: ['autotrader.co.uk', 'gumtree', 'ebay.co.uk', 'motors.co.uk']
    },
    requiredDocuments: [
      { type: 'registration', title: 'V5C Logbook (Registration Certificate)', issuingAuthority: 'DVLA', requiredForTransfer: true, country: 'UK', description: 'Proof of keeper registration.' },
      { type: 'inspection', title: 'Current MOT Pass Record', issuingAuthority: 'DVSA', requiredForTransfer: true, country: 'UK', description: 'Online verification of roadworthiness.' },
      { type: 'maintenance', title: 'Service History Book & Invoices', issuingAuthority: 'Garages', requiredForTransfer: false, country: 'UK', description: 'Proof of routine maintenance.' }
    ]
  },

  US: {
    countryCode: 'US',
    countryName: 'United States',
    market: 'NORTH_AMERICA',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    language: 'en',
    direction: 'ltr',
    distanceUnit: 'miles',
    speedUnit: 'mph',
    temperatureUnit: 'F',
    volumeUnit: 'gal',
    fuelEconomyUnit: 'MPG_US',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: {
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    taxSystem: {
      country: 'US',
      taxType: 'State & County Sales Tax',
      rate: 0.065,
      rules: ['Varies by state (0% in Oregon/Montana to 9.5% in California/Tennessee).', 'Title and registration fees apply.'],
      currency: 'USD',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'STATE_SMOG',
      name: 'State Safety & Smog Check',
      periodicityYears: [2, 4, 6, 8, 10],
      initialGraceYears: 2,
      documentName: 'State Inspection Certificate / Smog Pass',
      governingBody: 'State DMV / EPA / BAR',
      requiredChecks: [
        { id: 'us-obd-smog', name: 'OBD-II Readiness & Evaporative Emissions', required: true, category: 'Emissions' },
        { id: 'us-safety', name: 'Tires, Brakes, Suspension & Lights Safety', required: true, category: 'Safety' }
      ]
    },
    registrationSystem: {
      authorityName: 'State Department of Motor Vehicles (DMV)',
      transferFeeFixed: 65.00,
      variableTaxPercentage: 6.0,
      averageProcessingDays: 3,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'US',
      isAvailable: true,
      estimatedRange: { min: 600, max: 1800 },
      note: 'State minimum liability limits vary widely.'
    },
    partsMarket: {
      country: 'US',
      currency: 'USD',
      importTariffMultiplier: 1.0,
      standardAvailabilityDays: 1,
      partsVatRate: 0.07
    },
    laborMarket: {
      country: 'US',
      currency: 'USD',
      hourlyRateMin: 75,
      hourlyRateExpected: 120,
      hourlyRateMax: 195
    },
    marketplaceConfig: {
      allowedMarketplaces: ['autotrader.com', 'cars.com', 'cargurus.com', 'facebook_marketplace']
    },
    requiredDocuments: [
      { type: 'title', title: 'Certificate of Title (Pink Slip)', issuingAuthority: 'State DMV', requiredForTransfer: true, country: 'US', description: 'Legal ownership transfer document.' },
      { type: 'invoice', title: 'Bill of Sale', issuingAuthority: 'Seller / Buyer', requiredForTransfer: true, country: 'US', description: 'Record of sale price and terms.' },
      { type: 'inspection', title: 'Smog / Safety Certificate', issuingAuthority: 'Certified Smog Station', requiredForTransfer: true, country: 'US', description: 'State-dependent emission clearance.' }
    ]
  },

  MA: {
    countryCode: 'MA',
    countryName: 'المغرب / Maroc',
    market: 'MENA',
    currency: 'MAD',
    currencySymbol: 'DH',
    locale: 'ar-MA',
    language: 'ar',
    direction: 'rtl',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: {
      decimalSeparator: ',',
      thousandSeparator: ' '
    },
    taxSystem: {
      country: 'MA',
      taxType: 'Droits d’enregistrement et Vignette',
      rate: 0.03,
      rules: ['Enregistrement 3% + timbre.', 'Taxe Spéciale Annuelle sur les Véhicules (Vignette) selon chevaux fiscaux.'],
      currency: 'MAD',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'VT',
      name: 'الفحص التقني للسيارات / Visite Technique',
      periodicityYears: [5, 6, 7, 8, 9, 10],
      initialGraceYears: 5,
      documentName: 'شهادة الفحص التقني / Certificat de Visite Technique',
      governingBody: 'NARSA (الوكالة الوطنية للسلامة الطرقية)',
      requiredChecks: [
        { id: 'ma-frein', name: 'الفحص الميكانيكي للفرامل / Freinage', required: true, category: 'Sécurité' },
        { id: 'ma-chassis', name: 'رقم الإطار الحديدي / Concordance Numéro de Châssis', required: true, category: 'Identification' },
        { id: 'ma-fumee', name: 'انبعاثات الدخان / Opacité des fumées', required: true, category: 'Pollution' }
      ]
    },
    registrationSystem: {
      authorityName: 'NARSA / Centre Immatriculateur',
      transferFeeFixed: 350.00,
      variableTaxPercentage: 3.0,
      averageProcessingDays: 5,
      digitalAvailable: false
    },
    insuranceSystem: {
      country: 'MA',
      isAvailable: true,
      estimatedRange: { min: 2400, max: 6000 },
      note: 'التأمين الإجباري على المسؤولية المدنية.'
    },
    partsMarket: {
      country: 'MA',
      currency: 'MAD',
      importTariffMultiplier: 1.25,
      standardAvailabilityDays: 3,
      partsVatRate: 0.20
    },
    laborMarket: {
      country: 'MA',
      currency: 'MAD',
      hourlyRateMin: 120,
      hourlyRateExpected: 220,
      hourlyRateMax: 450
    },
    marketplaceConfig: {
      allowedMarketplaces: ['avito.ma', 'moteur.ma', 'marocannonces']
    },
    requiredDocuments: [
      { type: 'registration', title: 'البطاقة الرمادية / Carte Grise', issuingAuthority: 'NARSA', requiredForTransfer: true, country: 'MA', description: 'وثيقة الملكية والتسجيل.' },
      { type: 'invoice', title: 'عقد البيع مصادق عليه / Contrat de vente légalisé', issuingAuthority: 'المقاطعة / Commune', requiredForTransfer: true, country: 'MA', description: 'عقد مصادق على صحة توقيعه.' },
      { type: 'inspection', title: 'شهادة الفحص التقني لتحويل الملكية', issuingAuthority: 'مركز الفحص التقني', requiredForTransfer: true, country: 'MA', description: 'ضرورية للتحويل إذا تجاوز عمر السيارة 5 سنوات.' }
    ]
  },

  SA: {
    countryCode: 'SA',
    countryName: 'المملكة العربية السعودية',
    market: 'MENA',
    currency: 'SAR',
    currencySymbol: 'ر.س',
    locale: 'ar-SA',
    language: 'ar',
    direction: 'rtl',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'km/L',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: {
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    taxSystem: {
      country: 'SA',
      taxType: 'ضريبة القيمة المضافة و رسوم النقل',
      rate: 0.05,
      rules: ['رسوم نقل الملكية عبر منصة أبشر.', 'ضريبة 15% تطبق عند الشراء من المعارض والشركات.'],
      currency: 'SAR',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'FAHAS',
      name: 'الفحص الفني الدوري للسيارات (سلامة)',
      periodicityYears: [3, 4, 5, 6, 7, 8, 9, 10],
      initialGraceYears: 3,
      documentName: 'شهادة الفحص الفني الدوري سارية المفعول',
      governingBody: 'الهيئة السعودية للمواصفات والمقاييس والجودة (SASO)',
      requiredChecks: [
        { id: 'sa-underbody', name: 'فحص الشاسيه وأسفل المركبة والزيوت', required: true, category: 'هيكل' },
        { id: 'sa-brakes', name: 'توازن وقوة الفرامل والمساعدات', required: true, category: 'أمان' },
        { id: 'sa-tint', name: 'نسبة تظليل الزجاج والانبعاثات', required: true, category: 'أنظمة' }
      ]
    },
    registrationSystem: {
      authorityName: 'الإدارة العامة للمرور / منصة أبشر',
      transferFeeFixed: 150.00,
      variableTaxPercentage: 0,
      averageProcessingDays: 1,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'SA',
      isAvailable: true,
      estimatedRange: { min: 800, max: 2500 },
      note: 'تأمين ضد الغير إلزامي لتجديد الاستمارة ونقل الملكية.'
    },
    partsMarket: {
      country: 'SA',
      currency: 'SAR',
      importTariffMultiplier: 1.10,
      standardAvailabilityDays: 2,
      partsVatRate: 0.15
    },
    laborMarket: {
      country: 'SA',
      currency: 'SAR',
      hourlyRateMin: 80,
      hourlyRateExpected: 150,
      hourlyRateMax: 350
    },
    marketplaceConfig: {
      allowedMarketplaces: ['haraj.com.sa', 'syarah.com', 'motory.com']
    },
    requiredDocuments: [
      { type: 'registration', title: 'استمارة رخصة السير سارية', issuingAuthority: 'المرور السعودي / أبشر', requiredForTransfer: true, country: 'SA', description: 'بطاقة رخصة السير الإلكترونية.' },
      { type: 'inspection', title: 'الفحص الدوري ساري المفعول', issuingAuthority: 'مراكز سلامة', requiredForTransfer: true, country: 'SA', description: 'اجتياز الفحص الدوري.' },
      { type: 'insurance', title: 'وثيقة التأمين باسم المشتري', issuingAuthority: 'شركات التأمين المعتمدة', requiredForTransfer: true, country: 'SA', description: 'تأمين ساري.' }
    ]
  },

  JP: {
    countryCode: 'JP',
    countryName: '日本 (Japan)',
    market: 'ASIA_PACIFIC',
    currency: 'JPY',
    currencySymbol: '¥',
    locale: 'ja-JP',
    language: 'ja',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'km/L',
    dateFormat: 'YYYY/MM/DD',
    numberFormat: {
      decimalSeparator: '.',
      thousandSeparator: ','
    },
    taxSystem: {
      country: 'JP',
      taxType: '自動車税 / 自動車重量税 (Automobile & Weight Tax)',
      rate: 0.03,
      rules: ['Calculated by displacement and vehicle weight.', 'Environment performance tax on transfer.'],
      currency: 'JPY',
      effectiveDate: '2026-01-01'
    },
    inspectionSystem: {
      code: 'SHAKEN',
      name: '車検 (Shaken - Automobile Inspection)',
      periodicityYears: [3, 5, 7, 9, 11],
      initialGraceYears: 3,
      documentName: '自動車検査証 (Shakensho)',
      governingBody: 'MLIT (Ministry of Land, Infrastructure, Transport and Tourism)',
      requiredChecks: [
        { id: 'jp-shaken-emiss', name: '排出ガス基準検査 (Emissions)', required: true, category: '環境' },
        { id: 'jp-shaken-align', name: 'サイドスリップ / アライメント (Side slip)', required: true, category: '操舵' },
        { id: 'jp-shaken-lights', name: '光軸・照度検査 (Headlight optical axis)', required: true, category: '灯火' }
      ]
    },
    registrationSystem: {
      authorityName: '運輸支局 (Transport Bureau)',
      transferFeeFixed: 3000,
      variableTaxPercentage: 2.0,
      averageProcessingDays: 2,
      digitalAvailable: true
    },
    insuranceSystem: {
      country: 'JP',
      isAvailable: true,
      estimatedRange: { min: 25000, max: 70000 },
      note: '自賠責保険 (CALI) is legally mandatory.'
    },
    partsMarket: {
      country: 'JP',
      currency: 'JPY',
      importTariffMultiplier: 1.0,
      standardAvailabilityDays: 1,
      partsVatRate: 0.10
    },
    laborMarket: {
      country: 'JP',
      currency: 'JPY',
      hourlyRateMin: 6000,
      hourlyRateExpected: 9500,
      hourlyRateMax: 16000
    },
    marketplaceConfig: {
      allowedMarketplaces: ['carsensor.net', 'goo-net.com', 'yahoo_auctions']
    },
    requiredDocuments: [
      { type: 'inspection', title: '自動車検査証 (車検証)', issuingAuthority: '国土交通省', requiredForTransfer: true, country: 'JP', description: 'Valid inspection certificate.' },
      { type: 'ownership', title: '印鑑登録証明書', issuingAuthority: '市区町村役場', requiredForTransfer: true, country: 'JP', description: 'Registered seal certificate.' },
      { type: 'customs', title: '車庫証明書 (保管場所証明書)', issuingAuthority: '所轄警察署', requiredForTransfer: true, country: 'JP', description: 'Parking space verification certificate.' }
    ]
  },

  IT: {
    countryCode: 'IT',
    countryName: 'Italia',
    market: 'EUROPE',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'it-IT',
    language: 'it',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimalSeparator: ',', thousandSeparator: '.' },
    taxSystem: { country: 'IT', taxType: 'IPT (Imposta Provinciale di Trascrizione)', rate: 0.04, rules: ['Calculated by kW.'], currency: 'EUR', effectiveDate: '2026-01-01' },
    inspectionSystem: {
      code: 'REVISIONE', name: 'Revisione Auto Ministeriale', periodicityYears: [4, 6, 8, 10], initialGraceYears: 4, documentName: 'Certificato di Revisione', governingBody: 'Motorizzazione Civile',
      requiredChecks: [{ id: 'it-freni', name: 'Efficienza freni', required: true, category: 'Sicurezza' }]
    },
    registrationSystem: { authorityName: 'PRA / ACI', transferFeeFixed: 150, variableTaxPercentage: 4, averageProcessingDays: 1, digitalAvailable: true },
    insuranceSystem: { country: 'IT', isAvailable: true, estimatedRange: { min: 350, max: 950 }, note: 'RCA obbligatoria.' },
    partsMarket: { country: 'IT', currency: 'EUR', importTariffMultiplier: 1.0, standardAvailabilityDays: 2, partsVatRate: 0.22 },
    laborMarket: { country: 'IT', currency: 'EUR', hourlyRateMin: 45, hourlyRateExpected: 68, hourlyRateMax: 115 },
    marketplaceConfig: { allowedMarketplaces: ['autoscout24.it', 'subito.it'] },
    requiredDocuments: [{ type: 'registration', title: 'Documento Unico di Circolazione (DU)', issuingAuthority: 'Motorizzazione / PRA', requiredForTransfer: true, country: 'IT', description: 'Libretto e proprietà unificati.' }]
  },

  PT: {
    countryCode: 'PT',
    countryName: 'Portugal',
    market: 'EUROPE',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'pt-PT',
    language: 'pt',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimalSeparator: ',', thousandSeparator: ' ' },
    taxSystem: { country: 'PT', taxType: 'IUC (Imposto Único de Circulação)', rate: 0.0, rules: ['Annual tax by engine cc & CO2.'], currency: 'EUR', effectiveDate: '2026-01-01' },
    inspectionSystem: {
      code: 'IPO', name: 'Inspeção Periódica Obrigatória (IPO)', periodicityYears: [4, 6, 8, 9, 10], initialGraceYears: 4, documentName: 'Ficha de Inspeção Periódica', governingBody: 'IMT',
      requiredChecks: [{ id: 'pt-emissoes', name: 'Emissões e gases', required: true, category: 'Ambiente' }]
    },
    registrationSystem: { authorityName: 'IMT / Registo Automóvel', transferFeeFixed: 65, variableTaxPercentage: 0, averageProcessingDays: 2, digitalAvailable: true },
    insuranceSystem: { country: 'PT', isAvailable: true, estimatedRange: { min: 220, max: 650 }, note: 'Seguro de responsabilidade civil obrigatório.' },
    partsMarket: { country: 'PT', currency: 'EUR', importTariffMultiplier: 1.0, standardAvailabilityDays: 2, partsVatRate: 0.23 },
    laborMarket: { country: 'PT', currency: 'EUR', hourlyRateMin: 35, hourlyRateExpected: 55, hourlyRateMax: 90 },
    marketplaceConfig: { allowedMarketplaces: ['standvirtual.com', 'olx.pt'] },
    requiredDocuments: [{ type: 'registration', title: 'Documento Único Automóvel (DUA)', issuingAuthority: 'IMT', requiredForTransfer: true, country: 'PT', description: 'Certificado de matrícula.' }]
  },

  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    market: 'NORTH_AMERICA',
    currency: 'CAD',
    currencySymbol: 'CA$',
    locale: 'en-CA',
    language: 'en',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'L/100km',
    dateFormat: 'YYYY-MM-DD',
    numberFormat: { decimalSeparator: '.', thousandSeparator: ',' },
    taxSystem: { country: 'CA', taxType: 'GST/HST/PST Provincial Sales Tax', rate: 0.13, rules: ['Varies by province (5% GST to 15% HST).'], currency: 'CAD', effectiveDate: '2026-01-01' },
    inspectionSystem: {
      code: 'SAFETY_CERT', name: 'Provincial Safety Standards Certificate', periodicityYears: [2, 4, 6, 8, 10], initialGraceYears: 2, documentName: 'Safety Standards Certificate (SSC)', governingBody: 'Ministry of Transportation',
      requiredChecks: [{ id: 'ca-brakes', name: 'Brakes and suspension safety', required: true, category: 'Safety' }]
    },
    registrationSystem: { authorityName: 'ServiceOntario / SAAQ / ICBC', transferFeeFixed: 32, variableTaxPercentage: 13, averageProcessingDays: 1, digitalAvailable: true },
    insuranceSystem: { country: 'CA', isAvailable: true, estimatedRange: { min: 900, max: 2400 }, note: 'Mandatory auto insurance.' },
    partsMarket: { country: 'CA', currency: 'CAD', importTariffMultiplier: 1.05, standardAvailabilityDays: 2, partsVatRate: 0.13 },
    laborMarket: { country: 'CA', currency: 'CAD', hourlyRateMin: 85, hourlyRateExpected: 130, hourlyRateMax: 210 },
    marketplaceConfig: { allowedMarketplaces: ['autotrader.ca', 'kijijiautos.ca'] },
    requiredDocuments: [{ type: 'title', title: 'Vehicle Permit / Ownership', issuingAuthority: 'MTO / SAAQ', requiredForTransfer: true, country: 'CA', description: 'Vehicle ownership document.' }]
  },

  MX: {
    countryCode: 'MX',
    countryName: 'México',
    market: 'LATIN_AMERICA',
    currency: 'MXN',
    currencySymbol: '$',
    locale: 'es-MX',
    language: 'es',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'km/L',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimalSeparator: '.', thousandSeparator: ',' },
    taxSystem: { country: 'MX', taxType: 'Impuesto sobre Adquisición de Vehículos Usados (ISAN/Endoso)', rate: 0.02, rules: ['Varía según entidad federativa.'], currency: 'MXN', effectiveDate: '2026-01-01' },
    inspectionSystem: {
      code: 'VERIFICACION', name: 'Verificación Vehicular (Emisiones)', periodicityYears: [1, 2, 3, 4, 5], initialGraceYears: 2, documentName: 'Holograma y Certificado de Verificación', governingBody: 'SEDEMA / PROFEPA',
      requiredChecks: [{ id: 'mx-emisiones', name: 'Emisiones de gases hidrocarburos y NOX', required: true, category: 'Medio Ambiente' }]
    },
    registrationSystem: { authorityName: 'SEMOVI / Secretaría de Finanzas', transferFeeFixed: 450, variableTaxPercentage: 2, averageProcessingDays: 3, digitalAvailable: true },
    insuranceSystem: { country: 'MX', isAvailable: true, estimatedRange: { min: 4500, max: 14000 }, note: 'Seguro obligatorio de daños a terceros en carreteras federales.' },
    partsMarket: { country: 'MX', currency: 'MXN', importTariffMultiplier: 1.15, standardAvailabilityDays: 2, partsVatRate: 0.16 },
    laborMarket: { country: 'MX', currency: 'MXN', hourlyRateMin: 350, hourlyRateExpected: 650, hourlyRateMax: 1400 },
    marketplaceConfig: { allowedMarketplaces: ['mercadolibre.com.mx', 'seminuevos.com', 'kavak.com'] },
    requiredDocuments: [
      { type: 'invoice', title: 'Factura Original con Endosos', issuingAuthority: 'Agencia Automotriz', requiredForTransfer: true, country: 'MX', description: 'Factura de origen endosada al comprador.' },
      { type: 'registration', title: 'Tarjeta de Circulación Vigente', issuingAuthority: 'SEMOVI', requiredForTransfer: true, country: 'MX', description: 'Tarjeta de circulación vehicular.' }
    ]
  },

  BR: {
    countryCode: 'BR',
    countryName: 'Brasil',
    market: 'LATIN_AMERICA',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    language: 'pt',
    direction: 'ltr',
    distanceUnit: 'km',
    speedUnit: 'km/h',
    temperatureUnit: 'C',
    volumeUnit: 'L',
    fuelEconomyUnit: 'km/L',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: { decimalSeparator: ',', thousandSeparator: '.' },
    taxSystem: { country: 'BR', taxType: 'IPVA (Imposto sobre a Propriedade de Veículos Automotores)', rate: 0.04, rules: ['2% a 4% do valor venal (Tabela FIPE).'], currency: 'BRL', effectiveDate: '2026-01-01' },
    inspectionSystem: {
      code: 'VISTORIA', name: 'Vistoria Cautelar e Transferência (DETRAN)', periodicityYears: [1, 2, 3, 4, 5], initialGraceYears: 1, documentName: 'Laudo de Vistoria Aprovado', governingBody: 'SENATRAN / DETRAN',
      requiredChecks: [{ id: 'br-chassi', name: 'Gravação do chassi e motor (Decalque)', required: true, category: 'Identificação' }]
    },
    registrationSystem: { authorityName: 'DETRAN', transferFeeFixed: 280, variableTaxPercentage: 0, averageProcessingDays: 3, digitalAvailable: true },
    insuranceSystem: { country: 'BR', isAvailable: true, estimatedRange: { min: 1400, max: 4500 }, note: 'Seguro facultativo e DPVAT.' },
    partsMarket: { country: 'BR', currency: 'BRL', importTariffMultiplier: 1.30, standardAvailabilityDays: 3, partsVatRate: 0.18 },
    laborMarket: { country: 'BR', currency: 'BRL', hourlyRateMin: 90, hourlyRateExpected: 170, hourlyRateMax: 350 },
    marketplaceConfig: { allowedMarketplaces: ['webmotors.com.br', 'icarros.com.br', 'olx.com.br'] },
    requiredDocuments: [
      { type: 'ownership', title: 'CRLV-e / ATPV-e (Autorização para Transferência)', issuingAuthority: 'DETRAN / SENATRAN', requiredForTransfer: true, country: 'BR', description: 'Documento digital com assinatura Gov.br.' },
      { type: 'inspection', title: 'Laudo ECV (Empresa Credenciada de Vistoria)', issuingAuthority: 'Empresa Credenciada DETRAN', requiredForTransfer: true, country: 'BR', description: 'Comprova autenticidade estrutural.' }
    ]
  }
};
