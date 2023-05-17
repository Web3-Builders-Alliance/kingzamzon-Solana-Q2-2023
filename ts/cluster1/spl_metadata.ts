import { Commitment, Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js"
import wallet from "./wba-wallet.json"
import { createCreateMetadataAccountV2Instruction, createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Define our Mint address
const mint = new PublicKey("Ezk2UvactiXWVwYMrdRYVs2qVhKwfeR2ugtzs74fdD8r")

// Add the Token Metadata Program
const token_metadata_program_id = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Create PDA for token metadata
const metadata_seeds = [
    Buffer.from('metadata'),
    token_metadata_program_id.toBuffer(),
    mint.toBuffer(),
];
const [metadata_pda, _bump] = PublicKey.findProgramAddressSync(metadata_seeds, token_metadata_program_id);

(async () => {
    try {
        const ix1 = createCreateMetadataAccountV3Instruction(
            {
                metadata: metadata_pda,
                mint,
                mintAuthority: keypair.publicKey,
                payer: keypair.publicKey,
                updateAuthority: keypair.publicKey
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: "WWE_Token",
                        collection: null,
                        creators: [],
                        sellerFeeBasisPoints: 300,
                        symbol: "WWET",
                        uri: "https://hzwmf3kaqtw7lxhmlitjhwwubzdcdz5b5dvvlqg4yjma7lbbv6sq.arweave.net/PmzC7UCE7fXc7Fomk9rUDkYh56Ho61XA3MJYD6whr6U",
                        uses: null
                    },
                    isMutable: true,
                    collectionDetails: null
                },
            },
        )

        const tx = new Transaction().add(ix1);
        const txSignature = await sendAndConfirmTransaction(connection, tx, [keypair]);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();