import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const user = await getKeypairFromFile();

await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(mplTokenMetadata());
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
    "8wQeMMNZg6yfMJm1vLdKFjr1E47BZEhiUYTYP6jeJqaT"
);

console.log(`Creating NFT...`);

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint,
    name: "My NFT",
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false,
    }
});

await transaction.sendAndConfirm(umi);

await new Promise(resolve => setTimeout(resolve, 3000))

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log({
    mintAccount: createdNft.mint.publicKey.toString(),
    metadataAccount: createdNft.metadata.publicKey.toString()
});

console.log('----------------------------------');


console.log(
    `Created NFT Address is ${getExplorerLink(
        "address",
        createdNft.mint.publicKey,
        "devnet"
    )}`
);