import { CarZone3D } from '../types';

export const CAR_ZONES_3D: CarZone3D[] = [
  {
    id: 'engine',
    name: 'Motor y Caja',
    icon: 'Cpu',
    summary: 'Es el corazón mecánico del coche. Genera la potencia y propulsión.',
    color: '#ef4444', // Red accent
    x: 22,
    y: 35,
    z: 0,
    parts: [
      {
        id: 'alternator',
        name: 'Alternador',
        description: 'Transforma la energía mecánica del motor en electricidad para cargar la batería y alimentar los sistemas electrónicos mientras conduces.',
        priceNew: '220 € – 380 €',
        priceRefurbished: '130 € – 190 €',
        priceUsed: '60 € – 90 €',
        laborCost: '80 € – 150 € (1.5h - 2h)',
        commonIssues: [
          'Luz de batería encendida en cuadro',
          'Faros parpadeantes o tenues',
          'Ruido metálico de rodamiento gastado'
        ]
      },
      {
        id: 'timing_belt',
        name: 'Correa / Cadena de Distribución',
        description: 'Sincroniza el movimiento de pistones y válvulas. Si la correa rompe en marcha, el motor suele destruirse por completo.',
        priceNew: '180 € – 350 € (Kit bomba de agua)',
        priceRefurbished: 'No aplicable (siempre instalar nueva)',
        priceUsed: 'No aplicable',
        laborCost: '250 € – 450 € (4h - 6h)',
        commonIssues: [
          'Chirridos o silbidos en frío',
          'Desgaste por envejecimiento (> 5-6 años o > 120.000 km)',
          'Fuga de líquido refrigerante por la bomba de agua'
        ]
      },
      {
        id: 'turbo',
        name: 'Turbocompresor',
        description: 'Aprovecha los gases de escape para soplar aire a presión dentro de los cilindros, aumentando la potencia y reduciendo el consumo.',
        priceNew: '650 € – 1.200 €',
        priceRefurbished: '350 € – 550 €',
        priceUsed: '200 € – 350 €',
        laborCost: '200 € – 350 € (3h - 5h)',
        commonIssues: [
          'Silbido fuerte ("como ambulancia") al acelerar',
          'Humo blanco o azulado por el escape',
          'Pérdida súbita de potencia (Entra en modo fallo)'
        ]
      },
      {
        id: 'radiator',
        name: 'Radiador e Intercooler',
        description: 'Mantiene la temperatura ideal de trabajo del motor y enfría el aire comprimido que entra al turbo.',
        priceNew: '120 € – 240 €',
        priceRefurbished: 'Precio no disponible',
        priceUsed: '40 € – 80 €',
        laborCost: '100 € – 180 €',
        commonIssues: [
          'Fugas de anticongelante',
          'Sobrecalentamiento del motor en atascos',
          'Aletas de aluminio dobladas por impactos de piedras'
        ]
      }
    ]
  },
  {
    id: 'brakes',
    name: 'Frenos y Seguridad',
    icon: 'Disc',
    summary: 'Sistema hidráulico de fricción crucial para la detención segura del vehículo.',
    color: '#f59e0b', // Amber accent
    x: 28,
    y: 62,
    z: 0,
    parts: [
      {
        id: 'brake_discs_pads',
        name: 'Discos y Pastillas de Freno',
        description: 'Prensados por las pinzas de freno para detener las ruedas mediante fricción directa.',
        priceNew: '140 € – 280 € (Eje completo)',
        priceRefurbished: 'No aplicable',
        priceUsed: 'No recomendado por seguridad',
        laborCost: '60 € – 110 €',
        commonIssues: [
          'Chirrido agudo al frenar suavemente',
          'Vibración en el volante al frenar a alta velocidad (Discos alabeados)',
          'Pedal de freno esponjoso o muy bajo'
        ]
      },
      {
        id: 'abs_pump',
        name: 'Módulo de Freno ABS / ESP',
        description: 'Evita que las ruedas se bloqueen en frenadas de emergencia y estabiliza el coche si pierde adherencia.',
        priceNew: '800 € – 1.600 €',
        priceRefurbished: '280 € – 450 €',
        priceUsed: '150 € – 250 €',
        laborCost: '120 € – 200 €',
        commonIssues: [
          'Testigo amarillo de ABS/ESP encendido',
          'Fallo de sensores de velocidad de rueda',
          'Bloqueo de pinza por corrosión interna'
        ]
      }
    ]
  },
  {
    id: 'suspension',
    name: 'Suspensión y Dirección',
    icon: 'Activity',
    summary: 'Absorbe irregularidades del firme y mantiene las ruedas pegadas al asfalto.',
    color: '#3b82f6', // Blue accent
    x: 72,
    y: 62,
    z: 0,
    parts: [
      {
        id: 'shock_absorbers',
        name: 'Amortiguadores',
        description: 'Controlan los movimientos de la carrocería y evitan rebrotes peligrosos tras un bache.',
        priceNew: '200 € – 450 € (Pareja delantera)',
        priceRefurbished: 'No aplicable',
        priceUsed: 'No recomendado',
        laborCost: '100 € – 180 €',
        commonIssues: [
          'Fugas de aceite visibles en el cuerpo del amortiguador',
          'El coche "cabecea" en frenadas o balancea en curvas',
          'Desgaste irregular en forma de escalón en los neumáticos'
        ]
      },
      {
        id: 'steering_rack',
        name: 'Cremallera de Dirección Servida',
        description: 'Transmite el movimiento del volante a las manguetas de las ruedas delanteras.',
        priceNew: '400 € – 850 €',
        priceRefurbished: '220 € – 380 €',
        priceUsed: '100 € – 180 €',
        laborCost: '150 € – 250 € + Alineación (50€)',
        commonIssues: [
          'Holgura en la dirección al girar despacio',
          'Goteo de líquido hidráulico bajo el coche',
          'Ruido "clac-clac" al girar el volante en parado'
        ]
      }
    ]
  },
  {
    id: 'transmission',
    name: 'Transmisión y Embrague',
    icon: 'Settings',
    summary: 'Transfiere el par motor hacia las ruedas motrices.',
    color: '#8b5cf6', // Purple accent
    x: 42,
    y: 48,
    z: 0,
    parts: [
      {
        id: 'clutch_dual_mass',
        name: 'Embrague + Volante Bimasa',
        description: 'Desconecta el motor de la caja de cambios para cambiar de marcha y absorbe las vibraciones mecánicas del motor.',
        priceNew: '550 € – 950 € (Kit bimasa completo)',
        priceRefurbished: '300 € – 480 €',
        priceUsed: 'No recomendado',
        laborCost: '300 € – 500 € (5h - 8h de trabajo)',
        commonIssues: [
          'El embrague patina (suben revoluciones pero el coche no acelera)',
          'Retemblor violento al salir en primera marcha',
          'Ruido metálico en ralentí que desaparece al pisar el embrague'
        ]
      },
      {
        id: 'driveshaft',
        name: 'Transmisiones / Palieres / Guardapolvos',
        description: 'Ejes articulados que llevan el giro desde el diferencial hasta cada rueda.',
        priceNew: '110 € – 220 € por lado',
        priceRefurbished: '70 € – 120 €',
        priceUsed: '40 € – 70 €',
        laborCost: '60 € – 100 €',
        commonIssues: [
          'Guardapolvos de goma rajado expulsando grasa negra',
          'Ruido "clac-clac-clac" al girar a tope acelerando'
        ]
      }
    ]
  },
  {
    id: 'battery_electronics',
    name: 'Batería y Electrónica',
    icon: 'Zap',
    summary: 'Alimenta los módulos de control, arranque y sensores del habitáculo.',
    color: '#10b981', // Green accent
    x: 32,
    y: 28,
    z: 0,
    parts: [
      {
        id: 'battery_startstop',
        name: 'Batería 12V (AGM / EFB)',
        description: 'Proporciona la corriente de arranque al motor y soporta la carga del sistema Start/Stop.',
        priceNew: '110 € – 220 €',
        priceRefurbished: 'No recomendado',
        priceUsed: 'No recomendado',
        laborCost: '15 € – 30 € (o autodidacta)',
        commonIssues: [
          'Arranque perezoso por las mañanas en frío',
          'Mensajes erróneos de fallos variados en pantalla',
          'El sistema Start/Stop deja de funcionar automáticamente'
        ]
      }
    ]
  },
  {
    id: 'tires_wheels',
    name: 'Neumáticos y Ruedas',
    icon: 'CircleDot',
    summary: 'Único punto de contacto entre la estructura del coche y la carretera.',
    color: '#06b6d4', // Cyan accent
    x: 82,
    y: 62,
    z: 0,
    parts: [
      {
        id: 'tires_set',
        name: 'Juego de Neumáticos (4 Unidades)',
        description: 'Cubiertas de goma que garantizan agarre, evacuación de agua y capacidad de frenado.',
        priceNew: '240 € – 480 € (Marcas calidad/premium)',
        priceRefurbished: 'No aplicable',
        priceUsed: 'No recomendado si estado no garantizado (> 4-5 años)',
        laborCost: '40 € – 60 € (Montaje + Equilibrado)',
        commonIssues: [
          'Profundidad de dibujo < 1.6mm (Ilegal y peligroso en lluvia)',
          'Grietas en flancos por cristalización por antigüedad',
          'Huevazos o bollos tras golpear bordillos'
        ]
      }
    ]
  }
];
