import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameState {
    isPlaying: boolean;
    isGameOver: boolean;
    score: number;
    unlockedInfo: number[]; // Indices of unlocked info cards
    showingInfo: number | null; // Index of currently shown info
    victory: boolean;
}

interface Entity {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
}

const INFO_CARDS = [
    {
        title: "Core Objective",
        content: "GapWrap protects transactions from MEV (Maximal Extractable Value) attacks. By analyzing mempool density, we provide real-time slippage recommendations to safely navigate high-volatility environments.",
        ability: "SPEED BOOST UNLOCKED"
    },
    {
        title: "Slippage Engine",
        content: "Our engine monitors pending transactions relative to liquidity depth, identifying predatory ordering (sandwich attacks) and JIT liquidity risks with zero-latency RPC forwarding.",
        ability: "SHIELD GENERATED"
    },
    {
        title: "Data Integrity",
        content: "All estimates are probabilistic and calculated client-side to ensure privacy. No tracking logs, purely mathematical defense against front-running bots.",
        ability: "STEALTH MODE ACTIVE"
    },
    {
        title: "Why GapWrap?",
        content: "1. Minimize Loss from bots.\n2. Optimized Execution for any market.\n3. Privacy Focus with no tracking.\n\nReady to trade securely?",
        ability: "PROTOCOL MASTERED"
    }
];

const MEVEvasionGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<GameState>({
        isPlaying: false,
        isGameOver: false,
        score: 0,
        unlockedInfo: [],
        showingInfo: null,
        victory: false
    });

    // Game entities refs to avoid re-renders during loop
    const player = useRef<Entity>({ x: 0, y: 0, radius: 8, vx: 0, vy: 0, color: '#10B981' });
    const enemies = useRef<Entity[]>([]);
    const collectible = useRef<Entity | null>(null);
    const particles = useRef<Entity[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const lastTime = useRef<number>(0);
    const mousePos = useRef({ x: 0, y: 0 });

    const initGame = useCallback(() => {
        if (!canvasRef.current || !containerRef.current) return;
        const { width, height } = containerRef.current.getBoundingClientRect();

        player.current = { x: width / 2, y: height / 2, radius: 6, vx: 0, vy: 0, color: '#10B981' };
        enemies.current = [];
        collectible.current = spawnCollectible(width, height);
        particles.current = [];

        setGameState({
            isPlaying: true,
            isGameOver: false,
            score: 0,
            unlockedInfo: [],
            showingInfo: null,
            victory: false
        });
    }, []);

    const spawnCollectible = (w: number, h: number): Entity => {
        return {
            x: Math.random() * (w - 100) + 50,
            y: Math.random() * (h - 100) + 50,
            radius: 10,
            vx: 0,
            vy: 0,
            color: '#34D399'
        };
    };

    const spawnEnemy = (w: number, h: number) => {
        const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x = 0, y = 0;

        switch (edge) {
            case 0: x = Math.random() * w; y = -20; break;
            case 1: x = w + 20; y = Math.random() * h; break;
            case 2: x = Math.random() * w; y = h + 20; break;
            case 3: x = -20; y = Math.random() * h; break;
        }

        enemies.current.push({
            x, y,
            radius: 4,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            color: '#EF4444'
        });
    };

    const update = useCallback((time: number) => {
        if (!canvasRef.current || !containerRef.current || !gameState.isPlaying || gameState.showingInfo !== null) {
            animationFrameId.current = requestAnimationFrame(update);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // const deltaTime = (time - lastTime.current) / 1000;
        lastTime.current = time;
        const { width, height } = canvas;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#10B98110';
        ctx.lineWidth = 1;
        const gridSize = 40;
        // Optimize grid drawing: prevent infinite loop if scrolling
        const offsetX = (time / 50) % gridSize;
        const offsetY = (time / 50) % gridSize;

        for (let x = -gridSize; x < width + gridSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x + offsetX - 20, 0);
            ctx.lineTo(x + offsetX - 20, height);
            ctx.stroke();
        }
        for (let y = -gridSize; y < height + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + offsetY - 20);
            ctx.lineTo(width, y + offsetY - 20);
            ctx.stroke();
        }

        // Player Movement (Lerp towards mouse)
        const dx = mousePos.current.x - player.current.x;
        const dy = mousePos.current.y - player.current.y;
        player.current.x += dx * 0.1;
        player.current.y += dy * 0.1;

        // Draw Player
        ctx.beginPath();
        ctx.arc(player.current.x, player.current.y, player.current.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.current.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = player.current.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pulse effect for player
        ctx.beginPath();
        ctx.arc(player.current.x, player.current.y, player.current.radius + Math.sin(time / 200) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = player.current.color;
        ctx.stroke();

        // Spawning Enemies
        if (Math.random() < 0.02 + (gameState.score * 0.001)) {
            spawnEnemy(width, height);
        }

        // Update & Draw Enemies
        enemies.current.forEach((enemy) => {
            // Homing behavior
            const angle = Math.atan2(player.current.x - enemy.x, player.current.y - enemy.y);
            const speed = 1.5 + (gameState.score * 0.1); // Speed increases with score
            enemy.x += Math.sin(angle) * speed;
            enemy.y += Math.cos(angle) * speed;

            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fillStyle = enemy.color;
            ctx.fill();

            // Collision Check
            const dist = Math.hypot(player.current.x - enemy.x, player.current.y - enemy.y);
            if (dist < player.current.radius + enemy.radius) {
                setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
            }
        });

        // Update & Draw Collectible
        if (collectible.current) {
            const c = collectible.current;

            ctx.beginPath();
            ctx.arc(c.x, c.y, c.radius + Math.sin(time / 150) * 2, 0, Math.PI * 2);
            ctx.fillStyle = c.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = c.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`INFO_NODE_${gameState.unlockedInfo.length + 1}`, c.x, c.y - 20);

            // Collection Check
            const dist = Math.hypot(player.current.x - c.x, player.current.y - c.y);
            if (dist < player.current.radius + c.radius) {
                // Unlocked new info
                const nextInfoIndex = gameState.unlockedInfo.length;
                if (nextInfoIndex < INFO_CARDS.length) {
                    setGameState(prev => ({
                        ...prev,
                        score: prev.score + 1,
                        unlockedInfo: [...prev.unlockedInfo, nextInfoIndex],
                        showingInfo: nextInfoIndex,
                        victory: nextInfoIndex === INFO_CARDS.length - 1
                    }));
                    // Clear enemies for a moment of respite
                    enemies.current = enemies.current.filter(() => Math.random() > 0.8);
                    collectible.current = nextInfoIndex < INFO_CARDS.length - 1 ? spawnCollectible(width, height) : null;
                }
            }
        }

        animationFrameId.current = requestAnimationFrame(update);
    }, [gameState.isPlaying, gameState.showingInfo, gameState.score, gameState.unlockedInfo.length]);

    useEffect(() => {
        if (containerRef.current && canvasRef.current) {
            const resize = () => {
                if (containerRef.current && canvasRef.current) {
                    canvasRef.current.width = containerRef.current.clientWidth;
                    canvasRef.current.height = containerRef.current.clientHeight;
                }
            };
            resize();
            window.addEventListener('resize', resize);
            return () => window.removeEventListener('resize', resize);
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                mousePos.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId.current = requestAnimationFrame(update);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        }
    }, [update]);

    // Info Modal
    const InfoModal = () => {
        if (gameState.showingInfo === null) return null;
        const info = INFO_CARDS[gameState.showingInfo];

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <div className="bg-gray-900 border border-emerald-500/50 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-white italic">{info.title}</h2>
                        <div className="text-xs font-mono text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded">
                            {info.ability}
                        </div>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-line text-sm md:text-base">
                        {info.content}
                    </p>
                    <button
                        onClick={() => {
                            setGameState(prev => ({ ...prev, showingInfo: null }));
                            // Reset player to safe spot if needed, or just let them continue
                        }}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 group"
                    >
                        <span>RESUME PROTOCOL</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full h-[600px] bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <canvas ref={canvasRef} className="block cursor-none touch-none" />

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 flex gap-4 pointer-events-none select-none">
                <div className="text-xs font-mono text-emerald-500">
                    NODES: {gameState.unlockedInfo.length}/{INFO_CARDS.length}
                </div>
                <div className="text-xs font-mono text-gray-400">
                    THREAT_LEVEL: {((gameState.score * 5) + 2)}%
                </div>
            </div>

            <AnimatePresence>
                {!gameState.isPlaying && !gameState.isGameOver && !gameState.victory && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="mb-8"
                        >
                            <div className="w-16 h-16 rounded-full border-2 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                            </div>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4">
                            MEV <span className="text-emerald-500">EVASION</span>
                        </h1>
                        <p className="text-gray-400 mb-8 max-w-md text-center text-sm px-4">
                            Protocol information is encrypted. Pilot the transaction node to collect decryption keys while evading MEV bots.
                        </p>
                        <button
                            onClick={initGame}
                            className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all hover:scale-105"
                        >
                            INITIALIZE SEQUENCE
                        </button>
                    </motion.div>
                )}

                {gameState.isGameOver && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 backdrop-blur-md z-10"
                    >
                        <h2 className="text-4xl font-bold text-red-500 mb-2">TRANSACTION FAILED</h2>
                        <p className="text-red-300/70 mb-6 font-mono">SANDWICH ATTACK DETECTED</p>
                        <button
                            onClick={initGame}
                            className="px-8 py-3 bg-transparent border-2 border-red-500 text-red-500 font-bold rounded-full hover:bg-red-500 hover:text-white transition-all"
                        >
                            RETRY TRANSACTION
                        </button>
                    </motion.div>
                )}

                {gameState.victory && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/20 backdrop-blur-md z-10 p-6"
                    >
                        <h2 className="text-4xl font-bold text-emerald-400 mb-4">PROTOCOL SECURED</h2>
                        <div className="bg-black/50 p-6 rounded-xl border border-emerald-500/30 max-w-lg w-full mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">System Status: OPTIMIZED</h3>
                            <p className="text-gray-400 text-sm mb-4">You have successfully navigated the mempool and understood the core tenets of GapWrap.</p>
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-emerald-500/80">
                                <div className="bg-emerald-900/10 p-2 rounded">SLIPPAGE: 0.1%</div>
                                <div className="bg-emerald-900/10 p-2 rounded">PRIVACY: MAX</div>
                                <div className="bg-emerald-900/10 p-2 rounded">MEV: BLOCKED</div>
                                <div className="bg-emerald-900/10 p-2 rounded">SPEED: INSTANT</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={initGame}
                                className="px-6 py-2 bg-gray-800 text-gray-300 font-bold rounded-full hover:bg-gray-700 transition-all text-sm"
                            >
                                REPLAY SIMULATION
                            </button>
                            <a
                                href="/slippage-estimates"
                                className="px-6 py-2 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-all text-sm flex items-center"
                            >
                                GO TO APP
                            </a>
                        </div>
                    </motion.div>
                )}

                <InfoModal />
            </AnimatePresence>
        </div>
    );
};

export default MEVEvasionGame;
