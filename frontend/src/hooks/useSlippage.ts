import { useState, useEffect } from 'react';

export const useSlippage = (token: string) => {
  // Mapping symbols to addresses for the backend
  const ADDRESS_MAP: Record<string, string> = {
    'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 
    'PEPE': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    'SHIB': '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'
  };

  const [data, setData] = useState<SlippageData>({ slippage: 0.5, risk: 'low', loading: true });

  useEffect(() => {
    const fetchSlippage = async () => {
        try {
            // Default to PEPE address if ETH selected (ETH logic requires different path or WETH)
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
            
            setData({
                // Convert 0.012 -> 1.2 for display
                slippage: parseFloat((result.recommended_slippage * 100).toFixed(2)), 
                risk: result.risk_level.toLowerCase() as 'low' | 'moderate' | 'severe',
                loading: false
            });
        } catch (e) {
            console.error(e);
        }
    };

    fetchSlippage();
    const interval = setInterval(fetchSlippage, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [token]);

  return data;
};