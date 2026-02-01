// Strictly defined visual states
export const RISK_CONFIGS = {
  low: {
    color: '#10b981', // Emerald-500 (Green)
    label: 'CALM',
    subtitle: 'Safe to trade',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-500/30'
  },
  moderate: {
    color: '#f59e0b', // Amber-500 (Yellow)
    label: 'MODERATE',
    subtitle: 'Caution advised',
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30'
  },
  high: { // Added 'high' to map to Red
    color: '#ef4444', // Red-500
    label: 'HIGH RISK',
    subtitle: 'Sandwiches detected',
    bg: 'bg-red-950/30',
    border: 'border-red-500/30'
  },
  severe: {
    color: '#ef4444', // Red-500 (Same as High)
    label: 'SEVERE',
    subtitle: 'Do not trade',
    bg: 'bg-red-950/40',
    border: 'border-red-500/50'
  }
};

export const TOKEN_LIST = [
  { value: 'ETH', label: 'Ethereum', symbol: 'ETH', logo: '/tokens/eth.png' },
  { value: 'PEPE', label: 'Pepe', symbol: 'PEPE', logo: '/tokens/pepe.png' },
  { value: 'SHIB', label: 'Shiba Inu', symbol: 'SHIB', logo: '/tokens/shib.png' },
  { value: 'USDC', label: 'USD Coin', symbol: 'USDC', logo: '/tokens/usdc.png' },
];