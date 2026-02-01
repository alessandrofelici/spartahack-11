// Captures real mempool data and saves it for demo use

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import your existing modules
const { config, logConfig } = require('../src/config');
const mempoolListener = require('../src/mempool-listener');

// ============================================================
// SCENARIO PRESETS - Edit ACTIVE_PRESET to switch scenarios
// ============================================================
const ACTIVE_PRESET = 'PEPE_MODERATE'; // <-- CHANGE THIS

const PRESETS = {
  // === CALM SCENARIOS ===
  WBTC_CALM: {
    name: 'wbtc-calm-trading',
    description: 'Blue chip WBTC trading - stable and predictable',
    targetPair: 'WBTC-WETH',
    minTransactions: 5,
    maxTransactions: 50,
    captureDurationMinutes: 15,
    expectedRisk: 'calm'
  },
  USDC_CALM: {
    name: 'usdc-stablecoin-swap',
    description: 'Stablecoin swaps - low volatility trading',
    targetPair: 'USDC-WETH',
    minTransactions: 5,
    maxTransactions: 40,
    captureDurationMinutes: 10,
    expectedRisk: 'calm'
  },
  LINK_CALM: {
    name: 'link-quiet-trading',
    description: 'Chainlink trading - established token activity',
    targetPair: 'LINK-WETH',
    minTransactions: 5,
    maxTransactions: 45,
    captureDurationMinutes: 15,
    expectedRisk: 'calm'
  },
  
  // === MODERATE SCENARIOS ===
  PEPE_MODERATE: {
    name: 'pepe-active-trading',
    description: 'PEPE memecoin - active trading with some bots',
    targetPair: 'PEPE-WETH',
    minTransactions: 5,
    maxTransactions: 80,
    captureDurationMinutes: 10,
    expectedRisk: 'moderate'
  },
  UNI_MODERATE: {
    name: 'uni-defi-activity',
    description: 'Uniswap token - DeFi trading patterns',
    targetPair: 'UNI-WETH',
    minTransactions: 5,
    maxTransactions: 70,
    captureDurationMinutes: 12,
    expectedRisk: 'moderate'
  },
  SHIB_MODERATE: {
    name: 'shib-trending',
    description: 'Shiba Inu - trending meme with variable activity',
    targetPair: 'SHIB-WETH',
    minTransactions: 5,
    maxTransactions: 80,
    captureDurationMinutes: 10,
    expectedRisk: 'moderate'
  },
  
  // === HIGH/SEVERE SCENARIOS ===
  TURBO_HIGH: {
    name: 'turbo-volatile',
    description: 'TURBO memecoin - high volatility and bot wars',
    targetPair: 'TURBO-WETH',
    minTransactions: 5,
    maxTransactions: 100,
    captureDurationMinutes: 8,
    expectedRisk: 'high'
  },
  WOJAK_SEVERE: {
    name: 'wojak-gas-wars',
    description: 'WOJAK trading - intense MEV bot competition',
    targetPair: 'WOJAK-WETH',
    minTransactions: 5,
    maxTransactions: 100,
    captureDurationMinutes: 8,
    expectedRisk: 'severe'
  },
  ALL_SEVERE: {
    name: 'mempool-chaos',
    description: 'All pairs - chaotic mempool snapshot',
    targetPair: null, // Capture ALL pairs
    minTransactions: 1,
    maxTransactions: 100,
    captureDurationMinutes: 5,
    expectedRisk: 'severe'
  }
};

// Get active preset
const ACTIVE = PRESETS[ACTIVE_PRESET];
if (!ACTIVE) {
  console.error(`Unknown preset: ${ACTIVE_PRESET}`);
  console.error(`Available presets: ${Object.keys(PRESETS).join(', ')}`);
  process.exit(1);
}

// Configuration from preset
const CAPTURE_CONFIG = {
  outputDir: path.join(__dirname, '../demo-data/captured'),
  targetPair: ACTIVE.targetPair,
  minTransactions: ACTIVE.minTransactions,
  maxTransactions: ACTIVE.maxTransactions,
  captureDurationMinutes: ACTIVE.captureDurationMinutes,
  autoSaveIntervalSeconds: 60,
  // Metadata from preset
  presetName: ACTIVE.name,
  presetDescription: ACTIVE.description,
  expectedRisk: ACTIVE.expectedRisk
};

// State
let capturedTransactions = [];
let captureStartTime = null;
let autoSaveInterval = null;
let pairStats = new Map();

// Debug counters
let totalReceived = 0;
let totalFiltered = 0;

// Initialize
async function startCapture() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║              MEV WEATHER - DATA CAPTURE                   ║');
  console.log('║          Saving Real Mempool Data for Demos               ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  logConfig();
  
  // Create output directory
  if (!fs.existsSync(CAPTURE_CONFIG.outputDir)) {
    fs.mkdirSync(CAPTURE_CONFIG.outputDir, { recursive: true });
    console.log(`   Created output directory: ${CAPTURE_CONFIG.outputDir}\n`);
  }
  
  console.log(' 📋 Active Preset: ' + ACTIVE_PRESET);
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Scenario name:    ${CAPTURE_CONFIG.presetName}`);
  console.log(`   Description:      ${CAPTURE_CONFIG.presetDescription}`);
  console.log(`   Expected risk:    ${CAPTURE_CONFIG.expectedRisk.toUpperCase()}`);
  console.log(`   Target pair:      ${CAPTURE_CONFIG.targetPair || 'ALL PAIRS (no filter)'}`);
  console.log(`   Max transactions: ${CAPTURE_CONFIG.maxTransactions}`);
  console.log(`   Max duration:     ${CAPTURE_CONFIG.captureDurationMinutes} minutes`);
  console.log(`   Auto-save every:  ${CAPTURE_CONFIG.autoSaveIntervalSeconds}s`);
  console.log('────────────────────────────────────────────────────────────');
  console.log('   💡 Press Ctrl+C anytime to stop and save (even with 1 tx)');
  console.log('────────────────────────────────────────────────────────────\n');
  
  console.log(' 🚀 Starting capture...\n');
  
  captureStartTime = Date.now();
  
  // Start auto-save
  autoSaveInterval = setInterval(autoSave, CAPTURE_CONFIG.autoSaveIntervalSeconds * 1000);
  
  // Start mempool listener
  await mempoolListener.initialize(handleTransaction);
  
  console.log('\n ✅ Mempool listener initialized successfully\n');
  
  // Set max duration timeout
  setTimeout(() => {
    console.log(`\n⏰ Max capture duration (${CAPTURE_CONFIG.captureDurationMinutes} minutes) reached`);
    stopAndSave();
  }, CAPTURE_CONFIG.captureDurationMinutes * 60 * 1000);
}

// Handle incoming transaction
function handleTransaction(tx) {
  totalReceived++;
  
  // Filter by pair if specified
  if (CAPTURE_CONFIG.targetPair && tx.pair !== CAPTURE_CONFIG.targetPair) {
    totalFiltered++;
    return;
  }
  
  // Add to captured transactions
  capturedTransactions.push(tx);
  
  // Update pair stats
  if (!pairStats.has(tx.pair)) {
    pairStats.set(tx.pair, {
      count: 0,
      suspicious: 0,
      totalGas: 0
    });
  }
  
  const stats = pairStats.get(tx.pair);
  stats.count++;
  stats.totalGas += tx.gasPriceGwei || 0;
  if (tx.isSuspicious) {
    stats.suspicious++;
  }
  
  // Log the transaction
  const direction = tx.direction === 'buy' ? '->' : '<-';
  const susFlag = tx.isSuspicious ? '🚨' : '  ';
  console.log(`${susFlag}📊 ${tx.from.slice(0, 8)}...${tx.direction} ${tx.amountIn} ${tx.tokenIn?.symbol || '???'} ${direction} ${tx.tokenOut?.symbol || '???'} (${tx.gasPriceGwei?.toFixed(1) || '?'} gwei)`);
  
  // Log progress
  const elapsed = Math.floor((Date.now() - captureStartTime) / 1000);
  console.log(`   📊 Captured: ${capturedTransactions.length} | Received: ${totalReceived} | Filtered: ${totalFiltered} | Pairs: ${pairStats.size} | ${elapsed}s elapsed`);
  
  // Auto-stop if max reached
  if (capturedTransactions.length >= CAPTURE_CONFIG.maxTransactions) {
    console.log(`\n\n✅ Max transactions (${CAPTURE_CONFIG.maxTransactions}) reached`);
    stopAndSave();
  }
}

// Auto-save progress
function autoSave() {
  if (capturedTransactions.length === 0) {
    console.log('\n   [Auto-save] No transactions to save yet...');
    return;
  }
  
  const filename = generateFilename('autosave');
  const filepath = path.join(CAPTURE_CONFIG.outputDir, filename);
  
  const data = buildScenarioData(
    CAPTURE_CONFIG.presetName + '-autosave',
    CAPTURE_CONFIG.presetDescription,
    CAPTURE_CONFIG.expectedRisk
  );
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  console.log(`\n   💾 Auto-saved ${capturedTransactions.length} transactions to ${filename}`);
}

// Stop capture and save
async function stopAndSave() {
  console.log('\n\n🛑 Stopping capture...\n');
  
  // Stop auto-save
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  // Stop listener
  console.log('🛑 Shutting down mempool listener...');
  await mempoolListener.shutdown();
  
  // Debug summary
  console.log(' Debug Summary:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Total transactions received: ${totalReceived}`);
  console.log(`   Transactions filtered out:   ${totalFiltered}`);
  console.log(`   Transactions captured:       ${capturedTransactions.length}`);
  console.log(`   Unique pairs seen:           ${pairStats.size}`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  // Check if we have ANY data
  if (capturedTransactions.length === 0) {
    console.log('⚠️  No transactions captured!');
    console.log('   Nothing to save. Try:');
    console.log('   - Using ALL_SEVERE preset (captures all pairs)');
    console.log('   - Waiting longer');
    console.log('   - Checking if the target pair is actively traded\n');
    process.exit(0);
    return;
  }
  
  // Display summary
  displaySummary();
  
  // Show warning if low count, but still save
  if (capturedTransactions.length < 10) {
    console.log('⚠️  Low transaction count - demo may be very short');
    console.log('   Consider capturing more data for a better demo.\n');
  }
  
  // Ask user for scenario details (with defaults from preset)
  await promptForScenarioDetails();
}

// Display capture summary
function displaySummary() {
  const duration = Math.floor((Date.now() - captureStartTime) / 1000);
  
  console.log('✅ Capture Summary:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Duration:        ${duration} seconds`);
  console.log(`   Transactions:    ${capturedTransactions.length}`);
  console.log(`   Unique pairs:    ${pairStats.size}`);
  console.log('');
  
  console.log('   Pairs captured:');
  const sortedPairs = Array.from(pairStats.entries())
    .sort((a, b) => b[1].count - a[1].count);
  
  sortedPairs.forEach(([pair, stats]) => {
    const avgGas = stats.count > 0 ? stats.totalGas / stats.count : 0;
    console.log(`   ├─ ${pair}: ${stats.count} txs, ${stats.suspicious} suspicious, avg ${avgGas.toFixed(1)} gwei`);
  });
  
  console.log('────────────────────────────────────────────────────────────\n');
}

// Prompt user for scenario details
async function promptForScenarioDetails() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt, defaultVal) => new Promise((resolve) => {
    const displayPrompt = defaultVal ? `${prompt} (default: "${defaultVal}"): ` : `${prompt}: `;
    rl.question(displayPrompt, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });
  
  console.log('📝 Scenario Details:\n');
  
  // Suggest defaults from preset
  const defaultName = CAPTURE_CONFIG.presetName;
  const defaultDesc = CAPTURE_CONFIG.presetDescription;
  const defaultRisk = CAPTURE_CONFIG.expectedRisk;
  
  const name = await question('   Scenario name', defaultName);
  const description = await question('   Description', defaultDesc);
  const riskLevel = await question(`   Risk level (calm/moderate/high/severe) [${defaultRisk}]`, defaultRisk);
  
  rl.close();
  
  // Save the file
  saveScenarioFile(name, description, riskLevel);
}

// Build scenario data structure
function buildScenarioData(name, description, riskLevel) {
  const duration = Math.floor((Date.now() - captureStartTime) / 1000);
  
  // Determine primary pair
  let primaryPair = 'MIXED';
  if (pairStats.size > 0) {
    const topPair = Array.from(pairStats.entries())
      .sort((a, b) => b[1].count - a[1].count)[0];
    primaryPair = topPair[0];
  }
  
  // Normalize timestamps (make relative from start)
  let normalizedTransactions = capturedTransactions;
  if (capturedTransactions.length > 0 && capturedTransactions[0].timestamp) {
    const firstTxTime = capturedTransactions[0].timestamp;
    normalizedTransactions = capturedTransactions.map((tx, index) => ({
      ...tx,
      // Store relative delay from previous tx
      relativeTime: index === 0 ? 0 : (tx.timestamp - capturedTransactions[index - 1].timestamp)
    }));
  }
  
  return {
    name: name,
    description: description,
    risk_level: riskLevel,
    pair: primaryPair,
    duration_seconds: duration,
    captured_at: new Date().toISOString(),
    preset_used: ACTIVE_PRESET,
    statistics: {
      total_transactions: capturedTransactions.length,
      unique_pairs: pairStats.size,
      suspicious_count: Array.from(pairStats.values()).reduce((sum, s) => sum + s.suspicious, 0),
      avg_gas_gwei: capturedTransactions.length > 0 
        ? capturedTransactions.reduce((sum, tx) => sum + (tx.gasPriceGwei || 0), 0) / capturedTransactions.length 
        : 0
    },
    transactions: normalizedTransactions
  };
}

// Save scenario file
function saveScenarioFile(name, description, riskLevel) {
  const data = buildScenarioData(name, description, riskLevel);
  
  // Generate filename from name
  const filename = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.json';
  const filepath = path.join(CAPTURE_CONFIG.outputDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  console.log('\n✅ Scenario saved!');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   File: ${filename}`);
  console.log(`   Location: ${filepath}`);
  console.log(`   Transactions: ${data.transactions.length}`);
  console.log(`   Pairs: ${pairStats.size}`);
  console.log(`   Risk Level: ${data.risk_level.toUpperCase()}`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  // Full path for easy copy
  const demoDataDir = path.join(__dirname, '../demo-data');
  
  console.log('📋 To use this scenario:');
  console.log(`   1. Move file: mv "${filepath}" "${demoDataDir}/${filename}"`);
  console.log('   2. Set DEMO_MODE=true in .env');
  console.log('   3. Run: node src/index.js');
  console.log('   4. Use demo controls to play this scenario\n');
  
  process.exit(0);
}

// Generate filename
function generateFilename(prefix = 'capture') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.json`;
}

// Handle shutdown
let isShuttingDown = false;

process.on('SIGINT', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\n⚠️  Caught interrupt signal (Ctrl+C)\n');
  stopAndSave();
});

process.on('SIGTERM', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  stopAndSave();
});

// Start capture
startCapture().catch((error) => {
  console.error('\n❌ Capture failed:', error);
  process.exit(1);
});