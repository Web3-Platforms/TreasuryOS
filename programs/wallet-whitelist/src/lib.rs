use anchor_lang::prelude::*;

declare_id!("3ZaNXXp99xnWYYcaCJMJWnBfMxj2K4QpHkADV8D7321c");

#[program]
pub mod wallet_whitelist {
    use super::*;

    /// Creates the PDA that represents an allowed wallet for one institution seed.
    /// The same authority that creates the entry becomes the only signer that can
    /// later deactivate it.
    pub fn add_wallet(
        ctx: Context<AddWallet>,
        institution_id: [u8; 32],
        wallet: Pubkey,
    ) -> Result<()> {
        let entry = &mut ctx.accounts.whitelist_entry;
        entry.institution_id = institution_id;
        entry.wallet = wallet;
        entry.active = true;
        entry.authority = ctx.accounts.authority.key();
        entry.bump = ctx.bumps.whitelist_entry;
        Ok(())
    }

    /// Soft-deactivates a whitelist entry while preserving the account record for
    /// later on-chain inspection.
    pub fn remove_wallet(ctx: Context<RemoveWallet>) -> Result<()> {
        ctx.accounts.whitelist_entry.active = false;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(institution_id: [u8; 32], wallet: Pubkey)]
pub struct AddWallet<'info> {
    /// PDA: ["wallet", institution_id, wallet].
    /// TreasuryOS hashes the institution identifier off-chain before passing the
    /// 32-byte seed into this instruction.
    #[account(
        init,
        payer = authority,
        seeds = [b"wallet", institution_id.as_ref(), wallet.as_ref()],
        bump,
        space = 8 + WhitelistEntry::INIT_SPACE
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveWallet<'info> {
    /// The stored authority is the only signer allowed to deactivate the entry.
    #[account(mut, has_one = authority)]
    pub whitelist_entry: Account<'info, WhitelistEntry>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
/// Canonical wallet-whitelist record keyed by one institution seed and wallet.
pub struct WhitelistEntry {
    pub institution_id: [u8; 32],
    pub wallet: Pubkey,
    pub active: bool,
    pub authority: Pubkey,
    pub bump: u8,
}
