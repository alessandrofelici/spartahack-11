# backend/slippage-engine/app/routers/slippage.py

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
import httpx # For making HTTP requests to external APIs

from app.schemas import SlippageRequest, SlippageRecommendation, ErrorResponse
from ..services.slippage_calculator import SlippageCalculator
from ..config import settings

router = APIRouter()

# Instantiate the calculator service
# We can instantiate it once as it doesn't hold per-request state
slippage_calculator = SlippageCalculator()

# Dependency to get pair stats from Role 1's WebSocket server
async def get_pair_stats_from_listener(pair: str):
    """Fetches aggregated stats for a given token pair from the listener service."""
    listener_url = f"{settings.listener_ws_url}/api/pairs/{pair}" # Assuming listener exposes this endpoint
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(listener_url)
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            return response.json()
    except httpx.RequestError as exc:
        print(f"An error occurred while requesting {exc.request.url!r}. Error: {exc}")
        raise HTTPException(status_code=503, detail="Listener service unavailable")
    except httpx.HTTPStatusError as exc:
        print(f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")
        raise HTTPException(status_code=exc.response.status_code, detail=f"Listener returned an error: {exc.response.text}")

# --------------------------------------------------
# POST /api/slippage Endpoint
# Calculates slippage recommendation
# --------------------------------------------------
@router.post(
    "/",
    response_model=SlippageRecommendation,
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    }
)
async def calculate_slippage(request: SlippageRequest):
    """
    Calculates the recommended slippage tolerance for a given token pair
    based on real-time MEV activity, liquidity, and other factors.
    """
    try:
        # 1. Get pair statistics from Role 1 (mempool listener)
        pair_stats = await get_pair_stats_from_listener(request.token_out) # Assuming token_out is the primary pair identifier
        
        # 2. Fetch pool liquidity (e.g., from The Graph)
        pool_liquidity = await slippage_calculator.liquidity_fetcher.get_pool_liquidity(request.token_out)
        
        # 3. Fetch ETH price (e.g., from CoinGecko)
        eth_price = await slippage_calculator.price_feed.get_eth_price()
        
        # 4. Calculate slippage recommendation using the service
        recommendation = await slippage_calculator.calculate(
            token_in=request.token_in,
            token_out=request.token_out,
            pair_stats=pair_stats,
            pool_liquidity_usd=pool_liquidity,
            eth_price_usd=eth_price
        )
        
        return recommendation
        
    except HTTPException as http_exc:
        # Re-raise HTTPException to propagate errors from dependencies
        raise http_exc
        
    except Exception as e:
        print(f"Error calculating slippage for {request.token_in}/{request.token_out}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An internal error occurred during slippage calculation."
        )