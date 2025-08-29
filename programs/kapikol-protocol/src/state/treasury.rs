use anchor_lang::prelude::*;
use crate::constants::*;

/// Platform treasury account - Gas optimized
#[account]
#[derive(Default, Debug)]
pub struct PlatformTreasury {
    pub authority: Pubkey,              // Treasury authority (multisig)
    pub total_fees_collected: u64,     // Total fees collected in lamports
    pub staking_fees: u64,              // Fees from staking operations
    pub unstaking_fees: u64,            // Fees from unstaking operations
    pub operational_expenses: u64,      // Total operational expenses paid out
    pub revenue_sharing: u64,           // Revenue shared with Sheis-DAO
    pub last_distribution: i64,         // Last revenue distribution timestamp
    pub pending_withdrawals: Vec<PendingWithdrawal>, // Pending withdrawal requests
    pub daily_withdrawn: u64,           // Amount withdrawn today (for limits)
    pub last_daily_reset: i64,          // Last time daily limits were reset
    pub reserved: [u8; 32],             // Reserved for future upgrades
}

impl PlatformTreasury {
    pub const MAX_PENDING_WITHDRAWALS: usize = 50;

    /// Add fee revenue
    pub fn add_fee_revenue(&mut self, amount: u64, fee_type: FeeType) -> Result<()> {
        self.total_fees_collected = self.total_fees_collected
            .checked_add(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        match fee_type {
            FeeType::Staking => {
                self.staking_fees = self.staking_fees
                    .checked_add(amount)
                    .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
            },
            FeeType::Unstaking => {
                self.unstaking_fees = self.unstaking_fees
                    .checked_add(amount)
                    .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
            },
        }

        Ok(())
    }

    /// Request withdrawal (requires approval for large amounts)
    pub fn request_withdrawal(
        &mut self,
        amount: u64,
        recipient: Pubkey,
        purpose: String,
        current_time: i64,
    ) -> Result<()> {
        require!(
            self.pending_withdrawals.len() < Self::MAX_PENDING_WITHDRAWALS,
            crate::errors::KapikolError::ArithmeticOverflow
        );

        self.pending_withdrawals.push(PendingWithdrawal {
            amount,
            recipient,
            purpose,
            request_time: current_time,
            approved: false,
            executed: false,
        });

        Ok(())
    }

    /// Execute approved withdrawal
    pub fn execute_withdrawal(&mut self, withdrawal_index: usize, current_time: i64) -> Result<u64> {
        require!(
            withdrawal_index < self.pending_withdrawals.len(),
            crate::errors::KapikolError::InvalidFeeCalculation
        );

        let withdrawal = &mut self.pending_withdrawals[withdrawal_index];
        require!(withdrawal.approved, crate::errors::KapikolError::UnauthorizedTreasuryAuthority);
        require!(!withdrawal.executed, crate::errors::KapikolError::AlreadyRefunded);

        // Reset daily limits if needed
        self.reset_daily_limits_if_needed(current_time)?;

        // Check daily limits
        let new_daily_total = self.daily_withdrawn
            .checked_add(withdrawal.amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        // For now, we'll implement a simple limit - this would be configurable
        require!(
            new_daily_total <= 1000 * 1_000_000_000, // 1000 SOL daily limit
            crate::errors::KapikolError::TreasuryBalanceInsufficient
        );

        withdrawal.executed = true;
        self.daily_withdrawn = new_daily_total;
        self.operational_expenses = self.operational_expenses
            .checked_add(withdrawal.amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        Ok(withdrawal.amount)
    }

    /// Distribute revenue to Sheis-DAO (15% of fees)
    pub fn distribute_revenue(&mut self, current_time: i64) -> Result<u64> {
        let available_for_distribution = self.total_fees_collected
            .saturating_sub(self.revenue_sharing)
            .saturating_sub(self.operational_expenses);

        let distribution_amount = available_for_distribution
            .checked_mul(SHEIS_DAO_REVENUE_SHARE as u64)
            .and_then(|v| v.checked_div(10000))
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        if distribution_amount > 0 {
            self.revenue_sharing = self.revenue_sharing
                .checked_add(distribution_amount)
                .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
            
            self.last_distribution = current_time;
        }

        Ok(distribution_amount)
    }

    /// Reset daily withdrawal limits
    fn reset_daily_limits_if_needed(&mut self, current_time: i64) -> Result<()> {
        let one_day = 24 * 60 * 60;
        if current_time >= self.last_daily_reset + one_day {
            self.daily_withdrawn = 0;
            self.last_daily_reset = current_time;
        }
        Ok(())
    }

    /// Get treasury balance info
    pub fn get_balance_info(&self) -> TreasuryBalanceInfo {
        TreasuryBalanceInfo {
            total_collected: self.total_fees_collected,
            operational_expenses: self.operational_expenses,
            revenue_shared: self.revenue_sharing,
            available_balance: self.total_fees_collected
                .saturating_sub(self.operational_expenses)
                .saturating_sub(self.revenue_sharing),
            pending_withdrawals_count: self.pending_withdrawals.len() as u32,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PendingWithdrawal {
    pub amount: u64,
    pub recipient: Pubkey,
    pub purpose: String,
    pub request_time: i64,
    pub approved: bool,
    pub executed: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum FeeType {
    Staking,
    Unstaking,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TreasuryBalanceInfo {
    pub total_collected: u64,
    pub operational_expenses: u64,
    pub revenue_shared: u64,
    pub available_balance: u64,
    pub pending_withdrawals_count: u32,
}

/// Sheis-DAO community treasury
#[account]
#[derive(Default, Debug)]
pub struct SheisDAOTreasury {
    pub authority: Pubkey,              // Sheis-DAO multisig
    pub unclaimed_tokens: u64,          // From unverified influencers (30%)
    pub platform_revenue_share: u64,   // Revenue sharing from platform (15%)
    pub grants_distributed: u64,        // Total grants distributed to women creators
    pub active_programs: u32,           // Number of active grant programs
    pub token_holdings: Vec<TokenHolding>, // Different token holdings from launches
    pub last_grant_distribution: i64,   // Last grant distribution timestamp
    pub reserved: [u8; 32],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenHolding {
    pub token_mint: Pubkey,
    pub amount: u64,
    pub received_time: i64,
    pub from_influencer: Pubkey,        // Which influencer vault these tokens came from
}

impl SheisDAOTreasury {
    pub const MAX_TOKEN_HOLDINGS: usize = 200; // Limit for gas optimization

    /// Receive unclaimed tokens from expired verification
    pub fn receive_unclaimed_tokens(
        &mut self,
        token_mint: Pubkey,
        amount: u64,
        from_influencer: Pubkey,
        current_time: i64,
    ) -> Result<()> {
        require!(
            self.token_holdings.len() < Self::MAX_TOKEN_HOLDINGS,
            crate::errors::KapikolError::ArithmeticOverflow
        );

        self.token_holdings.push(TokenHolding {
            token_mint,
            amount,
            received_time: current_time,
            from_influencer,
        });

        self.unclaimed_tokens = self.unclaimed_tokens
            .checked_add(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        Ok(())
    }

    /// Receive revenue share from platform
    pub fn receive_revenue_share(&mut self, amount: u64) -> Result<()> {
        self.platform_revenue_share = self.platform_revenue_share
            .checked_add(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;
        Ok(())
    }

    /// Distribute grants to women creators
    pub fn distribute_grant(&mut self, amount: u64, current_time: i64) -> Result<()> {
        require!(
            amount <= self.platform_revenue_share,
            crate::errors::KapikolError::TreasuryBalanceInsufficient
        );

        self.platform_revenue_share = self.platform_revenue_share
            .checked_sub(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticUnderflow)?;

        self.grants_distributed = self.grants_distributed
            .checked_add(amount)
            .ok_or(crate::errors::KapikolError::ArithmeticOverflow)?;

        self.last_grant_distribution = current_time;
        Ok(())
    }

    /// Get total treasury value
    pub fn get_total_value(&self) -> SheisDAOTreasuryInfo {
        SheisDAOTreasuryInfo {
            total_sol_balance: self.platform_revenue_share,
            total_token_holdings: self.token_holdings.len() as u32,
            total_unclaimed_tokens: self.unclaimed_tokens,
            total_grants_distributed: self.grants_distributed,
            active_programs: self.active_programs,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct SheisDAOTreasuryInfo {
    pub total_sol_balance: u64,
    pub total_token_holdings: u32,
    pub total_unclaimed_tokens: u64,
    pub total_grants_distributed: u64,
    pub active_programs: u32,
}