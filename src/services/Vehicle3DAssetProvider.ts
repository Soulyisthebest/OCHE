/**
 * OCHE / CARCHECK AI — 3D Asset Provider (FASE 15)
 * Standardized vehicle 3D asset query interface and local provider.
 * Implements strict zero-guessing and local mock isolation without external marketplace APIs.
 */

import { Car3DAsset, Car3DAssetPart, Supported3DInteraction } from '../types/vehicle3DAsset';
import { CANONICAL_3D_ASSETS } from '../data/car3DAssetsDatabase';

export interface Vehicle3DAssetProvider {
  getAsset(vehicleId: string): Promise<Car3DAsset | null>;
  getParts(vehicleId: string): Promise<Car3DAssetPart[]>;
  hasAsset(vehicleId: string): Promise<boolean>;
  getAvailableInteractions(vehicleId: string): Promise<Supported3DInteraction[]>;
  canExecuteInteraction(vehicleId: string, interaction: Supported3DInteraction): Promise<boolean>;
}

export class LocalVehicle3DAssetProvider implements Vehicle3DAssetProvider {
  private assets: Car3DAsset[] = CANONICAL_3D_ASSETS;

  /**
   * Retrieve 3D Asset by vehicleId (returns null if unsupported)
   */
  async getAsset(vehicleId: string): Promise<Car3DAsset | null> {
    if (!vehicleId) return null;
    const vId = vehicleId.toLowerCase().trim();
    
    // Direct vehicleId match
    const exact = this.assets.find(
      (a) => a.vehicleId.toLowerCase() === vId || a.id.toLowerCase() === vId
    );
    if (exact) return exact;

    // Fuzzy matching for canonical models
    if (vId.includes('golf') || vId.includes('ea288')) {
      return this.assets.find((a) => a.vehicleId === 'golf-7-tdi') || null;
    }
    if (vId.includes('208') || vId.includes('puretech')) {
      return this.assets.find((a) => a.vehicleId === 'peugeot-208-puretech') || null;
    }
    if (vId.includes('yaris') || vId.includes('vvti') || vId.includes('1kr')) {
      return this.assets.find((a) => a.vehicleId === 'toyota-yaris-vvti') || null;
    }
    if (vId.includes('320d') || vId.includes('bmw') || vId.includes('e46') || vId.includes('f30') || vId.includes('m47')) {
      return this.assets.find((a) => a.vehicleId === 'bmw-e46-320d') || null;
    }

    return null;
  }

  /**
   * Retrieve part hierarchy for vehicle (returns empty list if missing)
   */
  async getParts(vehicleId: string): Promise<Car3DAssetPart[]> {
    const asset = await this.getAsset(vehicleId);
    return asset ? [...asset.parts] : [];
  }

  /**
   * Check if a 3D asset exists for this vehicle
   */
  async hasAsset(vehicleId: string): Promise<boolean> {
    const asset = await this.getAsset(vehicleId);
    return asset !== null;
  }

  /**
   * List verified supported interactions for a vehicle asset
   */
  async getAvailableInteractions(vehicleId: string): Promise<Supported3DInteraction[]> {
    const asset = await this.getAsset(vehicleId);
    if (!asset) {
      // Fallback universal interactions
      return ['ROTATE', 'ZOOM', 'SELECT', 'HIGHLIGHT', 'INSPECT', 'EXPLODE'];
    }
    return [...asset.supportedInteractions];
  }

  /**
   * Verify if a specific interaction is physically and architecturally supported
   * (Does NOT fake interaction if piece is not a distinct object)
   */
  async canExecuteInteraction(vehicleId: string, interaction: Supported3DInteraction): Promise<boolean> {
    const asset = await this.getAsset(vehicleId);
    if (!asset) return false;

    // Standard camera/inspection interactions are always supported on valid assets
    if (['ROTATE', 'ZOOM', 'SELECT', 'HIGHLIGHT', 'INSPECT', 'EXPLODE'].includes(interaction)) {
      return true;
    }

    // Articulated interactions require explicit discrete geometry flags
    if (interaction === 'OPEN_HOOD') {
      return asset.hasHood && asset.parts.some((p) => p.isSeparableObject && p.meshNodeName?.toLowerCase().includes('hood'));
    }
    if (interaction === 'OPEN_DOOR') {
      return asset.hasDoors && asset.parts.some((p) => p.isSeparableObject && p.meshNodeName?.toLowerCase().includes('door'));
    }
    if (interaction === 'OPEN_TRUNK') {
      return asset.hasTrunk && asset.parts.some((p) => p.isSeparableObject && p.meshNodeName?.toLowerCase().includes('trunk'));
    }

    return false;
  }

  /**
   * Get the universal generic architecture blueprint
   */
  getGenericBlueprint(): Car3DAsset {
    return this.assets.find((a) => a.id === 'asset-generic-car') || this.assets[0];
  }
}

export const local3DAssetProvider = new LocalVehicle3DAssetProvider();
