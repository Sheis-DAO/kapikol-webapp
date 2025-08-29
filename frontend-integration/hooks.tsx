/**
 * React Hooks for Kapikol Protocol Integration
 * 
 * Provides easy-to-use React hooks for frontend integration with automatic
 * error handling, loading states, and real-time updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { KapikolSDK } from './sdk';

// Program ID - would be different for each environment
const PROGRAM_IDS = {
  localnet: new PublicKey('KAPikoLaunchStakingProgram11111111111111111'),
  devnet: new PublicKey('KAPikoLaunchStakingProgram11111111111111111'),
  mainnet: new PublicKey('KAPikoLaunchStakingProgram11111111111111111'),
};

// Hook for SDK instance
export const useKapikolSDK = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey) return null;

    // Determine environment based on RPC endpoint
    let environment: keyof typeof PROGRAM_IDS = 'mainnet';
    if (connection.rpcEndpoint.includes('localhost')) environment = 'localnet';
    else if (connection.rpcEndpoint.includes('devnet')) environment = 'devnet';

    const programId = PROGRAM_IDS[environment];

    return new KapikolSDK(
      connection,
      wallet as any,
      programId
    );
  }, [connection, wallet.publicKey]);
};

// Global protocol state hook
export const useProtocolState = () => {
  const sdk = useKapikolSDK();
  const [globalState, setGlobalState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGlobalState = useCallback(async () => {
    if (!sdk) return;

    try {
      setLoading(true);
      setError(null);
      const state = await sdk.getGlobalState();
      setGlobalState(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch global state');
      console.error('Error fetching global state:', err);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    fetchGlobalState();
  }, [fetchGlobalState]);

  // Auto-refresh every minute
  useEffect(() => {
    if (!sdk) return;

    const interval = setInterval(fetchGlobalState, 60000);
    return () => clearInterval(interval);
  }, [fetchGlobalState, sdk]);

  return {
    globalState,
    loading,
    error,
    refetch: fetchGlobalState,
    isInitialized: !!globalState,
    epochTimeRemaining: globalState ? 
      Math.max(0, globalState.epochStartTime.toNumber() + globalState.epochDuration.toNumber() - Math.floor(Date.now() / 1000)) : 0,
  };
};

// Influencer vaults hook with pagination
export const useInfluencerVaults = (limit: number = 20, sortBy: 'ranking' | 'recent' = 'ranking') => {
  const sdk = useKapikolSDK();
  const [vaults, setVaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchVaults = useCallback(async (reset: boolean = false) => {
    if (!sdk) return;

    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const newVaults = await sdk.getAllInfluencerVaults(limit, currentOffset);
      
      if (reset) {
        setVaults(newVaults);
        setOffset(limit);
      } else {
        setVaults(prev => [...prev, ...newVaults]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(newVaults.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch influencer vaults');
      console.error('Error fetching influencer vaults:', err);
    } finally {
      setLoading(false);
    }
  }, [sdk, limit, offset]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchVaults(false);
    }
  }, [fetchVaults, loading, hasMore]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchVaults(true);
  }, [fetchVaults]);

  useEffect(() => {
    fetchVaults(true);
  }, [sdk, limit, sortBy]);

  // Sort vaults
  const sortedVaults = useMemo(() => {
    if (!vaults.length) return [];

    return [...vaults].sort((a, b) => {
      if (sortBy === 'ranking') {
        return b.account.rankingScoreCache.toNumber() - a.account.rankingScoreCache.toNumber();
      } else {
        return b.account.lastActivity.toNumber() - a.account.lastActivity.toNumber();
      }
    });
  }, [vaults, sortBy]);

  return {
    vaults: sortedVaults,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};

// User stake positions hook
export const useUserStakePositions = () => {
  const sdk = useKapikolSDK();
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!sdk || !publicKey) return;

    try {
      setLoading(true);
      setError(null);
      const userPositions = await sdk.getUserStakePositions(publicKey);
      setPositions(userPositions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stake positions');
      console.error('Error fetching stake positions:', err);
    } finally {
      setLoading(false);
    }
  }, [sdk, publicKey]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalStaked = positions.reduce((sum, pos) => sum + pos.account.netAmount.toNumber(), 0);
    const activePositions = positions.filter(pos => pos.account.positionStatus.active).length;
    const completedPositions = positions.filter(pos => pos.account.positionStatus.completed).length;

    return {
      totalStaked: totalStaked / 1e9, // Convert to SOL
      activePositions,
      completedPositions,
      totalPositions: positions.length,
    };
  }, [positions]);

  return {
    positions,
    loading,
    error,
    totals,
    refetch: fetchPositions,
  };
};

// Staking operations hook
export const useStaking = () => {
  const sdk = useKapikolSDK();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stakeOnInfluencer = useCallback(async (
    influencerVault: PublicKey,
    amountSOL: number,
    onSuccess?: (result: any) => void
  ) => {
    if (!sdk) throw new Error('SDK not initialized');

    try {
      setLoading(true);
      setError(null);
      
      const result = await sdk.stakeOnInfluencer(
        sdk.provider.wallet.payer, // This would need to be handled differently in production
        influencerVault,
        amountSOL
      );
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Staking failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  const unstakePreLaunch = useCallback(async (
    influencerVault: PublicKey,
    onSuccess?: (result: any) => void
  ) => {
    if (!sdk) throw new Error('SDK not initialized');

    try {
      setLoading(true);
      setError(null);
      
      const result = await sdk.unstakePreLaunch(
        sdk.provider.wallet.payer, // This would need to be handled differently in production
        influencerVault
      );
      
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unstaking failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sdk]);

  return {
    stakeOnInfluencer,
    unstakePreLaunch,
    loading,
    error,
    clearError: () => setError(null),
  };
};

// Real-time influencer vault updates hook
export const useInfluencerVaultUpdates = (influencerVault: PublicKey | null) => {
  const sdk = useKapikolSDK();
  const [vaultData, setVaultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sdk || !influencerVault) return;

    let subscriptionId: number | null = null;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await sdk.getInfluencerVault(influencerVault);
        setVaultData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vault data');
      } finally {
        setLoading(false);
      }
    };

    const subscribeToUpdates = () => {
      subscriptionId = sdk.subscribeToInfluencerVaultUpdates(
        influencerVault,
        (updatedVault) => {
          setVaultData(updatedVault);
        }
      );
    };

    fetchInitialData();
    subscribeToUpdates();

    return () => {
      if (subscriptionId !== null) {
        sdk.unsubscribe(subscriptionId);
      }
    };
  }, [sdk, influencerVault]);

  return {
    vaultData,
    loading,
    error,
  };
};

// Environment info hook
export const useEnvironmentInfo = () => {
  const sdk = useKapikolSDK();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!sdk) return null;

    const environmentName = sdk.getEnvironmentName();
    const isTestEnvironment = environmentName !== 'MainNet';
    
    return {
      environmentName,
      isTestEnvironment,
      rpcEndpoint: connection.rpcEndpoint,
      programId: sdk.program.programId.toString(),
      config: sdk.config,
    };
  }, [sdk, connection]);
};

// Epoch countdown hook
export const useEpochCountdown = () => {
  const { globalState } = useProtocolState();
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!globalState) return;

    const updateCountdown = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      const epochEndTime = globalState.epochStartTime.toNumber() + globalState.epochDuration.toNumber();
      const remaining = Math.max(0, epochEndTime - currentTime);
      setTimeRemaining(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [globalState]);

  const formatTime = useCallback((seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }, []);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isEpochComplete: timeRemaining === 0,
  };
};

// Toast notifications hook for transaction feedback
export const useTransactionToasts = () => {
  const showSuccess = useCallback((message: string, txId?: string) => {
    // Implementation would depend on your toast library
    console.log(`✅ ${message}`, txId ? `Transaction: ${txId}` : '');
  }, []);

  const showError = useCallback((message: string, error?: any) => {
    console.error(`❌ ${message}`, error);
  }, []);

  const showLoading = useCallback((message: string) => {
    console.log(`⏳ ${message}`);
  }, []);

  return {
    showSuccess,
    showError,
    showLoading,
  };
};