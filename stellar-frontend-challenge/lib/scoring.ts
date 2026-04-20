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
  // Weights
  const SPREAD_WEIGHT = 0.6;
  const LIQUIDITY_WEIGHT = 0.3;
  const VOLATILITY_WEIGHT = 0.1;

  // Normalized Spread (0-1) - Assume 2% spread is "perfect" (1.0)
  const normSpread = Math.min(spreadPercent / 2, 1);

  // Normalized Liquidity (0-1) - Assume $100k is "high" (1.0)
  const normLiquidity = Math.min(liquidityUSD / 100000, 1);

  // Normalized Volatility (0-1) - High volatility is riskier, so we invert it or dampen it
  // Here we use it as a multiplier for confidence
  const normVolatility = Math.max(0, 1 - volatilityIndex / 10);

  const score = (
    (normSpread * SPREAD_WEIGHT) +
    (normLiquidity * LIQUIDITY_WEIGHT) +
    (normVolatility * VOLATILITY_WEIGHT)
  ) * 100;

  return Math.round(score);
}
