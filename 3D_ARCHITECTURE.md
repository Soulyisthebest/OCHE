# 📐 3D ARCHITECTURE SPECIFICATION — INTERACTIVE VEHICLE KNOWLEDGE SYSTEM

> **CARCHECK AI / OCHE — FASE 7**  
> *Transformación del explorador 3D en una interfaz visual de conocimiento automotriz interactiva y desacoplada.*

---

## 1. PRINCIPIO Y FILOSOFÍA

El sistema 3D en CARCHECK AI **no es una simple decoración visual**. Es una **interfaz de acceso directo al conocimiento mecánico**, conectando modelos geométricos y diagramas con la ontología automotriz, el motor de costes por país, la guía de inspección técnica, el informe de escaneo y el asistente de chat contextual.

### Flujo de Navegación de Conocimiento:
```
COCHE (Car3DModel)
  └── ZONA (3D Zone)
        └── SISTEMA (16 Engineering Systems)
              └── PIEZA (Part3D / Part)
                    ├── PROBLEMAS CONOCIDOS (KnownProblem)
                    ├── SÍNTOMAS (SymptomExplorer)
                    ├── GUÍA DE COMPROBACIÓN (InspectionGuide)
                    ├── REPARACIÓN & MANO DE OBRA (LaborHours)
                    └── COSTE MULTI-MERCADO (CostEngine)
```

---

## 2. ARQUITECTURA DE MODELOS 3D (`Car3DModel`)

Cada modelo en el sistema implementa la interfaz canónica `Car3DModel` definida en `/src/types/vehicle3D.ts`:

```typescript
export interface Car3DModel {
  id: string;
  vehicleConfigurationId: string;
  modelName: string;
  make?: string;
  model?: string;
  engine?: string;
  generation?: string;
  yearStart?: number;
  yearEnd?: number;
  modelType: Model3DType; // 'SVG' | 'CANVAS' | 'GLTF' | 'GLB' | 'THREE_JS' | 'INTERACTIVE_VECTOR' | 'FUTURE_MODEL'
  assetPath: string;
  format: string;
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  camera: {
    fov: number;
    near: number;
    far: number;
    initialPosition: { x: number; y: number; z: number };
    initialTarget: { x: number; y: number; z: number };
  };
  parts: Car3DPart[];
  zones: Car3DZone[];
  metadata: {
    author?: string;
    license: string;
    source: string;
    usageRights: string;
    description: string;
    trianglesCount?: number;
    materialsCount?: number;
    hasExplodedView: boolean;
    hasAnimations: boolean;
  };
  isDemo: boolean;
}
```

### Model Types Soportados:
1. **`INTERACTIVE_VECTOR` / `SVG` / `CANVAS`**: Renderizado nativo reactivo, 0 dependencias pesadas, carga instantánea, compatible con móviles de gama de entrada.
2. **`GLTF` / `GLB` / `THREE_JS`**: Arquitectura lista para cargar mallas poligonales reales (Three.js / WebGL) mediante `assetPath` sin cambiar la lógica de conocimiento ni las interfaces.
3. **`FUTURE_MODEL`**: Adaptador extensible para gemelos digitales o escaneos fotogramétricos futuros.

---

## 3. PIEZAS Y HOTSPOTS (`Car3DPart`)

Cada pieza 3D contiene:
- `id`: Identificador único en el canvas 3D (ej. `p3d-golf-turbo`).
- `partId`: Clave foránea al catálogo global de piezas del repositorio (`part-gen-turbocharger`).
- `name`: Nombre descriptivo legible.
- `systemId`: Sistema de ingeniería (`ENGINE`, `BRAKES`, `SUSPENSION`, `TRANSMISSION`, `ELECTRICAL`, `COOLING`, `EXHAUST`, `STEERING`, etc.).
- `modelNodeId`: Nodo de la geometría vectorial o malla GLTF.
- `position`, `rotation`, `scale`: Coordenadas espaciales.
- `hotspot`: Coordenadas 2D/3D con etiqueta para hover y toque táctil.
- `interactable`: Flag de interactividad.
- `importance`: Nivel de relevancia crítica (`HIGH`, `MEDIUM`, `LOW`).

---

## 4. PUENTE CON EL MOTOR DE CONOCIMIENTO (`Vehicle3DService`)

El componente 3D **nunca contiene datos mecánicos hardcodeados**. Invoca a `Vehicle3DService.getPartKnowledgeCard(partId, model, countryCode, report)` que resuelve:

1. **Catálogo de Pieza (`Part`)**: Datos canónicos del componente en `GlobalVehicleKnowledgeRepository`.
2. **Sistema de Ingeniería (`VehicleSystem`)**: Categorización estándar.
3. **Explicación Dual ELI5 vs. Avanzada**:
   - `basicExplanation`: Explicación sencilla sin tecnicismos para el comprador general ("El turbo ayuda al motor a respirar mejor").
   - `detailedExplanation`: Explicación técnica para usuarios avanzados y mecánicos ("El turbocompresor utiliza los gases de escape para comprimir el aire de admisión").
4. **Problemas Conocidos (`KnownProblem[]`)**: Lista de fallos típicos del modelo con severidad, síntomas, causas y soluciones.
5. **Costes Dinámicos por País (`CostEngine` + `CountryProfile`)**:
   - `partNew`: Precio nuevo promedio en la divisa local.
   - `partOem`: Recambio original del fabricante.
   - `partAftermarket`: Recambio compatible de alta calidad.
   - `partUsed`: Recambio de desguace o segunda mano comprobado.
   - `laborHours` y `laborCost`: Coste de mano de obra según la tarifa horaria del país seleccionado (España EUR, México MXN, Alemania EUR, Colombia COP, etc.).
   - `totalEstimatedExpected`, `min`, `max`.
6. **Guía de Inspección (`InspectionGuide`)**:
   - `whatToLookFor`: Qué mirar.
   - `howToCheck`: Cómo comprobarlo de forma segura (sin herramientas peligrosas).
   - `whatIsNormal`: Qué es comportamiento normal.
   - `whatIsConcerning`: Qué síntomas son motivo de alarma o sospecha.
   - `whenToCallMechanic`: Cuándo derivar a un taller profesional.
7. **Explorador de Síntomas (`SymptomExplorer`)**: Mapeo no determinista ("posibles causas", no afirmaciones absolutas falsas).
8. **Integración con Informe de Escaneo (`Scan → 3D`)**:
   - Mapea observaciones visuales o reparaciones urgentes del escaneo al estado visual (`OBSERVED`, `POSSIBLE`, `KNOWN`, `UNKNOWN`).
9. **Integración con Asistente de Chat (`3D → Chat`)**:
   - Genera el payload estructurado `ChatPartContext` con el vehículo, la pieza, el sistema y la pregunta precargada.

---

## 5. SISTEMA DE CÁMARA Y PRESETS

El viewport 3D dispone de presets de cámara cinematográficos:
- `FULL CAR`: Vista global orbital 360º.
- `FRONT`: Foco en morro, radiador e intercooler.
- `SIDE`: Foco en pasos de rueda, neumáticos y frenos.
- `REAR`: Foco en escape, diferencial y suspensión trasera.
- `ENGINE`: Vista cenital del vano motor con zoom de detalle.
- `INTERIOR`: Cabina y cuadro de instrumentos.
- `UNDERBODY`: Vista inferior de chasis, línea de escape y transmisión.

---

## 6. VISTA EXPLOSIONADA (EXPLODED VIEW ARCHITECTURE)

La arquitectura define la interfaz de separación de subsistemas (`explodedViewOffset` y `explosionFactor`), permitiendo deslizar visualmente el bloque motor, tren delantero, línea de escape y suspensión hacia afuera del chasis sin romper la jerarquía de coordenadas de los hotspots.

---

## 7. ACCESIBILIDAD Y RENDIMIENTO (FALLBACK 2D)

- **Lista de Sistemas & Piezas**: Accesible como vista alternativa para lectores de pantalla o navegación por teclado.
- **Detección de Rendimiento**: Si el dispositivo no soporta aceleración gráfica adecuada o se activa el modo bajo consumo, conmuta automáticamente a la vista 2D interactiva (`2D Interactive Vehicle View`).
- **Gesto Táctil Móvil**: Soporte para rotación con 1 dedo, zoom con pellizco de 2 dedos (pinch-to-zoom), toque simple para seleccionar y doble toque para recentrar cámara.

---

## 8. LICENCIAS Y ATRIBUCIÓN

- Todos los modelos integrados incluyen metadatos de licencia (`license: 'MIT / Creative Commons Zero'`, `isDemo: true/false`).
- Prohibición estricta de assets con copyright no autorizado.
