use anchor_lang::prelude::*;

declare_id!("4cfb2JR1aEHziz1rGfWAvDry2hj2kScqGLQSbU9VrfWx");

#[program]
pub mod tx_monitor {
    use super::*;

    /// Creates the PDA that stores one transaction review case.
    /// New reviews always begin in the Pending state.
    pub fn submit_transaction(
        ctx: Context<SubmitTransaction>,
        tx_hash: [u8; 32],
        risk_score: u8,
    ) -> Result<()> {
        require!(risk_score <= 100, TxMonitorError::InvalidRiskScore);

        let review = &mut ctx.accounts.tx_review;
        review.tx_hash = tx_hash;
        review.risk_score = risk_score;
        review.status = ReviewStatus::Pending;
        review.authority = ctx.accounts.authority.key();
        review.bump = ctx.bumps.tx_review;
        Ok(())
    }

    /// Updates the stored review outcome for a transaction case.
    pub fn resolve_transaction(ctx: Context<ResolveTransaction>, status: ReviewStatus) -> Result<()> {
        ctx.accounts.tx_review.status = status;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(tx_hash: [u8; 32])]
pub struct SubmitTransaction<'info> {
    /// PDA: ["tx-review", tx_hash].
    #[account(
        init,
        payer = authority,
        seeds = [b"tx-review", tx_hash.as_ref()],
        bump,
        space = 8 + TxReview::INIT_SPACE
    )]
    pub tx_review: Account<'info, TxReview>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveTransaction<'info> {
    /// The record can only be resolved by the authority stored on creation.
    #[account(mut, has_one = authority)]
    pub tx_review: Account<'info, TxReview>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
/// Canonical review case for one transaction hash.
pub struct TxReview {
    pub tx_hash: [u8; 32],
    pub risk_score: u8,
    pub status: ReviewStatus,
    pub authority: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
/// Final or intermediate disposition of a monitored transaction.
pub enum ReviewStatus {
    Pending,
    Approved,
    Blocked,
}

#[error_code]
pub enum TxMonitorError {
    #[msg("Risk score must be between 0 and 100.")]
    InvalidRiskScore,
}
