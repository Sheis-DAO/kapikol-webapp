use anchor_lang::prelude::*;
use crate::{constants::*, errors::*};

/// Validation utilities for input sanitization and security

/// Validate social handle format
pub fn validate_social_handle(handle: &str) -> Result<()> {
    require!(
        !handle.is_empty() && handle.len() <= MAX_SOCIAL_HANDLE_LENGTH,
        KapikolError::SocialHandleTooLong
    );

    // Check for valid characters (alphanumeric, underscore, dot, hyphen)
    let valid_chars = handle.chars().all(|c| {
        c.is_alphanumeric() || c == '_' || c == '.' || c == '-' || c == '@'
    });

    require!(valid_chars, KapikolError::SocialHandleTooLong);

    Ok(())
}

/// Validate verification proof format
pub fn validate_verification_proof(proof: &[u8]) -> Result<()> {
    require!(
        !proof.is_empty() && proof.len() <= MAX_VERIFICATION_PROOF_LENGTH,
        KapikolError::VerificationProofTooLong
    );

    Ok(())
}

/// Validate reason text for content moderation
pub fn validate_reason_text(reason: &str) -> Result<()> {
    require!(
        !reason.is_empty() && reason.len() <= MAX_REASON_LENGTH,
        KapikolError::ReasonTooLong
    );

    Ok(())
}

/// Validate epoch configuration
pub fn validate_epoch_config(epoch_duration: i64, current_time: i64) -> Result<()> {
    require!(
        epoch_duration > 60, // Minimum 1 minute
        KapikolError::InvalidEpochConfiguration
    );

    require!(
        epoch_duration < 365 * 24 * 60 * 60, // Maximum 1 year
        KapikolError::InvalidEpochConfiguration
    );

    Ok(())
}

/// Validate stake amount against protocol limits
pub fn validate_stake_amount(
    amount: u64,
    min_amount: u64,
    max_amount: u64,
) -> Result<()> {
    require!(
        amount >= min_amount,
        KapikolError::InsufficientStakeAmount
    );

    require!(
        amount <= max_amount,
        KapikolError::StakeAmountTooHigh
    );

    Ok(())
}

/// Validate fee percentages (in basis points)
pub fn validate_fee_percentage(fee: u16) -> Result<()> {
    require!(
        fee <= 1000, // Maximum 10%
        KapikolError::InvalidFeeCalculation
    );

    Ok(())
}

/// Validate token distribution percentages sum to 100%
pub fn validate_token_distribution(
    stakers: u16,
    influencer: u16,
    liquidity: u16,
    developers: u16,
) -> Result<()> {
    let total = stakers + influencer + liquidity + developers;
    require!(
        total == 10000, // 100% in basis points
        KapikolError::InvalidDistributionPercentages
    );

    Ok(())
}

/// Validate PDA derivation
pub fn validate_pda(
    expected_pda: &Pubkey,
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> Result<u8> {
    let (derived_pda, bump) = Pubkey::find_program_address(seeds, program_id);
    require!(
        derived_pda == *expected_pda,
        KapikolError::InvalidPDADerivation
    );

    Ok(bump)
}

/// Validate timestamp is not in the future (with some tolerance)
pub fn validate_timestamp(timestamp: i64, current_time: i64, tolerance: i64) -> Result<()> {
    require!(
        timestamp <= current_time + tolerance,
        KapikolError::ClockUnavailable
    );

    Ok(())
}

/// Validate account ownership
pub fn validate_account_owner(account: &AccountInfo, expected_owner: &Pubkey) -> Result<()> {
    require!(
        account.owner == expected_owner,
        KapikolError::InvalidAccountOwner
    );

    Ok(())
}

/// Validate account is initialized (non-zero discriminator)
pub fn validate_account_initialized(account_data: &[u8]) -> Result<()> {
    require!(
        account_data.len() >= 8,
        KapikolError::AccountNotInitialized
    );

    let discriminator = &account_data[0..8];
    let is_initialized = discriminator != [0u8; 8];
    
    require!(
        is_initialized,
        KapikolError::AccountNotInitialized
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_social_handle_validation() {
        // Valid handles
        assert!(validate_social_handle("@valid_handle").is_ok());
        assert!(validate_social_handle("user123").is_ok());
        assert!(validate_social_handle("test.user-name").is_ok());

        // Invalid handles
        assert!(validate_social_handle("").is_err()); // Empty
        assert!(validate_social_handle(&"a".repeat(MAX_SOCIAL_HANDLE_LENGTH + 1)).is_err()); // Too long
    }

    #[test]
    fn test_stake_amount_validation() {
        let min_stake = 1_000_000; // 0.001 SOL
        let max_stake = 100_000_000_000; // 100 SOL

        // Valid amounts
        assert!(validate_stake_amount(5_000_000_000, min_stake, max_stake).is_ok()); // 5 SOL

        // Invalid amounts
        assert!(validate_stake_amount(500_000, min_stake, max_stake).is_err()); // Too small
        assert!(validate_stake_amount(200_000_000_000, min_stake, max_stake).is_err()); // Too large
    }

    #[test]
    fn test_fee_validation() {
        // Valid fees
        assert!(validate_fee_percentage(100).is_ok()); // 1%
        assert!(validate_fee_percentage(500).is_ok()); // 5%
        assert!(validate_fee_percentage(1000).is_ok()); // 10%

        // Invalid fees
        assert!(validate_fee_percentage(1500).is_err()); // 15% - too high
    }

    #[test]
    fn test_token_distribution_validation() {
        // Valid distribution (30% + 30% + 30% + 10% = 100%)
        assert!(validate_token_distribution(3000, 3000, 3000, 1000).is_ok());

        // Invalid distribution (doesn't sum to 100%)
        assert!(validate_token_distribution(2000, 3000, 3000, 1000).is_err());
    }
}