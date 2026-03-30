import { z } from 'zod';
export declare const rpcConfigSchema: z.ZodObject<{
    url: z.ZodString;
    network: z.ZodString;
    commitment: z.ZodEnum<{
        processed: "processed";
        confirmed: "confirmed";
        finalized: "finalized";
    }>;
}, z.core.$strip>;
export type RpcConfig = z.infer<typeof rpcConfigSchema>;
export declare function loadRpcConfig(env?: NodeJS.ProcessEnv): RpcConfig;
