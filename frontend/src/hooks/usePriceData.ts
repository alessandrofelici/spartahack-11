import { useState, useEffect } from 'react';

export function usePriceData(selectedSymbol: string) {
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState<SymbolData | null>(null);

  // 1. Fetch Symbol List
  useEffect(() => {
    const fetchSymbols = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/symbols');
            const data = await res.json();
            setSymbols(data);
        } catch (e) { console.error(e); }
    };
    fetchSymbols();
  }, []);

  // 2. Fetch History for Selected
  useEffect(() => {
    if (!selectedSymbol) return;
    
    const fetchHistory = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/price/${selectedSymbol}`);
            const data = await res.json();
            
            // Merge history into the current symbol object
            setCurrentSymbol(prev => ({
                ...prev!,
                ...symbols.find(s => s.id === selectedSymbol),
                priceHistory: data.priceHistory
            }));
        } catch (e) { console.error(e); }
    };

    fetchHistory();
  }, [selectedSymbol, symbols]); // dependency on symbols ensures we have base data first

  return { symbols, currentSymbol, loading: false, error: null };
}