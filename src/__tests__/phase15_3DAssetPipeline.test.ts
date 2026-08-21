/**
 * OCHE / CARCHECK AI — Phase 15: 3D Asset Pipeline Prototype Test Suite
 * Validates 3D asset architecture, license metadata, part-system hierarchy,
 * Knowledge Engine links, interactive constraints, mobile optimization budgets,
 * fallback behaviors, and non-diagnostic invariant rules.
 */

import { describe, it, expect } from 'vitest';
import { LocalVehicle3DAssetProvider, local3DAssetProvider } from '../services/Vehicle3DAssetProvider';
import { Car3DAssetPipeline } from '../services/Car3DAssetPipeline';
import { Vehicle3DService } from '../services/Vehicle3DService';
import { CANONICAL_3D_ASSETS } from '../data/car3DAssetsDatabase';
import { Car3DAsset, Supported3DInteraction } from '../types/vehicle3DAsset';

describe('FASE 15 — 3D Asset Pipeline Prototype', () => {
  const provider = new LocalVehicle3DAssetProvider();

  // 1. Asset Loading
  it('1. ASSET_LOADING: Successfully loads 3D asset with complete metadata for supported vehicles', async () => {
    const golfAsset = await provider.getAsset('golf-7-tdi');
    expect(golfAsset).not.toBeNull();
    expect(golfAsset?.id).toBe('asset-golf-7-tdi');
    expect(golfAsset?.vehicleId).toBe('golf-7-tdi');
    expect(golfAsset?.format).toBe('GLB');
    expect(golfAsset?.polygonCount).toBeGreaterThan(0);
    expect(golfAsset?.parts.length).toBeGreaterThan(0);
    expect(golfAsset?.isReadyForWebProduction).toBe(true);

    const bmwAsset = await provider.getAsset('bmw-e46-320d');
    expect(bmwAsset).not.toBeNull();
    expect(bmwAsset?.hasDoors).toBe(true);
  });

  // 2. Missing Asset Handling
  it('2. MISSING_ASSET: Gracefully handles missing assets and returns null with hasAsset=false', async () => {
    const missingId = 'tesla-model-3-unsupported';
    const hasAsset = await provider.hasAsset(missingId);
    const asset = await provider.getAsset(missingId);

    expect(hasAsset).toBe(false);
    expect(asset).toBeNull();

    const parts = await provider.getParts(missingId);
    expect(parts).toEqual([]);
  });

  // 3. Asset-Part Relationship (Hierarchy)
  it('3. ASSET_PART_RELATIONSHIP: Validates parent-child hierarchy in 3D parts (e.g., body -> engine -> subparts)', async () => {
    const peugeotAsset = await provider.getAsset('peugeot-208-puretech');
    expect(peugeotAsset).not.toBeNull();

    const bodyPart = peugeotAsset?.parts.find((p) => p.category === 'body');
    expect(bodyPart).toBeDefined();

    const engineBlock = peugeotAsset?.parts.find((p) => p.id === 'part-p208-engine-block');
    expect(engineBlock).toBeDefined();
    expect(engineBlock?.parentPartId).toBe(bodyPart?.id);

    const wetBelt = peugeotAsset?.parts.find((p) => p.id === 'part-p208-wetbelt');
    expect(wetBelt).toBeDefined();
    expect(wetBelt?.parentPartId).toBe(engineBlock?.id);
  });

  // 4. Part-System Relationship
  it('4. PART_SYSTEM_RELATIONSHIP: Ensures all 3D parts map to standard canonical vehicle systems', async () => {
    for (const asset of CANONICAL_3D_ASSETS) {
      for (const part of asset.parts) {
        expect(part.systemId).toBeDefined();
        expect(typeof part.systemId).toBe('string');
        expect(['ENGINE', 'BRAKES', 'SUSPENSION', 'TRANSMISSION', 'BODY', 'EXHAUST', 'STEERING', 'ELECTRICAL']).toContain(part.systemId);
      }
    }
  });

  // 5. 3D-to-Knowledge Relationship
  it('5. 3D_TO_KNOWLEDGE_RELATIONSHIP: Traverses 3D Part -> Part -> VehicleSystem -> KnownProblems -> Repairs -> CostEstimate', async () => {
    const yarisAsset = await provider.getAsset('toyota-yaris-vvti');
    expect(yarisAsset).not.toBeNull();

    const clutchPart = yarisAsset!.parts.find((p) => p.id === 'part-yaris-clutch');
    expect(clutchPart).toBeDefined();

    const chain = await Car3DAssetPipeline.link3DPartToKnowledge(clutchPart!, 'toyota-yaris-vvti');
    expect(chain).toBeDefined();
    expect(chain.systemId).toBe('TRANSMISSION');
    expect(chain.systemName).toBeDefined();
    expect(chain.costEstimate).toBeDefined();
    expect(chain.costEstimate.totalExpected).toBeGreaterThan(0);
    expect(chain.disclaimer).toContain('El modelo 3D representa la arquitectura');
  });

  // 6. Interactive Parts and Actions
  it('6. INTERACTIVE_PARTS: Supports standard interactions and articulated actions when geometry exists', async () => {
    const bmwAsset = await provider.getAsset('bmw-e46-320d');
    expect(bmwAsset).not.toBeNull();

    const interactions = await provider.getAvailableInteractions('bmw-e46-320d');
    expect(interactions).toContain('ROTATE');
    expect(interactions).toContain('ZOOM');
    expect(interactions).toContain('SELECT');
    expect(interactions).toContain('HIGHLIGHT');
    expect(interactions).toContain('INSPECT');
    expect(interactions).toContain('EXPLODE');
    expect(interactions).toContain('OPEN_HOOD');
    expect(interactions).toContain('OPEN_DOOR');

    const canOpenHood = await provider.canExecuteInteraction('bmw-e46-320d', 'OPEN_HOOD');
    expect(canOpenHood).toBe(true);

    const canOpenDoor = await provider.canExecuteInteraction('bmw-e46-320d', 'OPEN_DOOR');
    expect(canOpenDoor).toBe(true);
  });

  // 7. Disallowed Interactions for Missing Physical Parts (Zero Fake Simulation)
  it('7. NO_FAKE_SIMULATION: Disallows articulated actions if parts do not exist as separate objects', async () => {
    const golfAsset = await provider.getAsset('golf-7-tdi');
    expect(golfAsset).not.toBeNull();

    // Golf has hood, but doors/trunk are not separate hinged objects in this asset
    const canOpenDoor = await provider.canExecuteInteraction('golf-7-tdi', 'OPEN_DOOR');
    expect(canOpenDoor).toBe(false);

    const validation = Car3DAssetPipeline.validateInteraction(golfAsset!, 'OPEN_DOOR');
    expect(validation.allowed).toBe(false);
    expect(validation.reason).toContain('no contiene puertas articulables');

    const canOpenTrunk = await provider.canExecuteInteraction('golf-7-tdi', 'OPEN_TRUNK');
    expect(canOpenTrunk).toBe(false);
  });

  // 8. Mobile Fallback and Optimization Pipeline
  it('8. MOBILE_OPTIMIZATION: Evaluates polygon budgets, texture resolutions, LOD readiness, and compression', () => {
    const golfAsset = CANONICAL_3D_ASSETS.find((a) => a.id === 'asset-golf-7-tdi')!;
    const report = Car3DAssetPipeline.evaluateAssetOptimization(golfAsset);

    expect(report.isMobileReady).toBe(true);
    expect(report.polygonBudgetScore).toBeGreaterThanOrEqual(60);
    expect(report.textureBudgetScore).toBeGreaterThanOrEqual(70);
    expect(report.isCompressed).toBe(true);
    expect(report.hasLOD).toBe(true);

    // Test a heavy unoptimized asset
    const heavyAsset: Car3DAsset = {
      id: 'heavy-test-asset',
      vehicleId: 'test-car',
      source: 'Raw Scan',
      license: {
        licenseType: 'EDITORIAL_ONLY',
        attributionRequired: true,
        commercialUseAllowed: false,
        commercialUse: 'NON_COMMERCIAL',
        modificationAllowed: false,
        redistributionAllowed: false
      },
      format: 'OBJ',
      polygonCount: 350000,
      textureSize: '8192x8192',
      hasInterior: true,
      hasEngine: true,
      hasDoors: true,
      hasHood: true,
      hasTrunk: true,
      hasWheels: true,
      parts: [],
      optimizationStatus: 'raw',
      compressionFormat: 'NONE',
      supportedInteractions: ['ROTATE'],
      isReadyForWebProduction: false,
      assetState: 'WAITING_FOR_REAL_GLB_ASSET'
    };

    const heavyReport = Car3DAssetPipeline.evaluateAssetOptimization(heavyAsset);
    expect(heavyReport.isMobileReady).toBe(false);
    expect(heavyReport.polygonBudgetScore).toBeLessThan(50);
    expect(heavyReport.textureBudgetScore).toBeLessThan(50);
    expect(heavyReport.recommendations.length).toBeGreaterThan(0);
  });

  // 9. Unknown Vehicle Fallback
  it('9. UNKNOWN_VEHICLE_FALLBACK: Provides generic universal architecture when vehicle asset is missing', async () => {
    const unknownVehicleId = 'hyundai-i30-2015';
    const hasAsset = await provider.hasAsset(unknownVehicleId);
    expect(hasAsset).toBe(false);

    const genericBlueprint = Car3DAssetPipeline.getFallbackArchitecture();
    expect(genericBlueprint).toBeDefined();
    expect(genericBlueprint.id).toBe('asset-generic-car');
    expect(genericBlueprint.vehicleId).toBe('generic-car-architecture');
    expect(genericBlueprint.parts.length).toBeGreaterThan(0);
    expect(genericBlueprint.supportedInteractions).toContain('ROTATE');
    expect(genericBlueprint.supportedInteractions).toContain('EXPLODE');
  });

  // 10. Asset License Metadata
  it('10. ASSET_LICENSE_METADATA: Verifies legal and provenance metadata on all registered assets', () => {
    for (const asset of CANONICAL_3D_ASSETS) {
      expect(asset.license).toBeDefined();
      expect(asset.license.licenseType).toBeDefined();
      expect(['COMMERCIAL_AUTHORIZED', 'ROYALTY_FREE', 'EDITORIAL_ONLY', 'CC_BY', 'PROPRIETARY']).toContain(
        asset.license.licenseType
      );
      expect(typeof asset.license.commercialUseAllowed).toBe('boolean');
      expect(typeof asset.license.attributionRequired).toBe('boolean');
      expect(asset.source).toBeDefined();
    }
  });

  // 11. 3D Never Blocks Core Flow
  it('11. 3D_NEVER_BLOCKS: Ensures 3D subsystem failures or absence never interrupt vehicle analysis pipeline', async () => {
    // Calling Vehicle3DService methods with null/undefined never throws fatal exceptions
    const nullAsset = await Vehicle3DService.get3DAsset('');
    expect(nullAsset).toBeNull();

    const hasNullAsset = await Vehicle3DService.has3DAsset('');
    expect(hasNullAsset).toBe(false);

    const defaultModel = Vehicle3DService.getModelForVehicle(undefined);
    expect(defaultModel).toBeDefined();

    const unknownCarModel = Vehicle3DService.getModelForVehicle({ make: 'Tesla', model: 'Model 3' });
    expect(unknownCarModel).toBeDefined();
    expect(unknownCarModel.id).toBe('model-3d-generic-car');
  });

  // 12. Strict Non-Diagnostic Invariant
  it('12. STRICT_NON_DIAGNOSTIC_BOUNDARY: Ensures 3D model represents architecture, never diagnosis of a specific car', async () => {
    const notice = Vehicle3DService.getNonDiagnosticNotice();
    expect(notice).toBeDefined();
    expect(notice).toContain('El modelo 3D representa la arquitectura general');
    expect(notice).not.toContain('Tu turbo está averiado');

    const golfAsset = await provider.getAsset('golf-7-tdi');
    const waterpumpPart = golfAsset!.parts.find((p) => p.id === 'part-golf-waterpump')!;
    const chain = await Car3DAssetPipeline.link3DPartToKnowledge(waterpumpPart, 'golf-7-tdi');

    expect(chain.disclaimer).toContain('El modelo 3D representa la arquitectura');
    expect(chain.disclaimer).not.toContain('Tu bomba de agua está averiada');
  });
});
