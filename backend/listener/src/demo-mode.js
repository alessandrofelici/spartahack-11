// Replays pre-recorded transaction data for reliable demos

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Playback speed multiplier (1 = real-time, 2 = 2x speed, 0.5 = slow-mo)
  DEFAULT_SPEED: 5,
  
  // Loop when scenario finishes
  LOOP_ENABLED: true,
  
  // Pause between loops (milliseconds)
  LOOP_PAUSE_MS: 5000,
  
  // Data directory
  DATA_DIR: path.join(__dirname, '../demo-data')
};

// State
let isPlaying = false;
let currentScenario = null;
let currentIndex = 0;
let playbackSpeed = CONFIG.DEFAULT_SPEED;
let replayTimeout = null;
let onTransactionCallback = null;

// Available scenarios
const scenarios = new Map();

// Statistics
const stats = {
  scenariosLoaded: 0,
  transactionsReplayed: 0,
  loopsCompleted: 0,
  currentScenario: null,
  isPlaying: false,
  playbackSpeed: CONFIG.DEFAULT_SPEED
};

// Initialize demo mode
function initialize(onTransaction) {
  console.log(' Initializing demo mode...');
  
  onTransactionCallback = onTransaction;
  
  // Load scenarios
  loadScenarios();
  
  console.log(`   Scenarios loaded: ${scenarios.size}`);
  console.log(`   Default speed: ${playbackSpeed}x`);
  console.log(`   Loop enabled: ${CONFIG.LOOP_ENABLED}`);
  console.log('   Demo mode ready\n');
  
  return scenarios.size > 0;
}

// Load scenario data from JSON files
function loadScenarios() {
  console.log(`   Loading scenarios from ${CONFIG.DATA_DIR}...`);
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(CONFIG.DATA_DIR)) {
    console.log(`   Creating demo-data directory...`);
    fs.mkdirSync(CONFIG.DATA_DIR, { recursive: true });
    
    // Create example scenarios
    createExampleScenarios();
  }
  
  // Load all JSON files from demo-data directory
  try {
    const files = fs.readdirSync(CONFIG.DATA_DIR)
      .filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(CONFIG.DATA_DIR, file);
      const scenarioData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const scenarioName = path.basename(file, '.json');
      scenarios.set(scenarioName, scenarioData);
      
      console.log(`   ✓ Loaded: ${scenarioName} (${scenarioData.transactions.length} txs)`);
      stats.scenariosLoaded++;
    }
    
  } catch (error) {
    console.error(`    Error loading scenarios: ${error.message}`);
  }
}

// Create example scenario files
function createExampleScenarios() {
  console.log('   Creating example scenarios...');
  
  const { TOKENS } = require('./constants/addresses');
  
  // Scenario 1: Calm Market
  const calmMarket = {
    name: "Calm Market",
    description: "Low activity period on WETH-USDC, minimal bot activity",
    pair: "USDC-WETH",
    duration_seconds: 60,
    transactions: []
  };
  
  // Generate 10 normal transactions over 60 seconds
  const baseTime = Date.now();
  for (let i = 0; i < 10; i++) {
    calmMarket.transactions.push({
      txHash: `0xCALM_${i}_${'0'.repeat(56)}`,
      from: `0xUSER_${i}_${'0'.repeat(34)}`.substring(0, 42).toLowerCase(),
      to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      gasPriceGwei: 25 + Math.random() * 10, // 25-35 gwei (calm)
      method: 'swapExactETHForTokens',
      tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
      tokenOut: { symbol: 'USDC', address: TOKENS.USDC.toLowerCase(), decimals: 6 },
      amountIn: (Math.random() * 2).toFixed(2),
      direction: 'buy',
      pair: 'USDC-WETH',
      timestamp: baseTime + (i * 6000), // Every 6 seconds
      isSuspicious: false
    });
  }
  
  // Scenario 2: Moderate Activity with Sandwiches
  const moderateActivity = {
    name: "Moderate Activity",
    description: "Normal trading on WETH-PEPE with 2 sandwich attacks",
    pair: "PEPE-WETH",
    duration_seconds: 90,
    transactions: []
  };
  
  // Generate 30 transactions with 2 sandwiches mixed in
  for (let i = 0; i < 30; i++) {
    // Add a sandwich at transaction 10 and 20
    if (i === 10 || i === 20) {
      const attackerAddr = `0xBOT_${Math.floor(i/10)}_${'0'.repeat(32)}`.substring(0, 42).toLowerCase();
      const victimAddr = `0xVICTIM_${i}_${'0'.repeat(30)}`.substring(0, 42).toLowerCase();
      
      // Frontrun
      moderateActivity.transactions.push({
        txHash: `0xFRONT_${i}_${'0'.repeat(52)}`,
        from: attackerAddr,
        gasPriceGwei: 90,
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'PEPE', address: TOKENS.PEPE.toLowerCase(), decimals: 18 },
        amountIn: '3.0',
        direction: 'buy',
        pair: 'PEPE-WETH',
        timestamp: baseTime + (i * 3000),
        isSuspicious: true
      });
      
      // Victim (300ms later)
      moderateActivity.transactions.push({
        txHash: `0xVICTIM_${i}_${'0'.repeat(50)}`,
        from: victimAddr,
        gasPriceGwei: 35,
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'PEPE', address: TOKENS.PEPE.toLowerCase(), decimals: 18 },
        amountIn: '2.5',
        direction: 'buy',
        pair: 'PEPE-WETH',
        timestamp: baseTime + (i * 3000) + 300,
        isSuspicious: false
      });
      
      // Backrun (600ms later)
      moderateActivity.transactions.push({
        txHash: `0xBACK_${i}_${'0'.repeat(54)}`,
        from: attackerAddr,
        gasPriceGwei: 89,
        method: 'swapExactTokensForETH',
        tokenIn: { symbol: 'PEPE', address: TOKENS.PEPE.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        amountIn: '1000000000000000000',
        direction: 'sell',
        pair: 'PEPE-WETH',
        timestamp: baseTime + (i * 3000) + 600,
        isSuspicious: true
      });
    } else {
      // Normal transaction
      moderateActivity.transactions.push({
        txHash: `0xNORMAL_${i}_${'0'.repeat(50)}`,
        from: `0xUSER_${i}_${'0'.repeat(34)}`.substring(0, 42).toLowerCase(),
        gasPriceGwei: 30 + Math.random() * 30, // 30-60 gwei
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'PEPE', address: TOKENS.PEPE.toLowerCase(), decimals: 18 },
        amountIn: (Math.random() * 3).toFixed(2),
        direction: 'buy',
        pair: 'PEPE-WETH',
        timestamp: baseTime + (i * 3000),
        isSuspicious: Math.random() > 0.7
      });
    }
  }
  
  // Scenario 3: Feeding Frenzy
  const feedingFrenzy = {
    name: "Feeding Frenzy",
    description: "Heavy bot activity on trending memecoin with 5 sandwich attacks",
    pair: "SHIB-WETH",
    duration_seconds: 60,
    transactions: []
  };
  
  // 50 transactions, many suspicious, 5 sandwiches
  for (let i = 0; i < 50; i++) {
    // Add sandwich every 10 transactions
    if (i % 10 === 5) {
      const attackerAddr = `0xBOT_ARMY_${Math.floor(i/10)}_${'0'.repeat(24)}`.substring(0, 42).toLowerCase();
      const victimAddr = `0xVICTIM_${i}_${'0'.repeat(30)}`.substring(0, 42).toLowerCase();
      
      // Frontrun
      feedingFrenzy.transactions.push({
        txHash: `0xFRONT_FRENZY_${i}_${'0'.repeat(44)}`,
        from: attackerAddr,
        gasPriceGwei: 120 + Math.random() * 50,
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'SHIB', address: TOKENS.SHIB.toLowerCase(), decimals: 18 },
        amountIn: (2 + Math.random() * 3).toFixed(2),
        direction: 'buy',
        pair: 'SHIB-WETH',
        timestamp: baseTime + (i * 1200),
        isSuspicious: true
      });
      
      // Victim
      feedingFrenzy.transactions.push({
        txHash: `0xVICTIM_FRENZY_${i}_${'0'.repeat(42)}`,
        from: victimAddr,
        gasPriceGwei: 35 + Math.random() * 15,
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'SHIB', address: TOKENS.SHIB.toLowerCase(), decimals: 18 },
        amountIn: (1 + Math.random() * 2).toFixed(2),
        direction: 'buy',
        pair: 'SHIB-WETH',
        timestamp: baseTime + (i * 1200) + 200,
        isSuspicious: false
      });
      
      // Backrun
      feedingFrenzy.transactions.push({
        txHash: `0xBACK_FRENZY_${i}_${'0'.repeat(45)}`,
        from: attackerAddr,
        gasPriceGwei: 118 + Math.random() * 50,
        method: 'swapExactTokensForETH',
        tokenIn: { symbol: 'SHIB', address: TOKENS.SHIB.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        amountIn: '1000000000000000000',
        direction: 'sell',
        pair: 'SHIB-WETH',
        timestamp: baseTime + (i * 1200) + 400,
        isSuspicious: true
      });
    } else {
      // High activity normal transaction
      feedingFrenzy.transactions.push({
        txHash: `0xFRENZY_${i}_${'0'.repeat(50)}`,
        from: `0xTRADER_${i}_${'0'.repeat(32)}`.substring(0, 42).toLowerCase(),
        gasPriceGwei: 40 + Math.random() * 80, // Very variable gas
        method: 'swapExactETHForTokens',
        tokenIn: { symbol: 'WETH', address: TOKENS.WETH.toLowerCase(), decimals: 18 },
        tokenOut: { symbol: 'SHIB', address: TOKENS.SHIB.toLowerCase(), decimals: 18 },
        amountIn: (Math.random() * 5).toFixed(2),
        direction: 'buy',
        pair: 'SHIB-WETH',
        timestamp: baseTime + (i * 1200),
        isSuspicious: Math.random() > 0.5  // 50% suspicious
      });
    }
  }
  
  // Write scenarios to files
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'calm-market.json'),
    JSON.stringify(calmMarket, null, 2)
  );
  
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'moderate-activity.json'),
    JSON.stringify(moderateActivity, null, 2)
  );
  
  fs.writeFileSync(
    path.join(CONFIG.DATA_DIR, 'feeding-frenzy.json'),
    JSON.stringify(feedingFrenzy, null, 2)
  );
  
  console.log('   ✓ Created: calm-market.json');
  console.log('   ✓ Created: moderate-activity.json');
  console.log('   ✓ Created: feeding-frenzy.json');
}

// Start playing a scenario
function play(scenarioName = null) {
  // If no scenario specified, use first available
  if (!scenarioName) {
    scenarioName = Array.from(scenarios.keys())[0];
  }
  
  if (!scenarios.has(scenarioName)) {
    console.error(`    Scenario not found: ${scenarioName}`);
    console.log(`   Available scenarios: ${Array.from(scenarios.keys()).join(', ')}`);
    return false;
  }
  
  currentScenario = scenarios.get(scenarioName);
  currentIndex = 0;
  isPlaying = true;
  
  stats.currentScenario = scenarioName;
  stats.isPlaying = true;
  
  console.log(`\n Starting demo scenario: ${currentScenario.name}`);
  console.log(`   Description: ${currentScenario.description}`);
  console.log(`   Transactions: ${currentScenario.transactions.length}`);
  console.log(`   Duration: ${currentScenario.duration_seconds}s (at 1x speed)`);
  console.log(`   Playback speed: ${playbackSpeed}x`);
  console.log(`   Actual duration: ${Math.floor(currentScenario.duration_seconds / playbackSpeed)}s\n`);
  
  // Start replay
  scheduleNextTransaction();
  
  return true;
}

// Schedule the next transaction
function scheduleNextTransaction() {
  if (!isPlaying || !currentScenario) {
    return;
  }
  
  // Check if we've reached the end
  if (currentIndex >= currentScenario.transactions.length) {
    handleScenarioComplete();
    return;
  }
  
  const currentTx = currentScenario.transactions[currentIndex];
  const nextTx = currentScenario.transactions[currentIndex + 1];
  
  // Emit current transaction
  emitTransaction(currentTx);
  
  // Move to next
  currentIndex++;
  
  // If there's another transaction, schedule it
  if (nextTx) {
    // Calculate delay based on original timing
    const originalDelay = nextTx.timestamp - currentTx.timestamp;
    const adjustedDelay = originalDelay / playbackSpeed;
    
    replayTimeout = setTimeout(() => {
      scheduleNextTransaction();
    }, adjustedDelay);
  } else {
    // This was the last transaction
    setTimeout(() => {
      handleScenarioComplete();
    }, 1000);
  }
}

// Emit a transaction to the callback
function emitTransaction(tx) {
  stats.transactionsReplayed++;
  
  // Update timestamp to current time (for realistic display)
  const adjustedTx = {
    ...tx,
    timestamp: Date.now()
  };
  
  // Call the callback (same as live mode)
  if (onTransactionCallback) {
    onTransactionCallback(adjustedTx);
  }
}

// Handle scenario completion
function handleScenarioComplete() {
  console.log(`\n    Scenario "${currentScenario.name}" complete`);
  console.log(`   Transactions replayed: ${currentIndex}`);
  
  stats.loopsCompleted++;
  
  if (CONFIG.LOOP_ENABLED) {
    console.log(`    Looping in ${CONFIG.LOOP_PAUSE_MS / 1000}s...\n`);
    
    setTimeout(() => {
      currentIndex = 0;
      scheduleNextTransaction();
    }, CONFIG.LOOP_PAUSE_MS);
  } else {
    console.log('   Demo complete (loop disabled)\n');
    isPlaying = false;
    stats.isPlaying = false;
  }
}

// Pause playback
function pause() {
  if (!isPlaying) {
    return false;
  }
  
  isPlaying = false;
  stats.isPlaying = false;
  
  if (replayTimeout) {
    clearTimeout(replayTimeout);
    replayTimeout = null;
  }
  
  console.log(`     Demo paused at transaction ${currentIndex}/${currentScenario.transactions.length}`);
  
  return true;
}

// Resume playback
function resume() {
  if (isPlaying || !currentScenario) {
    return false;
  }
  
  isPlaying = true;
  stats.isPlaying = true;
  
  console.log(`     Demo resumed from transaction ${currentIndex}/${currentScenario.transactions.length}`);
  
  scheduleNextTransaction();
  
  return true;
}

// Stop playback
function stop() {
  if (replayTimeout) {
    clearTimeout(replayTimeout);
    replayTimeout = null;
  }
  
  isPlaying = false;
  currentIndex = 0;
  currentScenario = null;
  
  stats.isPlaying = false;
  stats.currentScenario = null;
  
  console.log('     Demo stopped');
  
  return true;
}

// Set playback speed
function setSpeed(speed) {
  if (typeof speed !== 'number' || speed <= 0) {
    return false;
  }
  
  playbackSpeed = speed;
  console.log(`    Playback speed: ${speed}x`);
  
  stats.playbackSpeed = speed;
  
  return true;
}

// List available scenarios
function listScenarios() {
  return Array.from(scenarios.entries()).map(([name, data]) => ({
    name: name,
    displayName: data.name,
    description: data.description,
    pair: data.pair,
    transactionCount: data.transactions.length,
    duration: data.duration_seconds
  }));
}

// Get current stats
function getStats() {
  return {
    ...stats,
    availableScenarios: scenarios.size,
    currentProgress: currentScenario 
      ? `${currentIndex}/${currentScenario.transactions.length}`
      : 'N/A'
  };
}

// Shutdown demo mode
function shutdown() {
  console.log('🎬 Shutting down demo mode...');
  
  stop();
  
  console.log('   Demo mode shut down');
}

// Exports
module.exports = {
  initialize,
  play,
  pause,
  resume,
  stop,
  setSpeed,
  listScenarios,
  getStats,
  shutdown,
  // Export config for testing
  CONFIG
};