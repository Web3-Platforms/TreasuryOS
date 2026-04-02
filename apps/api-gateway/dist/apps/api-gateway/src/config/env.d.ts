import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    API_GATEWAY_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    AUTH_TOKEN_SECRET: z.ZodString;
    AUTH_TOKEN_TTL_MINUTES: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    PILOT_REPORTS_DIR: z.ZodDefault<z.ZodString>;
    PILOT_INSTITUTION_ID: z.ZodDefault<z.ZodString>;
    PILOT_INSTITUTION_NAME: z.ZodDefault<z.ZodString>;
    PILOT_CUSTOMER_PROFILE: z.ZodDefault<z.ZodString>;
    PILOT_ALLOW_MANUAL_KYC_BYPASS: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    DEFAULT_ADMIN_EMAIL: z.ZodString;
    DEFAULT_ADMIN_PASSWORD: z.ZodString;
    DEFAULT_COMPLIANCE_EMAIL: z.ZodString;
    DEFAULT_COMPLIANCE_PASSWORD: z.ZodString;
    DEFAULT_AUDITOR_EMAIL: z.ZodString;
    DEFAULT_AUDITOR_PASSWORD: z.ZodString;
    DATABASE_URL: z.ZodDefault<z.ZodString>;
    DATABASE_SSL: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    REDIS_QUEUE_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    REDIS_QUEUE_NAME: z.ZodDefault<z.ZodString>;
    UPSTASH_REDIS_REST_URL: z.ZodOptional<z.ZodString>;
    UPSTASH_REDIS_REST_TOKEN: z.ZodOptional<z.ZodString>;
    FRONTEND_URL: z.ZodOptional<z.ZodString>;
    KYC_SUMSUB_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    SUMSUB_LEVEL_NAME: z.ZodDefault<z.ZodString>;
    SUMSUB_APP_TOKEN: z.ZodOptional<z.ZodString>;
    SUMSUB_SECRET_KEY: z.ZodOptional<z.ZodString>;
    SUMSUB_WEBHOOK_SECRET: z.ZodOptional<z.ZodString>;
    SOLANA_RPC_URL: z.ZodDefault<z.ZodString>;
    SOLANA_NETWORK: z.ZodDefault<z.ZodEnum<{
        custom: "custom";
        devnet: "devnet";
        testnet: "testnet";
        "mainnet-beta": "mainnet-beta";
    }>>;
    PROGRAM_ID_WALLET_WHITELIST: z.ZodString;
    AUTHORITY_KEYPAIR_PATH: z.ZodOptional<z.ZodString>;
    AUTHORITY_KEYPAIR_JSON: z.ZodOptional<z.ZodString>;
    SOLANA_SIGNING_MODE: z.ZodDefault<z.ZodEnum<{
        filesystem: "filesystem";
        environment: "environment";
    }>>;
    SQUADS_MULTISIG_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    SQUADS_MULTISIG_ADDRESS: z.ZodOptional<z.ZodString>;
    SOLANA_SYNC_ENABLED: z.ZodDefault<z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodBoolean>>;
    NEXT_PUBLIC_API_BASE_URL: z.ZodOptional<z.ZodString>;
    SUPABASE_JWT_SECRET: z.ZodOptional<z.ZodString>;
    SUPABASE_URL: z.ZodOptional<z.ZodString>;
    SUPABASE_SERVICE_KEY: z.ZodOptional<z.ZodString>;
    SUPABASE_STORAGE_BUCKET: z.ZodOptional<z.ZodString>;
    SENTRY_DSN: z.ZodOptional<z.ZodString>;
    RAILWAY_ENVIRONMENT: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiGatewayEnv = Omit<z.infer<typeof envSchema>, 'PILOT_REPORTS_DIR' | 'PORT'> & {
    PILOT_REPORTS_DIR: string;
    REPO_ROOT: string;
    /** Resolved listen port: Railway PORT → API_GATEWAY_PORT → 3001 */
    LISTEN_PORT: number;
};
export declare function loadApiGatewayEnv(env?: NodeJS.ProcessEnv): ApiGatewayEnv;
export {};
