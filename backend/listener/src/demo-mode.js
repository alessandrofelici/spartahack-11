// ============================================================
// src/demo-mode.js
// Plays back recorded mempool data for demos
// ============================================================

const fs = require('fs');
const path = require('path');

// --------------------------------------------------
// State
// --------------------------------------------------
let scenarios = [];
let currentScenario = null;
let currentIndex = 0;
let playbackState = 'stopped'; // 'stopped', 'playing', 'paused'
let playbackSpeed = 1;
let playbackTimer = null;
let startTime = null;
let onTransactionCallback = null;

// --------------------------------------------------
// Initialize demo mode
// --------------------------------------------------
function initialize(onTransaction) {
  onTransactionCallback = onTransaction;
  
  // Load all scenario files from demo-data directory
  const demoDataDir = path.join(__dirname, '../demo-data');
  
  if (!fs.existsSync(demoDataDir)) {
    console.log(`   ⚠️  Demo data directory not found: ${demoDataDir}`);
    return false;
  }
  
  // Read all JSON files
  const files = fs.readdirSync(demoDataDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    try {
      const filepath = path.join(demoDataDir, file);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      scenarios.push({
        name: file.replace('.json', ''),
        displayName: data.name || file,
        description: data.description || 'No description',
        riskLevel: data.risk_level || 'moderate',
        pair: data.pair || 'UNKNOWN',
        duration: data.duration_seconds || 0,
        transactionCount: data.transactions ? data.transactions.length : 0,
        transactions: data.transactions || [],
        filepath: filepath
      });
      
      console.log(`   ✅ Loaded scenario: ${file} (${data.transactions?.length || 0} transactions)`);
    } catch (error) {
      console.log(`   ⚠️  Failed to load ${file}: ${error.message}`);
    }
  }
  
  // Also check captured directory
  const capturedDir = path.join(demoDataDir, 'captured');
  if (fs.existsSync(capturedDir)) {
    const capturedFiles = fs.readdirSync(capturedDir).filter(f => f.endsWith('.json') && !f.startsWith('autosave'));
    
    for (const file of capturedFiles) {
      try {
        const filepath = path.join(capturedDir, file);
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        scenarios.push({
          name: file.replace('.json', ''),
          displayName: data.name || file,
          description: data.description || 'Captured data',
          riskLevel: data.risk_level || 'moderate',
          pair: data.pair || 'UNKNOWN',
          duration: data.duration_seconds || 0,
          transactionCount: data.transactions ? data.transactions.length : 0,
          transactions: data.transactions || [],
          filepath: filepath
        });
        
        console.log(`   ✅ Loaded captured scenario: ${file} (${data.transactions?.length || 0} transactions)`);
      } catch (error) {
        console.log(`   ⚠️  Failed to load captured ${file}: ${error.message}`);
      }
    }
  }
  
  if (scenarios.length > 0) {
    // Load first scenario by default
    currentScenario = scenarios[0];
    console.log(`   📂 Default scenario: ${currentScenario.name}`);
  }
  
  return scenarios.length > 0;
}

// --------------------------------------------------
// List available scenarios
// --------------------------------------------------
function listScenarios() {
  return scenarios.map(s => ({
    name: s.name,
    displayName: s.displayName,
    description: s.description,
    riskLevel: s.riskLevel,
    pair: s.pair,
    duration: s.duration,
    transactionCount: s.transactionCount
  }));
}

// --------------------------------------------------
// Load a specific scenario
// --------------------------------------------------
function loadScenario(name) {
  const scenario = scenarios.find(s => 
    s.name.toLowerCase() === name.toLowerCase() ||
    s.name.toLowerCase().includes(name.toLowerCase())
  );
  
  if (scenario) {
    // Stop current playback
    stop();
    currentScenario = scenario;
    return true;
  }
  
  return false;
}

// --------------------------------------------------
// Play/Resume playback
// --------------------------------------------------
function play() {
  if (!currentScenario || currentScenario.transactions.length === 0) {
    console.log('   ⚠️  No scenario loaded or scenario is empty');
    return false;
  }
  
  if (playbackState === 'playing') {
    return true; // Already playing
  }
  
  playbackState = 'playing';
  
  if (currentIndex === 0) {
    startTime = Date.now();
  }
  
  scheduleNextTransaction();
  return true;
}

// --------------------------------------------------
// Pause playback
// --------------------------------------------------
function pause() {
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  playbackState = 'paused';
}

// --------------------------------------------------
// Stop and reset playback
// --------------------------------------------------
function stop() {
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
  playbackState = 'stopped';
  currentIndex = 0;
  startTime = null;
}

// --------------------------------------------------
// Set playback speed
// --------------------------------------------------
function setSpeed(speed) {
  playbackSpeed = Math.max(0.1, Math.min(10, speed));
}

// --------------------------------------------------
// Get current status
// --------------------------------------------------
function getStatus() {
  return {
    state: playbackState,
    currentScenario: currentScenario ? currentScenario.name : null,
    currentIndex: currentIndex,
    totalTransactions: currentScenario ? currentScenario.transactions.length : 0,
    speed: playbackSpeed,
    elapsed: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  };
}

// --------------------------------------------------
// Schedule next transaction
// --------------------------------------------------
function scheduleNextTransaction() {
  if (playbackState !== 'playing' || !currentScenario) {
    return;
  }
  
  if (currentIndex >= currentScenario.transactions.length) {
    // Finished - loop back
    console.log(`\n   🔄 Scenario "${currentScenario.name}" completed. Looping...`);
    currentIndex = 0;
    startTime = Date.now();
  }
  
  const tx = currentScenario.transactions[currentIndex];
  
  // Calculate delay until next transaction
  let delay = 100; // Default 100ms between transactions
  
  if (currentIndex < currentScenario.transactions.length - 1) {
    const nextTx = currentScenario.transactions[currentIndex + 1];
    if (tx.timestamp && nextTx.timestamp) {
      delay = Math.max(10, (nextTx.timestamp - tx.timestamp) / playbackSpeed);
    }
  }
  
  // Cap delay to reasonable maximum
  delay = Math.min(delay, 5000 / playbackSpeed);
  
  playbackTimer = setTimeout(() => {
    // Emit the transaction
    if (onTransactionCallback) {
      // Update timestamp to current time
      const emittedTx = {
        ...tx,
        timestamp: Date.now()
      };
      onTransactionCallback(emittedTx);
    }
    
    currentIndex++;
    scheduleNextTransaction();
  }, delay);
}

// --------------------------------------------------
// Shutdown
// --------------------------------------------------
function shutdown() {
  stop();
  scenarios = [];
  currentScenario = null;
  onTransactionCallback = null;
}

// --------------------------------------------------
// Exports
// --------------------------------------------------
module.exports = {
  initialize,
  listScenarios,
  loadScenario,
  play,
  pause,
  stop,
  setSpeed,
  getStatus,
  shutdown
};