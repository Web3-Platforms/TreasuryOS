var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SquadsService_1;
import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, TransactionMessage, } from '@solana/web3.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
let SquadsService = SquadsService_1 = class SquadsService {
    authoritySignerService;
    logger = new Logger(SquadsService_1.name);
    env = loadApiGatewayEnv();
    connection;
    multisigPda = null;
    multisigModule = null;
    constructor(authoritySignerService) {
        this.authoritySignerService = authoritySignerService;
        this.connection = new Connection(this.env.SOLANA_RPC_URL, 'confirmed');
    }
    async onModuleInit() {
        if (!this.env.SQUADS_MULTISIG_ENABLED) {
            this.logger.log('Squads Multi-Sig governance is disabled.');
            return;
        }
        if (!this.env.SQUADS_MULTISIG_ADDRESS) {
            const message = 'SQUADS_MULTISIG_ADDRESS is missing. Governance logic will fail.';
            this.logger.error(message);
            if (this.env.SOLANA_SYNC_ENABLED) {
                throw new Error(message);
            }
            return;
        }
        try {
            await this.getMultisigModule();
            this.multisigPda = new PublicKey(this.env.SQUADS_MULTISIG_ADDRESS);
            this.logger.log(`Squads Governance initialized for multisig: ${this.env.SQUADS_MULTISIG_ADDRESS}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize Squads governance', error instanceof Error ? error.stack : String(error));
            if (this.env.SOLANA_SYNC_ENABLED) {
                throw error instanceof Error ? error : new Error(String(error));
            }
        }
    }
    /**
     * Proposes a transaction to the Squads Multi-Sig vault.
     * Any institutional wallet sync or high-value movement should go through this flow when enabled.
     */
    async proposeTransaction(instructions, creator) {
        if (!this.multisigPda) {
            throw new Error('Squads Governance not initialized. Check your configuration.');
        }
        const multisig = await this.getMultisigModule();
        const creatorPubkey = creator.publicKey;
        const multisigInfo = await multisig.accounts.Multisig.fromAccountAddress(this.connection, this.multisigPda);
        // Transaction index is incremented each time a new proposal is created
        const transactionIndex = BigInt(multisigInfo.transactionIndex.toString()) + 1n;
        const [vaultPda] = multisig.getVaultPda({
            multisigPda: this.multisigPda,
            index: 1, // Default vault index
        });
        const latestBlockhash = await this.connection.getLatestBlockhash();
        const transactionMessage = new TransactionMessage({
            payerKey: vaultPda,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: instructions,
        });
        // 1. Create the Vault Transaction
        // feePayer signs the outer transaction to create the proposal on-chain
        await multisig.rpc.vaultTransactionCreate({
            connection: this.connection,
            feePayer: creator,
            multisigPda: this.multisigPda,
            transactionIndex,
            creator: creatorPubkey, // Use derived pubkey
            vaultIndex: 1,
            ephemeralSigners: 0,
            transactionMessage,
        });
        // 2. Create the Proposal
        await multisig.rpc.proposalCreate({
            connection: this.connection,
            feePayer: creator,
            rentPayer: creator,
            multisigPda: this.multisigPda,
            transactionIndex,
        });
        this.logger.log(`Created new Squads proposal. Index: ${transactionIndex}`);
        return transactionIndex;
    }
    /**
     * Wraps a single instruction into a Squads Proposal targeting the
     * SQUADS_MULTISIG_PDA configured in the environment.
     * Use this instead of executing instructions directly via a single keypair.
     */
    async createTransactionProposal(instruction) {
        return this.proposeTransaction([instruction], this.authoritySignerService.getSigner());
    }
    isEnabled() {
        return !!this.multisigPda;
    }
    async importMultisigModule() {
        return (await import('@sqds/multisig'));
    }
    async getMultisigModule() {
        if (this.multisigModule) {
            return this.multisigModule;
        }
        try {
            this.multisigModule = await this.importMultisigModule();
            return this.multisigModule;
        }
        catch (error) {
            const cause = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to load @sqds/multisig: ${cause}`);
        }
    }
};
SquadsService = SquadsService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AuthoritySignerService])
], SquadsService);
export { SquadsService };
//# sourceMappingURL=squads.service.js.map