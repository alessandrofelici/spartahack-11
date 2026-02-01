// Import dependencies
const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Define required env variables
const REQUIRED_VARIABLES = [
    'ALCHEMY_API_KEY'
];

// Validate required variable exists
function validateRequiredVariables() {
    const missing = [];

    for (const varName of REQUIRED_VARIABLES) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        console.error('\n Missing requried environment variables:\n');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\n To fix this:');
        console.error('   1. Copy .env.example to .env');
        console.error('   2. Fill in your actual values');
        console.error('   3. Restart the application\n');

        throw new Error(`Missing required environment variable: ${missing.join(', ')}`);
    }
}

// Run validation
validateRequiredVariables();

// Build configuration obj
const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const alchemyWsUrlBase = process.env.ALCHEMY_WS_URL || 'wss://eth-mainnet.g.alchemy.com/v2/';
const listenerPort = process.env.LISTENER_PORT || '3001';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const slippageApiUrl = process.env.SLIPPAGE_API_URL || 'http://localhost:8000';
const demoMode = process.env.DEMO_MODE || 'false';
const logLevel = process.env.LOG_LEVEL || 'info';

// Construct Alchemy WebSocket URL
const alchemyWsUrl = `${alchemyWsUrlBase}${alchemyApiKey}`;

// Create and export config obj
const config = {
    // Alchemy blockchain connection
    alchemy: {
        apiKey: alchemyApiKey,
        wsUrl: alchemyWsUrl,
        wsUrlBase: alchemyWsUrlBase
    },

    // Server settings
    server: {
        port: parseInt(listenerPort, 10),
        frontendUrl: frontendUrl,
        slippageApiUrl: slippageApiUrl
    },

    // Feature Flags
    features: {
        demoMode: demoMode.toLowerCase() === 'true' // Converts string to bool
    },

    // Logging config
    logging: {
        level: logLevel
    }
};

// Log config on startup
function logConfig() {
    console.log('\n Configuration loaded:');
    console.log(` Alchemy API Key: ${config.alchemy.apiKey.substring(0, 6)}...${config.alchemy.apiKey.substring(config.alchemy.apiKey.length - 4)}`);
    console.log(` WebSocket URL:   ${config.alchemy.wsUrlBase}[API_KEY]`);
    console.log(` Server Port:     ${config.server.port}`);
    console.log(` Frontend URL:    ${config.server.frontendUrl}`);
    console.log(` Slippage API:    ${config.server.slippageApiUrl}`);
    console.log(` Demo Mode:       ${config.features.demoMode}`);
    console.log(` Log Level:       ${config.logging.level}`);
}

// Export config obj and function
module.exports = {
    config,
    logConfig
};