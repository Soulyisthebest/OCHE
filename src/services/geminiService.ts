import { CarAnalysisReport, PhotoSlotId } from '../types';
import { AIOrchestrator } from './AIOrchestrator';

export async function analyzeCarPhotosServer(
  photos: Partial<Record<PhotoSlotId, { url?: string; base64?: string }>>,
  userInputs?: { mileageKm?: number; askingPrice?: number }
): Promise<CarAnalysisReport> {
  return AIOrchestrator.analyzeCar(photos, userInputs);
}
