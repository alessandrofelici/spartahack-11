import httpx
from ..config import settings
from ..services.price_feed import PriceFeed

class LiquidityFetcher:
    def __init__(self):
        self.subgraph_url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
        self.price_feed = PriceFeed()

    async def get_pool_liquidity(self, token_address: str) -> float:
        try:
            # 1. Get ETH Price for conversion
            eth_price = await self.price_feed.get_eth_price()
            
            # 2. Query pairs
            weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            token = token_address.lower()
            
            # Skip if token is WETH (infinite liquidity conceptually for this check)
            if token == weth:
                return 100_000_000.0

            query = """
            query {
              pairs(where: { token0_in: ["%s", "%s"], token1_in: ["%s", "%s"] }, first: 1, orderBy: reserveUSD, orderDirection: desc) {
                reserveUSD
              }
            }
            """ % (token, weth, token, weth)

            async with httpx.AsyncClient() as client:
                response = await client.post(self.subgraph_url, json={"query": query})
                
                if response.status_code != 200:
                    print(f"   [Liquidity] Subgraph returned status {response.status_code}")
                    return 50000.0
                    
                data = response.json()
                pairs = data.get("data", {}).get("pairs", [])
                
                if pairs:
                    return float(pairs[0]["reserveUSD"])
                
                return 50000.0 
                
        except Exception as e:
            print(f"   [Liquidity] Error fetching liquidity: {e}")
            return 100000.0 # Safe fallback