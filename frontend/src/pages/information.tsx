import { motion } from "framer-motion";
import TollBoothGame from "../components/TollBoothGame";

const InfoCard = ({ title, delay, children }: { title: string, delay: number, children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-800/50 border border-gray-700 p-6 rounded-3xl backdrop-blur-sm hover:border-emerald-500/30 transition-colors duration-300"
  >
    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
      {`// ${title}`}
    </h3>
    <div className="text-gray-400 space-y-4 text-sm leading-relaxed">
      {children}
    </div>
  </motion.div>
);

export default function Information() {
  return (
    <div className="bg-[#0a0a0a] text-white font-mono selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Interactive Sandwich Attack Game */}
      <TollBoothGame />

      {/* Info Content Section */}
      <div id="info-content" className="snap-section min-h-screen relative" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', marginTop: '-1rem', paddingTop: '3rem' }}>
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
        </div>

        <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 pt-12 md:pt-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-gray-800 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic mb-2 text-white">
              PROTOCOL <span className="text-emerald-500">INFO</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm tracking-wide">
              SYSTEM ARCHITECTURE // V1.0.4 // SECURE
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
              SYSTEM ONLINE
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard title="Core Objective" delay={0.2}>
            <p>
              GapWrap is designed to protect transactions from MEV (Maximal Extractable Value) attacks in high-volatility environments. By analyzing mempool density and historical attack vectors, we provide real-time slippage recommendations.
            </p>
          </InfoCard>

          <InfoCard title="Slippage Engine" delay={0.3}>
            <p>
              Our proprietary engine monitors pending transactions relative to liquidity depth.
            </p>
            <ul className="list-disc pl-4 space-y-2 text-gray-500">
              <li><span className="text-emerald-400/80">Sandwich Detection:</span> Identifying predatory ordering.</li>
              <li><span className="text-emerald-400/80">JIT Liquidity:</span> Analyzing flash-loan probability.</li>
            </ul>
          </InfoCard>

          <InfoCard title="Data Integrity" delay={0.4}>
            <p>
              Data is sourced directly from RPC nodes with zero-latency forwarding. All estimates are probabilistic and calculated client-side to ensure privacy.
            </p>
            <div className="mt-4 p-3 bg-black/50 rounded border border-gray-800 font-mono text-xs text-emerald-500/70">
              {`> CONNECTION_STATUS: ENCRYPTED`}
              <br />
              {`> NODE_LATENCY: 14ms`}
            </div>
          </InfoCard>

          <div className="md:col-span-2 lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="h-full bg-gradient-to-br from-gray-900/80 to-black border border-gray-800 p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              </div>

              <h3 className="text-2xl font-bold mb-6 italic tracking-tight">
                WHY USE <span className="text-emerald-500">GAPWRAP?</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-black text-gray-800 group-hover:text-emerald-900/50 transition-colors mb-2">01</div>
                  <h4 className="font-bold text-white mb-2">Minimize Loss</h4>
                  <p className="text-xs text-gray-500">Reduce value leakage from front-running bots.</p>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-800 group-hover:text-emerald-900/50 transition-colors mb-2">02</div>
                  <h4 className="font-bold text-white mb-2">Optimized Execution</h4>
                  <p className="text-xs text-gray-500">Dynamic parameters for any market condition.</p>
                </div>
                <div>
                  <div className="text-4xl font-black text-gray-800 group-hover:text-emerald-900/50 transition-colors mb-2">03</div>
                  <h4 className="font-bold text-white mb-2">Privacy Focus</h4>
                  <p className="text-xs text-gray-500">No tracking, no logs, pure calculation.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <InfoCard title="User Guide" delay={0.6}>
            <p>
              1. Select your target token.<br />
              2. Review the recommended Slippage tolerance.<br />
              3. Check the "Risk Level" indicator.<br />
              4. Execute your swap with confidence.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 bg-emerald-900/30 border border-emerald-900/50 rounded text-[10px] text-emerald-400">SAFE</span>
              <span className="px-2 py-1 bg-yellow-900/30 border border-yellow-900/50 rounded text-[10px] text-yellow-500">CAUTION</span>
            </div>
          </InfoCard>
        </div>

        <footer className="mt-20 border-t border-gray-900 pt-8 text-center text-xs text-gray-600">
          <p>SYSTEM ID: GW-8829 // DISCONNECTED FROM MAINNET</p>
        </footer>
        </main>
      </div>
    </div>
  );
}