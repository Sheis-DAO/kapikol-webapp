use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct UnstakePostLaunch<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = !global_state.load()?.emergency_mode @ KapikolError::EmergencyModeActive
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    #[account(
        mut,
        seeds = [VESTING_SCHEDULE_SEED, staker.key().as_ref(), influencer_vault.key().as_ref()],
        bump,
        constraint = vesting_schedule.beneficiary == staker.key() @ KapikolError::UnauthorizedPlatformAuthority
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,

    /// CHECK: Referenced for seed derivation only
    pub influencer_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub staker: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UnstakePostLaunch>) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    let global_state = ctx.accounts.global_state.load()?;
    let vesting_schedule = &mut ctx.accounts.vesting_schedule;
    
    // Calculate remaining SOL that can be unstaked
    let remaining_sol = vesting_schedule.emergency_unstake_sol(current_time)?;
    
    // Calculate 2% unstaking fee
    let unstaking_fee = global_state.calculate_unstaking_fee(remaining_sol, true)?;
    let return_amount = remaining_sol
        .checked_sub(unstaking_fee)
        .ok_or(KapikolError::ArithmeticUnderflow)?;

    // For now, this is a placeholder - would need proper SOL transfer logic
    
    emit!(PostLaunchUnstakingEvent {
        staker: ctx.accounts.staker.key(),
        remaining_sol_amount: return_amount,
        unstaking_fee,
        timestamp: current_time,
    });

    msg!("Post-launch unstaking: {} SOL returned (fee: {} SOL)", 
         crate::utils::lamports_to_sol(return_amount), 
         crate::utils::lamports_to_sol(unstaking_fee));

    Ok(())
}

#[event]
pub struct PostLaunchUnstakingEvent {
    pub staker: Pubkey,
    pub remaining_sol_amount: u64,
    pub unstaking_fee: u64,
    pub timestamp: i64,
}