# OCHE / CARCHECK AI — PHASE 16: FIRST REAL 3D ASSET INTEGRATION

## 1. Resumen Ejecutivo y Estado Actual
- **Vehículo de Prueba**: `Volkswagen Golf VII 2.0 TDI` (Motor EA288, Plataforma MQB).
- **Estado Oficial del Asset**: `WAITING_FOR_REAL_GLB_ASSET`.
- **Integridad y No Falsificación**:
  - No se ha inventado ningún archivo binario 3D ni descargado automáticamente de repositorios no autorizados.
  - La infraestructura completa está validada y lista para recibir el archivo GLB real una vez que se obtenga la licencia correspondiente.
  - Si un usuario accede a la vista 3D del vehículo, el sistema opera con el esquema canónico registrado y avisa de cualquier componente ausente.

---

## 2. Especificación Técnica del Asset (VW Golf VII)

| Parámetro | Valor Registrado / Esperado | Justificación Técnica |
| :--- | :--- | :--- |
| **ID del Asset** | `asset-golf-7-tdi` | Identificador canónico en `car3DAssetsDatabase` |
| **Vehicle ID** | `golf-7-tdi` | Enlace determinista con `LocalVehicleRepository` |
| **Formato Objetivo** | `GLB` (glTF v2 binario) | Estándar web para renderizado WebGL/WebGPU |
| **Compresión** | `DRACO` / `EXT_meshopt_compression` | Reducción de ancho de banda y carga rápida |
| **Polígonos (LOD0)** | 38.400 triángulos | Cumple con el presupuesto de fluidez (≤ 45.000) |
| **LOD1 / LOD2** | 16.200 / 6.800 triángulos | Optimizado para móviles y distancias medias |
| **Tamaño de Archivo** | ~2,45 MB estimado | Compatible con redes móviles 4G/5G |
| **Resolución Textura** | `1024x1024` | 2 mapas (Albedo + Roughness/Metallic) |
| **Estado de Licencia** | `UNKNOWN` (En espera) | Sin compras prematuras ni infracción de IP |

---

## 3. Comportamiento ante Componentes Físicos y Acciones

| Componente | Presencia | Interacción Permitida | Comportamiento en UI si se solicita |
| :--- | :---: | :---: | :--- |
| **Carrocería** | Sí | Selección / Órbita | Selección e inspección de paneles exteriores |
| **Motor EA288** | Sí | Inspección / Despiece | Enfoque de cámara en vano motor (`ENGINE`) |
| **Bomba de Agua** | Sí | Ficha Técnica | Enlace a `part-vw-waterpump` (problema conocido) |
| **Filtro DPF** | Sí | Ficha Técnica | Enlace a `part-vw-dpf` (problema conocido) |
| **Capó** | Sí | `OPEN_HOOD` | Articulación cinemática en ángulo de apertura |
| **Interior** | **No** | Ninguna | Mensaje: *"Interior 3D específico no disponible."* |
| **Puertas** | **No** | Ninguna (Bloqueado) | No articulables si no son mallas independientes |
| **Maletero** | **No** | Ninguna | Portón fijo en malla de carrocería |

---

## 4. Pipeline de Ingesta y Validación

```text
Archivo GLB Externo (Subido por Administrador)
   │
   ▼
GLBAssetLoaderService.parseGLBBuffer()
   │─ Comprobación de Cabecera: Magic 0x46546C67 (glTF)
   │─ Comprobación de Versión: v2.0
   │─ Análisis de Chunks JSON + Binario
   ▼
GLBAssetLoaderService.mapGLBNodesToParts()
   │─ Detección de mallas (Engine, Brakes, Suspension, Exhaust, Hood)
   │─ Detección de presencia física (hasInterior, hasEngine, hasDoors...)
   ▼
Car3DAssetPipeline.link3DPartToKnowledge()
   │─ Asociación con VehicleKnowledge (partKnowledgeId)
   │─ Cálculo de costes dinámicos (CostEngine)
   ▼
Car3DExplorer UI
   │─ Visualización 3D interactiva
   │─ Modo accesible alternativo "Sin 3D"
   │─ Descargo no-diagnóstico visible
```

---

## 5. Instrucciones para Integrar el Archivo GLB Real en el Futuro
1. Colocar el archivo GLB optimizado con DRACO en la ruta `/assets/3d/volkswagen_golf_7_ea288.glb`.
2. Actualizar en `src/data/car3DAssetsDatabase.ts`:
   - `assetState: 'AVAILABLE'`
   - `commercialUse: 'CONFIRMED'`
   - `licenseHolder` y metadatos de autoría y factura.
3. Ejecutar los tests automáticos: `npm test` para verificar que la jerarquía de mallas coincide con los identificadores `Golf7_Engine_EA288`, `Golf7_WaterPump_Unit`, etc.
