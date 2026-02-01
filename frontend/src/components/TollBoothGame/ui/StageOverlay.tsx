import { motion } from 'framer-motion';
import type { StageConfig } from '../constants/stages';

interface StageOverlayProps {
  config: StageConfig;
  onContinue: () => void;
  onAnswer: () => void;
  questionAnswered: boolean;
  isComplete: boolean;
}

export default function StageOverlay({
  config,
  onContinue,
  onAnswer,
  questionAnswered,
  isComplete,
}: StageOverlayProps) {
  const handleQuestionAnswer = () => {
    onAnswer();
  };

  const showContinuePrompt = !config.question || questionAnswered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
    >
      <div className="bg-gray-900/90 border border-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
        {/* Stage number */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Stage {config.id} of 10
          </span>
          {config.hasProtection && (
            <span className="px-2 py-0.5 bg-emerald-900/30 border border-emerald-500/30 rounded text-[10px] text-emerald-400 uppercase tracking-wider">
              Protected
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
          {config.title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-4">
          {config.description}
        </p>

        {/* Question section */}
        {config.question && !questionAnswered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border-t border-gray-800 pt-4 mt-4"
          >
            <p className="text-emerald-400 font-medium mb-3 text-sm">
              {config.question.text}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleQuestionAnswer}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-white text-sm transition-all duration-200"
              >
                {config.question.options[0]}
              </button>
              <button
                onClick={handleQuestionAnswer}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500/50 rounded-lg text-white text-sm transition-all duration-200"
              >
                {config.question.options[1]}
              </button>
            </div>
          </motion.div>
        )}

        {/* Continue prompt */}
        {showContinuePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between border-t border-gray-800 pt-4 mt-4"
          >
            {isComplete ? (
              <p className="text-emerald-400 text-sm animate-pulse">
                Scroll down to learn more about GapWrap
              </p>
            ) : (
              <>
                <p className="text-gray-500 text-xs">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">Space</kbd>
                  or <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 mx-1">Enter</kbd> to continue
                </p>
                <button
                  onClick={onContinue}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  Continue
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
