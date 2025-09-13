import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  CurrencyDollarIcon,
  ClockIcon,
  TrendingUpIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaPrice, formatUSD, formatSOL } from '../hooks/useSolanaPrice';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface StakePosition {
  id: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatar: string;
  tokenSymbol: string;
  stakedAmount: number;
  currentValue: number;
  tokenAllocation: number;
  vestedTokens: number;
  pendingTokens: number;
  nextVestingDate: Date;
  stakingDate: Date;
  isActive: boolean;
  performanceBonus: number;
}

interface TokenHolding {
  id: string;
  influencerName: string;
  tokenSymbol: string;
  totalTokens: number;
  vestedTokens: number;
  pendingTokens: number;
  currentPrice: number;
  totalValue: number;
  priceChange24h: number;
  nextVestingDate: Date;
  vestingProgress: number;
}

// Mock data
const mockStakes: StakePosition[] = [
  {
    id: '1',
    influencerName: 'Yuki Tanaka',
    influencerHandle: '@crypto_beauty_jp',
    influencerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    tokenSymbol: 'YUKI',
    stakedAmount: 5.25,
    currentValue: 6.78,
    tokenAllocation: 15750,
    vestedTokens: 1312,
    pendingTokens: 14438,
    nextVestingDate: new Date('2024-09-01'),
    stakingDate: new Date('2024-08-15'),
    isActive: true,
    performanceBonus: 1.15,
  },
  {
    id: '2',
    influencerName: 'Mei Sato',
    influencerHandle: '@fashion_forward_tokyo',
    influencerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    tokenSymbol: 'MEI',
    stakedAmount: 2.1,
    currentValue: 2.1,
    tokenAllocation: 8420,
    vestedTokens: 0,
    pendingTokens: 8420,
    nextVestingDate: new Date('2024-09-15'),
    stakingDate: new Date('2024-08-18'),
    isActive: true,
    performanceBonus: 1.08,
  },
];

const mockTokens: TokenHolding[] = [
  {
    id: '1',
    influencerName: 'Yuki Tanaka',
    tokenSymbol: 'YUKI',
    totalTokens: 15750,
    vestedTokens: 1312,
    pendingTokens: 14438,
    currentPrice: 0.0043,
    totalValue: 67.73,
    priceChange24h: 12.5,
    nextVestingDate: new Date('2024-09-01'),
    vestingProgress: 8.3,
  },
];

export function MyStakes() {
  const { connected } = useWallet();
  const { price: solPrice } = useSolanaPrice();
  const [selectedTab, setSelectedTab] = useState(0);

  const totalStakedSOL = mockStakes.reduce((sum, stake) => sum + stake.stakedAmount, 0);
  const totalCurrentValue = mockStakes.reduce((sum, stake) => sum + stake.currentValue, 0);
  const totalTokenValue = mockTokens.reduce((sum, token) => sum + token.totalValue, 0);
  const totalPnL = totalCurrentValue - totalStakedSOL;
  const totalPnLPercent = ((totalPnL / totalStakedSOL) * 100);

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <CurrencyDollarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          Connect your wallet to view your stakes and token holdings.
        </p>
        <button className="btn-primary">Connect Wallet</button>
      </div>
    );
  }

  const tabs = [
    { name: 'Active Stakes', count: mockStakes.length },
    { name: 'Token Holdings', count: mockTokens.length },
    { name: 'Vesting Schedule', count: mockTokens.length },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Stakes & Tokens</h2>
        <p className="text-gray-600">Track your staking positions and token allocations</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-kapikol-50 border-kapikol-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kapikol-600">Total Staked</p>
              <p className="text-xl font-bold text-kapikol-900">{formatSOL(totalStakedSOL)} SOL</p>
              <p className="text-sm text-kapikol-600">{formatUSD(totalStakedSOL * solPrice)}</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 text-kapikol-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Value</p>
              <p className="text-xl font-bold text-gray-900">{formatSOL(totalCurrentValue)} SOL</p>
              <p className="text-sm text-gray-600">{formatUSD(totalCurrentValue * solPrice)}</p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">P&L</p>
              <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {totalPnL >= 0 ? '+' : ''}{formatSOL(totalPnL)} SOL
              </p>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </p>
            </div>
            {totalPnL >= 0 ? (
              <ArrowUpIcon className="w-8 h-8 text-crypto-green" />
            ) : (
              <ArrowDownIcon className="w-8 h-8 text-crypto-red" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Token Value</p>
              <p className="text-xl font-bold text-gray-900">{formatUSD(totalTokenValue)}</p>
              <p className="text-sm text-gray-600">Across {mockTokens.length} tokens</p>
            </div>
            <ClockIcon className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-0">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 m-6 mb-0">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200',
                    'ring-white/60 ring-offset-2 ring-offset-kapikol-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-kapikol-700 shadow'
                      : 'text-gray-600 hover:bg-white/70 hover:text-gray-700'
                  )
                }
              >
                {tab.name} ({tab.count})
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="p-6">
            {/* Active Stakes */}
            <Tab.Panel>
              <div className="space-y-4">
                {mockStakes.map((stake) => (
                  <div key={stake.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stake.influencerAvatar}
                          alt={stake.influencerName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">{stake.influencerName}</h4>
                          <p className="text-sm text-gray-600">{stake.influencerHandle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          stake.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {stake.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Staked Amount</p>
                        <p className="font-semibold">{formatSOL(stake.stakedAmount)} SOL</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Value</p>
                        <p className="font-semibold">{formatSOL(stake.currentValue)} SOL</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Token Allocation</p>
                        <p className="font-semibold">{stake.tokenAllocation.toLocaleString()} {stake.tokenSymbol}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Performance Bonus</p>
                        <p className="font-semibold text-crypto-green">{((stake.performanceBonus - 1) * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-gray-600">Next vesting: </span>
                          <span className="font-medium">{stake.nextVestingDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-secondary text-sm px-3 py-1">
                            Add Stake
                          </button>
                          <button className="btn-secondary text-sm px-3 py-1">
                            Unstake
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>

            {/* Token Holdings */}
            <Tab.Panel>
              <div className="space-y-4">
                {mockTokens.map((token) => (
                  <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{token.tokenSymbol}</h4>
                        <p className="text-sm text-gray-600">{token.influencerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{formatUSD(token.totalValue)}</p>
                        <p className={`text-sm ${token.priceChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Tokens</p>
                        <p className="font-semibold">{token.totalTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vested</p>
                        <p className="font-semibold text-crypto-green">{token.vestedTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pending</p>
                        <p className="font-semibold">{token.pendingTokens.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Token Price</p>
                        <p className="font-semibold">{formatUSD(token.currentPrice)}</p>
                      </div>
                    </div>

                    {/* Vesting Progress */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Vesting Progress</span>
                        <span>{token.vestingProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-crypto-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${token.vestingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Next vesting: {token.nextVestingDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>

            {/* Vesting Schedule */}
            <Tab.Panel>
              <div className="space-y-6">
                {mockTokens.map((token) => {
                  const monthlyVesting = token.totalTokens / 36; // 3 years = 36 months
                  
                  return (
                    <div key={token.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{token.tokenSymbol} Vesting Schedule</h4>
                        <p className="text-sm text-gray-600">Linear over 36 months</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-crypto-green">{token.vestedTokens.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Tokens Vested</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{Math.floor(monthlyVesting).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Tokens/Month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{token.pendingTokens.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Remaining</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Upcoming Vesting Events</h5>
                        <div className="space-y-2">
                          {[0, 1, 2, 3, 4].map((monthOffset) => {
                            const vestingDate = new Date(token.nextVestingDate);
                            vestingDate.setMonth(vestingDate.getMonth() + monthOffset);
                            
                            return (
                              <div key={monthOffset} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                <span className="text-sm text-gray-600">{vestingDate.toLocaleDateString()}</span>
                                <span className="font-medium">{Math.floor(monthlyVesting).toLocaleString()} {token.tokenSymbol}</span>
                                <span className="text-sm text-gray-500">{formatUSD(monthlyVesting * token.currentPrice)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}