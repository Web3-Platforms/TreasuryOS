export interface Iso20022Payment {
    amount: string;
    currency: string;
    beneficiaryIban: string;
    beneficiaryName: string;
}
export declare class SwiftGpiService {
    private readonly logger;
    initiatePayment(payment: Iso20022Payment): Promise<{
        uetr: string;
        payload: Iso20022Payment;
        status: string;
    }>;
}
