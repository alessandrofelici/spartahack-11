# backend/slippage-engine/app/config.py

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Keys
    coingecko_api_key: str | None = None # Optional

    # URLs
    uniswap_subgraph_url: str
    listener_ws_url: str
    coingecko_api_url: str = "https://api.coingecko.com/api/v3" # Default

    # Server Configuration
    slippage_api_port: int = 8000
    cors_origins: List[str] = ["http://localhost:5173"] # Default frontend URL

    # Global Settings
    eth_price_usd: float = 2000.0 # Fallback ETH price

    class Config:
        # Load variables from .env file
        env_file = '.env'
        env_file_encoding = 'utf-8'

# Instantiate settings globally
settings = Settings()