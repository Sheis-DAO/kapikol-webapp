use anchor_lang::prelude::*;
use crate::{constants::*, errors::*, state::*};

#[derive(Accounts)]
#[instruction(influencer_id: [u8; 32], social_handle: String)]
pub struct CreateInfluencerVault<'info> {
    #[account(
        mut,
        seeds = [PROTOCOL_SEED],
        bump,
        constraint = !global_state.load()?.paused @ KapikolError::ProtocolPaused
    )]
    pub global_state: AccountLoader<'info, GlobalProtocolState>,

    #[account(
        init,
        payer = creator,
        space = InfluencerVault::LEN,
        seeds = [INFLUENCER_VAULT_SEED, influencer_id.as_ref()],
        bump
    )]
    pub influencer_vault: Account<'info, InfluencerVault>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateInfluencerVault>,
    influencer_id: [u8; 32],
    social_handle: String,
) -> Result<()> {
    // Validate social handle length
    require!(
        social_handle.len() <= MAX_SOCIAL_HANDLE_LENGTH,
        KapikolError::SocialHandleTooLong
    );

    require!(
        !social_handle.is_empty(),
        KapikolError::SocialHandleTooLong
    );

    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    let mut global_state = ctx.accounts.global_state.load_mut()?;

    // Initialize influencer vault
    let influencer_vault = &mut ctx.accounts.influencer_vault;
    influencer_vault.influencer_id = influencer_id;
    influencer_vault.social_handle = social_handle.clone();
    influencer_vault.verification_status = VerificationStatus::Unverified;
    influencer_vault.total_staked = 0;
    influencer_vault.unique_stakers = 0;
    influencer_vault.creation_epoch = global_state.current_epoch;
    influencer_vault.last_activity = current_time;
    influencer_vault.content_flag = ContentFlag::Clean;
    influencer_vault.launch_status = LaunchStatus::Competing;
    influencer_vault.ranking_score_cache = 0;
    influencer_vault.verification_deadline = 0; // Set when token launches
    influencer_vault.token_mint = None;

    // Update global state
    global_state.total_influencers = global_state.total_influencers
        .checked_add(1)
        .ok_or(KapikolError::ArithmeticOverflow)?;

    emit!(InfluencerVaultCreatedEvent {
        influencer_vault: ctx.accounts.influencer_vault.key(),
        influencer_id,
        social_handle: social_handle.clone(),
        creator: ctx.accounts.creator.key(),
        creation_epoch: global_state.current_epoch,
        creation_time: current_time,
    });

    msg!("Influencer vault created for: {}", social_handle);

    Ok(())
}

#[event]
pub struct InfluencerVaultCreatedEvent {
    pub influencer_vault: Pubkey,
    pub influencer_id: [u8; 32],
    pub social_handle: String,
    pub creator: Pubkey,
    pub creation_epoch: u64,
    pub creation_time: i64,
}