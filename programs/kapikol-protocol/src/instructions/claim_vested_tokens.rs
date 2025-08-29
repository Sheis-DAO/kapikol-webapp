use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClaimVestedTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<ClaimVestedTokens>) -> Result<()> {
    // Placeholder
    msg!("Claim vested tokens - placeholder");
    Ok(())
}