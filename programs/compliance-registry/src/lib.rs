use anchor_lang::prelude::*;

declare_id!("ASG5VS1jFQSsLfyuACNvfK2oFsoBd4TQjJBK1uvznorm");

#[program]
pub mod compliance_registry {
    use super::*;

    /// Creates the PDA that stores one entity's KYC status and risk metadata.
    /// New entities always start in the Pending state.
    pub fn register_entity(
        ctx: Context<RegisterEntity>,
        entity_id: [u8; 32],
        jurisdiction: u16,
        risk_score: u8,
    ) -> Result<()> {
        require!(risk_score <= 100, ComplianceRegistryError::InvalidRiskScore);

        let entity = &mut ctx.accounts.entity_record;
        entity.entity_id = entity_id;
        entity.kyc_status = KycStatus::Pending;
        entity.jurisdiction = jurisdiction;
        entity.risk_score = risk_score;
        entity.authority = ctx.accounts.authority.key();
        entity.last_updated = Clock::get()?.unix_timestamp;
        entity.bump = ctx.bumps.entity_record;

        Ok(())
    }

    /// Updates the stored KYC status for an entity.
    /// The authority that created the record remains the only signer permitted
    /// to mutate it.
    pub fn update_status(ctx: Context<UpdateStatus>, status: KycStatus) -> Result<()> {
        let entity = &mut ctx.accounts.entity_record;
        entity.kyc_status = status;
        entity.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(entity_id: [u8; 32])]
pub struct RegisterEntity<'info> {
    /// PDA: ["entity", entity_id].
    #[account(
        init,
        payer = authority,
        seeds = [b"entity", entity_id.as_ref()],
        bump,
        space = 8 + EntityRecord::INIT_SPACE
    )]
    pub entity_record: Account<'info, EntityRecord>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateStatus<'info> {
    /// The record can only be updated by the authority stored on creation.
    #[account(mut, has_one = authority)]
    pub entity_record: Account<'info, EntityRecord>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
/// Canonical compliance record for one entity identifier.
pub struct EntityRecord {
    pub entity_id: [u8; 32],
    pub kyc_status: KycStatus,
    pub jurisdiction: u16,
    pub risk_score: u8,
    pub authority: Pubkey,
    pub last_updated: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
/// Current KYC review state tracked for an entity.
pub enum KycStatus {
    Pending,
    Approved,
    Rejected,
    UnderReview,
    Expired,
}

#[error_code]
pub enum ComplianceRegistryError {
    #[msg("Risk score must be between 0 and 100.")]
    InvalidRiskScore,
}
