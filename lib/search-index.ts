// lib/search-index.ts
// Static search index for client-side fuzzy search

export interface SearchItem {
  label: string;
  description: string;
  href: string;
  type: 'page' | 'route' | 'asset';
  icon: string;
}

export const searchIndex: SearchItem[] = [
  // Pages
  { label: 'Dashboard', description: 'Portfolio overview and market opportunities', href: '/', type: 'page', icon: 'dashboard' },
  { label: 'Arbitrage Execution', description: 'One-click multi-hop arbitrage', href: '/arbitrage', type: 'page', icon: 'bolt' },
  { label: 'Profit Simulator', description: 'Test strategies before committing capital', href: '/simulator', type: 'page', icon: 'science' },
  { label: 'Risk Analysis', description: 'Exposure limits and risk metrics', href: '/risk', type: 'page', icon: 'security' },
  { label: 'History', description: 'Transaction and profit history', href: '/history', type: 'page', icon: 'history' },
  { label: 'Documentation', description: 'Platform guides and API reference', href: '/docs', type: 'page', icon: 'description' },
  { label: 'Support Center', description: 'Help and troubleshooting', href: '/support', type: 'page', icon: 'help' },
  // Asset Routes
  { label: 'XLM → USDC Route', description: 'Triangular arb via Stellar DEX', href: '/arbitrage', type: 'route', icon: 'swap_horiz' },
  { label: 'XLM → AQUA Route', description: 'Multi-hop through AQUA pools', href: '/arbitrage', type: 'route', icon: 'swap_horiz' },
  { label: 'USDC → yXLM Route', description: 'yXLM yield loop arbitrage', href: '/arbitrage', type: 'route', icon: 'swap_horiz' },
  // Assets
  { label: 'XLM', description: 'Stellar Lumens — native asset', href: '/', type: 'asset', icon: 'star' },
  { label: 'USDC', description: 'USD Coin on Stellar', href: '/', type: 'asset', icon: 'attach_money' },
  { label: 'AQUA', description: 'Aquarius governance token', href: '/', type: 'asset', icon: 'water_drop' },
];
