/**
 * OCHE / CARCHECK AI — Global Vehicle Knowledge Database (FASE 5)
 * Canonical normalized automotive ontology with stable IDs, 16 standard systems,
 * multi-market configurations, verified engine codes, and cost models.
 */

import {
  Brand,
  VehicleModel,
  VehicleGeneration,
  Engine,
  VehicleSystem,
  Part,
  KnownProblem,
  MaintenanceItem,
  Repair,
  MarketConfiguration,
  VehicleConfiguration,
  GlobalVehicleComposite,
  StandardSystemType
} from '../types/vehicleKnowledge';

// ==========================================
// 1. STANDARD 16 VEHICLE SYSTEMS ONTOLOGY
// ==========================================
export const STANDARD_VEHICLE_SYSTEMS_DEF: Record<StandardSystemType, { name: string; description: string }> = {
  ENGINE: {
    name: 'Motor y Bloque Térmico',
    description: 'Bloque motor, culata, cigüeñal, pistones, distribución, lubricación y encendido.'
  },
  TRANSMISSION: {
    name: 'Transmisión y Embrague',
    description: 'Caja de cambios manual/automática, volante bimasa, conjunto de embrague, diferencial y palieres.'
  },
  BRAKES: {
    name: 'Sistema de Frenos',
    description: 'Discos, pastillas, pinzas, latiguillos, bomba principal de freno, servofreno y módulo ABS/ESP.'
  },
  SUSPENSION: {
    name: 'Suspensión',
    description: 'Amortiguadores, muelles helicoidales, brazos de suspensión, silentblocks y barra estabilizadora.'
  },
  STEERING: {
    name: 'Dirección',
    description: 'Cremallera de dirección, bomba de asistencia eléctrica/hidráulica, rótulas y caña de dirección.'
  },
  ELECTRICAL: {
    name: 'Sistema Eléctrico y Electrónica',
    description: 'Batería 12V, alternador, motor de arranque, cableados principales y centralitas electrónicas (ECU/BCM).'
  },
  COOLING: {
    name: 'Refrigeración Térmica',
    description: 'Radiador, bomba de agua, termostato, electroventilador, vaso de expansión y manguitos.'
  },
  FUEL: {
    name: 'Alimentación de Combustible',
    description: 'Depósito, bomba de baja y alta presión, rampa de inyección, inyectores piezoeléctricos/electromagnéticos.'
  },
  EXHAUST: {
    name: 'Escape',
    description: 'Colector de escape, turbo/geometría variable, silenciosos, tubo intermedio y sujeciones elásticas.'
  },
  EMISSIONS: {
    name: 'Sistemas Anticontaminación',
    description: 'Válvula EGR, filtro de partículas (DPF/GPF), catalizador SCR/AdBlue y sondas lambda.'
  },
  BODY: {
    name: 'Carrocería y Estructura',
    description: 'Paneles de chapa, pintura, travesaños, paragolpes, cierres de puertas, capó y lunas.'
  },
  INTERIOR: {
    name: 'Habitáculo e Interior',
    description: 'Tapicerías, cuadro de mandos, botoneras, volante, mecanismos de asientos y guarnecidos.'
  },
  SAFETY: {
    name: 'Seguridad Pasiva y Activa',
    description: 'Airbags, pretensores de cinturones, sensores de impacto, ISOFIX y cámaras/radares ADAS.'
  },
  AIR_CONDITIONING: {
    name: 'Climatización y Confort',
    description: 'Compresor de A/C, condensador, evaporador, válvula de expansión y filtro de habitáculo.'
  },
  TYRES: {
    name: 'Neumáticos y Llantas',
    description: 'Cubiertas de neumáticos, llantas de aleación/chapa, válvulas TPMS y alineación geométrica.'
  },
  DRIVETRAIN: {
    name: 'Tren de Transmisión y Tracción',
    description: 'Eje de transmisión, cardán, acoplamiento Haldex (4WD/AWD) y rodamientos de buje.'
  }
};

// ==========================================
// 2. BRANDS (with Aliases & Origin)
// ==========================================
export const GLOBAL_BRANDS: Brand[] = [
  {
    brandId: 'brand-vw',
    officialName: 'Volkswagen',
    aliases: ['VW', 'Volkswagen AG', 'VAG', 'Volks'],
    countryOfOrigin: 'DE',
    foundedYear: 1937,
    source: 'VAG Group Official',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false,
    createdAt: '2024-01-01T00:00:00Z',
    dataVersion: '1.0'
  },
  {
    brandId: 'brand-peugeot',
    officialName: 'Peugeot',
    aliases: ['PSA', 'Stellantis Peugeot', 'Peug'],
    countryOfOrigin: 'FR',
    foundedYear: 1810,
    source: 'Stellantis Official',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false,
    createdAt: '2024-01-01T00:00:00Z',
    dataVersion: '1.0'
  },
  {
    brandId: 'brand-toyota',
    officialName: 'Toyota',
    aliases: ['Toyota Motor Corporation', 'TMC'],
    countryOfOrigin: 'JP',
    foundedYear: 1937,
    source: 'Toyota Global Technical',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false,
    createdAt: '2024-01-01T00:00:00Z',
    dataVersion: '1.0'
  },
  {
    brandId: 'brand-bmw',
    officialName: 'BMW',
    aliases: ['Bayerische Motoren Werke', 'Bimmer', 'Beemer', 'BMW AG'],
    countryOfOrigin: 'DE',
    foundedYear: 1916,
    source: 'BMW Group Official',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false,
    createdAt: '2024-01-01T00:00:00Z',
    dataVersion: '1.0'
  }
];

// ==========================================
// 3. VEHICLE MODELS
// ==========================================
export const GLOBAL_MODELS: VehicleModel[] = [
  {
    modelId: 'model-golf',
    brandId: 'brand-vw',
    name: 'Golf',
    segment: 'C',
    category: 'Hatchback',
    productionStartYear: 1974,
    productionEndYear: null,
    aliases: ['Golf', 'VW Golf'],
    source: 'Volkswagen AG',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false
  },
  {
    modelId: 'model-208',
    brandId: 'brand-peugeot',
    name: '208',
    segment: 'B',
    category: 'Hatchback',
    productionStartYear: 2012,
    productionEndYear: null,
    aliases: ['208', 'Peugeot 208'],
    source: 'Stellantis Documentation',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false
  },
  {
    modelId: 'model-yaris',
    brandId: 'brand-toyota',
    name: 'Yaris',
    segment: 'B',
    category: 'Hatchback',
    productionStartYear: 1999,
    productionEndYear: null,
    aliases: ['Yaris', 'Vitz', 'Echo'],
    source: 'Toyota Technical Archive',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false
  },
  {
    modelId: 'model-3series',
    brandId: 'brand-bmw',
    name: 'Serie 3',
    segment: 'D',
    category: 'Sedan',
    productionStartYear: 1975,
    productionEndYear: null,
    aliases: ['3 Series', '3er', 'Serie 3', '320d'],
    source: 'BMW AG Archive',
    sourceType: 'MANUFACTURER',
    confidence: 1.0,
    isDemo: false
  }
];

// ==========================================
// 4. GENERATIONS & RESTYLINGS
// ==========================================
export const GLOBAL_GENERATIONS: VehicleGeneration[] = [
  {
    generationId: 'gen-golf-7',
    modelId: 'model-golf',
    generationName: 'Golf VII (Typ 5G)',
    internalCode: '5G1 / MQB',
    yearFrom: 2012,
    yearTo: 2019,
    facelifts: [
      {
        id: 'facelift-golf-7-5',
        generationId: 'gen-golf-7',
        name: 'Golf VII Facelift (Golf 7.5)',
        yearFrom: 2017,
        yearTo: 2019,
        changesDescription: 'Paragolpes actualizados, pilotos LED de serie, cuadro Digital Cockpit opcional y nueva pantalla Discover Pro.',
        visualDifferences: ['Faros principales LED rediseñados', 'Pilotos traseros con intermitente dinámico', 'Molduras de escape integradas']
      }
    ],
    bodyStyles: ['Hatchback', 'Estate'],
    availableEngineIds: ['eng-ea288-20tdi', 'eng-ea211-14tsi'],
    availableTransmissionOptions: ['Manual', 'DualClutch'],
    markets: ['EUROPE', 'NORTH_AMERICA', 'MENA', 'ASIA_PACIFIC', 'LATAM'],
    source: 'VAG Group Product Specs',
    sourceType: 'TECHNICAL',
    confidence: 1.0,
    isDemo: false
  },
  {
    generationId: 'gen-peugeot-208-1',
    modelId: 'model-208',
    generationName: '208 I (A9)',
    internalCode: 'A9 / PF1',
    yearFrom: 2012,
    yearTo: 2019,
    facelifts: [
      {
        id: 'facelift-208-phase2',
        generationId: 'gen-peugeot-208-1',
        name: '208 Fase 2',
        yearFrom: 2015,
        yearTo: 2019,
        changesDescription: 'Nueva calandra delantera más ancha, pilotos 3D LED con efecto garras de león y motores Euro 6 PureTech.',
        visualDifferences: ['Calandra con textura 3D', 'Llantas diamantadas', 'Pilotos LED efecto garra']
      }
    ],
    bodyStyles: ['Hatchback'],
    availableEngineIds: ['eng-puretech-12-110', 'eng-hdi-16'],
    availableTransmissionOptions: ['Manual', 'TorqueConverter'],
    markets: ['EUROPE', 'MENA', 'LATAM'],
    source: 'PSA Technical Manual',
    sourceType: 'TECHNICAL',
    confidence: 1.0,
    isDemo: false
  },
  {
    generationId: 'gen-toyota-yaris-3',
    modelId: 'model-yaris',
    generationName: 'Yaris III (XP130)',
    internalCode: 'XP130 / Toyota B',
    yearFrom: 2011,
    yearTo: 2020,
    facelifts: [
      {
        id: 'facelift-yaris-restyling-1',
        generationId: 'gen-toyota-yaris-3',
        name: 'Yaris Restyling 1',
        yearFrom: 2014,
        yearTo: 2017,
        changesDescription: 'Frontal con diseño en "X" característico de Keen Look y suspensión recalibrada.'
      },
      {
        id: 'facelift-yaris-restyling-2',
        generationId: 'gen-toyota-yaris-3',
        name: 'Yaris Restyling 2',
        yearFrom: 2017,
        yearTo: 2020,
        changesDescription: 'Pilotos traseros horizontales integrados en el portón y sistema Toyota Safety Sense de serie.'
      }
    ],
    bodyStyles: ['Hatchback'],
    availableEngineIds: ['eng-toyota-1krfe-10', 'eng-toyota-1nzfxe-15h'],
    availableTransmissionOptions: ['Manual', 'CVT'],
    markets: ['EUROPE', 'ASIA_PACIFIC', 'MENA', 'LATAM'],
    source: 'Toyota Worldwide Documentation',
    sourceType: 'TECHNICAL',
    confidence: 1.0,
    isDemo: false
  },
  {
    generationId: 'gen-bmw-f30',
    modelId: 'model-3series',
    generationName: 'Serie 3 VI (F30)',
    internalCode: 'F30',
    yearFrom: 2012,
    yearTo: 2019,
    facelifts: [
      {
        id: 'facelift-bmw-f30-lci',
        generationId: 'gen-bmw-f30',
        name: 'F30 LCI (Life Cycle Impulse)',
        yearFrom: 2015,
        yearTo: 2019,
        changesDescription: 'Sustitución del motor N47 por el nuevo bloque B47 Euro 6, faros Full LED rediseñados y suspensión revisada.',
        visualDifferences: ['Faros delanteros con firma LED continua', 'Pilotos traseros LED con barras L', 'Salidas de escape cromadas']
      }
    ],
    bodyStyles: ['Sedan', 'Estate'],
    availableEngineIds: ['eng-bmw-n47-b47-320d', 'eng-bmw-b48-320i'],
    availableTransmissionOptions: ['Manual', 'Automatic'],
    markets: ['EUROPE', 'NORTH_AMERICA', 'MENA', 'ASIA_PACIFIC', 'LATAM'],
    source: 'BMW AG Service Documentation',
    sourceType: 'TECHNICAL',
    confidence: 1.0,
    isDemo: false
  }
];

// ==========================================
// 5. ENGINES & ENGINE CODES
// ==========================================
export const GLOBAL_ENGINES: Engine[] = [
  {
    engineId: 'eng-ea288-20tdi',
    manufacturer: 'Volkswagen AG',
    family: 'EA288',
    name: '2.0 TDI BlueMotion EA288',
    engineCodes: [
      {
        engineCode: 'CRBC',
        engineFamily: 'EA288',
        engineVariant: '150 CV Euro 6a/b Transversal',
        powerHp: 150,
        torqueNm: 320,
        timingType: 'Belt',
        notes: 'Montado en Golf VII 2012-2016'
      },
      {
        engineCode: 'CRLB',
        engineFamily: 'EA288',
        engineVariant: '150 CV Euro 6c con AdBlue/SCR',
        powerHp: 150,
        torqueNm: 340,
        timingType: 'Belt',
        notes: 'Montado en Golf VII 2015-2019'
      },
      {
        engineCode: 'DEJA',
        engineFamily: 'EA288',
        engineVariant: '150 CV Euro 6d-TEMP',
        powerHp: 150,
        torqueNm: 340,
        timingType: 'Belt',
        notes: 'Montado en Golf 7.5 2017-2019'
      }
    ],
    displacementCc: 1968,
    cylinders: 4,
    fuel: 'Diésel',
    aspiration: 'Turbocharged',
    powerHp: 150,
    torqueNm: 340,
    transmissionOptions: ['Manual', 'DualClutch'],
    timingType: 'Belt',
    emissionStandard: 'Euro 6',
    productionYears: { from: 2012, to: 2019 },
    knownProblemIds: ['prob-vw-waterpump', 'prob-vw-dpf-urban'],
    maintenanceIds: ['maint-vw-timingbelt', 'maint-vw-oilservice'],
    source: 'VAG Workshop Manual & ADAC Data',
    sourceType: 'TECHNICAL',
    confidence: 0.96,
    isDemo: true
  },
  {
    engineId: 'eng-puretech-12-110',
    manufacturer: 'Stellantis / PSA',
    family: 'EB2 / PureTech',
    name: '1.2 PureTech 110 S&S',
    engineCodes: [
      {
        engineCode: 'EB2DT',
        engineFamily: 'EB2',
        engineVariant: '110 CV Turbo Inyección Directa',
        powerHp: 110,
        torqueNm: 205,
        timingType: 'WetBelt',
        notes: 'Correa bañada en aceite (Wet Belt) propensa a desintegración por dilución de combustible'
      },
      {
        engineCode: 'EB2ADT',
        engineFamily: 'EB2',
        engineVariant: '110 CV Euro 6d con GPF',
        powerHp: 110,
        torqueNm: 205,
        timingType: 'WetBelt',
        notes: 'Versión con filtro de partículas de gasolina y calibración de aceite revisada'
      }
    ],
    displacementCc: 1199,
    cylinders: 3,
    fuel: 'Gasolina',
    aspiration: 'Turbocharged',
    powerHp: 110,
    torqueNm: 205,
    transmissionOptions: ['Manual', 'TorqueConverter'],
    timingType: 'WetBelt',
    emissionStandard: 'Euro 6',
    productionYears: { from: 2014, to: 2019 },
    knownProblemIds: ['prob-peug-wetbelt', 'prob-peug-oil-consumption'],
    maintenanceIds: ['maint-peug-wetbelt-check', 'maint-peug-oilservice'],
    source: 'PSA Technical Service Bulletins (TSB) & L\'Argus Reports',
    sourceType: 'TECHNICAL',
    confidence: 0.98,
    isDemo: true
  },
  {
    engineId: 'eng-toyota-1krfe-10',
    manufacturer: 'Toyota Motor Corp / Daihatsu',
    family: 'Toyota KR',
    name: '1.0 VVT-i 1KR-FE',
    engineCodes: [
      {
        engineCode: '1KR-FE',
        engineFamily: 'Toyota KR',
        engineVariant: '69 CV Atmosférico VVT-i 12V',
        powerHp: 69,
        torqueNm: 93,
        timingType: 'Chain',
        notes: 'Bloque de aluminio ultra-ligero y alta fiabilidad en tráfico urbano'
      }
    ],
    displacementCc: 998,
    cylinders: 3,
    fuel: 'Gasolina',
    aspiration: 'NaturallyAspirated',
    powerHp: 69,
    torqueNm: 93,
    transmissionOptions: ['Manual'],
    timingType: 'Chain',
    emissionStandard: 'Euro 5 / Euro 6',
    productionYears: { from: 2011, to: 2020 },
    knownProblemIds: ['prob-toyota-clutch-wear', 'prob-toyota-waterpump-seep'],
    maintenanceIds: ['maint-toyota-fluids', 'maint-toyota-sparkplugs'],
    source: 'Toyota Service Data & J.D. Power Reliability Index',
    sourceType: 'TECHNICAL',
    confidence: 0.95,
    isDemo: true
  },
  {
    engineId: 'eng-bmw-n47-b47-320d',
    manufacturer: 'BMW AG',
    family: 'BMW Diesel Inline-4',
    name: '2.0d TwinPower Turbo (N47 / B47)',
    engineCodes: [
      {
        engineCode: 'N47D20',
        engineFamily: 'N47',
        engineVariant: '184 CV Euro 5 (Cadena de distribución trasera)',
        powerHp: 184,
        torqueNm: 380,
        timingType: 'Chain',
        notes: 'Cadena de distribución en la parte trasera del motor; propensa a ruido y elongación en unidades 2012-2015'
      },
      {
        engineCode: 'B47D20',
        engineFamily: 'B47',
        engineVariant: '190 CV Euro 6 LCI Modular Engine',
        powerHp: 190,
        torqueNm: 400,
        timingType: 'Chain',
        notes: 'Cadena reforzada y mayor refinamiento acústico; campaña técnica de refrigerador EGR'
      }
    ],
    displacementCc: 1995,
    cylinders: 4,
    fuel: 'Diésel',
    aspiration: 'Turbocharged',
    powerHp: 184,
    torqueNm: 380,
    transmissionOptions: ['Manual', 'Automatic'],
    timingType: 'Chain',
    emissionStandard: 'Euro 5 / Euro 6',
    productionYears: { from: 2012, to: 2019 },
    knownProblemIds: ['prob-bmw-timingchain-n47', 'prob-bmw-egr-cooler'],
    maintenanceIds: ['maint-bmw-oilservice', 'maint-bmw-transmission-fluid'],
    source: 'BMW Service Information & DEKRA Defect Index',
    sourceType: 'TECHNICAL',
    confidence: 0.97,
    isDemo: true
  }
];

// ==========================================
// 6. KNOWN PROBLEMS (Standardized Cost Model & Traceable Provenance)
// ==========================================
export const GLOBAL_KNOWN_PROBLEMS: KnownProblem[] = [
  {
    id: 'prob-vw-waterpump',
    title: 'Fuga y agarrotamiento de polea en bomba de agua',
    description: 'En el bloque EA288, la electroválvula de caudal de la bomba de agua de origen tiende a agarrotarse o fugar refrigerante superados los 100.000–140.000 km.',
    severity: 'high',
    affectedEngines: ['eng-ea288-20tdi', 'CRBC', 'CRLB'],
    affectedYears: [2012, 2013, 2014, 2015, 2016, 2017],
    symptoms: ['Descenso paulatino del nivel de anticongelante en vaso de expansión', 'Olor a dulce/refrigerante caliente en vano motor', 'Aviso de temperatura en cuadro'],
    warningSigns: ['Manchas rosáceas/blanquecinas en la tapa inferior de distribución', 'Chirridos leves en frío en la zona de accesorios'],
    inspectionMethod: 'Inspección visual del flanco inferior de la carcasa de distribución con endoscopio y prueba de presión del circuito de refrigeración.',
    recommendedAction: 'Sustituir el kit completo de correa de distribución junto con bomba de agua de referencia actualizada modificada.',
    relatedParts: ['part-vw-timingkit', 'part-vw-waterpump'],
    relatedSystems: ['ENGINE', 'COOLING'],
    estimatedRepair: {
      minimum: 380,
      expected: 520,
      maximum: 750,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Independent Workshop Labor Rates Average',
      sourceType: 'WORKSHOP',
      confidence: 0.94,
      isDemo: true
    },
    confidence: 0.95,
    source: 'VAG Technical Service Bulletin 15-08',
    sourceType: 'TECHNICAL',
    sourceDate: '2023-04-12',
    isDemo: true
  },
  {
    id: 'prob-vw-dpf-urban',
    title: 'Saturación prematura de Filtro Antipartículas (DPF)',
    description: 'El uso preponderantemente urbano en trayectos cortos impide que los gases alcancen los 600°C necesarios para completar las regeneraciones térmicas pasivas.',
    severity: 'medium',
    affectedEngines: ['eng-ea288-20tdi'],
    affectedYears: { from: 2012, to: 2019 },
    symptoms: ['Testigo de DPF o muelle parpadeante en cuadro', 'Incremento del consumo instantáneo en ralentí (~1.1 L/h)', 'Modo protección de motor'],
    warningSigns: ['Electroventilador funcionando al máximo al apagar el motor repetidamente'],
    inspectionMethod: 'Lectura de gramos de hollín (Soot Mass) y ceniza (Oil Ash Volume) a través de diagnosis OBD-II / VCDS.',
    recommendedAction: 'Realizar regeneración forzada en autovía o limpieza por ultrasonidos en taller especializado.',
    relatedParts: ['part-vw-dpf'],
    relatedSystems: ['EMISSIONS', 'EXHAUST'],
    estimatedRepair: {
      minimum: 150,
      expected: 320,
      maximum: 600,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'DPF Cleaning Specialist Matrix',
      sourceType: 'WORKSHOP',
      confidence: 0.92,
      isDemo: true
    },
    confidence: 0.92,
    source: 'ADAC Reliability Yellow Angels Index',
    sourceType: 'TECHNICAL',
    sourceDate: '2023-11-05',
    isDemo: true
  },
  {
    id: 'prob-peug-wetbelt',
    title: 'Degradación de correa de distribución sumergida en aceite (Wet Belt)',
    description: 'La correa sumergida en aceite de los motores 1.2 PureTech se degrada prematuramente por dilución de gasolina en trayectos cortos. Los restos desprendidos obstruyen el tamiz de la bomba de aceite, provocando pérdida de presión de engrase y riesgo de gripado.',
    severity: 'critical',
    affectedEngines: ['eng-puretech-12-110', 'EB2DT', 'EB2ADT'],
    affectedYears: [2014, 2015, 2016, 2017, 2018],
    symptoms: ['Aviso "Fallo presión de aceite / Parar motor"', 'Dureza en el pedal de freno por pérdida de vacío en la bomba depresora', 'Consumo anómalo de aceite'],
    warningSigns: ['Anchura excesiva de la correa comprobada con el calibre especial PSA a través del tapón de llenado', 'Grietas visibles en el dorso de la correa'],
    inspectionMethod: 'Medición de la anchura de la correa con la galga de control PSA a través de la boca de llenado de aceite e inspección visual de la chupona de aceite bajando el cárter.',
    recommendedAction: 'Sustitución inmediata del kit de distribución con correa de material reforzado, limpieza integral de cárter/chupón y cambio de bomba de vacío si está contaminada.',
    relatedParts: ['part-peug-wetbelt', 'part-peug-oilpump-strainer'],
    relatedSystems: ['ENGINE', 'BRAKES'],
    estimatedRepair: {
      minimum: 650,
      expected: 950,
      maximum: 1400,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'PSA Official Workshop Recall Procedure Documentation',
      sourceType: 'TECHNICAL',
      confidence: 0.98,
      isDemo: true
    },
    confidence: 0.98,
    source: 'Campaña Oficial Stellantis JZR/KDJ & L\'Argus',
    sourceType: 'OFFICIAL',
    sourceDate: '2023-09-18',
    isDemo: true
  },
  {
    id: 'prob-peug-oil-consumption',
    title: 'Consumo elevado de aceite por carbonilla en segmentos',
    description: 'Enganche de los segmentos rascadores de aceite por sedimentos de combustión, provocando paso de aceite a la cámara de combustión.',
    severity: 'medium',
    affectedEngines: ['eng-puretech-12-110'],
    affectedYears: { from: 2014, to: 2019 },
    symptoms: ['Consumo superior a 0.5 litros cada 1.000 km', 'Humo azulado en aceleración fuerte', 'Bujías manchadas de carbonilla aceitosa'],
    warningSigns: ['Nivel de aceite en el mínimo antes de 5.000 km tras revisión'],
    inspectionMethod: 'Comprobación de compresión en frío y en caliente por cilindro y boroscopia de la cabeza del pistón.',
    recommendedAction: 'Descarbonización química de segmentos o reconstrucción si el desgaste en cilindro es excesivo.',
    relatedParts: ['part-peug-pistons'],
    relatedSystems: ['ENGINE'],
    estimatedRepair: {
      minimum: 300,
      expected: 600,
      maximum: 1200,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Technical Engine Rebuilders Data',
      sourceType: 'WORKSHOP',
      confidence: 0.90,
      isDemo: true
    },
    confidence: 0.91,
    source: 'French Consumer Auto Plus Benchmark',
    sourceType: 'TECHNICAL',
    isDemo: true
  },
  {
    id: 'prob-toyota-clutch-wear',
    title: 'Desgaste prematuro del conjunto de embrague en uso 100% urbano',
    description: 'En el Yaris 1.0 manual utilizado intensamente en ciudad, el disco de embrague de diámetro compacto sufre fricción térmica elevada y puede patinar a partir de los 90.000 km.',
    severity: 'medium',
    affectedEngines: ['eng-toyota-1krfe-10', '1KR-FE'],
    affectedYears: { from: 2011, to: 2020 },
    symptoms: ['El motor se revoluciona sin ganar velocidad proporcional en subidas o adelantamientos', 'Punto de fricción del pedal muy alto', 'Olor a ferodo'],
    warningSigns: ['Dureza creciente en el accionamiento del pedal de embrague'],
    inspectionMethod: 'Prueba de tracción en 3ª velocidad con freno de mano accionado para verificar retención del disco.',
    recommendedAction: 'Sustituir el kit de embrague (disco, maza y cojinete de empuje) por kit de especificación reforzada (ej. Aisin/LuK).',
    relatedParts: ['part-toyota-clutchkit'],
    relatedSystems: ['TRANSMISSION'],
    estimatedRepair: {
      minimum: 320,
      expected: 480,
      maximum: 680,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Standard Labor Guide AutoData',
      sourceType: 'TECHNICAL',
      confidence: 0.94,
      isDemo: true
    },
    confidence: 0.94,
    source: 'Toyota Technical Experience Database',
    sourceType: 'TECHNICAL',
    isDemo: true
  },
  {
    id: 'prob-toyota-waterpump-seep',
    title: 'Pequeño rezume en el retén de la bomba de agua',
    description: 'La bomba de agua original en motores 1KR-FE puede presentar un rezume rosáceo por el orificio de drenaje alrededor de los 120.000 km sin provocar rotura súbita.',
    severity: 'low',
    affectedEngines: ['eng-toyota-1krfe-10'],
    affectedYears: { from: 2011, to: 2018 },
    symptoms: ['Costra rosácea en la polea de la bomba de agua', 'Ligero descenso semestral del nivel de anticongelante'],
    warningSigns: ['Gotas secas en la parte frontal izquierda del bloque motor'],
    inspectionMethod: 'Inspección visual directa de la polea y retén de la bomba de agua.',
    recommendedAction: 'Sustituir bomba de agua en la siguiente revisión periódica de fluidos.',
    relatedParts: ['part-toyota-waterpump'],
    relatedSystems: ['COOLING', 'ENGINE'],
    estimatedRepair: {
      minimum: 140,
      expected: 220,
      maximum: 320,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Toyota Independent Workshop Quotes',
      sourceType: 'WORKSHOP',
      confidence: 0.95,
      isDemo: true
    },
    confidence: 0.95,
    source: 'TÜV Report & DEKRA Used Car Safety Survey',
    sourceType: 'OFFICIAL',
    isDemo: true
  },
  {
    id: 'prob-bmw-timingchain-n47',
    title: 'Elongación y rotura de guías de cadena de distribución trasera (N47)',
    description: 'En los bloques N47D20 producidos hasta 2015, la cadena de distribución ubicada en la parte trasera (lado caja de cambios) sufre elongación y desgaste de guías de teflón, pudiendo saltar dientes o partirse.',
    severity: 'critical',
    affectedEngines: ['eng-bmw-n47-b47-320d', 'N47D20'],
    affectedYears: [2012, 2013, 2014, 2015],
    symptoms: ['Ruido metálico rítmico ("seseo" de ciclomotor) entre 1.500 y 2.000 rpm perceptible desde el paso de rueda', 'Vibraciones anómalas en ralentí'],
    warningSigns: ['Ruido de arrastre metálico audible en frío al acelerar en vacío'],
    inspectionMethod: 'Comprobación acústica en la campana de embrague y medición de tensión de cadena con útil especial BMW.',
    recommendedAction: 'Desmontar caja de cambios o extraer motor para sustituir el kit completo de 3 cadenas, tensores hidráulicos y piñones por referencias B47 actualizadas.',
    relatedParts: ['part-bmw-timingchain-kit'],
    relatedSystems: ['ENGINE'],
    estimatedRepair: {
      minimum: 1100,
      expected: 1650,
      maximum: 2400,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Specialist BMW Independent Garages Survey',
      sourceType: 'WORKSHOP',
      confidence: 0.96,
      isDemo: true
    },
    confidence: 0.97,
    source: 'BMW Technical Bulletin SI B11 03 14 & Auto Motor und Sport',
    sourceType: 'TECHNICAL',
    sourceDate: '2022-08-10',
    isDemo: true
  },
  {
    id: 'prob-bmw-egr-cooler',
    title: 'Fuga interna y riesgo térmico en enfriador de la válvula EGR',
    description: 'El intercambiador térmico de recirculación de gases de escape puede agrietarse internamente, mezclando glicol con carbonilla de escape inflamable.',
    severity: 'high',
    affectedEngines: ['eng-bmw-n47-b47-320d', 'B47D20', 'N47D20'],
    affectedYears: [2012, 2013, 2014, 2015, 2016, 2017, 2018],
    symptoms: ['Pérdida de refrigerante sin fuga exterior visible', 'Olor a gases de escape en el habitáculo', 'Aviso de nivel bajo en cuadro'],
    warningSigns: ['Costra pegajosa en el conducto de admisión de plástico'],
    inspectionMethod: 'Comprobación de estanqueidad por vacío del intercambiador y verificación de número de serie en la campaña técnica oficial BMW.',
    recommendedAction: 'Acudir a concesionario oficial para sustitución gratuita bajo campaña oficial de seguridad o sustituir módulo EGR completo.',
    relatedParts: ['part-bmw-egr-cooler'],
    relatedSystems: ['EMISSIONS', 'COOLING'],
    estimatedRepair: {
      minimum: 0,
      expected: 0,
      maximum: 650,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Recall Campaign 0011150700 (Free in official network)',
      sourceType: 'OFFICIAL',
      confidence: 0.99,
      isDemo: true
    },
    confidence: 0.99,
    source: 'Safety Recall Notice European Commission Safety Gate RAPEX',
    sourceType: 'OFFICIAL',
    sourceDate: '2023-01-20',
    isDemo: true
  }
];

// ==========================================
// 7. PARTS (Linked to 16 Systems & Robust Models)
// ==========================================
export const GLOBAL_PARTS: Part[] = [
  {
    id: 'part-vw-timingkit',
    name: 'Kit de Distribución con Bomba de Agua (EA288)',
    systemId: 'ENGINE',
    description: 'Conjunto de correa dentada, rodillos guía, tensor automático y bomba de refrigerante con actuador.',
    function: 'Sincroniza el giro del cigüeñal con los árboles de levas de admisión y escape y bombea el líquido refrigerante.',
    location: 'Lateral derecho del vano motor (transversal)',
    symptoms: ['Chirrido en frío', 'Pérdida de anticongelante', 'Vibración de polea'],
    failureModes: ['Desgaste de dientes de correa', 'Fuga por empaquetadura de bomba', 'Rotura de rodamiento tensor'],
    inspectionMethods: ['Comprobación visual de holgura', 'Prueba de fugas de refrigerante', 'Registro de kilometraje/tiempo'],
    maintenanceItems: ['maint-vw-timingbelt'],
    knownProblems: ['prob-vw-waterpump'],
    repairOptions: ['Sustitución preventiva de kit completo'],
    riskLevel: 'high',
    costRange: {
      minimum: 180,
      expected: 240,
      maximum: 320,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Continental / INA Catalog 2024',
      sourceType: 'TECHNICAL',
      confidence: 0.96,
      isDemo: true
    },
    source: 'VAG ETKA Catalog',
    sourceType: 'MANUFACTURER',
    confidence: 0.97,
    isDemo: true
  },
  {
    id: 'part-vw-dpf',
    name: 'Filtro de Partículas Diésel (DPF / Monolito SiC)',
    systemId: 'EMISSIONS',
    description: 'Filtro cerámico de carburo de silicio con recubrimiento de metales preciosos para retener hollín diésel.',
    function: 'Atrapa y oxida las partículas sólidas PM2.5 y PM10 procedentes de la combustión diésel.',
    location: 'Línea de escape tras el turbocompresor',
    symptoms: ['Aviso DPF en cuadro', 'Pérdida de potencia', 'Consumo elevado'],
    failureModes: ['Saturación de hollín', 'Rotura térmica de monolito', 'Fallo de sensores de presión diferencial'],
    inspectionMethods: ['Diagnosis electrónica VCDS (Oil Ash / Soot)', 'Inspección de salida de escape (sin hollín negro)'],
    maintenanceItems: ['maint-vw-oilservice'],
    knownProblems: ['prob-vw-dpf-urban'],
    repairOptions: ['Regeneración forzada', 'Limpieza por ultrasonidos', 'Sustitución de cartucho'],
    riskLevel: 'medium',
    costRange: {
      minimum: 600,
      expected: 950,
      maximum: 1600,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'OEM / Walker Exhaust Price Matrix',
      sourceType: 'TECHNICAL',
      confidence: 0.94,
      isDemo: true
    },
    source: 'VAG Technical Manual',
    sourceType: 'TECHNICAL',
    confidence: 0.95,
    isDemo: true
  },
  {
    id: 'part-peug-wetbelt',
    name: 'Correa de Distribución en Aceite (PureTech EB2)',
    systemId: 'ENGINE',
    description: 'Correa dentada de elastómero especial diseñada para operar sumergida en el aceite del motor.',
    function: 'Transmite el movimiento sincronizado del cigüeñal a los árboles de levas.',
    location: 'Frontal interno del motor bañado en cárter',
    symptoms: ['Hinchamiento visible', 'Grietas', 'Aviso de presión de aceite'],
    failureModes: ['Desprendimiento de goma', 'Obstrucción de chupona de aceite', 'Pérdida de dientes'],
    inspectionMethods: ['Galga de medición PSA en boca de llenado de aceite', 'Desmontaje de cárter de aceite'],
    maintenanceItems: ['maint-peug-wetbelt-check'],
    knownProblems: ['prob-peug-wetbelt'],
    repairOptions: ['Sustitución urgente con kit reforzado + limpieza de cárter'],
    riskLevel: 'critical',
    costRange: {
      minimum: 350,
      expected: 550,
      maximum: 850,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Stellantis Parts Counter & Dayco Kit',
      sourceType: 'TECHNICAL',
      confidence: 0.98,
      isDemo: true
    },
    source: 'Stellantis Service Box',
    sourceType: 'MANUFACTURER',
    confidence: 0.98,
    isDemo: true
  },
  {
    id: 'part-toyota-clutchkit',
    name: 'Kit de Embrague Monodisco en Seco (1KR-FE)',
    systemId: 'TRANSMISSION',
    description: 'Disco de embrague con forro de fricción orgánico, plato de presión y cojinete de desembrague.',
    function: 'Acopla y desacopla la transmisión de par motor desde el volante de inercia a la caja de cambios manual.',
    location: 'Entre el bloque motor y la caja de cambios de 5 marchas',
    symptoms: ['Patinamiento en aceleración', 'Pedal duro', 'Dificultad para engranar 1ª o marcha atrás'],
    failureModes: ['Desgaste de ferodo hasta remaches', 'Rotura de diafragma de maza'],
    inspectionMethods: ['Prueba de retención en rampa', 'Medición de recorrido útil del pedal'],
    maintenanceItems: ['maint-toyota-fluids'],
    knownProblems: ['prob-toyota-clutch-wear'],
    repairOptions: ['Sustitución completa de kit de 3 piezas'],
    riskLevel: 'medium',
    costRange: {
      minimum: 130,
      expected: 190,
      maximum: 270,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Aisin / LuK Aftermarket Catalog',
      sourceType: 'TECHNICAL',
      confidence: 0.96,
      isDemo: true
    },
    source: 'Toyota Technical Training Guide',
    sourceType: 'TECHNICAL',
    confidence: 0.96,
    isDemo: true
  },
  {
    id: 'part-bmw-timingchain-kit',
    name: 'Kit Completo de Cadenas de Distribución (N47 / B47)',
    systemId: 'ENGINE',
    description: 'Conjunto de 3 cadenas de rodillos (superior, inferior y bomba de aceite), tensores hidráulicos y guías plásticas.',
    function: 'Sincroniza cigüeñal, bomba de alta presión diésel y doble árbol de levas.',
    location: 'Parte trasera del motor acoplada a la campana del cambio',
    symptoms: ['Ruido de seseo metálico en frío y caliente', 'Código de desincronización de árbol de levas'],
    failureModes: ['Elongación de eslabones', 'Rotura de patines de teflón', 'Gripado de tensor hidráulico'],
    inspectionMethods: ['Escucha acústica con estetoscopio de taller', 'Medición de avance con diagnosis ISTA/D'],
    maintenanceItems: ['maint-bmw-oilservice'],
    knownProblems: ['prob-bmw-timingchain-n47'],
    repairOptions: ['Sustitución completa con kit original BMW actualizado'],
    riskLevel: 'critical',
    costRange: {
      minimum: 400,
      expected: 650,
      maximum: 950,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Original Parts & Febi Bilstein Kit',
      sourceType: 'TECHNICAL',
      confidence: 0.96,
      isDemo: true
    },
    source: 'BMW AG TIS (Technical Information System)',
    sourceType: 'MANUFACTURER',
    confidence: 0.97,
    isDemo: true
  },
  {
    id: 'part-bmw-egr-cooler',
    name: 'Módulo Intercambiador y Válvula EGR (B47/N47)',
    systemId: 'EMISSIONS',
    description: 'Cuerpo de refrigeración de gases de escape por líquido refrigerante con válvula de control neumática/eléctrica.',
    function: 'Enfría los gases de escape recirculados antes de introducirlos en la admisión para reducir emisiones NOx.',
    location: 'Parte frontal/lateral del motor diésel',
    symptoms: ['Pérdida de refrigerante', 'Olor a escape en habitáculo', 'Modo protección de motor'],
    failureModes: ['Fisura interna en haz de tubos', 'Carbonización de compuerta'],
    inspectionMethods: ['Comprobación estanqueidad por vacío', 'Cotejo de campaña técnica oficial'],
    maintenanceItems: ['maint-bmw-oilservice'],
    knownProblems: ['prob-bmw-egr-cooler'],
    repairOptions: ['Sustitución por unidad modificada BorgWarner / BMW'],
    riskLevel: 'high',
    costRange: {
      minimum: 250,
      expected: 420,
      maximum: 680,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Parts System',
      sourceType: 'OFFICIAL',
      confidence: 0.97,
      isDemo: true
    },
    source: 'BMW Recall Campaign Database',
    sourceType: 'OFFICIAL',
    confidence: 0.98,
    isDemo: true
  }
];

// ==========================================
// 8. MAINTENANCE ITEMS (Intervals & Rules)
// ==========================================
export const GLOBAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: 'maint-vw-timingbelt',
    engineId: 'eng-ea288-20tdi',
    item: 'Sustitución de Correa de Distribución y Bomba de Agua',
    intervalKm: 150000,
    intervalMonths: 72,
    severity: 'critical',
    recommended: true,
    notes: 'Imprescindible sustituir la bomba de agua al mismo tiempo debido al riesgo de gripado de polea.',
    estimatedCost: {
      minimum: 420,
      expected: 580,
      maximum: 800,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Official VAG Service Schedule Matrix',
      sourceType: 'MANUFACTURER',
      confidence: 0.95,
      isDemo: true
    },
    source: 'Volkswagen Service Manual',
    sourceType: 'MANUFACTURER',
    isDemo: true
  },
  {
    id: 'maint-vw-oilservice',
    engineId: 'eng-ea288-20tdi',
    item: 'Servicio de Aceite Sintético LongLife 5W30 (VW 507.00) y Filtros',
    intervalKm: 15000,
    intervalMonths: 12,
    severity: 'high',
    recommended: true,
    notes: 'Recomendado reducir el intervalo a 15.000 km en lugar de 30.000 km para proteger el turbocompresor y evitar degradación del DPF.',
    estimatedCost: {
      minimum: 120,
      expected: 180,
      maximum: 260,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Workshop Price Index',
      sourceType: 'WORKSHOP',
      confidence: 0.95,
      isDemo: true
    },
    source: 'Volkswagen Maintenance Plan',
    sourceType: 'MANUFACTURER',
    isDemo: true
  },
  {
    id: 'maint-peug-wetbelt-check',
    engineId: 'eng-puretech-12-110',
    item: 'Comprobación de Anchura de Correa con Galga y Cambio de Aceite 0W20 PSA B71 2010',
    intervalKm: 15000,
    intervalMonths: 12,
    severity: 'critical',
    recommended: true,
    notes: 'Utilizar exclusivamente el aceite homologado para evitar la descomposición acelerada del caucho sumergido.',
    estimatedCost: {
      minimum: 140,
      expected: 210,
      maximum: 290,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Stellantis Updated Service Matrix 2023',
      sourceType: 'OFFICIAL',
      confidence: 0.97,
      isDemo: true
    },
    source: 'PSA Maintenance Bulletin 2023',
    sourceType: 'OFFICIAL',
    isDemo: true
  },
  {
    id: 'maint-peug-oilservice',
    engineId: 'eng-puretech-12-110',
    item: 'Sustitución Preventiva de Correa de Distribución',
    intervalKm: 100000,
    intervalMonths: 72,
    severity: 'critical',
    recommended: true,
    notes: 'Reducido por el fabricante de 180.000 km / 10 años a 100.000 km / 6 años tras los fallos masivos de desprendimiento.',
    estimatedCost: {
      minimum: 550,
      expected: 780,
      maximum: 1100,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Independent Workshop Quote Survey',
      sourceType: 'WORKSHOP',
      confidence: 0.96,
      isDemo: true
    },
    source: 'Stellantis Service Recall Protocol',
    sourceType: 'OFFICIAL',
    isDemo: true
  },
  {
    id: 'maint-toyota-fluids',
    engineId: 'eng-toyota-1krfe-10',
    item: 'Servicio Periódico Toyota (Aceite 0W20 / 5W30 + Filtros + Revisión de Frenos)',
    intervalKm: 15000,
    intervalMonths: 12,
    severity: 'high',
    recommended: true,
    notes: 'Mantenimiento preventivo estándar para asegurar la longevidad del motor de 3 cilindros.',
    estimatedCost: {
      minimum: 110,
      expected: 160,
      maximum: 230,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Toyota Express Service Pricing',
      sourceType: 'MANUFACTURER',
      confidence: 0.96,
      isDemo: true
    },
    source: 'Toyota European Maintenance Schedule',
    sourceType: 'MANUFACTURER',
    isDemo: true
  },
  {
    id: 'maint-toyota-sparkplugs',
    engineId: 'eng-toyota-1krfe-10',
    item: 'Sustitución de Bujías de Iridio (3 uds)',
    intervalKm: 60000,
    intervalMonths: 48,
    severity: 'medium',
    recommended: true,
    notes: 'Evita fallos de encendido y protege la bobina en frío.',
    estimatedCost: {
      minimum: 60,
      expected: 95,
      maximum: 140,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Denso / NGK Catalog',
      sourceType: 'TECHNICAL',
      confidence: 0.95,
      isDemo: true
    },
    source: 'Toyota Technical Handbook',
    sourceType: 'TECHNICAL',
    isDemo: true
  },
  {
    id: 'maint-bmw-oilservice',
    engineId: 'eng-bmw-n47-b47-320d',
    item: 'Servicio de Aceite BMW LongLife-04 5W30 y Microfiltro',
    intervalKm: 15000,
    intervalMonths: 12,
    severity: 'high',
    recommended: true,
    notes: 'Cambios de aceite rigurosos cada 15.000 km mitigan el desgaste acelerado de los patines de la cadena de distribución.',
    estimatedCost: {
      minimum: 150,
      expected: 220,
      maximum: 320,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Condition Based Servicing (CBS) Benchmark',
      sourceType: 'WORKSHOP',
      confidence: 0.96,
      isDemo: true
    },
    source: 'BMW CBS System Matrix',
    sourceType: 'MANUFACTURER',
    isDemo: true
  },
  {
    id: 'maint-bmw-transmission-fluid',
    engineId: 'eng-bmw-n47-b47-320d',
    item: 'Cambio de Aceite y Cárter-Filtro de Caja Automática ZF 8HP',
    intervalKm: 100000,
    intervalMonths: 96,
    severity: 'high',
    recommended: true,
    notes: 'Recomendado por el fabricante de la caja ZF aunque BMW lo considere de por vida.',
    estimatedCost: {
      minimum: 380,
      expected: 520,
      maximum: 750,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'ZF Aftermarket Service Bulletin',
      sourceType: 'TECHNICAL',
      confidence: 0.97,
      isDemo: true
    },
    source: 'ZF Friedrichshafen AG Official Guideline',
    sourceType: 'TECHNICAL',
    isDemo: true
  }
];

// ==========================================
// 9. REPAIRS (Structured Costs & Labor)
// ==========================================
export const GLOBAL_REPAIRS: Repair[] = [
  {
    id: 'rep-vw-waterpump-kit',
    partId: 'part-vw-timingkit',
    description: 'Sustitución de kit de correa de distribución, polea tensora, rodillo guía y bomba de agua en motor 2.0 TDI EA288.',
    difficulty: 'Complex',
    partsCost: {
      minimum: 180,
      expected: 240,
      maximum: 320,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'INA / Gates OEM Kit',
      sourceType: 'TECHNICAL',
      confidence: 0.96,
      isDemo: true
    },
    laborCost: {
      minimum: 200,
      expected: 280,
      maximum: 430,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'AutoData 3.8 hours labor standard',
      sourceType: 'TECHNICAL',
      confidence: 0.94,
      isDemo: true
    },
    totalCost: {
      minimum: 380,
      expected: 520,
      maximum: 750,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Aggregated National Workshop Survey',
      sourceType: 'WORKSHOP',
      confidence: 0.95,
      isDemo: true
    },
    estimatedTimeHours: 3.8,
    riskLevel: 'high',
    source: 'AutoData Labor Time Guide',
    sourceType: 'TECHNICAL',
    isDemo: true
  },
  {
    id: 'rep-peug-wetbelt-replacement',
    partId: 'part-peug-wetbelt',
    description: 'Desmontaje de cárter, limpieza de chupona de aceite, sustitución de correa bañada en aceite y bomba de vacío en 1.2 PureTech.',
    difficulty: 'SpecialistWorkshop',
    partsCost: {
      minimum: 300,
      expected: 450,
      maximum: 650,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Stellantis Official Repair Kit',
      sourceType: 'TECHNICAL',
      confidence: 0.97,
      isDemo: true
    },
    laborCost: {
      minimum: 350,
      expected: 500,
      maximum: 750,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'PSA Time Standard: 6.5 hours',
      sourceType: 'TECHNICAL',
      confidence: 0.95,
      isDemo: true
    },
    totalCost: {
      minimum: 650,
      expected: 950,
      maximum: 1400,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Workshop Aggregation Data',
      sourceType: 'WORKSHOP',
      confidence: 0.96,
      isDemo: true
    },
    estimatedTimeHours: 6.5,
    riskLevel: 'critical',
    source: 'Stellantis Dealer Service Operation Protocol',
    sourceType: 'OFFICIAL',
    isDemo: true
  },
  {
    id: 'rep-toyota-clutch-replacement',
    partId: 'part-toyota-clutchkit',
    description: 'Sustitución de conjunto de embrague (disco, maza y cojinete) y purgado de circuito hidráulico en Yaris 1.0.',
    difficulty: 'Moderate',
    partsCost: {
      minimum: 130,
      expected: 190,
      maximum: 270,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Aisin Clutch Kit',
      sourceType: 'TECHNICAL',
      confidence: 0.96,
      isDemo: true
    },
    laborCost: {
      minimum: 190,
      expected: 290,
      maximum: 410,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'Standard Labor: 4.0 hours',
      sourceType: 'TECHNICAL',
      confidence: 0.94,
      isDemo: true
    },
    totalCost: {
      minimum: 320,
      expected: 480,
      maximum: 680,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'National Workshop Average',
      sourceType: 'WORKSHOP',
      confidence: 0.95,
      isDemo: true
    },
    estimatedTimeHours: 4.0,
    riskLevel: 'medium',
    source: 'Toyota Labor Repair Time Handbook',
    sourceType: 'TECHNICAL',
    isDemo: true
  },
  {
    id: 'rep-bmw-timingchain-replacement',
    partId: 'part-bmw-timingchain-kit',
    description: 'Extracción de motor o caja de cambios para sustitución de 3 cadenas de distribución, tensores y patines en BMW 320d.',
    difficulty: 'SpecialistWorkshop',
    partsCost: {
      minimum: 380,
      expected: 580,
      maximum: 850,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Group Parts',
      sourceType: 'TECHNICAL',
      confidence: 0.97,
      isDemo: true
    },
    laborCost: {
      minimum: 720,
      expected: 1070,
      maximum: 1550,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW KSD 11.5 hours labor standard',
      sourceType: 'TECHNICAL',
      confidence: 0.95,
      isDemo: true
    },
    totalCost: {
      minimum: 1100,
      expected: 1650,
      maximum: 2400,
      currency: 'EUR',
      countryCode: 'ES',
      source: 'BMW Specialist Workshop Quotes',
      sourceType: 'WORKSHOP',
      confidence: 0.96,
      isDemo: true
    },
    estimatedTimeHours: 11.5,
    riskLevel: 'critical',
    source: 'BMW KSD Labor Specification',
    sourceType: 'MANUFACTURER',
    isDemo: true
  }
];

// ==========================================
// 10. MARKET CONFIGURATIONS (Global Support)
// ==========================================
export const GLOBAL_MARKET_CONFIGURATIONS: MarketConfiguration[] = [
  // Volkswagen Golf VII 2.0 TDI
  {
    id: 'mkt-golf7-es',
    vehicleConfigurationId: 'vcfg-golf7-20tdi-man',
    countryCode: 'ES',
    marketName: 'Spain / Western Europe',
    modelName: 'Volkswagen Golf',
    trimNames: ['Edition', 'Advance', 'Sport', 'R-Line'],
    availableEngines: ['eng-ea288-20tdi'],
    availableTransmissions: ['Manual 6v', 'DSG 7v (DQ381)'],
    availableFuelTypes: ['Diésel'],
    productionYears: { from: 2012, to: 2019 },
    localSpecifications: {
      dgtLabel: 'C (Verde)',
      itpTaxRatePercent: 4.0,
      registrationFeeEur: 55.70,
      inspectionSystem: 'ITV'
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'CV',
      currency: 'EUR'
    },
    localNotes: ['Etiqueta medioambiental DGT "C" apta para ZBE.'],
    source: 'DGT & ANFAC Spain',
    isDemo: true
  },
  {
    id: 'mkt-golf7-de',
    vehicleConfigurationId: 'vcfg-golf7-20tdi-man',
    countryCode: 'DE',
    marketName: 'Germany / Central Europe',
    modelName: 'Volkswagen Golf VII',
    trimNames: ['Trendline', 'Comfortline', 'Highline', 'Join'],
    availableEngines: ['eng-ea288-20tdi'],
    availableTransmissions: ['Handschalter 6-Gang', 'DSG 7-Gang'],
    availableFuelTypes: ['Diesel'],
    productionYears: { from: 2012, to: 2019 },
    localSpecifications: {
      feinstaubPlakette: 'Grün (4)',
      inspectionSystem: 'TÜV / DEKRA HU+AU',
      kfzSteuerApproxYearly: 220
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'PS',
      currency: 'EUR'
    },
    source: 'KBA Germany',
    isDemo: true
  },
  {
    id: 'mkt-golf7-uk',
    vehicleConfigurationId: 'vcfg-golf7-20tdi-man',
    countryCode: 'UK',
    marketName: 'United Kingdom',
    modelName: 'Volkswagen Golf Mk7',
    trimNames: ['S', 'Match', 'GT', 'R-Line'],
    availableEngines: ['eng-ea288-20tdi'],
    availableTransmissions: ['6-Speed Manual', '7-Speed DSG'],
    availableFuelTypes: ['Diesel'],
    productionYears: { from: 2013, to: 2019 },
    localSpecifications: {
      ulezCompliant: true,
      inspectionSystem: 'MOT (DVSA)',
      roadTaxVeddAnnualGbp: 35
    },
    localUnits: {
      distance: 'miles',
      speed: 'mph',
      fuelEconomy: 'MPG (UK)',
      power: 'HP',
      currency: 'GBP'
    },
    source: 'DVLA United Kingdom',
    isDemo: true
  },

  // Peugeot 208 1.2 PureTech
  {
    id: 'mkt-peug208-es',
    vehicleConfigurationId: 'vcfg-peug208-puretech110-man',
    countryCode: 'ES',
    marketName: 'Spain',
    modelName: 'Peugeot 208',
    trimNames: ['Access', 'Active', 'Allure', 'GT Line'],
    availableEngines: ['eng-puretech-12-110'],
    availableTransmissions: ['Manual 5v / 6v', 'EAT6 Automático'],
    availableFuelTypes: ['Gasolina'],
    productionYears: { from: 2014, to: 2019 },
    localSpecifications: {
      dgtLabel: 'C (Verde)',
      inspectionSystem: 'ITV'
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'CV',
      currency: 'EUR'
    },
    source: 'Peugeot España',
    isDemo: true
  },
  {
    id: 'mkt-peug208-fr',
    vehicleConfigurationId: 'vcfg-peug208-puretech110-man',
    countryCode: 'FR',
    marketName: 'France',
    modelName: 'Peugeot 208',
    trimNames: ['Like', 'Active', 'Allure', 'Féline', 'GT Line'],
    availableEngines: ['eng-puretech-12-110'],
    availableTransmissions: ['Boîte Manuelle 5/6', 'EAT6'],
    availableFuelTypes: ['Essence'],
    productionYears: { from: 2014, to: 2019 },
    localSpecifications: {
      critAir: 'Crit\'Air 1',
      inspectionSystem: 'Contrôle Technique (UTAC)'
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'ch',
      currency: 'EUR'
    },
    source: 'Peugeot France / UTAC',
    isDemo: true
  },

  // Toyota Yaris 1.0 VVT-i
  {
    id: 'mkt-toyotayaris-es',
    vehicleConfigurationId: 'vcfg-toyota-yaris10-man',
    countryCode: 'ES',
    marketName: 'Spain',
    modelName: 'Toyota Yaris',
    trimNames: ['City', 'Active', 'Feel!', 'Bi-Tono'],
    availableEngines: ['eng-toyota-1krfe-10'],
    availableTransmissions: ['Manual 5 velocidades'],
    availableFuelTypes: ['Gasolina'],
    productionYears: { from: 2011, to: 2020 },
    localSpecifications: {
      dgtLabel: 'C (Verde)',
      inspectionSystem: 'ITV'
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'CV',
      currency: 'EUR'
    },
    source: 'Toyota España',
    isDemo: true
  },

  // BMW 320d F30
  {
    id: 'mkt-bmw320d-es',
    vehicleConfigurationId: 'vcfg-bmw-320d-f30-aut',
    countryCode: 'ES',
    marketName: 'Spain',
    modelName: 'BMW Serie 3 320d',
    trimNames: ['Base', 'Sport Line', 'Luxury Line', 'M Sport'],
    availableEngines: ['eng-bmw-n47-b47-320d'],
    availableTransmissions: ['Manual 6v', 'Steptronic ZF 8v'],
    availableFuelTypes: ['Diésel'],
    productionYears: { from: 2012, to: 2019 },
    localSpecifications: {
      dgtLabel: 'C (Verde en B47 / B en N47 Euro 5)',
      inspectionSystem: 'ITV'
    },
    localUnits: {
      distance: 'km',
      speed: 'km/h',
      fuelEconomy: 'L/100km',
      power: 'CV',
      currency: 'EUR'
    },
    source: 'BMW España',
    isDemo: true
  }
];

// ==========================================
// 11. VEHICLE CONFIGURATIONS
// ==========================================
export const GLOBAL_VEHICLE_CONFIGURATIONS: VehicleConfiguration[] = [
  {
    vehicleConfigurationId: 'vcfg-golf7-20tdi-man',
    brandId: 'brand-vw',
    modelId: 'model-golf',
    generationId: 'gen-golf-7',
    engineId: 'eng-ea288-20tdi',
    transmission: 'Manual',
    fuel: 'Diésel',
    bodyStyle: 'Hatchback',
    powerHp: 150,
    productionYears: { from: 2012, to: 2019 },
    systemIds: [
      'ENGINE',
      'TRANSMISSION',
      'BRAKES',
      'SUSPENSION',
      'STEERING',
      'ELECTRICAL',
      'COOLING',
      'FUEL',
      'EXHAUST',
      'EMISSIONS',
      'BODY',
      'INTERIOR',
      'SAFETY',
      'AIR_CONDITIONING',
      'TYRES',
      'DRIVETRAIN'
    ],
    partIds: ['part-vw-timingkit', 'part-vw-dpf'],
    knownProblemIds: ['prob-vw-waterpump', 'prob-vw-dpf-urban'],
    maintenanceIds: ['maint-vw-timingbelt', 'maint-vw-oilservice'],
    repairIds: ['rep-vw-waterpump-kit'],
    marketIds: ['mkt-golf7-es', 'mkt-golf7-de', 'mkt-golf7-uk'],
    source: 'Volkswagen AG',
    isDemo: true
  },
  {
    vehicleConfigurationId: 'vcfg-peug208-puretech110-man',
    brandId: 'brand-peugeot',
    modelId: 'model-208',
    generationId: 'gen-peugeot-208-1',
    engineId: 'eng-puretech-12-110',
    transmission: 'Manual',
    fuel: 'Gasolina',
    bodyStyle: 'Hatchback',
    powerHp: 110,
    productionYears: { from: 2014, to: 2019 },
    systemIds: [
      'ENGINE',
      'TRANSMISSION',
      'BRAKES',
      'SUSPENSION',
      'STEERING',
      'ELECTRICAL',
      'COOLING',
      'FUEL',
      'EXHAUST',
      'EMISSIONS',
      'BODY',
      'INTERIOR',
      'SAFETY',
      'AIR_CONDITIONING',
      'TYRES',
      'DRIVETRAIN'
    ],
    partIds: ['part-peug-wetbelt'],
    knownProblemIds: ['prob-peug-wetbelt', 'prob-peug-oil-consumption'],
    maintenanceIds: ['maint-peug-wetbelt-check', 'maint-peug-oilservice'],
    repairIds: ['rep-peug-wetbelt-replacement'],
    marketIds: ['mkt-peug208-es', 'mkt-peug208-fr'],
    source: 'Stellantis Official',
    isDemo: true
  },
  {
    vehicleConfigurationId: 'vcfg-toyota-yaris10-man',
    brandId: 'brand-toyota',
    modelId: 'model-yaris',
    generationId: 'gen-toyota-yaris-3',
    engineId: 'eng-toyota-1krfe-10',
    transmission: 'Manual',
    fuel: 'Gasolina',
    bodyStyle: 'Hatchback',
    powerHp: 69,
    productionYears: { from: 2011, to: 2020 },
    systemIds: [
      'ENGINE',
      'TRANSMISSION',
      'BRAKES',
      'SUSPENSION',
      'STEERING',
      'ELECTRICAL',
      'COOLING',
      'FUEL',
      'EXHAUST',
      'EMISSIONS',
      'BODY',
      'INTERIOR',
      'SAFETY',
      'AIR_CONDITIONING',
      'TYRES',
      'DRIVETRAIN'
    ],
    partIds: ['part-toyota-clutchkit'],
    knownProblemIds: ['prob-toyota-clutch-wear', 'prob-toyota-waterpump-seep'],
    maintenanceIds: ['maint-toyota-fluids', 'maint-toyota-sparkplugs'],
    repairIds: ['rep-toyota-clutch-replacement'],
    marketIds: ['mkt-toyotayaris-es'],
    source: 'Toyota Technical Archive',
    isDemo: true
  },
  {
    vehicleConfigurationId: 'vcfg-bmw-320d-f30-aut',
    brandId: 'brand-bmw',
    modelId: 'model-3series',
    generationId: 'gen-bmw-f30',
    engineId: 'eng-bmw-n47-b47-320d',
    transmission: 'Automatic',
    fuel: 'Diésel',
    bodyStyle: 'Sedan',
    powerHp: 184,
    productionYears: { from: 2012, to: 2019 },
    systemIds: [
      'ENGINE',
      'TRANSMISSION',
      'BRAKES',
      'SUSPENSION',
      'STEERING',
      'ELECTRICAL',
      'COOLING',
      'FUEL',
      'EXHAUST',
      'EMISSIONS',
      'BODY',
      'INTERIOR',
      'SAFETY',
      'AIR_CONDITIONING',
      'TYRES',
      'DRIVETRAIN'
    ],
    partIds: ['part-bmw-timingchain-kit', 'part-bmw-egr-cooler'],
    knownProblemIds: ['prob-bmw-timingchain-n47', 'prob-bmw-egr-cooler'],
    maintenanceIds: ['maint-bmw-oilservice', 'maint-bmw-transmission-fluid'],
    repairIds: ['rep-bmw-timingchain-replacement'],
    marketIds: ['mkt-bmw320d-es'],
    source: 'BMW AG Archive',
    isDemo: true
  }
];

// ==========================================
// 12. GLOBAL VEHICLE COMPOSITES (Canonical 4 Demo Vehicles)
// ==========================================
export const CANONICAL_GLOBAL_VEHICLES: GlobalVehicleComposite[] = [
  {
    id: 'golf-7-tdi',
    brand: GLOBAL_BRANDS[0], // Volkswagen
    model: GLOBAL_MODELS[0], // Golf
    generation: GLOBAL_GENERATIONS[0], // Golf VII
    engine: GLOBAL_ENGINES[0], // 2.0 TDI EA288
    configuration: GLOBAL_VEHICLE_CONFIGURATIONS[0],
    marketConfigurations: [
      GLOBAL_MARKET_CONFIGURATIONS[0],
      GLOBAL_MARKET_CONFIGURATIONS[1],
      GLOBAL_MARKET_CONFIGURATIONS[2]
    ],
    systems: (Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[]).map((sysId) => ({
      id: sysId,
      name: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].name,
      description: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].description,
      parts: GLOBAL_PARTS.filter((p) => p.systemId === sysId).map((p) => p.id),
      knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((kp) => kp.relatedSystems.includes(sysId)).map((kp) => kp.id),
      maintenance: sysId === 'ENGINE' ? ['maint-vw-timingbelt', 'maint-vw-oilservice'] : [],
      repairs: sysId === 'ENGINE' ? ['rep-vw-waterpump-kit'] : []
    })),
    parts: GLOBAL_PARTS.filter((p) => ['part-vw-timingkit', 'part-vw-dpf'].includes(p.id)),
    knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((p) => ['prob-vw-waterpump', 'prob-vw-dpf-urban'].includes(p.id)),
    maintenance: GLOBAL_MAINTENANCE_ITEMS.filter((m) => m.engineId === 'eng-ea288-20tdi'),
    repairs: GLOBAL_REPAIRS.filter((r) => r.id === 'rep-vw-waterpump-kit'),
    samplePrice: 11900,
    sampleMileage: 148000,
    source: 'VAG Official & ADAC Survey',
    sourceType: 'TECHNICAL',
    confidence: 0.96,
    isDemo: true,
    dataVersion: '5.0'
  },
  {
    id: 'peugeot-208-puretech',
    brand: GLOBAL_BRANDS[1], // Peugeot
    model: GLOBAL_MODELS[1], // 208
    generation: GLOBAL_GENERATIONS[1], // 208 I
    engine: GLOBAL_ENGINES[1], // 1.2 PureTech 110
    configuration: GLOBAL_VEHICLE_CONFIGURATIONS[1],
    marketConfigurations: [
      GLOBAL_MARKET_CONFIGURATIONS[3],
      GLOBAL_MARKET_CONFIGURATIONS[4]
    ],
    systems: (Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[]).map((sysId) => ({
      id: sysId,
      name: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].name,
      description: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].description,
      parts: GLOBAL_PARTS.filter((p) => p.systemId === sysId).map((p) => p.id),
      knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((kp) => kp.relatedSystems.includes(sysId)).map((kp) => kp.id),
      maintenance: sysId === 'ENGINE' ? ['maint-peug-wetbelt-check', 'maint-peug-oilservice'] : [],
      repairs: sysId === 'ENGINE' ? ['rep-peug-wetbelt-replacement'] : []
    })),
    parts: GLOBAL_PARTS.filter((p) => p.id === 'part-peug-wetbelt'),
    knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((p) => ['prob-peug-wetbelt', 'prob-peug-oil-consumption'].includes(p.id)),
    maintenance: GLOBAL_MAINTENANCE_ITEMS.filter((m) => m.engineId === 'eng-puretech-12-110'),
    repairs: GLOBAL_REPAIRS.filter((r) => r.id === 'rep-peug-wetbelt-replacement'),
    samplePrice: 7900,
    sampleMileage: 92000,
    source: 'PSA TSB & L\'Argus Reports',
    sourceType: 'TECHNICAL',
    confidence: 0.98,
    isDemo: true,
    dataVersion: '5.0'
  },
  {
    id: 'toyota-yaris-hybrid',
    brand: GLOBAL_BRANDS[2], // Toyota
    model: GLOBAL_MODELS[2], // Yaris
    generation: GLOBAL_GENERATIONS[2], // Yaris III
    engine: GLOBAL_ENGINES[2], // 1.0 VVT-i
    configuration: GLOBAL_VEHICLE_CONFIGURATIONS[2],
    marketConfigurations: [
      GLOBAL_MARKET_CONFIGURATIONS[5]
    ],
    systems: (Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[]).map((sysId) => ({
      id: sysId,
      name: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].name,
      description: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].description,
      parts: GLOBAL_PARTS.filter((p) => p.systemId === sysId).map((p) => p.id),
      knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((kp) => kp.relatedSystems.includes(sysId)).map((kp) => kp.id),
      maintenance: sysId === 'ENGINE' ? ['maint-toyota-fluids', 'maint-toyota-sparkplugs'] : [],
      repairs: sysId === 'TRANSMISSION' ? ['rep-toyota-clutch-replacement'] : []
    })),
    parts: GLOBAL_PARTS.filter((p) => p.id === 'part-toyota-clutchkit'),
    knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((p) => ['prob-toyota-clutch-wear', 'prob-toyota-waterpump-seep'].includes(p.id)),
    maintenance: GLOBAL_MAINTENANCE_ITEMS.filter((m) => m.engineId === 'eng-toyota-1krfe-10'),
    repairs: GLOBAL_REPAIRS.filter((r) => r.id === 'rep-toyota-clutch-replacement'),
    samplePrice: 9400,
    sampleMileage: 85000,
    source: 'Toyota Technical Archive & TÜV Survey',
    sourceType: 'TECHNICAL',
    confidence: 0.95,
    isDemo: true,
    dataVersion: '5.0'
  },
  {
    id: 'bmw-320d-f30',
    brand: GLOBAL_BRANDS[3], // BMW
    model: GLOBAL_MODELS[3], // Serie 3
    generation: GLOBAL_GENERATIONS[3], // F30
    engine: GLOBAL_ENGINES[3], // 2.0d TwinPower
    configuration: GLOBAL_VEHICLE_CONFIGURATIONS[3],
    marketConfigurations: [
      GLOBAL_MARKET_CONFIGURATIONS[6]
    ],
    systems: (Object.keys(STANDARD_VEHICLE_SYSTEMS_DEF) as StandardSystemType[]).map((sysId) => ({
      id: sysId,
      name: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].name,
      description: STANDARD_VEHICLE_SYSTEMS_DEF[sysId].description,
      parts: GLOBAL_PARTS.filter((p) => p.systemId === sysId).map((p) => p.id),
      knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((kp) => kp.relatedSystems.includes(sysId)).map((kp) => kp.id),
      maintenance: sysId === 'ENGINE' ? ['maint-bmw-oilservice', 'maint-bmw-transmission-fluid'] : [],
      repairs: sysId === 'ENGINE' ? ['rep-bmw-timingchain-replacement'] : []
    })),
    parts: GLOBAL_PARTS.filter((p) => ['part-bmw-timingchain-kit', 'part-bmw-egr-cooler'].includes(p.id)),
    knownProblems: GLOBAL_KNOWN_PROBLEMS.filter((p) => ['prob-bmw-timingchain-n47', 'prob-bmw-egr-cooler'].includes(p.id)),
    maintenance: GLOBAL_MAINTENANCE_ITEMS.filter((m) => m.engineId === 'eng-bmw-n47-b47-320d'),
    repairs: GLOBAL_REPAIRS.filter((r) => r.id === 'rep-bmw-timingchain-replacement'),
    samplePrice: 14200,
    sampleMileage: 165000,
    source: 'BMW AG Archive & DEKRA Index',
    sourceType: 'TECHNICAL',
    confidence: 0.97,
    isDemo: true,
    dataVersion: '5.0'
  }
];
