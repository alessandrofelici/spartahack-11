// Ethereum contract addresses for Mainnet
// Uniswap Router Addresses
const UNISWAP_V2_ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const UNISWAP_V3_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
const UNISWAP_UNIVERSAL_ROUTER = '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD';

// Array of all routers monitored
const MONITORED_ROUTERS = [
    UNISWAP_V2_ROUTER
    // Add V3 and Universal Router later if needed
];

// Common Token Addresses
// Mainnet addresses for frequently traded tokens
const TOKENS = {
      // Wrapped ETH - used in all ETH pairs
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  
  // Stablecoins
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EesfdHewFaD3E3C6B7',
  
  // Popular memecoins (high sandwich activity)
  PEPE: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
  SHIB: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
  FLOKI: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E',
  
  // Other major tokens
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  MATIC: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
};

// Address lookup helper
// Creates reverse mapping: address -> symbol
const ADDRESS_TO_SYMBOL = {};
for (const [symbol, address] of Object.entries(TOKENS)) {
    ADDRESS_TO_SYMBOL[address.toLowerCase()] = symbol;
}

// Known MEV Bot Addresses (Optional)
// Known to perform sandwich attacks and used to flag
// suspicious transactions
const KNOWN_MEV_BOTS = [
  '0x00000000003b3cc22aF3aE1EAc0440BcEe416B40',
  '0x000000000035B5e5ad9019092C665357240f594e',
  '0x0000000000A84D1a9B0063A910315C7fFA9Cd248'
];

// Exports
module.exports = {
    // Routers
    UNISWAP_V2_ROUTER,
    UNISWAP_V3_ROUTER,
    UNISWAP_UNIVERSAL_ROUTER,
    MONITORED_ROUTERS,

    // Tokens
    TOKENS,
    ADDRESS_TO_SYMBOL,

    // MEV
    KNOWN_MEV_BOTS
};