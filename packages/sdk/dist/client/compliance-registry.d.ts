import { Connection, PublicKey } from '@solana/web3.js';
import { RpcConfig } from '../config/rpc.js';
export declare class ComplianceRegistryClient {
    readonly connection: Connection;
    readonly programId: PublicKey;
    constructor(programId: string, rpcConfig: RpcConfig);
    deriveEntityRecord(entityId: string): [PublicKey, number];
    deriveWhitelistEntry(institutionId: string, walletAddress: string): [PublicKey, number];
}
export declare function hashEntitySeed(entityId: string): NonSharedBuffer;
export declare function hashInstitutionSeed(institutionId: string): NonSharedBuffer;
