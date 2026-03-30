import { OnModuleInit } from '@nestjs/common';
import { TransactionInstruction } from '@solana/web3.js';
import { KmsService } from '../security/kms.service.js';
export declare class SquadsService implements OnModuleInit {
    private readonly kmsService;
    private readonly logger;
    private connection;
    private multisigPda;
    constructor(kmsService: KmsService);
    onModuleInit(): Promise<void>;
    /**
     * Proposes a transaction to the Squads Multi-Sig vault.
     * Any institutional wallet sync or high-value movement should go through this flow when enabled.
     */
    proposeTransaction(instructions: any[], creator: any): Promise<bigint>;
    /**
     * Wraps a single instruction into a Squads Proposal targeting the
     * SQUADS_MULTISIG_PDA configured in the environment.
     * Use this instead of executing instructions directly via a single keypair.
     */
    createTransactionProposal(instruction: TransactionInstruction): Promise<bigint>;
    isEnabled(): boolean;
}
