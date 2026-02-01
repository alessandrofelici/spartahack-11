import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  currentStage: number;
  totalStages: number;
}

export default function ProgressIndicator({
  currentStage,
  totalStages,
}: ProgressIndicatorProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
      {Array.from({ length: totalStages }).map((_, index) => {
        const stageNum = index + 1;
        const isActive = stageNum === currentStage;
        const isCompleted = stageNum < currentStage;
        const isSecondHalf = stageNum > 5;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            {/* Stage dot */}
            <div
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${isActive
                  ? isSecondHalf
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/30 scale-125'
                    : 'bg-red-400 ring-2 ring-red-400/30 scale-125'
                  : isCompleted
                    ? isSecondHalf || stageNum > 5
                      ? 'bg-emerald-500/60'
                      : stageNum <= 5
                        ? 'bg-red-500/60'
                        : 'bg-gray-600'
                    : 'bg-gray-700'
                }
              `}
            />

            {/* Active pulse effect */}
            {isActive && (
              <motion.div
                className={`
                  absolute inset-0 rounded-full
                  ${isSecondHalf ? 'bg-emerald-400' : 'bg-red-400'}
                `}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.div>
        );
      })}

      {/* Divider between scenarios */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-gray-700" style={{ left: 'calc(50% - 2px)' }} />
    </div>
  );
}
