# backend/slippage-engine/app/services/price_feed.py

import httpx
from cachetools import TTLCache, cached

from ..config import settings

# Cache price for 60 seconds to avoid hitting rate limits
PRICE_CACHE = TTLCache(maxsize=100, ttl=60)

class PriceFeed:
    def __init__(self):
        self.base_url = settings.coingecko_api_url
        # Use default ETH price from settings if CoinGecko fails
        self.default_eth_price = settings.eth_price_usd
        
    @cached(PRICE_CACHE)
    async def get_eth_price(self) -> float:
        """Fetches current ETH price in USD from CoinGecko."""
        print("   [PriceFeed] Fetching ETH price from CoinGecko...")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/simple/price",
                    params={"ids": "ethereum", "vs_currencies": "usd"},
                    # Add API key header if available (optional)
                    # headers={"X-CG-API-Key": settings.coingecko_api_key} if settings.coingecko_api_key else {}
                )
                response.raise_for_status() # Raise an exception for bad status codes
                data = response.json()
                
                if "ethereum" in data and "usd" in data["ethereum"]:
                    price = float(data["ethereum"]["usd"])
                    print(f"   [PriceFeed] ETH price: ${price:.2f}")
                    return price
                else:
                    print("   [PriceFeed] CoinGecko response missing ETH price. Using default.")
                    return self.default_eth_price
                    
        except httpx.RequestError as exc:
            print(f"   [PriceFeed] An error occurred while requesting {exc.request.url!r}.")
            return self.default_eth_price
        except Exception as e:
            print(f"   [PriceFeed] Error fetching ETH price: {e}. Using default.")
            return self.default_eth_price