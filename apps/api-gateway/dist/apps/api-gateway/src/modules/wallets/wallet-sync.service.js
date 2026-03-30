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
import { WalletWhitelistClient, isValidSolanaAddress, loadAuthorityKeypair } from '@treasuryos/sdk';
import { ChainSyncStatus } from '@treasuryos/types';
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { KmsService } from '../security/kms.service.js';
import { SquadsService } from '../governance/squads.service.js';
let WalletSyncService = WalletSyncService_1 = class WalletSyncService {
    kmsService;
    squadsService;
    logger = new Logger(WalletSyncService_1.name);
    env = loadApiGatewayEnv();
    constructor(kmsService, squadsService) {
        this.kmsService = kmsService;
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
            // Determine authority public key and signer
            let authorityPubkey;
            let authoritySigner = null;
            if (this.env.SOLANA_SIGNING_MODE === 'kms') {
                if (!this.env.AWS_KMS_PUBLIC_KEY) {
                    throw new Error('AWS_KMS_PUBLIC_KEY is required when SOLANA_SIGNING_MODE is set to kms');
                }
                authorityPubkey = new PublicKey(this.env.AWS_KMS_PUBLIC_KEY);
                authoritySigner = this.kmsService.getSigner();
                if (!authoritySigner)
                    throw new Error('KMS Signer not initialized');
            }
            else {
                if (!this.env.AUTHORITY_KEYPAIR_PATH) {
                    throw new Error('AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is filesystem');
                }
                const authorityKeypair = loadAuthorityKeypair(this.env.AUTHORITY_KEYPAIR_PATH);
                authorityPubkey = authorityKeypair.publicKey;
                authoritySigner = authorityKeypair;
            }
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
            let signature;
            if (this.env.SOLANA_SIGNING_MODE === 'kms') {
                const [signedTx] = await this.kmsService.signTransactions([transaction]);
                signature = await connection.sendRawTransaction(signedTx.serialize());
                await connection.confirmTransaction(signature, 'confirmed');
            }
            else {
                signature = await sendAndConfirmTransaction(connection, transaction, [authoritySigner], { commitment: 'confirmed' });
            }
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
    __param(0, Inject(KmsService)),
    __param(1, Inject(SquadsService)),
    __metadata("design:paramtypes", [KmsService,
        SquadsService])
], WalletSyncService);
export { WalletSyncService };
//# sourceMappingURL=wallet-sync.service.js.map