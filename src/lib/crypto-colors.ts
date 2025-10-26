// Crypto color mappings based on official brand colors
export const cryptoColors = {
  BTC: '#f69c3d',
  ETH: '#497493', 
  VTC: '#205b30',
  DASH: '#1376b5',
  XMR: '#fc6621',
  ZEC: '#d38f36',
  BCC: '#f5922f',
  BTG: '#e8a629',
  MTL: '#c5b398',
  MCO: '#032144',
  OMG: '#2159ec',
  LTC: '#949494',
  XRP: '#1b95ca',
  STRAT: '#6bb3e0',
  XDN: '#507ba0',
  NEO: '#93cb30',
  DMD: '#a4cad9',
  ZEN: '#f38723',
  USDT: '#2ea07b',
  SOL: '#9945ff', // Solana's official purple
  SUI: '#4da2ff', // Sui's official blue
} as const

export type CryptoSymbol = keyof typeof cryptoColors

export function getCryptoColor(symbol: string): string {
  return cryptoColors[symbol as CryptoSymbol] || '#6366f1' // Default to indigo if not found
}

// Crypto metadata for display
export const cryptoMetadata = {
  BTC: { name: 'Bitcoin', symbol: 'BTC' },
  ETH: { name: 'Ethereum', symbol: 'ETH' },
  XRP: { name: 'Ripple', symbol: 'XRP' },
  SOL: { name: 'Solana', symbol: 'SOL' },
  SUI: { name: 'Sui', symbol: 'SUI' },
  LTC: { name: 'Litecoin', symbol: 'LTC' },
  USDT: { name: 'Tether', symbol: 'USDT' },
} as const