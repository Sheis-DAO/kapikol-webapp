use anchor_lang::prelude::*;
use crate::constants::*;

/// Individual stake position - Gas optimized
#[account]
#[derive(Default, Debug)]
pub struct StakePosition {
    pub staker: Pubkey,
    pub influencer_vault: Pubkey,
    pub gross_amount: u64,              // Original staked amount (before fees)
    pub net_amount: u64,                // Amount after platform fees
    pub stake_timestamp: i64,
    pub epoch_staked: u64,
    pub position_status: PositionStatus,
    pub last_activity: i64,             // Last update timestamp
    pub reserved: [u8; 16],             // Reserved space for future upgrades
}

impl StakePosition {
    pub const LEN: usize = STAKE_POSITION_SIZE;

    /// Initialize a new stake position
    pub fn initialize(
        &mut self,
        staker: Pubkey,
        influencer_vault: Pubkey,
        gross_amount: u64,
        net_amount: u64,
        current_time: i64,
        current_epoch: u64,
    ) {
        self.staker = staker;
        self.influencer_vault = influencer_vault;
        self.gross_amount = gross_amount;
        self.net_amount = net_amount;
        self.stake_timestamp = current_time;
        self.epoch_staked = current_epoch;
        self.position_status = PositionStatus::Active;
        self.last_activity = current_time;
    }

    /// Add additional stake to existing position
    pub fn add_stake(
        &mut self,
        additional_gross: u64,
        additional_net: u64,
        current_time: i64,
    ) -> Result<()> {
        require!(
            self.position_status == PositionStatus::Active,
            crate::errors::KapikolError::InvalidPositionStatus
        );

        self.gross_amount = self.gross_amount
            .checked_add(additional_gross)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        
        self.net_amount = self.net_amount
            .checked_add(additional_net)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        
        self.last_activity = current_time;
        Ok(())
    }

    /// Complete unstaking process
    pub fn complete_unstaking(&mut self, current_time: i64) {
        self.position_status = PositionStatus::Completed;
        self.last_activity = current_time;
    }

    /// Transition to post-launch state
    pub fn transition_to_post_launch(&mut self, current_time: i64) {
        self.position_status = PositionStatus::PostLaunch;
        self.last_activity = current_time;
    }

    /// Check if position can be unstaked pre-launch
    pub fn can_unstake_pre_launch(&self) -> bool {
        self.position_status == PositionStatus::Active
    }

    /// Check if position can be unstaked post-launch
    pub fn can_unstake_post_launch(&self) -> bool {
        self.position_status == PositionStatus::PostLaunch
    }

    /// Calculate proportional share for token distribution
    pub fn calculate_proportional_share(&self, total_staked: u64, allocation_amount: u64) -> Result<u64> {
        if total_staked == 0 {
            return Ok(0);
        }

        allocation_amount
            .checked_mul(self.net_amount)
            .and_then(|v| v.checked_div(total_staked))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow.into())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Default)]
pub enum PositionStatus {
    #[default]
    Active,              // Normal staking state
    PreLaunchUnstaking,  // Initiated unstaking before launch
    PostLaunch,          // Token launched, entering vesting
    PostLaunchUnstaking, // Initiated unstaking after launch
    Completed,           // Fully withdrawn
    Emergency,           // Emergency refund state
}

/// Stake position summary for frontend queries
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct StakePositionSummary {
    pub staker: Pubkey,
    pub influencer_vault: Pubkey,
    pub total_amount: u64,
    pub stake_timestamp: i64,
    pub position_status: PositionStatus,
    pub can_unstake: bool,
    pub estimated_tokens: Option<u64>,    // Estimated token allocation if launch happens
}

impl From<&StakePosition> for StakePositionSummary {
    fn from(position: &StakePosition) -> Self {
        Self {
            staker: position.staker,
            influencer_vault: position.influencer_vault,
            total_amount: position.net_amount,
            stake_timestamp: position.stake_timestamp,
            position_status: position.position_status.clone(),
            can_unstake: position.can_unstake_pre_launch() || position.can_unstake_post_launch(),
            estimated_tokens: None, // Calculated separately based on current rankings
        }
    }
}