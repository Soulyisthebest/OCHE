# 🚗 CARCHECK AI — INFORME DE AUDITORÍA DETALLADA Y REAL DEL PROYECTO

> **Repositorio:** https://github.com/Soulyisthebest/OCHE  
> **Nombre del Proyecto:** CARCHECK AI  
> **Estado del Entorno:** Proyecto funcional existente (React 19 + TypeScript + Vite + Express + Tailwind CSS v4).  
> **Filosofía de Desarrollo:** 0 € de coste, ejecutable 100% en local mediante **Demo Mode**.

---

## 1. ARQUITECTURA ACTUAL

El proyecto está estructurado como una aplicación **Full-Stack ligera (SPA + Express Proxy)**:
- **Frontend**: React 19 con TypeScript, Vite 6 y Tailwind CSS v4.
- **Servidor Backend**: Express 4 en `server.ts`, ejecutado con `tsx` en desarrollo y empaquetado a CommonJS `dist/server.cjs` mediante `esbuild` para producción.
- **Navegación**: Gestión de vistas Single Page (`currentView` en `App.tsx`): `'home' | 'scan' | 'report' | 'garage' | '3d' | 'assistant' | 'learn' | 'chat'`.
- **Integración de Servidor**: Express actúa como proxy para las llamadas a la API de Gemini (`/api/analyze-car`) para evitar exponer claves API en el navegador, y sirve la SPA Vite mediante middleware en desarrollo y archivos estáticos en producción.

---

## 2. FRONTEND

El frontend contiene los siguientes módulos y componentes funcionales:
1. `Header.tsx`: Barra de navegación superior responsive con logo, pestañas de acceso directo y CTA "ESCANEAR".
2. `HeroHome.tsx`: Pantalla de inicio con banner explicativo, botones de acción rápida, selección de coches demo (*Golf VII, Peugeot 208, Toyota Yaris, BMW 320d*) y características destacadas.
3. `PhotoScanner.tsx`: Escáner guiado en 8 fotos clave (Frontal, Trasera, Lateral Izquierdo, Lateral Derecho, Interior, Cuadro, Motor, Neumáticos) con captura de cámara nativa o selector de archivos y botón de precarga demo.
4. `AnalysisReport.tsx`: Visor completo del informe de evaluación:
   - Puntuación de compra (0–100) con badge de color (Verde/Amarillo/Rojo).
   - Nota explicativa de límites viso-mecánicos (*"No podemos comprobar componentes mecánicos internos mediante una foto"*).
   - Lista de observaciones visuales, puntos fuertes/débiles del modelo y averías conocidas.
   - Fichas de reparación con costes de piezas (nuevas/usadas) y mano de obra.
   - Checklist interactivo para la prueba en persona.
5. `RealCostCalculator.tsx`: Calculadora de coste real con deslizador para ajustar el precio pedido por el vendedor y recalcular transferencias, mantenimiento inicial y reparaciones.
6. `AssistantMode.tsx`: Asistente interactivo paso a paso ("Guíame") con árboles de decisión para comprobaciones físicas (arranque en frío, ruidos, embrague, humo, dirección).
7. `Car3DExplorer.tsx`: Visualizador gráfico 360º de chasis con zonas seleccionables (Motor, Frenos, Suspensión, Transmisión, Batería, Electrónica) y ficha de averías/precios.
8. `CarChatAssistant.tsx`: Chat contextual IA para consultar preguntas directas sobre el coche analizado o mecánica general.
9. `LearnCars.tsx`: Guía conceptual de mecánica sin tecnicismos y juego **Quiz +10 XP** con marcador acumulativo de puntos de experiencia.
10. `GarageHistory.tsx`: Gestor de garaje local (`localStorage`) con comparador de 2 vehículos lado a lado.

---

## 3. BACKEND

`server.ts` gestiona el servidor Express:
- **Puerto**: 3000 (bind `0.0.0.0`).
- **Límite de payload**: `50mb` para recibir múltiples imágenes en base64.
- **Endpoint API**: `POST /api/analyze-car`
  - Recibe `{ photos, mileageKm, askingPrice }`.
  - Comprueba `process.env.GEMINI_API_KEY`. Si no existe, devuelve HTTP 503 (`{ error: 'GEMINI_API_KEY not configured' }`).
  - Si la clave está presente, invoca la SDK `@google/genai` con un prompt multimodal detallado y un esquema de respuesta estricto (`responseSchema` en JSON).

---

## 4. IA (INTEGRACIÓN CON GEMINI)

- **SDK Utilizada**: `@google/genai` (versión `^2.4.0` en `package.json`).
- **Prompting**: Incluye directrices estrictas para no inventar diagnósticos mecánicos imposibles de ver en foto y diferenciar entre fallos del modelo vs. fallos observados.
- **Formato de Respuesta**: Salida JSON estructurada mediante `responseSchema` validando tipos de datos para identidad, puntuación, observaciones, costes y checklist.

### ⚠️ ANÁLISIS DEL MODELO GEMINI CONFIGURADO

#### PROBLEMA
En `server.ts` (línea 89), el modelo configurado es `gemini-3.6-flash`.

#### POR QUÉ ES UN PROBLEMA
`gemini-3.6-flash` no es un alias de modelo oficial en la API de Google Gemini. El nombre oficial de la familia de modelos rápidos multimodales es `gemini-2.5-flash` o `gemini-2.0-flash`. Al activar una clave real de Gemini, la API devolverá un error HTTP 404 (Model Not Found).

#### SOLUCIÓN RECOMENDADA
Actualizar la llamada en `server.ts` al nombre oficial de modelo: `gemini-2.5-flash`.

---

## 5. DEMO MODE (MODO GRATUITO 0 €)

- **Cómo funciona**:
  1. Si `GEMINI_API_KEY` no está configurada en `.env`, el backend responde HTTP 503.
  2. El cliente frontend (`src/services/geminiService.ts`) detecta el error y conmuta automáticamente a `generateFallbackReport` o utiliza la base de datos demo local `SAMPLE_DEMO_CARS`.
  3. No requiere tarjetas de crédito, servidores externos ni servicios de pago.
  4. Funciona inmediatamente al clonar y ejecutar `npm install && npm run dev`.

---

## 6. BASE DE DATOS

- **Estado Actual**: Datos estáticos almacenados en memoria local en archivos TypeScript (`src/data/sampleCars.ts` y `src/data/car3DData.ts`).
- **Modelos Precargados**:
  1. *Volkswagen Golf VII 2.0 TDI*
  2. *Peugeot 208 1.2 PureTech* (con avisos específicos de correa en aceite)
  3. *Toyota Yaris 1.0 VVT-i*
  4. *BMW 320d F30*
- **Análisis de Escalabilidad**:
  - Pasar de 4 coches a 100 o 10.000 coches en archivos `.ts` estáticos inflaría drásticamente el tamaño del bundle del frontend.
  - **Recomendación**: Crear una interfaz de repositorio abstracto (`VehicleRepository`), utilizando la carga local como `DemoVehicleAdapter` y dejando preparado el terreno para un futuro `RemoteVehicleAdapter` (Supabase / PostgreSQL) cuando sea necesario.

---

## 7. SISTEMA 3D (ACTUALIZADO TRAS FASE 7)

### Clasificación por Niveles:
- **Nivel 1**: Modelo 3D genérico / diagrama vectorial interactivo.
- **Nivel 2**: Modelo 3D específico por marca/modelo.
- **Nivel 3**: Modelo 3D con despiece interno y presets de cámara.
- **Nivel 4**: Modelo 3D interactivo con animación de componentes y abstracción de vista explosionada.
- **Nivel 5**: Pieza → Problema → Síntoma → Comprobación → Reparación → Coste Multi-País. *(ESTADO ACTUAL TRAS FASE 7)*

### ESTADO ACTUAL DEL 3D: **NIVEL 5 — INTERACTIVE VEHICLE KNOWLEDGE EXPLORER**
El sistema 3D se ha desacoplado y convertido en una interfaz visual de conocimiento automotriz completa:
1. **Modelos Canónicos (`Car3DModel`)**: Catálogo desacoplado en `/src/data/car3DModelsDatabase.ts` que incluye modelos específicos (VW Golf EA288, Peugeot 208 PureTech) y modelo universal genérico.
2. **Puente Ontológico (`Vehicle3DService`)**: Cada hotspot 3D mapea a un `partId` del repositorio canónico de vehículos sin hardcodear lógica de reparación en el componente visual.
3. **Explicación Dual (ELI5 vs. Técnico)**: Modo "Fácil" para compradores inexpertos y "Detallado" para mecánicos.
4. **Guía de Inspección y Síntomas**: Pasos seguros de comprobación ("Qué mirar", "Cómo comprobar", "Qué es normal/sospechoso") y explorador de síntomas probables.
5. **Coste Multi-Mercado Dinámico**: Integración con `CostEngine` y `CountryProfile` para desglosar piezas (nueva, OEM, aftermarket, desguace) y mano de obra en divisa local (EUR, USD, MXN, COP, etc.).
6. **Integración con Escáner e IA Chat**: Mapeo visual de fallos detectados en el informe del escáner (`OBSERVED`, `POSSIBLE`, `KNOWN`) y lanzamiento contextualizado al chat asistente de OCHE.
7. **Accesibilidad y Fallback 2D**: Vista alternativa estructurada por sistemas y piezas para dispositivos sin aceleración gráfica o usuarios con lectores de pantalla.

---

## 8. COSTES REALES

### Fórmula de Cálculo Implementada:
$$\text{Coste Real Estimado} = \text{Precio Ofertado} + \text{Gastos Transferencia (\sim 180-250 €)} + \text{Mantenimiento Inicial} + \text{Reparaciones Visibles}$$

- Se expresa en **rangos de precio en Euros (€)** (`totalMin` a `totalMax`).
- En Demo Mode, los costes provienen de rangos aproximados basados en promedios de mercado etiquetados como `DATOS DE DEMOSTRACIÓN`.

---

## 9. PUNTUACIÓN DE COMPRA

### FÓRMULA REAL EN CÓDIGO (`src/data/sampleCars.ts` y esquema JSON):
Media ponderada sobre 100 puntos desglosada en 5 categorías:
1. **Fiabilidad del modelo**: 25%
2. **Estado visible**: 20%
3. **Mantenimiento recomendado**: 20%
4. **Relación calidad/precio**: 20%
5. **Riesgo mecánico**: 15%

$$\text{Puntuación} = (F \times 0.25) + (EV \times 0.20) + (M \times 0.20) + (P \times 0.20) + (R \times 0.15)$$

### EJEMPLO REAL (VW Golf VII en código):
- Fiabilidad: 88 $\times$ 0.25 = 22.0
- Estado visible: 85 $\times$ 0.20 = 17.0
- Mantenimiento: 78 $\times$ 0.20 = 15.6
- Relación calidad/precio: 82 $\times$ 0.20 = 16.4
- Riesgo mecánico: 80 $\times$ 0.15 = 12.0
- **Total = 83 / 100** (Badge Verde: *"Buena opción"*)

#### ⚠️ DIVERGENCIA CON DOCUMENTACIÓN:
- La especificación inicial planteaba 6 categorías (Fiabilidad 25%, Estado visible 20%, Kilometraje 15%, Mantenimiento 15%, Precio 15%, Riesgo futuro 10%).
- El código actual utiliza 5 categorías ponderadas al 100%.

---

## 10. ESCÁNER Y PROCESAMIENTO DE FOTOGRAFÍAS

- **Funcionamiento**:
  - Grid de 8 slots interactivos con etiquetas específicas (Frontal, Trasera, Lateral Izq., Lateral Der., Interior, Cuadro, Motor, Neumáticos).
  - Utiliza `<input type="file" accept="image/*" capture="environment">`, permitiendo disparar la cámara directamente en móviles o seleccionar fotos de la galería.
  - Convierte imágenes localmente a Base64 DataURLs.
  - Botón de carga rápida de fotos demo para pruebas inmediatas.
- **Puntos a mejorar**:
  - Las fotos capturadas en alta resolución se convierten directamente a Base64 sin compresión previa en el navegador, pudiendo enviar llamadas de >30 MB. El backend admite `50mb`, pero sería recomendable añadir compresión Canvas en cliente.

---

## 11. SEGURIDAD

- **Revisión de Secretos**: No existen claves API reales ni tokens privados subidos al repositorio.
- **Configuración Git**: `.gitignore` excluye correctamente `.env`, `.env*`, `node_modules/` y `dist/`.
- **Plantilla `.env.example`**: Configurada con valores de ejemplo seguros (`GEMINI_API_KEY="MY_GEMINI_API_KEY"`).
- **Aislamiento de Claves**: `GEMINI_API_KEY` se consume únicamente en el servidor Express (`server.ts`) y nunca se expone en la build cliente de Vite.

---

## 12. ERRORES IDENTIFICADOS EN EL CÓDIGO

1. **Modelo de Gemini erróneo en `server.ts`**: `gemini-3.6-flash` no existe en la API. Debe corregirse a `gemini-2.5-flash`.
2. **Falta de compresión de imágenes en el cliente**: Capturar 8 fotos en móviles modernos puede saturar la memoria antes de enviar el payload.
3. **Persistencia en `localStorage`**: Guardar múltiples informes con fotos en base64 puede superar el límite de 5 MB de `localStorage`.
4. **Ausencia de Tests Unitarios**: No existe suite de pruebas (`npm test`) para verificar las fórmulas de puntuación y cálculos de coste real de forma automatizada.

---

## 13. FUNCIONALIDADES FALSAMENTE COMPLETAS (DEMO / SIMULADAS)

- **Análisis Multimodal sin API Key**: Genera un informe simulado prediseñado (*Golf VII 2.0 TDI*).
- **Modelo 3D**: Es un esquema vectorial rotativo de chasis 360º, no un archivo de malla 3D `.gltf`/`.glb` real.
- **Precios de Piezas y Reparaciones**: Basados en estimaciones locales fijadas en `sampleCars.ts` y `car3DData.ts`.

---

## 14. FUNCIONALIDADES REALES

- **Análisis Multimodal Real con Gemini**: Funcional cuando se añade `GEMINI_API_KEY` en `.env`.
- **Servidor Backend Express + Vite**: Arquitectura full-stack funcional y compilable.
- **Calculadora Interactiva de Coste Real**: Ajuste dinámico de rangos de precio con deslizador.
- **Asistente "Guíame" in situ**: Árboles de decisión interactivos para revisiones físicas.
- **Gestión de Garaje & Comparador**: Guardado y comparación en cliente.
- **Juego de Trivia Mecánica**: Quiz interactivo con contador de XP acumulativo.

---

## 15. ANÁLISIS DE COSTES (0 € DESARROLLO)

- **Coste Actual**: **0 €**. Todo el proyecto se ejecuta localmente.
- **Coste en Producción Futura**:
  - Frontend SPA: 0 € (Tier gratuito de Vercel / Netlify / Cloudflare Pages).
  - API Backend: 0 € (Tier gratuito de Render / Cloud Run para uso personal/MVP).
  - Gemini API: Tier gratuito de Google AI Studio (hasta 15 RPM sin coste).
  - Base de datos futura: 0 € (Tier gratuito de Supabase / PostgreSQL).

---

# 📋 AUDITORÍA CARCHECK AI (RESUMEN EJECUTIVO)

### 🟢 LO QUE FUNCIONA
- Interfaz PWA responsive y fluida para móviles y escritorio.
- Captura de fotos desde cámara o archivos en 8 slots guiados.
- Servidor Express con proxy seguro hacia Gemini API.
- Calculadora de coste real con deslizadores dinámicos.
- Asistente de inspección in situ ("Guíame") con árboles de decisión.
- Chat IA contextual sobre el vehículo.
- Quiz mecánico con gamificación (+10 XP).
- Garaje local con comparador lado a lado.

### 🟡 LO QUE FUNCIONA EN DEMO
- Fallback automático cuando no hay `GEMINI_API_KEY`.
- Base de datos local con 4 modelos de demostración completos (*Golf, Peugeot 208, Yaris, BMW 320d*).
- Precios e historia de averías basadas en rangos locales precalculados.

### 🔴 LO QUE NO FUNCIONA
- Llamada real a Gemini en `server.ts` por nombre de modelo no oficial (`gemini-3.6-flash`).
- Suite de pruebas unitarias ausente (`npm test`).

### 🔐 PROBLEMAS DE SEGURIDAD
- **NINGUNO DETECTADO**. Sin claves expuestas, `.gitignore` bien configurado.

### 💰 COSTES ACTUALES
- **0 €**. Totalmente ejecutable localmente.

### 🚗 ESTADO DEL 3D
- **NIVEL 1** (Diagrama vectorial interactivo 360º con hot-spots por zona).

### 🗄️ ESTADO DE LA BASE DE DATOS
- **NIVEL LOCAL DEMO** (Ficheros TypeScript `sampleCars.ts` y `car3DData.ts`).

### 🤖 ESTADO DE GEMINI
- Integrado en `server.ts` con la SDK oficial `@google/genai` y respuestas JSON estrictas. Requiere ajustar la constante del modelo a `gemini-2.5-flash`.

### 📸 ESTADO DEL ESCÁNER
- Guiado en 8 pasos con disparo directo de cámara o galería.

### 🏗️ PROBLEMAS DE ARQUITECTURA
- Inexistencia de compresión de imágenes en cliente antes de enviar a API.
- Falta de capa de interfaz abstracta (`VehicleRepository`) para separar datos local demo de futuras APIs o bases de datos externas.

---

### 🚀 PRÓXIMOS 5 PASOS RECOMENDADOS (POR PRIORIDAD)

1. **PASO 1 — Corregir el alias de modelo Gemini en `server.ts`**: Cambiar `gemini-3.6-flash` a `gemini-2.5-flash`. *(✅ COMPLETADO)*
2. **PASO 2 — Implementar compresión de fotos en el navegador (`PhotoScanner.tsx`)**: Reducir el tamaño de las fotos en cliente antes de enviarlas a la API o guardarlas en `localStorage`. *(✅ COMPLETADO en `/src/utils/imageCompressor.ts`)*
3. **PASO 3 — Crear suite de tests unitarios**: Añadir tests simples para validar la fórmula de puntuación (0-100) y los cálculos de coste real de forma automatizada. *(✅ COMPLETADO con Vitest en `npm run test`)*
4. **PASO 4 — Definir la interfaz de la capa de datos (`VehicleRepository`)**: Desacoplar `sampleCars.ts` mediante un adaptador para permitir escalar la base de datos a miles de modelos en el futuro. *(✅ COMPLETADO en `/src/repositories/VehicleRepository.ts`)*
5. **PASO 5 — Pulir la experiencia de usuario móvil (UX/UI)**: Ajustar tamaños táctiles y animaciones para optimizar la sensación de app nativa. *(✅ COMPLETADO)*

---

## ✅ ESTADO DE EJECUCIÓN TRAS LAS MEJORAS

Todas las correcciones prioritarias han sido aplicadas y verificadas:
- **`gemini-2.5-flash`** configurado como modelo oficial en `server.ts`.
- **Compresión de imágenes en Canvas cliente** activa antes de enviar el payload o guardar en local.
- **Suite de pruebas unitarias (`npm run test`)** integrada con Vitest (8/8 tests pasando en verde).
- **Capa abstracta de repositorio de datos (`VehicleRepository` / `DemoVehicleAdapter`)** creada y testeada.
- **Compilación (`npm run build`) y Linter (`npm run lint`)** validados con 0 errores.
- **Demo Mode por defecto a 0 €** 100% garantizado y operacional en local.

---

## 🏎️ FASE 2: MOTOR DE CONOCIMIENTO DE VEHÍCULOS (ACTUALIZACIÓN DE ARQUITECTURA)

Se ha completado la **Fase 2: Motor de Conocimiento de Vehículos**, estableciendo una estructura de datos rica, fuertemente tipada y escalable para representar el conocimiento técnico de cualquier coche.

### 1. Tipos de Dominio Definidos (`/src/types/vehicleEngine.ts`):
- **`Vehicle`**: Objeto raíz que representa Marca $\rightarrow$ Modelo $\rightarrow$ Generación $\rightarrow$ Motor $\rightarrow$ Transmisión $\rightarrow$ Problemas Conocidos $\rightarrow$ Mantenimiento $\rightarrow$ Sistemas $\rightarrow$ Piezas $\rightarrow$ Reparaciones $\rightarrow$ Modelo 3D.
- **`Engine`**: Especificaciones del bloque motor (Código motor ej: `EA288`, `EB2`, `1KR-FE`, `M47N`, combustible, CV, cilindrada, turbo, fallos endémicos).
- **`KnownProblem`**: Titulo, descripción detallada, gravedad (`low` / `medium` / `high` / `critical`) y estimación de coste de reparación.
- **`MaintenanceItem`**: Intervalo recomendado en kilómetros y años, más estimación de coste.
- **`VehicleSystem`**: Sistemas principales (Motor, Frenos, Suspensión, Transmisión, Batería, Neumáticos).
- **`Part`**: Pieza mecánica vinculada a un sistema con función, síntomas comunes, problemas conocidos, rango de precios nuevos/usados, mano de obra y nivel de riesgo.
- **`Repair`**: Ficha de reparación con estimación de coste y urgencia.
- **`Car3DModel` & `Car3DPart`**: Mapeo tridimensional interactivo para el visor 360º.

### 2. Base de Datos de Conocimiento Migrada (`/src/data/vehicleKnowledgeDatabase.ts`):
Se han migrado los 4 vehículos de demostración mantenidos a la nueva estructura estructurada sin perder ninguna información:
1. **Volkswagen Golf VII 2.0 TDI** (Motor EA288 150 CV, distribución, bomba de agua, DPF).
2. **BMW Serie 3 320d E46** (Motor M47N 150 CV, palomillas de admisión, silentblocks trapecios).
3. **Peugeot 208 1.2 PureTech** (Motor EB2 82 CV, correa húmeda en aceite, bomba de aceite).
4. **Toyota Yaris 1.0 VVT-i** (Motor 1KR-FE 69 CV, cadena de distribución de por vida).

### 3. Implementación del Repositorio (`LocalVehicleRepository`):
- Implements `VehicleRepository` en `/src/repositories/LocalVehicleRepository.ts`.
- Mantiene compatibilidad total con la UI previa a través de los métodos de `SampleDemoCar` mientras expone la nueva API de conocimiento de dominio:
  - `getAllDomainVehicles()`
  - `getDomainVehicleById(id)`
  - `searchDomainVehicles(query)`
- Extendido por `DemoVehicleAdapter` sin alterar componentes frontend.

### 4. Pruebas Unitarias Automatizadas (`/src/__tests__/knowledgeEngine.test.ts`):
Pasadas al 100% (17/17 tests totales en verde):
1. **Existencia de los 4 vehículos**.
2. **Asignación completa de especificaciones de motor**.
3. **Registro de problemas conocidos por modelo**.
4. **Relación correcta de piezas mecánicas con sistemas**.
5. **Búsqueda eficiente por marca o modelo**.
6. **Recuperación individual por ID único**.

---

## 🏆 MASTER AUTONOMOUS BUILD (COMPLETADO)

### Resumen de logros alcanzados:
1. **Flujo de Escáner Guiado de 8 Pasos**: `PhotoScanner.tsx` implementa un flujo progresivo de 8 fotos clave (Frontal, Trasera, Izquierda, Derecha, Interior, Cuadro, Motor, Neumáticos) con compresión automática en Canvas cliente antes del envío.
2. **Motor de Decisión Financiera y Negociación**: `costCalculator.ts` incluye la función `calculateNegotiationTarget` para generar objetivos de precio de regateo y precio máximo recomendado con argumentos técnicos de descuento.
3. **Puntuación y Veredicto Ponderado**: Evaluación sobre 100 puntos desglosada en 5 categorías ponderadas con distintivos visuales `COMPRA RECOMENDADA`, `PRECAUCIÓN / NEGOCIAR` o `ALTO RIESGO`.
4. **Comparador Lado a Lado de Vehículos (`CarComparator.tsx`)**: Integrado en la navegación principal (`Header.tsx` y `App.tsx`) para comparar 2 coches guardados o de demostración cara a cara.
5. **Visor Técnico Interactivo 3D (`Car3DExplorer.tsx`)**: Muestra despiece por zonas (Motor, Frenos, Suspensión, Transmisión, Batería, Electrónica) con ficha técnica completa (Ubicación, ¿Qué puede fallar?, Síntomas, Mantenimiento preventivo, Precios pieza nueva/usada, Mano de obra y Coste total).
6. **Sección Educativa y Gamificación (`LearnCars.tsx`)**: 10 fichas técnicas de componentes clave (Aceite, Frenos, Embrague, Distribución, Turbo, DPF, EGR, Batería, Neumáticos, Suspensión) y juego **Quiz +10 XP** con preguntas de mecánica.
7. **Verificación de Calidad**:
   - `npm run lint`: 0 errores de compilación TypeScript.
   - `npm run build`: Compilación en producción correcta en `dist/`.
   - `Demo Mode 0 €`: Funcionamiento autónomo garantizado sin API Key.

---

## 🏛️ FASE 5: GLOBAL VEHICLE KNOWLEDGE CORE (AUDITORÍA & ESTADO FINAL)

Se ha implementado formalmente el **Global Vehicle Knowledge Core** de OCHE / CARCHECK AI:

### 1. Jerarquía Ontológica Implementada
- `Brand` (`brandId`, `officialName`, `aliases[]`, `countryOfOrigin`)
- `VehicleModel` (`modelId`, `brandId`, `name`, `segment`, `bodyStyles[]`)
- `VehicleGeneration` (`generationId`, `modelId`, `generationName`, `yearFrom`, `yearTo`, `facelift`)
- `Engine` (`engineId`, `manufacturer`, `family`, `name`, `engineCodes[]`, `displacement`, `fuel`, `timingType`, `power`, `torque`)
- `VehicleConfiguration` (`vehicleConfigurationId`, `generationId`, `engineId`, `transmission`, `fuel`, `powerHp`)
- `MarketConfiguration` (`marketId`, `vehicleConfigurationId`, `countryCode`, `localSpecifications`, `localUnits`)
- `VehicleSystem` (16 sistemas estándar de la ingeniería automotriz)
- `Part` (`id`, `systemId`, `function`, `symptoms[]`, `failureModes[]`, `inspectionMethods[]`, `riskLevel`)
- `KnownProblem` (`id`, `severity`, `symptoms[]`, `inspectionMethod`, `estimatedRepair`)
- `MaintenanceItem` (`id`, `intervalKm`, `intervalMonths`, `severity`)
- `Repair` (`id`, `partsCost`, `laborCost`, `estimatedTimeHours`)
- `CostModel` (`minimum`, `expected`, `maximum`, `currency`, `confidence`)

### 2. Principio de Cero Fabricación de Datos (Zero Fabrication)
- Todas las entidades portan metadatos `ProvenanceMetadata` (`source`, `sourceType`, `sourceDate`, `confidence`, `isDemo`, `dataVersion`).
- Tipos de fuentes rigurosas: `OFFICIAL`, `MANUFACTURER`, `TECHNICAL`, `WORKSHOP`, `MARKET`, `USER`, `AI`, `DEMO`, `UNKNOWN`.
- Campos sin datos verificados se mantienen explícitamente en `null` o `unknown`.

### 3. Motor de Resolución y Desambiguación
- `VehicleResolverService.resolveVehicle()`: Resuelve consultas con información parcial o difusa.
- Normaliza alias de fabricantes (`VW` $\rightarrow$ `Volkswagen`, `PSA` $\rightarrow$ `Peugeot`, `Bimmer` $\rightarrow$ `BMW`).
- Extrae códigos de motor (`CRBC`, `EB2DT`, `1KR-FE`, `N47D20`, `B47D20`).
- Si la diferencia de confianza entre candidatos es inferior a 0.15, marca `isAmbiguous: true` y no selecciona a ciegas.

### 4. Grounding de IA
- Inyección de contexto canónico en `server.ts` para evitar que Gemini invente especificaciones, averías o costes cuando existen datos estructurados.

### 5. Suite de Pruebas Automatizadas
- 63 tests unitarios ejecutados y superados con éxito en 7 suites de pruebas (`npm run test`).
- 0 errores de linter (`npm run lint`).
- Compilación de producción (`npm run build`) verificada y dev server reiniciado.

---

## 🎯 FASE 9: REAL USER MVP VALIDATION & ERGONOMICS (AUDITORÍA FINAL)

### 1. Resumen de Implementación
- **Flujo de Usuario Optimizado para Móvil**: Flujo guiado de escaneo rápido (4 fotos) vs completo (8 fotos) con objetivos táctiles de más de 44px.
- **Transparencia y Explicabilidad ("¿Por qué?")**: 3 a 5 motivos determinantes por veredicto en el informe.
- **Sección Explícita de Límites Viso-Mecánicos**: "⚪ Cosas que no se pueden comprobar en fotos" (compresión, turbo a carga, embrague/bimasa, cargas en DGT).
- **Mecanismo de Feedback Local**: Widget "¿Te ha ayudado este análisis?" con almacenamiento local y telemetría privada sin filtrado de datos.
- **Indicadores de Modo de Prueba (`REAL_TEST_MODE`)**: Distintivos visibles `[MODO DEMO]` vs `[ANÁLISIS IA]`.
- **Avisos de Confianza y Límites Legales**: Disclaimers claros que indican que OCHE no sustituye una inspección profesional.




