import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    API_GATEWAY_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    JWT_SECRET: z.ZodString;
    JWT_EXPIRES_IN: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_API_BASE_URL: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ApiGatewayEnv = z.infer<typeof envSchema>;
export declare function loadApiGatewayEnv(env?: NodeJS.ProcessEnv): ApiGatewayEnv;
export {};
