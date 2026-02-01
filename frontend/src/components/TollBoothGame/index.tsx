import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGameState } from './hooks/useGameState';
import SimpleScene from './SimpleScene';
import StageOverlay from './ui/StageOverlay';
import ProgressIndicator from './ui/ProgressIndicator';

export default function TollBoothGame() {
  const { state, nextStage, answerQuestion, endAnimation, reset } = useGameState();
  const [activeSection, setActiveSection] = useState(0);

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Check which section is most visible in the viewport
      if (scrollPos < windowHeight * 0.7) {
        setActiveSection(0); // Hero
      } else if (scrollPos < windowHeight * 1.7) {
        setActiveSection(1); // Animation
      } else {
        setActiveSection(2); // Info
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full relative" style={{ scrollSnapType: 'y proximity' }}>
      {/* Background Effects - flows through entire page */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
      </div>

      {/* Section Navigation Sidebar */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
        <button
          onClick={() => scrollToSection('hero-section')}
          className="group flex items-center gap-2"
          aria-label="Go to hero section"
        >
          <span className={`text-xs text-gray-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 ${
            activeSection === 0 ? 'opacity-100 text-emerald-400' : ''
          }`}>
            Home
          </span>
          <div className={`w-2 h-2 rounded-full border-2 transition-all ${
            activeSection === 0 
              ? 'border-emerald-500 bg-emerald-500 scale-125' 
              : 'border-gray-600 hover:border-emerald-400'
          }`} />
        </button>
        <button
          onClick={() => scrollToSection('animation-section')}
          className="group flex items-center gap-2"
          aria-label="Go to animation section"
        >
          <span className={`text-xs text-gray-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 ${
            activeSection === 1 ? 'opacity-100 text-emerald-400' : ''
          }`}>
            Demo
          </span>
          <div className={`w-2 h-2 rounded-full border-2 transition-all ${
            activeSection === 1 
              ? 'border-emerald-500 bg-emerald-500 scale-125' 
              : 'border-gray-600 hover:border-emerald-400'
          }`} />
        </button>
        <button
          onClick={() => scrollToSection('info-content')}
          className="group flex items-center gap-2"
          aria-label="Go to info section"
        >
          <span className={`text-xs text-gray-500 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100 ${
            activeSection === 2 ? 'opacity-100 text-emerald-400' : ''
          }`}>
            Info
          </span>
          <div className={`w-2 h-2 rounded-full border-2 transition-all ${
            activeSection === 2 
              ? 'border-emerald-500 bg-emerald-500 scale-125' 
              : 'border-gray-600 hover:border-emerald-400'
          }`} />
        </button>
      </div>

      {/* SECTION 1: Hero/Landing Section */}
      <section id="hero-section" className="snap-section relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pb-8" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always', marginTop: '-1rem' }}>
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter italic text-white mb-4">
            Gap<span className="text-emerald-500">Wrap</span>
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl mb-8">
            MEV Protection Made Simple
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mb-8">
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl mb-3">🛡️</div>
            <h3 className="text-emerald-400 font-bold mb-2">MEV Protection</h3>
            <p className="text-gray-500 text-sm">Shield your trades from sandwich attacks and front-running bots</p>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-emerald-400 font-bold mb-2">Real-Time Monitoring</h3>
            <p className="text-gray-500 text-sm">Track mempool activity and detect threats before they execute</p>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-emerald-400 font-bold mb-2">Save Gas Fees</h3>
            <p className="text-gray-500 text-sm">Optimize transaction timing to minimize costs and maximize value</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-500">$1.3B+</div>
            <div className="text-gray-500 text-sm mt-1">MEV Extracted (2023)</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-500">~12sec</div>
            <div className="text-gray-500 text-sm mt-1">Ethereum Block Time</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-500">70%+</div>
            <div className="text-gray-500 text-sm mt-1">Of Blocks Contain MEV</div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-emerald-500/50 rounded-lg text-gray-400 hover:text-emerald-400 text-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
          <button
            onClick={() => scrollToSection('info-content')}
            className="px-5 py-2.5 bg-gray-900/50 hover:bg-gray-800/50 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-gray-300 text-sm transition-all duration-200"
          >
            Skip to Info
          </button>
          <button
            onClick={() => scrollToSection('animation-section')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-lg text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
          >
            See How It Works
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 animate-bounce">
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
      </section>

      {/* SECTION 2: Animation Section */}
      <section id="animation-section" className="snap-section relative z-10 min-h-screen flex flex-col pt-24 pb-8 px-4" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        <div className="w-full max-w-6xl mx-auto flex flex-col h-full flex-1">
          {/* Animation Container with progress at bottom */}
          <div className="flex-shrink-0 mb-6">
            <div 
              className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-4 cursor-pointer border-2 border-gray-400 relative"
              onClick={handleAdvance}
              style={{ height: '300px' }}
            >
              <SimpleScene gameState={state} />
            </div>
            
            {/* Progress indicator at bottom of animation */}
            <div className="mt-4">
              <ProgressIndicator currentStage={state.stage} totalStages={10} />
            </div>
          </div>

          {/* Stage overlay - below animation */}
          <div className="flex-1 min-h-0">
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
          </div>

          {/* Scroll indicator when complete */}
          {state.isComplete && (
            <div className="flex justify-center mt-8 animate-bounce">
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
      </section>

      {/* SECTION 3: Info Section (stays as is) */}
      {/* This section is rendered by the parent component */}
    </div>
  );
}
