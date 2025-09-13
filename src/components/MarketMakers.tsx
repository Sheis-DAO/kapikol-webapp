import React from 'react';
import { 
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatUSD, formatSOL } from '../hooks/useSolanaPrice';

interface MarketMakerData {
  id: string;
  name: string;
  logo: string;
  description: string;
  tvl: number; // Total Value Locked
  apy: number;
  tokensSupported: number;
  status: 'active' | 'pending' | 'paused';
  features: string[];
}

const mockMarketMakers: MarketMakerData[] = [
  {
    id: '1',
    name: 'Raydium Protocol',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    description: 'Leading AMM on Solana providing deep liquidity and low slippage trading',
    tvl: 2400000,
    apy: 45.2,
    tokensSupported: 8,
    status: 'active',
    features: ['Concentrated Liquidity', 'Low Fees', 'Auto-compounding', 'IL Protection'],
  },
  {
    id: '2',
    name: 'Orca Protocol',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
    description: 'User-friendly DEX with innovative liquidity solutions and fair price discovery',
    tvl: 1850000,
    apy: 38.7,
    tokensSupported: 5,
    status: 'active',
    features: ['Whirlpools', 'Fair Price Discovery', 'User-friendly UX', 'MEV Protection'],
  },
  {
    id: '3',
    name: 'Jupiter Aggregator',
    logo: 'https://station.jup.ag/img/jupiter-logo.svg',
    description: 'Advanced routing protocol ensuring best execution across multiple liquidity sources',
    tvl: 950000,
    apy: 28.3,
    tokensSupported: 3,
    status: 'pending',
    features: ['Best Price Routing', 'Multiple DEX Integration', 'Minimal Slippage', 'Advanced Algorithms'],
  },
];

export function MarketMakers() {
  const totalTVL = mockMarketMakers.reduce((sum, mm) => sum + mm.tvl, 0);
  const avgAPY = mockMarketMakers.reduce((sum, mm) => sum + mm.apy, 0) / mockMarketMakers.length;
  const activeMarketMakers = mockMarketMakers.filter(mm => mm.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Market Makers & Liquidity</h2>
        <p className="text-gray-600">
          Our trusted partners providing deep liquidity for all token launches
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-kapikol-50 border-kapikol-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kapikol-600">Total TVL</p>
              <p className="text-xl font-bold text-kapikol-900">{formatUSD(totalTVL)}</p>
              <p className="text-sm text-kapikol-600">Across all partners</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-kapikol-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average APY</p>
              <p className="text-xl font-bold text-gray-900">{avgAPY.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">For liquidity providers</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Partners</p>
              <p className="text-xl font-bold text-gray-900">{activeMarketMakers}</p>
              <p className="text-sm text-gray-600">Providing liquidity</p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tokens Supported</p>
              <p className="text-xl font-bold text-gray-900">{mockMarketMakers.reduce((sum, mm) => sum + mm.tokensSupported, 0)}</p>
              <p className="text-sm text-gray-600">Kapikol tokens</p>
            </div>
            <ClockIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Market Maker Cards */}
      <div className="grid gap-6">
        {mockMarketMakers.map((mm) => (
          <div key={mm.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={mm.logo}
                  alt={mm.name}
                  className="w-16 h-16 rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mm.name)}&size=64&background=random`;
                  }}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{mm.name}</h3>
                  <p className="text-gray-600 max-w-md">{mm.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  mm.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : mm.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {mm.status === 'active' ? 'Active' : mm.status === 'pending' ? 'Pending' : 'Paused'}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">TVL</p>
                <p className="text-lg font-bold text-gray-900">{formatUSD(mm.tvl)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">APY</p>
                <p className="text-lg font-bold text-crypto-green">{mm.apy.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Tokens</p>
                <p className="text-lg font-bold text-gray-900">{mm.tokensSupported}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Allocation</p>
                <p className="text-lg font-bold text-gray-900">40%</p>
              </div>
            </div>

            {/* Features */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {mm.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Liquidity Allocation Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Liquidity Allocation Details</h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Receives 40% of each token supply for liquidity provision</p>
                <p>• Tokens are time-locked to prevent rug pulls</p>
                <p>• Provides initial liquidity within 24 hours of token launch</p>
                <p>• Maintains minimum liquidity depth as per protocol requirements</p>
              </div>
            </div>

            {mm.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Currently providing liquidity for {mm.tokensSupported} Kapikol tokens
                  </span>
                  <div className="flex gap-2">
                    <button className="btn-secondary text-sm px-3 py-1">
                      View Details
                    </button>
                    <button className="btn-primary text-sm px-3 py-1">
                      Provide Liquidity
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Market Making Works</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Automatic Liquidity Provision</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 40% of token supply allocated to market makers</li>
              <li>• Liquidity deployed immediately upon token launch</li>
              <li>• Multiple market makers ensure redundancy and competition</li>
              <li>• Time-locked to prevent sudden liquidity removal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Benefits for Token Holders</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Immediate trading availability</li>
              <li>• Reduced slippage on trades</li>
              <li>• Price stability and fair discovery</li>
              <li>• Professional market making algorithms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}