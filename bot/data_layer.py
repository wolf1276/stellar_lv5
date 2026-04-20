import asyncio
import random
from stellar_sdk import Server, Asset

class DataLayer:
    def __init__(self, horizon_url="https://horizon-testnet.stellar.org"):
        self.server = Server(horizon_url)
        self.pools = {}

    async def fetch_pool_reserves(self, pool_id):
        """
        Fetches reserves for a specific Liquidity Pool.
        """
        # In a real scenario, we use self.server.liquidity_pools().liquidity_pool(pool_id).call()
        # For the prototype, we simulate realistic reserves
        reserves = {
            "XLM": random.uniform(100000, 500000),
            "USDC": random.uniform(10000, 50000),
            "BTC": random.uniform(1, 5)
        }
        self.pools[pool_id] = reserves
        return reserves

    async def monitor_pools(self, pool_ids):
        """
        Continuously monitors pools for reserve changes.
        """
        while True:
            for pool_id in pool_ids:
                await self.fetch_pool_reserves(pool_id)
            await asyncio.sleep(0.5) # High frequency polling simulation

    def get_price(self, pool_id, token_in, token_out):
        """
        Calculates price based on x*y=k formula for AMMs.
        """
        reserves = self.pools.get(pool_id)
        if not reserves:
            return 0
        
        # Price = ReserveOut / ReserveIn (Simplified)
        return reserves[token_out] / reserves[token_in]
