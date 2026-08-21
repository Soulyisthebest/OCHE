/**
 * OCHE / CARCHECK AI — 3D Models & Knowledge Data Layer (FASE 7)
 * Interactive vector / mesh models, camera configurations, part mappings,
 * symptoms ontology, inspection guidelines, and licensing metadata.
 */

import { Car3DModel, CameraPreset, SymptomCandidate, InspectionGuide } from '../types/vehicle3D';

// ==========================================
// 1. CAMERA PRESETS
// ==========================================
export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'FULL_CAR',
    name: 'Vista Completa',
    description: 'Encuadre general 360º del vehículo completo.',
    position: { x: 0, y: 1.2, z: 4.5 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.0,
    rotationAngle: 0
  },
  {
    id: 'ENGINE',
    name: 'Vano Motor',
    description: 'Enfoque directo sobre el grupo propulsor, admisión y refrigeración.',
    position: { x: -1.2, y: 0.9, z: 2.0 },
    target: { x: -0.5, y: 0.3, z: 1.2 },
    zoom: 1.35,
    rotationAngle: 325
  },
  {
    id: 'FRONT',
    name: 'Frontal',
    description: 'Perspectiva delantera: ópticas, paragolpes, radiador e intercooler.',
    position: { x: 0, y: 0.5, z: 3.5 },
    target: { x: 0, y: 0, z: 2.0 },
    zoom: 1.2,
    rotationAngle: 0
  },
  {
    id: 'SIDE',
    name: 'Lateral / Ruedas',
    description: 'Perfil lateral: suspensión delantera/trasera, frenos, neumáticos y puertas.',
    position: { x: 3.5, y: 0.5, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.1,
    rotationAngle: 90
  },
  {
    id: 'REAR',
    name: 'Zaga / Escape',
    description: 'Perspectiva posterior: escape, DPF, silencioso, pilotos y maletero.',
    position: { x: 0, y: 0.6, z: -3.5 },
    target: { x: 0, y: 0, z: -2.0 },
    zoom: 1.2,
    rotationAngle: 180
  },
  {
    id: 'UNDERBODY',
    name: 'Bajos y Chasis',
    description: 'Vista inferior: cárter, línea de escape, palieres, transmisión y silentblocks.',
    position: { x: 0, y: -1.8, z: 2.2 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.25,
    rotationAngle: 45
  },
  {
    id: 'INTERIOR',
    name: 'Habitáculo',
    description: 'Vista interior: salpicadero, climatización, cuadro de instrumentos y pedales.',
    position: { x: 0, y: 0.4, z: 0.5 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.3,
    rotationAngle: 0
  }
];

// ==========================================
// 2. CANONICAL 3D VEHICLE MODELS
// ==========================================
export const CANONICAL_3D_MODELS: Car3DModel[] = [
  {
    id: 'model-3d-golf-ea288',
    vehicleConfigurationId: 'vconfig-golf7-20tdi',
    modelName: 'Volkswagen Golf VII 2.0 TDI (EA288)',
    make: 'Volkswagen',
    model: 'Golf VII',
    engine: '2.0 TDI',
    generation: 'VII (5G)',
    yearStart: 2012,
    yearEnd: 2020,
    modelType: 'INTERACTIVE_VECTOR',
    assetPath: '/assets/3d/golf7_ea288.svg',
    format: 'vector/json',
    scale: 1.0,
    rotation: 0,
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45
    },
    zones: [
      {
        id: 'zone-engine-golf',
        name: 'Vano Motor y Propulsión',
        summary: 'Bloque motor 2.0 TDI EA288, turbo de geometría variable y distribución.',
        color: '#ef4444',
        icon: 'Cpu',
        cameraPreset: 'ENGINE',
        hotspotPosition: { x: 28, y: 36, z: 1.2 },
        systemIds: ['ENGINE', 'COOLING', 'ELECTRICAL', 'FUEL'],
        partIds: ['part-vw-timingkit', 'part-vw-waterpump', 'part-gen-turbo', 'part-gen-alternator', 'part-gen-battery', 'part-gen-egr']
      },
      {
        id: 'zone-brakes-golf',
        name: 'Frenos y Seguridad',
        summary: 'Discos ventilados delanteros 288mm, pinzas monopistón y bomba ABS/ESP.',
        color: '#f59e0b',
        icon: 'Disc',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 30, y: 64, z: 0.8 },
        systemIds: ['BRAKES', 'SAFETY'],
        partIds: ['part-gen-brakediscs', 'part-gen-abspump', 'part-gen-brakepads']
      },
      {
        id: 'zone-transmission-golf',
        name: 'Transmisión y Embrague',
        summary: 'Volante bimasa y caja de cambios manual de 6 velocidades / DSG.',
        color: '#8b5cf6',
        icon: 'Settings',
        cameraPreset: 'UNDERBODY',
        hotspotPosition: { x: 42, y: 50, z: 0 },
        systemIds: ['TRANSMISSION', 'DRIVETRAIN'],
        partIds: ['part-gen-flywheel', 'part-gen-clutch', 'part-gen-driveshaft']
      },
      {
        id: 'zone-suspension-golf',
        name: 'Suspensión y Dirección',
        summary: 'Eje delantero tipo McPherson y eje trasero multibrazo independiente.',
        color: '#06b6d4',
        icon: 'Activity',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 70, y: 62, z: -0.5 },
        systemIds: ['SUSPENSION', 'STEERING', 'TYRES'],
        partIds: ['part-gen-shockabsorber', 'part-gen-controlarm', 'part-gen-tyres']
      },
      {
        id: 'zone-exhaust-golf',
        name: 'Emisiones y Escape',
        summary: 'Filtro antipartículas DPF, catalizador SCR y tramo de escape.',
        color: '#10b981',
        icon: 'Zap',
        cameraPreset: 'REAR',
        hotspotPosition: { x: 78, y: 44, z: -1.8 },
        systemIds: ['EMISSIONS', 'EXHAUST'],
        partIds: ['part-vw-dpf', 'part-gen-catalytic', 'part-gen-exhaustmuffler']
      },
      {
        id: 'zone-interior-golf',
        name: 'Habitáculo y Climatización',
        summary: 'Compresor de A/C, radiador de calefacción y electrónica interior.',
        color: '#ec4899',
        icon: 'Compass',
        cameraPreset: 'INTERIOR',
        hotspotPosition: { x: 50, y: 34, z: 0.2 },
        systemIds: ['AIR_CONDITIONING', 'INTERIOR', 'ELECTRICAL'],
        partIds: ['part-gen-accompressor', 'part-gen-cabinfilter']
      }
    ],
    parts: [
      {
        id: 'p3d-golf-timingkit',
        partId: 'part-vw-timingkit',
        name: 'Kit de Distribución + Bomba de Agua (EA288)',
        systemId: 'ENGINE',
        modelNodeId: 'node_engine_timing',
        position: { x: 26, y: 34, z: 0.8 },
        hotspot: { x: 26, y: 34, label: 'Distribución' },
        description: 'Sincroniza cigüeñal y árboles de levas. La bomba de agua con camisa móvil tiende a fugar.',
        interactable: true,
        zoneId: 'zone-engine-golf',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-golf-turbo',
        partId: 'part-gen-turbo',
        name: 'Turbocompresor de Geometría Variable',
        systemId: 'ENGINE',
        modelNodeId: 'node_engine_turbo',
        position: { x: 22, y: 42, z: 0.5 },
        hotspot: { x: 22, y: 42, label: 'Turbo VGT' },
        description: 'Comprime el aire de admisión aprovechando los gases de escape. Geometría propensa a carbonilla.',
        interactable: true,
        zoneId: 'zone-engine-golf',
        importance: 'HIGH'
      },
      {
        id: 'p3d-golf-dpf',
        partId: 'part-vw-dpf',
        name: 'Filtro de Partículas Diésel (DPF SiC)',
        systemId: 'EMISSIONS',
        modelNodeId: 'node_exhaust_dpf',
        position: { x: 74, y: 44, z: -1.2 },
        hotspot: { x: 74, y: 44, label: 'Filtro DPF' },
        description: 'Retiene partículas de hollín. En uso urbano prolongado puede saturarse sin regenerar.',
        interactable: true,
        zoneId: 'zone-exhaust-golf',
        importance: 'HIGH'
      },
      {
        id: 'p3d-golf-flywheel',
        partId: 'part-gen-flywheel',
        name: 'Volante Motor Bimasa (Dual-Mass)',
        systemId: 'TRANSMISSION',
        modelNodeId: 'node_trans_flywheel',
        position: { x: 38, y: 48, z: 0.1 },
        hotspot: { x: 38, y: 48, label: 'Volante Bimasa' },
        description: 'Amortigua las vibraciones torsionales del diésel. Si tiene holgura, produce traqueteo al ralentí.',
        interactable: true,
        zoneId: 'zone-transmission-golf',
        importance: 'HIGH'
      },
      {
        id: 'p3d-golf-brakes-front',
        partId: 'part-gen-brakediscs',
        name: 'Discos y Pastillas de Freno Delanteros',
        systemId: 'BRAKES',
        modelNodeId: 'node_brakes_front',
        position: { x: 28, y: 64, z: 0.9 },
        hotspot: { x: 28, y: 64, label: 'Frenos Delanteros' },
        description: 'Discos ventilados 288mm. Desgaste visual directo en pastillas y reborde perimetral del disco.',
        interactable: true,
        zoneId: 'zone-brakes-golf',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-golf-shocks',
        partId: 'part-gen-shockabsorber',
        name: 'Amortiguadores y Copelas Delanteras',
        systemId: 'SUSPENSION',
        modelNodeId: 'node_susp_shocks',
        position: { x: 32, y: 56, z: 0.9 },
        hotspot: { x: 32, y: 56, label: 'Amortiguadores' },
        description: 'Absorben oscilaciones del asfalto. Fugas de aceite en vástago indican sustitución por parejas.',
        interactable: true,
        zoneId: 'zone-suspension-golf',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-golf-alternator',
        partId: 'part-gen-alternator',
        name: 'Alternador Inteligente (Start-Stop)',
        systemId: 'ELECTRICAL',
        modelNodeId: 'node_engine_alternator',
        position: { x: 20, y: 30, z: 0.7 },
        hotspot: { x: 20, y: 30, label: 'Alternador' },
        description: 'Genera electricidad para cargar la batería AGM/EFB y abastecer los módulos de control.',
        interactable: true,
        zoneId: 'zone-engine-golf',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-golf-accompressor',
        partId: 'part-gen-accompressor',
        name: 'Compresor de Aire Acondicionado',
        systemId: 'AIR_CONDITIONING',
        modelNodeId: 'node_ac_compressor',
        position: { x: 48, y: 36, z: 0.3 },
        hotspot: { x: 48, y: 36, label: 'Compresor A/C' },
        description: 'Presuriza el gas refrigerante R1234yf para enfriar el habitáculo.',
        interactable: true,
        zoneId: 'zone-interior-golf',
        importance: 'LOW'
      }
    ],
    metadata: {
      chassisCode: 'MQB',
      engineFamily: 'EA288',
      segment: 'C'
    },
    isDemo: false,
    license: 'CC-BY-4.0 / OCHE Open Automotive Knowledge Architecture',
    source: 'OCHE Automotive Engineering Core Reference Models',
    author: 'OCHE Technical Team',
    attribution: 'OCHE / CARCHECK AI Interactive 3D Schema',
    usageRights: 'Free educational, diagnostic and commercial use within OCHE runtime.'
  },
  {
    id: 'model-3d-peugeot-puretech',
    vehicleConfigurationId: 'vconfig-peugeot208-puretech',
    modelName: 'Peugeot 208 1.2 PureTech (EB2)',
    make: 'Peugeot',
    model: '208',
    engine: '1.2 PureTech',
    generation: 'I / II',
    yearStart: 2015,
    yearEnd: 2023,
    modelType: 'INTERACTIVE_VECTOR',
    assetPath: '/assets/3d/peugeot208_puretech.svg',
    format: 'vector/json',
    scale: 1.0,
    rotation: 0,
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45
    },
    zones: [
      {
        id: 'zone-engine-peug',
        name: 'Vano Motor PureTech',
        summary: 'Motor 3 cilindros turbo 1.2 PureTech EB2DT con distribución sumergida en aceite.',
        color: '#ef4444',
        icon: 'Cpu',
        cameraPreset: 'ENGINE',
        hotspotPosition: { x: 26, y: 36, z: 1.1 },
        systemIds: ['ENGINE', 'COOLING', 'ELECTRICAL', 'FUEL'],
        partIds: ['part-peug-wetbelt', 'part-peug-oilpump-strainer', 'part-gen-turbo', 'part-gen-sparkplugs']
      },
      {
        id: 'zone-brakes-peug',
        name: 'Frenos y Depresor',
        summary: 'Bomba depresora de freno accionada por árbol de levas y discos delanteros.',
        color: '#f59e0b',
        icon: 'Disc',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 28, y: 64, z: 0.8 },
        systemIds: ['BRAKES', 'SAFETY'],
        partIds: ['part-gen-brakediscs', 'part-gen-vacuumpump']
      },
      {
        id: 'zone-exhaust-peug',
        name: 'Emisiones y Catalizador',
        summary: 'Catalizador de tres vías y filtro de partículas de gasolina (GPF).',
        color: '#10b981',
        icon: 'Zap',
        cameraPreset: 'REAR',
        hotspotPosition: { x: 76, y: 44, z: -1.6 },
        systemIds: ['EMISSIONS', 'EXHAUST'],
        partIds: ['part-gen-catalytic', 'part-gen-lambda-sensor']
      }
    ],
    parts: [
      {
        id: 'p3d-peug-wetbelt',
        partId: 'part-peug-wetbelt',
        name: 'Correa de Distribución Sumergida (Wet Belt)',
        systemId: 'ENGINE',
        modelNodeId: 'node_peug_wetbelt',
        position: { x: 26, y: 34, z: 0.9 },
        hotspot: { x: 26, y: 34, label: 'Correa Húmeda' },
        description: 'Correa en baño de aceite. Crítico medir anchura con galga por desprendimiento de goma.',
        interactable: true,
        zoneId: 'zone-engine-peug',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-peug-strainer',
        partId: 'part-peug-oilpump-strainer',
        name: 'Tamiz / Chupona de Bomba de Aceite',
        systemId: 'ENGINE',
        modelNodeId: 'node_peug_strainer',
        position: { x: 28, y: 46, z: 0.3 },
        hotspot: { x: 28, y: 46, label: 'Chupona Aceite' },
        description: 'Filtra residuos antes de la bomba. Se tapona si la correa de distribución se disgrega.',
        interactable: true,
        zoneId: 'zone-engine-peug',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-peug-turbo',
        partId: 'part-gen-turbo',
        name: 'Turbocompresor Wastegate (1.2 PureTech)',
        systemId: 'ENGINE',
        modelNodeId: 'node_peug_turbo',
        position: { x: 22, y: 40, z: 0.6 },
        hotspot: { x: 22, y: 40, label: 'Turbo' },
        description: 'Turbo de respuesta rápida con refrigeración por agua y aceite.',
        interactable: true,
        zoneId: 'zone-engine-peug',
        importance: 'HIGH'
      },
      {
        id: 'p3d-peug-catalytic',
        partId: 'part-gen-catalytic',
        name: 'Catalizador & GPF PureTech',
        systemId: 'EXHAUST',
        modelNodeId: 'node_peug_catalytic',
        position: { x: 74, y: 44, z: -1.2 },
        hotspot: { x: 74, y: 44, label: 'Catalizador' },
        description: 'Reduce emisiones NOx y partículas finas. Se satura si hay consumo excesivo de aceite.',
        interactable: true,
        zoneId: 'zone-exhaust-peug',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-peug-brakes',
        partId: 'part-gen-brakediscs',
        name: 'Discos de Freno Delanteros Ventilados',
        systemId: 'BRAKES',
        modelNodeId: 'node_peug_brakes',
        position: { x: 30, y: 64, z: 0.8 },
        hotspot: { x: 30, y: 64, label: 'Frenos Del.' },
        description: 'Discos ventilados de 266mm con pinzas flotantes de un pistón.',
        interactable: true,
        zoneId: 'zone-brakes-peug',
        importance: 'HIGH'
      }
    ],
    metadata: {
      engineFamily: 'EB2DT / PureTech 110',
      chassisCode: 'CMP / PF1'
    },
    isDemo: false,
    license: 'CC-BY-4.0',
    source: 'OCHE Automotive Engineering Core',
    author: 'OCHE Technical Team'
  },
  {
    id: 'model-3d-toyota-yaris',
    vehicleConfigurationId: 'vconfig-toyota-yaris-10',
    modelName: 'Toyota Yaris 1.0 VVT-i (1KR-FE)',
    make: 'Toyota',
    model: 'Yaris',
    engine: '1.0 VVT-i',
    generation: 'III (XP130)',
    yearStart: 2011,
    yearEnd: 2020,
    modelType: 'INTERACTIVE_VECTOR',
    assetPath: '/assets/3d/toyota_yaris_xp130.svg',
    format: 'vector/json',
    scale: 1.0,
    rotation: 0,
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45
    },
    zones: [
      {
        id: 'zone-engine-toyota',
        name: 'Vano Motor 1KR-FE',
        summary: 'Motor atmosférico tricilíndrico 1.0 VVT-i con cadena de distribución de alta fiabilidad.',
        color: '#ef4444',
        icon: 'Cpu',
        cameraPreset: 'ENGINE',
        hotspotPosition: { x: 26, y: 36, z: 1.0 },
        systemIds: ['ENGINE', 'COOLING', 'ELECTRICAL', 'FUEL'],
        partIds: ['part-toyota-clutchkit', 'part-gen-waterpump', 'part-gen-alternator', 'part-gen-battery']
      },
      {
        id: 'zone-trans-toyota',
        name: 'Embrague y Cambio Manual',
        summary: 'Conjunto monodisco de embrague de accionamiento mecánico y caja C551 de 5 velocidades.',
        color: '#8b5cf6',
        icon: 'Settings',
        cameraPreset: 'UNDERBODY',
        hotspotPosition: { x: 38, y: 48, z: 0.1 },
        systemIds: ['TRANSMISSION', 'DRIVETRAIN'],
        partIds: ['part-toyota-clutchkit', 'part-gen-driveshaft']
      },
      {
        id: 'zone-brakes-toyota',
        name: 'Frenos y Suspensión Delantera',
        summary: 'Discos macizos/ventilados delanteros, zapatas traseras y conjunto amortiguador.',
        color: '#f59e0b',
        icon: 'Disc',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 28, y: 64, z: 0.8 },
        systemIds: ['BRAKES', 'SUSPENSION'],
        partIds: ['part-gen-brakediscs', 'part-gen-shockabsorber']
      }
    ],
    parts: [
      {
        id: 'p3d-toyota-clutch',
        partId: 'part-toyota-clutchkit',
        name: 'Kit de Embrague Monodisco (1.0 VVT-i)',
        systemId: 'TRANSMISSION',
        modelNodeId: 'node_toyota_clutch',
        position: { x: 38, y: 48, z: 0.1 },
        hotspot: { x: 38, y: 48, label: 'Embrague' },
        description: 'Transmite la potencia a la caja manual. En uso intensivo de ciudad el disco sufre desgaste prematuro.',
        interactable: true,
        zoneId: 'zone-trans-toyota',
        importance: 'HIGH'
      },
      {
        id: 'p3d-toyota-waterpump',
        partId: 'part-gen-waterpump',
        name: 'Bomba de Agua (1KR-FE)',
        systemId: 'COOLING',
        modelNodeId: 'node_toyota_waterpump',
        position: { x: 24, y: 38, z: 0.7 },
        hotspot: { x: 24, y: 38, label: 'Bomba Agua' },
        description: 'Accionada por correa auxiliar. Tiende a rezumar refrigerante rosado por el prensaestopas pasados los 90.000 km.',
        interactable: true,
        zoneId: 'zone-engine-toyota',
        importance: 'HIGH'
      },
      {
        id: 'p3d-toyota-brakes',
        partId: 'part-gen-brakediscs',
        name: 'Discos y Pastillas de Freno Delanteros',
        systemId: 'BRAKES',
        modelNodeId: 'node_toyota_brakes',
        position: { x: 28, y: 64, z: 0.8 },
        hotspot: { x: 28, y: 64, label: 'Frenos' },
        description: 'Frenos delanteros con mordazas flotantes y mantenimiento económico.',
        interactable: true,
        zoneId: 'zone-brakes-toyota',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-toyota-shocks',
        partId: 'part-gen-shockabsorber',
        name: 'Amortiguadores Delanteros MacPherson',
        systemId: 'SUSPENSION',
        modelNodeId: 'node_toyota_shocks',
        position: { x: 30, y: 56, z: 0.9 },
        hotspot: { x: 30, y: 56, label: 'Amortiguadores' },
        description: 'Columna MacPherson delantera para estabilidad y absorción urbana.',
        interactable: true,
        zoneId: 'zone-brakes-toyota',
        importance: 'MEDIUM'
      }
    ],
    metadata: {
      engineFamily: '1KR-FE',
      chassisCode: 'XP130'
    },
    isDemo: false,
    license: 'CC-BY-4.0',
    source: 'OCHE Automotive Engineering Core',
    author: 'OCHE Technical Team'
  },
  {
    id: 'model-3d-bmw-f30',
    vehicleConfigurationId: 'vconfig-bmw-320d-f30',
    modelName: 'BMW 320d (F30 N47/B47)',
    make: 'BMW',
    model: 'Serie 3',
    engine: '2.0d TwinPower',
    generation: 'F30',
    yearStart: 2012,
    yearEnd: 2019,
    modelType: 'INTERACTIVE_VECTOR',
    assetPath: '/assets/3d/bmw_320d_f30.svg',
    format: 'vector/json',
    scale: 1.0,
    rotation: 0,
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45
    },
    zones: [
      {
        id: 'zone-engine-bmw',
        name: 'Motor Longitudinal y Cadena Trasera',
        summary: 'Bloque diésel 2.0 TwinPower longitudinal con distribución por cadena montada en la parte trasera del motor.',
        color: '#ef4444',
        icon: 'Cpu',
        cameraPreset: 'ENGINE',
        hotspotPosition: { x: 28, y: 36, z: 1.2 },
        systemIds: ['ENGINE', 'COOLING', 'FUEL', 'ELECTRICAL'],
        partIds: ['part-bmw-timingchain-kit', 'part-bmw-egr-cooler', 'part-gen-turbo']
      },
      {
        id: 'zone-exhaust-bmw',
        name: 'Refrigerador EGR y Emisiones',
        summary: 'Módulo enfriador de recirculación de gases de escape EGR (objeto de campaña técnica oficial BMW).',
        color: '#10b981',
        icon: 'Zap',
        cameraPreset: 'REAR',
        hotspotPosition: { x: 74, y: 44, z: -1.2 },
        systemIds: ['EMISSIONS', 'EXHAUST'],
        partIds: ['part-bmw-egr-cooler', 'part-vw-dpf']
      },
      {
        id: 'zone-drivetrain-bmw',
        name: 'Propulsión Trasera y Transmisión',
        summary: 'Caja automática ZF8HP / manual 6v con árbol de transmisión y diferencial trasero.',
        color: '#8b5cf6',
        icon: 'Settings',
        cameraPreset: 'UNDERBODY',
        hotspotPosition: { x: 45, y: 52, z: 0 },
        systemIds: ['TRANSMISSION', 'DRIVETRAIN'],
        partIds: ['part-gen-flywheel', 'part-gen-driveshaft']
      }
    ],
    parts: [
      {
        id: 'p3d-bmw-timingchain',
        partId: 'part-bmw-timingchain-kit',
        name: 'Kit de Cadena de Distribución Trasera (N47/B47)',
        systemId: 'ENGINE',
        modelNodeId: 'node_bmw_timingchain',
        position: { x: 26, y: 34, z: 0.8 },
        hotspot: { x: 26, y: 34, label: 'Cadena Distribución' },
        description: 'Cadena de distribución montada en el lado del volante motor. En N47 es crítico comprobar ruido de roce/siseo.',
        interactable: true,
        zoneId: 'zone-engine-bmw',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-bmw-egr-cooler',
        partId: 'part-bmw-egr-cooler',
        name: 'Módulo Enfriador de Válvula EGR',
        systemId: 'EMISSIONS',
        modelNodeId: 'node_bmw_egrcooler',
        position: { x: 30, y: 40, z: 0.6 },
        hotspot: { x: 30, y: 40, label: 'Enfriador EGR' },
        description: 'Enfría los gases de escape recirculados. Sujeto a campaña de revisión por riesgo de fuga interna de anticongelante.',
        interactable: true,
        zoneId: 'zone-exhaust-bmw',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-bmw-turbo',
        partId: 'part-gen-turbo',
        name: 'Turbocompresor TwinPower Turbo',
        systemId: 'ENGINE',
        modelNodeId: 'node_bmw_turbo',
        position: { x: 22, y: 42, z: 0.5 },
        hotspot: { x: 22, y: 42, label: 'Turbo VGT' },
        description: 'Turbocompresor con actuador electrónico de geometría variable.',
        interactable: true,
        zoneId: 'zone-engine-bmw',
        importance: 'HIGH'
      },
      {
        id: 'p3d-bmw-driveshaft',
        partId: 'part-gen-driveshaft',
        name: 'Árbol de Transmisión y Flector de Cardán',
        systemId: 'DRIVETRAIN',
        modelNodeId: 'node_bmw_driveshaft',
        position: { x: 45, y: 52, z: 0 },
        hotspot: { x: 45, y: 52, label: 'Transmisión RWD' },
        description: 'Transmite el par al eje posterior con flectores elásticos antivibración.',
        interactable: true,
        zoneId: 'zone-drivetrain-bmw',
        importance: 'MEDIUM'
      }
    ],
    metadata: {
      engineFamily: 'N47D20 / B47D20',
      chassisCode: 'F30'
    },
    isDemo: false,
    license: 'CC-BY-4.0',
    source: 'OCHE Automotive Engineering Core',
    author: 'OCHE Technical Team'
  },
  {
    id: 'model-3d-generic-car',
    vehicleConfigurationId: 'vconfig-generic-car',
    modelName: 'Vehículo Estándar Universal (Arquitectura Multi-Sistema)',
    make: 'Genérico',
    model: 'Turismo Universal',
    engine: 'Multi-Propulsión',
    generation: 'Universal',
    yearStart: 2010,
    yearEnd: 2026,
    modelType: 'INTERACTIVE_VECTOR',
    assetPath: '/assets/3d/generic_car.svg',
    format: 'vector/json',
    scale: 1.0,
    rotation: 0,
    camera: {
      position: { x: 0, y: 1.2, z: 4.5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 45
    },
    zones: [
      {
        id: 'zone-gen-engine',
        name: 'Motor y Grupo Propulsor',
        summary: 'Corazón mecánico: bloque motor, lubricación, encendido y distribución.',
        color: '#ef4444',
        icon: 'Cpu',
        cameraPreset: 'ENGINE',
        hotspotPosition: { x: 24, y: 36, z: 1.0 },
        systemIds: ['ENGINE', 'COOLING', 'FUEL', 'ELECTRICAL'],
        partIds: ['part-gen-timingbelt', 'part-gen-waterpump', 'part-gen-turbo', 'part-gen-alternator', 'part-gen-battery']
      },
      {
        id: 'zone-gen-brakes',
        name: 'Frenos y Seguridad Activa',
        summary: 'Circuito hidráulico, discos, pastillas y módulo ABS/ESP.',
        color: '#f59e0b',
        icon: 'Disc',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 28, y: 64, z: 0.8 },
        systemIds: ['BRAKES', 'SAFETY'],
        partIds: ['part-gen-brakediscs', 'part-gen-brakepads', 'part-gen-abspump']
      },
      {
        id: 'zone-gen-transmission',
        name: 'Caja de Cambios y Transmisión',
        summary: 'Embrague, caja de cambios manual/automática y palieres.',
        color: '#8b5cf6',
        icon: 'Settings',
        cameraPreset: 'UNDERBODY',
        hotspotPosition: { x: 42, y: 50, z: 0.1 },
        systemIds: ['TRANSMISSION', 'DRIVETRAIN'],
        partIds: ['part-gen-clutch', 'part-gen-flywheel', 'part-gen-driveshaft']
      },
      {
        id: 'zone-gen-suspension',
        name: 'Suspensión y Dirección',
        summary: 'Amortiguadores, muelles, silentblocks, rótulas y cremallera.',
        color: '#06b6d4',
        icon: 'Activity',
        cameraPreset: 'SIDE',
        hotspotPosition: { x: 68, y: 62, z: -0.6 },
        systemIds: ['SUSPENSION', 'STEERING', 'TYRES'],
        partIds: ['part-gen-shockabsorber', 'part-gen-controlarm', 'part-gen-tyres']
      },
      {
        id: 'zone-gen-exhaust',
        name: 'Escape y Tratamiento de Gases',
        summary: 'Colector de escape, catalizador, filtro DPF/GPF y silencioso.',
        color: '#10b981',
        icon: 'Zap',
        cameraPreset: 'REAR',
        hotspotPosition: { x: 78, y: 44, z: -1.6 },
        systemIds: ['EXHAUST', 'EMISSIONS'],
        partIds: ['part-gen-catalytic', 'part-gen-exhaustmuffler', 'part-vw-dpf']
      },
      {
        id: 'zone-gen-interior',
        name: 'Habitáculo y Clima',
        summary: 'Compresor de aire acondicionado, calefacción y electrónica interior.',
        color: '#ec4899',
        icon: 'Compass',
        cameraPreset: 'INTERIOR',
        hotspotPosition: { x: 50, y: 34, z: 0.2 },
        systemIds: ['AIR_CONDITIONING', 'INTERIOR', 'ELECTRICAL'],
        partIds: ['part-gen-accompressor', 'part-gen-cabinfilter']
      }
    ],
    parts: [
      {
        id: 'p3d-gen-timingbelt',
        partId: 'part-gen-timingbelt',
        name: 'Correa / Cadena de Distribución',
        systemId: 'ENGINE',
        modelNodeId: 'node_gen_timing',
        position: { x: 26, y: 34, z: 0.8 },
        hotspot: { x: 26, y: 34, label: 'Distribución' },
        description: 'Sincroniza el giro del cigüeñal con los árboles de levas.',
        interactable: true,
        zoneId: 'zone-gen-engine',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-gen-waterpump',
        partId: 'part-gen-waterpump',
        name: 'Bomba de Agua y Termostato',
        systemId: 'COOLING',
        modelNodeId: 'node_gen_waterpump',
        position: { x: 24, y: 38, z: 0.7 },
        hotspot: { x: 24, y: 38, label: 'Bomba Agua' },
        description: 'Circula el refrigerante para mantener la temperatura del motor a 90°C.',
        interactable: true,
        zoneId: 'zone-gen-engine',
        importance: 'HIGH'
      },
      {
        id: 'p3d-gen-turbo',
        partId: 'part-gen-turbo',
        name: 'Turbocompresor',
        systemId: 'ENGINE',
        modelNodeId: 'node_gen_turbo',
        position: { x: 20, y: 42, z: 0.5 },
        hotspot: { x: 20, y: 42, label: 'Turbo' },
        description: 'Aprovecha los gases de escape para insuflar aire comprimido al motor.',
        interactable: true,
        zoneId: 'zone-gen-engine',
        importance: 'HIGH'
      },
      {
        id: 'p3d-gen-brakediscs',
        partId: 'part-gen-brakediscs',
        name: 'Discos y Pastillas de Freno',
        systemId: 'BRAKES',
        modelNodeId: 'node_gen_brakes',
        position: { x: 28, y: 64, z: 0.9 },
        hotspot: { x: 28, y: 64, label: 'Frenos' },
        description: 'Frenado por fricción mecánica. Crucial comprobar espesor y desgaste uniforme.',
        interactable: true,
        zoneId: 'zone-gen-brakes',
        importance: 'CRITICAL'
      },
      {
        id: 'p3d-gen-clutch',
        partId: 'part-gen-clutch',
        name: 'Embrague y Volante Bimasa',
        systemId: 'TRANSMISSION',
        modelNodeId: 'node_gen_clutch',
        position: { x: 40, y: 48, z: 0.1 },
        hotspot: { x: 40, y: 48, label: 'Embrague' },
        description: 'Transmite la fuerza del motor a la caja de cambios.',
        interactable: true,
        zoneId: 'zone-gen-transmission',
        importance: 'HIGH'
      },
      {
        id: 'p3d-gen-shocks',
        partId: 'part-gen-shockabsorber',
        name: 'Amortiguadores y Muelles',
        systemId: 'SUSPENSION',
        modelNodeId: 'node_gen_shocks',
        position: { x: 30, y: 56, z: 0.9 },
        hotspot: { x: 30, y: 56, label: 'Amortiguadores' },
        description: 'Mantienen los neumáticos en contacto permanente con el asfalto.',
        interactable: true,
        zoneId: 'zone-gen-suspension',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-gen-alternator',
        partId: 'part-gen-alternator',
        name: 'Alternador y Correa de Accesorios',
        systemId: 'ELECTRICAL',
        modelNodeId: 'node_gen_alternator',
        position: { x: 18, y: 30, z: 0.6 },
        hotspot: { x: 18, y: 30, label: 'Alternador' },
        description: 'Recarga la batería de 12V y suministra energía eléctrica con el motor en marcha.',
        interactable: true,
        zoneId: 'zone-gen-engine',
        importance: 'MEDIUM'
      },
      {
        id: 'p3d-gen-catalytic',
        partId: 'part-gen-catalytic',
        name: 'Catalizador / Tratamiento de Emisiones',
        systemId: 'EMISSIONS',
        modelNodeId: 'node_gen_catalytic',
        position: { x: 74, y: 44, z: -1.2 },
        hotspot: { x: 74, y: 44, label: 'Catalizador' },
        description: 'Convierte hidrocarburos y monóxido de carbono en vapor de agua y CO2.',
        interactable: true,
        zoneId: 'zone-gen-exhaust',
        importance: 'HIGH'
      }
    ],
    metadata: {
      type: 'universal-chassis-template'
    },
    isDemo: true,
    license: 'CC-BY-4.0 / OCHE Open Architecture',
    source: 'OCHE Automotive Knowledge Base',
    author: 'OCHE Technical Systems'
  }
];

// ==========================================
// 3. GENERIC CANONICAL PARTS REGISTRY
// ==========================================
// Supplementing parts if specific engine code is missing
export const CANONICAL_GENERIC_PARTS_MAP: Record<string, {
  name: string;
  systemId: any;
  description: string;
  function: string;
  location: string;
  symptoms: string[];
  failureModes: string[];
  inspectionMethods: string[];
  maintenanceItems: string[];
  knownProblems: string[];
  repairOptions: string[];
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  costRange: { minimum: number; expected: number; maximum: number; currency: string; countryCode: string };
  basicExplanation: string;
  advancedExplanation: string;
}> = {
  'part-gen-turbo': {
    name: 'Turbocompresor',
    systemId: 'ENGINE',
    description: 'Turbina impulsada por los gases de escape que comprime el aire que entra a los cilindros.',
    function: 'Aumenta la masa de aire comprimido en los cilindros para incrementar la potencia y par del motor sin aumentar su cilindrada.',
    location: 'Colector de escape en el vano motor',
    symptoms: ['Silbido agudo tipo ambulancia al acelerar', 'Humo blanco o azulado por el escape', 'Pérdida de potencia en pendientes', 'Consumo de aceite de motor'],
    failureModes: ['Holgura radial/axial en el eje de la turbina', 'Fuga de aceite por retenes del cartucho CHRA', 'Agarrotamiento de los alabes de geometría variable (VGT)'],
    inspectionMethods: ['Comprobar juego en el eje retirando el manguito de admisión', 'Inspección visual de fugas de aceite en la caracola fría', 'Lectura de presión de soplado con OBD-II'],
    maintenanceItems: ['Cambio de aceite sintético de alta calidad a intervalos regulares', 'Dejar el motor a ralentí 1 minuto tras viajes exigentes antes de apagar'],
    knownProblems: ['prob-vw-waterpump'],
    repairOptions: ['Reconstrucción con cartucho CHRA nuevo', 'Sustitución por turbocompresor nuevo OEM/Aftermarket'],
    riskLevel: 'high',
    costRange: { minimum: 450, expected: 850, maximum: 1400, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'El turbo es como un ventilador súper potente que aprovecha el humo del tubo de escape para meter más aire al motor y hacer que el coche tenga mucha más fuerza sin gastar tanta gasolina.',
    advancedExplanation: 'El turbocompresor consta de una turbina centrífuga impulsada por la energía cinética de los gases de escape, unida coaxialmente a un compresor centrífugo que comprime el aire de admisión hasta 1.5–2.5 bares de presión absoluta.'
  },
  'part-gen-timingbelt': {
    name: 'Correa de Distribución',
    systemId: 'ENGINE',
    description: 'Correa dentada de goma sintética que sincroniza el giro del cigüeñal y los árboles de levas.',
    function: 'Asegura que las válvulas de admisión y escape se abran y cierren en el instante exacto relativo a la posición de los pistones.',
    location: 'Lateral del bloque motor, protegida por carcasas de plástico',
    symptoms: ['Chirridos o silbidos al arrancar en frío', 'Desgaste por kilometraje o antigüedad (> 5-6 años)', 'Fugas de refrigerante por la bomba de agua'],
    failureModes: ['Rotura por envejecimiento del caucho', 'Desdentado por pérdida de tensión', 'Agarrotamiento de rodillo tensor'],
    inspectionMethods: ['Comprobación de libro de mantenimiento', 'Inspección visual de grietas, deshilachado o tensión', 'Inspección de manchas de aceite o anticongelante'],
    maintenanceItems: ['Sustitución preventiva estricta según intervalo del fabricante (generalmente 100.000–180.000 km o 5–6 años)'],
    knownProblems: [],
    repairOptions: ['Kit completo de distribución (correa, rodillos tensores y bomba de agua)'],
    riskLevel: 'critical',
    costRange: { minimum: 280, expected: 480, maximum: 750, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Es una correa de goma muy fuerte que hace que las piezas internas del motor se muevan en perfecta sincronía. Si se rompe mientras conduces, el motor se rompe por completo.',
    advancedExplanation: 'La correa dentada transmite la rotación del piñón del cigüeñal a la polea del árbol de levas a una relación exacta de 2:1 en motores de cuatro tiempos, manteniendo la sincronización entre el tren de válvulas y los pistones.'
  },
  'part-gen-waterpump': {
    name: 'Bomba de Agua y Termostato',
    systemId: 'COOLING',
    description: 'Bomba centrífuga mecánica o eléctrica que mueve el líquido anticongelante por el circuito de refrigeración.',
    function: 'Disipa el calor excesivo generado por la combustión y mantiene el motor en su temperatura óptima (~90°C).',
    location: 'Bloque motor, movida por la correa de distribución o accesorios',
    symptoms: ['Nivel de anticongelante bajando en el vaso de expansión', 'Manchas rosadas o verdosas en el suelo', 'La aguja de temperatura sube de 90°C en atascos'],
    failureModes: ['Fuga por el retén del eje de la turbina', 'Holgura o gripado del rodamiento', 'Cavidad o corrosión de las aspas'],
    inspectionMethods: ['Prueba de presión del circuito de refrigeración', 'Inspección visual de restos blanquecinos/rosas en la bomba'],
    maintenanceItems: ['Sustitución conjunta con el kit de distribución', 'Sustitución de líquido refrigerante cada 4-5 años'],
    knownProblems: ['prob-vw-waterpump'],
    repairOptions: ['Sustitución de bomba de agua y purgado del circuito con anticongelante nuevo'],
    riskLevel: 'high',
    costRange: { minimum: 120, expected: 260, maximum: 450, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'La bomba de agua es como el corazón del sistema de refrigeración: bombea líquido fresco por todo el motor para que no se sobrecaliente.',
    advancedExplanation: 'La bomba de agua centrífuga crea un caudal continuo de refrigerante que fluye por los conductos del bloque y culata hacia el radiador frontal, regulado por una válvula termostática bimetálica o electrónica.'
  },
  'part-gen-brakediscs': {
    name: 'Discos y Pastillas de Freno',
    systemId: 'BRAKES',
    description: 'Componentes de fricción montados en los cubos de rueda que detienen el vehículo.',
    function: 'Transforman la energía cinética del coche en calor mediante la fricción de las pastillas contra el disco de acero.',
    location: 'En el interior de cada una de las ruedas del vehículo',
    symptoms: ['Chirrido metálico al frenar suavemente', 'Vibración en el volante al frenar a más de 80 km/h (discos alabeados)', 'Pedal de freno con tacto esponjoso o hundido'],
    failureModes: ['Desgaste del forro de fricción (< 2 mm)', 'Alabeo térmico del disco por sobrecalentamiento', 'Surcos profundos u oxidación severa'],
    inspectionMethods: ['Medición con calibre micrométrico del grosor del disco', 'Inspección visual del grosor de las pastillas a través de la llanta', 'Prueba en frenómetro'],
    maintenanceItems: ['Comprobación de grosor en cada cambio de aceite', 'Sustitución del líquido de frenos DOT 4 cada 2 años'],
    knownProblems: [],
    repairOptions: ['Sustitución de pastillas de freno por eje', 'Sustitución de pareja de discos y pastillas nuevas'],
    riskLevel: 'critical',
    costRange: { minimum: 140, expected: 240, maximum: 420, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Son dos placas de metal que aprietan un disco que gira con la rueda para parar el coche cuando pisas el freno. Se van gastando poco a poco con el uso.',
    advancedExplanation: 'Las pinzas hidráulicas empujan las pastillas con compuesto de fricción cerámico/semimetálico contra el disco de fundición gris ventilado, generando un par de frenado contrarrestante que disipa la energía cinética en forma de calor.'
  },
  'part-gen-flywheel': {
    name: 'Volante Motor Bimasa (Dual-Mass)',
    systemId: 'TRANSMISSION',
    description: 'Volante motor dividido en dos masas unidas por muelles de torsión amortiguadores.',
    function: 'Filtra las vibraciones torsionales e irregularidades de par procedentes del motor antes de que lleguen a la caja de cambios.',
    location: 'Entre el cigüeñal del motor y el disco de embrague',
    symptoms: ['Vibración o traqueteo al ralentí que desaparece al pisar el pedal de embrague', 'Golpeteo metálico al apagar el motor', 'Temblores en el coche al iniciar la marcha en primera'],
    failureModes: ['Rotura o fatiga de los muelles helicoidales internos', 'Desgaste del casquillo central de guiado', 'Holgura angular o axial excesiva'],
    inspectionMethods: ['Prueba auditiva en punto muerto pisando y soltando el embrague', 'Medición de grados de holgura angular con el embrague desmontado'],
    maintenanceItems: ['Evitar arranques bruscos en pendientes', 'No conducir a regímenes excesivamente bajos (< 1.300 rpm) bajo alta carga'],
    knownProblems: [],
    repairOptions: ['Sustitución conjunta de volante bimasa, disco de embrague, prensa y cojinete hidráulico'],
    riskLevel: 'high',
    costRange: { minimum: 600, expected: 950, maximum: 1500, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Es una pieza redonda y pesada con muelles en su interior que absorbe los temblores del motor para que el coche marche suave y no vibre todo el habitáculo.',
    advancedExplanation: 'El volante de inercia bimasa (DMF) desacopla la inercia primaria (ligada al cigüeñal) de la inercia secundaria (ligada al primario del cambio) mediante resortes de arco y amortiguadores de fricción interna.'
  },
  'part-gen-clutch': {
    name: 'Kit de Embrague (Disco, Prensa y Cojinete)',
    systemId: 'TRANSMISSION',
    description: 'Mecanismo de fricción que conecta y desconecta el motor de la caja de cambios manual.',
    function: 'Permite acoplar progresivamente el movimiento del motor a las ruedas para iniciar la marcha o cambiar de marcha.',
    location: 'Alojado en la campana de la caja de cambios',
    symptoms: ['El motor sube de revoluciones al acelerar pero el coche no gana velocidad (el embrague patina)', 'Dificultad para engranar marchas o rascan la marcha atrás', 'Olor a ferodo quemado tras maniobrar'],
    failureModes: ['Desgaste total del forro de ferodo del disco', 'Pérdida de fuerza del diafragma de presión', 'Fuga en el bombín/cojinete hidráulico concéntrico (CSC)'],
    inspectionMethods: ['Prueba de salida en 3ª velocidad con freno de mano (debe calarse de inmediato si está en buen estado)', 'Tacto del recorrido del pedal'],
    maintenanceItems: ['No apoyar el pie en el pedal de embrague mientras se circula', 'Poner punto muerto en semáforos en lugar de mantener el embrague pisado'],
    knownProblems: [],
    repairOptions: ['Sustitución de kit de embrague completo con purgado de circuito hidráulico'],
    riskLevel: 'high',
    costRange: { minimum: 350, expected: 600, maximum: 950, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'El embrague conecta el motor con las ruedas. Cuando pisas el pedal, se separan para que puedas cambiar de marcha sin romper nada.',
    advancedExplanation: 'El plato de presión ejerce una fuerza de apriete sobre el disco de fricción montado estriado sobre el eje primario de la caja de cambios. El accionamiento hidráulico mediante cilindro receptor comanda la liberación.'
  },
  'part-gen-shockabsorber': {
    name: 'Amortiguadores y Copelas',
    systemId: 'SUSPENSION',
    description: 'Dispositivos telescópicos hidráulicos/de gas que controlan los rebotes de los muelles de suspensión.',
    function: 'Mantienen las ruedas pegadas al asfalto, garantizan la estabilidad en curva y reducen la distancia de frenado.',
    location: 'En las cuatro esquinas de la suspensión del vehículo',
    symptoms: ['El coche balancea excesivamente en curvas o con viento lateral', 'Rebotes prolongados tras pasar un badén', 'Manchas húmedas de aceite en el cuerpo del amortiguador', 'Desgaste irregular o en dientes de sierra de los neumáticos'],
    failureModes: ['Fuga del fluido hidráulico por el retén del vástago', 'Pérdida de la carga de gas nitrógeno', 'Holgura en las copelas/rodamientos superiores'],
    inspectionMethods: ['Inspección visual de fugas de aceite', 'Prueba de rebote manual en cada esquina', 'Prueba en banco de suspensión'],
    maintenanceItems: ['Revisión visual cada 20.000 km', 'Sustitución por parejas en el mismo eje (cada 80.000–120.000 km)'],
    knownProblems: [],
    repairOptions: ['Sustitución por parejas de amortiguadores y kit de copelas guardapolvos'],
    riskLevel: 'medium',
    costRange: { minimum: 220, expected: 380, maximum: 600, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Son como unos tubos con aceite que frenan los botes del coche para que no vaya botando como un balón después de cada bache.',
    advancedExplanation: 'Los amortiguadores bitubo o monotubo presurizados con gas disipan la energía mecánica almacenada en los resortes helicoidales transformándola en energía térmica mediante el paso forzado del aceite hidráulico por válvulas calibradas.'
  },
  'part-gen-alternator': {
    name: 'Alternador',
    systemId: 'ELECTRICAL',
    description: 'Generador eléctrico que transforma la energía rotativa del motor en corriente continua.',
    function: 'Carga la batería de 12V y suministra energía eléctrica a todos los sistemas del vehículo mientras el motor está encendido.',
    location: 'Frontal o lateral del motor, accionado por la correa de accesorios',
    symptoms: ['Testigo rojo de batería encendido en el cuadro', 'Faros tenues o que parpadean al acelerar', 'Ruido metálico o silbido de rodamientos gastados', 'Batería que se descarga en pocos días'],
    failureModes: ['Desgaste de escobillas del regulador de tensión', 'Fallo del puente rectificador de diodos', 'Polea libre del alternador bloqueada'],
    inspectionMethods: ['Medición con multímetro del voltaje en bornes de batería con motor encendido (debe marcar 13.8V – 14.4V)', 'Comprobación de la polea libre'],
    maintenanceItems: ['Comprobación de la tensión y estado de la correa de accesorios'],
    knownProblems: [],
    repairOptions: ['Sustitución del regulador/escobillas o cambio completo del alternador (reconstruido o nuevo)'],
    riskLevel: 'medium',
    costRange: { minimum: 180, expected: 340, maximum: 550, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Es una pequeña central eléctrica dentro del coche: mientras el motor gira, produce electricidad para que funcionen las luces, la radio y se recargue la batería.',
    advancedExplanation: 'El alternador trifásico síncrono autoexcitado genera corriente alterna inducida en el estator mediante el campo magnético del rotor, rectificada a corriente continua por un puente de diodos y regulada electrónicamente a ~14.2V.'
  },
  'part-gen-accompressor': {
    name: 'Compresor de Aire Acondicionado',
    systemId: 'AIR_CONDITIONING',
    description: 'Bomba volumétrica que comprime el gas refrigerante en el circuito de climatización.',
    function: 'Comprime el gas refrigerante elevando su presión y temperatura para iniciar el ciclo termodinámico de enfriamiento.',
    location: 'Parte inferior del vano motor, accionado por la correa de accesorios',
    symptoms: ['El aire acondicionado no enfría en días calurosos', 'Ruido metálico estridente al conectar el botón A/C', 'Fugas visibles con tinte fluorescente UV'],
    failureModes: ['Fuga por el retén del eje del compresor', 'Gripado interno de los pistones por falta de aceite PAG', 'Avería del embrague electromagnético o válvula de control'],
    inspectionMethods: ['Comprobación de presiones de alta y baja con manómetros de climatización', 'Inspección con lámpara de luz ultravioleta UV'],
    maintenanceItems: ['Conectar el aire acondicionado al menos 10 minutos al mes también en invierno para lubricar los retenes'],
    knownProblems: [],
    repairOptions: ['Sustitución de compresor con limpieza por barrido del circuito y recarga de gas'],
    riskLevel: 'low',
    costRange: { minimum: 300, expected: 520, maximum: 850, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Es el motor del aire acondicionado: aprieta el gas frío para que salga aire fresco por las rejillas cuando hace calor.',
    advancedExplanation: 'Compresor de pistones axiales de cilindrada fija o variable que presuriza el fluido refrigerante R134a o R1234yf desde la fase gaseosa de baja presión hasta alta presión antes de enviarlo al condensador frontal.'
  },
  'part-gen-catalytic': {
    name: 'Catalizador / Tratamiento de Gases',
    systemId: 'EMISSIONS',
    description: 'Reactor químico situado en la línea de escape con metales nobles (platino, paladio, rodio).',
    function: 'Reduce las emisiones contaminantes (CO, HC, NOx) transformándolas en sustancias inocuas como nitrógeno, agua y dióxido de carbono.',
    location: 'Tramo inicial o intermedio de la línea de escape',
    symptoms: ['Testigo Check Engine encendido (error P0420/P0430 Eficiencia catalizador)', 'Olor a azufre o huevos podridos por el escape', 'Ruido de piedras sueltas dentro del escape al golpear suavemente'],
    failureModes: ['Monolito cerámico roto o fundido por exceso de gasolina sin quemar', 'Contaminación de metales nobles por consumo de aceite o anticongelante'],
    inspectionMethods: ['Prueba de gases de escape en analizador de 4 gases (ITV)', 'Inspección con cámara endoscópica'],
    maintenanceItems: ['Solucionar inmediatamente fallos de encendido (bujías/bobinas) para evitar que llegue gasolina cruda al catalizador'],
    knownProblems: [],
    repairOptions: ['Sustitución de catalizador nuevo homologado o soldadura de cartucho cerámico/metálico'],
    riskLevel: 'high',
    costRange: { minimum: 250, expected: 480, maximum: 900, currency: 'EUR', countryCode: 'ES' },
    basicExplanation: 'Es un filtro mágico en el tubo de escape que limpia los humos tóxicos antes de que salgan a la calle para no contaminar el aire que respiramos.',
    advancedExplanation: 'Reactor catalítico de tres vías con matriz cerámica de cordierita alveolada recubierta de alúmina y metales preciosos que promueve reacciones redox de oxidación y reducción estequiométrica (λ=1.00).'
  }
};

// ==========================================
// 4. SYMPTOM EXPLORER KNOWLEDGE BASE
// ==========================================
export const SYMPTOM_EXPLORER_CATALOG: SymptomCandidate[] = [
  {
    symptomId: 'symp-vibration-braking',
    symptomName: 'Vibración en el volante o pedal al frenar',
    description: 'Al pisar el freno a velocidades medias o altas (> 70 km/h), el volante oscila lateralmente o el pedal de freno pulsa rítmicamente.',
    candidateSystems: [
      {
        systemId: 'BRAKES',
        systemName: 'Sistema de Frenos',
        likelihood: 'HIGH',
        candidateParts: ['Discos de freno delanteros alabeados', 'Pastillas de freno con desgaste irregular', 'Pinza de freno agarrotada'],
        inspectionTip: 'Revisar con un reloj comparador el alabeo de los discos delanteros. Un descentramiento superior a 0.05 mm genera vibración en volante.'
      },
      {
        systemId: 'SUSPENSION',
        systemName: 'Suspensión Delantera',
        likelihood: 'MEDIUM',
        candidateParts: ['Silentblocks de trapecios delanteros con holgura', 'Rótulas de suspensión gastadas'],
        inspectionTip: 'Aprovechar la prueba en foso o elevador para palanquear los brazos de suspensión y detectar gomas cuarteadas o holguras.'
      },
      {
        systemId: 'TYRES',
        systemName: 'Neumáticos y Llantas',
        likelihood: 'LOW',
        candidateParts: ['Llanta deformada por bache', 'Desgaste irregular del neumático'],
        inspectionTip: 'Verificar el equilibrado dinámico de las ruedas en taller de neumáticos.'
      }
    ],
    safeDrivingAdvice: 'Evita frenadas bruscas y prolongadas que puedan sobrecalentar aún más los componentes. Pide cita para medir el alabeo de los discos.'
  },
  {
    symptomId: 'symp-blue-smoke',
    symptomName: 'Humo azulado o blanquecino por el tubo de escape',
    description: 'El coche expulsa humo con tinte azulado y olor característico a aceite quemado, especialmente en aceleraciones fuertes o al arrancar.',
    candidateSystems: [
      {
        systemId: 'ENGINE',
        systemName: 'Motor / Lubricación',
        likelihood: 'HIGH',
        candidateParts: ['Retenes de válvulas endurecidos', 'Segmentos de pistón desgastados', 'Turbocompresor con fuga de aceite en eje'],
        inspectionTip: 'Comprobar el nivel de la varilla de aceite frecuentemente. Si el humo sale tras retener en bajadas, suelen ser retenes de válvula; si sale en aceleración continua, suele ser turbo o segmentos.'
      },
      {
        systemId: 'EXHAUST',
        systemName: 'Emisiones / PCV',
        likelihood: 'MEDIUM',
        candidateParts: ['Válvula de recirculación de gases de cárter (PCV) obstruida o membrana rota'],
        inspectionTip: 'Quitar el tapón de llenado de aceite con el motor a ralentí: si hay una succión excesiva o soplo violento, revisar la válvula PCV.'
      }
    ],
    safeDrivingAdvice: 'Revisa de inmediato el nivel de aceite motor antes de volver a circular para evitar que el motor trabaje sin lubricación y pueda gripar.'
  },
  {
    symptomId: 'symp-squeal-whistle-accel',
    symptomName: 'Silbido agudo ("como ambulancia") al acelerar',
    description: 'Al pisar el acelerador y entrar en carga, se escucha un silbido metálico o soplido en el vano motor que sube de tono con las revoluciones.',
    candidateSystems: [
      {
        systemId: 'ENGINE',
        systemName: 'Turbocompresor y Admisión',
        likelihood: 'HIGH',
        candidateParts: ['Turbocompresor con holgura en el eje de la turbina', 'Manguito del intercooler rajado o abrazadera floja'],
        inspectionTip: 'Revisar con una linterna los manguitos de goma negros gruesos entre el turbo y el radiador intercooler en busca de rajas o restos de aceite soplado.'
      },
      {
        systemId: 'EXHAUST',
        systemName: 'Línea de Escape',
        likelihood: 'MEDIUM',
        candidateParts: ['Junta del colector de escape soplada', 'Espárragos del colector partidos'],
        inspectionTip: 'Comprobar si hay restos de hollín negro alrededor de la culata o colector de escape.'
      }
    ],
    safeDrivingAdvice: 'Modera las aceleraciones a fondo. Si el silbido se vuelve metálico o tipo roce, el turbo debe revisarse antes de que las aspas rocen contra la carcasa.'
  },
  {
    symptomId: 'symp-clunk-knocking-bumps',
    symptomName: 'Golpeteo seco ("cloc-cloc") al pasar baches o badenes',
    description: 'Al circular por calles adoquinadas, badenes o cambios de rasante, se perciben ruidos secos en la parte delantera o trasera.',
    candidateSystems: [
      {
        systemId: 'SUSPENSION',
        systemName: 'Suspensión y Estabilizadora',
        likelihood: 'HIGH',
        candidateParts: ['Tirantes / Bieletas de la barra estabilizadora', 'Copelas y rodamientos superiores del amortiguador', 'Silentblocks del trapecio'],
        inspectionTip: 'Las bieletas de la barra estabilizadora son la causa más frecuente y económica. Al levantar la rueda, comprobar juego moviendo la bieleta con la mano.'
      },
      {
        systemId: 'STEERING',
        systemName: 'Dirección',
        likelihood: 'MEDIUM',
        candidateParts: ['Rótulas de dirección con holgura', 'Holgura en la cremallera de dirección'],
        inspectionTip: 'Mover el volante con el motor apagado y escuchar si claquea en el vano motor.'
      }
    ],
    safeDrivingAdvice: 'Reduce la velocidad ante resaltos y baches. La holgura en rótulas puede desgastar prematuramente los neumáticos.'
  },
  {
    symptomId: 'symp-engine-overheating',
    symptomName: 'La aguja de temperatura sube por encima de 90°C',
    description: 'El indicador de temperatura del cuadro supera el centro de la escala o salta el aviso rojo de advertencia de líquido refrigerante.',
    candidateSystems: [
      {
        systemId: 'COOLING',
        systemName: 'Sistema de Refrigeración',
        likelihood: 'HIGH',
        candidateParts: ['Termostato cerrado agarrotado', 'Electroventilador que no salta', 'Fuga de anticongelante por radiador/manguito', 'Bomba de agua con turbina desprendida'],
        inspectionTip: 'Comprobar si el vaso de expansión tiene nivel. Si el motor está caliente, NUNCA abras el tapón del vaso de expansión.'
      },
      {
        systemId: 'ENGINE',
        systemName: 'Culata y Motor',
        likelihood: 'MEDIUM',
        candidateParts: ['Junta de culata quemada con paso de compresión al refrigerante'],
        inspectionTip: 'Comprobar si los manguitos de refrigerante se ponen duros como piedras y si hay burbujas continuas en el vaso de expansión.'
      }
    ],
    safeDrivingAdvice: '¡ATENCIÓN! Si la temperatura sube peligrosamente, detén el vehículo en un lugar seguro y apaga el motor inmediatamente para evitar una avería grave de culata.'
  }
];

// ==========================================
// 5. INSPECTION GUIDELINES DATABASE
// ==========================================
export const DEFAULT_INSPECTION_GUIDES: Record<string, InspectionGuide> = {
  'part-gen-turbo': {
    whatToLookFor: [
      'Ausencia de silbidos chillones agudos al acelerar.',
      'Manguitos de admisión e intercooler limpios sin encharcamientos excesivos de aceite.',
      'Tubo de escape limpio sin humo azul ni olor a aceite quemado.'
    ],
    howToCheck: [
      '1. Realiza una prueba de aceleración progresiva en 3ª velocidad desde 1.500 rpm con la ventanilla bajada escuchando el vano motor.',
      '2. Con el motor frío y apagado, inspecciona visualmente el exterior de la caracola del turbo en busca de fugas de aceite.',
      '3. Pide a un acompañante acelerar brevemente en parado mientras observas si el escape despide bocanadas de humo azul.'
    ],
    whatIsNormal: [
      'Un soplido suave y continuo de aire al acelerar a medio régimen.',
      'Una película mínima de vapor de aceite en las paredes interiores de los manguitos de admisión.'
    ],
    whatIsConcerning: [
      'Silbido similar a una sirena de ambulancia que varía proporcionalmente con las RPM.',
      'Falta acusada de empuje por debajo de 2.500 rpm o tirones repentinos.',
      'Humo denso blanco-azulado tras dejar el motor a ralentí y volver a acelerar.'
    ],
    whenToCallMechanic: [
      'Si salta el testigo de avería motor (Check Engine) o entra en modo protección perdiendo potencia.',
      'Si escuchas ruidos metálicos de rozamiento en el vano motor.'
    ],
    safetyWarnings: [
      'NUNCA toques el turbocompresor ni los colectores de escape con el motor recién apagado: alcanzan temperaturas superiores a 600°C.'
    ]
  },
  'part-gen-brakediscs': {
    whatToLookFor: [
      'Espesor visible del forro de las pastillas (debe superar los 3-4 mm).',
      'Superficie del disco brillante y lisa, sin surcos profundos ni reborde exterior cortante.',
      'Ausencia de grietas radiales o zonas azuladas por sobrecalentamiento.'
    ],
    howToCheck: [
      '1. Mira a través de los radios de la llanta con una linterna hacia la pinza de freno para evaluar el grosor del ferodo de la pastilla.',
      '2. Con el coche completamente frío, pasa la yema del dedo cuidadosamente por el borde exterior del disco para notar si hay un escalón pronunciado.',
      '3. En una recta despejada y segura, frena de 80 km/h a 20 km/h soltando levemente las manos del volante para verificar que el coche no se desvía ni vibra.'
    ],
    whatIsNormal: [
      'Una fina capa de óxido superficial en los discos tras lavar el coche o varios días de lluvia (desaparece en la primera frenada).',
      'Un leve sonido sordo de fricción en la primera frenada de la mañana.'
    ],
    whatIsConcerning: [
      'Chirrido agudo constante incluso sin pisar el freno o raspado metálico de hierro contra hierro.',
      'Reborde en el disco superior a 1.5 - 2 mm de profundidad.',
      'Vibración perceptible en el volante al frenar suavemente desde 90-100 km/h.'
    ],
    whenToCallMechanic: [
      'Si el pedal de freno se hunde progresivamente hasta el fondo al mantenerlo pisado en parado.',
      'Si el testigo rojo de frenos o líquido de frenos se enciende en el cuadro de instrumentos.'
    ],
    safetyWarnings: [
      'NUNCA toques los discos de freno inmediatamente después de circular; pueden provocar quemaduras severas instantáneas.'
    ]
  },
  'part-gen-timingbelt': {
    whatToLookFor: [
      'Facturas y registros de taller que acrediten la fecha exacta y kilometraje del último cambio de correa.',
      'Ausencia de grietas, deshilachados o dientes desgastados si la tapa es parcialmente accesible.',
      'Ausencia de manchas de anticongelante o aceite en la zona de la distribución.'
    ],
    howToCheck: [
      '1. Revisa el libro de revisiones del vehículo y busca la pegatina de cambio de distribución en el vano motor o marco de puerta.',
      '2. Pregunta al vendedor si dispone de factura con el desglose de kit de distribución, rodillos y bomba de agua cambiados.',
      '3. Arranca el motor en frío y escucha atentamente en el lateral del motor si hay chirridos de rodamientos o silbidos anómalos.'
    ],
    whatIsNormal: [
      'Giro suave y regular del motor sin ruidos rítmicos metálicos en el lateral de la distribución.'
    ],
    whatIsConcerning: [
      'Vehículo con más de 5-6 años o más de 120.000 km sin ningún registro demostrable de sustitución.',
      'Chirrido agudo que cambia al acelerar en frío.',
      'Goteo de anticongelante por la parte baja de la tapa de distribución.'
    ],
    whenToCallMechanic: [
      'Si compras un vehículo de segunda mano sin historial comprobable del cambio de distribución: programa el cambio de inmediato.'
    ],
    safetyWarnings: [
      'NUNCA retires tapas protectoras ni manipules poleas con el motor encendido.'
    ]
  }
};
