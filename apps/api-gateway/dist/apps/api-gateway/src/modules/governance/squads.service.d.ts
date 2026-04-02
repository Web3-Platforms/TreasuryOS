import { OnModuleInit } from '@nestjs/common';
import { Connection, PublicKey, TransactionMessage, TransactionInstruction, type Signer } from '@solana/web3.js';
import { AuthoritySignerService } from '../security/authority-signer.service.js';
type SquadsMultisigAccount = {
    transactionIndex: bigint | {
        toString(): string;
    };
};
type SquadsMultisigModule = {
    accounts: {
        Multisig: {
            fromAccountAddress(connection: Connection, address: PublicKey): Promise<SquadsMultisigAccount>;
        };
    };
    getVaultPda(args: {
        multisigPda: PublicKey;
        index: number;
    }): [PublicKey, number];
    rpc: {
        vaultTransactionCreate(args: {
            connection: Connection;
            feePayer: Signer;
            multisigPda: PublicKey;
            transactionIndex: bigint;
            creator: PublicKey;
            vaultIndex: number;
            ephemeralSigners: number;
            transactionMessage: TransactionMessage;
        }): Promise<unknown>;
        proposalCreate(args: {
            connection: Connection;
            feePayer: Signer;
            rentPayer: Signer;
            multisigPda: PublicKey;
            transactionIndex: bigint;
        }): Promise<unknown>;
    };
};
export declare class SquadsService implements OnModuleInit {
    private readonly authoritySignerService;
    private readonly logger;
    private readonly env;
    private connection;
    private multisigPda;
    private multisigModule;
    constructor(authoritySignerService: AuthoritySignerService);
    onModuleInit(): Promise<void>;
    /**
     * Proposes a transaction to the Squads Multi-Sig vault.
     * Any institutional wallet sync or high-value movement should go through this flow when enabled.
     */
    proposeTransaction(instructions: TransactionInstruction[], creator: Signer): Promise<bigint>;
    /**
     * Wraps a single instruction into a Squads Proposal targeting the
     * SQUADS_MULTISIG_PDA configured in the environment.
     * Use this instead of executing instructions directly via a single keypair.
     */
    createTransactionProposal(instruction: TransactionInstruction): Promise<bigint>;
    isEnabled(): boolean;
    protected importMultisigModule(): Promise<SquadsMultisigModule>;
    private getMultisigModule;
}
export {};
