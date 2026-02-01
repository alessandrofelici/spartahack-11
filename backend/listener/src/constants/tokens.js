// Token metadata for display and conversion
const { TOKENS } = require('./addresses');

// Token Metadata
// Includes decimals
const TOKEN_METADATA = {
    [TOKENS.WETH]: {
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        logo: 'eth.png',
        isStablecoin: false
    },
    [TOKENS.USDC]: {
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logo: 'usdc.png',
        isStablecoin: true
    },
      [TOKENS.USDT]: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,  // USDT also has 6 decimals
    logo: 'usdt.png',
    isStablecoin: true
  },
  [TOKENS.DAI]: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    logo: 'dai.png',
    isStablecoin: true
  },
  [TOKENS.PEPE]: {
    symbol: 'PEPE',
    name: 'Pepe',
    decimals: 18,
    logo: 'pepe.png',
    isStablecoin: false
  },
  [TOKENS.SHIB]: {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    decimals: 18,
    logo: 'shib.png',
    isStablecoin: false
  },
  [TOKENS.FLOKI]: {
    symbol: 'FLOKI',
    name: 'Floki',
    decimals: 9,  // Floki has 9 decimals
    logo: 'floki.png',
    isStablecoin: false
  },
  [TOKENS.LINK]: {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    logo: 'link.png',
    isStablecoin: false
  },
  [TOKENS.UNI]: {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    logo: 'uni.png',
    isStablecoin: false
  },
  [TOKENS.AAVE]: {
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    logo: 'aave.png',
    isStablecoin: false
  },
  [TOKENS.MATIC]: {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    logo: 'matic.png',
    isStablecoin: false
  }
};

// Default metadata for unknown tokens
const DEFAULT_TOKEN_METADATA = {
    symbol: 'UNKNOWN',
    name: 'Unknown Token',
    decimals: 18,
    logo: 'unknown.png',
    isStablecoin: false
};

// Get token metadata by address
// Returns default if token not found
function getTokenMetadata(address) {
    const normalizedAddress = address.toLowerCase();

    // Check our known tokens first
    for (const [tokenAddress, metadata] of Object.entries(TOKEN_METADATA)) {
        if (tokenAddress.toLowerCase() === normalizedAddress) {
            return metadata;
        }
    }

    // Return default for unknown tokens
    return {
        ...DEFAULT_TOKEN_METADATA,
        symbol: `${address.slice(0, 6)}...${address.slice(-4)}`
    };
}

// Get token symbol by address
function getTokenSymbol(address) {
    return getTokenMetadata(address).symbol;
}

// Get token decimals by address
function getTokenDecimals(address) {
    return getTokenMetadata(address).decimals;
}

// Convert raw amount to human readable
function formatTokenAmount(rawAmount, address) {
    const decimals = getTokenDecimals(address);
    const divisor = BigInt(10) ** BigInt(decimals);
    const amount = BigInt(rawAmount);

    // Integer
    const integerPart = amount / divisor;

    // Decimal
    const remainder = amount % divisor;
    const decimalPart = remainder.toString().padStart(decimals, '0');

    // Trim trailing zeros
    const trimmedDecimal = decimalPart.replace(/0+$/, '');

    if (trimmedDecimal === '') {
        return integerPart.toString();
    }

    // Limit decimal places for display
    const displayDecimal = trimmedDecimal.slice(0, 6);
    return `${integerPart}.${displayDecimal}`;
}

// Create a normalized pair string
function createPairString(tokenA, tokenB) {
    const symbolA = getTokenSymbol(tokenA);
    const symbolB = getTokenSymbol(tokenB);

    // Sort alphabetially for consistency
    const sorted = [symbolA, symbolB].sort();
    return `${sorted[0]}-${sorted[1]}`;
}

// Exports
module.exports = {
    TOKEN_METADATA,
    DEFAULT_TOKEN_METADATA,
    getTokenMetadata,
    getTokenSymbol,
    getTokenDecimals,
    formatTokenAmount,
    createPairString
};