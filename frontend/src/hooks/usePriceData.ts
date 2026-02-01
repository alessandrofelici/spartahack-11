import { useState, useEffect } from 'react';

/* ============================================================================
 * BACKEND INTEGRATION GUIDE
 * ============================================================================
 * 
 * REQUIRED API ENDPOINTS:
 * 
 * 1. GET /api/symbols
 *    Returns list of all available trading symbols
 * 
 * 2. GET /api/price/{symbol}
 *    Returns current price data and history for a specific symbol
 * 
 * EXPECTED JSON RESPONSE FORMAT:
 * 
 * GET /api/symbols:
 * [
 *   {
 *     "id": string,              // Symbol ticker (e.g., "ETH")
 *     "name": string,            // Full name (e.g., "Ethereum")
 *     "price": number,           // Current price in USD
 *     "change24h": number,       // 24h change percentage (e.g., 3.25 for +3.25%)
 *     "volume": string           // 24h volume formatted (e.g., "$12.5B")
 *   },
 *   ...
 * ]
 * 
 * GET /api/price/{symbol}:
 * {
 *   "id": string,
 *   "name": string,
 *   "price": number,
 *   "change24h": number,
 *   "volume": string,
 *   "priceHistory": [
 *     {
 *       "timestamp": number,     // Unix timestamp in milliseconds
 *       "price": number,         // Price at that timestamp
 *       "change": number         // Percentage change from previous point
 *     },
 *     ...
 *   ]
 * }
 * 
 * EXAMPLE RESPONSE - GET /api/symbols:
 * [
 *   {
 *     "id": "ETH",
 *     "name": "Ethereum",
 *     "price": 2450.32,
 *     "change24h": 3.25,
 *     "volume": "$12.5B"
 *   }
 * ]
 * 
 * EXAMPLE RESPONSE - GET /api/price/ETH:
 * {
 *   "id": "ETH",
 *   "name": "Ethereum",
 *   "price": 2450.32,
 *   "change24h": 3.25,
 *   "volume": "$12.5B",
 *   "priceHistory": [
 *     {
 *       "timestamp": 1706745600000,
 *       "price": 2448.50,
 *       "change": 0.15
 *     }
 *   ]
 * }
 * 
 * TO INTEGRATE:
 * 1. Uncomment the fetch functions below (fetchSymbols, fetchPriceData)
 * 2. Replace 'YOUR_API_BASE_URL' with your actual API base URL
 * 3. Comment out or remove the mock data section
 * 4. Uncomment the fetch calls in useEffect hooks
 * 
 * WEBSOCKET ALTERNATIVE (for real-time updates):
 * If using WebSocket instead of polling:
 * - Connect to: ws://YOUR_API_BASE_URL/api/price-stream
 * - Expect messages in same format as GET /api/price/{symbol}
 * ============================================================================ */

interface PriceDataPoint {
  timestamp: number;
  price: number;
  change: number; // Percentage change from previous
}

interface SymbolData {
  id: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  priceHistory: PriceDataPoint[];
}

/* ========== MOCK DATA (REMOVE WHEN BACKEND IS READY) ========== */
// Mock data generator for development
const MOCK_SYMBOLS: Record<string, SymbolData> = {
  ETH: {
    id: 'ETH',
    name: 'Ethereum',
    price: 2450.32,
    change24h: 3.25,
    volume: '$12.5B',
    priceHistory: []
  },
  BTC: {
    id: 'BTC',
    name: 'Bitcoin',
    price: 43250.75,
    change24h: 1.82,
    volume: '$28.3B',
    priceHistory: []
  },
  USDT: {
    id: 'USDT',
    name: 'Tether',
    price: 1.0002,
    change24h: 0.02,
    volume: '$45.2B',
    priceHistory: []
  },
  USDC: {
    id: 'USDC',
    name: 'USD Coin',
    price: 0.9998,
    change24h: -0.01,
    volume: '$7.8B',
    priceHistory: []
  },
  SOL: {
    id: 'SOL',
    name: 'Solana',
    price: 98.45,
    change24h: 5.67,
    volume: '$2.1B',
    priceHistory: []
  },
  MATIC: {
    id: 'MATIC',
    name: 'Polygon',
    price: 0.8234,
    change24h: -2.34,
    volume: '$450M',
    priceHistory: []
  }
};

// Generate initial price history for mock data
Object.keys(MOCK_SYMBOLS).forEach(symbolId => {
  const symbol = MOCK_SYMBOLS[symbolId];
  const history: PriceDataPoint[] = [];
  let currentPrice = symbol.price;
  
  for (let i = 20; i >= 0; i--) {
    const timestamp = Date.now() - i * 60000; // Every minute
    const randomChange = (Math.random() - 0.5) * 2; // -1% to +1%
    currentPrice = currentPrice * (1 + randomChange / 100);
    
    history.push({
      timestamp,
      price: currentPrice,
      change: randomChange
    });
  }
  
  symbol.priceHistory = history;
});
/* ========== END MOCK DATA ========== */

export function usePriceData(selectedSymbol: string) {
  const [symbols, setSymbols] = useState<SymbolData[]>(Object.values(MOCK_SYMBOLS));
  const [currentSymbol, setCurrentSymbol] = useState<SymbolData | null>(null);

  /* ========== BACKEND INTEGRATION FUNCTIONS ==========
   * Uncomment these functions when backend is ready
   * Replace 'YOUR_API_BASE_URL' with actual API endpoint
   */
  /*
  const fetchSymbols = async (): Promise<void> => {
    try {
      const response = await fetch('YOUR_API_BASE_URL/api/symbols');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SymbolData[] = await response.json();
      setSymbols(data);
    } catch (error) {
      console.error('Error fetching symbols:', error);
    }
  };

  const fetchPriceData = async (symbol: string): Promise<void> => {
    try {
      const response = await fetch(`YOUR_API_BASE_URL/api/price/${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: SymbolData = await response.json();
      
      // Update the specific symbol in the symbols array
      setSymbols(prevSymbols =>
        prevSymbols.map(s => s.id === symbol ? data : s)
      );
    } catch (error) {
      console.error(`Error fetching price data for ${symbol}:`, error);
    }
  };
  */

  useEffect(() => {
    // Update current symbol when selection changes
    const symbol = symbols.find(s => s.id === selectedSymbol);
    setCurrentSymbol(symbol || null);
  }, [selectedSymbol, symbols]);

  useEffect(() => {
    /* ========== BACKEND INTEGRATION ==========
     * Uncomment these lines when backend is ready:
     */
    /*
    // Initial fetch of all symbols
    fetchSymbols();
    
    // Poll for updates every 10 seconds (adjust as needed)
    const interval = setInterval(() => {
      // Refresh all symbols
      fetchSymbols();
      
      // If a symbol is selected, get its detailed price data
      if (selectedSymbol) {
        fetchPriceData(selectedSymbol);
      }
    }, 10000);
    
    return () => clearInterval(interval);
    */

    /* ========== MOCK DATA (REMOVE WHEN BACKEND IS READY) ========== */
    // Simulate real-time price updates every 3 seconds
    const interval = setInterval(() => {
      setSymbols(prevSymbols => 
        prevSymbols.map(symbol => {
          const randomChange = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
          const newPrice = symbol.price * (1 + randomChange / 100);
          
          // Update price history
          const newDataPoint: PriceDataPoint = {
            timestamp: Date.now(),
            price: newPrice,
            change: randomChange
          };
          
          const updatedHistory = [...symbol.priceHistory.slice(1), newDataPoint];
          
          return {
            ...symbol,
            price: newPrice,
            change24h: symbol.change24h + randomChange * 0.1,
            priceHistory: updatedHistory
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
    /* ========== END MOCK DATA ========== */
  }, []);

  return {
    symbols,
    currentSymbol,
    loading: false,
    error: null
  };
}
