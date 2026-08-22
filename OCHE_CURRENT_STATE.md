# OCHE — CURRENT STATE MAP

## PRODUCT
- **Application Name**: OCHE / CARCHECK AI
- **Version**: 2.5.0-master (Automotive Consumer AI Assistant)
- **Architecture**: Full-stack Vite + React 19 + TypeScript + Node/Express (server-side Gemini 2.5 proxy) + Deterministic Risk & Cost Engines + Procedural/GLTF 3D Explorer.
- **Main Golden Flow**:
  1. Home (Clear CTA: [ ANALIZAR COCHE ] + Last Analysis Card)
  2. Vehicle Identification (AI Vision + Confidence classification: CONFIRMED / HIGH CONFIDENCE / PROBABLE / UNKNOWN)
  3. Confirmation Screen (3-second clarity: "¿Es este coche?" -> SÍ / NO, CORREGIR)
  4. Progressive Basic Data (Asking price, Km, Listing)
  5. Guided Multi-Step Photo Scan (Exterior, Interior, Engine Bay, Tyres)
  6. AI Multi-Modal Inspection + Deterministic Risk Engine
  7. 4-Level Progressive Disclosure Report (1. Verdict & Score, 2. Real Cost Breakdown, 3. Critical Checks with Interactive Tests, 4. Negotiation Script)
  8. Interactive 3D Component Locator & In-Situ Step-by-step Mechanical Checks ("Guíame")

---

## FUNCTIONAL (What Actually Works)
1. **Deterministic Scoring Engine** (`PurchaseScoreEngine.ts`, `CountryEngine.ts`):
   - Multi-factor algorithmic calculation based on reliability, physical condition, market price, endemic risks, and maintenance records. No hallucinated LLM score numbers.
2. **Real Cost Engine** (`CostEngine.ts`, `EntryCostEngine.ts`, `RepairCostEngine.ts`):
   - Asking Price + Initial Essential Setup + Known Endemic Probable Repairs + Risk Reserve = Real Cost of Ownership.
3. **Vehicle Identification & Ontology** (`VehicleResolverService.ts`, `VehicleIdentificationService.ts`):
   - Hierarchy: Brand -> Model -> Generation -> Engine -> Trim.
   - Exact matching against supported catalog with confidence scores and graceful fallback (`UNKNOWN` / `IDENTIFIED_BUT_UNSUPPORTED`).
4. **Physical Check Guides** (`InteractiveExplanationModal.tsx`, `AssistantMode.tsx`):
   - Actionable step-by-step instructions (3rd gear clutch test, 1€ coin tyre tread depth test, cold start oil filler cap mayonnaise check) with results: 🟢 NORMAL, 🟡 SUSPICIOUS, 🔴 ABNORMAL, ⚪ NOT TESTED.
5. **Negotiation Generator** (`NegotiationEngine.ts`, `NegotiationPlaybook.tsx`):
   - Generates grounded, respectful, non-aggressive negotiation scripts for WhatsApp or in-person sellers based on real repair deductions.
6. **3D Vehicle Explorer** (`Car3DExplorer.tsx`, `Car3DAssetPipeline.ts`):
   - Interactive 3D vehicle highlighting issues (tyres, engine, brakes, bodywork) with camera focus transitions.
7. **Local Storage & Garage History** (`GarageHistory.tsx`, `AnalysisSessionService.ts`):
   - Multi-car comparison, bookmarking, and local session persistence.
8. **Automated Test Suite**:
   - 19 test files, 191 tests passing in Vitest.

---

## PARTIAL (What Partially Works)
1. **Camera Quality Pre-Validation** (`PhotoScanner.tsx`):
   - Supports upload & live capture with guided silhouettes, basic resolution check, and angle classification; real-time blur/lighting heuristics are simulated on browser Canvas.
2. **What-If Simulation** (`WhatIfSimulator.tsx`):
   - Live score recalibration when user confirms/declines specific repairs; fully working in UI modal, integrated smoothly into report flow.

---

## MOCK (What is Simulated / Offline Fallbacks)
1. **Offline Knowledge Fallback**:
   - When Gemini API key is missing or offline, uses local deterministic knowledge engine and verified sample databases (`sampleCars.ts`, `vehicleDatabase.ts`) with zero downtime.

---

## PENDING (Continuous Polish)
1. **Voice Guidance Audio in In-Situ Assistant**:
   - Web Speech API integration for hands-free audio cues when user is holding a tool with greasy hands under the hood.

---

## KNOWN PROBLEMS
- Mobile viewports on ultra-narrow screens (under 340px) require continuous testing for tight padding.
- 3D WebGL context handling when backgrounding/switching tabs on low-end mobile devices.

---

## NEXT PRIORITY
- Maintain ultra-clean 80/20 visual-to-text ratio across all screens.
- Keep mobile touch targets >= 48px for outdoor one-handed operation.
- Ensure 100% compliance with zero false diagnosis and clear confidence badges.
