// scripts/capture-one-pair.js
// Capture data for a specific token pair

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import your existing modules
const { config, logConfig } = require('../src/config');
const mempoolListener = require('../src/mempool-listener');

// --------------------------------------------------
// CONFIGURATION - Adjust these for testing
// --------------------------------------------------
const TARGET_PAIR = null; // Set to null to capture ALL pairs, or 'PEPE-WETH' for specific

const CAPTURE_CONFIG = {
    outputDir: path.join(__dirname, '../demo-data/captured'),
    minTransactions: 1,        // Low minimum for testing
    maxTransactions: 100,
    captureDurationMinutes: 10,
    targetPair: TARGET_PAIR,
    autoSaveIntervalSeconds: 60
};

// --------------------------------------------------
// State
// --------------------------------------------------
let capturedTransactions = [];
let captureStartTime = null;
let autoSaveInterval = null;
let pairStats = new Map();
let totalReceived = 0;  // Track ALL transactions received
let totalFiltered = 0;  // Track filtered out transactions

// --------------------------------------------------
// Initialize
// --------------------------------------------------
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
  
  console.log(' Capture Settings:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Target pair:      ${CAPTURE_CONFIG.targetPair || 'ALL PAIRS (no filter)'}`);
  console.log(`   Min transactions: ${CAPTURE_CONFIG.minTransactions}`);
  console.log(`   Max transactions: ${CAPTURE_CONFIG.maxTransactions}`);
  console.log(`   Max duration:     ${CAPTURE_CONFIG.captureDurationMinutes} minutes`);
  console.log(`   Auto-save every:  ${CAPTURE_CONFIG.autoSaveIntervalSeconds}s`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  console.log(' Starting capture...');
  console.log(' Press Ctrl+C to stop and save\n');
  
  captureStartTime = Date.now();
  
  // Start auto-save
  autoSaveInterval = setInterval(autoSave, CAPTURE_CONFIG.autoSaveIntervalSeconds * 1000);
  
  // Start mempool listener with our handler
  try {
    await mempoolListener.initialize(handleTransaction);
    console.log(' ✅ Mempool listener initialized successfully\n');
  } catch (error) {
    console.error(' ❌ Failed to initialize mempool listener:', error.message);
    process.exit(1);
  }
  
  // Set max duration timeout
  setTimeout(() => {
    console.log(`\n\n⏰ Max capture duration (${CAPTURE_CONFIG.captureDurationMinutes} minutes) reached`);
    stopAndSave();
  }, CAPTURE_CONFIG.captureDurationMinutes * 60 * 1000);
}

// --------------------------------------------------
// Handle incoming transaction
// --------------------------------------------------
function handleTransaction(tx) {
  totalReceived++;
  
  // Debug: Log what we're receiving (first 10 transactions)
  if (totalReceived <= 10) {
    console.log(`\n   [DEBUG #${totalReceived}] Transaction received:`);
    console.log(`      Hash: ${tx.txHash?.slice(0, 16)}...`);
    console.log(`      Pair: "${tx.pair}"`);
    console.log(`      Type: ${tx.type}`);
    console.log(`      Tokens: ${tx.tokenInSymbol} → ${tx.tokenOutSymbol}`);
  }
  
  // Filter by pair if specified
  if (CAPTURE_CONFIG.targetPair) {
    // Normalize comparison (handle both "PEPE-WETH" and "WETH-PEPE")
    const targetNormalized = CAPTURE_CONFIG.targetPair.toLowerCase();
    const pairNormalized = (tx.pair || '').toLowerCase();
    const pairReversed = (tx.pair || '').split('-').reverse().join('-').toLowerCase();
    
    if (pairNormalized !== targetNormalized && pairReversed !== targetNormalized) {
      totalFiltered++;
      if (totalFiltered <= 5) {
        console.log(`   [FILTERED] Skipped pair "${tx.pair}" (target: "${CAPTURE_CONFIG.targetPair}")`);
      }
      return;
    }
  }
  
  // Validate transaction has required fields
  if (!tx.txHash || !tx.pair) {
    console.log(`   [WARN] Transaction missing required fields:`, tx);
    return;
  }
  
  // Add timestamp if missing
  if (!tx.timestamp) {
    tx.timestamp = Date.now();
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
  
  // Log progress
  const elapsed = Math.floor((Date.now() - captureStartTime) / 1000);
  process.stdout.write(`\r   📊 Captured: ${capturedTransactions.length} | Received: ${totalReceived} | Filtered: ${totalFiltered} | Pairs: ${pairStats.size} | ${elapsed}s elapsed   `);
  
  // Auto-stop if max reached
  if (capturedTransactions.length >= CAPTURE_CONFIG.maxTransactions) {
    console.log(`\n\n✅ Max transactions (${CAPTURE_CONFIG.maxTransactions}) reached`);
    stopAndSave();
  }
}

// --------------------------------------------------
// Auto-save progress
// --------------------------------------------------
function autoSave() {
  if (capturedTransactions.length === 0) {
    console.log(`\n   [Auto-save] No transactions to save yet...`);
    return;
  }
  
  const filename = generateFilename('autosave');
  const filepath = path.join(CAPTURE_CONFIG.outputDir, filename);
  
  const data = buildScenarioData('Auto-save', 'Automatic checkpoint save', 'unknown');
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  console.log(`\n   💾 Auto-saved ${capturedTransactions.length} transactions to ${filename}`);
}

// --------------------------------------------------
// Stop capture and save
// --------------------------------------------------
async function stopAndSave() {
  console.log('\n\n🛑 Stopping capture...\n');
  
  // Stop auto-save
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
  
  // Stop listener
  try {
    await mempoolListener.shutdown();
  } catch (error) {
    console.log(`   Warning: Error during shutdown: ${error.message}`);
  }
  
  // Display debug info
  console.log(' Debug Summary:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Total transactions received: ${totalReceived}`);
  console.log(`   Transactions filtered out:   ${totalFiltered}`);
  console.log(`   Transactions captured:       ${capturedTransactions.length}`);
  console.log(`   Unique pairs seen:           ${pairStats.size}`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  // Check if we have enough data
  if (capturedTransactions.length < CAPTURE_CONFIG.minTransactions) {
    console.log(`⚠️  Only captured ${capturedTransactions.length} transactions (minimum: ${CAPTURE_CONFIG.minTransactions})`);
    
    if (totalReceived === 0) {
      console.log('\n   🔍 No transactions were received at all!');
      console.log('   Possible causes:');
      console.log('   1. Alchemy API key is invalid or rate-limited');
      console.log('   2. WebSocket connection failed');
      console.log('   3. No Uniswap transactions happening (unlikely)\n');
    } else if (totalFiltered > 0) {
      console.log(`\n   🔍 Received ${totalReceived} transactions but filtered out ${totalFiltered}`);
      console.log(`   The pair format might not match. Pairs seen:`);
      pairStats.forEach((stats, pair) => {
        console.log(`      - "${pair}": ${stats.count} txs`);
      });
      console.log('\n   Try setting TARGET_PAIR to one of these values, or set to null to capture all.\n');
    }
    
    console.log('   File not saved. Adjust settings and try again.\n');
    process.exit(0);
    return;
  }
  
  // Display summary
  displaySummary();
  
  // Ask user for scenario details
  await promptForScenarioDetails();
}

// --------------------------------------------------
// Display capture summary
// --------------------------------------------------
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
  
  sortedPairs.slice(0, 10).forEach(([pair, stats]) => {
    const avgGas = stats.count > 0 ? stats.totalGas / stats.count : 0;
    console.log(`   ├─ ${pair}: ${stats.count} txs, ${stats.suspicious} suspicious, avg ${avgGas.toFixed(1)} gwei`);
  });
  
  if (sortedPairs.length > 10) {
    console.log(`   └─ ... and ${sortedPairs.length - 10} more pairs`);
  }
  
  console.log('────────────────────────────────────────────────────────────\n');
}

// --------------------------------------------------
// Prompt user for scenario details
// --------------------------------------------------
async function promptForScenarioDetails() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
  
  console.log('📝 Scenario Details:\n');
  
  // Suggest defaults based on captured data
  const topPair = Array.from(pairStats.entries())
    .sort((a, b) => b[1].count - a[1].count)[0];
  const suggestedName = topPair ? `${topPair[0].toLowerCase()}-capture` : 'mempool-capture';
  
  const name = await question(`   Scenario name (default: "${suggestedName}"): `) || suggestedName;
  const description = await question('   Description (e.g., "Heavy trading with bots"): ') || 'Live mempool capture';
  const riskLevel = await question('   Risk level (calm/moderate/high/severe) [moderate]: ') || 'moderate';
  
  rl.close();
  
  // Save the file
  saveScenarioFile(name, description, riskLevel);
}

// --------------------------------------------------
// Build scenario data structure
// --------------------------------------------------
function buildScenarioData(name = 'Captured Data', description = 'Live mempool capture', riskLevel = 'moderate') {
  const duration = Math.floor((Date.now() - captureStartTime) / 1000);
  
  // Determine primary pair
  let primaryPair = 'MIXED';
  if (pairStats.size > 0) {
    const topPair = Array.from(pairStats.entries())
      .sort((a, b) => b[1].count - a[1].count)[0];
    primaryPair = topPair[0];
  }
  
  // Normalize timestamps (make them relative to first transaction)
  let normalizedTransactions = capturedTransactions;
  if (capturedTransactions.length > 0) {
    const firstTxTime = capturedTransactions[0].timestamp;
    normalizedTransactions = capturedTransactions.map((tx, index) => ({
      ...tx,
      // Calculate relative time in milliseconds from start
      relativeTime: tx.timestamp - firstTxTime,
      // Keep original timestamp too
      originalTimestamp: tx.timestamp
    }));
  }
  
  return {
    name: name,
    displayName: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: description,
    risk_level: riskLevel,
    pair: primaryPair,
    duration_seconds: duration,
    transaction_count: capturedTransactions.length,
    pairs_count: pairStats.size,
    captured_at: new Date().toISOString(),
    capture_config: {
      targetPair: CAPTURE_CONFIG.targetPair,
      minTransactions: CAPTURE_CONFIG.minTransactions,
      maxTransactions: CAPTURE_CONFIG.maxTransactions
    },
    transactions: normalizedTransactions
  };
}

// --------------------------------------------------
// Save scenario file
// --------------------------------------------------
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
  
  console.log('📋 To use this scenario:');
  console.log(`   1. Move file: mv ${filepath} ../demo-data/${filename}`);
  console.log('   2. Set DEMO_MODE=true in .env');
  console.log('   3. Run: node src/index.js');
  console.log('   4. Use demo controls to play this scenario\n');
  
  process.exit(0);
}

// --------------------------------------------------
// Generate filename
// --------------------------------------------------
function generateFilename(prefix = 'capture') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.json`;
}

// --------------------------------------------------
// Handle shutdown signals
// --------------------------------------------------
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Caught interrupt signal (Ctrl+C)');
  stopAndSave();
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Caught terminate signal');
  stopAndSave();
});

// --------------------------------------------------
// Start capture
// --------------------------------------------------
startCapture().catch((error) => {
  console.error('\n❌ Capture failed:', error);
  console.error(error.stack);
  process.exit(1);
});