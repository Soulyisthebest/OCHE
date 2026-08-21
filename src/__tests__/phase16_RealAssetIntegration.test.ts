/**
 * OCHE / CARCHECK AI — Phase 16 Test Suite: First Real 3D Asset Integration
 * Rigorous tests covering GLB validation, Volkswagen Golf VII 2.0 TDI registration,
 * license provenance checking, missing component feedback, and node hierarchy extraction.
 */

import { describe, it, expect } from 'vitest';
import { GLBAssetLoaderService } from '../services/GLBAssetLoaderService';
import { Vehicle3DService } from '../services/Vehicle3DService';
import { CANONICAL_3D_ASSETS } from '../data/car3DAssetsDatabase';

describe('FASE 16: First Real 3D Asset Integration (VW Golf VII 2.0 TDI)', () => {
  describe('1. GLB Binary Header Parsing & Verification', () => {
    it('should throw an error on empty or truncated buffers (< 20 bytes)', () => {
      const emptyBuffer = new ArrayBuffer(10);
      expect(() => GLBAssetLoaderService.parseGLBBuffer(emptyBuffer)).toThrow(
        'Buffer de archivo GLB inválido o truncado'
      );
    });

    it('should throw an error when binary magic header is not glTF (0x46546C67)', () => {
      const invalidBuffer = new ArrayBuffer(24);
      const view = new DataView(invalidBuffer);
      view.setUint32(0, 0x12345678, true); // Wrong magic
      view.setUint32(4, 2, true); // Version 2
      view.setUint32(8, 24, true); // Length

      expect(() => GLBAssetLoaderService.parseGLBBuffer(invalidBuffer)).toThrow(
        'Formato no reconocido: La cabecera no contiene el identificador binario glTF'
      );
    });

    it('should correctly parse a synthetically valid GLB v2 buffer header with node chunk', () => {
      const jsonStr = JSON.stringify({
        asset: { version: '2.0', generator: 'OCHE GLB Optimizer' },
        nodes: [
          { name: 'Golf7_Chassis' },
          { name: 'Golf7_Engine_EA288' },
          { name: 'Golf7_Hood_Hinged' },
          { name: 'Golf7_WaterPump_Unit' }
        ],
        meshes: [{}, {}],
        materials: [{}, {}],
        textures: [{}]
      });

      const jsonEncoder = new TextEncoder();
      const jsonBytes = jsonEncoder.encode(jsonStr);
      // Pad to 4-byte boundary
      const padding = (4 - (jsonBytes.byteLength % 4)) % 4;
      const paddedJsonLength = jsonBytes.byteLength + padding;

      const totalLength = 12 + 8 + paddedJsonLength;
      const buffer = new ArrayBuffer(totalLength);
      const view = new DataView(buffer);

      // Header
      view.setUint32(0, 0x46546c67, true); // 'glTF'
      view.setUint32(4, 2, true); // Version 2
      view.setUint32(8, totalLength, true); // Total length

      // Chunk 0 Header
      view.setUint32(12, paddedJsonLength, true); // Chunk length
      view.setUint32(16, 0x4e4f534a, true); // 'JSON'

      // Copy JSON
      const uint8 = new Uint8Array(buffer);
      uint8.set(jsonBytes, 20);

      const parsed = GLBAssetLoaderService.parseGLBBuffer(buffer);
      expect(parsed.magic).toBe('glTF');
      expect(parsed.version).toBe(2);
      expect(parsed.meshCount).toBe(2);
      expect(parsed.textureCount).toBe(1);
      expect(parsed.nodeNames).toContain('Golf7_Engine_EA288');
      expect(parsed.hasEngineNodes).toBe(true);
      expect(parsed.hasHoodNodes).toBe(true);
      expect(parsed.hasInteriorNodes).toBe(false);
    });
  });

  describe('2. Volkswagen Golf VII 2.0 TDI Asset Integrity', () => {
    it('should have Golf VII 2.0 TDI registered with WAITING_FOR_REAL_GLB_ASSET state', () => {
      const golfAsset = CANONICAL_3D_ASSETS.find((a) => a.vehicleId === 'golf-7-tdi');
      expect(golfAsset).toBeDefined();
      expect(golfAsset?.assetState).toBe('WAITING_FOR_REAL_GLB_ASSET');
      expect(golfAsset?.format).toBe('GLB');
    });

    it('should mark commercialUse as UNKNOWN until license agreement is finalized', () => {
      const golfAsset = CANONICAL_3D_ASSETS.find((a) => a.vehicleId === 'golf-7-tdi');
      expect(golfAsset?.license.commercialUse).toBe('UNKNOWN');
      expect(golfAsset?.license.commercialUseAllowed).toBe(false);
    });

    it('should have correct mechanical part linking to Knowledge Engine', () => {
      const golfAsset = CANONICAL_3D_ASSETS.find((a) => a.vehicleId === 'golf-7-tdi');
      const waterPumpPart = golfAsset?.parts.find((p) => p.meshNodeName === 'Golf7_WaterPump_Unit');
      const dpfPart = golfAsset?.parts.find((p) => p.meshNodeName === 'Golf7_DPF_Exhaust');

      expect(waterPumpPart).toBeDefined();
      expect(waterPumpPart?.partKnowledgeId).toBe('part-vw-waterpump');
      expect(dpfPart?.partKnowledgeId).toBe('part-vw-dpf');
    });

    it('should adhere to strict no-fake simulation: hasInterior is false and returns clear feedback', async () => {
      const result = await GLBAssetLoaderService.loadVehicle3DAsset('golf-7-tdi');
      expect(result.asset.hasInterior).toBe(false);
      expect(result.messages.interiorStatus).toBe('Interior 3D específico no disponible.');
      expect(result.asset.hasEngine).toBe(true);
      expect(result.messages.engineStatus).toBe('Conjunto motor EA288 2.0 TDI disponible para inspección.');
    });

    it('should permit OPEN_HOOD interaction while denying OPEN_DOOR because doors are not separate meshes', async () => {
      const result = await GLBAssetLoaderService.loadVehicle3DAsset('golf-7-tdi');
      expect(result.diagnostics.availableInteractions).toContain('OPEN_HOOD');
      expect(result.diagnostics.availableInteractions).not.toContain('OPEN_DOOR');
    });
  });

  describe('3. Node Hierarchy to Part Discovery', () => {
    it('should correctly categorize engine, brakes, suspension, and exhaust nodes', () => {
      const rawNodes = [
        'Body_Chassis_LOD0',
        'Engine_Block_EA288',
        'Front_Brake_Caliper_Left',
        'Suspension_Damper_Front',
        'Exhaust_DPF_Unit',
        'Hood_Hinged'
      ];

      const mapped = GLBAssetLoaderService.mapGLBNodesToParts(rawNodes, 'golf-7-tdi');
      expect(mapped.parts.length).toBe(6);
      expect(mapped.hasEngine).toBe(true);
      expect(mapped.hasHood).toBe(true);
      expect(mapped.hasInterior).toBe(false);

      const enginePart = mapped.parts.find((p) => p.meshNodeName === 'Engine_Block_EA288');
      expect(enginePart?.category).toBe('engine');
      expect(enginePart?.systemId).toBe('ENGINE');
      expect(enginePart?.isSeparableObject).toBe(true);

      const brakePart = mapped.parts.find((p) => p.meshNodeName === 'Front_Brake_Caliper_Left');
      expect(brakePart?.category).toBe('brakes');
      expect(brakePart?.systemId).toBe('BRAKES');
    });
  });

  describe('4. Vehicle3DService Integration Bridge', () => {
    it('should load real asset metadata via Vehicle3DService.loadRealGLBAsset', async () => {
      const res = await Vehicle3DService.loadRealGLBAsset('golf-7-tdi');
      expect(res).toBeDefined();
      expect(res.asset.vehicleId).toBe('golf-7-tdi');
      expect(res.state).toBe('WAITING_FOR_REAL_GLB_ASSET');
      expect(res.diagnostics.polygonCount).toBe(38400);
      expect(res.diagnostics.textureResolution).toBe('1024x1024');
    });

    it('should return non-diagnostic notice correctly', () => {
      const notice = Vehicle3DService.getNonDiagnosticNotice();
      expect(notice).toContain('El modelo 3D representa la arquitectura general');
      expect(notice).toContain('inspección visual fotográfica');
    });
  });
});
