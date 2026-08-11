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
