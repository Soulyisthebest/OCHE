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

  describe('PHASE 13: 3D System Formal Verification (10 Critical Scenarios)', () => {
    // 1. Vehicle tiene Car3DModel cuando existe
    it('1. Vehicle tiene Car3DModel cuando existe en el catálogo', () => {
      const golfModel = Vehicle3DService.getModelForVehicle({ make: 'Volkswagen', model: 'Golf VII', engine: '2.0 TDI' });
      expect(golfModel).toBeDefined();
      expect(golfModel.id).toBe('model-3d-golf-ea288');

      const peugeotModel = Vehicle3DService.getModelForVehicle({ make: 'Peugeot', model: '208', engine: '1.2 PureTech' });
      expect(peugeotModel).toBeDefined();
      expect(peugeotModel.id).toBe('model-3d-peugeot-puretech');

      const toyotaModel = Vehicle3DService.getModelForVehicle({ make: 'Toyota', model: 'Yaris', engine: '1.0 VVT-i' });
      expect(toyotaModel).toBeDefined();
      expect(toyotaModel.id).toBe('model-3d-toyota-yaris');

      const bmwModel = Vehicle3DService.getModelForVehicle({ make: 'BMW', model: '320d', engine: '2.0d' });
      expect(bmwModel).toBeDefined();
      expect(bmwModel.id).toBe('model-3d-bmw-f30');
    });

    // 2. Car3DModel pertenece al Vehicle correcto
    it('2. Car3DModel pertenece al Vehicle correcto (make, model, engine coherentes)', () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      expect(golfModel.make.toLowerCase()).toContain('volkswagen');
      expect(golfModel.model.toLowerCase()).toContain('golf');

      const peugeotModel = Vehicle3DService.getModelById('model-3d-peugeot-puretech');
      expect(peugeotModel.make.toLowerCase()).toContain('peugeot');
      expect(peugeotModel.model.toLowerCase()).toContain('208');

      const toyotaModel = Vehicle3DService.getModelById('model-3d-toyota-yaris');
      expect(toyotaModel.make.toLowerCase()).toContain('toyota');
      expect(toyotaModel.model.toLowerCase()).toContain('yaris');

      const bmwModel = Vehicle3DService.getModelById('model-3d-bmw-f30');
      expect(bmwModel.make.toLowerCase()).toContain('bmw');
      expect(bmwModel.model.toLowerCase()).toContain('3');
    });

    // 3. Car3DPart puede relacionarse con Part
    it('3. Car3DPart puede relacionarse con Part canónica en la base de conocimiento', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      const golfTimingPart = golfModel.parts.find((p) => p.partId === 'part-vw-timingkit');
      expect(golfTimingPart).toBeDefined();

      const card = await Vehicle3DService.getPartKnowledgeCard(golfTimingPart!.id, golfModel, 'ES');
      expect(card.part).toBeDefined();
      expect(card.part.id).toBe('part-vw-timingkit');
    });

    // 4. Car3DPart puede relacionarse con VehicleSystem
    it('4. Car3DPart puede relacionarse con VehicleSystem estándar (ENGINE, BRAKES, etc.)', async () => {
      const peugeotModel = Vehicle3DService.getModelById('model-3d-peugeot-puretech');
      const wetBeltPart = peugeotModel.parts.find((p) => p.partId === 'part-peug-wetbelt');
      expect(wetBeltPart).toBeDefined();
      expect(wetBeltPart!.systemId).toBe('ENGINE');

      const card = await Vehicle3DService.getPartKnowledgeCard(wetBeltPart!.id, peugeotModel, 'ES');
      expect(card.system).toBeDefined();
      expect(card.system.id).toBe('ENGINE');
      expect(card.system.name).toContain('Motor');
    });

    // 5. Seleccionar una pieza devuelve la información correcta
    it('5. Seleccionar una pieza devuelve la información técnica correcta (¿Qué hace?, descripción, función)', async () => {
      const bmwModel = Vehicle3DService.getModelById('model-3d-bmw-f30');
      const timingChainPart = bmwModel.parts.find((p) => p.partId === 'part-bmw-timingchain-kit');
      expect(timingChainPart).toBeDefined();

      const card = await Vehicle3DService.getPartKnowledgeCard(timingChainPart!.id, bmwModel, 'ES');
      expect(card.part.name).toContain('Distribución');
      expect(card.part.function).toBeTruthy();
      expect(card.basicExplanation).toBeTruthy();
      expect(card.advancedExplanation).toBeTruthy();
    });

    // 6. Una pieza puede mostrar sus problemas conocidos
    it('6. Una pieza puede mostrar sus problemas conocidos del modelo si existen', async () => {
      const peugeotModel = Vehicle3DService.getModelById('model-3d-peugeot-puretech');
      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-peug-wetbelt', peugeotModel, 'ES');

      expect(card.knownProblems).toBeDefined();
      expect(card.knownProblems.length).toBeGreaterThan(0);
      const beltProblem = card.knownProblems.find((p) => p.id === 'prob-peug-wetbelt');
      expect(beltProblem).toBeDefined();
      expect(beltProblem?.title).toContain('Degradación');
    });

    // 7. Una pieza puede mostrar reparación y coste cuando existen
    it('7. Una pieza puede mostrar reparación y coste orientativo cuando existen', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');
      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-waterpump', golfModel, 'ES');

      expect(card.costBreakdown).toBeDefined();
      expect(card.costBreakdown.totalEstimatedExpected).toBeGreaterThan(0);
      expect(card.costBreakdown.currency).toBe('EUR');
      expect(card.costBreakdown.laborHours).toBeGreaterThan(0);
    });

    // 8. Vehículo sin modelo 3D no rompe la aplicación
    it('8. Vehículo sin modelo 3D específico no rompe la aplicación y proporciona fallback universal', () => {
      const unknownVehicle = { make: 'FabricanteInexistente', model: 'ModeloXYZ', engine: '1.0 Desconocido' };
      
      // Check fallback detection
      const hasSpecific3D = Vehicle3DService.has3DModelForVehicle(unknownVehicle);
      expect(hasSpecific3D).toBe(false);

      // Must resolve fallback model without throwing exception
      const fallbackModel = Vehicle3DService.getModelForVehicle(unknownVehicle);
      expect(fallbackModel).toBeDefined();
      expect(fallbackModel.id).toBeTruthy();
      expect(fallbackModel.parts.length).toBeGreaterThan(0);
    });

    // 9. El 3D no modifica el resultado del análisis
    it('9. El 3D es una capa de visualización de conocimiento y no muta el informe de análisis original', async () => {
      const mockReport: CarAnalysisReport = {
        id: 'rep-test-immutable',
        identity: {
          make: 'Volkswagen',
          model: 'Golf VII',
          engine: '2.0 TDI',
          year: 2015,
          marketPriceEstimate: { min: 10000, max: 13000, expected: 11500 }
        },
        globalScore: 82,
        generalCondition: 'Bueno',
        detectedIssues: [],
        repairEstimates: {
          urgentRepairs: [],
          recommendedRepairs: [],
          optionalRepairs: []
        },
        negotiationAdvice: { fairOfferPrice: 11000, maxTargetPrice: 11500, arguments: [] },
        createdAt: new Date().toISOString()
      } as any;

      const reportSnapshotBefore = JSON.stringify(mockReport);
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');

      // Interacting with 3D knowledge cards
      await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES', mockReport);
      await Vehicle3DService.getPartKnowledgeCard('p3d-golf-waterpump', golfModel, 'ES', mockReport);

      const reportSnapshotAfter = JSON.stringify(mockReport);
      expect(reportSnapshotAfter).toBe(reportSnapshotBefore);
    });

    // 10. El 3D no convierte conocimiento del modelo en diagnóstico del vehículo
    it('10. El 3D separa estrictamente conocimiento genérico del modelo ("Problemas conocidos") de observaciones reales detectadas', async () => {
      const golfModel = Vehicle3DService.getModelById('model-3d-golf-ea288');

      // Scenario A: Clean report (no observations for turbo)
      const cleanReport: Partial<CarAnalysisReport> = {
        identity: { make: 'Volkswagen', model: 'Golf VII', engine: '2.0 TDI', year: 2015, marketPriceEstimate: { min: 10000, max: 13000, expected: 11500 } },
        repairEstimates: { urgentRepairs: [], recommendedRepairs: [], optionalRepairs: [] }
      } as any;

      const cardClean = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES', cleanReport as CarAnalysisReport);
      
      // Must NOT claim that the user's specific turbo is broken
      expect(cardClean.observationStatus).toBe('KNOWN');
      expect(cardClean.observationEvidence).toBeUndefined();
      // But knowledge of the model remains available
      expect(cardClean.part.function).toBeTruthy();
      expect(cardClean.basicExplanation).toBeTruthy();

      // Scenario B: Report with detected defect on turbo
      const defectReport: Partial<CarAnalysisReport> = {
        identity: { make: 'Volkswagen', model: 'Golf VII', engine: '2.0 TDI', year: 2015, marketPriceEstimate: { min: 10000, max: 13000, expected: 11500 } },
        repairEstimates: {
          urgentRepairs: [{ partName: 'Turbocompresor', estimatedCost: 900, whyAttentionNeeded: 'Fuga de aceite visible', priority: 'Alta' }],
          recommendedRepairs: [],
          optionalRepairs: []
        }
      } as any;

      const cardDefect = await Vehicle3DService.getPartKnowledgeCard('p3d-golf-turbo', golfModel, 'ES', defectReport as CarAnalysisReport);
      expect(cardDefect.observationStatus).toBe('OBSERVED');
      expect(cardDefect.observationEvidence).toBeDefined();
      expect(cardDefect.observationEvidence?.details).toContain('Fuga de aceite visible');
    });
  });

  describe('PHASE 14: 3D Real-World Validation Suite', () => {
    // 1. Audit of the 4 Models
    it('Audits the 4 canonical models with complete structural integrity', () => {
      const models = [
        { id: 'model-3d-golf-ea288', make: 'Volkswagen', model: 'Golf VII', engine: '2.0 TDI' },
        { id: 'model-3d-peugeot-puretech', make: 'Peugeot', model: '208', engine: '1.2 PureTech' },
        { id: 'model-3d-toyota-yaris', make: 'Toyota', model: 'Yaris', engine: '1.0 VVT-i' },
        { id: 'model-3d-bmw-f30', make: 'BMW', model: 'Serie 3', engine: '2.0d TwinPower' }
      ];

      models.forEach((spec) => {
        const m = Vehicle3DService.getModelById(spec.id);
        expect(m).toBeDefined();
        expect(m.make).toBe(spec.make);
        expect(m.model).toBe(spec.model);
        expect(m.engine).toBe(spec.engine);
        expect(m.zones.length).toBeGreaterThanOrEqual(3);
        expect(m.parts.length).toBeGreaterThanOrEqual(4);

        // Verify each part has valid system and hotspot
        m.parts.forEach((p) => {
          expect(p.systemId).toBeTruthy();
          expect(p.hotspot.x).toBeGreaterThanOrEqual(0);
          expect(p.hotspot.x).toBeLessThanOrEqual(100);
          expect(p.hotspot.y).toBeGreaterThanOrEqual(0);
          expect(p.hotspot.y).toBeLessThanOrEqual(100);
          expect(p.importance).toMatch(/CRITICAL|HIGH|MEDIUM|LOW/);
        });
      });
    });

    // 2. Camera Presets
    it('Verifies all 7 camera presets exist and have valid angles and zoom', () => {
      const requiredPresets = ['FULL_CAR', 'ENGINE', 'FRONT', 'REAR', 'UNDERBODY', 'INTERIOR', 'SIDE'];
      const presetIds = CAMERA_PRESETS.map((p) => p.id);

      requiredPresets.forEach((pId) => {
        expect(presetIds).toContain(pId);
        const preset = CAMERA_PRESETS.find((p) => p.id === pId);
        expect(preset).toBeDefined();
        expect(preset!.zoom).toBeGreaterThan(0);
        expect(typeof preset!.rotationAngle).toBe('number');
      });
    });

    // 3. Fallback when vehicle or part is missing
    it('Handles unknown or corrupt model id gracefully without throwing', () => {
      const fallback = Vehicle3DService.getModelById('corrupt-non-existent-id');
      expect(fallback).toBeDefined();
      expect(fallback.id).toBe('model-3d-generic-car');
      expect(fallback.parts.length).toBeGreaterThan(0);
    });

    // 4. Missing part data returns safe card with UNKNOWN / default structure without crashing
    it('Handles non-existent partId safely in knowledge card generation', async () => {
      const genericModel = Vehicle3DService.getModelById('model-3d-generic-car');
      const card = await Vehicle3DService.getPartKnowledgeCard('part-non-existent-12345', genericModel, 'ES');
      expect(card).toBeDefined();
      expect(card.part).toBeDefined();
      expect(card.part.name).toBeTruthy();
      expect(card.basicExplanation).toBeTruthy();
      expect(card.costBreakdown).toBeDefined();
    });

    // 5. Chat Context generation
    it('Generates contextual prompt for AI assistant correctly', async () => {
      const peugeotModel = Vehicle3DService.getModelById('model-3d-peugeot-puretech');
      const card = await Vehicle3DService.getPartKnowledgeCard('p3d-peug-wetbelt', peugeotModel, 'ES');
      const chatContext = Vehicle3DService.generateChatContext(card, 'Peugeot 208 1.2 PureTech');

      expect(chatContext.initialPrompt).toContain('Peugeot 208');
      expect(chatContext.initialPrompt).toContain('Correa');
      expect(chatContext.partName).toContain('Correa');
    });
  });
});
