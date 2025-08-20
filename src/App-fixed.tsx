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
        <div className="hidden sm:flex items-center gap-1 bg-white rounded px-2 py-1 border border-gray-200">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <div className="text-xs">
            <span className="font-semibold">{balance.toFixed(3)} SOL</span>
            <span className="ml-1 text-xs text-gray-600">(${(balance * solPrice).toFixed(0)})</span>
          </div>
        </div>
      )}
      <WalletMultiButton className="!bg-blue-600 !hover:bg-blue-700 !text-white !font-medium !py-1 !px-3 !rounded !text-sm !transition-colors !duration-200" />
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

type ActiveSection = 'rankings' | 'launches' | 'stakes' | 'verification';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('rankings');

  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
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