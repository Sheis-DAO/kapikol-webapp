import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaPrice, formatUSD } from '../hooks/useSolanaPrice';

export function WalletConnection() {
  const { connected, publicKey, disconnect } = useWallet();
  const { price, priceChange24h, loading } = useSolanaPrice();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4">
      {/* SOL Price Display */}
      <div className="hidden md:flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        <div className="text-sm">
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : (
            <>
              <span className="font-semibold">{formatUSD(price)}</span>
              <span className={`ml-1 text-xs ${priceChange24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </>
          )}
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="flex items-center">
        {connected && publicKey ? (
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-3 py-2 border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {formatAddress(publicKey.toString())}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <WalletMultiButton className="!bg-kapikol-600 hover:!bg-kapikol-700 !rounded-lg !font-medium !transition-colors !duration-200" />
        )}
      </div>
    </div>
  );
}