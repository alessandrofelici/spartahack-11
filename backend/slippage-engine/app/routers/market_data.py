from fastapi import APIRouter, HTTPException
import httpx
from ..config import settings

router = APIRouter()

# Simple supported list for the MVP
SUPPORTED_TOKENS = [
    {"id": "ethereum", "symbol": "ETH", "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"},
    {"id": "pepe", "symbol": "PEPE", "address": "0x6982508145454Ce325dDbE47a25d4ec3d2311933"},
    {"id": "shiba-inu", "symbol": "SHIB", "address": "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"},
]

@router.get("/symbols")
async def get_symbols():
    # Fetch live data for these specific tokens
    ids = ",".join([t["id"] for t in SUPPORTED_TOKENS])
    url = f"{settings.coingecko_api_url}/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()
    
    result = []
    for token in SUPPORTED_TOKENS:
        cg_data = data.get(token["id"], {})
        result.append({
            "id": token["symbol"], # Frontend expects symbol as ID
            "name": token["id"].title(),
            "price": cg_data.get("usd", 0),
            "change24h": cg_data.get("usd_24h_change", 0),
            "volume": "N/A" # Volume optional for now
        })
    return result

@router.get("/price/{symbol}")
async def get_price_history(symbol: str):
    # Find CoinGecko ID
    token = next((t for t in SUPPORTED_TOKENS if t["symbol"] == symbol.upper()), None)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")

    # Fetch 24h history (minutely/hourly)
    url = f"{settings.coingecko_api_url}/coins/{token['id']}/market_chart?vs_currency=usd&days=1"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()
        
    prices = data.get("prices", [])
    # Format for frontend graph
    history = [{"timestamp": p[0], "price": p[1], "change": 0} for p in prices]
    
    return {
        "id": symbol,
        "priceHistory": history
    }