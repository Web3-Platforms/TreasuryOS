import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    KYC_SERVICE_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SUMSUB_APP_TOKEN: z.ZodOptional<z.ZodString>;
    SUMSUB_SECRET_KEY: z.ZodOptional<z.ZodString>;
    JUMIO_API_TOKEN: z.ZodOptional<z.ZodString>;
    JUMIO_API_SECRET: z.ZodOptional<z.ZodString>;
    JUMIO_WORKFLOW_ID: z.ZodOptional<z.ZodString>;
    SOLANA_RPC_URL: z.ZodString;
    PROGRAM_ID_COMPLIANCE_REGISTRY: z.ZodString;
}, z.core.$strip>;
export type KycServiceEnv = z.infer<typeof envSchema>;
export declare function loadKycServiceEnv(env?: NodeJS.ProcessEnv): KycServiceEnv;
export {};
