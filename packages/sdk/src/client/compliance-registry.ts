import { Connection, PublicKey } from '@solana/web3.js';
import crypto from 'crypto';

import { RpcConfig, rpcConfigSchema } from '../config/rpc.js';

export class ComplianceRegistryClient {
  readonly connection: Connection;
  readonly programId: PublicKey;

  constructor(programId: string, rpcConfig: RpcConfig) {
    const parsedConfig = rpcConfigSchema.parse(rpcConfig);
    this.connection = new Connection(parsedConfig.url, parsedConfig.commitment);
    this.programId = new PublicKey(programId);
  }

  deriveEntityRecord(entityId: string) {
    const entitySeed = hashEntitySeed(entityId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from('entity'), entitySeed],
      this.programId,
    );
  }

  deriveWhitelistEntry(institutionId: string, walletAddress: string) {
    const institutionSeed = hashInstitutionSeed(institutionId);
    return PublicKey.findProgramAddressSync(
      [Buffer.from('wallet'), institutionSeed, new PublicKey(walletAddress).toBuffer()],
      this.programId,
    );
  }
}

export function hashEntitySeed(entityId: string) {
  return crypto.createHash('sha256').update(entityId).digest();
}

export function hashInstitutionSeed(institutionId: string) {
  return crypto.createHash('sha256').update(institutionId).digest();
}
