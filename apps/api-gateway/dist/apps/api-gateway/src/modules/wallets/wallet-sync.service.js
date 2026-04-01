var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletSyncService_1;
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WalletWhitelistClient, isValidSolanaAddress } from '@treasuryos/sdk';
import { ChainSyncStatus } from '@treasuryos/types';
import { Connection, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
import { SquadsService } from '../governance/squads.service.js';
let WalletSyncService = WalletSyncService_1 = class WalletSyncService {
    authoritySignerService;
    squadsService;
    logger = new Logger(WalletSyncService_1.name);
    env = loadApiGatewayEnv();
    constructor(authoritySignerService, squadsService) {
        this.authoritySignerService = authoritySignerService;
        this.squadsService = squadsService;
    }
    createPreview(institutionId, walletAddress) {
        if (!isValidSolanaAddress(walletAddress)) {
            throw new Error('Wallet address is not a valid Solana public key');
        }
        const client = this.createClient();
        const [whitelistEntry] = client.deriveWhitelistEntry(institutionId, walletAddress);
        return {
            whitelistEntry: whitelistEntry.toBase58(),
        };
    }
    async syncApprovedWallet(entity, wallet) {
        const preview = this.createPreview(this.env.PILOT_INSTITUTION_ID, wallet.walletAddress);
        if (!this.env.SOLANA_SYNC_ENABLED) {
            return {
                chainSyncStatus: ChainSyncStatus.Skipped,
                whitelistEntry: preview.whitelistEntry,
            };
        }
        try {
            const client = this.createClient();
            const authoritySigner = this.authoritySignerService.getSigner();
            const authorityPubkey = authoritySigner.publicKey;
            // Build the instruction
            const { whitelistEntry, instruction } = client.buildAddWalletInstruction(this.env.PILOT_INSTITUTION_ID, wallet.walletAddress, authorityPubkey);
            // Check for Multi-Sig Governance
            if (this.env.SQUADS_MULTISIG_ENABLED && this.squadsService.isEnabled()) {
                const proposalIndex = await this.squadsService.proposeTransaction([instruction], authoritySigner);
                return {
                    chainSyncStatus: ChainSyncStatus.Pending,
                    signature: `squads-proposal-${proposalIndex}`,
                    whitelistEntry: whitelistEntry.toBase58(),
                };
            }
            // Standard Direct Execution
            const transaction = new Transaction().add(instruction);
            const connection = new Connection(this.env.SOLANA_RPC_URL, 'confirmed');
            const signature = await sendAndConfirmTransaction(connection, transaction, [authoritySigner], { commitment: 'confirmed' });
            return {
                chainSyncStatus: ChainSyncStatus.Sent,
                signature,
                whitelistEntry: whitelistEntry.toBase58(),
            };
        }
        catch (error) {
            this.logger.error(`Sync failed for wallet ${wallet.id}`, error instanceof Error ? error.stack : String(error));
            return {
                chainSyncStatus: ChainSyncStatus.Failed,
                syncError: error instanceof Error ? error.message : String(error),
                whitelistEntry: preview.whitelistEntry,
            };
        }
    }
    createClient() {
        return new WalletWhitelistClient(this.env.PROGRAM_ID_WALLET_WHITELIST, {
            url: this.env.SOLANA_RPC_URL,
            network: 'devnet',
            commitment: 'confirmed',
        });
    }
};
WalletSyncService = WalletSyncService_1 = __decorate([
    Injectable(),
    __param(0, Inject(AuthoritySignerService)),
    __param(1, Inject(SquadsService)),
    __metadata("design:paramtypes", [AuthoritySignerService,
        SquadsService])
], WalletSyncService);
export { WalletSyncService };
//# sourceMappingURL=wallet-sync.service.js.map