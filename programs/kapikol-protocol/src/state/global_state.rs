use anchor_lang::prelude::*;
use crate::constants::*;

/// Global protocol state - Gas optimized with zero-copy
#[account(zero_copy)]
#[derive(Default, Debug)]
pub struct GlobalProtocolState {
    pub version: u8,
    pub authority: Pubkey,              // Platform multisig authority
    pub current_epoch: u64,
    pub epoch_start_time: i64,
    pub epoch_duration: i64,            // Configurable for testing (default: 2 weeks)
    pub total_influencers: u32,
    pub total_staked_sol: u64,
    pub platform_treasury: Pubkey,
    pub sheis_dao_treasury: Pubkey,
    pub developer_treasury: Pubkey,
    pub emergency_mode: bool,           // Emergency shutdown flag
    pub paused: bool,                   // Operational pause flag
    pub upgrade_authority: Pubkey,      // Upgrade authority for protocol changes
    pub min_stake_amount: u64,          // Configurable minimum stake
    pub max_stake_amount: u64,          // Configurable maximum stake
    pub min_launch_score: u64,          // Minimum score required for token launch
    pub staking_fee: u16,               // Pre-launch staking fee (basis points)
    pub unstaking_fee_pre: u16,         // Pre-launch unstaking fee (basis points)
    pub unstaking_fee_post: u16,        // Post-launch unstaking fee (basis points)
    pub verification_period: i64,       // Time window for influencer verification
    pub vesting_duration: i64,          // Token vesting duration
    pub reserved: [u8; 64],             // Reserved space for future upgrades
}

impl GlobalProtocolState {
    pub const LEN: usize = GLOBAL_PROTOCOL_STATE_SIZE;

    /// Check if current epoch is complete based on configurable duration
    pub fn is_epoch_complete(&self, current_time: i64) -> bool {
        current_time >= self.epoch_start_time + self.epoch_duration
    }

    /// Start new epoch
    pub fn start_new_epoch(&mut self, current_time: i64) -> Result<()> {
        self.current_epoch = self.current_epoch.checked_add(1)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        self.epoch_start_time = current_time;
        Ok(())
    }

    /// Validate stake amount against configured limits
    pub fn validate_stake_amount(&self, amount: u64) -> Result<()> {
        require!(
            amount >= self.min_stake_amount,
            crate::errors::KapikolError::InsufficientStakeAmount
        );
        require!(
            amount <= self.max_stake_amount,
            crate::errors::KapikolError::StakeAmountTooHigh
        );
        Ok(())
    }

    /// Calculate platform fee
    pub fn calculate_platform_fee(&self, amount: u64) -> Result<u64> {
        amount.checked_mul(self.staking_fee as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow.into())
    }

    /// Calculate unstaking fee
    pub fn calculate_unstaking_fee(&self, amount: u64, is_post_launch: bool) -> Result<u64> {
        let fee_rate = if is_post_launch {
            self.unstaking_fee_post
        } else {
            self.unstaking_fee_pre
        };
        
        amount.checked_mul(fee_rate as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow.into())
    }
}

/// Protocol configuration for initialization and updates
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ProtocolConfig {
    pub epoch_duration: i64,        // Configurable for testing
    pub min_stake_amount: u64,
    pub max_stake_amount: u64,
    pub min_launch_score: u64,
    pub staking_fee: u16,           // basis points
    pub unstaking_fee_pre: u16,     // basis points
    pub unstaking_fee_post: u16,    // basis points
    pub verification_period: i64,
    pub vesting_duration: i64,
}

impl Default for ProtocolConfig {
    fn default() -> Self {
        Self {
            epoch_duration: DEFAULT_EPOCH_DURATION,
            min_stake_amount: MIN_STAKE_AMOUNT,
            max_stake_amount: MAX_STAKE_AMOUNT,
            min_launch_score: MIN_LAUNCH_SCORE,
            staking_fee: PRE_LAUNCH_STAKING_FEE,
            unstaking_fee_pre: PRE_LAUNCH_UNSTAKING_FEE,
            unstaking_fee_post: POST_LAUNCH_UNSTAKING_FEE,
            verification_period: VERIFICATION_PERIOD,
            vesting_duration: VESTING_DURATION,
        }
    }
}

/// Platform authority for multisig operations
#[account]
#[derive(Default, Debug)]
pub struct PlatformAuthority {
    pub signers: [Pubkey; PLATFORM_AUTHORITY_SIGNERS],
    pub threshold: u8,
    pub nonce: u64,                     // Replay protection
    pub permissions: PlatformPermissions,
    pub emergency_contacts: [Pubkey; 3], // Emergency contact pubkeys
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct PlatformPermissions {
    pub can_pause_protocol: bool,
    pub can_update_fees: bool,
    pub can_moderate_content: bool,
    pub can_emergency_refund: bool,
    pub can_update_parameters: bool,
}

/// Treasury authority for fund management
#[account]
#[derive(Default, Debug)]
pub struct TreasuryAuthority {
    pub signers: [Pubkey; TREASURY_AUTHORITY_SIGNERS],
    pub threshold: u8,
    pub withdrawal_limits: WithdrawalLimits,
    pub spending_categories: Vec<SpendingCategory>,
    pub daily_withdrawn: u64,
    pub last_withdrawal_reset: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default)]
pub struct WithdrawalLimits {
    pub daily_limit: u64,               // Maximum SOL per day
    pub transaction_limit: u64,         // Maximum per transaction
    pub requires_timelock: bool,        // 48-hour timelock for large withdrawals
    pub timelock_duration: i64,         // Timelock duration in seconds
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct SpendingCategory {
    pub name: String,
    pub monthly_limit: u64,
    pub spent_this_month: u64,
    pub last_reset: i64,
}

/// Upgrade authority for protocol upgrades
#[account]
#[derive(Default, Debug)]
pub struct UpgradeAuthority {
    pub signers: [Pubkey; UPGRADE_AUTHORITY_SIGNERS],
    pub threshold: u8,
    pub upgrade_timelock: i64,          // 7-day timelock for upgrades
    pub pending_upgrade: Option<PendingUpgrade>,
    pub emergency_upgrade_enabled: bool, // Can skip timelock for critical bugs
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PendingUpgrade {
    pub new_program_data: Pubkey,
    pub scheduled_time: i64,
    pub proposer: Pubkey,
    pub description: String,
}