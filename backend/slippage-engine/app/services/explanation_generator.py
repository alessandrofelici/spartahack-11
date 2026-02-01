# backend/slippage-engine/app/services/explanation_generator.py

from typing import List, Dict, Any

# Assuming ExplanationFactor and Explanation are imported dataclasses/models from schemas.py
from ..schemas import Explanation, ExplanationFactor # Adjust import path if needed

class ExplanationGenerator:
    def generate(
        self,
        base_slippage: float,
        bot_adjustment: float,
        sandwich_adjustment: float,
        gas_adjustment: float,
        pair_stats: Dict[str, Any],
        pool_liquidity_usd: float,
        avg_gas_gwei: float,
        recommended_slippage: float
    ) -> Explanation:
        """
        Generates a human-readable explanation for the recommended slippage.
        """
        factors = []
        
        # --- Pool Liquidity Factor ---
        liquidity_level = "Very Low"
        base_display = f"{base_slippage:.1%}"
        if pool_liquidity_usd > 10_000_000: liquidity_level, base_display = "High", f"{base_slippage:.1%}"
        elif pool_liquidity_usd > 1_000_000: liquidity_level, base_display = "Good", f"{base_slippage:.1%}"
        elif pool_liquidity_usd > 100_000: liquidity_level, base_display = "Moderate", f"{base_slippage:.1%}"
        
        factors.append(ExplanationFactor(
            name="Pool Liquidity",
            value=f"${pool_liquidity_usd:,.0f} ({liquidity_level})",
            impact=f"Base: {base_display}"
        ))
        
        # --- Bot Activity Factor ---
        bot_score = pair_stats.get("bot_activity_score", 0)
        bot_level = "Very Low"
        if bot_score > 0.7: bot_level = "Very High"
        elif bot_score > 0.4: bot_level = "Moderate"
        elif bot_score > 0.2: bot_level = "Low"
        
        factors.append(ExplanationFactor(
            name="Bot Activity",
            value=f"{bot_level} ({bot_score.toFixed(2)})",
            impact=f"+{bot_adjustment:.1%}" if bot_adjustment > 0 else "None"
        ))
        
        # --- Sandwich Factor ---
        sandwich_count = pair_stats.get("sandwiches_5min", 0)
        sandwich_impact = "+{:.1%}".format(sandwich_adjustment) if sandwich_adjustment > 0 else "None"
        factors.append(ExplanationFactor(
            name="Recent Sandwiches",
            value=f"{sandwich_count} in 5min",
            impact=sandwich_impact
        ))
        
        # --- Gas Price Factor ---
        gas_impact = f"+{gas_adjustment:.1%}" if gas_adjustment > 0 else "Normal"
        factors.append(ExplanationFactor(
            name="Gas Prices",
            value=f"{avg_gas_gwei:.0f} gwei",
            impact=gas_impact
        ))
        
        # --- Tradeoff Summary ---
        tradeoff_summary = (
            f"At {recommended_slippage:.1%} slippage, estimated max MEV extraction is ~$15. "
            f"Lowering to {alternative_slippage_low:.1%} could reduce extraction to ~$5, but increases trade failure risk by ~15%."
        ) # This text should be dynamically generated based on calculations.

        return Explanation(
            summary="This recommendation balances trade execution probability with minimizing MEV extraction risk.",
            factors=factors,
            # tradeoff=tradeoff_summary # Add tradeoff if calculated here
        )