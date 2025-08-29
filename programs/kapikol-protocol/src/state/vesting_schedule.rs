use anchor_lang::prelude::*;
use crate::constants::*;

/// Vesting schedule for stakers - Gas optimized
#[account]
#[derive(Default, Debug)]
pub struct VestingSchedule {
    pub beneficiary: Pubkey,
    pub influencer_vault: Pubkey,
    pub total_token_allocation: u64,    // Total tokens allocated (30% of supply proportional to stake)
    pub total_sol_allocation: u64,      // Total SOL to be returned during vesting
    pub daily_token_release: u64,       // Tokens released per day (linear vesting)
    pub daily_sol_release: u64,         // SOL released per day (linear vesting)
    pub tokens_claimed: u64,
    pub sol_claimed: u64,
    pub start_time: i64,
    pub last_claim_time: i64,
    pub vesting_duration: i64,          // Duration of vesting period
    pub is_active: bool,                // Vesting schedule active status
    pub reserved: [u8; 32],             // Reserved space for future upgrades
}

impl VestingSchedule {
    pub const LEN: usize = VESTING_SCHEDULE_SIZE;

    /// Initialize vesting schedule
    pub fn initialize(
        &mut self,
        beneficiary: Pubkey,
        influencer_vault: Pubkey,
        token_allocation: u64,
        sol_allocation: u64,
        start_time: i64,
        vesting_duration: i64,
    ) -> Result<()> {
        self.beneficiary = beneficiary;
        self.influencer_vault = influencer_vault;
        self.total_token_allocation = token_allocation;
        self.total_sol_allocation = sol_allocation;
        self.start_time = start_time;
        self.last_claim_time = start_time;
        self.vesting_duration = vesting_duration;
        self.is_active = true;

        // Calculate daily release amounts (linear vesting over duration)
        let days_in_vesting = vesting_duration / (24 * 60 * 60);
        
        self.daily_token_release = if days_in_vesting > 0 {
            token_allocation / (days_in_vesting as u64)
        } else {
            token_allocation
        };

        self.daily_sol_release = if days_in_vesting > 0 {
            sol_allocation / (days_in_vesting as u64)
        } else {
            sol_allocation
        };

        Ok(())
    }

    /// Calculate claimable amounts (tokens and SOL)
    pub fn calculate_claimable_amounts(&self, current_time: i64) -> Result<(u64, u64)> {
        if !self.is_active || current_time <= self.start_time {
            return Ok((0, 0));
        }

        let vesting_end = self.start_time
            .checked_add(self.vesting_duration)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        // If vesting period is complete, return all remaining amounts
        let effective_time = std::cmp::min(current_time, vesting_end);
        
        let elapsed_time = effective_time
            .checked_sub(self.start_time)
            .ok_or(crate::errors::KapikolError::ArithmeticUnderflow)?;

        // Calculate total vested amounts based on time elapsed
        let total_vested_tokens = if elapsed_time >= self.vesting_duration {
            self.total_token_allocation
        } else {
            self.total_token_allocation
                .checked_mul(elapsed_time as u64)
                .and_then(|v| v.checked_div(self.vesting_duration as u64))
                .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?
        };

        let total_vested_sol = if elapsed_time >= self.vesting_duration {
            self.total_sol_allocation
        } else {
            self.total_sol_allocation
                .checked_mul(elapsed_time as u64)
                .and_then(|v| v.checked_div(self.vesting_duration as u64))
                .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?
        };

        // Calculate claimable amounts (vested - already claimed)
        let claimable_tokens = total_vested_tokens.saturating_sub(self.tokens_claimed);
        let claimable_sol = total_vested_sol.saturating_sub(self.sol_claimed);

        Ok((claimable_tokens, claimable_sol))
    }

    /// Claim vested tokens and SOL
    pub fn claim_vested_amounts(
        &mut self,
        token_amount: u64,
        sol_amount: u64,
        current_time: i64,
    ) -> Result<()> {
        self.tokens_claimed = self.tokens_claimed
            .checked_add(token_amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.sol_claimed = self.sol_claimed
            .checked_add(sol_amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.last_claim_time = current_time;

        // Check if vesting is complete
        if self.tokens_claimed >= self.total_token_allocation && 
           self.sol_claimed >= self.total_sol_allocation {
            self.is_active = false;
        }

        Ok(())
    }

    /// Get vesting progress (0-10000 basis points)
    pub fn get_vesting_progress(&self, current_time: i64) -> Result<u16> {
        if current_time <= self.start_time {
            return Ok(0);
        }

        let vesting_end = self.start_time
            .checked_add(self.vesting_duration)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        if current_time >= vesting_end {
            return Ok(10000); // 100%
        }

        let elapsed_time = current_time
            .checked_sub(self.start_time)
            .ok_or(crate::errors::KapikolError::ArithmeticUnderflow)?;

        let progress = (elapsed_time as u64)
            .checked_mul(10000)
            .and_then(|v| v.checked_div(self.vesting_duration as u64))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        Ok(progress as u16)
    }

    /// Emergency unstake remaining SOL (with fees)
    pub fn emergency_unstake_sol(&mut self, current_time: i64) -> Result<u64> {
        let remaining_sol = self.total_sol_allocation.saturating_sub(self.sol_claimed);
        
        if remaining_sol == 0 {
            return Err(crate::errors::KapikolError::NoSOLToUnstake.into());
        }

        // Mark all SOL as claimed
        self.sol_claimed = self.total_sol_allocation;
        self.last_claim_time = current_time;

        Ok(remaining_sol)
    }
}

/// Developer vesting schedule - Similar to staker vesting but for 10% developer allocation
#[account]
#[derive(Default, Debug)]
pub struct DeveloperVesting {
    pub authority: Pubkey,              // Developer/Capital account authority
    pub total_allocation: u64,          // 10% of tokens from each launch
    pub tokens_per_launch: Vec<TokenLaunchAllocation>, // Track allocations per launch
    pub total_claimed: u64,
    pub last_claim_time: i64,
    pub vesting_start: i64,
    pub vesting_duration: i64,
    pub is_active: bool,
    pub reserved: [u8; 64],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenLaunchAllocation {
    pub token_mint: Pubkey,
    pub allocation: u64,
    pub claimed: u64,
    pub launch_time: i64,
}

impl DeveloperVesting {
    pub const MAX_ALLOCATIONS: usize = 100; // Limit for gas optimization

    /// Add new token allocation from launch
    pub fn add_token_allocation(
        &mut self,
        token_mint: Pubkey,
        allocation: u64,
        launch_time: i64,
    ) -> Result<()> {
        require!(
            self.tokens_per_launch.len() < Self::MAX_ALLOCATIONS,
            crate::errors::KapikolError::ArithmeticOverflow
        );

        self.tokens_per_launch.push(TokenLaunchAllocation {
            token_mint,
            allocation,
            claimed: 0,
            launch_time,
        });

        self.total_allocation = self.total_allocation
            .checked_add(allocation)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        Ok(())
    }

    /// Calculate total claimable tokens across all launches
    pub fn calculate_total_claimable(&self, current_time: i64) -> Result<u64> {
        let mut total_claimable = 0u64;

        for allocation in &self.tokens_per_launch {
            let vesting_start = std::cmp::max(allocation.launch_time, self.vesting_start);
            let vesting_end = vesting_start
                .checked_add(self.vesting_duration)
                .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

            if current_time > vesting_start {
                let effective_time = std::cmp::min(current_time, vesting_end);
                let elapsed = effective_time.saturating_sub(vesting_start);
                
                let vested_amount = if elapsed >= self.vesting_duration {
                    allocation.allocation
                } else {
                    allocation.allocation
                        .checked_mul(elapsed as u64)
                        .and_then(|v| v.checked_div(self.vesting_duration as u64))
                        .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?
                };

                let claimable = vested_amount.saturating_sub(allocation.claimed);
                total_claimable = total_claimable
                    .checked_add(claimable)
                    .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
            }
        }

        Ok(total_claimable)
    }
}