import asyncio
from bot.data_layer import DataLayer

class ArbEngine:
    def __init__(self, data_layer: DataLayer):
        self.data_layer = data_layer
        self.min_profit_threshold = 0.01 # 1% profit minimum

    def check_triangular_arb(self, pool_a, pool_b, pool_c):
        """
        Check for triangular arbitrage: XLM -> USDC -> BTC -> XLM
        """
        # Step 1: XLM to USDC (Pool A)
        price_a = self.data_layer.get_price(pool_a, "XLM", "USDC")
        # Step 2: USDC to BTC (Pool B)
        price_b = self.data_layer.get_price(pool_b, "USDC", "BTC")
        # Step 3: BTC to XLM (Pool C)
        price_c = self.data_layer.get_price(pool_c, "BTC", "XLM")

        total_return = price_a * price_b * price_c
        profit = total_return - 1.0
        
        if profit > self.min_profit_threshold:
            return {
                "type": "triangular",
                "path": ["XLM", "USDC", "BTC", "XLM"],
                "profit": profit,
                "pools": [pool_a, pool_b, pool_c]
            }
        return None

    def check_cross_pool_arb(self, pool_1, pool_2, token_pair):
        """
        Check for cross-pool arbitrage: Buy on Pool 1, Sell on Pool 2
        """
        price_1 = self.data_layer.get_price(pool_1, token_pair[0], token_pair[1])
        price_2 = self.data_layer.get_price(pool_2, token_pair[1], token_pair[0])

        total_return = price_1 * price_2
        profit = total_return - 1.0

        if profit > self.min_profit_threshold:
            return {
                "type": "cross_pool",
                "path": [token_pair[0], token_pair[1], token_pair[0]],
                "profit": profit,
                "pools": [pool_1, pool_2]
            }
        return None
