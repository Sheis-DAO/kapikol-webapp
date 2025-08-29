use anchor_lang::prelude::*;
use crate::constants::*;

/// Token launch configuration - Gas optimized
#[account]
#[derive(Default, Debug)]
pub struct TokenLaunchConfig {
    pub influencer_vault: Pubkey,
    pub token_mint: Pubkey,
    pub total_supply: u64,              // Fixed at 1,000,000,000 tokens
    pub launch_timestamp: i64,
    pub verification_deadline: i64,     // 3 months from launch
    pub distribution_complete: bool,
    pub liquidity_provided: bool,       // Track if liquidity has been provided to DEXs
    pub developer_vesting_created: bool, // Track if developer vesting has been set up
    pub staker_allocations_distributed: bool, // Track if staker allocations are distributed
    pub influencer_claimed: bool,       // Track if influencer has claimed their allocation
    pub unclaimed_redistributed: bool,  // Track if unclaimed tokens have been redistributed
    
    // Distribution tracking
    pub stakers_allocation: u64,        // 30% - allocated to stakers
    pub influencer_allocation: u64,     // 30% - allocated to influencer
    pub liquidity_allocation: u64,      // 30% - allocated to liquidity
    pub developer_allocation: u64,      // 10% - allocated to developers
    
    // Liquidity provision details
    pub raydium_pool: Option<Pubkey>,   // Raydium pool address
    pub orca_pool: Option<Pubkey>,      // Orca whirlpool address
    pub jupiter_position: Option<Pubkey>, // Jupiter liquidity position
    
    pub reserved: [u8; 32],             // Reserved space for future upgrades
}

impl TokenLaunchConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // influencer_vault
        32 + // token_mint
        8 + // total_supply
        8 + // launch_timestamp
        8 + // verification_deadline
        1 + // distribution_complete
        1 + // liquidity_provided
        1 + // developer_vesting_created
        1 + // staker_allocations_distributed
        1 + // influencer_claimed
        1 + // unclaimed_redistributed
        8 + // stakers_allocation
        8 + // influencer_allocation
        8 + // liquidity_allocation
        8 + // developer_allocation
        33 + // raydium_pool (Option<Pubkey>)
        33 + // orca_pool (Option<Pubkey>)
        33 + // jupiter_position (Option<Pubkey>)
        32; // reserved

    /// Initialize token launch configuration
    pub fn initialize(
        &mut self,
        influencer_vault: Pubkey,
        token_mint: Pubkey,
        launch_timestamp: i64,
        verification_period: i64,
    ) -> Result<()> {
        self.influencer_vault = influencer_vault;
        self.token_mint = token_mint;
        self.total_supply = TOTAL_TOKEN_SUPPLY;
        self.launch_timestamp = launch_timestamp;
        self.verification_deadline = launch_timestamp
            .checked_add(verification_period)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        // Calculate allocations based on total supply
        self.stakers_allocation = TOTAL_TOKEN_SUPPLY
            .checked_mul(STAKERS_ALLOCATION as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.influencer_allocation = TOTAL_TOKEN_SUPPLY
            .checked_mul(INFLUENCER_ALLOCATION as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.liquidity_allocation = TOTAL_TOKEN_SUPPLY
            .checked_mul(LIQUIDITY_ALLOCATION as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.developer_allocation = TOTAL_TOKEN_SUPPLY
            .checked_mul(DEVELOPER_ALLOCATION as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        // Verify allocations add up to total supply
        let total_allocated = self.stakers_allocation
            .checked_add(self.influencer_allocation)
            .and_then(|v| v.checked_add(self.liquidity_allocation))
            .and_then(|v| v.checked_add(self.developer_allocation))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        require!(
            total_allocated == TOTAL_TOKEN_SUPPLY,
            crate::errors::KapikolError::InvalidDistributionPercentages
        );

        Ok(())
    }

    /// Mark staker allocations as distributed
    pub fn mark_staker_allocations_distributed(&mut self) {
        self.staker_allocations_distributed = true;
        self.check_distribution_complete();
    }

    /// Mark influencer as claimed
    pub fn mark_influencer_claimed(&mut self) {
        self.influencer_claimed = true;
        self.check_distribution_complete();
    }

    /// Mark unclaimed tokens as redistributed
    pub fn mark_unclaimed_redistributed(&mut self) {
        self.unclaimed_redistributed = true;
        self.check_distribution_complete();
    }

    /// Mark liquidity as provided
    pub fn mark_liquidity_provided(
        &mut self,
        raydium_pool: Option<Pubkey>,
        orca_pool: Option<Pubkey>,
        jupiter_position: Option<Pubkey>,
    ) {
        self.liquidity_provided = true;
        self.raydium_pool = raydium_pool;
        self.orca_pool = orca_pool;
        self.jupiter_position = jupiter_position;
        self.check_distribution_complete();
    }

    /// Mark developer vesting as created
    pub fn mark_developer_vesting_created(&mut self) {
        self.developer_vesting_created = true;
        self.check_distribution_complete();
    }

    /// Check if all distribution tasks are complete
    fn check_distribution_complete(&mut self) {
        self.distribution_complete = 
            self.staker_allocations_distributed &&
            self.liquidity_provided &&
            self.developer_vesting_created &&
            (self.influencer_claimed || self.unclaimed_redistributed);
    }

    /// Check if verification period has expired
    pub fn is_verification_expired(&self, current_time: i64) -> bool {
        current_time > self.verification_deadline
    }

    /// Get distribution status
    pub fn get_distribution_status(&self) -> TokenDistributionStatus {
        TokenDistributionStatus {
            stakers_distributed: self.staker_allocations_distributed,
            influencer_claimed: self.influencer_claimed,
            liquidity_provided: self.liquidity_provided,
            developer_vesting_created: self.developer_vesting_created,
            unclaimed_redistributed: self.unclaimed_redistributed,
            distribution_complete: self.distribution_complete,
            verification_deadline: self.verification_deadline,
            verification_expired: false, // Set by caller
        }
    }

    /// Calculate proportional staker allocation
    pub fn calculate_staker_allocation(&self, stake_amount: u64, total_staked: u64) -> Result<u64> {
        if total_staked == 0 {
            return Ok(0);
        }

        self.stakers_allocation
            .checked_mul(stake_amount)
            .and_then(|v| v.checked_div(total_staked))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow.into())
    }
}

/// Token distribution status for frontend queries
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenDistributionStatus {
    pub stakers_distributed: bool,
    pub influencer_claimed: bool,
    pub liquidity_provided: bool,
    pub developer_vesting_created: bool,
    pub unclaimed_redistributed: bool,
    pub distribution_complete: bool,
    pub verification_deadline: i64,
    pub verification_expired: bool,
}

/// Liquidity provision configuration
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct LiquidityConfig {
    pub raydium_percentage: u16,        // Percentage to Raydium (e.g., 70%)
    pub orca_percentage: u16,           // Percentage to Orca (e.g., 20%)
    pub jupiter_percentage: u16,        // Percentage to Jupiter (e.g., 10%)
    pub sol_amount: u64,                // SOL amount to pair with tokens
}

impl Default for LiquidityConfig {
    fn default() -> Self {
        Self {
            raydium_percentage: 7000,  // 70%
            orca_percentage: 2000,     // 20%
            jupiter_percentage: 1000,  // 10%
            sol_amount: 10 * 1_000_000_000, // 10 SOL default
        }
    }
}

impl LiquidityConfig {
    pub fn validate(&self) -> Result<()> {
        let total_percentage = self.raydium_percentage
            .checked_add(self.orca_percentage)
            .and_then(|v| v.checked_add(self.jupiter_percentage))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        require!(
            total_percentage == 10000, // 100%
            crate::errors::KapikolError::InvalidDistributionPercentages
        );

        Ok(())
    }

    /// Calculate allocations for each DEX
    pub fn calculate_dex_allocations(&self, total_tokens: u64) -> Result<(u64, u64, u64)> {
        let raydium_tokens = total_tokens
            .checked_mul(self.raydium_percentage as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        let orca_tokens = total_tokens
            .checked_mul(self.orca_percentage as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        let jupiter_tokens = total_tokens
            .checked_mul(self.jupiter_percentage as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        Ok((raydium_tokens, orca_tokens, jupiter_tokens))
    }
}