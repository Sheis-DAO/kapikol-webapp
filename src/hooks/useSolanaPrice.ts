import { useState, useEffect } from 'react';

interface SolanaPriceData {
  price: number;
  priceChange24h: number;
  loading: boolean;
  error: string | null;
}

export function useSolanaPrice(): SolanaPriceData {
  const [priceData, setPriceData] = useState<SolanaPriceData>({
    price: 0,
    priceChange24h: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setPriceData(prev => ({ ...prev, loading: true, error: null }));
        
        // Using CoinGecko API for real-time SOL price
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }
        
        const data = await response.json();
        
        setPriceData({
          price: data.solana.usd,
          priceChange24h: data.solana.usd_24h_change,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching SOL price:', error);
        setPriceData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch price data',
        }));
      }
    };

    // Fetch immediately
    fetchPrice();

    // Update every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  return priceData;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatSOL(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}