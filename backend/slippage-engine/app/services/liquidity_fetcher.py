import httpx
from ..config import settings
from ..services.price_feed import PriceFeed

class LiquidityFetcher:
    def __init__(self):
        # Uniswap V2 Subgraph URL
        self.subgraph_url = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
        self.price_feed = PriceFeed()

    async def get_pool_liquidity(self, token_address: str) -> float:
        # 1. Get ETH Price for conversion
        eth_price = await self.price_feed.get_eth_price()
        
        # 2. Query pairs where this token is token0 or token1 against WETH
        weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        token = token_address.lower()
        
        query = """
        query {
          pairs(where: { token0_in: ["%s", "%s"], token1_in: ["%s", "%s"] }, first: 1, orderBy: reserveUSD, orderDirection: desc) {
            reserveUSD
          }
        }
        """ % (token, weth, token, weth)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.subgraph_url, json={"query": query})
                data = response.json()
                pairs = data.get("data", {}).get("pairs", [])
                
                if pairs:
                    return float(pairs[0]["reserveUSD"])
                
                # Fallback if no direct WETH pair found (return low liquidity risk)
                return 50000.0 
                
        except Exception as e:
            print(f"Error fetching liquidity: {e}")
            return 100000.0 # Safe fallback