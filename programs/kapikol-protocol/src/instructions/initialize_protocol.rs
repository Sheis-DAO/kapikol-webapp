use anchor_lang::prelude::*;
use anchor_spl::token::{Token};
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalProtocolState::LEN,
        seeds = [PROTOCOL_SEED],
        bump
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<PlatformTreasury>(),
        seeds = [PLATFORM_TREASURY_SEED],
        bump
    )]
    pub platform_treasury: Account<'info, PlatformTreasury>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<SheisDAOTreasury>(),
        seeds = [SHEIS_DAO_TREASURY_SEED],
        bump
    )]
    pub sheis_dao_treasury: Account<'info, SheisDAOTreasury>,

    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<DeveloperVesting>(),
        seeds = [DEVELOPER_VESTING_SEED],
        bump
    )]
    pub developer_vesting: Account<'info, DeveloperVesting>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury authority will be set by the authority
    pub treasury_authority: UncheckedAccount<'info>,

    /// CHECK: Upgrade authority will be set by the authority  
    pub upgrade_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeProtocol>,
    protocol_config: ProtocolConfig,
) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;

    // Initialize global protocol state
    let mut global_state = ctx.accounts.global_state.load_init()?;
    global_state.version = 1;
    global_state.authority = ctx.accounts.authority.key();
    global_state.current_epoch = 1;
    global_state.epoch_start_time = current_time;
    global_state.epoch_duration = protocol_config.epoch_duration;
    global_state.total_influencers = 0;
    global_state.total_staked_sol = 0;
    global_state.platform_treasury = ctx.accounts.platform_treasury.key();
    global_state.sheis_dao_treasury = ctx.accounts.sheis_dao_treasury.key();
    global_state.developer_treasury = ctx.accounts.developer_vesting.key();
    global_state.emergency_mode = false;
    global_state.paused = false;
    global_state.upgrade_authority = ctx.accounts.upgrade_authority.key();

    // Set configurable parameters
    global_state.min_stake_amount = protocol_config.min_stake_amount;
    global_state.max_stake_amount = protocol_config.max_stake_amount;
    global_state.min_launch_score = protocol_config.min_launch_score;
    global_state.staking_fee = protocol_config.staking_fee;
    global_state.unstaking_fee_pre = protocol_config.unstaking_fee_pre;
    global_state.unstaking_fee_post = protocol_config.unstaking_fee_post;
    global_state.verification_period = protocol_config.verification_period;
    global_state.vesting_duration = protocol_config.vesting_duration;

    // Initialize platform treasury
    let platform_treasury = &mut ctx.accounts.platform_treasury;
    platform_treasury.authority = ctx.accounts.treasury_authority.key();
    platform_treasury.total_fees_collected = 0;
    platform_treasury.staking_fees = 0;
    platform_treasury.unstaking_fees = 0;
    platform_treasury.operational_expenses = 0;
    platform_treasury.revenue_sharing = 0;
    platform_treasury.last_distribution = current_time;
    platform_treasury.daily_withdrawn = 0;
    platform_treasury.last_daily_reset = current_time;

    // Initialize Sheis-DAO treasury
    let sheis_dao_treasury = &mut ctx.accounts.sheis_dao_treasury;
    sheis_dao_treasury.authority = ctx.accounts.treasury_authority.key(); // Same authority for now
    sheis_dao_treasury.unclaimed_tokens = 0;
    sheis_dao_treasury.platform_revenue_share = 0;
    sheis_dao_treasury.grants_distributed = 0;
    sheis_dao_treasury.active_programs = 0;
    sheis_dao_treasury.last_grant_distribution = current_time;

    // Initialize developer vesting
    let developer_vesting = &mut ctx.accounts.developer_vesting;
    developer_vesting.authority = ctx.accounts.upgrade_authority.key(); // Developer authority
    developer_vesting.total_allocation = 0;
    developer_vesting.total_claimed = 0;
    developer_vesting.last_claim_time = current_time;
    developer_vesting.vesting_start = current_time;
    developer_vesting.vesting_duration = protocol_config.vesting_duration;
    developer_vesting.is_active = true;

    emit!(ProtocolInitializedEvent {
        authority: ctx.accounts.authority.key(),
        epoch_duration: protocol_config.epoch_duration,
        min_stake_amount: protocol_config.min_stake_amount,
        initialization_time: current_time,
    });

    msg!("Protocol initialized successfully");
    msg!("Epoch duration: {} seconds", protocol_config.epoch_duration);
    msg!("Min stake amount: {} lamports", protocol_config.min_stake_amount);
    msg!("Max stake amount: {} lamports", protocol_config.max_stake_amount);

    Ok(())
}

#[event]
pub struct ProtocolInitializedEvent {
    pub authority: Pubkey,
    pub epoch_duration: i64,
    pub min_stake_amount: u64,
    pub initialization_time: i64,
}