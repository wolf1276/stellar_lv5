/**
 * Heuristic-based routing and opportunity scoring
 * Inputs: spread %, liquidity depth (approx), recent volatility
 * Output: score 0–100
 */
export function calculateOpportunityScore(
  spreadPercent: number,
  liquidityUSD: number,
  volatilityIndex: number
): number {
  const SPREAD_WEIGHT = 0.6;
  const LIQUIDITY_WEIGHT = 0.3;
  const VOLATILITY_WEIGHT = 0.1;

  const normSpread = Math.min(spreadPercent / 2, 1);

  const normLiquidity = Math.min(liquidityUSD / 100000, 1);

  const normVolatility = Math.max(0, 1 - volatilityIndex / 10);

  const score = (
    (normSpread * SPREAD_WEIGHT) +
    (normLiquidity * LIQUIDITY_WEIGHT) +
    (normVolatility * VOLATILITY_WEIGHT)
  ) * 100;

  return Math.round(score);
}
