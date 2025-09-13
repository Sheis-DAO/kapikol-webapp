use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct UpdateProtocolConfig<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = global_state.load()?.authority == authority.key() @ KapikolError::UnauthorizedPlatformAuthority
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<UpdateProtocolConfig>,
    new_config: ProtocolConfig,
) -> Result<()> {
    let mut global_state = ctx.accounts.global_state.load_mut()?;
    
    // Validate configuration
    require!(
        new_config.epoch_duration > 0,
        KapikolError::InvalidEpochConfiguration
    );
    
    require!(
        new_config.min_stake_amount <= new_config.max_stake_amount,
        KapikolError::InvalidEpochConfiguration
    );

    // Update configurable parameters
    global_state.epoch_duration = new_config.epoch_duration;
    global_state.min_stake_amount = new_config.min_stake_amount;
    global_state.max_stake_amount = new_config.max_stake_amount;
    global_state.min_launch_score = new_config.min_launch_score;
    global_state.staking_fee = new_config.staking_fee;
    global_state.unstaking_fee_pre = new_config.unstaking_fee_pre;
    global_state.unstaking_fee_post = new_config.unstaking_fee_post;
    global_state.verification_period = new_config.verification_period;
    global_state.vesting_duration = new_config.vesting_duration;

    emit!(ProtocolConfigUpdatedEvent {
        authority: ctx.accounts.authority.key(),
        epoch_duration: new_config.epoch_duration,
        min_stake_amount: new_config.min_stake_amount,
        max_stake_amount: new_config.max_stake_amount,
        update_time: Clock::get()?.unix_timestamp,
    });

    msg!("Protocol configuration updated");

    Ok(())
}

#[event]
pub struct ProtocolConfigUpdatedEvent {
    pub authority: Pubkey,
    pub epoch_duration: i64,
    pub min_stake_amount: u64,
    pub max_stake_amount: u64,
    pub update_time: i64,
}