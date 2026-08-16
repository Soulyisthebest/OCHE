/**
 * OCHE / CARCHECK AI — Phase 7 Automated Test Suite
 * Validates 3D Vehicle Knowledge System, Canonical 3D Data,
 * Bridge to LocalVehicleRepository, Inspection Guides, Symptom Explorer,
 * Dynamic Country Costing, and Chat/Report Integrations.
 */

import { describe, it, expect } from 'vitest';
import { Vehicle3DService } from '../services/Vehicle3DService';
import {
  CANONICAL_3D_MODELS,
  CAMERA_PRESETS,
  SYMPTOM_EXPLORER_CATALOG,
  DEFAULT_INSPECTION_GUIDES
} from '../data/car3DModelsDatabase';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { CountryEngine } from '../services/CountryEngine';
import { CarAnalysisReport } from '../types';

describe('FASE 7: Interactive 3D Vehicle Knowledge System', () => {
  describe('Canonical 3D Database & Data Integrity', () => {
    it('should contain all canonical 3D models with valid structural properties', () => {
      expect(CANONICAL_3D_MODELS.length).toBeGreaterThanOrEqual(3);

      for (const model of CANONICAL_3D_MODELS) {
        expect(model.id).toBeTruthy();
        expect(model.make).toBeTruthy();
        expect(model.model).toBeTruthy();
        expect(model.engine).toBeTruthy();
        expect(model.zones.length).toBeGreaterThanOrEqual(3);
        expect(model.parts.length).toBeGreaterThanOrEqual(4);
        expect(typeof model.isDemo).toBe('boolean');

        // Verify zones
        for (const zone of model.zones) {
          expect(zone.id).toBeTruthy();
          expect(zone.name).toBeTruthy();
          expect(zone.cameraPreset).toBeTruthy();
        }

        // Verify parts
        for (const part of model.parts) {
          expect(part.id).toBeTruthy();
          expect(part.partId).toBeTruthy();
          expect(part.name).toBeTruthy();
          expect(part.systemId).toBeTruthy();
          expect(part.zoneId).toBeTruthy();
          expect(part.hotspot.x).toBeGreaterThanOrEqual(0);
          expect(part.hotspot.x).toBeLessThanOrEqual(100);
          expect(part.hotspot.y).toBeGreaterThanOrEqual(0);
          expect(part.hotspot.y).toBeLessThanOrEqual(100);
          expect(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).toContain(part.importance);
        }
      }
    });

    it('should define standard camera presets with rotation angles and zoom levels', () => {
      expect(CAMERA_PRESETS.length).toBeGreaterThanOrEqual(6);
      const presetIds = CAMERA_PRESETS.map((p) => p.id);
      expect(presetIds).toContain('FULL_CAR');
      expect(presetIds).toContain('ENGINE');
      expect(presetIds).toContain('FRONT');
      expect(presetIds).toContain('REAR');
      expect(presetIds).toContain('UNDERBODY');
      expect(presetIds).toContain('INTERIOR');

      for (const preset of CAMERA_PRESETS) {
        expect(preset.rotationAngle).toBeGreaterThanOrEqual(0);
        expect(preset.rotationAngle).toBeLessThanOrEqual(360);
        expect(preset.zoom).toBeGreaterThanOrEqual(0.5);
        expect(preset.zoom).toBeLessThanOrEqual(2.5);
      }
    });
  });

  describe('Vehicle3DService — Model Resolution', () => {
    it('should resolve Golf EA288 model for Volkswagen Golf vehicle input', () => {
      const model = Vehicle3DService.getModelForVehicle({
        make: 'Volkswagen',
        model: 'Golf VII',
        engine: '2.0 TDI'
      });
      expect(model.id).toBe('model-3d-golf-ea288');
      expect(model.make).toBe('Volkswagen');
    });

    it('should resolve Peugeot PureTech model for Peugeot 208 vehicle input', () => {
      const model = Vehicle3DService.getModelForVehicle({
        make: 'Peugeot',
        model: '208',
        engine: '1.2 PureTech'
      });
      expect(model.id).toBe('model-3d-peugeot-puretech');
      expect(model.make).toBe('Peugeot');
    });

    it('should resolve generic car model for undefined or unknown input without failing', () => {
      const model = Vehicle3DService.getModelForVehicle(undefined);
      expect(model).toBeDefined();
      expect(model.id).toBeTruthy();
    });
  });

  describe('Vehicle3DService — Knowledge Card Construction & Repository Bridge', () => {
    it('should construct complete PartKnowledgeCard connecting 3D part to domain repository', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES');

      expect(card).toBeDefined();
      expect(card.part.name).toContain('Turbo');
      expect(card.part.systemId).toBe('ENGINE');
      expect(card.basicExplanation).toBeTruthy();
      expect(card.advancedExplanation).toBeTruthy();
      expect(card.riskLevel).toBeTruthy();
      expect(card.inspectionGuide).toBeDefined();
      expect(card.inspectionGuide.howToCheck.length).toBeGreaterThan(0);
      expect(card.inspectionGuide.safetyWarnings.length).toBeGreaterThan(0);
    });

    it('should calculate dynamic country costs for parts with labor and conditions breakdown', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      
      // Test Spain (EUR)
      const cardES = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-flywheel', golfModel, 'ES');
      expect(cardES.costBreakdown.currency).toBe('EUR');
      expect(cardES.costBreakdown.countryCode).toBe('ES');
      expect(cardES.costBreakdown.partOem).toBeGreaterThan(100);
      expect(cardES.costBreakdown.partAftermarket).toBeGreaterThan(50);
      expect(cardES.costBreakdown.laborHours).toBeGreaterThan(0);
      expect(cardES.costBreakdown.laborCost).toBeGreaterThan(0);
      expect(cardES.costBreakdown.totalEstimatedExpected).toBeGreaterThan(cardES.costBreakdown.partAftermarket);

      // Test Mexico (MXN)
      const cardMX = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-flywheel', golfModel, 'MX');
      expect(cardMX.costBreakdown.currency).toBe('MXN');
      expect(cardMX.costBreakdown.countryCode).toBe('MX');
      expect(cardMX.costBreakdown.totalEstimatedExpected).toBeGreaterThan(1000);
    });
  });

  describe('Vehicle3DService — Symptom Explorer Diagnostics', () => {
    it('should return symptom catalog and filter by keyword correctly', () => {
      const allSymptoms = Vehicle3DService.getSymptomCandidates();
      expect(allSymptoms.length).toBeGreaterThanOrEqual(5);

      // Filter vibrations
      const vibrationResults = Vehicle3DService.getSymptomCandidates('vibra');
      expect(vibrationResults.length).toBeGreaterThanOrEqual(1);
      expect(vibrationResults[0].symptomName.toLowerCase()).toContain('vibra');
      expect(vibrationResults[0].candidateSystems.length).toBeGreaterThan(0);
      expect(vibrationResults[0].safeDrivingAdvice).toBeTruthy();

      // Filter smoke
      const smokeResults = Vehicle3DService.getSymptomCandidates('humo');
      expect(smokeResults.length).toBeGreaterThanOrEqual(1);
      expect(smokeResults[0].symptomName.toLowerCase()).toContain('humo');

      // Filter whistling / turbo
      const whistleResults = Vehicle3DService.getSymptomCandidates('silbido');
      expect(whistleResults.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Vehicle3DService — Scan Report & Chat Assistant Bridges', () => {
    it('should map report observations and urgent repairs to 3D parts', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');

      const mockReport: Partial<CarAnalysisReport> = {
        identity: {
          make: 'Volkswagen',
          model: 'Golf VII',
          engine: '2.0 TDI 150 CV',
          year: 2016,
          marketPriceEstimate: { min: 11000, max: 14000, expected: 12500 }
        },
        repairEstimates: {
          urgentRepairs: [
            {
              partName: 'Turbocompresor',
              estimatedCost: 1100,
              whyAttentionNeeded: 'Geometría atascada con fuga en eje.',
              priority: 'Alta'
            }
          ],
          recommendedRepairs: [],
          optionalRepairs: []
        }
      } as any;

      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES', mockReport as CarAnalysisReport);
      expect(card.observationStatus).toBe('OBSERVED');
      expect(card.observationEvidence).toBeDefined();
      expect(card.observationEvidence?.severity).toBe('critical');
      expect(card.observationEvidence?.details).toContain('Geometría atascada');
    });

    it('should generate structured ChatPartContext payload for CarChatAssistant launch', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES');

      const chatContext = Vehicle3DService.generateChatContext(card, 'Volkswagen Golf VII (2.0 TDI)');
      expect(chatContext.partName).toContain('Turbo');
      expect(chatContext.vehicleName).toContain('Volkswagen Golf VII');
      expect(chatContext.initialPrompt).toContain('Turbo');
      expect(chatContext.initialPrompt).toContain('Volkswagen Golf VII');
      expect(chatContext.initialPrompt).toContain('¿Podrías explicarme');
    });
  });
});
