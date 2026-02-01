from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    app_name: str = "MEV Weather Slippage Engine"
    slippage_api_port: int = 8000
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]

    # External APIs
    coingecko_api_url: str = "https://api.coingecko.com/api/v3"
    coingecko_api_key: str = "" 
    uniswap_subgraph_url: str = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2"
    listener_ws_url: str = "ws://localhost:3001"

    # LLM Settings
    groq_api_key: str = "" # <--- CHANGED NAME

    # Defaults
    eth_price_usd: float = 2500.00
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()