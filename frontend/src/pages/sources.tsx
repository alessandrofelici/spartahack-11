import { useState } from 'react';
import { motion } from 'framer-motion';

interface Resource {
  title: string;
  category: 'blockchain' | 'crypto' | 'sandwich-attacks' | 'other-attacks';
  url: string;
  description: string;
}

const RESOURCES: Resource[] = [
  {
    title: "Understanding Sandwich Attacks in DeFi",
    category: "sandwich-attacks",
    url: "https://medium.com/@a.m.saghiri2008/understanding-sandwich-attacks-in-defi-a-simple-guide-with-real-examples-4772605091a1",
    description: "A comprehensive guide with real examples explaining how sandwich attacks work in decentralized finance."
  },
  {
    title: "Ethereum MEV Documentation",
    category: "blockchain",
    url: "https://ethereum.org/en/developers/docs/mev/",
    description: "Official Ethereum documentation on Maximal Extractable Value and its implications."
  },
  {
    title: "Flashbots: MEV Protection",
    category: "other-attacks",
    url: "https://docs.flashbots.net/",
    description: "Learn about Flashbots and how they help mitigate MEV extraction through private transactions."
  },
  {
    title: "DeFi Security Best Practices",
    category: "crypto",
    url: "https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/",
    description: "Security considerations and best practices for DeFi protocols and users."
  },
  {
    title: "Front-Running Attacks Explained",
    category: "other-attacks",
    url: "https://arxiv.org/abs/1902.05164",
    description: "Academic paper analyzing front-running attacks in blockchain networks and their economic impact."
  },
  {
    title: "1inch Network Protection Features",
    category: "sandwich-attacks",
    url: "https://docs.1inch.io/docs/protection/intro",
    description: "Documentation on 1inch's features designed to protect users from MEV attacks."
  }
];

const InfoCard = ({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors duration-300"
  >
    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
      {`// ${title}`}
    </h3>
    <div className="text-gray-400 space-y-4 text-sm leading-relaxed">
      {children}
    </div>
  </motion.div>
);

export default function Sources() {
  const [tradeAmount, setTradeAmount] = useState('1.0');
  const [ticker, setTicker] = useState('ETH');
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const calculateProtection = () => {
    const amount = parseFloat(tradeAmount) || 0;
    const slippage = parseFloat(slippageTolerance) || 0;
    const maxPrice = amount * (1 + slippage / 100);
    const minPrice = amount * (1 - slippage / 100);
    
    return {
      maxPrice: maxPrice.toFixed(4),
      minPrice: minPrice.toFixed(4),
      protectionLevel: slippage < 0.5 ? 'HIGH' : slippage < 1.5 ? 'MEDIUM' : 'LOW'
    };
  };

  const protection = calculateProtection();

  const filteredResources = selectedCategory === 'all' 
    ? RESOURCES 
    : RESOURCES.filter(r => r.category === selectedCategory);

  const categoryColors: Record<string, string> = {
    'blockchain': 'text-blue-400 border-blue-500/30',
    'crypto': 'text-purple-400 border-purple-500/30',
    'sandwich-attacks': 'text-red-400 border-red-500/30',
    'other-attacks': 'text-yellow-400 border-yellow-500/30',
  };

  return (
    <div className="bg-black text-white font-mono selection:bg-emerald-500/30 min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 pt-12 md:pt-20">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-800 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic mb-2 text-white">
              PROTECTION <span className="text-emerald-500">GUIDE</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm tracking-wide">
              LEARN TO DEFEND // INTERACTIVE EXAMPLES // v1.2.0
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 mt-4 md:mt-0"
          >
            <div className="px-3 py-1 bg-emerald-900/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              INTERACTIVE MODE
            </div>
          </motion.div>
        </header>

        {/* Interactive Trade Simulator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 p-8 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>

          <h2 className="text-2xl font-bold mb-6 italic tracking-tight">
            SIMULATE YOUR <span className="text-emerald-500">TRADE</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Trade Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 ${
                      tradeType === 'buy'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-gray-900/20 border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all duration-200 ${
                      tradeType === 'sell'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-gray-900/20 border-gray-800 text-gray-500 hover:border-gray-700'
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Token Symbol</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="ETH"
                  className="w-full px-4 py-3 bg-gray-900/20 border border-gray-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-emerald-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Amount</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="1.0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-900/20 border border-gray-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-white"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">
                  Slippage Tolerance (%)
                </label>
                <input
                  type="number"
                  value={slippageTolerance}
                  onChange={(e) => setSlippageTolerance(e.target.value)}
                  placeholder="0.5"
                  step="0.1"
                  className="w-full px-4 py-3 bg-gray-900/20 border border-gray-800 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none text-white"
                />
                <div className="flex gap-2 mt-2">
                  {['0.5', '1.0', '2.0'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippageTolerance(val)}
                      className="px-3 py-1 bg-gray-900/40 border border-gray-800 rounded text-[10px] text-gray-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Trade Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Action:</span>
                  <span className="text-emerald-400 font-bold uppercase">{tradeType} {ticker}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Amount:</span>
                  <span className="text-white font-bold">{tradeAmount} {ticker}</span>
                </div>

                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Max Price Impact:</span>
                    <span className="text-white">{protection.maxPrice} {ticker}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Min Price Impact:</span>
                    <span className="text-white">{protection.minPrice} {ticker}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Protection Level:</span>
                    <span className={`font-bold ${
                      protection.protectionLevel === 'HIGH' ? 'text-emerald-400' :
                      protection.protectionLevel === 'MEDIUM' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {protection.protectionLevel}
                    </span>
                  </div>

                  <div className="bg-gray-900/50 border border-gray-800 rounded p-3 mt-3">
                    <p className="text-[10px] text-gray-400 leading-relaxed mb-2">
                      <span className="text-emerald-400 font-bold">How is this calculated?</span>
                    </p>
                    <div className="space-y-1 text-[10px] text-gray-500">
                      <div>• <span className="text-emerald-400">HIGH</span>: Slippage &lt; 0.5%</div>
                      <div>• <span className="text-yellow-400">MEDIUM</span>: Slippage 0.5% - 1.5%</div>
                      <div>• <span className="text-red-400">LOW</span>: Slippage &gt; 1.5%</div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-900/10 border border-emerald-500/20 rounded p-3 mt-4">
                  <p className="text-[10px] text-emerald-400 leading-relaxed">
                    ⚡ With {slippageTolerance}% slippage, your transaction will fail if the price moves more than expected, 
                    protecting you from paying {parseFloat(slippageTolerance) > 1 ? 'excessive' : 'minimal'} extra fees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Protection Strategies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 italic tracking-tight text-white border-b border-gray-800 pb-4">
            HOW TO <span className="text-emerald-500">PROTECT YOURSELF</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard title="Set Slippage Tolerances" delay={0.3}>
              <p>
                Configure maximum acceptable price movement before your trade executes. Lower tolerances 
                (0.5%-1%) provide stronger protection but may cause transaction failures during volatility.
              </p>
              <div className="mt-4 p-3 bg-black/50 rounded border border-gray-800 font-mono text-xs text-emerald-500/70">
                {`> RECOMMENDED: 0.5%-1.0%`}
                <br />
                {`> HIGH_VOLATILITY: 1.5%-2.5%`}
              </div>
            </InfoCard>

            <InfoCard title="Use Private Transactions" delay={0.4}>
              <p>
                Submit trades through services like Flashbots that bypass the public mempool, 
                sending transactions directly to validators to prevent front-running.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-gray-500 mt-2">
                <li><span className="text-emerald-400/80">Flashbots Protect</span> for Ethereum</li>
                <li><span className="text-emerald-400/80">1inch RabbitHole</span> mode</li>
                <li><span className="text-emerald-400/80">MEV-Blocker</span> browser extension</li>
              </ul>
            </InfoCard>

            <InfoCard title="Trade Strategically" delay={0.5}>
              <p>
                Break large trades into smaller portions and avoid peak congestion times when attackers 
                are most active in scanning the mempool.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm">Split trades &gt; $10k</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm">Trade during low gas periods</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-sm">Monitor mempool density</span>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Choose Protected DEXs" delay={0.6}>
              <p>
                Select decentralized exchanges with built-in anti-frontrunning features like 
                transaction randomization or batch auctions.
              </p>
              <div className="mt-4 space-y-2 text-xs">
                <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                  <span className="text-emerald-400">CowSwap:</span> Batch auction mechanism
                </div>
                <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                  <span className="text-emerald-400">1inch:</span> MEV protection mode
                </div>
              </div>
            </InfoCard>



            <InfoCard title="Monitor Gas Prices" delay={0.7}>
              <p>
                High gas prices often correlate with increased MEV activity. Consider waiting for 
                lower gas periods or use gas price alerts to time your transactions better.
              </p>
              <div className="mt-4 p-3 bg-black/50 rounded border border-gray-800 font-mono text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Low:</span>
                  <span className="text-emerald-400">&lt; 30 GWEI</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Medium:</span>
                  <span className="text-yellow-400">30-100 GWEI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">High:</span>
                  <span className="text-red-400">&gt; 100 GWEI</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-emerald-900/10 border border-emerald-500/20 rounded">
                <p className="text-[10px] text-emerald-400 mb-1">⏰ Best Trading Times (Your Timezone):</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Typically lowest gas: 2:00 AM - 6:00 AM {new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').slice(-1)[0]}
                  <br />
                  Weekend mornings often have 30-50% lower fees.
                </p>
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Resources Section */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold italic tracking-tight text-white mb-4 md:mb-0">
              LEARNING <span className="text-emerald-500">RESOURCES</span>
            </h2>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded text-[10px] border transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                ALL
              </button>
              <button
                onClick={() => setSelectedCategory('blockchain')}
                className={`px-3 py-1 rounded text-[10px] border transition-all ${
                  selectedCategory === 'blockchain'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                BLOCKCHAIN
              </button>
              <button
                onClick={() => setSelectedCategory('crypto')}
                className={`px-3 py-1 rounded text-[10px] border transition-all ${
                  selectedCategory === 'crypto'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                    : 'bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                CRYPTO
              </button>
              <button
                onClick={() => setSelectedCategory('sandwich-attacks')}
                className={`px-3 py-1 rounded text-[10px] border transition-all ${
                  selectedCategory === 'sandwich-attacks'
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                SANDWICH ATTACKS
              </button>
              <button
                onClick={() => setSelectedCategory('other-attacks')}
                className={`px-3 py-1 rounded text-[10px] border transition-all ${
                  selectedCategory === 'other-attacks'
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-gray-900/20 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                OTHER ATTACKS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResources.map((resource, index) => (
              <motion.a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded text-[10px] border uppercase ${categoryColors[resource.category]}`}>
                    {resource.category.replace('-', ' ')}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
                
                <h3 className="text-white font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {resource.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {resource.description}
                </p>
                
                <div className="mt-4 text-[10px] text-gray-600 font-mono truncate">
                  {resource.url}
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        <footer className="mt-20 border-t border-gray-900 pt-8 text-center text-xs text-gray-600">
          <p>PROTECTION GUIDE v1.2.0 // STAY SAFE // TRADE SMART</p>
        </footer>
      </main>
    </div>
  );
}
