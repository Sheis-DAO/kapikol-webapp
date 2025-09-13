import React, { useState } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('rankings');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Kapikol</span>
          </div>
          
          <div className="hidden lg:flex lg:gap-x-12">
            <a href="#rankings" className="text-sm font-semibold leading-6 text-gray-900">Rankings</a>
            <a href="#launches" className="text-sm font-semibold leading-6 text-gray-900">Active Launches</a>
            <a href="#stakes" className="text-sm font-semibold leading-6 text-gray-900">My Stakes</a>
            <a href="#verification" className="text-sm font-semibold leading-6 text-gray-900">Verification</a>
          </div>
          
          <div className="hidden lg:flex">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Connect Wallet
            </button>
          </div>
        </nav>
      </header>
      
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="text-center mb-12">
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl p-8 text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Kapikol Network
            </h1>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              The SocialFi platform where fans stake on micro-influencers, 
              creators monetize early, and tokens launch every 2 weeks.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors">
                View Rankings
              </button>
              <button className="border border-white text-white hover:bg-white/10 font-semibold py-3 px-6 rounded-lg transition-colors">
                Become an Influencer
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Influencer Rankings</h2>
          <p className="text-gray-600">Stake SOL on your favorite influencers and earn token allocations</p>
        </div>

        <div className="mt-8 grid gap-4">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-200 text-gray-700">
                    {rank}
                  </div>
                  <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Influencer #{rank}</h3>
                    <p className="text-sm text-gray-500">@handle_{rank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{(100 - rank * 15).toFixed(2)} SOL</p>
                  <p className="text-sm text-gray-500">≈ ${((100 - rank * 15) * 150).toFixed(0)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;