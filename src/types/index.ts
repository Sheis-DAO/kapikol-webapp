export interface Influencer {
  id: string;
  socialHandle: string;
  platform: SocialPlatform;
  displayName: string;
  avatarUrl?: string;
  followerCount: number;
  verified: boolean;
  verificationCode?: string;
  walletAddress?: string;
  
  // Staking and ranking data
  totalStaked: number; // SOL amount
  stakeCount: number; // Number of stakers
  rankScore: number;
  rank: number;
  
  // Token launch data
  tokenLaunchStatus: TokenLaunchStatus;
  launchStartTime?: Date;
  launchEndTime?: Date;
  tokenSymbol?: string;
  
  // Performance metrics
  growthScore: number;
  engagementScore: number;
  retentionScore: number;
  
  // Vesting info
  creatorAllocation: number;
  vestedAmount: number;
  nextVestingDate?: Date;
}

export interface Stake {
  id: string;
  stakerId: string;
  influencerId: string;
  amount: number; // SOL amount
  timestamp: Date;
  multiplier: number; // Early bird multiplier
  allocation: number; // Token allocation percentage
  isActive: boolean;
}

export interface TokenLaunch {
  id: string;
  influencerId: string;
  totalSupply: number; // 10 million tokens
  creatorAllocation: number; // 30%
  supporterAllocation: number; // 30%
  marketMakerAllocation: number; // 40%
  startTime: Date;
  endTime: Date;
  status: TokenLaunchStatus;
  totalStaked: number;
  tokenSymbol: string;
  tokenName: string;
}

export interface VerificationRequest {
  id: string;
  influencerId: string;
  platform: SocialPlatform;
  socialHandle: string;
  verificationCode: string;
  postUrl?: string;
  status: VerificationStatus;
  submittedAt: Date;
  verifiedAt?: Date;
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  TELEGRAM = 'telegram',
}

export enum TokenLaunchStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCESSFUL = 'successful',
  COMPLETED = 'completed',
}

export enum VerificationStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

export interface User {
  id: string;
  walletAddress: string;
  totalStaked: number;
  activeStakes: Stake[];
  tokenAllocations: TokenAllocation[];
}

export interface TokenAllocation {
  influencerId: string;
  tokenSymbol: string;
  totalAllocation: number;
  vestedAmount: number;
  remainingAmount: number;
  nextVestingDate?: Date;
}

export interface MarketMaker {
  id: string;
  name: string;
  walletAddress: string;
  liquidityProvided: number;
  isActive: boolean;
}