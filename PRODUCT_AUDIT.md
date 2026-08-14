# OCHE / CARCHECK AI — PRODUCT & ARCHITECTURE AUDIT

## 1. Executive Summary
**OCHE** is an intelligent assistant engineered for second-hand vehicle buyers that bridges the gap between everyday car shoppers and professional mechanics. It provides instant computer-vision photo scanning, engine-specific risk assessment, real-time total cost calculating, "What If" scenario simulations, and interactive 3D component discovery.

---

## 2. Core Engines & Architectures Implemented

### A. Evidence & Confidence Engine (`EvidenceEngine.ts` & `evidence.ts`)
- **Strict Separation of Truths**:
  - `OBSERVED`: Visual facts verified on uploaded car photos with bounding locations.
  - `KNOWN`: Documented engineering failure patterns for the specific engine/generation code.
  - `INFERRED`: Probabilistic wear items based on current mileage vs. component lifecycle.
  - `UNKNOWN`: Critical mechanical checks that cannot be verified via 2D photos and require hands-on physical inspection.
- **Confidence Scoring**: Tiered scoring (`HIGH`, `MEDIUM`, `LOW`) with mathematical tracking.

### B. Multi-Factor Risk Engine (`RiskEngine.ts` & `risk.ts`)
- **Weighted Mechanical Analysis**:
  - Evaluates engine risk, visible wear risk, maintenance delay risk, and financial deviation.
  - Generates categorized risk levels: `LOW`, `MODERATE`, `HIGH`, `CRITICAL`.
  - Calculates confidence intervals for risk mitigation.

### C. Deterministic Purchase Score Engine (`PurchaseScoreEngine.ts`)
- **5-Pillar Weighted Formulation**:
  - **Fiabilidad del Modelo / Motor** (25% weight)
  - **Estado Visible / Inspección** (20% weight)
  - **Mantenimiento & Kilometraje** (20% weight)
  - **Riesgo Mecánico Estimado** (15% weight)
  - **Relación Calidad / Precio** (20% weight)
- Delivers objective scores from 0 to 100 with clear verdict badges (`COMPRAR`, `PRECAUCIÓN / NEGOCIAR`, `EVITAR`).

### D. Financial Engine & "What If" Decision Simulator (`CostEngine.ts` & `WhatIfSimulator.tsx`)
- **Real Ownership Cost Calculation**:
  $$\text{Total Investment} = \text{Asking Price} + \text{Transfer Fees} + \text{Initial Fluid Service} + \text{Immediate Repairs}$$
- **Real-Time Interactive "What If" Matrix**:
  - Lets the buyer toggle hypothetical issues (e.g. *Correa de distribución pendiente*, *Desgaste prematuro de embrague*, *Válvula EGR obstruida*).
  - Dynamically recalculates the simulated total expenditure, adjusts the purchase score, and derives the target negotiation offer.
  - Provides instant copy-paste negotiation scripts tailored for messaging sellers on WhatsApp/Wallapop.

### E. AI Orchestrator & Offline Engine (`AIOrchestrator.ts`)
- **Server & Local Fallback Pipeline**:
  - Validates and sanitizes Gemini multimodal output.
  - Automatically falls back to high-fidelity offline deterministic engine with rich sample and repository data if offline or missing API keys.
  - Emits zero mock placeholders: all confidence and origin data is marked with proper attribution.

### F. VIN Decoder (`VINService.ts`)
- Local ISO 3779 compliant 17-character VIN verification, country and WMI decoding.

---

## 3. UI/UX & Interactive Features
1. **Interactive Photo Scanner**: 5-slot camera/upload workflow with live preview, drag-and-drop, and demo presets.
2. **Analysis Report**: High-contrast, clean dark-mode interface featuring score meters, pro/con analysis, repair breakdown, interactive pre-purchase checklist, and the "What If" simulator.
3. **Knowledge Map 3D**: Interactive rotational viewport with zone selection, hotspot pin triggers, part breakdowns, and repair price estimations.
4. **Car Comparator**: Side-by-side technical evaluation with score delta, financial breakdown comparison, and winner recommendation.
5. **Interactive Assistant**: Step-by-step guided physical inspection workflow (Cold engine, startup noise, exhaust smoke, clutch bite).
6. **Negotiation Playbook**: Ready-to-copy seller scripts and pre-inspection questions.

---

## 4. Verification & QA Status
- **TypeScript Compilation**: `npm run build` completed with 0 errors.
- **Linter**: `tsc --noEmit` verified with 0 errors.
- **Unit Test Suite**: 23 automated tests across 4 test suites passed with 100% success rate.
