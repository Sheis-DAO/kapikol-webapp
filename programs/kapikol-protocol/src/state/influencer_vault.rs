use anchor_lang::prelude::*;
use crate::constants::*;

/// Individual influencer vault - Gas optimized
#[account]
#[derive(Default, Debug)]
pub struct InfluencerVault {
    pub influencer_id: [u8; 32],       // Unique identifier (hash of social handle)
    pub social_handle: String,          // Instagram/social handle (max 32 chars)
    pub verification_status: VerificationStatus,
    pub total_staked: u64,             // Total SOL staked on this influencer
    pub unique_stakers: u32,           // Number of unique stakers
    pub creation_epoch: u64,           // Epoch when vault was created
    pub last_activity: i64,            // Last staking/unstaking activity
    pub content_flag: ContentFlag,     // Moderation status
    pub launch_status: LaunchStatus,   // Token launch status
    pub ranking_score_cache: u64,      // Cached ranking score (gas optimization)
    pub verification_deadline: i64,    // Deadline for influencer verification after launch
    pub token_mint: Option<Pubkey>,    // Token mint address after launch
    pub reserved: [u8; 32],            // Reserved space for future upgrades
}

impl InfluencerVault {
    pub const LEN: usize = INFLUENCER_VAULT_SIZE;

    /// Calculate ranking score for this influencer
    pub fn calculate_ranking_score(&mut self, current_epoch: u64) -> Result<u64> {
        let base_score = self.total_staked;
        
        // Bonus for unique stakers (encourages broader community support)
        let staker_bonus = (self.unique_stakers as u64)
            .checked_mul(STAKER_COUNT_MULTIPLIER as u64)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        
        // Time bonus for early staking (decreases over time)
        let epochs_since_creation = current_epoch.saturating_sub(self.creation_epoch);
        let time_bonus = if epochs_since_creation > 0 {
            (TIME_BONUS_MULTIPLIER as u64)
                .checked_div(epochs_since_creation + 1)
                .unwrap_or(0)
        } else {
            TIME_BONUS_MULTIPLIER as u64
        };

        let total_score = base_score
            .checked_add(staker_bonus)
            .and_then(|s| s.checked_add(time_bonus))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        // Cache the score for gas optimization
        self.ranking_score_cache = total_score;
        Ok(total_score)
    }

    /// Check if this influencer can launch a token
    pub fn can_launch_token(&self, min_launch_score: u64) -> bool {
        self.launch_status == LaunchStatus::Competing &&
        self.content_flag == ContentFlag::Clean &&
        self.ranking_score_cache >= min_launch_score
    }

    /// Update staking activity
    pub fn update_staking_activity(&mut self, amount: u64, is_new_staker: bool, current_time: i64) -> Result<()> {
        self.total_staked = self.total_staked
            .checked_add(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        
        if is_new_staker {
            self.unique_stakers = self.unique_stakers
                .checked_add(1)
                .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        }
        
        self.last_activity = current_time;
        Ok(())
    }

    /// Update unstaking activity
    pub fn update_unstaking_activity(&mut self, amount: u64, is_last_stake: bool, current_time: i64) -> Result<()> {
        self.total_staked = self.total_staked
            .checked_sub(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticUnderflow)?;
        
        if is_last_stake {
            self.unique_stakers = self.unique_stakers
                .checked_sub(1)
                .ok_or(crate::errors::KapikolError::ArithmeticUnderflow)?;
        }
        
        self.last_activity = current_time;
        Ok(())
    }

    /// Set verification deadline after token launch
    pub fn set_verification_deadline(&mut self, current_time: i64, verification_period: i64) -> Result<()> {
        self.verification_deadline = current_time
            .checked_add(verification_period)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        Ok(())
    }

    /// Check if verification period has expired
    pub fn is_verification_expired(&self, current_time: i64) -> bool {
        current_time > self.verification_deadline
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Default)]
pub enum VerificationStatus {
    #[default]
    Unverified,
    Pending,
    Verified,
    Rejected,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Default)]
pub enum ContentFlag {
    #[default]
    Clean,               // No issues
    UnderReview,         // Manual review in progress
    Flagged,             // Content violation detected
    Banned,              // Permanently banned
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Default)]
pub enum LaunchStatus {
    #[default]
    Competing,           // In ranking competition
    Launching,           // Token launch in progress
    Launched,            // Token successfully launched
    Failed,              // Launch failed or cancelled
}

/// Influencer metadata for token creation
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenMetadata {
    pub name: String,           // Token name (e.g., "MikiToken")
    pub symbol: String,         // Token symbol (e.g., "MIKI")
    pub uri: String,            // Metadata URI
    pub description: String,    // Token description
}

impl TokenMetadata {
    pub fn validate(&self) -> Result<()> {
        require!(
            !self.name.is_empty() && self.name.len() <= 32,
            crate::errors::KapikolError::InvalidTokenDistributionPercentages
        );
        require!(
            !self.symbol.is_empty() && self.symbol.len() <= 10,
            crate::errors::KapikolError::InvalidTokenDistributionPercentages
        );
        require!(
            self.uri.len() <= 200,
            crate::errors::KapikolError::InvalidTokenDistributionPercentages
        );
        Ok(())
    }
}