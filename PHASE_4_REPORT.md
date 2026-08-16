# OCHE / CARCHECK AI — INFORME TÉCNICO FASE 4 (GLOBAL VEHICLE PLATFORM)

## 1. Resumen Ejecutivo
En la **Fase 4**, OCHE / CARCHECK AI ha evolucionado de un modelo centrado en España a una **plataforma vehicular verdaderamente global**. La aplicación ya no contiene valores prefijados para moneda (EUR), distancias (km), consumo (L/100km), inspecciones (ITV), impuestos o tarifas de mano de obra. Todo el comportamiento y cálculo económico, técnico y regulatorio se determina dinámicamente mediante perfiles de país (`CountryProfile`) y el motor de contextualización global (`CountryEngine`).

---

## 2. Arquitectura Global Implementada

### 2.1. Country Engine (`src/services/CountryEngine.ts`)
- **Gestión de Contexto**: Almacena y conmuta el país activo en tiempo de ejecución (`activeCountryCode`) con autodetección basada en `navigator.language` y zona horaria.
- **Conversión y Formateo de Unidades**:
  - Distancias: `km` ↔ `miles`.
  - Velocidades: `km/h` ↔ `mph`.
  - Temperaturas: `°C` ↔ `°F`.
  - Consumo de combustible: `L/100km`, `km/L`, `MPG (US)` y `MPG (UK)`.
- **Formateo Monetario Localizado**: Integración con `Intl.NumberFormat` para formato de moneda nativo (`EUR`, `USD`, `GBP`, `CAD`, `MXN`, `BRL`, `MAD`, `SAR`, `JPY`).
- **Conversión de Divisas**: Tabla de conversión cruzada con tasas base a EUR (`CURRENCY_RATES_TO_EUR`).
- **Tasas e Impuestos de Transferencia Dinámicos**: Cálculo del coste real de cambio de titularidad según la legislación del país (tasas fijas + porcentajes variables sobre el precio anunciado).
- **Motor de Doble Puntuación (Dual Scoring)**:
  - *Calidad Mecánica del Vehículo* (0-100): Estado físico y fiabilidad intrínseca.
  - *Valor de la Oferta / Deal Score* (0-100): Comparativa del precio anunciado frente al valor medio esperado del mercado local.
  - *Veredicto ponderado*: `GOOD_DEAL`, `FAIR`, `NEGOTIATE`, `HIGH_RISK`, `AVOID`.

### 2.2. Perfiles de País Implementados (`src/data/countries.ts`)
Se han configurado 13 mercados representativos con especificaciones completas:
1. **España (`ES`)**: EUR (€), km, L/100km, ITV (DGT), ITP (4%).
2. **Francia (`FR`)**: EUR (€), km, L/100km, Contrôle Technique (UTAC), Taxe Régionale ANTS.
3. **Alemania (`DE`)**: EUR (€), km, L/100km, TÜV/DEKRA HU+AU, Kfz-Zulassung.
4. **Reino Unido (`UK`)**: GBP (£), miles, MPG (UK), MOT (DVSA), V5C DVLA logbook.
5. **Estados Unidos (`US`)**: USD ($), miles, MPG (US), °F, State Smog Check / DMV Title (Pink Slip).
6. **Marruecos (`MA`)**: MAD (DH), km, L/100km, الفحص التقني (NARSA / Carte Grise), RTL.
7. **Arabia Saudí (`SA`)**: SAR (ر.س), km, km/L, الفحص الدوري سلامة (SASO / أبشر), RTL.
8. **Japón (`JP`)**: JPY (¥), km, km/L, 車検 (Shaken / MLIT / Shakensho).
9. **Italia (`IT`)**: EUR (€), km, L/100km, Revisione (Motorizzazione Civile / PRA).
10. **Portugal (`PT`)**: EUR (€), km, L/100km, IPO (IMT / DUA).
11. **Canadá (`CA`)**: CAD (CA$), km, L/100km, Safety Standards Certificate (MTO/SAAQ).
12. **México (`MX`)**: MXN ($), km, km/L, Verificación Vehicular (SEDEMA / SEMOVI).
13. **Brasil (`BR`)**: BRL (R$), km, km/L, Vistoria Cautelar DETRAN (CRLV-e).

### 2.3. Motor de Localización e Idiomas (`src/services/LocalizationService.ts`)
- Soporte nativo para 8 idiomas: Español (`es`), Inglés (`en`), Francés (`fr`), Alemán (`de`), Árabe (`ar`), Italiano (`it`), Portugués (`pt`) y Japonés (`ja`).
- Soporte de dirección de texto **RTL (Right-to-Left)** automática para Árabe (`dir="rtl"`).
- Sistema de claves tipadas (`TranslationKey`) sin duplicación de vistas o componentes.

### 2.4. Adaptadores de Marketplace (`src/adapters/MarketplaceAdapter.ts`)
- `MarketplaceAdapter` y `GenericMarketplaceAdapter` con registro extensible (`MarketplaceRegistry`).
- Capacidad de parsear anuncios en texto libre o URLs para extraer marca, modelo, año, kilometraje y precio de manera inteligente.

### 2.5. Repositorio Vehicular Multimercado (`src/repositories/LocalVehicleRepository.ts`)
- Métodos de consulta por país (`findByCountry`) y por región de mercado (`findByMarket`).
- `findByMarketVersion`: Ajusta la potencia (CV, HP, PS, kW), estándares anticontaminación (Euro 6, EPA Tier 3, etc.) y normativas OBD según el mercado destino.

---

## 3. Componentes de UI Refactorizados

- **`Header.tsx`**: Selector interactivo de país y moneda en tiempo real (`CountrySelector`) con bandera, código y moneda.
- **`RealCostCalculator.tsx`**: Desglose de costes con moneda local, desglose de transferencia según sistema registral del país (DGT, DMV, DVLA, ANTS, etc.) e indicación de fiabilidad de datos (`isDemo`).
- **`NegotiationPlaybook.tsx`**: Argumentos y cálculos de oferta objetivo adaptados a la moneda y normativas del país seleccionado.
- **`WhatIfSimulator.tsx`**: Simulación de reparaciones con tarifas horarias de mano de obra y aranceles de repuestos específicos del país.
- **`AnalysisReport.tsx`**: Integración global de unidades de medida, insignias de verificación técnica local (ITV, MOT, TÜV, Smog, Shaken, etc.) y documentos obligatorios de transferencia.
- **`App.tsx`**: Conexión del estado global de país con actualización reactiva en toda la jerarquía de componentes y ajuste automático del atributo `dir` (LTR / RTL).

---

## 4. Auditoría de Verificación y Pruebas

### 4.1. Suite de Tests Automatizados (`vitest`)
```bash
✓ src/__tests__/analysisPipeline.test.ts (11 tests)
✓ src/__tests__/countryEngine.test.ts (14 tests)
✓ src/__tests__/services.test.ts (6 tests)
✓ src/__tests__/knowledgeEngine.test.ts (6 tests)
✓ src/__tests__/calculators.test.ts (8 tests)
✓ src/__tests__/repository.test.ts (3 tests)

Test Files  6 passed (6)
Tests       48 passed (48)
```

### 4.2. Validación TypeScript & Linter
- `npm run lint` (`tsc --noEmit`): **0 errores**.

### 4.3. Compilación de Producción (`vite build` + `esbuild`)
- `compile_applet`: **Compilación exitosa (Green Build)**.

---

## 5. Limitaciones Actuales y Requisitos para Datos Reales

1. **Tasas de Cambio de Divisa**: Actualmente se utiliza una tabla estática calibrada (`CURRENCY_RATES_TO_EUR`). En producción requerirá integración con una API de tipos de cambio en tiempo real (ej. *Open Exchange Rates* o *ECB API*).
2. **Precios de Mercado de Segunda Mano**: Se calculan mediante el algoritmo heurístico de depreciación y el repositorio local. Para datos reales se conectarán adaptadores específicos por país (ej. APIs de *AutoTrader*, *Mobile.de*, *Coches.net*, *Kavak*, *Carsensor*).
3. **Informes Gubernamentales Oficiales**: Las comprobaciones de cargas y titularidad están parametrizadas conceptualmente; la integración real requerirá pasarelas con bases de datos públicas (DGT en España, HPI/DVLA en UK, Carfax/NMVTIS en EE.UU., Histovec en Francia).
