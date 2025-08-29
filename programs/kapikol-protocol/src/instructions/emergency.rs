use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PauseProtocol<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnpauseProtocol<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FlagContent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EmergencyRefundStaker<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn pause_protocol(_ctx: Context<PauseProtocol>) -> Result<()> {
    msg!("Pause protocol - placeholder");
    Ok(())
}

pub fn unpause_protocol(_ctx: Context<UnpauseProtocol>) -> Result<()> {
    msg!("Unpause protocol - placeholder");
    Ok(())
}

pub fn flag_inappropriate_content(_ctx: Context<FlagContent>, _reason: String) -> Result<()> {
    msg!("Flag inappropriate content - placeholder");
    Ok(())
}

pub fn emergency_refund_staker(_ctx: Context<EmergencyRefundStaker>) -> Result<()> {
    msg!("Emergency refund staker - placeholder");
    Ok(())
}