import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getSortedInfluencers } from '../data/mockData';
import { Influencer, SocialPlatform } from '../types';
import { useSolanaPrice, formatUSD, formatSOL } from '../hooks/useSolanaPrice';
import { StakeModal } from './StakeModal';

const platformColors = {
  [SocialPlatform.INSTAGRAM]: 'bg-gradient-to-r from-pink-500 to-yellow-500',
  [SocialPlatform.TIKTOK]: 'bg-black',
  [SocialPlatform.YOUTUBE]: 'bg-red-600',
  [SocialPlatform.TWITTER]: 'bg-blue-500',
  [SocialPlatform.FACEBOOK]: 'bg-blue-600',
  [SocialPlatform.TELEGRAM]: 'bg-blue-400',
};

const platformIcons = {
  [SocialPlatform.INSTAGRAM]: 'I',
  [SocialPlatform.TIKTOK]: 'T',
  [SocialPlatform.YOUTUBE]: 'Y',
  [SocialPlatform.TWITTER]: 'X',
  [SocialPlatform.FACEBOOK]: 'F',
  [SocialPlatform.TELEGRAM]: 'T',
};

interface InfluencerRankingProps {
  onSelectInfluencer?: (influencer: Influencer) => void;
}

export function InfluencerRanking({ onSelectInfluencer }: InfluencerRankingProps) {
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const { price: solPrice } = useSolanaPrice();
  const influencers = getSortedInfluencers();

  const handleStake = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setShowStakeModal(true);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Influencer Rankings</h2>
        <p className="text-gray-600">Stake SOL on your favorite influencers and earn token allocations</p>
      </div>

      <div className="grid gap-4">
        {influencers.map((influencer, index) => {
          const usdValue = influencer.totalStaked * solPrice;
          const isTopRanked = index === 0;
          
          return (
            <div
              key={influencer.id}
              className={`card hover:shadow-xl transition-all duration-300 cursor-pointer ${
                isTopRanked ? 'ring-2 ring-crypto-gold bg-gradient-to-r from-yellow-50 to-orange-50' : ''
              }`}
              onClick={() => onSelectInfluencer?.(influencer)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isTopRanked ? 'bg-crypto-gold text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={influencer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName)}&size=56&background=random`}
                      alt={influencer.displayName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {/* Platform Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${platformColors[influencer.platform]}`}>
                      {platformIcons[influencer.platform]}
                    </div>
                  </div>

                  {/* Influencer Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {influencer.displayName}
                      </h3>
                      {influencer.verified && (
                        <span className="text-blue-500 text-sm">✓</span>
                      )}
                      {isTopRanked && (
                        <span className="text-crypto-gold text-sm">👑</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{influencer.socialHandle}</p>
                    <p className="text-xs text-gray-400">{formatFollowers(influencer.followerCount)} followers</p>
                  </div>
                </div>

                {/* Staking Info */}
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatSOL(influencer.totalStaked)} SOL
                      </p>
                      <p className="text-sm text-gray-500">{formatUSD(usdValue)}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ChevronUpIcon className="w-4 h-4 text-crypto-green" />
                      <span className="text-xs text-gray-500">{influencer.stakeCount}</span>
                      <ChevronDownIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStake(influencer);
                    }}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Stake
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Growth</p>
                    <p className="font-semibold text-sm">{influencer.growthScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Engagement</p>
                    <p className="font-semibold text-sm">{influencer.engagementScore.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Retention</p>
                    <p className="font-semibold text-sm">{influencer.retentionScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              {/* Top Influencer Benefits */}
              {isTopRanked && (
                <div className="mt-4 pt-4 border-t border-yellow-200">
                  <div className="flex items-center justify-center gap-2 text-crypto-gold">
                    <span className="text-sm font-medium">🚀 Next Token Launch in 6 days</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stake Modal */}
      {selectedInfluencer && (
        <StakeModal
          influencer={selectedInfluencer}
          isOpen={showStakeModal}
          onClose={() => {
            setShowStakeModal(false);
            setSelectedInfluencer(null);
          }}
        />
      )}
    </div>
  );
}