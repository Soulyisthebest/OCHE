# CARCHECK AI / OCHE — INFORME TÉCNICO FASE 3
## MOTOR REAL DE ANÁLISIS DE VEHÍCULOS USADOS (REAL VEHICLE ANALYSIS ENGINE)

---

### 1. RESUMEN EJECUTIVO
Se ha transformado con éxito la aplicación OCHE de un visualizador de información estática a un **sistema activo y determinista de análisis técnico y financiero de vehículos usados**.

La arquitectura sigue de forma estricta el principio de **cero alucinaciones**, trazabilidad total de evidencias, desacoplamiento modular y cálculos financieros deterministas.

---

### 2. PIPELINE DE ANÁLISIS IMPLEMENTADO

```
[Entrada de Fotos + Datos Vendedor]
                 ↓
[1. SCANNING] (Visión y clasificación contextual por ángulo)
                 ↓
[2. IDENTIFYING] (Matching jerárquico contra VehicleRepository)
                 ↓
[3. ANALYZING] (Extracción de evidencias: OBSERVED, KNOWN, INFERRED, UNKNOWN)
                 ↓
[4. CALCULATING] (Riesgos detallados, Costes reales por pieza/mano obra, Puntuación 0-100, Veredicto y Precio Objetivo)
                 ↓
[5. READY] (Informe estructurado en 12 secciones + Simulador What-If + Explicaciones interactivas)
```

---

### 3. COMPONENTES Y SERVICIOS IMPLEMENTADOS

| Servicio / Componente | Archivo | Responsabilidad |
|---|---|---|
| `VehicleAnalysisSession` | `/src/types/analysisSession.ts` | Modelo central de estado y ciclo de vida de la sesión de análisis. |
| `ValidationService` | `/src/services/ValidationService.ts` | Sanitización estricta de todos los campos numéricos, precios, rangos de confianza y estados de sesión para prevenir `NaN` o valores corruptos. |
| `VehicleIdentificationService` | `/src/services/VehicleIdentificationService.ts` | Matching multivariante (marca, modelo, generación, combustible, transmisión, potencia) y análisis contextual de fotos. |
| `RiskEngine` | `/src/services/RiskEngine.ts` | Cálculo de los 6 tipos de riesgo (`visualRisk`, `knownProblemRisk`, `maintenanceRisk`, `repairRisk`, `unknownRisk`, `overallRisk`) con desglose de causas, cómo comprobarlo y coste de exposición. |
| `CostEngine` | `/src/services/CostEngine.ts` | Cálculo de costes comprensivos (pieza vs mano de obra, mínimo, esperado, máximo), cálculo de precio objetivo y simulación "What-If". |
| `PurchaseScoreEngine` & `DecisionEngine` | `/src/services/PurchaseScoreEngine.ts` & `/src/services/DecisionEngine.ts` | Puntuación ponderada (5 pilares: Fiabilidad, Estado visible, Mantenimiento, Riesgo mecánico, Calidad/precio) y veredicto determinista (`GOOD_DEAL`, `FAIR`, `NEGOTIATE`, `HIGH_RISK`, `AVOID`). |
| `AnalysisSessionService` | `/src/services/AnalysisSessionService.ts` | Orquestador maestro del pipeline de análisis con compatibilidad total hacia atrás para todas las vistas existentes. |
| `SellerDataCards` | `/src/components/SellerDataCards.tsx` | Flujo conversacional y visual mediante tarjetas interactivas para capturar precio, km, año y combustible sin formularios tediosos. |
| `VehicleConfirmCard` | `/src/components/VehicleConfirmCard.tsx` | Tarjeta de confirmación "¿Es este coche?" con candidato principal, candidatos alternativos y botón de confirmación/edición. |
| `InteractiveExplanationModal` | `/src/components/InteractiveExplanationModal.tsx` | Diálogo interactivo para las 3 preguntas clave: "¿POR QUÉ?", "¿CUÁNTO?" y "¿CÓMO LO COMPRUEBO?". |
| `AnalysisReport` | `/src/components/AnalysisReport.tsx` | Informe final con las 12 secciones ordenadas según especificación y explicaciones interactivas. |

---

### 4. LAS 12 SECCIONES DEL INFORME FINAL

1. **VEHÍCULO**: Identidad técnica completa (marca, modelo, generación, año, motor, CV, combustible, transmisión, fotos clasificadas).
2. **PUNTUACIÓN**: Puntuación de compra 0 a 100 con desglose en los 5 pilares clave y sello de determinismo.
3. **VEREDICTO**: Clasificación clara (`COMPRA RECOMENDADA`, `PRECAUCIÓN / NEGOCIAR`, `ALTO RIESGO / DESACONSEJADO`).
4. **LO BUENO**: Puntos fuertes contrastados del modelo con botón "¿Por qué?".
5. **LO MALO**: Puntos débiles y fallos endémicos con botón "¿Por qué?" y "¿Cómo lo compruebo?".
6. **RIESGOS**: Matriz de riesgos clasificados con exposición económica.
7. **COSAS QUE NO PODEMOS COMPROBAR**: Límites físicos honestos (compresión interna de cilindros, bimasa en caliente, cargas DGT).
8. **REPARACIONES POSIBLES**: Detalle de recambios con desglose de pieza y mano de obra con botón "¿Cuánto?".
9. **COSTE REAL**: Calculadora de coste total de entrada (precio + tasas + mantenimiento inicial + reparaciones inmediatas).
10. **PRECIO OBJETIVO**: Rango de negociación recomendado y guión de negociación redactado.
11. **QUÉ PREGUNTAR AL VENDEDOR**: Lista de preguntas clave con botón de 1-clic para copiar al portapapeles.
12. **QUÉ REVISAR CON UN MECÁNICO**: Checklist interactivo con casillas de verificación y botón "¿Cómo lo compruebo?".

---

### 5. PRUEBAS Y CALIDAD

- **Tests unitarios e integración**: 34 tests ejecutados y superados satisfactoriamente con Vitest (`npm test`).
- **Linter de TypeScript**: 0 errores de tipado (`npm run lint`).
- **Build de producción**: Compilación de Vite y backend con Node.js completada con éxito (`npm run build`).

---

### 6. LIMITACIONES Y DATOS DEMO

- **Datos de catálogo local**: El catálogo actual almacena vehículos populares (Volkswagen Golf 1.6/2.0 TDI, BMW Serie 3 E90/F30, Peugeot 208/308 PureTech, Renault Megane dCi, Toyota Auris/Corolla Hybrid, Ford Focus EcoBoost). Para modelos no registrados, el sistema aplica inferencia estructurada de segmentos y marca la bandera `isDemo: true`.
- **Límites de la visión fotográfica**: Ninguna IA puede inferir el desgaste interno de discos de embrague, holguras de casquillos de biela o compresión de cilindros; por ello, la sección 7 y el checklist mecánico aíslan explícitamente estas comprobaciones presenciales.

---

### 7. QUÉ REQUIERE GEMINI VS FUENTES EXTERNAS

- **Qué hace Gemini**: Extracción visual de matrículas/modelos en fotos complejas, detección de anomalías estéticas sutiles (diferencias de tono de pintura o desalineación de paneles) y respuesta contextual en lenguaje natural en el asistente de chat.
- **Qué NUNCA hace Gemini**: Gemini jamás calcula el score final, ni decide el veredicto de compra, ni calcula los precios de las piezas; estas operaciones son 100% deterministas en código Typescript local.
- **Qué requerirá fuentes externas en futuras fases**:
  - API de DGT / Carfax para historial de transferencias, cargas financieras e ITV.
  - Catálogo de recambios en tiempo real (ej. TecDoc) para precios de piezas por código VIN exacto.

---

### 8. QUÉ QUEDA PARA LA SIGUIENTE FASE

- Persistencia remota en la nube (Supabase / Firestore para perfiles de usuario y sincronización multidispositivo).
- Integración de visores 3D interactivos con modelos GLTF/GLB por familia de chasis (sedán, compacto, SUV).
- Pasarela de pago o suscripción para informes periciales avanzados en PDF.
