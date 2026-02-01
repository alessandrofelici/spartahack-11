import { Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useGameState } from './hooks/useGameState';
import TollBoothScene from './TollBoothScene';
import StageOverlay from './ui/StageOverlay';
import ProgressIndicator from './ui/ProgressIndicator';

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm font-mono">Loading simulation...</p>
      </div>
    </div>
  );
}

export default function TollBoothGame() {
  const { state, nextStage, answerQuestion, endAnimation } = useGameState();

  const handleAdvance = useCallback(() => {
    if (!state.isAnimating && !state.isComplete) {
      nextStage();
    }
  }, [state.isAnimating, state.isComplete, nextStage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  // End animation after transition
  useEffect(() => {
    if (state.isAnimating) {
      const timer = setTimeout(() => {
        endAnimation();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state.isAnimating, state.stage, endAnimation]);

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      {/* Title */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
          SANDWICH <span className="text-emerald-500">ATTACK</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1 font-mono">
          Interactive Demonstration
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          const el = document.getElementById('info-content');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="absolute top-6 right-6 z-10 px-3 py-1.5 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-500 hover:text-gray-300 text-xs transition-all duration-200"
      >
        Skip to Info
      </button>

      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        className="cursor-pointer"
        onClick={handleAdvance}
      >
        <Suspense fallback={null}>
          <TollBoothScene gameState={state} />
        </Suspense>
      </Canvas>

      {/* Loading fallback */}
      <Suspense fallback={<LoadingScreen />}>
        <div />
      </Suspense>

      {/* Progress indicator */}
      <ProgressIndicator currentStage={state.stage} totalStages={10} />

      {/* Stage overlay */}
      <AnimatePresence mode="wait">
        <StageOverlay
          key={state.stage}
          config={state.currentConfig}
          onContinue={handleAdvance}
          onAnswer={answerQuestion}
          questionAnswered={state.questionAnswered}
          isComplete={state.isComplete}
        />
      </AnimatePresence>

      {/* Scroll indicator */}
      {state.isComplete && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
