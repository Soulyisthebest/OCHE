import { CarAnalysisReport } from '../types';

export interface SampleDemoCar {
  id: string;
  name: string;
  subtitle: string;
  thumbnail: string;
  mileage: number;
  askingPrice: number;
  photos: Record<string, string>;
  report: CarAnalysisReport;
}

export const SAMPLE_DEMO_CARS: SampleDemoCar[] = [
  {
    id: 'golf-7-tdi',
    name: 'Volkswagen Golf VII 2.0 TDI',
    subtitle: 'Año 2016 • 148.000 km • 150 CV • Diésel',
    thumbnail: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    mileage: 148000,
    askingPrice: 11900,
    photos: {
      front: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
      left: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      right: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
      interior: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      dashboard: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=800&q=80',
      engine: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      tires: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
      trunk: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    },
    report: {
      id: 'golf-7-report',
      createdAt: '2026-08-11T10:00:00Z',
      photos: {
        front: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
        engine: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        interior: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
      },
      identity: {
        make: 'Volkswagen',
        model: 'Golf',
        generation: 'Golf VII (5G1)',
        estimatedYearMin: 2015,
        estimatedYearMax: 2017,
        engine: '2.0 TDI BlueMotion',
        fuelType: 'Diésel',
        powerHp: 150,
        transmission: 'Manual',
        confidenceScore: 94,
        needsConfirmation: false
      },
      mileageKm: 148000,
      userPrice: 11900,
      score: 82,
      scoreLabel: 'Buena opción',
      scoreBadgeColor: 'green',
      scoreCategories: [
        { name: 'Fiabilidad', score: 88, weight: 25, description: 'Motor 2.0 TDI de probada durabilidad superando los 300k km.' },
        { name: 'Estado visible', score: 85, weight: 20, description: 'Pintura y carrocería en muy buen estado con roces mínimos.' },
        { name: 'Mantenimiento', score: 78, weight: 20, description: 'Correa de distribución próxima a cambio recomendado por antigüedad.' },
        { name: 'Riesgo mecánico', score: 80, weight: 15, description: 'Bajo riesgo. Filtro de partículas en buen valor aparente.' },
        { name: 'Relación calidad/precio', score: 82, weight: 20, description: 'Precio alineado con el valor de mercado para este equipamiento.' }
      ],
      visualObservations: [
        {
          category: 'Exterior',
          part: 'Paragolpes delantero',
          status: 'warning',
          title: 'Pequeños roces de aparcamiento en la parte inferior',
          description: 'Se aprecian ligeros arañazos en el labio inferior del paragolpes delantero derecho. Estético, no afecta estructura.',
          actionRequired: 'Repaso opcional de pintura (~120 €)'
        },
        {
          category: 'Neumáticos',
          part: 'Eje delantero',
          status: 'warning',
          title: 'Neumáticos delanteros a medio uso (~3.5 mm de dibujo)',
          description: 'Aún legales pero requerirán sustitución en unos 8.000–10.000 km.',
          actionRequired: 'Prever cambio en los próximos 6 meses'
        },
        {
          category: 'Interior',
          part: 'Asiento conductor y volante',
          status: 'good',
          title: 'Excelente estado de tapicería y plásticos',
          description: 'El desgaste del cuero del volante coincide perfectamente con los 148.000 km declarados.',
        },
        {
          category: 'Motor',
          part: 'Vano motor',
          status: 'good',
          title: 'Sin fugas visibles de aceite ni refrigerante',
          description: 'El motor está limpio pero no petroleado recientemente, lo cual es buena señal para detectar fugas reales.',
        }
      ],
      modelProsCons: [
        {
          type: 'pro',
          title: 'Motor muy elástico y de bajo consumo',
          description: 'Consumos medios reales entre 4.5 y 5.2 L/100km en carretera con buena reserva de par (340 Nm).',
          isModelGeneral: true
        },
        {
          type: 'pro',
          title: 'Abundancia de recambios y talleres',
          description: 'Plataforma MQB muy común en el grupo VAG, reduciendo costes de mantenimiento y repuestos.',
          isModelGeneral: true
        },
        {
          type: 'con',
          title: 'Filtro de partículas DPF si se usa solo en ciudad',
          description: 'En trayectos muy cortos puede saturarse el filtro anti-partículas. Requiere salir a autovía periódicamente.',
          isModelGeneral: true
        },
        {
          type: 'known_issue',
          title: 'Bomba de agua del sistema de distribución',
          description: 'En este motor la bomba de agua de origen puede agarrotarse pasados los 120.000 km. Conviene sustituirla junto con la correa.',
          isModelGeneral: true
        }
      ],
      realCost: {
        askingPrice: 11900,
        transferFees: 220,
        initialMaintenanceMin: 280,
        initialMaintenanceMax: 450,
        visibleRepairsMin: 200,
        visibleRepairsMax: 350,
        totalMin: 12600,
        totalMax: 12920
      },
      repairs: [
        {
          id: 'rep-1',
          partName: 'Mantenimiento inicial (Aceite 5W30 + 4 Filtros)',
          whatItDoes: 'Garantiza la lubricación y respiración limpia del motor.',
          whyAttentionNeeded: 'Recomendable al comprar cualquier coche usado para reiniciar el contador de mantenimiento.',
          costNewMin: 110,
          costNewMax: 160,
          laborCostMin: 50,
          laborCostMax: 80,
          totalEstimatedMin: 160,
          totalEstimatedMax: 240,
          priority: 'Alta',
          category: 'Mantenimiento'
        },
        {
          id: 'rep-2',
          partName: '2 Neumáticos delanteros 225/45 R17',
          whatItDoes: 'Agarre motriz y de frenado en el eje delantero.',
          whyAttentionNeeded: 'Desgaste visual cercano al testigo legal.',
          costNewMin: 150,
          costNewMax: 220,
          laborCostMin: 30,
          laborCostMax: 50,
          totalEstimatedMin: 180,
          totalEstimatedMax: 270,
          priority: 'Media',
          category: 'Seguridad'
        }
      ],
      checklist: [
        {
          id: 'chk-1',
          task: 'Arrancar el motor en frío y escuchar el sonido de la correa',
          explanation: 'Pregunta si el coche lleva parado al menos 3 horas. Al arrancar, no debe sonar ningún chirrido ni traqueteo metálico.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-2',
          task: 'Comprobar el pedal de embrague al cambiar de marcha',
          explanation: 'Pisa el embrague suavemente. No debe estar excesivamente duro ni retemblar el coche al salir en primera marcha.',
          checked: false,
          category: 'Conducción'
        },
        {
          id: 'chk-3',
          task: 'Pedir libro de mantenimiento o facturas de la distribución',
          explanation: 'Verifica si la correa de distribución fue cambiada previamente. En este modelo se recomienda a los 120.000–150.000 km.',
          checked: false,
          category: 'Documentación'
        },
        {
          id: 'chk-4',
          task: 'Probar el aire acondicionado / climatizador bi-zona',
          explanation: 'Pon el clima a la temperatura mínima en un lado y máxima en otro para comprobar los servomotores de las trampillas.',
          checked: false,
          category: 'Exterior/Interior'
        }
      ],
      recommendation: 'El vehículo está en muy buen estado general. Te recomendamos intentar negociar un descuento de unos 400 € a 500 € argumentando el próximo cambio de neumáticos y mantenimiento inicial.',
      cannotDetermineNote: '⚠️ No podemos verificar mediante fotografías el desgaste interno del embrague, compresión de cilindros o el historial de cargas del filtro DPF. Comprueba estas partes en la prueba de conducción.'
    }
  },
  {
    id: 'bmw-e46-320d',
    name: 'BMW Serie 3 320d (E46)',
    subtitle: 'Año 2003 • 265.000 km • 150 CV • Diésel',
    thumbnail: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
    mileage: 265000,
    askingPrice: 3800,
    photos: {
      front: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
      engine: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
    },
    report: {
      id: 'bmw-e46-report',
      createdAt: '2026-08-11T10:05:00Z',
      photos: {
        front: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      },
      identity: {
        make: 'BMW',
        model: 'Serie 3',
        generation: 'E46 Restyling',
        estimatedYearMin: 2002,
        estimatedYearMax: 2005,
        engine: '2.0d (M47N)',
        fuelType: 'Diésel',
        powerHp: 150,
        transmission: 'Manual',
        confidenceScore: 92,
        needsConfirmation: false
      },
      mileageKm: 265000,
      userPrice: 3800,
      score: 64,
      scoreLabel: 'Precaución / negociar',
      scoreBadgeColor: 'yellow',
      scoreCategories: [
        { name: 'Fiabilidad', score: 65, weight: 25, description: 'Motor duro pero con puntos críticos (palomillas de admisión y turbo) en unidades sin revisar.' },
        { name: 'Estado visible', score: 62, weight: 20, description: 'Desgaste acorde a los años. Faros algo opacos y algún arañazo.' },
        { name: 'Mantenimiento', score: 58, weight: 20, description: 'Silentblocks delanteros y flector de transmisión suelen requerir cambio a este kilometraje.' },
        { name: 'Riesgo mecánico', score: 60, weight: 15, description: 'Riesgo medio por kilometraje. Necesita inspección previa de palomillas.' },
        { name: 'Relación calidad/precio', score: 72, weight: 20, description: 'Precio de acceso atractivo para un propulsión trasera clásico.' }
      ],
      visualObservations: [
        {
          category: 'Exterior',
          part: 'Faros delanteros',
          status: 'warning',
          title: 'Policarbonato de faros opaco / amarilleado',
          description: 'Reduce la intensidad lumínica nocturna y puede ser falta en la ITV.',
          actionRequired: 'Pulido de faros (~40 €)'
        },
        {
          category: 'Interior',
          part: 'Orejera asiento conductor',
          status: 'warning',
          title: 'Desgaste notable en tela/cuero del lateral',
          description: 'Típico roce al entrar y salir con 260.000+ km.',
        }
      ],
      modelProsCons: [
        {
          type: 'pro',
          title: 'Chasis y dinámica de conducción muy ágil',
          description: 'Reparto de pesos 50/50 y propulsión trasera con tacto directo de dirección.',
          isModelGeneral: true
        },
        {
          type: 'con',
          title: 'Palomillas/mariposas de admisión',
          description: 'CRÍTICO: Las palomillas metálicas de la colector de admisión de serie pueden desprenderse y romper el motor. Hay que comprobar si están anuladas/extirpadas.',
          isModelGeneral: true
        },
        {
          type: 'known_issue',
          title: 'Silentblocks de trapecios delanteros',
          description: 'Punto débil del chasis E46. Producen holgura y retemblor en el volante al frenar despacio.',
          isModelGeneral: true
        }
      ],
      realCost: {
        askingPrice: 3800,
        transferFees: 180,
        initialMaintenanceMin: 350,
        initialMaintenanceMax: 600,
        visibleRepairsMin: 300,
        visibleRepairsMax: 550,
        totalMin: 4630,
        totalMax: 5130
      },
      repairs: [
        {
          id: 'rep-bmw-1',
          partName: 'Anulación de Palomillas de Admisión + Kit Tapones',
          whatItDoes: 'Evita la trágica caída de mariposas metálicas dentro de los cilindros.',
          whyAttentionNeeded: 'Operación preventivamente imprescindible en motores M47N de 150CV.',
          costNewMin: 30,
          costNewMax: 60,
          laborCostMin: 100,
          laborCostMax: 150,
          totalEstimatedMin: 130,
          totalEstimatedMax: 210,
          priority: 'Alta',
          category: 'Motor / Prevención'
        },
        {
          id: 'rep-bmw-2',
          partName: 'Silentblocks trapecios delanteros (MEYLE HD)',
          whatItDoes: 'Sujeta los brazos de suspensión eliminando holguras.',
          whyAttentionNeeded: 'Mejora radicalmente la estabilidad del eje delantero.',
          costNewMin: 70,
          costNewMax: 120,
          laborCostMin: 60,
          laborCostMax: 90,
          totalEstimatedMin: 130,
          totalEstimatedMax: 210,
          priority: 'Media',
          category: 'Chasis / Suspensión'
        }
      ],
      checklist: [
        {
          id: 'chk-bmw-1',
          task: 'Preguntar explícitamente si las palomillas del colector están anuladas',
          explanation: 'Pide al vendedor confirmación o factura del taller donde las quitaron o pusieron tapones de aluminio.',
          checked: false,
          category: 'Motor'
        },
        {
          id: 'chk-bmw-2',
          task: 'Acelerar a fondo en 3ª velocidad desde 1.800 rpm',
          explanation: 'Observa por el espejo retrovisor si echa humo negro denso o si el turbo silba como una sirena de ambulancia.',
          checked: false,
          category: 'Conducción'
        },
        {
          id: 'chk-bmw-3',
          task: 'Revisar la holgura en la palanca de cambios (flector de transmisión)',
          explanation: 'Si da un golpe "clonk" en la parte trasera al soltar el embrague, el flector de goma del diferencial está desgastado.',
          checked: false,
          category: 'Conducción'
        }
      ],
      recommendation: 'Es un coche clásico divertido, pero solo recomendamos comprarlo si compruebas que las palomillas de admisión están anuladas o si descuentas 500 € para la puesta a punto en taller especialista.',
      cannotDetermineNote: '⚠️ No es posible comprobar fotográficamente el estado del turbo interno, fisuras en el subchasis trasero ni las palomillas de admisión.'
    }
  },
  {
    id: 'peugeot-208-puretech',
    name: 'Peugeot 208 1.2 PureTech',
    subtitle: 'Año 2018 • 89.000 km • 82 CV • Gasolina • DATOS DE DEMOSTRACIÓN',
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    mileage: 89000,
    askingPrice: 7900,
    photos: {
      front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    },
    report: {
      id: 'peugeot-208-report',
      createdAt: '2026-08-11T11:00:00Z',
      photos: {
        front: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
      },
      identity: {
        make: 'Peugeot',
        model: '208',
        generation: 'I Restyling',
        estimatedYearMin: 2017,
        estimatedYearMax: 2019,
        engine: '1.2 PureTech VTi',
        fuelType: 'Gasolina',
        powerHp: 82,
        transmission: 'Manual',
        confidenceScore: 95,
        needsConfirmation: false
      },
      mileageKm: 89000,
      userPrice: 7900,
      score: 58,
      scoreLabel: 'Alto riesgo',
      scoreBadgeColor: 'red',
      scoreCategories: [
        { name: 'Fiabilidad', score: 40, weight: 25, description: 'Motor PureTech con correa húmeda propensa a deshilacharse en el aceite.' },
        { name: 'Estado visible', score: 82, weight: 20, description: 'Pintura e interior en buen estado estético.' },
        { name: 'Mantenimiento', score: 50, weight: 20, description: 'Requiere comprobar urgente la correa de distribución por el tapón de aceite.' },
        { name: 'Riesgo mecánico', score: 45, weight: 15, description: 'Riesgo alto de atasco en bomba de aceite.' },
        { name: 'Relación calidad/precio', score: 65, weight: 20, description: 'Precio accesible pero con posible gasto oculto.' }
      ],
      visualObservations: [
        {
          category: 'Motor',
          part: 'Tapón de llenado de aceite / Correa',
          status: 'danger',
          title: 'REVISIÓN OBLIGATORIA: Estado de la correa húmeda',
          description: 'En los motores 1.2 PureTech la correa se deshace con el aceite y atasca la bomba de lubricación.',
          actionRequired: 'Inspeccionar anchura y grietas de la correa con galga específica'
        }
      ],
      modelProsCons: [
        {
          type: 'pro',
          title: 'Diseño moderno y puesto de conducción i-Cockpit',
          description: 'Consumos reducidos en ciudad y gran agilidad.',
          isModelGeneral: true
        },
        {
          type: 'con',
          title: 'Problema crítico conocido: Correa húmeda de distribución',
          description: 'CRÍTICO: La correa va sumergida en el aceite motor y puede degradarse soltando restos al cárter.',
          isModelGeneral: true
        }
      ],
      realCost: {
        askingPrice: 7900,
        transferFees: 200,
        initialMaintenanceMin: 450,
        initialMaintenanceMax: 850,
        visibleRepairsMin: 250,
        visibleRepairsMax: 500,
        totalMin: 8800,
        totalMax: 9450
      },
      repairs: [
        {
          id: 'rep-peug-1',
          partName: 'Sustitución Preventiva Correa Distribución Húmeda + Limpieza Cárter',
          whatItDoes: 'Asegura que la correa nueva no desprenda goma al aceite motor.',
          whyAttentionNeeded: 'Avería recurrente muy costosa si se rompe la bomba de aceite.',
          costNewMin: 220,
          costNewMax: 350,
          laborCostMin: 250,
          laborCostMax: 400,
          totalEstimatedMin: 470,
          totalEstimatedMax: 750,
          priority: 'Alta',
          category: 'Motor / Crítico'
        }
      ],
      checklist: [
        {
          id: 'chk-peug-1',
          task: 'Mirar por el tapón de llenado de aceite el estado de la correa',
          explanation: 'Abre el tapón del aceite y observa la correa. Si se ve agrietada, no compres sin antes sustituirla.',
          checked: false,
          category: 'Motor'
        }
      ],
      recommendation: 'Vehículo con alto riesgo mecánico por el historial del motor PureTech. Exige factura de cambio de correa reciente.',
      cannotDetermineNote: '⚠️ No es posible determinar por fotografía la degradación química interna de la correa húmeda.'
    }
  },
  {
    id: 'toyota-yaris-10',
    name: 'Toyota Yaris 1.0 VVT-i',
    subtitle: 'Año 2015 • 112.000 km • 69 CV • Gasolina • DATOS DE DEMOSTRACIÓN',
    thumbnail: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
    mileage: 112000,
    askingPrice: 6500,
    photos: {
      front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
    },
    report: {
      id: 'toyota-yaris-report',
      createdAt: '2026-08-11T12:00:00Z',
      photos: {
        front: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
      },
      identity: {
        make: 'Toyota',
        model: 'Yaris',
        generation: 'XP130',
        estimatedYearMin: 2014,
        estimatedYearMax: 2016,
        engine: '1.0 VVT-i',
        fuelType: 'Gasolina',
        powerHp: 69,
        transmission: 'Manual',
        confidenceScore: 96,
        needsConfirmation: false
      },
      mileageKm: 112000,
      userPrice: 6500,
      score: 88,
      scoreLabel: 'Buena opción',
      scoreBadgeColor: 'green',
      scoreCategories: [
        { name: 'Fiabilidad', score: 95, weight: 25, description: 'Motor atmosférico tricilíndrico con cadena indestructible.' },
        { name: 'Estado visible', score: 85, weight: 20, description: 'Excelente conservación general.' },
        { name: 'Mantenimiento', score: 88, weight: 20, description: 'Distribución por cadena sin cambio periódico.' },
        { name: 'Riesgo mecánico', score: 90, weight: 15, description: 'Muy bajo riesgo de averías.' },
        { name: 'Relación calidad/precio', score: 82, weight: 20, description: 'Excelente valor de reventa.' }
      ],
      visualObservations: [
        {
          category: 'Exterior',
          part: 'Carrocería',
          status: 'good',
          title: 'Sin abolladuras ni defectos visibles',
          description: 'Ligeros roces de uso urbano normal.'
        }
      ],
      modelProsCons: [
        {
          type: 'pro',
          title: 'Cadena de distribución de por vida',
          description: 'Ahorro considerable en mantenimiento al no llevar correa.',
          isModelGeneral: true
        }
      ],
      realCost: {
        askingPrice: 6500,
        transferFees: 180,
        initialMaintenanceMin: 150,
        initialMaintenanceMax: 250,
        visibleRepairsMin: 100,
        visibleRepairsMax: 200,
        totalMin: 6930,
        totalMax: 7130
      },
      repairs: [
        {
          id: 'rep-toy-1',
          partName: 'Cambio de Aceite 0W20 y Filtro de Aceite',
          whatItDoes: 'Protege la lubricación básica.',
          whyAttentionNeeded: 'Revisión periódica recomendada.',
          costNewMin: 70,
          costNewMax: 110,
          laborCostMin: 30,
          laborCostMax: 50,
          totalEstimatedMin: 100,
          totalEstimatedMax: 160,
          priority: 'Baja',
          category: 'Mantenimiento'
        }
      ],
      checklist: [
        {
          id: 'chk-toy-1',
          task: 'Probar suavemente el embrague en marcha corta',
          explanation: 'Comprueba que las marchas entren con suavidad sin rascar.',
          checked: false,
          category: 'Conducción'
        }
      ],
      recommendation: 'Excelente utilitario urbano para comprar sin dudar. Muy fiable y económico.',
      cannotDetermineNote: '⚠️ No es posible determinar fotográficamente el desgaste de discos de freno o la salud de la batería de 12V.'
    }
  }
];
