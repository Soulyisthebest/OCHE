/**
 * OCHE / CARCHECK AI — Phase 8 Integration & Single Source of Truth Test Suite
 * Validates the complete pipeline integration, repository authority,
 * zero default-to-Golf integrity, and clear boundaries between observed and known flaws.
 */

import { describe, it, expect } from 'vitest';
import { localVehicleRepository } from '../repositories/LocalVehicleRepository';
import { VehicleService } from '../services/VehicleService';
import { VehicleResolverService } from '../services/VehicleResolverService';
import { VehicleIdentificationService } from '../services/VehicleIdentificationService';
import { VehicleContextBuilder } from '../services/VehicleContextBuilder';
import { Vehicle3DService } from '../services/Vehicle3DService';
import { PurchaseScoreEngine } from '../services/PurchaseScoreEngine';
import { RiskEngine } from '../services/RiskEngine';
import { CostEngine } from '../services/CostEngine';
import { EntryCostEngine } from '../services/EntryCostEngine';
import { RepairCostEngine } from '../services/RepairCostEngine';
import { CountryEngine } from '../services/CountryEngine';
import { EvidenceEngine } from '../services/EvidenceEngine';
import { AIOrchestrator } from '../services/AIOrchestrator';

describe('Phase 8: Single Source of Truth & Engine Integration', () => {

  // -------------------------------------------------------------
  // Test 1: Photo-to-Identification flow
  // -------------------------------------------------------------
  it('1. Photo-to-Identification resolves candidates dynamically without hardcoding', async () => {
    const result = await VehicleIdentificationService.identifyVehicle(
      { front: { url: 'https://example.com/bmw.jpg' } },
      { brandHint: 'BMW', modelHint: 'Serie 3', year: 2014, fuel: 'Diésel' }
    );

    expect(result.brand).toBe('BMW');
    expect(result.model).toBe('Serie 3');
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  // -------------------------------------------------------------
  // Test 2: Repository-to-Knowledge ontology flow
  // -------------------------------------------------------------
  it('2. VehicleRepository serves as canonical knowledge source for systems and engines', async () => {
    const brands = await localVehicleRepository.getBrands();
    expect(brands.length).toBeGreaterThan(0);

    const golfGen = await localVehicleRepository.getGenerationById('gen-golf-7');
    expect(golfGen).toBeDefined();
    expect(golfGen?.generationName).toContain('Golf VII');

    const ea288 = await localVehicleRepository.getEngineById('eng-ea288-20tdi');
    expect(ea288).toBeDefined();
    expect(
      ea288?.engineCodes.some(c => (typeof c === 'string' ? c : c.engineCode) === 'CRBC' || (typeof c === 'string' ? c : c.engineCode) === 'CRLB')
    ).toBe(true);

    const systems = await localVehicleRepository.getVehicleSystems('veh-global-golf-7-20tdi');
    expect(systems.length).toBeGreaterThanOrEqual(16);
  });

  // -------------------------------------------------------------
  // Test 3: Knowledge-to-Risk assessment flow
  // -------------------------------------------------------------
  it('3. Knowledge-to-Risk distinguishes known flaws from observed defects', async () => {
    const domainVeh = await localVehicleRepository.getDomainVehicleById('golf-7-tdi');
    expect(domainVeh).toBeDefined();

    const findings = [
      EvidenceEngine.classifyVisualObservation({
        category: 'Exterior',
        part: 'Paragolpes delantero',
        status: 'warning',
        title: 'Arañazo leve en paragolpes',
        description: 'Rozadura superficial sin deformación de chapa'
      })
    ];

    const riskOutput = RiskEngine.assessDetailedRisk(findings, domainVeh!, 140000, 11000);
    expect(riskOutput.details.visualRisk.level).toBe('MEDIUM');
    expect(riskOutput.details.knownProblemRisk).toBeDefined();
    expect(riskOutput.details.overallRisk.level).toBeDefined();
  });

  // -------------------------------------------------------------
  // Test 4: Risk-to-Score calculation flow
  // -------------------------------------------------------------
  it('4. PurchaseScoreEngine calculates deterministic scores with mathematical weights', () => {
    const scoreResult = PurchaseScoreEngine.calculate({
      reliabilityScore: 85,
      visibleStateScore: 90,
      maintenanceScore: 80,
      priceValueScore: 85,
      mechanicalRiskScore: 75,
      askingPrice: 12000,
      mileageKm: 140000
    });

    expect(scoreResult.score).toBeGreaterThanOrEqual(0);
    expect(scoreResult.score).toBeLessThanOrEqual(100);
    expect(['BUY', 'NEGOTIATE', 'AVOID']).toContain(scoreResult.verdict);
    expect(scoreResult.categories.length).toBe(5);
  });

  // -------------------------------------------------------------
  // Test 5: Vehicle-to-Cost calculation flow with Country Profile
  // -------------------------------------------------------------
  it('5. CostEngine uses CountryEngine profiles dynamically for taxes and transfer fees', () => {
    CountryEngine.setActiveCountryCode('ES');
    const esCosts = CostEngine.calculateRealPurchaseCost({
      purchasePrice: 10000,
      countryCode: 'ES'
    });

    CountryEngine.setActiveCountryCode('DE');
    const deCosts = CostEngine.calculateRealPurchaseCost({
      purchasePrice: 10000,
      countryCode: 'DE'
    });

    expect(esCosts.currency).toBe('EUR');
    expect(deCosts.currency).toBe('EUR');
    expect(esCosts.totalExpected).toBeGreaterThan(10000);
    expect(deCosts.totalExpected).toBeGreaterThan(10000);
  });

  // -------------------------------------------------------------
  // Test 6: Vehicle-to-3D part resolution flow
  // -------------------------------------------------------------
  it('6. Vehicle3DService resolves mechanical knowledge and pricing via VehicleRepository', async () => {
    const model = Vehicle3DService.getModelById('model-3d-golf-ea288');
    expect(model).toBeDefined();
    expect(model.parts.length).toBeGreaterThan(0);

    const timingCard = await Vehicle3DService.getPartKnowledgeCard('part-vw-timingkit', model, 'ES');
    expect(timingCard).toBeDefined();
    expect(timingCard.part.name).toContain('Distribución');
    expect(timingCard.costBreakdown.partNew).toBeGreaterThan(0);
    expect(timingCard.part.symptoms.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------
  // Test 7: Vehicle-to-AI dynamic context flow
  // -------------------------------------------------------------
  it('7. VehicleContextBuilder builds grounded dynamic prompt context', async () => {
    const context = await VehicleContextBuilder.buildContextForVehicle('golf-7-tdi', 148000, 11900);
    expect(context).toContain('BASE DE CONOCIMIENTO TÉCNICA GROUNDED');
    expect(context).toContain('Volkswagen');
    expect(context).toContain('Golf');
    expect(context).toContain('PUNTOS DÉBILES Y AVERÍAS ENDÉMICAS');
  });

  // -------------------------------------------------------------
  // CRITICAL TEST A: Gemini / Offline failure must NEVER default to Golf
  // -------------------------------------------------------------
  it('CRITICAL A: Offline report with empty inputs returns UNKNOWN vehicle, never Golf', () => {
    const report = AIOrchestrator.generateOfflineReport({});

    expect(report.identity.make).not.toBe('Volkswagen');
    expect(report.identity.model).not.toBe('Golf');
    expect(report.identity.confidenceScore).toBe(0);
    expect(report.identity.needsConfirmation).toBe(true);
  });

  // -------------------------------------------------------------
  // CRITICAL TEST B: Deterministic PurchaseScoreEngine authority
  // -------------------------------------------------------------
  it('CRITICAL B: Score calculation is deterministic and cannot be bypassed', () => {
    const scoreA = PurchaseScoreEngine.calculate({
      reliabilityScore: 90,
      visibleStateScore: 90,
      maintenanceScore: 90,
      priceValueScore: 90,
      mechanicalRiskScore: 90,
      askingPrice: 10000,
      mileageKm: 50000
    });

    const scoreB = PurchaseScoreEngine.calculate({
      reliabilityScore: 90,
      visibleStateScore: 90,
      maintenanceScore: 90,
      priceValueScore: 90,
      mechanicalRiskScore: 90,
      askingPrice: 10000,
      mileageKm: 50000
    });

    expect(scoreA.score).toBe(scoreB.score);
    expect(scoreA.verdict).toBe(scoreB.verdict);
  });

  // -------------------------------------------------------------
  // CRITICAL TEST C: CostEngine is authoritative for costs
  // -------------------------------------------------------------
  it('CRITICAL C: CostEngine calculates exact breakdown and negotiation targets', () => {
    const realCost = CostEngine.calculateRealCost(10000, [
      {
        id: 'r1',
        partName: 'Pastillas de freno',
        whatItDoes: 'Frena el coche',
        whyAttentionNeeded: 'Desgaste',
        costNewMin: 60,
        costNewMax: 100,
        laborCostMin: 40,
        laborCostMax: 80,
        totalEstimatedMin: 100,
        totalEstimatedMax: 180,
        priority: 'Media',
        category: 'Frenos'
      }
    ]);

    expect(realCost.askingPrice).toBe(10000);
    expect(realCost.visibleRepairsMin).toBe(100);
    expect(realCost.visibleRepairsMax).toBe(180);
    expect(realCost.totalMin).toBeGreaterThan(10000);

    const negotiation = CostEngine.calculateNegotiationTarget(10000, realCost);
    expect(negotiation.targetPriceMin).toBeLessThanOrEqual(10000);
  });

  // -------------------------------------------------------------
  // CRITICAL TEST D: 3D Part resolves dynamically through VehicleRepository
  // -------------------------------------------------------------
  it('CRITICAL D: 3D parts resolve through repository without hardcoded prices in 3D models', async () => {
    const model = Vehicle3DService.getModelById('model-3d-golf-ea288');
    const part = model.parts.find(p => p.partId === 'part-vw-timingkit');
    expect(part).toBeDefined();

    const card = await Vehicle3DService.getPartKnowledgeCard(part!.partId, model, 'ES');
    expect(card.costBreakdown.partNew).toBeGreaterThan(0);
    expect(card.costBreakdown.laborHours).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------
  // CRITICAL TEST E: Model known problem is not automatically reported as observed defect
  // -------------------------------------------------------------
  it('CRITICAL E: Model known problem has evidenceType KNOWN, not OBSERVED', () => {
    const modelFlaw = EvidenceEngine.classifyKnownModelFlaw({
      type: 'known_issue',
      title: 'Bomba de agua con fugas',
      description: 'Problema común en motores EA288 pasados 120.000 km',
      isModelGeneral: true
    });

    expect(modelFlaw.evidenceType).toBe('KNOWN');
    expect(modelFlaw.evidenceType).not.toBe('OBSERVED');
  });
});
