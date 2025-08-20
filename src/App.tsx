import React, { useState } from 'react';
import { WalletContextProvider } from './context/WalletContext';
import { Navigation } from './components/Navigation';
import { InfluencerRanking } from './components/InfluencerRanking';
import { TokenLaunches } from './components/TokenLaunches';
import { MyStakes } from './components/MyStakes';
import { VerificationFlow } from './components/VerificationFlow';
import { MarketMakers } from './components/MarketMakers';

type ActiveSection = 'rankings' | 'launches' | 'stakes' | 'verification' | 'market-makers';

function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('rankings');

  const handleNavigate = (section: ActiveSection) => {
    setActiveSection(section);
  };

  // Listen to hash changes for navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      switch (hash) {
        case 'rankings':
          setActiveSection('rankings');
          break;
        case 'launches':
          setActiveSection('launches');
          break;
        case 'stakes':
          setActiveSection('stakes');
          break;
        case 'verification':
          setActiveSection('verification');
          break;
        case 'market-makers':
          setActiveSection('market-makers');
          break;
        default:
          setActiveSection('rankings');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'rankings':
        return <InfluencerRanking />;
      case 'launches':
        return <TokenLaunches />;
      case 'stakes':
        return <MyStakes />;
      case 'verification':
        return <VerificationFlow />;
      case 'market-makers':
        return <MarketMakers />;
      default:
        return <InfluencerRanking />;
    }
  };

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          {/* Hero Section - Only show on rankings page */}
          {activeSection === 'rankings' && (
            <div className="text-center mb-12">
              <div className="gradient-bg rounded-2xl p-8 text-white mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to Kapikol Network
                </h1>
                <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  The SocialFi platform where fans stake on micro-influencers, 
                  creators monetize early, and tokens launch every 2 weeks.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => handleNavigate('rankings')}
                    className="bg-white text-kapikol-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    View Rankings
                  </button>
                  <button 
                    onClick={() => handleNavigate('verification')}
                    className="border border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Become an Influencer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => handleNavigate('rankings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'rankings'
                  ? 'bg-kapikol-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🏆 Rankings
            </button>
            <button
              onClick={() => handleNavigate('launches')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'launches'
                  ? 'bg-kapikol-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🚀 Token Launches
            </button>
            <button
              onClick={() => handleNavigate('stakes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'stakes'
                  ? 'bg-kapikol-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              💰 My Stakes
            </button>
            <button
              onClick={() => handleNavigate('verification')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'verification'
                  ? 'bg-kapikol-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              ✅ Verification
            </button>
            <button
              onClick={() => handleNavigate('market-makers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeSection === 'market-makers'
                  ? 'bg-kapikol-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              🌊 Liquidity
            </button>
          </div>

          {/* Main Content */}
          {renderContent()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">K</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Kapikol</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Early monetization for micro-influencers through staking and tokenization.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Platform</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#rankings" className="hover:text-kapikol-600">Rankings</a></li>
                  <li><a href="#launches" className="hover:text-kapikol-600">Token Launches</a></li>
                  <li><a href="#verification" className="hover:text-kapikol-600">Verification</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-kapikol-600">Documentation</a></li>
                  <li><a href="#" className="hover:text-kapikol-600">Tokenomics</a></li>
                  <li><a href="#" className="hover:text-kapikol-600">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Community</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-kapikol-600">Discord</a></li>
                  <li><a href="#" className="hover:text-kapikol-600">Twitter</a></li>
                  <li><a href="#" className="hover:text-kapikol-600">Telegram</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
              <p>&copy; 2024 Kapikol Network. Built on Solana. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
