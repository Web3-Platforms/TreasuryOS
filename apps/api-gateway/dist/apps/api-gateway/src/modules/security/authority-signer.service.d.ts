import { OnModuleInit } from '@nestjs/common';
import type { Keypair } from '@solana/web3.js';
export type AuthoritySignerStatus = {
    configured: boolean;
    initialized: boolean;
    signingMode: 'filesystem' | 'environment';
    publicKey?: string;
    error?: string;
};
export declare class AuthoritySignerService implements OnModuleInit {
    private readonly logger;
    private readonly env;
    private signer;
    private signerInitializationError;
    onModuleInit(): void;
    isEnabled(): boolean;
    getStatus(): AuthoritySignerStatus;
    getSigner(): Keypair;
    private hasConfiguredSignerMaterial;
    private getMissingSignerMessage;
}
