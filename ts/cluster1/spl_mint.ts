import { Connection, Keypair, PublicKey, Commitment } from "@solana/web3.js"
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "./wba-wallet.json"

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

// create a solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com");

const token_decimals = 1_000_000n;

// mint address
const mint = new PublicKey("Ezk2UvactiXWVwYMrdRYVs2qVhKwfeR2ugtzs74fdD8r");

(async () => {

	try {
		const tokenAccount = await getOrCreateAssociatedTokenAccount(
			connection,
			keypair,
			mint,
			keypair.publicKey
		)
		console.log(`Your ATA account: ${tokenAccount.address.toBase58()}`)

		const txhash = await mintTo(
			connection,
			keypair,
			mint,
			tokenAccount.address,
			keypair,
			100n * token_decimals
		)
		console.log(`Success! Check out your TX here: 
		https://explorer.solana.com/tx/${txhash}?cluster=devnet`);

	} catch(error: any) {
		if (error.name === "TokenAccountNotFoundError") {
			console.log(`Failed to find Token Account. Wait a few seconds and try again. `)
		}
		console.log(`Oops, something went wrong: ${error}`);
	}
})()



