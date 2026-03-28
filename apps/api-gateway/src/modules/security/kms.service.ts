import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createAwsKmsSigner } from '@solana/keychain-aws-kms';
import { KMSClient } from '@aws-sdk/client-kms';
import { loadApiGatewayEnv } from '../../config/env.js';

@Injectable()
export class KmsService implements OnModuleInit {
  private readonly logger = new Logger(KmsService.name);
  private signer: any;

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
        publicKey: env.AWS_KMS_PUBLIC_KEY as any, // The SDK wrapper will handle the conversion
      });

      this.logger.log(`KMS Signer initialized for key: ${env.AWS_KMS_KEY_ID}`);
    } catch (error) {
      this.logger.error('Failed to initialize AWS KMS Signer', error instanceof Error ? error.stack : String(error));
    }
  }

  async signTransactions(transactions: any[]): Promise<any[]> {
    if (!this.signer) {
      throw new Error('KMS Signer not initialized. Check your environment configuration.');
    }

    return await this.signer.signTransactions(transactions);
  }

  isEnabled(): boolean {
    return !!this.signer;
  }

  getSigner(): any {
    return this.signer;
  }
}
