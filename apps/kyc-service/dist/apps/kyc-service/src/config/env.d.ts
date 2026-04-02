import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    KYC_SERVICE_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    SUMSUB_APP_TOKEN: z.ZodOptional<z.ZodString>;
    SUMSUB_SECRET_KEY: z.ZodOptional<z.ZodString>;
    JUMIO_API_TOKEN: z.ZodOptional<z.ZodString>;
    JUMIO_API_SECRET: z.ZodOptional<z.ZodString>;
    JUMIO_WORKFLOW_ID: z.ZodOptional<z.ZodString>;
    SOLANA_RPC_URL: z.ZodString;
    SOLANA_NETWORK: z.ZodDefault<z.ZodEnum<{
        devnet: "devnet";
        testnet: "testnet";
        "mainnet-beta": "mainnet-beta";
        custom: "custom";
    }>>;
    PROGRAM_ID_COMPLIANCE_REGISTRY: z.ZodString;
}, z.core.$strip>;
export type KycServiceEnv = Omit<z.infer<typeof envSchema>, 'PORT'> & {
    /** Resolved listen port: Railway PORT → KYC_SERVICE_PORT → 3002 */
    LISTEN_PORT: number;
};
export declare function loadKycServiceEnv(env?: NodeJS.ProcessEnv): KycServiceEnv;
export {};
