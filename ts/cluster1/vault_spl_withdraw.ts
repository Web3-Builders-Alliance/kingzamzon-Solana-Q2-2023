import { Connection, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Program, Wallet, AnchorProvider, Address, BN } from "@project-serum/anchor"
import { WbaVault, IDL } from "../programs/wba_vault";
import { TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import wallet from "./wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// Get vaultState public key
const vaultState = new PublicKey(
    "AUKGc5GuC2WZHdUpXbowjKYCWx8JYDzirkMSLJ6nYJkc"
);

// spl mint 
const mint = new PublicKey("Ezk2UvactiXWVwYMrdRYVs2qVhKwfeR2ugtzs74fdD8r");

// Create a devnet connection
const connection = new Connection("https://api.devnet.solana.com");

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(keypair), {
    commitment: "confirmed",
  });
  
  // Create our program
const program = new Program<WbaVault>(
    IDL,
    "D51uEDHLbWAxNfodfQDv7qkp8WZtxrhi3uganGbNos7o" as Address,
    provider
);
  
  // Create vault auth PDA
const vault_auth_seed = [Buffer.from("auth"), vaultState.toBuffer()];
const vault_auth = PublicKey.findProgramAddressSync(
    vault_auth_seed,
    program.programId
  )[0];
  
  // Create the PDA for vault system program
const vault_sys_seed = [Buffer.from("vault"), vault_auth.toBuffer()];
const vault = PublicKey.findProgramAddressSync(
    vault_sys_seed,
    program.programId
  )[0];

(async () => {
    try {
        const ownerAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
          );
      
        const vaultAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            vault_auth,
            true
        );
      
        const txhash = await program.methods
            .withdrawSpl(new BN(21))
            .accounts({
                owner: keypair.publicKey,
                vaultState: vaultState,
                vaultAuth: vault_auth,
                systemProgram: SystemProgram.programId,
                ownerAta: ownerAta.address,
                vaultAta: vaultAta.address,
                tokenMint: mint,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([keypair])
            .rpc();

          console.log(`Success! Check out your TX here: 
                  https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();

/**
 * Success! Check out your TX here: 
 *  https://explorer.solana.com/tx/fcd617ZdLywyLHdSkt5t7VJH7qEVxHweoavFb48hyKDLTuYWNLohb2KcWWiFkRLWkZA99pfNJv2BDLmt8Q9C44P?cluster=devnet
 */