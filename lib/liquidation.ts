/**
 * Prototype health check simulation
 * Health Factor = (Collateral Value * Liquidation Threshold) / Total Debt
 */
export interface Position {
  collateralAmount: number;
  collateralPrice: number;
  debtAmount: number;
  debtPrice: number;
  threshold: number; // e.g., 0.8
}

export function calculateHealthFactor(position: Position): number {
  const collateralValue = position.collateralAmount * position.collateralPrice;
  const debtValue = position.debtAmount * position.debtPrice;

  if (debtValue === 0) return 999; // Safe

  return (collateralValue * position.threshold) / debtValue;
}

export function getHealthStatus(healthFactor: number): {
  status: 'Safe' | 'Warning' | 'Critical' | 'Liquidatable';
  color: string;
} {
  if (healthFactor >= 1.5) return { status: 'Safe', color: 'text-secondary' };
  if (healthFactor >= 1.1) return { status: 'Warning', color: 'text-[#FDDA24]' };
  if (healthFactor >= 1.0) return { status: 'Critical', color: 'text-orange-500' };
  return { status: 'Liquidatable', color: 'text-error' };
}
