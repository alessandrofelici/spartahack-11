# backend/slippage-engine/app/services/risk_scorer.py

from typing import Tuple

class RiskScorer:
    def get_risk_level(
        self,
        bot_activity_score: float,
        sandwich_count: int,
        avg_gas_gwei: float,
        pool_liquidity_usd: float
    ) -> Tuple[str, int]:
        """
        Determines risk level (LOW, MODERATE, HIGH, SEVERE) based on inputs.
        Returns (risk_level_string, risk_score_integer_1_to_5).
        """
        score = 0

        # Factor 1: Bot activity score (0-1)
        if bot_activity_score > 0.7: score += 2
        elif bot_activity_score > 0.4: score += 1

        # Factor 2: Sandwich frequency (higher count = higher score)
        if sandwich_count > 5: score += 2
        elif sandwich_count > 2: score += 1

        # Factor 3: Gas prices (high gas = more bot competition)
        if avg_gas_gwei > 100: score += 1
        elif avg_gas_gwei > 75: score += 0.5

        # Factor 4: Pool liquidity (low liquidity = higher risk)
        if pool_liquidity_usd < 500_000: score += 1
        elif pool_liquidity_usd < 100_000: score += 1.5

        # Map score to level and integer score (1-5 range)
        score = max(0, score) # Ensure minimum score is not negative
        
        if score < 1: return "LOW", 1
        elif score < 2: return "LOW", 2
        elif score < 3: return "MODERATE", 3
        elif score < 4: return "HIGH", 4
        else: return "SEVERE", 5