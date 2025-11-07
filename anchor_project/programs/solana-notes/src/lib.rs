use anchor_lang::prelude::*;

declare_id!("FrKpuTVXmWTmgrBEBv2xFUXQwNuPcpHjKF5fC3mPQH8L");

#[program]
pub mod solana_notes {
    use super::*;

    pub fn publish_note(ctx: Context<PublishNote>, note_id: u64, content: String) -> Result<()> {
        require!(content.len() <= 280, CustomError::ContentTooLong);

        let note_account = &mut ctx.accounts.note;
        note_account.author = *ctx.accounts.author.key;
        note_account.note_id = note_id;
        note_account.content = content;

        msg!("Note {} published successfully for author: {}", note_id, ctx.accounts.author.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(note_id: u64)]
pub struct PublishNote<'info> {
    #[account(
        init_if_needed,
        seeds = [b"note", author.key().as_ref(), &note_id.to_le_bytes()], // ✅ FIXED: Added note_id to seeds
        bump,
        payer = author,
        space = Note::SIZE // ✅ Use constant for space
    )]
    pub note: Account<'info, Note>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Note {
    pub author: Pubkey,
    pub note_id: u64,
    pub content: String,
}

// ✅ Add space constant
impl Note {
    pub const SIZE: usize = 8 +      // discriminator
                            32 +     // author (Pubkey)
                            8 +      // note_id (u64)
                            4 + 280; // content (String: 4-byte length + 280 chars max)
}

#[error_code]
pub enum CustomError {
    #[msg("Content exceeds the maximum allowed length.")]
    ContentTooLong,
}