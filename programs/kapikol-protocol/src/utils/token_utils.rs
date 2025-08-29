use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use crate::errors::KapikolError;

/// Token utility functions for gas-optimized operations

/// Create a new token mint with specified supply
pub fn create_token_mint<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, MintTo<'info>>,
    total_supply: u64,
) -> Result<()> {
    token::mint_to(ctx, total_supply)?;
    Ok(())
}

/// Transfer tokens between accounts
pub fn transfer_tokens<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, Transfer<'info>>,
    amount: u64,
) -> Result<()> {
    token::transfer(ctx, amount)?;
    Ok(())
}

/// Calculate token allocation based on stake proportion
pub fn calculate_token_allocation(
    individual_stake: u64,
    total_staked: u64,
    allocation_pool: u64,
) -> Result<u64> {
    if total_staked == 0 {
        return Ok(0);
    }

    allocation_pool
        .checked_mul(individual_stake)
        .and_then(|v| v.checked_div(total_staked))
        .ok_or(KapikolError::ArithmeticOverflow.into())
}

/// Validate token account ownership and mint
pub fn validate_token_account(
    token_account: &Account<TokenAccount>,
    expected_owner: &Pubkey,
    expected_mint: &Pubkey,
) -> Result<()> {
    require!(
        token_account.owner == *expected_owner,
        KapikolError::TokenAccountMismatch
    );
    
    require!(
        token_account.mint == *expected_mint,
        KapikolError::TokenAccountMismatch
    );

    Ok(())
}

/// Get token account balance safely
pub fn get_token_balance(token_account: &Account<TokenAccount>) -> u64 {
    token_account.amount
}

/// Calculate vesting release schedule
pub fn calculate_daily_release(total_amount: u64, vesting_days: u64) -> Result<u64> {
    if vesting_days == 0 {
        return Ok(total_amount);
    }

    total_amount
        .checked_div(vesting_days)
        .ok_or(KapikolError::ArithmeticOverflow.into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_allocation_calculation() {
        // Test proportional allocation
        let individual_stake = 5_000_000_000; // 5 SOL
        let total_staked = 20_000_000_000; // 20 SOL total
        let allocation_pool = 1_000_000_000; // 1B tokens
        
        let allocation = calculate_token_allocation(
            individual_stake,
            total_staked,
            allocation_pool,
        ).unwrap();
        
        // Should get 25% of the pool (250M tokens)
        assert_eq!(allocation, 250_000_000);
    }

    #[test]
    fn test_daily_release_calculation() {
        let total_amount = 1_000_000_000; // 1B tokens
        let vesting_days = 365 * 3; // 3 years
        
        let daily_release = calculate_daily_release(total_amount, vesting_days).unwrap();
        
        // Should release approximately 913,242 tokens per day
        assert!(daily_release > 900_000 && daily_release < 920_000);
    }

    #[test]
    fn test_edge_cases() {
        // Zero total staked should return 0
        assert_eq!(calculate_token_allocation(1000, 0, 1000000).unwrap(), 0);
        
        // Zero vesting days should return full amount
        assert_eq!(calculate_daily_release(1000000, 0).unwrap(), 1000000);
    }
}