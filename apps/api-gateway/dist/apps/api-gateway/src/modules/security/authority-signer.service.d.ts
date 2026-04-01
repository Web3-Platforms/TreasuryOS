import { OnModuleInit } from '@nestjs/common';
import type { Keypair } from '@solana/web3.js';
export declare class AuthoritySignerService implements OnModuleInit {
    private readonly logger;
    private readonly env;
    private signer;
    onModuleInit(): void;
    isEnabled(): boolean;
    getSigner(): Keypair;
    private hasConfiguredSignerMaterial;
}
