use anchor_lang::prelude::*;
use crate::errors::KapikolError;

/// Safe arithmetic operations for gas optimization and overflow protection

/// Safely add two u64 values
pub fn safe_add_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(KapikolError::ArithmeticOverflow.into())
}

/// Safely subtract two u64 values
pub fn safe_sub_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_sub(b).ok_or(KapikolError::ArithmeticUnderflow.into())
}

/// Safely multiply two u64 values
pub fn safe_mul_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_mul(b).ok_or(KapikolError::ArithmeticOverflow.into())
}

/// Safely divide two u64 values
pub fn safe_div_u64(a: u64, b: u64) -> Result<u64> {
    if b == 0 {
        return Err(KapikolError::DivisionByZero.into());
    }
    a.checked_div(b).ok_or(KapikolError::ArithmeticOverflow.into())
}

/// Calculate percentage with basis points (10000 = 100%)
pub fn calculate_percentage(amount: u64, basis_points: u16) -> Result<u64> {
    safe_mul_u64(amount, basis_points as u64)
        .and_then(|v| safe_div_u64(v, 10000))
}

/// Calculate proportional allocation
pub fn calculate_proportional_share(
    individual_amount: u64,
    total_amount: u64,
    allocation_pool: u64,
) -> Result<u64> {
    if total_amount == 0 {
        return Ok(0);
    }
    
    safe_mul_u64(allocation_pool, individual_amount)
        .and_then(|v| safe_div_u64(v, total_amount))
}

/// Calculate compound score for ranking
pub fn calculate_ranking_score(
    base_amount: u64,
    staker_count: u32,
    time_bonus: u64,
    staker_multiplier: u64,
) -> Result<u64> {
    let staker_bonus = safe_mul_u64(staker_count as u64, staker_multiplier)?;
    let intermediate = safe_add_u64(base_amount, staker_bonus)?;
    safe_add_u64(intermediate, time_bonus)
}

/// Calculate vesting amounts based on elapsed time
pub fn calculate_vesting_amount(
    total_allocation: u64,
    elapsed_time: i64,
    total_duration: i64,
) -> Result<u64> {
    if elapsed_time <= 0 || total_duration <= 0 {
        return Ok(0);
    }
    
    if elapsed_time >= total_duration {
        return Ok(total_allocation);
    }
    
    safe_mul_u64(total_allocation, elapsed_time as u64)
        .and_then(|v| safe_div_u64(v, total_duration as u64))
}

/// Calculate time bonus (decreasing over time)
pub fn calculate_time_bonus(
    epochs_since_creation: u64,
    base_bonus: u64,
) -> Result<u64> {
    if epochs_since_creation == 0 {
        return Ok(base_bonus);
    }
    
    safe_div_u64(base_bonus, epochs_since_creation + 1)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safe_arithmetic() {
        assert_eq!(safe_add_u64(100, 200).unwrap(), 300);
        assert_eq!(safe_sub_u64(200, 100).unwrap(), 100);
        assert_eq!(safe_mul_u64(10, 20).unwrap(), 200);
        assert_eq!(safe_div_u64(100, 10).unwrap(), 10);
        
        // Test overflow protection
        assert!(safe_add_u64(u64::MAX, 1).is_err());
        assert!(safe_sub_u64(0, 1).is_err());
        assert!(safe_div_u64(100, 0).is_err());
    }

    #[test]
    fn test_percentage_calculation() {
        // 1% of 1000 = 10
        assert_eq!(calculate_percentage(1000, 100).unwrap(), 10);
        // 50% of 1000 = 500
        assert_eq!(calculate_percentage(1000, 5000).unwrap(), 500);
        // 100% of 1000 = 1000
        assert_eq!(calculate_percentage(1000, 10000).unwrap(), 1000);
    }

    #[test]
    fn test_proportional_share() {
        // Individual: 300, Total: 1000, Pool: 5000 -> 1500
        assert_eq!(calculate_proportional_share(300, 1000, 5000).unwrap(), 1500);
        
        // Edge case: total is 0
        assert_eq!(calculate_proportional_share(300, 0, 5000).unwrap(), 0);
    }

    #[test]
    fn test_vesting_calculation() {
        let total = 1000u64;
        let duration = 100i64;
        
        // No time elapsed
        assert_eq!(calculate_vesting_amount(total, 0, duration).unwrap(), 0);
        
        // Half time elapsed
        assert_eq!(calculate_vesting_amount(total, 50, duration).unwrap(), 500);
        
        // Full time elapsed
        assert_eq!(calculate_vesting_amount(total, duration, duration).unwrap(), total);
        
        // Overtime
        assert_eq!(calculate_vesting_amount(total, 150, duration).unwrap(), total);
    }
}