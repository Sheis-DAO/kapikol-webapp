pub mod math;
pub mod validation;
pub mod token_utils;

pub use math::*;
pub use validation::*;
pub use token_utils::*;

/// Convert lamports to SOL for display
pub fn lamports_to_sol(lamports: u64) -> f64 {
    lamports as f64 / 1_000_000_000.0
}

/// Convert SOL to lamports
pub fn sol_to_lamports(sol: f64) -> u64 {
    (sol * 1_000_000_000.0) as u64
}

/// Get current timestamp
pub fn get_current_timestamp() -> Result<i64, anchor_lang::error::Error> {
    Clock::get()?.unix_timestamp.try_into()
        .map_err(|_| crate::errors::KapikolError::ClockUnavailable.into())
}

/// Calculate basis points (e.g., 100 = 1%)
pub fn calculate_basis_points(amount: u64, basis_points: u16) -> Result<u64, anchor_lang::error::Error> {
    amount
        .checked_mul(basis_points as u64)
        .and_then(|v| v.checked_div(10000))
        .ok_or(crate::errors::KapikolError::ArithmeticOverflow.into())
}

use anchor_lang::prelude::*;