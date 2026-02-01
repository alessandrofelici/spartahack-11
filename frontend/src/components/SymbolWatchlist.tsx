import { useState } from 'react';
import { motion } from 'framer-motion';

interface Symbol {
  id: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
}

interface SymbolWatchlistProps {
  symbols: Symbol[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function SymbolWatchlist({ symbols, selectedSymbol, onSelectSymbol }: SymbolWatchlistProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSymbols = symbols.filter(symbol =>
    symbol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    symbol.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-800/60 border border-gray-600 rounded-3xl p-6">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-4">Token Watchlist</h3>
      
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Symbol List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {filteredSymbols.map((symbol) => (
          <motion.button
            key={symbol.id}
            onClick={() => onSelectSymbol(symbol.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-3 rounded-lg border transition-all ${
              selectedSymbol === symbol.id
                ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-gray-900/40 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="text-left">
                <div className="font-bold text-white text-sm">{symbol.id}</div>
                <div className="text-[10px] text-gray-500">{symbol.name}</div>
              </div>
              <div className={`text-xs font-bold ${
                symbol.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {symbol.change24h >= 0 ? '+' : ''}{symbol.change24h.toFixed(2)}%
              </div>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400">${symbol.price.toLocaleString()}</span>
              <span className="text-gray-500">Vol: {symbol.volume}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {filteredSymbols.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-8">
          No symbols found
        </div>
      )}
    </div>
  );
}
