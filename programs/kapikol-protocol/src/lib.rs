use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;
pub mod utils;

use constants::*;
use errors::*;
use instructions::*;
use state::*;

declare_id!("KAPikoLaunchStakingProgram11111111111111111");

#[program]
pub mod kapikol_protocol {
    use super::*;

    /// Initialize the global protocol state
    /// Gas optimized: Uses zero-copy for large structs
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        protocol_config: ProtocolConfig,
    ) -> Result<()> {
        instructions::initialize_protocol::handler(ctx, protocol_config)
    }

    /// Update protocol configuration (admin only)
    pub fn update_protocol_config(
        ctx: Context<UpdateProtocolConfig>,
        new_config: ProtocolConfig,
    ) -> Result<()> {
        instructions::update_protocol_config::handler(ctx, new_config)
    }

    /// Create a new influencer vault
    /// Gas optimized: Minimal account creation with packed data
    pub fn create_influencer_vault(
        ctx: Context<CreateInfluencerVault>,
        influencer_id: [u8; 32],
        social_handle: String,
    ) -> Result<()> {
        instructions::create_influencer_vault::handler(ctx, influencer_id, social_handle)
    }

    /// Stake SOL on an influencer
    /// Gas optimized: Single transaction with all state updates
    pub fn stake_on_influencer(
        ctx: Context<StakeOnInfluencer>,
        amount: u64,
    ) -> Result<()> {
        instructions::stake_on_influencer::handler(ctx, amount)
    }

    /// Unstake before token launch (1% fee)
    pub fn unstake_pre_launch(ctx: Context<UnstakePreLaunch>) -> Result<()> {
        instructions::unstake_pre_launch::handler(ctx)
    }

    /// Unstake after token launch (2% fee)
    pub fn unstake_post_launch(ctx: Context<UnstakePostLaunch>) -> Result<()> {
        instructions::unstake_post_launch::handler(ctx)
    }

    /// Calculate rankings and trigger token launch if conditions are met
    /// Gas optimized: Batched operations with minimal computation
    pub fn calculate_rankings_and_launch(
        ctx: Context<CalculateRankingsAndLaunch>,
    ) -> Result<()> {
        instructions::calculate_rankings::handler(ctx)
    }

    /// Execute token launch for winning influencer
    pub fn execute_token_launch(
        ctx: Context<ExecuteTokenLaunch>,
        token_metadata: TokenMetadata,
    ) -> Result<()> {
        instructions::execute_token_launch::handler(ctx, token_metadata)
    }

    /// Influencer claims their token allocation (30%)
    pub fn influencer_claim_allocation(
        ctx: Context<InfluencerClaimAllocation>,
        verification_proof: Vec<u8>,
    ) -> Result<()> {
        instructions::influencer_claim::handler(ctx, verification_proof)
    }

    /// Process expired verification and redistribute tokens
    pub fn process_expired_verification(
        ctx: Context<ProcessExpiredVerification>,
    ) -> Result<()> {
        instructions::process_expired::handler(ctx)
    }

    /// Claim vested tokens (stakers)
    pub fn claim_vested_tokens(ctx: Context<ClaimVestedTokens>) -> Result<()> {
        instructions::claim_vested_tokens::handler(ctx)
    }

    /// Claim developer vesting
    pub fn claim_developer_vesting(ctx: Context<ClaimDeveloperVesting>) -> Result<()> {
        instructions::claim_developer_vesting::handler(ctx)
    }

    /// Emergency functions - Admin only
    pub fn pause_protocol(ctx: Context<PauseProtocol>) -> Result<()> {
        instructions::emergency::pause_protocol(ctx)
    }

    pub fn unpause_protocol(ctx: Context<UnpauseProtocol>) -> Result<()> {
        instructions::emergency::unpause_protocol(ctx)
    }

    pub fn flag_inappropriate_content(
        ctx: Context<FlagContent>,
        reason: String,
    ) -> Result<()> {
        instructions::emergency::flag_inappropriate_content(ctx, reason)
    }

    pub fn emergency_refund_staker(
        ctx: Context<EmergencyRefundStaker>,
    ) -> Result<()> {
        instructions::emergency::emergency_refund_staker(ctx)
    }
}