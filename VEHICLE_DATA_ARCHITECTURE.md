# OCHE / CARCHECK AI — Global Vehicle Knowledge Core
## Documentación de Arquitectura de Datos Automovilísticos (FASE 5)

---

### 1. Visión y Principios Rectores

OCHE / CARCHECK AI implementa una arquitectura ontológica automovilística de clase mundial diseñada para representar con precisión de ingeniería cualquier vehículo a escala global.

#### Principios Fundamentales:
1. **Separación entre Vehículo Global y Configuración de Mercado**: Un vehículo comparte la misma ingeniería base en todo el mundo, pero adopta denominaciones comerciales, acabados, normativas de emisiones, impuestos e inspecciones diferentes según el país.
2. **Cero Invención de Datos (Zero Fabrication)**: Toda entidad automovilística (códigos de motor, problemas conocidos, intervalos de mantenimiento, mano de obra) cuenta con trazabilidad explícita de procedencia (`source`, `sourceType`, `confidence`, `isDemo`).
3. **Desambiguación Explícita**: Si una consulta de usuario es ambigua (ej. "BMW 320d 2015" que podría corresponder a F30 con motor N47 o B47), el sistema no adivina silenciosamente; expone los candidatos con sus puntuaciones de confianza.
4. **16 Sistemas Físicos Estándar**: Cobertura integral de la arquitectura del automóvil sin solapamientos ni omisiones.

---

### 2. Jerarquía de Entidades

```
BRAND (Marca)
  └── MODEL (Modelo)
        └── GENERATION (Generación)
              ├── FACELIFT / RESTYLING (Rediseño de mitad de ciclo)
              └── VEHICLE CONFIGURATION (Configuración técnica base)
                    ├── ENGINE (Motorización)
                    │     └── ENGINE CODES (Códigos de bloque/inyección)
                    ├── TRANSMISSION & DRIVETRAIN
                    ├── 16 STANDARD SYSTEMS (Sistemas de ingeniería)
                    │     └── PARTS (Piezas y componentes)
                    ├── KNOWN PROBLEMS (Averías y defectos conocidos)
                    ├── MAINTENANCE SCHEDULE (Plan de mantenimiento)
                    ├── REPAIRS & LABOR MATRIX (Reparaciones y tiempos de taller)
                    └── MARKET CONFIGURATIONS (Configuraciones por país / mercado)
                          ├── Trim levels & local model naming
                          ├── Local units (km vs miles, CV vs HP vs PS)
                          ├── Local tax & registration rules (ITV, MOT, TÜV, DGT)
                          └── Local currency & pricing models
```

---

### 3. Los 16 Sistemas Automovilísticos Estándar

| ID del Sistema | Denominación | Cobertura Mecánica / Eléctrica |
| :--- | :--- | :--- |
| `ENGINE` | Motor y Bloque Térmico | Bloque, culata, cigüeñal, pistones, distribución, lubricación y encendido. |
| `TRANSMISSION` | Transmisión y Embrague | Cajas manuales/automáticas, volante bimasa, conjunto de embrague, diferencial. |
| `BRAKES` | Sistema de Frenos | Discos, pastillas, pinzas, latiguillos, bomba principal, servofreno, ABS/ESP. |
| `SUSPENSION` | Suspensión | Amortiguadores, muelles helicoidales, brazos, silentblocks, barra estabilizadora. |
| `STEERING` | Dirección | Cremallera, bomba de asistencia eléctrica/hidráulica, rótulas, caña de dirección. |
| `ELECTRICAL` | Sistema Eléctrico y Electrónica | Batería 12V, alternador, motor de arranque, cableados y centralitas (ECU/BCM). |
| `COOLING` | Refrigeración Térmica | Radiador, bomba de agua, termostato, electroventilador, vaso de expansión. |
| `FUEL` | Alimentación de Combustible | Depósito, bombas de baja/alta presión, rampa de inyección, inyectores. |
| `EXHAUST` | Escape | Colector de escape, turbocompresor, silenciosos, catalizador. |
| `EMISSIONS` | Sistemas Anticontaminación | Válvula EGR, filtro de partículas (DPF/GPF), catalizador SCR/AdBlue, sondas lambda. |
| `BODY` | Carrocería y Estructura | Paneles de chapa, pintura, travesaños, paragolpes, cierres y lunas. |
| `INTERIOR` | Habitáculo e Interior | Tapicerías, cuadro de mandos, botoneras, volante, mecanismos de asientos. |
| `SAFETY` | Seguridad Pasiva y Activa | Airbags, pretensores, sensores de impacto, ISOFIX, cámaras y radares ADAS. |
| `AIR_CONDITIONING` | Climatización y Confort | Compresor A/C, condensador, evaporador, válvula de expansión, filtro habitáculo. |
| `TYRES` | Neumáticos y Llantas | Cubiertas, llantas de aleación/acero, sensores TPMS y alineación geométrica. |
| `DRIVETRAIN` | Tren de Transmisión | Eje de transmisión, cardán, acoplamiento 4WD/AWD (Haldex/xDrive) y bujes. |

---

### 4. Vehículos Canónicos Iniciales (Ground Truth)

1. **Volkswagen Golf VII (Typ 5G)**
   - **ID**: `golf-7-tdi`
   - **Motor**: 2.0 TDI EA288 (150 CV)
   - **Códigos de motor**: `CRBC`, `CRLB`, `DEJA`
   - **Distribución**: Correa dentada (Belt)
   - **Problemas clave**: Bomba de agua con electroválvula de caudal (380–750 €), saturación DPF en uso urbano (150–600 €).
   - **Mercados**: España (`mkt-golf7-es`), Alemania (`mkt-golf7-de`), Reino Unido (`mkt-golf7-uk`).

2. **Peugeot 208 I (A9)**
   - **ID**: `peugeot-208-puretech`
   - **Motor**: 1.2 PureTech 110 (EB2 / EB2DT)
   - **Distribución**: Correa húmeda sumergida en aceite (Wet Belt)
   - **Problemas clave**: Degradación y desprendimiento de goma de correa en aceite con obstrucción de chupona (650–1.400 €), consumo de aceite por carbonilla en segmentos.
   - **Mercados**: España (`mkt-peug208-es`), Francia (`mkt-peug208-fr`).

3. **Toyota Yaris III (XP130)**
   - **ID**: `toyota-yaris-hybrid` (1.0 VVT-i)
   - **Motor**: 1.0 VVT-i 1KR-FE (69 CV)
   - **Distribución**: Cadena metálica (Chain)
   - **Problemas clave**: Desgaste de embrague en ciclo urbano intensivo (320–680 €), rezume leve en retén de bomba de agua (140–320 €).
   - **Mercados**: España (`mkt-toyotayaris-es`).

4. **BMW Serie 3 VI (F30)**
   - **ID**: `bmw-320d-f30`
   - **Motor**: 2.0d TwinPower Turbo (N47D20 / B47D20, 184–190 CV)
   - **Distribución**: Cadena de distribución trasera (Chain)
   - **Problemas clave**: Elongación y rotura de guías en N47 hasta 2015 (1.100–2.400 €), enfriador EGR con campaña oficial de seguridad.
   - **Mercados**: España (`mkt-bmw320d-es`).

---

### 5. Motor de Resolución y Desambiguación (`VehicleResolverService`)

El servicio `resolveVehicle()` implementa:
- **Normalización de alias de marcas**: `VW` / `Volkswagen AG` $\rightarrow$ `Volkswagen`; `PSA` $\rightarrow$ `Peugeot`; `Bimmer` $\rightarrow$ `BMW`.
- **Detección de códigos de motor**: Extracción de `CRBC`, `EB2DT`, `1KR-FE`, `N47D20`, `B47D20`.
- **Cálculo de Confianza**: Ponderación multifactorial (Marca: 35%, Modelo: 30%, Generación/Año: 20%, Motor/Código: 35%).
- **Detección de Ambigüedad**: Si la diferencia de puntuación entre los dos mejores candidatos es menor a 0.15, marca `isAmbiguous: true` y solicita selección explícita del usuario.

---

### 6. Trazabilidad y Metadatos de Procedencia

Cada entidad del núcleo almacena:
```typescript
interface ProvenanceMetadata {
  source?: string;           // ej. "VAG Technical Service Bulletin 15-08"
  sourceType: SourceType;     // "OFFICIAL" | "MANUFACTURER" | "TECHNICAL" | "WORKSHOP" | "COMMUNITY" | "DEMO"
  sourceDate?: string;       // ej. "2023-04-12"
  confidence: number;        // Escala normalizada 0.0 - 1.0
  isDemo?: boolean;          // true para datos de demostración
  createdAt?: string;        // Timestamp ISO-8601
  dataVersion?: string;      // Versión de esquema
}
```

---

### 7. Integración con Gemini y Orquestador de IA

Gemini opera bajo el principio de **Grounding Obligatorio**. El prompt de sistema inyecta la verdad fundamental del catálogo de `VehicleRepository`. En caso de desconexión o fallo de red, `AIOrchestrator` ejecuta una resolución local determinista respaldada por `LocalVehicleRepository` y `CostEngine`.

---

### 8. Pipeline de Importación (`VehicleDataImporter`)

Soporta ingestión de lotes en formato JSON/CSV:
- Valida campos obligatorios.
- Normaliza marcas y modelos contra la base ontológica.
- Genera identificadores deterministas (`vcfg-*`, `eng-*`, `gen-*`).
- Registra el origen y tipo de fuente para evitar contaminación de datos.
