use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
pub struct CalculateRankingsAndLaunch<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = !global_state.load()?.paused @ KapikolError::ProtocolPaused,
        constraint = !global_state.load()?.emergency_mode @ KapikolError::EmergencyModeActive
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    /// CHECK: This account is verified in the instruction handler
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CalculateRankingsAndLaunch>) -> Result<()> {
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    let mut global_state = ctx.accounts.global_state.load_mut()?;
    
    // Check if epoch is complete
    require!(
        global_state.is_epoch_complete(current_time),
        KapikolError::EpochNotComplete
    );

    msg!("Epoch {} complete after {} seconds", 
         global_state.current_epoch,
         current_time - global_state.epoch_start_time);

    // In a full implementation, this would:
    // 1. Iterate through all influencer vaults
    // 2. Calculate ranking scores for each competing influencer
    // 3. Find the highest-scoring influencer that meets launch criteria
    // 4. Trigger token launch for the winner
    // 5. Start a new epoch

    // For this simplified version, we'll just start a new epoch
    global_state.start_new_epoch(current_time)?;

    emit!(EpochCompletedEvent {
        previous_epoch: global_state.current_epoch - 1,
        new_epoch: global_state.current_epoch,
        epoch_start_time: current_time,
        epoch_duration: global_state.epoch_duration,
        total_influencers_competing: 0, // Would be calculated in full implementation
        winning_influencer: None, // Would be set if there's a winner
    });

    msg!("New epoch {} started", global_state.current_epoch);

    Ok(())
}

#[event]
pub struct EpochCompletedEvent {
    pub previous_epoch: u64,
    pub new_epoch: u64,
    pub epoch_start_time: i64,
    pub epoch_duration: i64,
    pub total_influencers_competing: u32,
    pub winning_influencer: Option<Pubkey>,
}