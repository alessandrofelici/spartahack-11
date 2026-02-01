// ============================================================
// src/index.js
// Main entry point - initializes and connects all components
// ============================================================

const { config, logConfig } = require('./config');
const mempoolListener = require('./mempool-listener');
const pairAggregator = require('./pair-aggregator');
const webSocketServer = require('./websocket-server');
const demoMode = require('./demo-mode');

// --------------------------------------------------
// Application state
// --------------------------------------------------
let isShuttingDown = false;

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
        
        // Auto-start first scenario
        console.log('\n   Starting first scenario automatically...');
        demoMode.play();
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
    
  } catch (error) {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
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
  console.log('Press Ctrl+C to stop the service.\n');
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