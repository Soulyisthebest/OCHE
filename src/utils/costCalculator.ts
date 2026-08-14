export interface RealCostInput {
  askingPrice: number;
  transferFee?: number; // default ~200
  initialMaintenancePrice?: number; // default ~300
  repairsCostMin?: number;
  repairsCostMax?: number;
}

export interface RealCostResult {
  askingPrice: number;
  transferFee: number;
  initialMaintenance: number;
  repairsCostMin: number;
  repairsCostMax: number;
  totalMin: number;
  totalMax: number;
}

export interface NegotiationTargetResult {
  askingPrice: number;
  riskCost: number;
  targetPriceMin: number;
  targetPriceMax: number;
  maxRecommendedPrice: number;
  disclaimer: string;
}

export function calculateRealCost(input: RealCostInput): RealCostResult {
  const askingPrice = input.askingPrice || 0;
  const transferFee = input.transferFee ?? 200;
  const initialMaintenance = input.initialMaintenancePrice ?? 300;
  const repairsCostMin = input.repairsCostMin ?? 0;
  const repairsCostMax = input.repairsCostMax ?? repairsCostMin;

  const totalMin = askingPrice + transferFee + initialMaintenance + repairsCostMin;
  const totalMax = askingPrice + transferFee + initialMaintenance + repairsCostMax;

  return {
    askingPrice,
    transferFee,
    initialMaintenance,
    repairsCostMin,
    repairsCostMax,
    totalMin,
    totalMax
  };
}

export function calculateNegotiationTarget(
  askingPrice: number,
  repairsCostMax: number = 0,
  initialMaintenance: number = 300
): NegotiationTargetResult {
  const riskCost = repairsCostMax + Math.round(initialMaintenance * 0.5);
  const targetPriceMin = Math.max(0, askingPrice - riskCost - 300);
  const targetPriceMax = Math.max(0, askingPrice - Math.round(riskCost * 0.7));
  const maxRecommendedPrice = Math.max(0, askingPrice - Math.round(riskCost * 0.5));

  return {
    askingPrice,
    riskCost,
    targetPriceMin,
    targetPriceMax,
    maxRecommendedPrice,
    disclaimer: 'Estimación orientativa basada en imprevistos mecánicos y puesta a punto inicial.'
  };
}

