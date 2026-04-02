import { Injectable, Logger } from '@nestjs/common';

import { ComplianceRegistryClient, RpcConfig } from '@treasuryos/sdk';
import { KycStatus } from '@treasuryos/types';

import { loadKycServiceEnv } from '../config/env.js';

@Injectable()
export class OnchainSyncService {
  private readonly logger = new Logger(OnchainSyncService.name);
  private readonly env = loadKycServiceEnv();

  async syncKycToChain(entityId: string, status: KycStatus) {
    const rpcConfig: RpcConfig = {
      url: this.env.SOLANA_RPC_URL,
      network: this.env.SOLANA_NETWORK,
      commitment: 'confirmed',
    };

    const client = new ComplianceRegistryClient(
      this.env.PROGRAM_ID_COMPLIANCE_REGISTRY,
      rpcConfig,
    );
    const [entityPda] = client.deriveEntityRecord(entityId);

    this.logger.log(`Prepared on-chain sync for ${entityId} at ${entityPda.toBase58()} with status ${status}`);

    return {
      entityId,
      status,
      entityPda: entityPda.toBase58(),
      dryRun: true,
    };
  }
}
