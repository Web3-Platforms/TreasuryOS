var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthoritySignerService_1;
import { Injectable, Logger } from '@nestjs/common';
import { loadAuthorityKeypair, loadAuthorityKeypairFromJson, } from '@treasuryos/sdk';
import { loadApiGatewayEnv } from '../../config/env.js';
let AuthoritySignerService = AuthoritySignerService_1 = class AuthoritySignerService {
    logger = new Logger(AuthoritySignerService_1.name);
    env = loadApiGatewayEnv();
    signer = null;
    signerInitializationError = null;
    onModuleInit() {
        if (!this.hasConfiguredSignerMaterial()) {
            const message = this.getMissingSignerMessage();
            if (this.env.SOLANA_SYNC_ENABLED) {
                this.logger.error(message);
                throw new Error(message);
            }
            this.logger.log(message);
            return;
        }
        try {
            this.signer =
                this.env.SOLANA_SIGNING_MODE === 'environment'
                    ? loadAuthorityKeypairFromJson(this.env.AUTHORITY_KEYPAIR_JSON)
                    : loadAuthorityKeypair(this.env.AUTHORITY_KEYPAIR_PATH);
            this.signerInitializationError = null;
            this.logger.log(`Solana authority signer initialized using ${this.env.SOLANA_SIGNING_MODE} mode.`);
        }
        catch (error) {
            this.signer = null;
            this.signerInitializationError = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to initialize the Solana authority signer', error instanceof Error ? error.stack : String(error));
            if (this.env.SOLANA_SYNC_ENABLED) {
                throw error instanceof Error ? error : new Error(this.signerInitializationError);
            }
        }
    }
    isEnabled() {
        return this.signer !== null;
    }
    getStatus() {
        return {
            configured: this.hasConfiguredSignerMaterial(),
            initialized: this.signer !== null,
            signingMode: this.env.SOLANA_SIGNING_MODE,
            publicKey: this.signer?.publicKey.toBase58(),
            error: this.signerInitializationError ?? undefined,
        };
    }
    getSigner() {
        if (!this.signer) {
            throw new Error(this.env.SOLANA_SIGNING_MODE === 'environment'
                ? 'AUTHORITY_KEYPAIR_JSON is required when SOLANA_SIGNING_MODE is set to environment'
                : 'AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is set to filesystem');
        }
        return this.signer;
    }
    hasConfiguredSignerMaterial() {
        return this.env.SOLANA_SIGNING_MODE === 'environment'
            ? Boolean(this.env.AUTHORITY_KEYPAIR_JSON)
            : Boolean(this.env.AUTHORITY_KEYPAIR_PATH);
    }
    getMissingSignerMessage() {
        return this.env.SOLANA_SIGNING_MODE === 'environment'
            ? 'AUTHORITY_KEYPAIR_JSON is required when SOLANA_SIGNING_MODE is set to environment'
            : 'AUTHORITY_KEYPAIR_PATH is required when SOLANA_SIGNING_MODE is set to filesystem';
    }
};
AuthoritySignerService = AuthoritySignerService_1 = __decorate([
    Injectable()
], AuthoritySignerService);
export { AuthoritySignerService };
//# sourceMappingURL=authority-signer.service.js.map