use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct UnstakePreLaunch<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = !global_state.load()?.emergency_mode @ KapikolError::EmergencyModeActive
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    #[account(
        mut,
        seeds = [INFLUENCER_VAULT_SEED, influencer_vault.influencer_id.as_ref()],
        bump,
        constraint = influencer_vault.launch_status == LaunchStatus::Competing @ KapikolError::InvalidUnstakeState
    )]
    pub influencer_vault: Account<'info, InfluencerVault>,

    #[account(
        mut,
        seeds = [STAKE_POSITION_SEED, staker.key().as_ref(), influencer_vault.key().as_ref()],
        bump,
        constraint = stake_position.staker == staker.key() @ KapikolError::UnauthorizedPlatformAuthority,
        constraint = stake_position.can_unstake_pre_launch() @ KapikolError::InvalidPositionStatus
    )]
    pub stake_position: Account<'info, StakePosition>,

    #[account(
        mut,
        seeds = [PLATFORM_TREASURY_SEED],
        bump
    )]
    pub platform_treasury: Account<'info, PlatformTreasury>,

    #[account(mut)]
    pub staker: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<UnstakePreLaunch>) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    let global_state = ctx.accounts.global_state.load()?;
    let stake_position = &mut ctx.accounts.stake_position;
    
    // Calculate 1% unstaking fee on net amount
    let unstaking_fee = global_state.calculate_unstaking_fee(stake_position.net_amount, false)?;
    let return_amount = stake_position.net_amount
        .checked_sub(unstaking_fee)
        .ok_or(KapikolError::ArithmeticUnderflow)?;

    // Transfer unstaking fee to platform treasury
    if unstaking_fee > 0 {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.global_state.to_account_info(),
                    to: ctx.accounts.platform_treasury.to_account_info(),
                },
                &[&[PROTOCOL_SEED, &[ctx.bumps.global_state]]],
            ),
            unstaking_fee,
        )?;

        // Update treasury fee tracking
        ctx.accounts.platform_treasury.add_fee_revenue(
            unstaking_fee,
            crate::state::treasury::FeeType::Unstaking,
        )?;
    }

    // Transfer remaining amount back to staker
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.global_state.to_account_info(),
                to: ctx.accounts.staker.to_account_info(),
            },
            &[&[PROTOCOL_SEED, &[ctx.bumps.global_state]]],
        ),
        return_amount,
    )?;

    // Check if this is the staker's last position (for unique staker count)
    let is_last_stake = stake_position.net_amount == ctx.accounts.influencer_vault.total_staked;

    // Update influencer vault
    ctx.accounts.influencer_vault.update_unstaking_activity(
        stake_position.net_amount,
        is_last_stake,
        current_time,
    )?;

    // Update global state
    let mut global_state_mut = ctx.accounts.global_state.load_mut()?;
    global_state_mut.total_staked_sol = global_state_mut.total_staked_sol
        .checked_sub(stake_position.net_amount)
        .ok_or(KapikolError::ArithmeticUnderflow)?;

    // Complete the unstaking process
    stake_position.complete_unstaking(current_time);

    // Update ranking score cache
    ctx.accounts.influencer_vault.calculate_ranking_score(global_state_mut.current_epoch)?;

    emit!(UnstakingEvent {
        staker: ctx.accounts.staker.key(),
        influencer_vault: ctx.accounts.influencer_vault.key(),
        gross_amount: stake_position.gross_amount,
        net_amount_returned: return_amount,
        unstaking_fee,
        unstake_type: UnstakeType::PreLaunch,
        timestamp: current_time,
        remaining_stakers: ctx.accounts.influencer_vault.unique_stakers,
        total_remaining_staked: ctx.accounts.influencer_vault.total_staked,
    });

    msg!("Pre-launch unstaking successful: {} SOL returned (fee: {} SOL)", 
         crate::utils::lamports_to_sol(return_amount), 
         crate::utils::lamports_to_sol(unstaking_fee));

    Ok(())
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum UnstakeType {
    PreLaunch,
    PostLaunch,
}

#[event]
pub struct UnstakingEvent {
    pub staker: Pubkey,
    pub influencer_vault: Pubkey,
    pub gross_amount: u64,
    pub net_amount_returned: u64,
    pub unstaking_fee: u64,
    pub unstake_type: UnstakeType,
    pub timestamp: i64,
    pub remaining_stakers: u32,
    pub total_remaining_staked: u64,
}