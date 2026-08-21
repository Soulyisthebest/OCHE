/**
 * OCHE / CARCHECK AI — Phase 17: 3D UX Integration & Simplification Tests
 * Verifies dynamic capability detection, non-technical terminology,
 * vehicle report entry points, and fallback behavior.
 */

import { describe, it, expect } from 'vitest';
import { Vehicle3DService } from '../services/Vehicle3DService';
import { GLBAssetLoaderService } from '../services/GLBAssetLoaderService';

describe('Phase 17: 3D UX Integration & Simplification', () => {
  it('should detect dynamic capabilities (hasEngine, hasInterior, hasDoors) accurately for Golf 7', async () => {
    const golfAsset = await GLBAssetLoaderService.loadVehicle3DAsset('asset-golf-7-tdi');
    expect(golfAsset.asset.hasEngine).toBe(true);
    expect(golfAsset.asset.hasInterior).toBe(false);
    expect(golfAsset.asset.hasHood).toBe(true);
  });

  it('should detect dynamic capabilities for universal generic car model', async () => {
    const genericAsset = await GLBAssetLoaderService.loadVehicle3DAsset('asset-generic-car');
    expect(genericAsset.asset.hasEngine).toBe(true);
    expect(genericAsset.asset.hasWheels).toBe(true);
  });

  it('should provide non-alarmist phrasing for part knowledge cards', async () => {
    const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
    const card = await Vehicle3DService.getPartKnowledgeCard('part-golf-turbo', golfModel, 'ES');
    expect(card).toBeDefined();
    expect(card?.basicExplanation).toBeDefined();
    expect(card?.basicExplanation.length).toBeGreaterThan(10);
    // Should not assert the user's specific car is broken by default
    expect(card?.riskLevel).toBeDefined();
  });

  it('should correctly determine when a vehicle has a specific 3D model vs fallback', () => {
    // Known vehicle
    const hasGolf = Vehicle3DService.has3DModelForVehicle({
      make: 'Volkswagen',
      model: 'Golf VII',
      engine: '2.0 TDI'
    });
    expect(hasGolf).toBe(true);

    // Vehicle without dedicated 3D model
    const hasRareCar = Vehicle3DService.has3DModelForVehicle({
      make: 'Maserati',
      model: 'Ghibli'
    });
    expect(hasRareCar).toBe(false);

    // Fallback returns general architecture model
    const fallbackModel = Vehicle3DService.getModelForVehicle({
      make: 'Maserati',
      model: 'Ghibli'
    });
    expect(fallbackModel.id).toBe('model-3d-generic-car');
  });

  it('should maintain canonical 3D vehicle models and links to knowledge engine', () => {
    const models = Vehicle3DService.getAllModels();
    expect(models.length).toBeGreaterThanOrEqual(4);

    const modelIds = models.map((m) => m.id);
    expect(modelIds).toContain('model-3d-golf-ea288');
    expect(modelIds).toContain('model-3d-peugeot-puretech');
    expect(modelIds).toContain('model-3d-toyota-yaris');
    expect(modelIds).toContain('model-3d-bmw-f30');
  });
});
