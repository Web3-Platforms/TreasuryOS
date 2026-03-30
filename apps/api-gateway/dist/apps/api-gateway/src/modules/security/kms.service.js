var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KmsService_1;
import { Injectable, Logger } from '@nestjs/common';
import { createAwsKmsSigner } from '@solana/keychain-aws-kms';
import { loadApiGatewayEnv } from '../../config/env.js';
let KmsService = KmsService_1 = class KmsService {
    logger = new Logger(KmsService_1.name);
    signer;
    async onModuleInit() {
        const env = loadApiGatewayEnv();
        if (env.SOLANA_SIGNING_MODE !== 'kms') {
            this.logger.log('Solana signing mode is set to filesystem. KMS is disabled.');
            return;
        }
        if (!env.AWS_KMS_KEY_ID || !env.AWS_REGION || !env.AWS_KMS_PUBLIC_KEY) {
            this.logger.error('AWS_KMS_KEY_ID, AWS_REGION or AWS_KMS_PUBLIC_KEY is missing. Cannot initialize KMS signer.');
            return;
        }
        try {
            this.signer = createAwsKmsSigner({
                keyId: env.AWS_KMS_KEY_ID,
                region: env.AWS_REGION,
                publicKey: env.AWS_KMS_PUBLIC_KEY, // The SDK wrapper will handle the conversion
            });
            this.logger.log(`KMS Signer initialized for key: ${env.AWS_KMS_KEY_ID}`);
        }
        catch (error) {
            this.logger.error('Failed to initialize AWS KMS Signer', error instanceof Error ? error.stack : String(error));
        }
    }
    async signTransactions(transactions) {
        if (!this.signer) {
            throw new Error('KMS Signer not initialized. Check your environment configuration.');
        }
        return await this.signer.signTransactions(transactions);
    }
    isEnabled() {
        return !!this.signer;
    }
    getSigner() {
        return this.signer;
    }
};
KmsService = KmsService_1 = __decorate([
    Injectable()
], KmsService);
export { KmsService };
//# sourceMappingURL=kms.service.js.map