// ABI definitions for decoding transactions

// Uniswap V2 Router ABI
// Only includes the swap methods we need to decode
// Full ABI available at: https://etherscan.io/address/0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D#code
const UNISWAP_V2_ROUTER_ABI = [
  // ETH -> Token swaps
  {
    "name": "swapExactETHForTokens",
    "type": "function",
    "inputs": [
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapETHForExactTokens",
    "type": "function",
    "inputs": [
      { "name": "amountOut", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
    "type": "function",
    "inputs": [
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  
  // Token -> ETH swaps
  {
    "name": "swapExactTokensForETH",
    "type": "function",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapTokensForExactETH",
    "type": "function",
    "inputs": [
      { "name": "amountOut", "type": "uint256" },
      { "name": "amountInMax", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
    "type": "function",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  
  // Token -> Token swaps
  {
    "name": "swapExactTokensForTokens",
    "type": "function",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapTokensForExactTokens",
    "type": "function",
    "inputs": [
      { "name": "amountOut", "type": "uint256" },
      { "name": "amountInMax", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  },
  {
    "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    "type": "function",
    "inputs": [
      { "name": "amountIn", "type": "uint256" },
      { "name": "amountOutMin", "type": "uint256" },
      { "name": "path", "type": "address[]" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ]
  }
];

// ERC20 Token ABI
// Used to look up token name, symbol and decimals
const ERC20_ABI = [
{
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view"
  },
  {
    "name": "decimals",
    "type": "function",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view"
  }
];

// Method signatures for quick identification
// First 4 bytes of keccak256 hash of function signature
// Used to quickly check what function is being called
const SWAP_METHOD_IDS = {
    '0x7ff36ab5': 'swapExactETHForTokens',
    '0xfb3bdb41': 'swapETHForExactTokens',
    '0xb6f9de95': 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    '0x18cbafe5': 'swapExactTokensForETH',
    '0x4a25d94a': 'swapTokensForExactETH',
    '0x791ac947': 'swapExactTokensForETHSupportingFeeOnTransferTokens',
    '0x38ed1739': 'swapExactTokensForTokens',
    '0x8803dbee': 'swapTokensForExactTokens',
    '0x5c11d795': 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
};

// Check if a method ID is a swap
function isSwapMethod(methodId) {
    return SWAP_METHOD_IDS.hasOwnProperty(methodId.toLowerCase());
}

// Get method name from method ID
function getMethodName(methodId) {
    return SWAP_METHOD_IDS[methodId.toLowerCase()] || 'unknown';
}

// Exports
module.exports = {
    UNISWAP_V2_ROUTER_ABI,
    ERC20_ABI,
    SWAP_METHOD_IDS,
    isSwapMethod,
    getMethodName
};