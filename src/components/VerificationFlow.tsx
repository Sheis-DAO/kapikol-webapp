import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { SocialPlatform, VerificationStatus } from '../types';
import { useWallet } from '@solana/wallet-adapter-react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface VerificationStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'complete';
}

export function VerificationFlow() {
  const { connected, publicKey } = useWallet();
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>(SocialPlatform.INSTAGRAM);
  const [socialHandle, setSocialHandle] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const platforms = [
    { id: SocialPlatform.INSTAGRAM, name: 'Instagram', icon: '📷', color: 'bg-pink-500' },
    { id: SocialPlatform.YOUTUBE, name: 'YouTube', icon: '📺', color: 'bg-red-600' },
    { id: SocialPlatform.TIKTOK, name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { id: SocialPlatform.TWITTER, name: 'X (Twitter)', icon: '🐦', color: 'bg-blue-500' },
    { id: SocialPlatform.FACEBOOK, name: 'Facebook', icon: '👤', color: 'bg-blue-600' },
    { id: SocialPlatform.TELEGRAM, name: 'Telegram', icon: '✈️', color: 'bg-blue-400' },
  ];

  const generateVerificationCode = () => {
    const code = `KAPIKOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setVerificationCode(code);
    setCurrentStep(2);
  };

  const steps: VerificationStep[] = [
    {
      id: 1,
      title: 'Platform Selection',
      description: 'Choose your social media platform and enter your handle',
      status: currentStep > 1 ? 'complete' : 'current',
    },
    {
      id: 2,
      title: 'Generate Code',
      description: 'Get your unique verification code',
      status: currentStep > 2 ? 'complete' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      id: 3,
      title: 'Post Verification',
      description: 'Post the code on your social media account',
      status: currentStep > 3 ? 'complete' : currentStep === 3 ? 'current' : 'pending',
    },
    {
      id: 4,
      title: 'Confirmation',
      description: 'Wait for our system to verify your post',
      status: currentStep > 4 ? 'complete' : currentStep === 4 ? 'current' : 'pending',
    },
  ];

  const handleSubmitPost = () => {
    if (!postUrl) return;
    setCurrentStep(4);
    
    // Simulate verification process
    setTimeout(() => {
      alert('Verification successful! You can now participate in token launches.');
      setCurrentStep(1);
      setSocialHandle('');
      setVerificationCode('');
      setPostUrl('');
    }, 3000);
  };

  if (!connected) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Your Wallet</h3>
        <p className="text-gray-600 mb-6">
          You need to connect your Solana wallet to start the verification process.
        </p>
        <button className="btn-primary">Connect Wallet</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Influencer Verification</h2>
        <p className="text-gray-600">
          Verify your social media account to participate in token launches
        </p>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li
                key={step.id}
                className={classNames(
                  stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
                  'relative'
                )}
              >
                <>
                  {step.status === 'complete' ? (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-kapikol-600" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                  )}
                  <div
                    className={classNames(
                      'relative flex h-8 w-8 items-center justify-center rounded-full',
                      step.status === 'complete'
                        ? 'bg-kapikol-600 text-white'
                        : step.status === 'current'
                        ? 'border-2 border-kapikol-600 bg-white text-kapikol-600'
                        : 'border-2 border-gray-300 bg-white text-gray-500'
                    )}
                  >
                    {step.status === 'complete' ? (
                      <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="card">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Select Your Platform</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={classNames(
                    'p-4 rounded-lg border-2 text-center transition-all duration-200',
                    selectedPlatform === platform.id
                      ? 'border-kapikol-500 bg-kapikol-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">{platform.icon}</div>
                  <div className="font-medium text-gray-900">{platform.name}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your {platforms.find(p => p.id === selectedPlatform)?.name} Handle
              </label>
              <input
                type="text"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                placeholder="@your_handle"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kapikol-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={generateVerificationCode}
              disabled={!socialHandle}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Verification Code
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Your Verification Code</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Copy this code:</p>
              <div className="font-mono text-lg font-bold text-kapikol-600 bg-white rounded px-4 py-2 border border-gray-200">
                {verificationCode}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(verificationCode)}
                className="mt-2 text-sm text-kapikol-600 hover:text-kapikol-700"
              >
                Copy to Clipboard
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Next Steps:</h4>
              <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                <li>Post this code on your {platforms.find(p => p.id === selectedPlatform)?.name} account</li>
                <li>Include "Kapikol Network" in your post</li>
                <li>Make sure the post is public</li>
                <li>Copy the post URL and return here</li>
              </ol>
            </div>

            <button
              onClick={() => setCurrentStep(3)}
              className="w-full btn-primary"
            >
              I've Posted the Code
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Submit Your Post</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post URL
              </label>
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kapikol-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the direct link to your verification post
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Verification Requirements:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Post contains the verification code: <code className="bg-blue-100 px-1 rounded">{verificationCode}</code></li>
                <li>✓ Post mentions "Kapikol Network"</li>
                <li>✓ Post is public and accessible</li>
                <li>✓ Account matches the handle: <code className="bg-blue-100 px-1 rounded">{socialHandle}</code></li>
              </ul>
            </div>

            <button
              onClick={handleSubmitPost}
              disabled={!postUrl}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit for Verification
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <div className="animate-pulse">
              <ClockIcon className="w-16 h-16 text-kapikol-500 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Verification in Progress</h3>
            <p className="text-gray-600">
              Our system is checking your post. This usually takes 1-3 minutes.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                We're verifying:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Post accessibility and content</li>
                <li>• Account ownership verification</li>
                <li>• Follower count and engagement metrics</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}