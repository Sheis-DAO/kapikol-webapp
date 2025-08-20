import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Countdown Component for Token Launch
function TokenLaunchCountdown({ targetDate, tokenSymbol }: { targetDate: Date; tokenSymbol: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

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

    // Trigger animations after component mounts
    setTimeout(() => setIsLoaded(true), 100);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEC' },
  ];

  return (
    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 border border-yellow-200 max-w-xs mx-auto">
      <div className="text-center mb-3">
        <h4 className="text-sm font-bold text-yellow-800 mb-1">🚀 {tokenSymbol} TOKEN LAUNCH</h4>
        <p className="text-xs text-yellow-700">Countdown to Launch</p>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        {timeUnits.map((unit, index) => (
          <Transition
            key={unit.label}
            show={isLoaded}
            appear={true}
            enter="transition-all duration-500 ease-out"
            enterFrom="opacity-0 scale-75 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="text-center">
              <div className="bg-yellow-800 text-yellow-100 rounded-lg w-12 h-12 flex items-center justify-center font-mono text-lg font-bold shadow-lg mx-auto mb-1">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-yellow-600 font-medium">{unit.label}</div>
            </div>
          </Transition>
        ))}
      </div>
      
      <div className="flex justify-center gap-1">
        <button className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-0.5 rounded font-medium transition-colors">
          Tokenomics
        </button>
        <button className="text-xs bg-orange-600 hover:bg-orange-700 text-white px-2 py-0.5 rounded font-medium transition-colors">
          Stake Now
        </button>
      </div>
    </div>
  );
}

// Wallet connection component with balance display
function WalletConnection() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const solPrice = 150; // Mock SOL price

  useEffect(() => {
    if (publicKey) {
      // Fetch wallet balance
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }).catch(console.error);
    } else {
      setBalance(null);
    }
  }, [publicKey, connection]);

  return (
    <div className="flex items-center gap-2">
      {publicKey && balance !== null && (
        <div className="hidden sm:flex items-center gap-1 bg-white rounded px-2 py-1 border border-gray-200 h-8">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold">{balance.toFixed(3)} SOL</span>
            <span className="ml-1 text-xs text-gray-600">(${(balance * solPrice).toFixed(0)})</span>
          </div>
        </div>
      )}
      <WalletMultiButton 
        className="!bg-blue-600 !hover:bg-blue-700 !text-white !font-medium !rounded !text-sm !transition-colors !duration-200"
        style={{
          height: '32px',
          padding: '4px 12px',
          fontSize: '14px',
          minHeight: '32px',
          lineHeight: '24px'
        }}
      />
    </div>
  );
}

function Navigation() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-3 lg:px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Kapikol</span>
        </div>
        
        <div className="flex items-center">
          <WalletConnection />
        </div>
      </nav>
    </header>
  );
}

function InfluencerRanking() {
  const mockInfluencers = [
    {
      id: '1',
      displayName: 'Yuki Tanaka',
      socialHandle: '@crypto_beauty_jp',
      platform: 'Instagram',
      totalStaked: 2847.5,
      stakeCount: 127,
      rank: 1,
      verified: true,
      avatarUrl: '/creator_1.JPG',
      tokenSymbol: 'YUKI',
      launchDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    },
    {
      id: '2', 
      displayName: 'Mei Sato',
      socialHandle: '@fashion_forward_tokyo',
      platform: 'TikTok',
      totalStaked: 1923.2,
      stakeCount: 89,
      rank: 2,
      verified: true,
      avatarUrl: '/creator_2.jpg',
      tokenSymbol: 'MEI',
      launchDate: undefined,
    },
    {
      id: '3',
      displayName: 'Aiko Yamamoto', 
      socialHandle: '@lifestyle_guru_jp',
      platform: 'YouTube',
      totalStaked: 1456.8,
      stakeCount: 65,
      rank: 3,
      verified: false,
      avatarUrl: '/creator_3.jpg',
      tokenSymbol: 'AIKO',
      launchDate: undefined,
    },
    {
      id: '4',
      displayName: 'Rin Nakamura',
      socialHandle: '@tokyo_streetwear',
      platform: 'Instagram',
      totalStaked: 987.3,
      stakeCount: 42,
      rank: 4,
      verified: true,
      avatarUrl: '/happy_business_woman.jpg',
      tokenSymbol: 'RIN',
      launchDate: undefined,
    },
    {
      id: '5',
      displayName: 'Kenta Suzuki',
      socialHandle: '@tech_review_japan',
      platform: 'Twitter',
      totalStaked: 743.1,
      stakeCount: 31,
      rank: 5,
      verified: false,
      avatarUrl: '/creator_4.jpg',
      tokenSymbol: 'KENTA',
      launchDate: undefined,
    },
    {
      id: '6',
      displayName: 'Hana Kimura',
      socialHandle: '@beauty_insider_jp',
      platform: 'Instagram',
      totalStaked: 654.7,
      stakeCount: 28,
      rank: 6,
      verified: true,
      avatarUrl: '/asian_business_woman.JPG',
      tokenSymbol: 'HANA',
      launchDate: undefined,
    },
    {
      id: '7',
      displayName: 'Takeshi Yamada',
      socialHandle: '@crypto_analyst_tk',
      platform: 'YouTube',
      totalStaked: 543.2,
      stakeCount: 23,
      rank: 7,
      verified: true,
      avatarUrl: '/creator_5.jpg',
      tokenSymbol: 'TAKE',
      launchDate: undefined,
    },
    {
      id: '8',
      displayName: 'Sakura Nishida',
      socialHandle: '@fashion_sakura',
      platform: 'TikTok',
      totalStaked: 432.8,
      stakeCount: 19,
      rank: 8,
      verified: false,
      avatarUrl: '/creator_6.jpg',
      tokenSymbol: 'SAKURA',
      launchDate: undefined,
    },
    {
      id: '9',
      displayName: 'Hiroshi Tanaka',
      socialHandle: '@defi_hiroshi',
      platform: 'Twitter',
      totalStaked: 387.5,
      stakeCount: 16,
      rank: 9,
      verified: true,
      avatarUrl: '/creator_7.jpg',
      tokenSymbol: 'HIRO',
      launchDate: undefined,
    },
    {
      id: '10',
      displayName: 'Maya Yoshida',
      socialHandle: '@lifestyle_maya',
      platform: 'Instagram',
      totalStaked: 298.3,
      stakeCount: 14,
      rank: 10,
      verified: false,
      avatarUrl: '/successful_business_woman.jpg',
      tokenSymbol: 'MAYA',
      launchDate: undefined,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Influencer Rankings</h2>
        <p className="text-gray-600 text-sm">Stake SOL on your favorite influencers and earn token allocations</p>
      </div>

      <div className="grid gap-2">
        {mockInfluencers.map((influencer, index) => {
          const usdValue = influencer.totalStaked * 150; // Mock SOL price
          const isTopRanked = index === 0;
          
          return (
            <div
              key={influencer.id}
              className={`bg-white rounded-lg shadow border p-3 hover:shadow-md transition-all duration-200 cursor-pointer ${
                isTopRanked ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' : 
                index < 3 ? 'border-gray-300 shadow-md' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    isTopRanked ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' : 
                    index < 3 ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="relative">
                    <img
                      src={influencer.avatarUrl}
                      alt={influencer.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      style={{
                        objectPosition: 'center 25%', // Focus on face area
                      }}
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.displayName)}&size=40&background=random`;
                      }}
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      influencer.platform === 'Instagram' ? 'bg-gradient-to-r from-pink-500 to-yellow-500' :
                      influencer.platform === 'TikTok' ? 'bg-black' :
                      influencer.platform === 'YouTube' ? 'bg-red-600' :
                      influencer.platform === 'Twitter' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {influencer.platform === 'Instagram' ? '📷' :
                       influencer.platform === 'TikTok' ? '🎵' :
                       influencer.platform === 'YouTube' ? '📺' :
                       influencer.platform === 'Twitter' ? '🐦' :
                       influencer.platform[0]}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {influencer.displayName}
                      </h3>
                      {influencer.verified && (
                        <span className="text-blue-500 text-xs">✓</span>
                      )}
                      {isTopRanked && (
                        <span className="text-yellow-500 text-xs">👑</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{influencer.socialHandle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {influencer.totalStaked.toFixed(1)} SOL
                      </p>
                      <p className="text-xs text-gray-500">${(usdValue/1000).toFixed(1)}k</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-gray-500 block">{influencer.stakeCount}</span>
                      <span className="text-xs text-gray-400">stakers</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors">
                      Stake
                    </button>
                  </div>
                </div>
              </div>

              {isTopRanked && influencer.launchDate && (
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  <TokenLaunchCountdown 
                    targetDate={influencer.launchDate} 
                    tokenSymbol={influencer.tokenSymbol || 'TOKEN'} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MyStakesSection() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((lamports) => {
        setBalance(lamports / LAMPORTS_PER_SOL);
      }).catch(console.error);
    }
  }, [publicKey, connection]);

  if (!connected) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">My Stakes</h2>
        <p className="text-gray-600 mb-6">Connect your wallet to view your stakes and earnings</p>
        <WalletMultiButton className="!bg-blue-600 !hover:bg-blue-700 !text-white !font-medium !py-3 !px-6 !rounded-lg !transition-colors" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Stakes</h2>
        <p className="text-gray-600">Your current stakes and earnings overview</p>
      </div>

      {/* Wallet Info Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Wallet Address</p>
            <p className="font-mono text-xs text-gray-900 break-all">{publicKey?.toString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">SOL Balance</p>
            <p className="font-semibold text-lg text-gray-900">
              {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Network</p>
            <p className="font-medium text-gray-900">Devnet</p>
          </div>
        </div>
      </div>

      {/* Stakes Overview */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Stakes</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-gray-600 mb-2">No stakes yet</p>
          <p className="text-sm text-gray-500">Start staking on influencers to see your positions here</p>
        </div>
      </div>
    </div>
  );
}

// Mock API function to simulate social media search
async function searchSocialMedia(handle: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data for demonstration
  const mockResults = {
    instagram: {
      found: handle.includes('fashion') || handle.includes('beauty') || handle.includes('lifestyle'),
      data: {
        username: handle,
        displayName: handle.includes('fashion') ? 'Fashion Forward' : handle.includes('beauty') ? 'Beauty Insider' : 'Lifestyle Guru',
        followers: Math.floor(Math.random() * 100000) + 10000,
        following: Math.floor(Math.random() * 1000) + 100,
        profilePicture: '/creator_1.JPG',
        verified: Math.random() > 0.5,
        platform: 'Instagram'
      }
    },
    tiktok: {
      found: handle.includes('dance') || handle.includes('music') || handle.includes('viral'),
      data: {
        username: handle,
        displayName: handle.includes('dance') ? 'Dance Queen' : handle.includes('music') ? 'Music Maker' : 'Viral Creator',
        followers: Math.floor(Math.random() * 500000) + 50000,
        following: Math.floor(Math.random() * 500) + 50,
        profilePicture: '/creator_2.jpg',
        verified: Math.random() > 0.6,
        platform: 'TikTok'
      }
    },
    youtube: {
      found: handle.includes('tech') || handle.includes('review') || handle.includes('tutorial'),
      data: {
        username: handle,
        displayName: handle.includes('tech') ? 'Tech Reviewer' : handle.includes('review') ? 'Product Reviews' : 'Tutorial Master',
        followers: Math.floor(Math.random() * 200000) + 5000,
        following: Math.floor(Math.random() * 300) + 50,
        profilePicture: '/creator_3.jpg',
        verified: Math.random() > 0.4,
        platform: 'YouTube'
      }
    },
    twitter: {
      found: handle.includes('crypto') || handle.includes('defi') || handle.includes('blockchain'),
      data: {
        username: handle,
        displayName: handle.includes('crypto') ? 'Crypto Analyst' : handle.includes('defi') ? 'DeFi Expert' : 'Blockchain Guru',
        followers: Math.floor(Math.random() * 50000) + 5000,
        following: Math.floor(Math.random() * 2000) + 200,
        profilePicture: '/creator_4.jpg',
        verified: Math.random() > 0.3,
        platform: 'Twitter'
      }
    }
  };
  
  return mockResults;
}

function SocialMediaSearch({ onInitiateStake }: { onInitiateStake: (influencer: any) => void }) {
  const [searchHandle, setSearchHandle] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchHandle.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchSocialMedia(searchHandle);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInitiate = (influencerData: any) => {
    setSelectedInfluencer(influencerData);
    onInitiateStake(influencerData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Find Your Influencer</h3>
        <p className="text-sm text-gray-600">Search for influencers across multiple social media platforms and initiate staking</p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Enter social media handle (e.g., @username)"
            value={searchHandle}
            onChange={(e) => setSearchHandle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchHandle.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Search Results:</h4>
          <div className="grid gap-3">
            {Object.entries(searchResults).map(([platform, result]: [string, any]) => {
              if (!result.found) return null;
              
              const { data } = result;
              return (
                <div key={platform} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={data.profilePicture}
                        alt={data.displayName}
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                        style={{ objectPosition: 'center 25%' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">{data.displayName}</h5>
                          {data.verified && <span className="text-blue-500 text-sm">✓</span>}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                            platform === 'tiktok' ? 'bg-gray-100 text-gray-800' :
                            platform === 'youtube' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {data.platform}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{data.username}</p>
                        <div className="flex gap-4 text-xs text-gray-500 mt-1">
                          <span>{data.followers.toLocaleString()} followers</span>
                          <span>{data.following.toLocaleString()} following</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInitiate(data)}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Initiate Stake
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {searchResults && Object.values(searchResults).every((r: any) => !r.found) && (
        <div className="text-center py-4">
          <p className="text-gray-600">No influencers found with handle "{searchHandle}"</p>
          <p className="text-sm text-gray-500 mt-1">Try searching for handles containing: fashion, beauty, lifestyle, dance, music, tech, review, crypto, defi</p>
        </div>
      )}
    </div>
  );
}

function InitiateStake({ influencer, onBack }: { influencer: any; onBack: () => void }) {
  const { publicKey, connected } = useWallet();
  const [stakeAmount, setStakeAmount] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const solPrice = 150; // Mock SOL price

  const handleStake = async () => {
    if (!connected || !stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    setIsStaking(true);
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here would be actual Solana transaction logic
    alert(`Successfully staked ${stakeAmount} SOL on ${influencer.displayName}!`);
    setIsStaking(false);
    onBack();
  };

  const usdValue = stakeAmount ? (parseFloat(stakeAmount) * solPrice).toFixed(2) : '0.00';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Search
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Initiate Stake</h2>
      </div>

      {/* Influencer Info Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={influencer.profilePicture}
            alt={influencer.displayName}
            className="w-16 h-16 rounded-full object-cover border border-gray-300"
            style={{ objectPosition: 'center 25%' }}
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-gray-900">{influencer.displayName}</h3>
              {influencer.verified && <span className="text-blue-500">✓</span>}
            </div>
            <p className="text-gray-600">{influencer.username}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                influencer.platform === 'Instagram' ? 'bg-pink-100 text-pink-800' :
                influencer.platform === 'TikTok' ? 'bg-gray-100 text-gray-800' :
                influencer.platform === 'YouTube' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {influencer.platform}
              </span>
              <span>{influencer.followers.toLocaleString()} followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staking Form */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Stake Details</h4>
        
        {!connected ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Connect your wallet to stake on this influencer</p>
            <WalletMultiButton className="!bg-blue-600 !hover:bg-blue-700 !text-white !font-medium !py-2 !px-6 !rounded-lg !transition-colors" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stake Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stake Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="Enter SOL amount"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                />
                <span className="absolute right-3 top-2 text-gray-500 text-sm">SOL</span>
              </div>
              {stakeAmount && (
                <p className="text-sm text-gray-600 mt-1">
                  ≈ ${usdValue} USD (at $150/SOL)
                </p>
              )}
            </div>

            {/* Support Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Message (Optional)
              </label>
              <textarea
                placeholder="Leave a message of support for this influencer..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Share why you believe in this creator</span>
                <span>{supportMessage.length}/500</span>
              </div>
            </div>

            {/* Stake Summary */}
            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-2">Stake Summary</h5>
                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Stake Amount:</span>
                    <span>{stakeAmount} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>USD Value:</span>
                    <span>${usdValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Token Allocation:</span>
                    <span>{(parseFloat(stakeAmount) * 1000).toFixed(0)} tokens*</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  *Token allocation calculated when influencer launches (1000 tokens per SOL staked)
                </p>
              </div>
            )}

            {/* Stake Button */}
            <button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {isStaking ? 'Processing Stake...' : `Stake ${stakeAmount || '0'} SOL`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type ActiveSection = 'rankings' | 'launches' | 'stakes' | 'verification' | 'initiate';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('rankings');
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);

  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
    if (section !== 'initiate') {
      setSelectedInfluencer(null);
    }
  };

  const handleInitiateStake = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setActiveSection('initiate');
  };

  const handleBackToSearch = () => {
    setSelectedInfluencer(null);
    setActiveSection('rankings');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'rankings':
        return <InfluencerRanking />;
      case 'launches':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Token Launches</h2>
            <p className="text-gray-600">Token launch interface coming soon...</p>
          </div>
        );
      case 'stakes':
        return <MyStakesSection />;
      case 'verification':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Claim Your Influencer Token</h2>
            <p className="text-gray-600 mb-6">Verify your social media account and claim your unique token to start earning from your influence</p>
            <div className="max-w-2xl mx-auto text-left bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Claim Your Token:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Connect Your Social Account</h4>
                    <p className="text-sm text-gray-600">Link your Instagram, YouTube, TikTok, or Twitter account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Post Verification Code</h4>
                    <p className="text-sm text-gray-600">Share a unique code on your social media to prove ownership</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-medium text-gray-900">Launch Your Token</h4>
                    <p className="text-sm text-gray-600">Get ranked by your community and launch your personal token when you reach #1</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Start Token Claim Process
              </button>
            </div>
          </div>
        );
      case 'initiate':
        return selectedInfluencer ? (
          <InitiateStake 
            influencer={selectedInfluencer} 
            onBack={handleBackToSearch} 
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No influencer selected</p>
          </div>
        );
      default:
        return <InfluencerRanking />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="mx-auto max-w-6xl px-4 py-4 lg:px-6">
        {/* Hero Section - Only show on rankings page */}
        {activeSection === 'rankings' && (
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl p-6 text-white mb-4">
              <h1 className="text-2xl font-bold mb-2">
                Welcome to Kapikol Network
              </h1>
              <p className="text-sm text-white/90 mb-4 max-w-xl mx-auto">
                The SocialFi platform where fans stake on micro-influencers, 
                creators monetize early, and tokens launch every 2 weeks.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => handleNavigate('rankings')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  View Rankings
                </button>
                <button 
                  onClick={() => handleNavigate('verification')}
                  className="border border-white text-white hover:bg-white/10 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Claim Your Token
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={() => handleNavigate('rankings')}
            className={`px-3 py-1 rounded font-medium transition-colors text-sm ${
              activeSection === 'rankings'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🏆 Rankings
          </button>
          <button
            onClick={() => handleNavigate('launches')}
            className={`px-3 py-1 rounded font-medium transition-colors text-sm ${
              activeSection === 'launches'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🚀 Launches
          </button>
          <button
            onClick={() => handleNavigate('stakes')}
            className={`px-3 py-1 rounded font-medium transition-colors text-sm ${
              activeSection === 'stakes'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            💰 Stakes
          </button>
          <button
            onClick={() => handleNavigate('verification')}
            className={`px-3 py-1 rounded font-medium transition-colors text-sm ${
              activeSection === 'verification'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🎯 Claim
          </button>
        </div>

        {/* Search Component - Only show on rankings page */}
        {activeSection === 'rankings' && (
          <SocialMediaSearch onInitiateStake={handleInitiateStake} />
        )}

        {/* Main Content */}
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Kapikol</span>
            </div>
            <p className="text-gray-600 text-xs mb-2">
              Early monetization for micro-influencers through staking and tokenization.
            </p>
            <p className="text-xs text-gray-500">
              &copy; 2024 Kapikol Network. Built on Solana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;