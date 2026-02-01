import { useState, useEffect } from "react";
import ActivityGraph from "../components/ActivityGraph";
import RecentAttacks from "../components/RecentAttacks";
import TokenSelector from "../components/TokenSelector";
import { RISK_CONFIGS, TOKEN_LIST } from "../utils/constants";
import { useSlippage } from "../hooks/useSlippage";
import { motion } from "framer-motion";

// Config
const MAX_HISTORY_POINTS = 60; 
const UPDATE_INTERVAL = 1000; 

// Initial Prices
const BASE_PRICES: Record<string, number> = {
    'ETH': 2500.00,
    'PEPE': 0.00000125,
    'SHIB': 0.00000950,
    'USDC': 1.00
};

// Base Volumes (Normal Market Conditions)
const BASE_VOLUMES: Record<string, { val: string, change: number }> = {
    'ETH': { val: "$14.2B", change: 2.4 },
    'PEPE': { val: "$145M", change: 12.5 },
    'SHIB': { val: "$380M", change: -5.2 },
    'USDC': { val: "$2.1B", change: 0.1 }
};

export default function SlippageEstimates() {
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { slippage, risk, loading: _loading } = useSlippage(selectedToken, isDemoMode);
  const riskKey = risk.toLowerCase() as keyof typeof RISK_CONFIGS;
  const config = RISK_CONFIGS[riskKey] || RISK_CONFIGS.low;

  // State
  const [marketHistory, setMarketHistory] = useState<Record<string, any[]>>({ 'ETH': [], 'PEPE': [], 'SHIB': [], 'USDC': [] });
  const [globalAttacks, setGlobalAttacks] = useState<any[]>([]);

  // Generator
  const generateScenarioData = (mode: 'LIVE' | 'DEMO') => {
    const now = Date.now();
    const newHistory: Record<string, any[]> = {};
    const newAttacks: any[] = [];

    Object.keys(BASE_PRICES).forEach(token => {
        const history = [];
        let price = BASE_PRICES[token];
        
        const isVolatileToken = (token === 'PEPE' || token === 'SHIB');
        const volatility = (mode === 'DEMO' && isVolatileToken) ? 0.05 : 0.0002;
        const attackChance = (mode === 'DEMO' && isVolatileToken) ? 0.3 : 0.0; 

        for (let i = MAX_HISTORY_POINTS; i > 0; i--) {
            // Safe Random Walk
            const change = price * volatility * (Math.random() - 0.5) * 2;
            price = Math.max(0.00000001, price + change);

            let isAttack = false;
            let volume = Math.floor(Math.random() * 2000) + 500;
            
            if (Math.random() < attackChance) {
                isAttack = true;
                volume *= 5; 
                price *= 0.98; 
                
                if (i < 5) { 
                    newAttacks.push({
                        id: Math.random(),
                        token,
                        amount: `${(Math.random() * 10).toFixed(1)} ETH`,
                        loss: `$${(Math.random() * 200 + 50).toFixed(0)}`,
                        time: `${i}s ago`
                    });
                }
            }
            history.push({ timestamp: now - (i * 1000), price, volume, isAttack });
        }
        newHistory[token] = history;
    });

    return { newHistory, newAttacks };
  };

  // Instant Swap Handler
  useEffect(() => {
    const { newHistory, newAttacks } = generateScenarioData(isDemoMode ? 'DEMO' : 'LIVE');
    setMarketHistory(newHistory);
    setGlobalAttacks(newAttacks);
  }, [isDemoMode]);

  // Live Update Loop
  useEffect(() => {
    const interval = setInterval(() => {
        setMarketHistory(prev => {
            const nextState = { ...prev };
            const timestamp = Date.now();
            let addedAttacks: any[] = [];

            Object.keys(nextState).forEach(token => {
                const history = nextState[token];
                if (!history || history.length === 0) return;

                const lastPrice = history[history.length - 1].price;
                const isVolatileToken = (token === 'PEPE' || token === 'SHIB');
                
                const volatility = (isDemoMode && isVolatileToken) ? 0.05 : 0.0002;
                const attackChance = (isDemoMode && isVolatileToken) ? 0.2 : 0.005;

                const change = lastPrice * volatility * (Math.random() - 0.5) * 2;
                let newPrice = Math.max(0.00000001, lastPrice + change);
                let volume = Math.floor(Math.random() * 2000) + 500;
                let isAttack = false;

                if (Math.random() < attackChance) {
                    isAttack = true;
                    newPrice *= 0.98;
                    volume *= 5;
                    addedAttacks.push({
                        id: Math.random(),
                        token,
                        amount: `${(Math.random() * 5).toFixed(1)} ETH`,
                        loss: `$${(Math.random() * 100 + 20).toFixed(0)}`,
                        time: 'Just now'
                    });
                }

                nextState[token] = [...history.slice(1), { timestamp, price: newPrice, volume, isAttack }];
            });

            if (addedAttacks.length > 0) {
                setGlobalAttacks(prev => [...addedAttacks, ...prev].slice(0, 5));
            }
            return nextState;
        });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isDemoMode]);

  // --- DYNAMIC STATS CALCULATION ---
  const currentGraphData = marketHistory[selectedToken] || [];
  const currentPrice = currentGraphData[currentGraphData.length - 1]?.price || 0;
  const startPrice = currentGraphData[0]?.price || 1;
  const percentChange = ((currentPrice - startPrice) / startPrice) * 100;

  // Smart Price Display
  const displayPrice = currentPrice < 1 
      ? `$${currentPrice.toFixed(8)}` 
      : `$${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  // --- NEW VOLUME CALCULATION LOGIC ---
  const baseVol = BASE_VOLUMES[selectedToken] || BASE_VOLUMES['ETH'];
  const isFrenzy = isDemoMode && (selectedToken === 'PEPE' || selectedToken === 'SHIB');
  
  let displayVolume = baseVol.val;
  let displayVolChange = `${baseVol.change > 0 ? '+' : ''}${baseVol.change}%`;
  let displayVolColor = baseVol.change > 0 ? '#10b981' : '#ef4444';

  if (isFrenzy) {
     // 1. Parse Base Volume (e.g. "$380M" -> 380)
     const rawNum = parseFloat(baseVol.val.replace(/[^0-9.]/g, ''));
     const isBillion = baseVol.val.includes('B');
     const baseMillions = isBillion ? rawNum * 1000 : rawNum;

     // 2. Apply "Frenzy Multiplier" (e.g. 4.5x normal volume)
     const frenzyMultiplier = 4.5; 
     const frenzyMillions = baseMillions * frenzyMultiplier;
     
     // 3. Format Output
     if (frenzyMillions >= 1000) {
         displayVolume = `$${(frenzyMillions / 1000).toFixed(1)}B`;
     } else {
         displayVolume = `$${frenzyMillions.toFixed(0)}M`;
     }

     // 4. Calculate % Change
     // If base was -5%, and we are now 4.5x, the change is massive positive
     const newChange = ((frenzyMultiplier - 1) * 100) + Math.abs(baseVol.change);
     displayVolChange = `+${newChange.toFixed(0)}%`;
     displayVolColor = '#10b981'; // Green for high activity
  }

  const stats = [
    { label: "Current Price", value: displayPrice },
    { label: "24h Volume", value: displayVolume, sub: displayVolChange, subColor: displayVolColor }, 
    { label: "Net Change (1m)", value: `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`, color: percentChange >= 0 ? '#10b981' : '#ef4444' },
    { label: "Volatility", value: risk === 'severe' ? "Extreme" : (risk === 'high' ? "High" : "Normal"), color: config.color }
  ];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-mono selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 0%, ${config.color}15, transparent 60%)` }} />

      <main className="relative z-10 max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">MEV SHIELD</span>
              <div className={`px-2 py-0.5 text-[10px] font-bold rounded border ${isDemoMode ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
                {isDemoMode ? 'DEMO MODE' : 'LIVE DATA'}
              </div>
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-wide">REAL-TIME MEMPOOL PROTECTION SYSTEM</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="bg-gray-900 border border-gray-700 p-1 rounded-lg flex">
                {['LIVE', 'DEMO'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setIsDemoMode(mode === 'DEMO')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      (mode === 'DEMO') === isDemoMode 
                      ? 'bg-gray-700 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
            </div>

            <TokenSelector 
                tokens={TOKEN_LIST} 
                selectedToken={selectedToken} 
                onSelect={setSelectedToken} 
            />
          </div>
        </header>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* CENTER: GRAPH */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-xl font-bold flex items-end gap-2" style={{ color: stat.color || 'white' }}>
                    {stat.value}
                    {stat.sub && <span className="text-xs mb-1" style={{ color: stat.subColor || (stat.sub?.startsWith('+') ? '#10b981' : '#ef4444') }}>{stat.sub}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-gray-900/30 border border-gray-800 rounded-2xl p-6 relative group min-h-[500px] flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                       {selectedToken} / USD 
                       <span className="text-xs font-normal text-gray-500 ml-2 px-2 py-1 bg-gray-800 rounded">LIVE FEED</span>
                    </h2>
                  </div>
                  <div className="flex gap-4 text-xs">
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal Buys
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> MEV Attacks
                     </div>
                  </div>
               </div>
               
               <div className="flex-1 w-full h-full min-h-[400px]">
                 {currentGraphData.length > 0 ? (
                    <ActivityGraph 
                      color={config.color} 
                      data={currentGraphData} 
                      title={`${selectedToken} MARKET ACTIVITY`}
                    />
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                       <div className="w-10 h-10 border-2 border-gray-600 border-t-emerald-500 rounded-full animate-spin"></div>
                       <span className="text-xs tracking-widest animate-pulse">ESTABLISHING UPLINK...</span>
                    </div>
                 )}
               </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <motion.div 
              layout
              className={`relative overflow-hidden rounded-2xl border ${config.border} bg-gray-900/80 p-8 text-center transition-all duration-500`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-current opacity-20 blur-3xl rounded-full" style={{ color: config.color }}></div>
              <div className="relative z-10">
                <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">Recommended Slippage</span>
                <div className="flex items-baseline justify-center gap-1 my-2">
                    <motion.span 
                        key={slippage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-7xl font-black tracking-tighter" 
                        style={{ color: config.color }}
                    >
                        {slippage}
                    </motion.span>
                    <span className="text-3xl font-bold text-gray-500">%</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${config.border}`} style={{ color: config.color, backgroundColor: `${config.color}11` }}>
                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                   {config.label} Conditions
                </div>
                <p className="text-xs text-gray-500 mt-6 leading-relaxed border-t border-gray-800 pt-4">
                   Current mempool analysis suggests setting slippage to <strong style={{color: config.color}}>{slippage}%</strong> to avoid front-running.
                </p>
              </div>
            </motion.div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 flex-1">
               <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                  <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold">Live Attack Feed</h3>
                  <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">LIVE</span>
               </div>
               <RecentAttacks attacks={globalAttacks.length > 0 ? globalAttacks : []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}