use anchor_lang::prelude::*;

// Protocol configuration constants
pub const PROTOCOL_SEED: &[u8] = b"protocol";
pub const INFLUENCER_VAULT_SEED: &[u8] = b"influencer_vault";
pub const STAKE_POSITION_SEED: &[u8] = b"stake_position";
pub const VESTING_SCHEDULE_SEED: &[u8] = b"vesting_schedule";
pub const DEVELOPER_VESTING_SEED: &[u8] = b"developer_vesting";
pub const TOKEN_LAUNCH_CONFIG_SEED: &[u8] = b"token_launch_config";
pub const PLATFORM_TREASURY_SEED: &[u8] = b"platform_treasury";
pub const SHEIS_DAO_TREASURY_SEED: &[u8] = b"sheis_dao_treasury";

// Token distribution percentages (in basis points for precision)
pub const STAKERS_ALLOCATION: u16 = 3000; // 30%
pub const INFLUENCER_ALLOCATION: u16 = 3000; // 30%
pub const LIQUIDITY_ALLOCATION: u16 = 3000; // 30%
pub const DEVELOPER_ALLOCATION: u16 = 1000; // 10%

// Fee structure (in basis points)
pub const PRE_LAUNCH_STAKING_FEE: u16 = 100; // 1%
pub const PRE_LAUNCH_UNSTAKING_FEE: u16 = 100; // 1%
pub const POST_LAUNCH_UNSTAKING_FEE: u16 = 200; // 2%

// Protocol limits and thresholds
pub const MIN_STAKE_AMOUNT: u64 = 100_000_000; // 0.1 SOL (in lamports)
pub const MAX_STAKE_AMOUNT: u64 = 100_000_000_000; // 100 SOL (in lamports)
pub const MIN_LAUNCH_SCORE: u64 = 1_000_000_000; // 1 SOL minimum staked to launch
pub const TOTAL_TOKEN_SUPPLY: u64 = 1_000_000_000; // 1 billion tokens

// Time constants (configurable for testing in testnet)
// pub const DEFAULT_EPOCH_DURATION: i64 = 14 * 24 * 60 * 60; // 2 weeks in seconds
// pub const VERIFICATION_PERIOD: i64 = 90 * 24 * 60 * 60; // 3 months in seconds
// pub const VESTING_DURATION: i64 = 3 * 365 * 24 * 60 * 60; // 3 years in seconds

// Time constants (configurable for live solana devnet)
// pub const DEFAULT_EPOCH_DURATION: i64 = 2 * 60; // 2 minutes
// pub const VERIFICATION_PERIOD: i64 = 30 * 60; // 30 minutes
// pub const VESTING_DURATION: i64 = 180 * 60; // 3 hours

// Time constants (configurable for localnet testing)
pub const DEFAULT_EPOCH_DURATION: i64 = 2 * 60; // 2 minutes
pub const VERIFICATION_PERIOD: i64 = 30 * 60; // 30 minutes
pub const VESTING_DURATION: i64 = 180 * 60; // 3 hours

// Ranking algorithm multipliers
pub const STAKER_COUNT_MULTIPLIER: f64 = 10_000.0; // Bonus per unique staker
pub const TIME_BONUS_MULTIPLIER: f64 = 1000.0; // Bonus for early staking

// Maximum limits for gas optimization
pub const MAX_SOCIAL_HANDLE_LENGTH: usize = 32;
pub const MAX_VERIFICATION_PROOF_LENGTH: usize = 512;
pub const MAX_REASON_LENGTH: usize = 256;

// Account sizes for rent calculation
pub const GLOBAL_PROTOCOL_STATE_SIZE: usize = 8 + // discriminator
    1 + // version
    32 + // authority
    8 + // current_epoch
    8 + // epoch_start_time
    8 + // epoch_duration (configurable)
    4 + // total_influencers
    8 + // total_staked_sol
    32 + // platform_treasury
    32 + // sheis_dao_treasury
    32 + // developer_treasury
    1 + // emergency_mode
    1 + // paused
    32; // upgrade_authority

pub const INFLUENCER_VAULT_SIZE: usize = 8 + // discriminator
    32 + // influencer_id
    4 + MAX_SOCIAL_HANDLE_LENGTH + // social_handle (String)
    1 + // verification_status
    8 + // total_staked
    4 + // unique_stakers
    8 + // creation_epoch
    8 + // last_activity
    1 + // content_flag
    1 + // launch_status
    32; // ranking_score_cache

pub const STAKE_POSITION_SIZE: usize = 8 + // discriminator
    32 + // staker
    32 + // influencer_vault
    8 + // gross_amount
    8 + // net_amount
    8 + // stake_timestamp
    8 + // epoch_staked
    1; // position_status

pub const VESTING_SCHEDULE_SIZE: usize = 8 + // discriminator
    32 + // beneficiary
    8 + // total_allocation
    8 + // daily_release_amount
    8 + // claimed_amount
    8 + // sol_vesting_amount
    8 + // sol_claimed
    8 + // start_time
    8; // last_claim_time

// Multisig thresholds
pub const PLATFORM_AUTHORITY_THRESHOLD: u8 = 3;
pub const PLATFORM_AUTHORITY_SIGNERS: usize = 5;
pub const TREASURY_AUTHORITY_THRESHOLD: u8 = 4;
pub const TREASURY_AUTHORITY_SIGNERS: usize = 7;
pub const UPGRADE_AUTHORITY_THRESHOLD: u8 = 2;
pub const UPGRADE_AUTHORITY_SIGNERS: usize = 3;

// Revenue distribution (in basis points)
pub const PLATFORM_OPERATIONS_SHARE: u16 = 6000; // 60%
pub const DEVELOPMENT_FUND_SHARE: u16 = 2500; // 25%
pub const SHEIS_DAO_REVENUE_SHARE: u16 = 1500; // 15%