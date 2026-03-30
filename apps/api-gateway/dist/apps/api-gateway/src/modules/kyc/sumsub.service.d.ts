export declare class SumsubService {
    private readonly env;
    private readonly baseUrl;
    createApplicant(externalUserId: string): Promise<{
        applicantId: string;
        raw: {
            [x: string]: unknown;
            id?: string | undefined;
            applicantId?: string | undefined;
        };
    }>;
    verifyWebhook(rawBody: Buffer | undefined, headers: Record<string, string | string[] | undefined>): {
        digest: string;
        digestAlg: string;
        payload: {
            [x: string]: unknown;
            type: string;
            applicantId?: string | undefined;
            clientId?: string | undefined;
            correlationId?: string | undefined;
            createdAtMs?: string | undefined;
            externalUserId?: string | undefined;
            inspectionId?: string | undefined;
            levelName?: string | undefined;
            reviewResult?: {
                clientComment?: string | undefined;
                moderationComment?: string | undefined;
                rejectLabels?: string[] | undefined;
                reviewAnswer?: "GREEN" | "RED" | undefined;
            } | undefined;
            reviewStatus?: string | undefined;
            sandboxMode?: boolean | undefined;
        };
    };
    private createSignedHeaders;
    private readHeader;
}
