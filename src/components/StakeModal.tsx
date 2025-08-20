import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useWallet } from '@solana/wallet-adapter-react';
import { Influencer } from '../types';
import { useSolanaPrice, formatUSD, formatSOL } from '../hooks/useSolanaPrice';

interface StakeModalProps {
  influencer: Influencer;
  isOpen: boolean;
  onClose: () => void;
}

export function StakeModal({ influencer, isOpen, onClose }: StakeModalProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const { connected, publicKey } = useWallet();
  const { price: solPrice } = useSolanaPrice();

  const stakeValue = parseFloat(stakeAmount) || 0;
  const usdValue = stakeValue * solPrice;

  // Calculate early bird multiplier (decreases over time)
  const getMultiplier = () => {
    // Simulate time-based multiplier
    const now = new Date();
    const launchStart = influencer.launchStartTime || new Date();
    const hoursElapsed = Math.max(0, (now.getTime() - launchStart.getTime()) / (1000 * 60 * 60));
    
    // m(t) = 1 + k * exp(-λt) where k=0.5, λ=0.1
    const multiplier = 1 + 0.5 * Math.exp(-0.1 * hoursElapsed);
    return Math.max(1, multiplier);
  };

  const multiplier = getMultiplier();
  const estimatedAllocation = (stakeValue / (influencer.totalStaked + stakeValue)) * 3000000 * multiplier;

  const handleStake = async () => {
    if (!connected || !publicKey || !stakeAmount) {
      return;
    }

    setIsStaking(true);
    
    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Create a Solana transaction to stake SOL
      // 2. Update the influencer's total staked amount
      // 3. Record the stake in the database
      // 4. Calculate and assign token allocation
      
      alert(`Successfully staked ${stakeAmount} SOL on ${influencer.displayName}!`);
      onClose();
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Stake on {influencer.displayName}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Influencer Info */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={influencer.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName)}&size=48&background=random`}
                    alt={influencer.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{influencer.displayName}</h4>
                    <p className="text-sm text-gray-600">{influencer.socialHandle}</p>
                    <p className="text-xs text-gray-500">Rank #{influencer.rank} • {formatSOL(influencer.totalStaked)} SOL staked</p>
                  </div>
                </div>

                {!connected ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">Connect your wallet to stake SOL</p>
                    <button className="btn-primary">Connect Wallet</button>
                  </div>
                ) : (
                  <>
                    {/* Stake Amount Input */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stake Amount (SOL)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kapikol-500 focus:border-transparent"
                        />
                        <div className="absolute right-3 top-2 text-sm text-gray-500">SOL</div>
                      </div>
                      {stakeValue > 0 && (
                        <p className="text-sm text-gray-600 mt-1">≈ {formatUSD(usdValue)}</p>
                      )}
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-6">
                      {[0.1, 0.5, 1, 5].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setStakeAmount(amount.toString())}
                          className="btn-secondary text-sm py-1"
                        >
                          {amount} SOL
                        </button>
                      ))}
                    </div>

                    {/* Allocation Preview */}
                    {stakeValue > 0 && (
                      <div className="bg-kapikol-50 rounded-lg p-4 mb-6 space-y-2">
                        <h5 className="font-medium text-gray-900">Estimated Token Allocation</h5>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Early Bird Multiplier:</span>
                            <span className="font-medium text-crypto-green">{multiplier.toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated {influencer.tokenSymbol} Tokens:</span>
                            <span className="font-medium">{Math.floor(estimatedAllocation).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            * Allocation based on your stake proportion with early bird bonus
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Important Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                      <h6 className="font-medium text-yellow-800 text-sm mb-1">Important:</h6>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Tokens vest linearly over 3 years</li>
                        <li>• Early stakers receive higher multipliers</li>
                        <li>• Continued staking accelerates vesting</li>
                        <li>• Can unstake anytime but reduces vesting rate</li>
                      </ul>
                    </div>

                    {/* Stake Button */}
                    <button
                      onClick={handleStake}
                      disabled={!stakeAmount || isStaking || parseFloat(stakeAmount) <= 0}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isStaking ? 'Staking...' : `Stake ${stakeAmount || '0'} SOL`}
                    </button>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}