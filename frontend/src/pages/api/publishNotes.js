import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, Provider, web3 } from '@coral-xyz/anchor';

// Solana cluster and program ID
const ALCHEMY_RPC_URL = "https://solana-devnet.g.alchemy.com/v2/P9iizjWSpGJP7WazfVoN25Fd1NqOwOJM"; // Devnet URL
const PROGRAM_ID = new PublicKey("AjBPBPn8YriuATfB1Ntji7oAerThhdCvozeSZ88CW3QD"); // Your deployed Program ID



// Hardcoded IDL (Interaction with Solana smart contract)
 
const idl = {
  "version": "0.1.0",
  "name": "solana_notes",
  "instructions": [
    {
      "name": "publishNote", 
      "accounts": [
        { "name": "note", "isMut": true, "isSigner": false},
        { "name": "author", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ], 
      "args": [{ "name": "noteId", "type": "u64" },{"name":"content","type":"string"}]
    }
  ],
  "accounts": [
    {
      "name": "Note",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "author", "msg": "Content exceeds the maximum allowed length." },
          { "name": "noteId", "type": "u64" },
           {"name":"content","type":"string"}

        ]
      }
    }
  ],
   "errors": [
    {
      "code": "6000",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "ContentTooLong", "type": "publicKey" }  
        ]
      }
    }
  ] 

};



export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Note content is required!" });
    }

    // Log the content being received
    console.log('Received content:', content);

    // Initialize connection and provider
    const connection = new Connection(ALCHEMY_RPC_URL, 'confirmed');
    
    const wallet = Keypair.generate(); // Generate a wallet for testing

    // Airdrop SOL to the wallet
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL); // 2 SOL airdrop
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    console.log(`Airdropped 2 SOL to ${wallet.publicKey.toString()}`);

    // Check balance after airdrop
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(`Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    // Initialize provider and program
    const provider = new Provider(connection, wallet, Provider.defaultOptions());
    const program = new Program(idl, PROGRAM_ID, provider);

    try {
      // Create a new note account (simplified version)
      const [noteAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("note"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Call the program's RPC function to create the note
      await program.methods.publishNote(content, {
        accounts: {
          noteAccount: noteAccount,
          author: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      });

      // Log success
      console.log("Note created successfully!");
      res.status(200).json({ message: "Note created successfully!" });
    } catch (error) {
      // Log the error
      console.error("Failed to create note:", error);
      res.status(500).json({ message: "Failed to create note", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}