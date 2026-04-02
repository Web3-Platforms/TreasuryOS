var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OnchainSyncService_1;
import { Injectable, Logger } from '@nestjs/common';
import { ComplianceRegistryClient } from '@treasuryos/sdk';
import { loadKycServiceEnv } from '../config/env.js';
let OnchainSyncService = OnchainSyncService_1 = class OnchainSyncService {
    logger = new Logger(OnchainSyncService_1.name);
    env = loadKycServiceEnv();
    async syncKycToChain(entityId, status) {
        const rpcConfig = {
            url: this.env.SOLANA_RPC_URL,
            network: this.env.SOLANA_NETWORK,
            commitment: 'confirmed',
        };
        const client = new ComplianceRegistryClient(this.env.PROGRAM_ID_COMPLIANCE_REGISTRY, rpcConfig);
        const [entityPda] = client.deriveEntityRecord(entityId);
        this.logger.log(`Prepared on-chain sync for ${entityId} at ${entityPda.toBase58()} with status ${status}`);
        return {
            entityId,
            status,
            entityPda: entityPda.toBase58(),
            dryRun: true,
        };
    }
};
OnchainSyncService = OnchainSyncService_1 = __decorate([
    Injectable()
], OnchainSyncService);
export { OnchainSyncService };
//# sourceMappingURL=onchain-sync.service.js.map