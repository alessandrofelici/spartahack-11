import httpx
import time
from ..config import settings

class PriceFeed:
    def __init__(self):
        self.base_url = settings.coingecko_api_url
        self.default_eth_price = settings.eth_price_usd
        
        # Manual Cache State
        self._cached_price = None
        self._last_updated = 0
        self._cache_ttl = 60

        # Headers to prevent 301 redirects
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    async def get_eth_price(self) -> float:
        # 1. Check Cache
        now = time.time()
        if self._cached_price and (now - self._last_updated < self._cache_ttl):
            return self._cached_price

        print("   [PriceFeed] Fetching ETH price from CoinGecko...")
        
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                response = await client.get(
                    f"{self.base_url}/simple/price",
                    params={"ids": "ethereum", "vs_currencies": "usd"},
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                if "ethereum" in data and "usd" in data["ethereum"]:
                    price = float(data["ethereum"]["usd"])
                    
                    # Update Cache
                    self._cached_price = price
                    self._last_updated = now
                    
                    print(f"   [PriceFeed] ETH price: ${price:.2f}")
                    return price
                else:
                    print("   [PriceFeed] Response missing ETH price. Using default.")
                    return self.default_eth_price
                    
        except Exception as e:
            print(f"   [PriceFeed] Error fetching ETH price: {e}. Using default.")
            return self.default_eth_price