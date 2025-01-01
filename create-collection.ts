import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import "dotenv/config";

const connection = new Connection(clusterApiUrl('devnet'));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 10 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log('loaded user: ', user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(mplTokenMetadata());
umi.use(keypairIdentity(umiUser));

console.log('Set up UMI user!');

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: 'My Test Collection',
    symbol: 'MC',
    uri: 'https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json',
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true
});

await transaction.sendAndConfirm(umi);

const createdCollection = await fetchDigitalAsset(umi, collectionMint.publicKey);

console.log({
    mintAccount: createdCollection.mint.publicKey.toString(),
    metadataAccount: createdCollection.metadata.publicKey.toString()
});

console.log('----------------------------------');


console.log(
    `Created Collection Address is ${getExplorerLink(
        "address",
        createdCollection.mint.publicKey,
        "devnet"
    )}`
);

