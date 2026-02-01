import { useState, useEffect } from 'react';

interface SlippageData {
    slippage: number;
    risk: 'low' | 'moderate' | 'high' | 'severe';
    loading: boolean;
}

// Hardcoded Demo Scenarios
const DEMO_DATA: Record<string, SlippageData> = {
    'USDC': { slippage: 0.1, risk: 'low', loading: false },      // GREEN
    'PEPE': { slippage: 1.2, risk: 'moderate', loading: false }, // YELLOW
    'SHIB': { slippage: 4.5, risk: 'severe', loading: false },   // RED
    'ETH': { slippage: 0.5, risk: 'low', loading: false }        // DEFAULT
};

export const useSlippage = (token: string, isDemoMode: boolean) => {
  // Address mapping for Live Mode
  const ADDRESS_MAP: Record<string, string> = {
    'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
    'PEPE': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  };

  const [data, setData] = useState<SlippageData>({ 
      slippage: 0.5, 
      risk: 'low', 
      loading: true 
  });

  useEffect(() => {
    // 1. DEMO MODE LOGIC (Instant & Deterministic)
    if (isDemoMode) {
        const demoResult = DEMO_DATA[token] || DEMO_DATA['ETH'];
        // Add a tiny artificial delay for realism
        const timer = setTimeout(() => {
            setData(demoResult);
        }, 400); 
        return () => clearTimeout(timer);
    }

    // 2. LIVE MODE LOGIC (Real API Call)
    const fetchSlippage = async () => {
        try {
            const tokenOut = ADDRESS_MAP[token] || ADDRESS_MAP['PEPE']; 
            
            const response = await fetch('http://localhost:8000/api/slippage/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token_in: "ETH", 
                    token_out: tokenOut 
                })
            });

            const result = await response.json();
            
            // Normalize risk string from backend to lowercase
            let riskLevel = result.risk_level.toLowerCase();
            
            // Safety fallback if backend sends unknown string
            if (!['low', 'moderate', 'high', 'severe'].includes(riskLevel)) {
                riskLevel = 'moderate';
            }

            setData({
                slippage: parseFloat((result.recommended_slippage * 100).toFixed(2)), 
                risk: riskLevel as any,
                loading: false
            });
        } catch (e) {
            console.error("Slippage fetch failed:", e);
            // On failure, keep previous data or set default. 
        }
    };

    fetchSlippage();
    const interval = setInterval(fetchSlippage, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [token, isDemoMode]); // Re-run when toggle or token changes

  return data;
};