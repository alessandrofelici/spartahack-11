// ============================================================
// src/index.js
// Main entry point - initializes and connects all components
// ============================================================

const { config, logConfig } = require('./config');
const mempoolListener = require('./mempool-listener');
const pairAggregator = require('./pair-aggregator');
const webSocketServer = require('./websocket-server');
const demoMode = require('./demo-mode');
const readline = require('readline');

// --------------------------------------------------
// Application state
// --------------------------------------------------
let isShuttingDown = false;
let rl = null;

// --------------------------------------------------
// Main initialization function
// --------------------------------------------------
async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║              🌦️  MEV WEATHER - LISTENER SERVICE           ║');
  console.log('║                                                           ║');
  console.log('║          Real-time Mempool Monitoring & Analysis          ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  // Log configuration (with sensitive data masked)
  logConfig();
  
  try {
    // --------------------------------------------------
    // Step 1: Initialize Pair Aggregator
    // Must be first - it receives transactions from listener/demo
    // and sends updates to WebSocket server
    // --------------------------------------------------
    console.log('📊 Step 1/4: Initializing pair aggregator...');
    pairAggregator.initialize(
      // Callback: When pair stats update, broadcast to WebSocket clients
      (pairStats) => {
        webSocketServer.broadcastPairUpdate(pairStats);
      },
      // Callback: When sandwich detected, broadcast alert
      (sandwich) => {
        webSocketServer.broadcastSandwichAlert(sandwich);
      }
    );
    
    // --------------------------------------------------
    // Step 2: Initialize WebSocket Server
    // Needs aggregator reference for HTTP API endpoints
    // --------------------------------------------------
    console.log('🌐 Step 2/4: Initializing WebSocket server...');
    webSocketServer.initialize(pairAggregator);
    
    // --------------------------------------------------
    // Step 3: Initialize Data Source (Live or Demo)
    // --------------------------------------------------
    if (config.features.demoMode) {
      // Demo Mode: Use pre-recorded data
      console.log('🎬 Step 3/4: Initializing demo mode...');
      
      const hasScenarios = demoMode.initialize(
        // Callback: Feed demo transactions to aggregator
        (tx) => {
          pairAggregator.processTransaction(tx);
        }
      );
      
      if (hasScenarios) {
        // List available scenarios
        const scenarios = demoMode.listScenarios();
        console.log('\n   Available demo scenarios:');
        scenarios.forEach((s, i) => {
          console.log(`   ${i + 1}. ${s.name} (${s.displayName})`);
          console.log(`      └─ ${s.description}`);
          console.log(`      └─ Pair: ${s.pair}, Txs: ${s.transactionCount}, Duration: ${s.duration}s`);
        });
        
        // DON'T auto-start - wait for user input
        console.log('\n   Demo mode ready. Use commands below to control playback.');
      } else {
        console.log('   ⚠️  No demo scenarios found. Create JSON files in demo-data/');
      }
      
    } else {
      // Live Mode: Connect to Ethereum mempool
      console.log('🔌 Step 3/4: Initializing mempool listener (live mode)...');
      
      await mempoolListener.initialize(
        // Callback: Send decoded transactions to aggregator
        (tx) => {
          pairAggregator.processTransaction(tx);
        }
      );
    }
    
    // --------------------------------------------------
    // Step 4: Setup complete
    // --------------------------------------------------
    console.log('\n✅ Step 4/4: All systems initialized!\n');
    
    // Print status summary
    printStatusSummary();
    
    // Broadcast initial pairs list to any connected clients
    setTimeout(() => {
      webSocketServer.broadcastPairsList();
    }, 1000);
    
    // Start interactive controls if in demo mode
    if (config.features.demoMode) {
      startInteractiveControls();
    }
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// --------------------------------------------------
// Interactive demo controls
// --------------------------------------------------
function startInteractiveControls() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  printDemoHelp();
  promptCommand();
}

function printDemoHelp() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    DEMO CONTROLS                          ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Commands:                                                ║');
  console.log('║    play [scenario]  - Start/resume playback              ║');
  console.log('║    pause            - Pause playback                      ║');
  console.log('║    stop             - Stop and reset playback             ║');
  console.log('║    list             - List available scenarios            ║');
  console.log('║    load <name>      - Load a specific scenario            ║');
  console.log('║    speed <1-10>     - Set playback speed                  ║');
  console.log('║    status           - Show current status                 ║');
  console.log('║    stats            - Show aggregator statistics          ║');
  console.log('║    help             - Show this help                      ║');
  console.log('║    quit             - Exit the application                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
}

function promptCommand() {
  if (rl && !isShuttingDown) {
    rl.question('demo> ', (input) => {
      handleCommand(input.trim());
    });
  }
}

function handleCommand(input) {
  if (!input) {
    promptCommand();
    return;
  }
  
  const parts = input.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  switch (command) {
    case 'play':
      if (args[0]) {
        // Load and play specific scenario
        const loaded = demoMode.loadScenario(args[0]);
        if (loaded) {
          console.log(`   ✅ Loaded scenario: ${args[0]}`);
          demoMode.play();
          console.log('   ▶️  Playback started');
        } else {
          console.log(`   ❌ Scenario not found: ${args[0]}`);
        }
      } else {
        demoMode.play();
        console.log('   ▶️  Playback started/resumed');
      }
      break;
      
    case 'pause':
      demoMode.pause();
      console.log('   ⏸️  Playback paused');
      break;
      
    case 'stop':
      demoMode.stop();
      console.log('   ⏹️  Playback stopped and reset');
      break;
      
    case 'list':
      const scenarios = demoMode.listScenarios();
      console.log('\n   Available scenarios:');
      scenarios.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name}`);
        console.log(`      └─ ${s.description}`);
        console.log(`      └─ Pair: ${s.pair}, Txs: ${s.transactionCount}`);
      });
      console.log('');
      break;
      
    case 'load':
      if (!args[0]) {
        console.log('   ❌ Usage: load <scenario-name>');
      } else {
        const loaded = demoMode.loadScenario(args[0]);
        if (loaded) {
          console.log(`   ✅ Loaded: ${args[0]}`);
        } else {
          console.log(`   ❌ Scenario not found: ${args[0]}`);
        }
      }
      break;
      
    case 'speed':
      if (!args[0] || isNaN(args[0])) {
        console.log('   ❌ Usage: speed <1-10>');
      } else {
        const speed = Math.max(1, Math.min(10, parseInt(args[0])));
        demoMode.setSpeed(speed);
        console.log(`   ⚡ Playback speed set to ${speed}x`);
      }
      break;
      
    case 'status':
      const status = demoMode.getStatus();
      console.log('\n   Demo Status:');
      console.log(`   ├─ State: ${status.state}`);
      console.log(`   ├─ Current scenario: ${status.currentScenario || 'none'}`);
      console.log(`   ├─ Progress: ${status.currentIndex}/${status.totalTransactions}`);
      console.log(`   ├─ Speed: ${status.speed}x`);
      console.log(`   └─ Elapsed: ${status.elapsed}s\n`);
      break;
      
    case 'stats':
      const globalStats = pairAggregator.getGlobalStats();
      console.log('\n   Aggregator Statistics:');
      console.log(`   ├─ Total transactions: ${globalStats.total_transactions_processed}`);
      console.log(`   ├─ Sandwiches detected: ${globalStats.total_sandwiches_detected}`);
      console.log(`   ├─ Active pairs: ${globalStats.active_pairs}`);
      console.log(`   └─ Uptime: ${globalStats.uptime_seconds}s\n`);
      break;
      
    case 'help':
      printDemoHelp();
      break;
      
    case 'quit':
    case 'exit':
      shutdown('user-quit');
      return;
      
    default:
      console.log(`   ❌ Unknown command: ${command}. Type 'help' for commands.`);
  }
  
  promptCommand();
}

// --------------------------------------------------
// Print status summary
// --------------------------------------------------
function printStatusSummary() {
  const mode = config.features.demoMode ? 'DEMO' : 'LIVE';
  const modeEmoji = config.features.demoMode ? '🎬' : '📡';
  
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    SERVICE STATUS                         ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  Mode:           ${modeEmoji} ${mode.padEnd(38)}║`);
  console.log(`║  WebSocket:      🌐 ws://localhost:${config.server.port}                    ║`);
  console.log(`║  HTTP API:       🔗 http://localhost:${config.server.port}                  ║`);
  console.log(`║  Frontend CORS:  ✅ ${config.server.frontendUrl.padEnd(36)}║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  API Endpoints:                                           ║');
  console.log('║    GET /health           - Health check                   ║');
  console.log('║    GET /api/pairs        - List active pairs              ║');
  console.log('║    GET /api/pairs/:pair  - Stats for pair (Role 2 API)   ║');
  console.log('║    GET /api/stats        - Global statistics              ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  WebSocket Events:                                        ║');
  console.log('║    → subscribe { pair }  - Subscribe to pair updates      ║');
  console.log('║    → unsubscribe { pair }- Unsubscribe from pair          ║');
  console.log('║    ← pair_update         - Pair statistics update         ║');
  console.log('║    ← sandwich_alert      - Sandwich attack detected       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  
  if (!config.features.demoMode) {
    console.log('Press Ctrl+C to stop the service.\n');
  }
}

// --------------------------------------------------
// Graceful shutdown handler
// --------------------------------------------------
async function shutdown(signal) {
  if (isShuttingDown) {
    console.log('\n   Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  
  console.log(`\n\n🛑 Received ${signal}. Shutting down gracefully...\n`);
  
  // Close readline if open
  if (rl) {
    rl.close();
    rl = null;
  }
  
  try {
    // Shutdown in reverse order of initialization
    
    // 1. Stop data source
    if (config.features.demoMode) {
      console.log('   Stopping demo mode...');
      demoMode.shutdown();
    } else {
      console.log('   Stopping mempool listener...');
      await mempoolListener.shutdown();
    }
    
    // 2. Stop pair aggregator
    console.log('   Stopping pair aggregator...');
    pairAggregator.shutdown();
    
    // 3. Stop WebSocket server
    console.log('   Stopping WebSocket server...');
    await webSocketServer.shutdown();
    
    // Print final stats
    console.log('\n📊 Final Statistics:');
    const globalStats = pairAggregator.getGlobalStats();
    console.log(`   Total transactions processed: ${globalStats.total_transactions_processed}`);
    console.log(`   Total sandwiches detected: ${globalStats.total_sandwiches_detected}`);
    console.log(`   Active pairs tracked: ${globalStats.active_pairs}`);
    
    const serverStats = webSocketServer.getServerStats();
    console.log(`   Total WebSocket connections: ${serverStats.totalConnections}`);
    console.log(`   Total pair updates sent: ${serverStats.totalPairUpdates}`);
    console.log(`   Total sandwich alerts sent: ${serverStats.totalSandwichAlerts}`);
    
    console.log('\n✅ Shutdown complete. Goodbye!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

// --------------------------------------------------
// Setup signal handlers
// --------------------------------------------------
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker/K8s stop

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error.message);
  console.error(error.stack);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  shutdown('unhandledRejection');
});

// --------------------------------------------------
// Start the application
// --------------------------------------------------
main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});