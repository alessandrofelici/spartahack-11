// src/mempool-listener.js
// Connects to Alchemy WebSocket and streams pending transactions

const { ethers } = require('ethers');
const { config } = require('./config');
const { MONITORED_ROUTERS } = require('./constants/addresses');
const { decodeTransaction, createTxSummary } = require('./transaction-decoder');

// Listener state
let provider = null;
let isConnected = false;
let reconnectAttempts = 0;
let subscriptionId = null;

// Statistics
const stats = {
    connected: false,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    totalTransactionsReceived: 0,
    totalTransactionsDecoded: 0,
    transactionsPerMinute: 0,
    reconnectAttempts: 0
};

// Transaction rate tracking
let transactionsInLastMinute = 0;
let rateResetInterval = null;

// Callback for when transactions are decoded
let onTransactionCallback = null;

// Configuration
const RECONNECT_DELAY_BASE = 1000;
const RECONNECT_DELAY_MAX = 30000;
const RECONNECT_MAX_ATTEMPTS = 50;

// Initialize the mempool listener
async function initialize(onTransaction) {
    console.log('\n🔌 Initializing mempool listener...');

    // Store the callback
    onTransactionCallback = onTransaction;

    // Start rate tracking
    startRateTracking();

    // Connect to Alchemy
    await connect();
}

// Connect to Alchemy WebSocket
async function connect() {
    try {
        console.log(`   Connecting to Alchemy WebSocket...`);
        console.log(`   URL: ${config.alchemy.wsUrlBase}[API_KEY]`);

        // Create WebSocket provider
        provider = new ethers.WebSocketProvider(config.alchemy.wsUrl);

        // Wait for connection
        await provider.ready;
        console.log(`   ✅ WebSocket connected`);

        // Set up the raw WebSocket message handler BEFORE subscribing
        setupWebSocketHandler();

        // Subscribe to pending transactions using Alchemy's enhanced API
        await subscribeToPendingTransactions();

        // Update state
        isConnected = true;
        reconnectAttempts = 0;
        stats.connected = true;
        stats.lastConnectedAt = new Date().toISOString();
        stats.reconnectAttempts = 0;

        console.log(`   ✅ Now listening for Uniswap transactions...\n`);

    } catch (error) {
        console.error(`   ❌ Connection failed: ${error.message}`);
        handleDisconnect();
    }
}

// Set up raw WebSocket message handler
function setupWebSocketHandler() {
    if (!provider || !provider.websocket) {
        console.error('   ❌ No WebSocket available');
        return;
    }

    // Handle incoming WebSocket messages directly
    provider.websocket.on('message', (rawData) => {
        try {
            const data = JSON.parse(rawData);

            // Check if this is a subscription notification
            if (data.method === 'eth_subscription' && data.params) {
                const result = data.params.result;

                // Handle the transaction
                if (result && typeof result === 'object' && result.hash) {
                    // This is a full transaction object
                    handlePendingTransaction(result);
                } else if (typeof result === 'string') {
                    // This is just a hash - we need to fetch the full transaction
                    // For now, log it (we'll fix this below)
                    // console.log(`   Received hash only: ${result.slice(0, 10)}...`);
                    fetchAndHandleTransaction(result);
                }
            }
        } catch (error) {
            // Ignore non-JSON messages (like pings)
        }
    });

    // Handle WebSocket close
    provider.websocket.on('close', (code, reason) => {
        console.log(`\n   ⚠️ WebSocket closed (code: ${code})`);
        handleDisconnect();
    });

    // Handle WebSocket errors
    provider.websocket.on('error', (error) => {
        console.error(`\n   ❌ WebSocket error: ${error.message}`);
    });
}

// Subscribe to pending transactions
async function subscribeToPendingTransactions() {
    console.log('   Subscribing to pending transactions...');
    console.log(`   Filtering for ${MONITORED_ROUTERS.length} router address(es)`);

    try {
        // Use Alchemy's alchemy_pendingTransactions subscription
        // This should return FULL transaction objects, not just hashes
        subscriptionId = await provider.send('eth_subscribe', [
            'alchemy_pendingTransactions',
            {
                toAddress: MONITORED_ROUTERS,
                hashesOnly: false  // IMPORTANT: We want full transaction data
            }
        ]);

        console.log(`   ✅ Subscription ID: ${subscriptionId}`);
        console.log(`   ✅ Requesting full transaction objects (hashesOnly: false)`);

    } catch (error) {
        console.error(`   ❌ Subscription failed: ${error.message}`);
        
        // Fall back to standard pending transactions if Alchemy-specific fails
        console.log('   Trying fallback subscription method...');
        try {
            subscriptionId = await provider.send('eth_subscribe', ['newPendingTransactions']);
            console.log(`   ⚠️ Using fallback (hash-only) subscription: ${subscriptionId}`);
            console.log(`   ⚠️ Will need to fetch full transactions individually`);
        } catch (fallbackError) {
            throw new Error(`Both subscription methods failed: ${fallbackError.message}`);
        }
    }
}

// Fetch full transaction data when we only receive a hash
async function fetchAndHandleTransaction(txHash) {
    try {
        // Get the full transaction from the node
        const tx = await provider.getTransaction(txHash);
        
        if (tx) {
            // Convert to the format our decoder expects
            const rawTx = {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value?.toString() || '0',
                input: tx.data,
                gasPrice: tx.gasPrice?.toString(),
                maxFeePerGas: tx.maxFeePerGas?.toString(),
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
                nonce: tx.nonce,
                gas: tx.gasLimit?.toString()
            };
            
            handlePendingTransaction(rawTx);
        }
    } catch (error) {
        // Transaction might have been mined already or dropped
        // This is normal, just ignore
    }
}

// Handle incoming pending transaction
function handlePendingTransaction(tx) {
    try {
        // Basic validation
        if (!tx || !tx.hash) {
            return;
        }

        // Normalize the transaction object for our decoder
        // Alchemy might send slightly different formats
        const normalizedTx = {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value?.toString() || tx.value || '0',
            input: tx.input || tx.data || '0x',
            gasPrice: tx.gasPrice?.toString() || tx.gasPrice,
            maxFeePerGas: tx.maxFeePerGas?.toString() || tx.maxFeePerGas,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString() || tx.maxPriorityFeePerGas,
            nonce: tx.nonce,
            gas: tx.gas || tx.gasLimit
        };

        // Update stats
        stats.totalTransactionsReceived++;
        transactionsInLastMinute++;

        // Decode the transaction
        const decoded = decodeTransaction(normalizedTx);

        if (decoded) {
            // Update stats
            stats.totalTransactionsDecoded++;

            // Log the transaction
            const summary = createTxSummary(decoded);
            console.log(`  📊 ${summary}`);

            // Call the callback with decoded transaction
            if (onTransactionCallback) {
                onTransactionCallback(decoded);
            }
        }

    } catch (error) {
        console.error(`   ❌ Error handling transaction: ${error.message}`);
    }
}

// Handle disconnection
function handleDisconnect() {
    isConnected = false;
    stats.connected = false;
    stats.lastDisconnectedAt = new Date().toISOString();

    // Clean up old provider
    if (provider) {
        try {
            provider.removeAllListeners();
            if (provider.websocket) {
                provider.websocket.removeAllListeners();
            }
            provider.destroy();
        } catch (error) {
            // Ignore cleanup errors
        }
        provider = null;
    }

    subscriptionId = null;

    // Attempt reconnection
    scheduleReconnect();
}

// Schedule a reconnection attempt
function scheduleReconnect() {
    reconnectAttempts++;
    stats.reconnectAttempts = reconnectAttempts;

    if (reconnectAttempts > RECONNECT_MAX_ATTEMPTS) {
        console.error(`\n❌ Max reconnection attempts (${RECONNECT_MAX_ATTEMPTS}) reached.`);
        console.error('   Please check your Alchemy API key and network connection.');
        return;
    }

    const delay = Math.min(
        RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1),
        RECONNECT_DELAY_MAX
    );

    console.log(`\n🔄 Reconnecting in ${delay / 1000}s... (attempt ${reconnectAttempts}/${RECONNECT_MAX_ATTEMPTS})`);

    setTimeout(async () => {
        console.log(`\n🔄 Reconnection attempt ${reconnectAttempts}...`);
        await connect();
    }, delay);
}

// Start rate tracking
function startRateTracking() {
    rateResetInterval = setInterval(() => {
        stats.transactionsPerMinute = transactionsInLastMinute;
        transactionsInLastMinute = 0;
    }, 60000);
}

// Stop rate tracking
function stopRateTracking() {
    if (rateResetInterval) {
        clearInterval(rateResetInterval);
        rateResetInterval = null;
    }
}

// Get current statistics
function getStats() {
    return {
        ...stats,
        currentTransactionsPerMinute: transactionsInLastMinute
    };
}

// Check if listener is connected
function isListenerConnected() {
    return isConnected;
}

// Graceful shutdown
async function shutdown() {
    console.log('\n🛑 Shutting down mempool listener...');

    stopRateTracking();

    // Unsubscribe if we have an active subscription
    if (subscriptionId && provider) {
        try {
            await provider.send('eth_unsubscribe', [subscriptionId]);
            console.log('   ✅ Unsubscribed from pending transactions');
        } catch (error) {
            // Ignore unsubscribe errors during shutdown
        }
    }

    // Clean up provider
    if (provider) {
        try {
            provider.removeAllListeners();
            if (provider.websocket) {
                provider.websocket.removeAllListeners();
            }
            provider.destroy();
        } catch (error) {
            // Ignore cleanup errors
        }
        provider = null;
    }

    isConnected = false;
    stats.connected = false;
    subscriptionId = null;

    console.log('   ✅ Mempool listener shut down');
}

// Export
module.exports = {
    initialize,
    shutdown,
    getStats,
    isListenerConnected
};