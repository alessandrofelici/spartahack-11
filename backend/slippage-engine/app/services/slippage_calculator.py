# backend/slippage-engine/app/services/slippage_calculator.py

from typing import Optional, Dict, Any
import httpx
from pydantic import BaseModel # Not strictly needed for logic, but good practice for complex objects

from ..config import settings
from ..schemas import SlippageRecommendation, Explanation, ExplanationFactor # Using dataclasses from schema for cleaner returns

from .risk_scorer import RiskScorer
from .liquidity_fetcher import LiquidityFetcher # Assumes this service exists
from .price_feed import PriceFeed # Assumes this service exists
from .explanation_generator import ExplanationGenerator # Assumes this service exists

class SlippageCalculator:
    def __init__(self):
        self.risk_scorer = RiskScorer()
        self.liquidity_fetcher = LiquidityFetcher()
        self.price_feed = PriceFeed()
        self.explanation_generator = ExplanationGenerator()

    async def calculate(
        self,
        token_in: str,
        token_out: str,
        pair_stats: Dict[str, Any], # Data from Role 1's listener
        pool_liquidity_usd: float,
        eth_price_usd: float
    ) -> SlippageRecommendation:
        """
        Calculates slippage recommendation based on provided stats.
        """
        
        # --- Determine Base Slippage ---
        # Lower liquidity = need more slippage buffer
        if pool_liquidity_usd > 10_000_000:
            base_slippage = 0.003  # 0.3%
        elif pool_liquidity_usd > 1_000_000:
            base_slippage = 0.005  # 0.5%
        elif pool_liquidity_usd > 100_000:
            base_slippage = 0.01   # 1.0%
        else:
            base_slippage = 0.02   # 2.0%

        # --- Adjustments based on Bot Activity ---
        bot_activity_score = pair_stats.get("bot_activity_score", 0)
        bot_adjustment = bot_activity_score * 0.005 # Up to +0.5%

        # Adjust based on recent sandwiches
        sandwich_count = pair_stats.get("sandwiches_5min", 0)
        sandwich_adjustment = min(sandwich_count * 0.001, 0.003) # Up to +0.3%

        # Adjust for gas prices (higher gas = more bot competition)
        avg_gas_gwei = pair_stats.get("avg_gas_gwei", 30) # Default if missing
        if avg_gas_gwei > 100:
            gas_adjustment = 0.002
        elif avg_gas_gwei > 75:
            gas_adjustment = 0.001
        else:
            gas_adjustment = 0

        # --- Calculate Final Recommended Slippage ---
        recommended_slippage = (
            base_slippage
            + bot_adjustment
            + sandwich_adjustment
            + gas_adjustment
        )
        
        # Clamp to reasonable range (e.g., 0.3% to 3%)
        recommended_slippage = round(max(0.003, min(recommended_slippage, 0.03)), 4)
        recommended_percent = f"{(recommended_slippage * 100):.1f}%"

        # --- Determine Risk Level ---
        # Uses the risk scorer service
        risk_level, risk_score = self.risk_scorer.get_risk_level(
            bot_activity_score, sandwich_count, avg_gas_gwei, pool_liquidity_usd
        )

        # --- Generate Explanation ---
        # Provide human-readable reasoning
        explanation_data = self.explanation_generator.generate(
            base_slippage, bot_adjustment, sandwich_adjustment, gas_adjustment,
            pair_stats, pool_liquidity_usd, avg_gas_gwei, recommended_slippage
        )

        # --- Generate Alternatives ---
        alternative_slippage_low = round(max(0.001, recommended_slippage * 0.6), 4)
        alternative_slippage_high = round(min(0.05, recommended_slippage * 1.5), 4)
        alternatives = [
            {"slippage": f"{(alternative_slippage_low * 100):.1f}%", "risk": "lower", "fail_chance": "15%"},
            {"slippage": recommended_percent, "risk": risk_level.lower(), "fail_chance": "3%"},
            {"slippage": f"{(alternative_slippage_high * 100):.1f}%", "risk": "higher", "fail_chance": "<1%"}
        ]

        # --- Structure Pool and Bot Activity Stats ---
        pool_stats = {
            "liquidity_usd": round(pool_liquidity_usd, 0),
            "volume_24h_usd": 0, # Fetch this if needed, often from subgraph
            "your_price_impact": round( (pair_stats.get('transactions_5min', 0) * 1000) / pool_liquidity_usd , 4) if pool_liquidity_usd else 0 # Rough price impact estimate
        }
        
        bot_activity_stats = {
            "level": risk_level.lower(),
            "score": round(bot_activity_score, 3),
            "transactions_5min": pair_stats.get("transactions_5min", 0),
            "suspicious_tx_count": pair_stats.get("suspicious_tx_count", 0),
            "sandwiches_5min": pair_stats.get("sandwiches_5min", 0)
        }
        
        # --- Return the full recommendation object ---
        return SlippageRecommendation(
            recommended_slippage=recommended_slippage,
            recommended_percent=recommended_percent,
            risk_level=risk_level,
            risk_score=risk_score,
            pool_stats=pool_stats,
            bot_activity=bot_activity_stats,
            explanation=explanation_data,
            alternatives=alternatives
        )