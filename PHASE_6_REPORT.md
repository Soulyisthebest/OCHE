# OCHE / CARCHECK AI — INFORME DE FASE 6
## GLOBAL COST & MARKET INTELLIGENCE ENGINE

### 1. Resumen Ejecutivo
Se ha implementado el **Motor Económico Internacional (Global Cost & Market Intelligence Engine)** de OCHE, separando con total rigor metodológico:
- **Vehicle Value (Valor de Mercado)**
- **Repair Cost (Coste de Reparaciones)**
- **Total Ownership Entry Cost (Coste Total de Entrada en Propiedad)**
- **Deal Quality (Calidad de la Oferta / DealScore vs VehicleScore)**

El sistema opera bajo una estricta política de **Zero Fabrication**: todos los datos de referencia llevan metadatos explícitos de procedencia (`source`, `date`, `confidence`, `isDemo`), y ante la falta de información empírica se emiten estados formales `INSUFFICIENT_DATA` o `NEEDS_VERIFICATION`.

---

### 2. Módulos y Arquitectura Implementada

#### A. Tipos Formales de Dominio (`src/types/costIntelligence.ts`)
- **Valoración y Observaciones de Mercado:** `MarketPriceSource`, `PriceConfidence`, `PriceFactors`, `MarketPriceEstimate`, `PriceObservation`.
- **Diferenciación de Recambios:** `PartCondition` (`NEW`, `OEM`, `AFTERMARKET`, `USED`, `REMANUFACTURED`), `PartPrice`, `PriceRange`.
- **Mano de Obra y Baremos Locales:** `LaborRate`, `RepairScenarioCost`, `RepairCostEstimate`.
- **Exposición a Riesgos Desconocidos:** `UnknownCostExposure` (*"Coste desconocido hasta diagnóstico"*).
- **Fiscalidad y Burocracia por País:** `TaxCost`, `RegistrationCost`, `InspectionCost`, `InsuranceEstimate`.
- **Coste Real de Entrada:** `RealPurchaseCostResult`.
- **Estrategia y Puntuación Financiera:** `DealScoreResult`, `TargetPriceResultExtended`, `NegotiationProposal`, `WhatIfSimulationInput`, `WhatIfSimulationOutput`.
- **Comparativa Internacional:** `CountryOwnershipComparisonResult`, `CountryOwnershipComparisonItem`.
- **Interfaces Provider (Regla 29):** `MarketDataProvider`, `PartPriceProvider`, `LaborRateProvider`, `TaxProvider`, `RegistrationProvider`, `InspectionProvider`.

#### B. Base de Datos Internacional de Baremos y Costes (`src/data/globalCostDatabase.ts`)
- **Tarifas de Mano de Obra (`GLOBAL_LABOR_RATES`):** Baremos horarios medios, mínimos y máximos para ES, FR, DE, UK, US, MA, SA, IT, PT, CA, MX, BR, JP.
- **Sistemas Fiscales de Transmisión (`GLOBAL_TAX_CONFIGURATIONS`):** ITP español (4%-8%), Carte Grise francesa por CV fiscales, Kfz-Steuer alemán, Sales Tax de EEUU, Droits d'Enregistrement de Marruecos, etc.
- **Sistemas de Inspección Técnica (`GLOBAL_INSPECTION_COSTS`):** ITV (España), Contrôle Technique (Francia), TÜV / HU (Alemania), MOT (Reino Unido), Smog Check (EEUU), CVI (Marruecos), MVPI / Fahes (Arabia Saudí), Revisione (Italia), IPO (Portugal), etc.
- **Tasas Administrativas de Registro (`GLOBAL_REGISTRATION_COSTS`):** Tasas de cambio de titularidad DGT, ANTS, Zulassungsstelle, DVLA, DMV, NARSA, Absher, etc.
- **Catálogo de Recambios Canónicos (`CANONICAL_PARTS_PRICING`):** Multiplicadores diferenciados para recambios OEM, aftermarket, usados y reconstruidos.
- **Observaciones de Mercado de Referencia (`REFERENCE_PRICE_OBSERVATIONS`):** Muestras reales para modelos representativos en múltiples países.

#### C. Motores de Inteligencia Económica (`src/services/`)
1. **`MarketPriceEngine`**: Estima el rango de precio de mercado (mínimo, mediana, máximo) considerando edad, kilometraje, estado estético/mecánico, histórico de mantenimiento y observaciones reales.
2. **`RepairCostEngine`**: Modela reparaciones en 3 escenarios (`BEST_CASE`, `EXPECTED`, `WORST_CASE`), diferenciando estado de recambios, baremo de mano de obra local y contingencias desconocidas.
3. **`EntryCostEngine`**: Calcula el desembolso total de entrada (Precio compra + Averías identificadas + Mantenimiento preventivo + Tasas de tráfico + Inspección + Impuestos de transmisiones + Gastos de gestión).
4. **`DealScoreEngine`**: Calcula de forma desacoplada la calidad financiera de la oferta (`DealScore` 0-100) frente al estado mecánico del coche (`VehicleScore` 0-100).
5. **`NegotiationEngine`**: Determina precio objetivo de compra, precio máximo recomendable, precio de retirada (*walk-away price*) y genera argumentarios de negociación con respuestas a objeciones del vendedor.
6. **`WhatIfEngine`**: Simula el impacto económico y de riesgo al cambiar condiciones de piezas (p. ej. usar piezas usadas o aftermarket) o al añadir averías contingentes (embrague, distribución, frenos, DPF, turbo).
7. **`CountryComparisonEngine`**: Compara el coste total de adquisición y puesta a punto de un mismo coche en España, Francia, Alemania, Reino Unido, Estados Unidos, Marruecos y Arabia Saudí en moneda local y normalizado a EUR.
8. **`CostEngine` (Fachada)**: Mantiene 100% de retrocompatibilidad con las interfaces existentes (`calculateRealCost`, `calculateComprehensiveCost`, `simulateWhatIf`) e integra los nuevos motores de la Fase 6.

---

### 3. Verificación y Resultados de Tests
- **Suite de Pruebas:** 8 archivos de test ejecutados con Vitest.
- **Total Tests:** 80 tests unitarios y de integración.
- **Tasa de Éxito:** 100% (80 passed).
- **Verificación de Tipos y Linter:** 0 errores TypeScript (`tsc --noEmit`).
- **Compilación de Producción:** Exitosa (`npm run build`).
