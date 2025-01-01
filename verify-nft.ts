import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromEnvironment,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import "dotenv/config";

const connection = new Connection(clusterApiUrl("devnet"));

// const user = await getKeypairFromEnvironment('PRIVATE_KEY');
const user = await getKeypairFromFile();

// await airdropIfRequired(
//     connection,
//     user.publicKey,
//     10 * LAMPORTS_PER_SOL,
//     0.5 * LAMPORTS_PER_SOL
// );

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

umi.use(mplTokenMetadata());
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
    "8wQeMMNZg6yfMJm1vLdKFjr1E47BZEhiUYTYP6jeJqaT"
);

const nftAddress = publicKey("5AbU7GVsEZWipVwDdL6n4WwzpXwKK1A7hVKG4NkCpLZk");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress }),
    collectionMint: collectionAddress,
    authority: umi.identity,
});

transaction.sendAndConfirm(umi);

console.log(
    `NFT ${nftAddress} verified as member of collection ${collectionAddress}! See Explorer at ${getExplorerLink(
        "address",
        nftAddress,
        "devnet"
    )}`
);