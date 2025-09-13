use anchor_lang::prelude::*;

#[error_code]
pub enum KapikolError {
    #[msg("Protocol is currently paused")]
    ProtocolPaused,

    #[msg("Emergency mode is active")]
    EmergencyModeActive,

    #[msg("Insufficient stake amount")]
    InsufficientStakeAmount,

    #[msg("Stake amount exceeds maximum allowed")]
    StakeAmountTooHigh,

    #[msg("Invalid unstake state")]
    InvalidUnstakeState,

    #[msg("Invalid position status")]
    InvalidPositionStatus,

    #[msg("Influencer not top ranked")]
    NotTopRanked,

    #[msg("Token already launched for this influencer")]
    AlreadyLaunched,

    #[msg("Verification period has expired")]
    VerificationPeriodExpired,

    #[msg("Verification period has not expired yet")]
    VerificationNotExpired,

    #[msg("Verification failed")]
    VerificationFailed,

    #[msg("No SOL available to unstake")]
    NoSOLToUnstake,

    #[msg("No tokens available to claim")]
    NoTokensToClaim,

    #[msg("Epoch not complete")]
    EpochNotComplete,

    #[msg("Insufficient signatures for multisig operation")]
    InsufficientSignatures,

    #[msg("Invalid signatures provided")]
    InvalidSignatures,

    #[msg("Unauthorized: Not platform authority")]
    UnauthorizedPlatformAuthority,

    #[msg("Unauthorized: Not treasury authority")]
    UnauthorizedTreasuryAuthority,

    #[msg("Unauthorized: Not upgrade authority")]
    UnauthorizedUpgradeAuthority,

    #[msg("Invalid influencer - must be banned for emergency refund")]
    NotBannedInfluencer,

    #[msg("Emergency refund not active")]
    NoEmergencyRefund,

    #[msg("Already refunded")]
    AlreadyRefunded,

    #[msg("Social handle too long")]
    SocialHandleTooLong,

    #[msg("Verification proof too long")]
    VerificationProofTooLong,

    #[msg("Reason text too long")]
    ReasonTooLong,

    #[msg("Influencer vault already exists")]
    InfluencerVaultExists,

    #[msg("Invalid epoch configuration")]
    InvalidEpochConfiguration,

    #[msg("Overflow in arithmetic operation")]
    ArithmeticOverflow,

    #[msg("Underflow in arithmetic operation")]
    ArithmeticUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid token distribution percentages")]
    InvalidDistributionPercentages,

    #[msg("Token creation failed")]
    TokenCreationFailed,

    #[msg("Liquidity provision failed")]
    LiquidityProvisionFailed,

    #[msg("Oracle verification failed")]
    OracleVerificationFailed,

    #[msg("Invalid ranking calculation")]
    InvalidRankingCalculation,

    #[msg("Vesting schedule not found")]
    VestingScheduleNotFound,

    #[msg("Developer vesting not found")]
    DeveloperVestingNotFound,

    #[msg("Invalid vesting claim")]
    InvalidVestingClaim,

    #[msg("Token account mismatch")]
    TokenAccountMismatch,

    #[msg("Invalid mint authority")]
    InvalidMintAuthority,

    #[msg("Treasury balance insufficient")]
    TreasuryBalanceInsufficient,

    #[msg("Invalid fee calculation")]
    InvalidFeeCalculation,

    #[msg("Clock unavailable")]
    ClockUnavailable,

    #[msg("System program required")]
    SystemProgramRequired,

    #[msg("Token program required")]
    TokenProgramRequired,

    #[msg("Associated token program required")]
    AssociatedTokenProgramRequired,

    #[msg("Rent sysvar required")]
    RentSysvarRequired,

    #[msg("Invalid account owner")]
    InvalidAccountOwner,

    #[msg("Account not initialized")]
    AccountNotInitialized,

    #[msg("Account already initialized")]
    AccountAlreadyInitialized,

    #[msg("Invalid PDA derivation")]
    InvalidPDADerivation,

    #[msg("Upgrade timelock not expired")]
    UpgradeTimelockActive,

    #[msg("Invalid upgrade")]
    InvalidUpgrade,
}