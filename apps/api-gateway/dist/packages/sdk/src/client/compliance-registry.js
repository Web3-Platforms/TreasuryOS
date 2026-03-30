import { Connection, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';
import { rpcConfigSchema } from '../config/rpc.js';
export class ComplianceRegistryClient {
    connection;
    programId;
    constructor(programId, rpcConfig) {
        const parsedConfig = rpcConfigSchema.parse(rpcConfig);
        this.connection = new Connection(parsedConfig.url, parsedConfig.commitment);
        this.programId = new PublicKey(programId);
    }
    deriveEntityRecord(entityId) {
        const entitySeed = hashEntitySeed(entityId);
        return PublicKey.findProgramAddressSync([Buffer.from('entity'), entitySeed], this.programId);
    }
    deriveWhitelistEntry(institutionId, walletAddress) {
        const institutionSeed = hashInstitutionSeed(institutionId);
        return PublicKey.findProgramAddressSync([Buffer.from('wallet'), institutionSeed, new PublicKey(walletAddress).toBuffer()], this.programId);
    }
}
export function hashEntitySeed(entityId) {
    return crypto.createHash('sha256').update(entityId).digest();
}
export function hashInstitutionSeed(institutionId) {
    return crypto.createHash('sha256').update(institutionId).digest();
}
//# sourceMappingURL=compliance-registry.js.map