import React, { useState, useEffect } from 'react';
import { ClockIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { getActiveTokenLaunches, getTopInfluencer } from '../data/mockData';
import { TokenLaunchStatus } from '../types';
import { useSolanaPrice, formatUSD, formatSOL } from '../hooks/useSolanaPrice';

interface CountdownProps {
  targetDate: Date;
  label: string;
}

function Countdown({ targetDate, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex justify-center gap-2">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ].map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-1">
            <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm font-mono min-w-[2rem] text-center">
              {unit.value.toString().padStart(2, '0')}
            </div>
            {index < 3 && <span className="text-gray-400">:</span>}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-1">
        {['Days', 'Hours', 'Min', 'Sec'].map((label) => (
          <span key={label} className="text-xs text-gray-500">{label}</span>
        ))}
      </div>
    </div>
  );
}

export function TokenLaunches() {
  const { price: solPrice } = useSolanaPrice();
  const activeLaunches = getActiveTokenLaunches();
  const topInfluencer = getTopInfluencer();
  
  // Calculate next launch date (every 2 weeks)
  const nextLaunchDate = new Date();
  nextLaunchDate.setDate(nextLaunchDate.getDate() + 6); // 6 days from now for demo

  const calculateProgress = (startTime: Date, endTime: Date) => {
    const now = new Date().getTime();
    const start = startTime.getTime();
    const end = endTime.getTime();
    const progress = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Token Launches</h2>
        <p className="text-gray-600">
          Every 2 weeks, the top-ranked influencer launches their token
        </p>
      </div>

      {/* Next Launch Countdown */}
      <div className="card bg-gradient-to-r from-kapikol-500 to-purple-600 text-white">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrophyIcon className="w-6 h-6" />
            <h3 className="text-xl font-bold">Next Token Launch</h3>
          </div>
          <p className="text-kapikol-100">Top-ranked influencer gets to launch their token</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <img
                src={topInfluencer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topInfluencer.displayName)}&size=64&background=random`}
                alt={topInfluencer.displayName}
                className="w-16 h-16 rounded-full border-2 border-white"
              />
              <div>
                <h4 className="font-bold text-lg">{topInfluencer.displayName}</h4>
                <p className="text-kapikol-100">{topInfluencer.socialHandle}</p>
                <p className="text-sm text-kapikol-200">
                  {formatSOL(topInfluencer.totalStaked)} SOL staked
                </p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-sm text-kapikol-100 mb-1">Token Symbol</p>
              <p className="font-bold text-xl">{topInfluencer.tokenSymbol}</p>
            </div>
          </div>

          <div>
            <Countdown targetDate={nextLaunchDate} label="Launch starts in:" />
          </div>
        </div>
      </div>

      {/* Active Launches */}
      {activeLaunches.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-orange-500" />
            Active Launches
          </h3>
          
          <div className="grid gap-4">
            {activeLaunches.map((influencer) => {
              const progress = calculateProgress(
                influencer.launchStartTime!,
                influencer.launchEndTime!
              );
              const usdValue = influencer.totalStaked * solPrice;
              
              return (
                <div key={influencer.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={influencer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName)}&size=56&background=random`}
                        alt={influencer.displayName}
                        className="w-14 h-14 rounded-full"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{influencer.displayName}</h4>
                        <p className="text-sm text-gray-600">{influencer.socialHandle}</p>
                        <p className="text-xs text-gray-500">Token: {influencer.tokenSymbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                        LIVE
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Launch Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-kapikol-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Launch Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Staked</p>
                      <p className="font-semibold">{formatSOL(influencer.totalStaked)} SOL</p>
                      <p className="text-xs text-gray-400">{formatUSD(usdValue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stakers</p>
                      <p className="font-semibold">{influencer.stakeCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Token Supply</p>
                      <p className="font-semibold">10M</p>
                      <p className="text-xs text-gray-400">{influencer.tokenSymbol}</p>
                    </div>
                  </div>

                  {/* Countdown to End */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Countdown
                      targetDate={influencer.launchEndTime!}
                      label="Launch ends in:"
                    />
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <button className="w-full btn-primary">
                      Stake Now - Get {influencer.tokenSymbol} Tokens
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Launch Mechanics Info */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Token Launches Work</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Every 2 Weeks</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Top-ranked influencer launches their token</li>
              <li>• 10 million tokens total supply</li>
              <li>• 2-week staking window</li>
              <li>• Early stakers get bonus multipliers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Token Distribution</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 30% to Stakers (linear vesting over 3 years)</li>
              <li>• 30% to Influencer (performance-based vesting)</li>
              <li>• 40% to Market Makers (liquidity provision)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}