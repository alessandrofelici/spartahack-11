import { useState } from "react";
import ActivityGraph from "../components/ActivityGraph";
import RecentAttacks from "../components/RecentAttacks";
import SymbolWatchlist from "../components/SymbolWatchlist";
import { RISK_CONFIGS } from "../utils/constants";
import { useSlippage } from "../hooks/useSlippage";
import { usePriceData } from "../hooks/usePriceData";

export default function SlippageEstimates() {
  const [selectedToken, setSelectedToken] = useState('ETH');
  const { slippage, risk, loading: _loading } = useSlippage(selectedToken);
  const { symbols, currentSymbol } = usePriceData(selectedToken);
  const config = RISK_CONFIGS[risk];

  const handleSymbolSelect = (symbol: string) => {
    setSelectedToken(symbol);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-mono selection:bg-emerald-500/30">
      <div className="fixed inset-0 opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 50%, ${config.color}33, transparent)` }} />

      <main className="relative z-10 max-w-7xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic">MEV SHIELD</h1>
            <p className="text-gray-500 text-xs">NETWORK: ETHEREUM MAINNET // LIVE DATA</p>
          </div>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-gray-800/60 border border-gray-600 rounded text-[10px] text-emerald-400">
              ● API CONNECTED
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Slippage Display & Graph */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`p-12 rounded-3xl border ${config.border} ${config.bg} transition-all duration-700`}>
              <span className="text-xs text-gray-400 uppercase tracking-[0.2em]">Recommended Max Slippage</span>
              <div className="text-[140px] font-black leading-none my-4 tracking-tighter" style={{ color: config.color }}>
                {slippage}%
              </div>
              <p className="text-gray-400">Based on current mempool congestion for <span className="text-white font-bold">{selectedToken}</span></p>
            </div>

            <div className="bg-gray-800/60 border border-gray-600 p-8 rounded-3xl">
              <h3 className="text-xs text-gray-400 uppercase mb-4 tracking-widest">Live Price Volatility</h3>
              {currentSymbol && currentSymbol.priceHistory.length > 0 ? (
                <ActivityGraph 
                  color={config.color} 
                  data={currentSymbol.priceHistory} 
                  title={`${currentSymbol.id} Price Changes`}
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  Loading price data...
                </div>
              )}
            </div>
          </div>

          {/* Middle Column - Symbol Watchlist */}
          <div className="lg:col-span-1">
            <SymbolWatchlist 
              symbols={symbols}
              selectedSymbol={selectedToken}
              onSelectSymbol={handleSymbolSelect}
            />
          </div>

          {/* Right Column - Risk Indicator & Attacks */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/60 border border-gray-600 p-8 rounded-3xl flex flex-col items-center text-center">
              <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: config.color }} />
                <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: config.color }} />
              </div>
              <h2 className="text-3xl font-black mb-2" style={{ color: config.color }}>{config.label}</h2>
              <p className="text-gray-500 text-sm">{config.subtitle}</p>
            </div>

            <div className="bg-gray-800/60 border border-gray-600 p-6 rounded-3xl">
              <h3 className="text-xs text-gray-400 uppercase mb-4 tracking-widest text-center">Recent Attacks</h3>
              <RecentAttacks attacks={[
                { id: 1, amount: '2.5 ETH', loss: '$180', time: '4s' },
                { id: 2, amount: '0.8 ETH', loss: '$42', time: '1m' }
              ]} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}