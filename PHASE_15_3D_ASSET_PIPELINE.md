# CARCHECK AI — FASE 15: 3D ASSET PIPELINE PROTOTYPE

Este documento define la arquitectura y el estándar de producción para la ingesta, optimización, licenciamiento y vinculación de modelos 3D en **CARCHECK AI / OCHE**.

---

## 1. Regla Inviolable del Sistema 3D (Non-Diagnostic Invariant)

> **"El 3D NO diagnostica el coche. El 3D representa la arquitectura técnica y de despiece del modelo. Las fotografías y la inspección física representan la unidad real."**

El sistema tiene prohibido fabricar diagnósticos basados en la selección 3D. Nunca se debe inferir ni mostrar avisos como *"Tu turbo está averiado"* únicamente porque el usuario examine la pieza en el visor. La inspección de la unidad concreta depende exclusivamente de las fotografías escaneadas y los datos introducidos por el usuario.

---

## 2. Formatos de Entrada y Salida Recomendados

- **Formatos de Ingesta / Trabajo**:
  - `BLEND` (Blender): Archivo de edición y jerarquía maestra.
  - `FBX` / `OBJ`: Modelos CAD o escaneos brutos de proveedores y estudios.
- **Formato Final de Producción Web**:
  - **`GLB / GLTF`** optimizado y comprimido con extensión DRACO o Meshopt.
  - Formato autocontenido binario (`.glb`) con texturas embebidas o referenciadas en formato KTX2 / WebP.

---

## 3. Estructura de Datos `Car3DAsset`

```typescript
export interface Car3DAsset {
  id: string;                               // Identificador único del asset (ej: 'asset-golf-7-tdi')
  vehicleId: string;                        // ID foráneo hacia VehicleRepository (ej: 'golf-7-tdi')
  source: string;                           // Procedencia técnica / autor del modelado
  license: AssetLicenseMetadata;            // Control de licencias y derechos comerciales
  format: 'GLB' | 'GLTF' | 'FBX' | 'OBJ' | 'BLEND';
  fileUrl?: string;                         // Ruta web o CDN al archivo binario (.glb)
  thumbnailUrl?: string;                    // Previsualización 2D
  polygonCount: number;                     // Conteo de triángulos / polígonos
  textureSize: string;                      // Resolución de mapas (ej: '1024x1024')
  hasInterior: boolean;                     // Flag de habitáculo modelado
  hasEngine: boolean;                       // Flag de conjunto propulsor modelado
  hasDoors: boolean;                        // Flag de puertas independientes
  hasHood: boolean;                         // Flag de capó articulable
  hasTrunk: boolean;                        // Flag de portón articulable
  hasWheels: boolean;                       // Flag de ruedas y frenos independientes
  parts: Car3DAssetPart[];                  // Jerarquía de nodos de piezas
  optimizationStatus: 'raw' | 'optimized' | 'lod_ready' | 'compressed';
  lodLevels?: LodLevel[];                   // Niveles LOD0, LOD1, LOD2
  compressionFormat?: 'DRACO' | 'EXT_meshopt_compression' | 'KTX2_BASIS' | 'NONE';
  supportedInteractions: Supported3DInteraction[];
  isReadyForWebProduction: boolean;
}
```

---

## 4. Jerarquía de Piezas (`Car3DAssetPart`)

Cada pieza forma parte de un árbol de dependencias mecánicas:

```
vehicle (Root)
 ├── body (Carrocería Monocasco)
 │    ├── hood (Capó delantero - Separable / Articulable)
 │    ├── doors (Puertas - Separable / Articulable)
 │    ├── trunk (Portón - Separable / Articulable)
 │    ├── interior (Habitáculo)
 │    │    ├── dashboard (Salpicadero)
 │    │    ├── steeringWheel (Volante)
 │    │    ├── seats (Asientos)
 │    │    └── centerConsole (Consola Central)
 │    │
 │    ├── engine (Conjunto Motor)
 │    │    ├── engineBlock (Bloque Motor)
 │    │    ├── turbo (Turbocompresor)
 │    │    ├── intake / swirlFlaps (Admisión / Mariposas)
 │    │    ├── cooling / waterPump (Refrigeración / Bomba de Agua)
 │    │    └── wetBelt / chain (Distribución Húmeda / Cadena)
 │    │
 │    ├── brakes (Frenos Delanteros y Traseros)
 │    ├── suspension (Amortiguadores y Silentblocks)
 │    └── transmission (Caja de Cambios y Embrague)
```

Cada nodo incluye:
- `id`: ID único del nodo (ej. `part-golf-waterpump`).
- `name`: Nombre legible en español técnico.
- `category`: Categoría funcional (`body`, `interior`, `engine`, `brakes`, `suspension`, etc.).
- `parentPartId`: ID de la pieza padre (para despiece y aislamiento en capas).
- `systemId`: Sistema canónico (`ENGINE`, `BRAKES`, `SUSPENSION`, `TRANSMISSION`, `BODY`, `EXHAUST`, etc.).
- `partKnowledgeId`: Clave foránea al catálogo de piezas canónicas (`Part.id`).
- `position`, `rotation`, `scale`: Transformaciones relativas.
- `visible`, `interactive`, `isSeparableObject`: Flags de interactividad real.

---

## 5. Control de Interacciones y Regla de No Falsificación

El visor soporta:
- **Navegación e Inspección**: `ROTATE`, `ZOOM`, `SELECT`, `HIGHLIGHT`, `INSPECT`, `EXPLODE` (Despiece).
- **Articulaciones Físicas**: `OPEN_HOOD`, `OPEN_DOOR`, `OPEN_TRUNK`.

### Regla Estricta:
**Las articulaciones solo se activan si la pieza existe como objeto geométrico independiente (`isSeparableObject: true` y flag `hasHood`/`hasDoors`/`hasTrunk`).** Está terminantemente prohibido simular o falsear que una puerta o capó se abre si el modelo es un bloque sólido sin bisagras.

---

## 6. Vinculación con el Knowledge Engine

La travesía de datos 3D hacia el motor de conocimiento sigue la cadena:

$$\text{3D Part} \longrightarrow \text{Part} \longrightarrow \text{VehicleSystem} \longrightarrow \text{KnownProblem[]} \longrightarrow \text{Repair[]} \longrightarrow \text{CostEstimate}$$

Ejemplo para el Peugeot 208 PureTech:
1. Selección de `part-p208-wetbelt` en el visor 3D.
2. Resolución a `part-peugeot-wet-belt` en el repositorio canónico.
3. Clasificación en el sistema `ENGINE` (*Motor y Bloque Térmico*).
4. Extracción de fallos endémicos: *Degradación prematura de correa sumergida en aceite*.
5. Estimación de sustitución preventiva en taller (Gama OEM / Aftermarket + Mano de obra ajustada al país activo).

---

## 7. Optimización y Rendimiento Móvil

Para garantizar 60 FPS estables en navegadores móviles (iOS Safari / Android Chrome):

| Parámetro | Límite Máximo Móvil | Recomendado Web |
| :--- | :--- | :--- |
| **Polígonos (LOD0)** | $\le 45.000$ triángulos | $30.000 - 40.000$ |
| **Polígonos (LOD1)** | $\le 18.000$ triángulos | $12.000 - 15.000$ |
| **Polígonos (LOD2)** | $\le 6.000$ triángulos | $4.000 - 6.000$ |
| **Tamaño de Texturas** | $1024 \times 1024$ (KTX2/Basis) | $1024 \times 1024$ o $2048 \times 2048$ |
| **Compresión de Malla** | DRACO / Meshopt | DRACO habilitado |
| **Peso total de archivo** | $< 3.5\text{ MB}$ por modelo | $< 2.0\text{ MB}$ comprimido |
| **Llamadas de dibujado (Draw Calls)** | $\le 25$ | $\le 15$ |

### Pipeline de Conversión con Blender / gltfpack:
```bash
# 1. Exportar desde Blender en GLB con mallas separadas y nombres limpios
# 2. Optimizar y comprimir con gltfpack:
gltfpack -i model_raw.glb -o model_optimized.glb -cc -tc -si 0.5 -kn
```

---

## 8. Gestión de Licencias y Derechos de Uso

Cada `Car3DAsset` almacena metadatos legales obligatorios:
- `licenseType`: `COMMERCIAL_AUTHORIZED` | `EDITORIAL_ONLY` | `ROYALTY_FREE` | `CC_BY` | `PROPRIETARY`.
- `licenseHolder`: Titular de los derechos comerciales.
- `commercialUseAllowed`: Booleano estricto.
- `attributionRequired`: Indica si se debe mostrar texto de atribución legal en la UI.
- `attributionText`: Texto legal requerido si aplica.

---

## 9. Fallback para Vehículos sin Modelo 3D Específico

Cuando se analiza un vehículo que no cuenta con un modelo 3D específico licenciado:
1. La UI muestra el aviso: **"Modelo 3D específico no disponible para este vehículo"**.
2. Ofrece la acción directa: **"Explorar arquitectura general"**, cargando el blueprint universal parametrizado (`asset-generic-car`).
3. La ausencia del modelo 3D **nunca bloquea** la identificación, el análisis fotográfico, el cálculo de costes ni la generación del informe de compra.

---

## 10. Cómo Activar / Desactivar un Modelo

1. **Registrar el Asset**: Añadir la entrada en `src/data/car3DAssetsDatabase.ts` dentro de `CANONICAL_3D_ASSETS`.
2. **Asociar al Repositorio**: Vincular el `vehicleId` con el vehículo correspondiente en `src/repositories/LocalVehicleRepository.ts`.
3. **Desactivación Inmediata**: Establecer `isReadyForWebProduction: false` o retirar el registro de `CANONICAL_3D_ASSETS`. El sistema conmutará automáticamente al fallback universal sin errores de consola.
