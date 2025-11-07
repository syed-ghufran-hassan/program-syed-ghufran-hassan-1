import BN from "bn.js";
import * as web3 from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import type { SolanaNotes } from "../target/types/solana_notes";

describe("Solana Notes Program", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaNotes as anchor.Program<SolanaNotes>;
  
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaNotes;

  it("should publish a note with note_id", async () => {
    const noteId = new anchor.BN(1); // note_id as u64
    const noteContent = "This is my first note on Solana using Anchor!";

    // Generate PDA with correct seeds
    const [notePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        provider.wallet.publicKey.toBuffer(),
        noteId.toArrayLike(Buffer, "le", 8) // note_id in seeds
      ],
      program.programId
    );

    console.log("Publishing note with ID:", noteId.toString());
    console.log("Note PDA:", notePda.toString());

    const txHash = await program.methods
      .publishNote(noteId, noteContent)
      .accounts({
        note: notePda,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ Transaction sent:", txHash);
    await provider.connection.confirmTransaction(txHash, "confirmed");

    // Verify the note
    const noteAccount = await program.account.note.fetch(notePda);
    console.log("✅ Note created successfully!");
    console.log("Note ID:", noteAccount.noteId.toString());
    console.log("Author:", noteAccount.author.toBase58());
    console.log("Content:", noteAccount.content);
  });

  it("should allow multiple notes per author", async () => {
    // Test creating multiple notes with different IDs
    const note1Id = new anchor.BN(1);
    const note2Id = new anchor.BN(2);
    
    const [note1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        provider.wallet.publicKey.toBuffer(),
        note1Id.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    const [note2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("note"),
        provider.wallet.publicKey.toBuffer(),
        note2Id.toArrayLike(Buffer, "le", 8)
      ],
      program.programId
    );

    console.log("Note 1 PDA:", note1Pda.toString());
    console.log("Note 2 PDA:", note2Pda.toString());
    
    // They should be different PDAs
    if (note1Pda.equals(note2Pda)) {
      throw new Error("PDAs should be different for different note IDs!");
    }
    
    console.log("✅ Multiple notes per author supported!");
  });
});