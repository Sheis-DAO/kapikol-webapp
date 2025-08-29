use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{constants::*, errors::*, state::*, utils::*};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct StakeOnInfluencer<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = !global_state.load()?.paused @ KapikolError::ProtocolPaused,
        constraint = !global_state.load()?.emergency_mode @ KapikolError::EmergencyModeActive
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    #[account(
        mut,
        seeds = [INFLUENCER_VAULT_SEED, influencer_vault.influencer_id.as_ref()],
        bump,
        constraint = influencer_vault.launch_status == LaunchStatus::Competing @ KapikolError::InvalidUnstakeState,
        constraint = influencer_vault.content_flag == ContentFlag::Clean @ KapikolError::InvalidUnstakeState
    )]
    pub influencer_vault: Account<'info, InfluencerVault>,

    #[account(
        init_if_needed,
        payer = staker,
        space = StakePosition::LEN,
        seeds = [STAKE_POSITION_SEED, staker.key().as_ref(), influencer_vault.key().as_ref()],
        bump
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

pub fn handler(ctx: Context<StakeOnInfluencer>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    // Load and validate global state
    let mut global_state = ctx.accounts.global_state.load_mut()?;
    global_state.validate_stake_amount(amount)?;

    // Calculate platform fee
    let platform_fee = global_state.calculate_platform_fee(amount)?;
    let net_stake = amount
        .checked_sub(platform_fee)
        .ok_or(KapikolError::ArithmeticUnderflow)?;

    // Validate minimum net stake after fees
    require!(
        net_stake >= global_state.min_stake_amount / 2, // Allow some flexibility for fees
        KapikolError::InsufficientStakeAmount
    );

    // Transfer platform fee to treasury
    if platform_fee > 0 {
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.staker.to_account_info(),
                    to: ctx.accounts.platform_treasury.to_account_info(),
                },
            ),
            platform_fee,
        )?;

        // Update treasury fee tracking
        ctx.accounts.platform_treasury.add_fee_revenue(
            platform_fee,
            crate::state::treasury::FeeType::Staking,
        )?;
    }

    // Transfer net stake to protocol (stored in global state account for simplicity)
    // In a production system, you might want a separate vault account
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.staker.to_account_info(),
                to: ctx.accounts.global_state.to_account_info(),
            },
        ),
        net_stake,
    )?;

    // Check if this is a new staker for this influencer
    let is_new_staker = ctx.accounts.stake_position.staker == Pubkey::default();
    let is_existing_position = ctx.accounts.stake_position.net_amount > 0;

    // Update or initialize stake position
    if is_existing_position {
        // Add to existing position
        ctx.accounts.stake_position.add_stake(amount, net_stake, current_time)?;
    } else {
        // Initialize new position
        ctx.accounts.stake_position.initialize(
            ctx.accounts.staker.key(),
            ctx.accounts.influencer_vault.key(),
            amount,
            net_stake,
            current_time,
            global_state.current_epoch,
        );
    }

    // Update influencer vault
    ctx.accounts.influencer_vault.update_staking_activity(
        net_stake,
        is_new_staker,
        current_time,
    )?;

    // Update global state
    global_state.total_staked_sol = global_state.total_staked_sol
        .checked_add(net_stake)
        .ok_or(KapikolError::ArithmeticOverflow)?;

    // Update ranking score cache for gas optimization
    ctx.accounts.influencer_vault.calculate_ranking_score(global_state.current_epoch)?;

    emit!(StakingEvent {
        staker: ctx.accounts.staker.key(),
        influencer_vault: ctx.accounts.influencer_vault.key(),
        gross_amount: amount,
        net_amount: net_stake,
        platform_fee,
        epoch: global_state.current_epoch,
        timestamp: current_time,
        is_new_staker,
        total_staked_on_influencer: ctx.accounts.influencer_vault.total_staked,
        ranking_score: ctx.accounts.influencer_vault.ranking_score_cache,
    });

    msg!("Stake successful: {} SOL (fee: {} SOL)", 
         lamports_to_sol(net_stake), 
         lamports_to_sol(platform_fee));

    Ok(())
}

#[event]
pub struct StakingEvent {
    pub staker: Pubkey,
    pub influencer_vault: Pubkey,
    pub gross_amount: u64,
    pub net_amount: u64,
    pub platform_fee: u64,
    pub epoch: u64,
    pub timestamp: i64,
    pub is_new_staker: bool,
    pub total_staked_on_influencer: u64,
    pub ranking_score: u64,
}