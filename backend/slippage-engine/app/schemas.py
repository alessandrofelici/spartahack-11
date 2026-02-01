# backend/slippage-engine/app/schemas.py

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Tuple
from dataclasses import dataclass

# --------------------------------------------------
# Request Model for Slippage Calculation
# --------------------------------------------------
class SlippageRequest(BaseModel):
    token_in: str = Field(..., example="ETH")
    token_out: str = Field(..., example="0x6982508145454Ce325dDbE47a25d4ec3d2311933") # PEPE address
    amount_usd: Optional[float] = Field(None, example=500.0) # Optional trade size in USD

    @validator('token_in', 'token_out')
    def validate_address_format(cls, v):
        # Skip validation for symbols like "ETH"
        if len(v) < 42 and not v.startswith('0x'):
             return v
             
        if not isinstance(v, str) or not v.startswith('0x') or len(v) != 42:
            raise ValueError('Token must be a valid Ethereum address (0x...)')
        return v.lower() # Normalize to lowercase

# --------------------------------------------------
# Response Model for Slippage Recommendation
# --------------------------------------------------
@dataclass
class ExplanationFactor:
    name: str
    value: str
    impact: str

@dataclass
class Explanation:
    summary: str
    factors: List[ExplanationFactor]

@dataclass
class SlippageRecommendation:
    recommended_slippage: float
    recommended_percent: str
    risk_level: str
    risk_score: int
    pool_stats: dict
    bot_activity: dict
    explanation: Explanation
    alternatives: List[dict]

# --------------------------------------------------
# Response Model for Error Handling
# --------------------------------------------------
class ErrorResponse(BaseModel):
    detail: str