import { useState, useEffect } from 'react';

/* ============================================================================
 * BACKEND INTEGRATION GUIDE
 * ============================================================================
 * 
 * REQUIRED API ENDPOINT:
 * GET /api/slippage/{token}
 * 
 * EXPECTED JSON RESPONSE FORMAT:
 * {
 *   "slippage": number,        // Recommended slippage percentage (e.g., 0.5 for 0.5%)
 *   "risk": string,            // Risk level: "low" | "moderate" | "severe"
 *   "timestamp": number        // Unix timestamp (optional, for data freshness)
 * }
 * 
 * EXAMPLE RESPONSE:
 * {
 *   "slippage": 1.25,
 *   "risk": "moderate",
 *   "timestamp": 1706745600000
 * }
 * 
 * RISK LEVEL THRESHOLDS (adjust as needed):
 * - "low": slippage < 0.5%
 * - "moderate": 0.5% <= slippage <= 1.5%
 * - "severe": slippage > 1.5%
 * 
 * TO INTEGRATE:
 * 1. Uncomment the fetchSlippage function below
 * 2. Replace 'YOUR_API_BASE_URL' with your actual API base URL
 * 3. Comment out or remove the mock data interval
 * 4. Uncomment the fetchSlippage call in useEffect
 * ============================================================================ */

interface SlippageData {
  slippage: number;
  risk: 'low' | 'moderate' | 'severe';
  loading: boolean;
}

// Backend API response interface
interface SlippageAPIResponse {
  slippage: number;
  risk: 'low' | 'moderate' | 'severe';
  timestamp?: number;
}

export const useSlippage = (token: string) => {
  const [data, setData] = useState<SlippageData>({ slippage: 0.1, risk: 'low', loading: true });

  /* ========== BACKEND INTEGRATION FUNCTION ==========
   * Uncomment this function when backend is ready
   * Replace 'YOUR_API_BASE_URL' with actual API endpoint
   */
  /*
  const fetchSlippage = async (token: string): Promise<void> => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      const response = await fetch(`YOUR_API_BASE_URL/api/slippage/${token}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const apiData: SlippageAPIResponse = await response.json();
      
      setData({
        slippage: apiData.slippage,
        risk: apiData.risk,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching slippage data:', error);
      // Fallback to safe default on error
      setData({ slippage: 2.0, risk: 'severe', loading: false });
    }
  };
  */

  useEffect(() => {
    /* ========== BACKEND INTEGRATION ==========
     * Uncomment these lines when backend is ready:
     */
    /*
    // Initial fetch
    fetchSlippage(token);
    
    // Poll for updates every 10 seconds (adjust interval as needed)
    const interval = setInterval(() => {
      fetchSlippage(token);
    }, 10000);
    
    return () => clearInterval(interval);
    */

    /* ========== MOCK DATA (REMOVE WHEN BACKEND IS READY) ========== */
    // Simulated API response while waiting for backend
    const interval = setInterval(() => {
      const mockSlippage = parseFloat((Math.random() * 3).toFixed(2));
      let risk: 'low' | 'moderate' | 'severe' = 'low';
      if (mockSlippage > 0.5) risk = 'moderate';
      if (mockSlippage > 1.5) risk = 'severe';

      setData({ slippage: mockSlippage, risk, loading: false });
    }, 3000);

    return () => clearInterval(interval);
    /* ========== END MOCK DATA ========== */
  }, [token]);

  return data;
};