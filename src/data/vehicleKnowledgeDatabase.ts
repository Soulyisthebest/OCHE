import { Vehicle, VehicleSystem } from '../types/vehicleEngine';
import { SAMPLE_DEMO_CARS } from './sampleCars';
import { CAR_ZONES_3D } from './car3DData';

export const COMMON_VEHICLE_SYSTEMS: VehicleSystem[] = [
  { id: 'engine', name: 'Motor y Alimentación', description: 'Generación de potencia, admisión, turbo y distribución.', icon: 'Cpu' },
  { id: 'brakes', name: 'Frenos y Seguridad', description: 'Sistema hidráulico, pastillas, discos y módulo ABS.', icon: 'Disc' },
  { id: 'suspension', name: 'Suspensión y Dirección', description: 'Amortiguadores, muelles, rotulas y cremallera.', icon: 'Activity' },
  { id: 'transmission', name: 'Transmisión y Embrague', description: 'Caja de cambios, embrague, bimasa y palieres.', icon: 'Settings' },
  { id: 'battery_electronics', name: 'Batería y Electrónica', description: 'Sistemas eléctricos de 12V, sensores y módulos de control.', icon: 'Zap' },
  { id: 'tires_wheels', name: 'Neumáticos y Ruedas', description: 'Neumáticos, llantas y alineación.', icon: 'CircleDot' }
];

export const VEHICLE_KNOWLEDGE_BASE: Vehicle[] = [
  {
    id: 'golf-7-tdi',
    brand: 'Volkswagen',
    model: 'Golf',
    generation: 'Golf VII (5G1)',
    yearFrom: 2012,
    yearTo: 2019,
    fuel: 'Diésel',
    power: 150,
    transmission: 'Manual',
    subtitle: 'Año 2016 • 148.000 km • 150 CV • Diésel',
    thumbnail: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    askingPrice: 11900,
    mileage: 148000,
    engine: {
      id: 'eng-ea288-20tdi',
      name: '2.0 TDI BlueMotion',
      code: 'EA288',
      displacementCc: 1968,
      fuel: 'Diésel',
      powerHp: 150,
      cylinders: 4,
      turbo: true,
      knownIssues: [
        'Agarrotamiento prematuro de la bomba de agua en kit de distribución',
        'Saturación de filtro DPF si el uso es mayoritariamente urbano en trayectos cortos'
      ]
    },
    knownProblems: [
      {
        id: 'prob-vw-1',
        title: 'Bomba de agua del sistema de distribución',
        description: 'En el motor EA288 la bomba de agua puede agarrotarse o fugar pasado los 120.000 km. Conviene cambiarla en el kit de distribución.',
        severity: 'Alta',
        affectedComponent: 'Bomba de agua',
        estimatedCost: { min: 250, max: 450 }
      },
      {
        id: 'prob-vw-2',
        title: 'Saturación de Filtro Anti-partículas (DPF)',
        description: 'En trayectos exclusivamente urbanos no realiza regeneraciones automáticas correctamente.',
        severity: 'Media',
        affectedComponent: 'Filtro DPF',
        estimatedCost: { min: 150, max: 350 }
      }
    ],
    maintenance: [
      {
        id: 'maint-vw-1',
        title: 'Sustitución de Correa de Distribución y Bomba de Agua',
        intervalKm: 150000,
        intervalYears: 6,
        costEstimate: { min: 450, max: 700 },
        description: 'Mantenimiento preventivo clave para evitar daños mayores en válvulas.'
      },
      {
        id: 'maint-vw-2',
        title: 'Servicio Mantenimiento Periódico (Aceite 5W30 + Filtros)',
        intervalKm: 15000,
        intervalYears: 1,
        costEstimate: { min: 140, max: 220 },
        description: 'Protección de lubricación de turbo y motor.'
      }
    ],
    systems: COMMON_VEHICLE_SYSTEMS,
    parts: [
      {
        id: 'part-vw-timing',
        name: 'Kit Correa de Distribución con Bomba de Agua',
        system: 'engine',
        function: 'Sincroniza el movimiento de pistones y válvulas e impulsa el refrigerante.',
        commonSymptoms: ['Pérdida ligera de anticongelante', 'Chirrido en frío', 'Temperatura elevada'],
        knownProblems: [
          {
            id: 'kp-vw-pump',
            title: 'Agarrotamiento de polea de bomba de agua',
            description: 'Fallo común en la bomba de agua de origen del bloque EA288.',
            severity: 'Alta'
          }
        ],
        newPriceRange: { min: 180, max: 320 },
        usedPriceRange: { min: 0, max: 0 },
        laborCostRange: { min: 250, max: 450 },
        riskLevel: 'high'
      },
      {
        id: 'part-vw-tires',
        name: 'Juego de Neumáticos Delanteros 225/45 R17',
        system: 'tires_wheels',
        function: 'Agarre motriz y de frenado en el eje delantero.',
        commonSymptoms: ['Desgaste cercano al testigo legal', 'Mayor distancia de frenado en mojado'],
        knownProblems: [],
        newPriceRange: { min: 150, max: 220 },
        usedPriceRange: { min: 60, max: 90 },
        laborCostRange: { min: 30, max: 50 },
        riskLevel: 'medium'
      }
    ],
    repairs: [
      {
        id: 'rep-vw-1',
        title: 'Mantenimiento Inicial Completo (Aceite 5W30 + 4 Filtros)',
        description: 'Garantiza la lubricación e higiene del motor tras compra de ocasión.',
        partId: 'part-vw-maint',
        costEstimate: { min: 160, max: 240 },
        urgency: 'Alta'
      },
      {
        id: 'rep-vw-2',
        title: 'Sustitución de Neumáticos Delanteros',
        description: 'Remplazo preventivo por desgaste visual moderado en el dibujo.',
        partId: 'part-vw-tires',
        costEstimate: { min: 180, max: 270 },
        urgency: 'Media'
      }
    ],
    model3D: {
      id: '3d-golf-7',
      name: 'Volkswagen Golf VII 3D Explorer Map',
      zones: CAR_ZONES_3D.flatMap((z) =>
        z.parts.map((p) => ({
          id: p.id,
          name: p.name,
          zoneId: z.id,
          x: z.x,
          y: z.y,
          z: z.z,
          description: p.description
        }))
      )
    },
    sampleReport: SAMPLE_DEMO_CARS.find((c) => c.id === 'golf-7-tdi')?.report
  },
  {
    id: 'bmw-e46-320d',
    brand: 'BMW',
    model: 'Serie 3',
    generation: 'E46 Restyling',
    yearFrom: 2001,
    yearTo: 2005,
    fuel: 'Diésel',
    power: 150,
    transmission: 'Manual',
    subtitle: 'Año 2003 • 265.000 km • 150 CV • Diésel',
    thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    askingPrice: 3800,
    mileage: 265000,
    engine: {
      id: 'eng-m47n-20d',
      name: '2.0d M47N',
      code: 'M47N',
      displacementCc: 1995,
      fuel: 'Diésel',
      powerHp: 150,
      cylinders: 4,
      turbo: true,
      knownIssues: [
        'CRÍTICO: Palomillas metálicas de admisión propensas a desprenderse hacia el cilindro',
        'Holgura en silentblocks de trapecios delanteros',
        'Desgaste en flector de transmisión'
      ]
    },
    knownProblems: [
      {
        id: 'prob-bmw-1',
        title: 'Mariposas / Palomillas del colector de admisión',
        description: 'Las mariposas metálicas de serie pueden desprenderse rompiendo válvulas y pistones. Es imprescindible extirparlas o montar tapones de aluminio.',
        severity: 'Crítica',
        affectedComponent: 'Colector de admisión',
        estimatedCost: { min: 130, max: 210 }
      },
      {
        id: 'prob-bmw-2',
        title: 'Silentblocks de trapecios delanteros',
        description: 'Producen imprecisión en la dirección y vibraciones al frenar suavemente.',
        severity: 'Media',
        affectedComponent: 'Brazos de suspensión delanteros',
        estimatedCost: { min: 130, max: 210 }
      }
    ],
    maintenance: [
      {
        id: 'maint-bmw-1',
        title: 'Anulación de Palomillas de Admisión + Tapones de Aluminio',
        intervalKm: 0,
        costEstimate: { min: 130, max: 210 },
        description: 'Operación definitiva de prevención crítica.'
      }
    ],
    systems: COMMON_VEHICLE_SYSTEMS,
    parts: [
      {
        id: 'part-bmw-swirl-flaps',
        name: 'Kit de Tapones de Admisión (Anulación de Palomillas)',
        system: 'engine',
        function: 'Sustituye las mariposas metálicas de admisión por tapones estancos de aluminio.',
        commonSymptoms: ['Ninguno previo a la rotura (daño catastrófico súbito)'],
        knownProblems: [
          {
            id: 'kp-bmw-flaps',
            title: 'Desprendimiento de mariposa metálica',
            description: 'Destruye los cilindros y culata del motor.',
            severity: 'Crítica'
          }
        ],
        newPriceRange: { min: 30, max: 60 },
        usedPriceRange: { min: 0, max: 0 },
        laborCostRange: { min: 100, max: 150 },
        riskLevel: 'critical'
      },
      {
        id: 'part-bmw-bushings',
        name: 'Silentblocks de Trapecios Delanteros MEYLE HD',
        system: 'suspension',
        function: 'Absorbe vibraciones y fija los brazos de suspensión al chasis.',
        commonSymptoms: ['Vibración en volante al frenar', 'Holgura en dirección'],
        knownProblems: [],
        newPriceRange: { min: 70, max: 120 },
        usedPriceRange: { min: 30, max: 50 },
        laborCostRange: { min: 60, max: 90 },
        riskLevel: 'medium'
      }
    ],
    repairs: [
      {
        id: 'rep-bmw-1',
        title: 'Anulación Preventiva de Palomillas de Admisión',
        description: 'Elimina el riesgo histórico del motor M47N de 150CV.',
        partId: 'part-bmw-swirl-flaps',
        costEstimate: { min: 130, max: 210 },
        urgency: 'Alta'
      },
      {
        id: 'rep-bmw-2',
        title: 'Sustitución de Silentblocks Delanteros',
        description: 'Mejora la precisión de guiado del eje delantero.',
        partId: 'part-bmw-bushings',
        costEstimate: { min: 130, max: 210 },
        urgency: 'Media'
      }
    ],
    model3D: {
      id: '3d-bmw-e46',
      name: 'BMW Serie 3 E46 3D Explorer Map',
      zones: CAR_ZONES_3D.flatMap((z) =>
        z.parts.map((p) => ({
          id: p.id,
          name: p.name,
          zoneId: z.id,
          x: z.x,
          y: z.y,
          z: z.z,
          description: p.description
        }))
      )
    },
    sampleReport: SAMPLE_DEMO_CARS.find((c) => c.id === 'bmw-e46-320d')?.report
  },
  {
    id: 'peugeot-208-puretech',
    brand: 'Peugeot',
    model: '208',
    generation: 'I Restyling',
    yearFrom: 2015,
    yearTo: 2019,
    fuel: 'Gasolina',
    power: 82,
    transmission: 'Manual',
    subtitle: 'Año 2018 • 89.000 km • 82 CV • Gasolina',
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    askingPrice: 7900,
    mileage: 89000,
    engine: {
      id: 'eng-puretech-12-eb2',
      name: '1.2 PureTech VTi',
      code: 'EB2',
      displacementCc: 1199,
      fuel: 'Gasolina',
      powerHp: 82,
      cylinders: 3,
      turbo: false,
      knownIssues: [
        'CRÍTICO: Degrada la correa de distribución sumergida en aceite (correa húmeda)',
        'Residuos de goma en el cárter obstruyen la chupona de aceite'
      ]
    },
    knownProblems: [
      {
        id: 'prob-peug-1',
        title: 'Correa húmeda de distribución sumergida en aceite',
        description: 'La correa de goma va dentro del cárter en contacto con el aceite motor. Se degrada desprendiendo partículas que atascan la lubricación.',
        severity: 'Crítica',
        affectedComponent: 'Correa húmeda de distribución y bomba de aceite',
        estimatedCost: { min: 470, max: 750 }
      }
    ],
    maintenance: [
      {
        id: 'maint-peug-1',
        title: 'Sustitución Preventiva de Correa Húmeda + Limpieza de Cárter',
        intervalKm: 60000,
        intervalYears: 4,
        costEstimate: { min: 470, max: 750 },
        description: 'Obligatorio usar aceite especificado por PSA B71 2290/2312 y medir anchura de correa.'
      }
    ],
    systems: COMMON_VEHICLE_SYSTEMS,
    parts: [
      {
        id: 'part-peug-wet-belt',
        name: 'Kit de Distribución Húmeda + Junta Cárter',
        system: 'engine',
        function: 'Sincronización de motor sumergida en baño de aceite.',
        commonSymptoms: ['Testigo de presión de aceite encendido', 'Correa deshilachada vista por el tapón'],
        knownProblems: [
          {
            id: 'kp-peug-belt',
            title: 'Descomposición química de correa húmeda',
            description: 'Bloquea la bomba de aceite causando gripado de motor.',
            severity: 'Crítica'
          }
        ],
        newPriceRange: { min: 220, max: 350 },
        usedPriceRange: { min: 0, max: 0 },
        laborCostRange: { min: 250, max: 400 },
        riskLevel: 'critical'
      }
    ],
    repairs: [
      {
        id: 'rep-peug-1',
        title: 'Sustitución Correa Húmeda + Limpieza de Cárter',
        description: 'Prevención indispensable contra gripado por falta de presión de aceite.',
        partId: 'part-peug-wet-belt',
        costEstimate: { min: 470, max: 750 },
        urgency: 'Alta'
      }
    ],
    model3D: {
      id: '3d-peugeot-208',
      name: 'Peugeot 208 3D Explorer Map',
      zones: CAR_ZONES_3D.flatMap((z) =>
        z.parts.map((p) => ({
          id: p.id,
          name: p.name,
          zoneId: z.id,
          x: z.x,
          y: z.y,
          z: z.z,
          description: p.description
        }))
      )
    },
    sampleReport: SAMPLE_DEMO_CARS.find((c) => c.id === 'peugeot-208-puretech')?.report
  },
  {
    id: 'toyota-yaris-10',
    brand: 'Toyota',
    model: 'Yaris',
    generation: 'XP130',
    yearFrom: 2011,
    yearTo: 2020,
    fuel: 'Gasolina',
    power: 69,
    transmission: 'Manual',
    subtitle: 'Año 2015 • 112.000 km • 69 CV • Gasolina',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    askingPrice: 6500,
    mileage: 112000,
    engine: {
      id: 'eng-1kr-fe-10',
      name: '1.0 VVT-i',
      code: '1KR-FE',
      displacementCc: 998,
      fuel: 'Gasolina',
      powerHp: 69,
      cylinders: 3,
      turbo: false,
      knownIssues: [
        'Muy escasos problemas conocidos. Cadena de distribución libre de mantenimiento.'
      ]
    },
    knownProblems: [
      {
        id: 'prob-toy-1',
        title: 'Desgaste habitual por antigüedad en accesorios',
        description: 'Motor atmosférico japonés de altísima fiabilidad urbana.',
        severity: 'Baja',
        affectedComponent: 'Bujías y filtros',
        estimatedCost: { min: 80, max: 150 }
      }
    ],
    maintenance: [
      {
        id: 'maint-toy-1',
        title: 'Servicio Mantenimiento Aceite 0W20 + Filtros',
        intervalKm: 15000,
        intervalYears: 1,
        costEstimate: { min: 100, max: 160 },
        description: 'Mantenimiento preventivo ordinario.'
      }
    ],
    systems: COMMON_VEHICLE_SYSTEMS,
    parts: [
      {
        id: 'part-toy-sparkplugs',
        name: 'Juego de Bujías y Aceite Motor 0W20',
        system: 'engine',
        function: 'Suministra la chispa de encendido y lubricación ultrasuave.',
        commonSymptoms: ['Ligero tironeo al ralentí si las bujías están muy desgastadas'],
        knownProblems: [],
        newPriceRange: { min: 70, max: 110 },
        usedPriceRange: { min: 0, max: 0 },
        laborCostRange: { min: 30, max: 50 },
        riskLevel: 'low'
      }
    ],
    repairs: [
      {
        id: 'rep-toy-1',
        title: 'Cambio de Aceite 0W20 y Filtro de Aceite',
        description: 'Mantenimiento periódico rutinario.',
        partId: 'part-toy-sparkplugs',
        costEstimate: { min: 100, max: 160 },
        urgency: 'Baja'
      }
    ],
    model3D: {
      id: '3d-toyota-yaris',
      name: 'Toyota Yaris 3D Explorer Map',
      zones: CAR_ZONES_3D.flatMap((z) =>
        z.parts.map((p) => ({
          id: p.id,
          name: p.name,
          zoneId: z.id,
          x: z.x,
          y: z.y,
          z: z.z,
          description: p.description
        }))
      )
    },
    sampleReport: SAMPLE_DEMO_CARS.find((c) => c.id === 'toyota-yaris-10')?.report
  }
];
