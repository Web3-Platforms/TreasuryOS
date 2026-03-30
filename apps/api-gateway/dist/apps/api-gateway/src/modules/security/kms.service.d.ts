import { OnModuleInit } from '@nestjs/common';
export declare class KmsService implements OnModuleInit {
    private readonly logger;
    private signer;
    onModuleInit(): Promise<void>;
    signTransactions(transactions: any[]): Promise<any[]>;
    isEnabled(): boolean;
    getSigner(): any;
}
