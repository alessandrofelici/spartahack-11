// Capture data for a specific token pair
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Import your existing modules
const { logConfig } = require('../src/config');
const mempoolListener = require('../src/mempool-listener');

// Set the pair you want
const TARGET_PAIR = 'PEPE-WETH'; // Change this

// Copy capture-live-data.js but modify:
const CAPTURE_CONFIG = {
    outputDir: path.join(__dirname, '../demo-data/captured'),
    minTransactions: 30,
    maxTransactions: 50,
    captureDurationMinutes: 15,
    targetPair: TARGET_PAIR,
    autoSaveIntervalSeconds: 60
};


// State
let capturedTransactions = [];
let captureStartTime = null;
let autoSaveInterval = null;
let pairStats = new Map();

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
  
  console.log(' Capture Settings:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Target pair:     ${CAPTURE_CONFIG.targetPair || 'ALL PAIRS'}`);
  console.log(`   Min transactions: ${CAPTURE_CONFIG.minTransactions}`);
  console.log(`   Max transactions: ${CAPTURE_CONFIG.maxTransactions}`);
  console.log(`   Max duration:     ${CAPTURE_CONFIG.captureDurationMinutes} minutes`);
  console.log(`   Auto-save every:  ${CAPTURE_CONFIG.autoSaveIntervalSeconds}s`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  console.log(' Starting capture...');
  console.log('Press Ctrl+C to stop and save\n');
  
  captureStartTime = Date.now();
  
  // Start auto-save
  autoSaveInterval = setInterval(autoSave, CAPTURE_CONFIG.autoSaveIntervalSeconds * 1000);
  
  // Start mempool listener
  await mempoolListener.initialize(handleTransaction);
  
  // Set max duration timeout
  setTimeout(() => {
    console.log(`\n Max capture duration (${CAPTURE_CONFIG.captureDurationMinutes} minutes) reached`);
    stopAndSave();
  }, CAPTURE_CONFIG.captureDurationMinutes * 60 * 1000);
}

// Handle incoming transaction
function handleTransaction(tx) {
  // Filter by pair if specified
  if (CAPTURE_CONFIG.targetPair && tx.pair !== CAPTURE_CONFIG.targetPair) {
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
  stats.totalGas += tx.gasPriceGwei;
  if (tx.isSuspicious) {
    stats.suspicious++;
  }
  
  // Log progress
  const elapsed = Math.floor((Date.now() - captureStartTime) / 1000);
  process.stdout.write(`\r    Captured: ${capturedTransactions.length} transactions | ${pairStats.size} pairs | ${elapsed}s elapsed`);
  
  // Auto-stop if max reached
  if (capturedTransactions.length >= CAPTURE_CONFIG.maxTransactions) {
    console.log(`\n\n Max transactions (${CAPTURE_CONFIG.maxTransactions}) reached`);
    stopAndSave();
  }
}

// Auto-save progress
function autoSave() {
  if (capturedTransactions.length === 0) {
    return;
  }
  
  const filename = generateFilename('autosave');
  const filepath = path.join(CAPTURE_CONFIG.outputDir, filename);
  
  const data = buildScenarioData();
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  
  console.log(`\n    Auto-saved ${capturedTransactions.length} transactions to ${filename}`);
}

// Stop capture and save
async function stopAndSave() {
  console.log('\n\n Stopping capture...\n');
  
  // Stop auto-save
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  // Stop listener
  await mempoolListener.shutdown();
  
  // Check if we have enough data
  if (capturedTransactions.length < CAPTURE_CONFIG.minTransactions) {
    console.log(`  Only captured ${capturedTransactions.length} transactions (minimum: ${CAPTURE_CONFIG.minTransactions})`);
    console.log('   File not saved. Run capture longer to get more data.\n');
    process.exit(0);
    return;
  }
  
  // Display summary
  displaySummary();
  
  // Ask user for scenario details
  await promptForScenarioDetails();
}

// Display capture summary
function displaySummary() {
  const duration = Math.floor((Date.now() - captureStartTime) / 1000);
  
  console.log(' Capture Summary:');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   Duration:        ${duration} seconds`);
  console.log(`   Transactions:    ${capturedTransactions.length}`);
  console.log(`   Unique pairs:    ${pairStats.size}`);
  console.log('');
  
  console.log('   Pairs captured:');
  const sortedPairs = Array.from(pairStats.entries())
    .sort((a, b) => b[1].count - a[1].count);
  
  sortedPairs.forEach(([pair, stats]) => {
    const avgGas = stats.totalGas / stats.count;
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
  
  const question = (prompt) => new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
  
  console.log(' Scenario Details:\n');
  
  const name = await question('   Scenario name (e.g., "high-activity-pepe"): ');
  const description = await question('   Description (e.g., "Heavy PEPE trading with bots"): ');
  const riskLevel = await question('   Risk level (calm/moderate/high/severe): ');
  
  rl.close();
  
  // Save the file
  saveScenarioFile(name, description, riskLevel);
}

// Build scenario data structure
function buildScenarioData(name = 'Captured Data', description = 'Live mempool capture', riskLevel = 'moderate') {
  const duration = Math.floor((Date.now() - captureStartTime) / 1000);
  
  // Determine primary pair
  let primaryPair = 'MIXED';
  if (pairStats.size > 0) {
    const topPair = Array.from(pairStats.entries())
      .sort((a, b) => b[1].count - a[1].count)[0];
    primaryPair = topPair[0];
  }
  
  // Normalize timestamps (make them relative)
  const firstTxTime = capturedTransactions[0].timestamp;
  const normalizedTransactions = capturedTransactions.map(tx => ({
    ...tx,
    timestamp: firstTxTime + (tx.timestamp - firstTxTime)
  }));
  
  return {
    name: name,
    description: description,
    risk_level: riskLevel,
    pair: primaryPair,
    duration_seconds: duration,
    captured_at: new Date().toISOString(),
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
  
  console.log('\n Scenario saved!');
  console.log('────────────────────────────────────────────────────────────');
  console.log(`   File: ${filename}`);
  console.log(`   Location: ${filepath}`);
  console.log(`   Transactions: ${data.transactions.length}`);
  console.log(`   Pairs: ${pairStats.size}`);
  console.log(`   Risk Level: ${data.risk_level.toUpperCase()}`);
  console.log('────────────────────────────────────────────────────────────\n');
  
  console.log(' To use this scenario:');
  console.log(`   1. Copy ${filename} to demo-data/`);
  console.log('   2. Set DEMO_MODE=true in .env');
  console.log('   3. Use demo controls to play this scenario\n');
  
  process.exit(0);
}

// Generate filename
function generateFilename(prefix = 'capture') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.json`;
}

// Handle shutdown
process.on('SIGINT', () => {
  stopAndSave();
});

process.on('SIGTERM', () => {
  stopAndSave();
});

// Start capture
startCapture().catch((error) => {
  console.error('\n Capture failed:', error);
  process.exit(1);
});