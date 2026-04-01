import { Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { RpcConfig } from '../config/rpc.js';
export declare class WalletWhitelistClient {
    readonly connection: Connection;
    readonly programId: PublicKey;
    constructor(programId: string, rpcConfig: RpcConfig);
    deriveWhitelistEntry(institutionId: string, walletAddress: string): [PublicKey, number];
    buildAddWalletInstruction(institutionId: string, walletAddress: string, authority: PublicKey): {
        whitelistEntry: PublicKey;
        instruction: TransactionInstruction;
    };
    addWallet(institutionId: string, walletAddress: string, authority: Keypair): Promise<{
        signature: string;
        whitelistEntry: string;
    }>;
}
export declare function isValidSolanaAddress(value: string): boolean;
export declare function loadAuthorityKeypair(keypairPath: string): Keypair;
export declare function loadAuthorityKeypairFromJson(contents: string): Keypair;
