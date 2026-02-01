import { motion } from 'framer-motion';
import type { GameState } from './hooks/useGameState';

interface Props {
  gameState: GameState;
}

export default function SimpleScene({ gameState }: Props) {
  const { currentConfig, stage } = gameState;

  // Calculate car position (0 to 100%)
  const carProgress = ((currentConfig.carPosition[0] + 10) / 20) * 100;
  
  // Bot is visible starting from stage 2
  const botVisible = currentConfig.botVisible;
  
  // Checkpoint flag is at the end of the road
  const checkpointPosition = 90;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Dotted Road Line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2">
        <div className="w-full border-t-3 border-dashed border-gray-400" />
      </div>

      {/* Checkpoint Flag at the end */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
        style={{ left: `${checkpointPosition}%` }}
      >
        <div className="flex flex-col items-center">
          {/* Dollar symbol */}
          <div className="text-4xl font-bold text-emerald-600">
            $
          </div>
          <div className="text-[8px] text-gray-600 font-mono mt-1">SALE</div>
        </div>
      </div>

      {/* Bot (Red sphere at top) */}
      {botVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute"
          style={{
            left: `${((currentConfig.botPosition[0] + 10) / 20) * 100}%`,
            top: '10%',
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Bot sphere */}
            <div className="w-10 h-10 rounded-full bg-red-500 shadow-md flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-red-600 animate-pulse" />
            </div>
            
            {/* Scanner cone when scanning */}
            {currentConfig.showScanner && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-10 w-0 h-0"
                style={{
                  borderLeft: '30px solid transparent',
                  borderRight: '30px solid transparent',
                  borderTop: '45px solid rgba(239, 68, 68, 0.2)',
                }}
              />
            )}
            
            <div className="text-[8px] text-red-500 font-mono mt-1">BOT</div>
          </div>
        </motion.div>
      )}

      {/* Car (Colored sphere) */}
      <motion.div
        animate={{
          left: `${carProgress}%`,
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
      >
        <div className="relative flex flex-col items-center">
          {/* Shield effect */}
          {currentConfig.hasProtection && (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 w-16 h-16 -top-3 -left-3 rounded-full border-3 border-emerald-400 bg-emerald-400/10"
            />
          )}
          
          {/* Car sphere */}
          <div
            className={`w-10 h-10 rounded-full shadow-md transition-all duration-300 ${
              stage === 3 || stage === 8
                ? 'bg-emerald-400 ring-3 ring-emerald-300 ring-opacity-50'
                : 'bg-emerald-500'
            }`}
          />
          
          <div className="text-[8px] text-emerald-600 font-mono mt-1">USER</div>
        </div>
      </motion.div>
    </div>
  );
}
