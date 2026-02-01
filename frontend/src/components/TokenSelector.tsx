import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface Token {
  value: string;
  label: string;
  symbol: string;
  logo: string;
}

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken: string;
  onSelect: (token: string) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ tokens, selectedToken, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selected = tokens.find(t => t.value === selectedToken) || tokens[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={containerRef}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gray-800/80 border border-gray-600 hover:border-emerald-500/50 text-white px-4 py-2 rounded-xl transition-all w-48 justify-between"
      >
        <div className="flex items-center gap-2">
           {/* Fallback for missing images */}
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
             {selected.logo ? <img src={selected.logo} alt={selected.label} className="w-full h-full object-cover" /> : selected.symbol[0]}
          </div>
          <span className="font-bold">{selected.symbol}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            {tokens.map((token) => (
              <button
                key={token.value}
                onClick={() => {
                  onSelect(token.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors ${selectedToken === token.value ? 'bg-gray-800/50 text-emerald-400' : 'text-gray-300'}`}
              >
                 <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {token.logo ? <img src={token.logo} alt={token.label} className="w-full h-full object-cover" /> : token.symbol[0]}
                 </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="font-bold text-sm">{token.symbol}</span>
                    <span className="text-[10px] text-gray-500">{token.label}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenSelector;