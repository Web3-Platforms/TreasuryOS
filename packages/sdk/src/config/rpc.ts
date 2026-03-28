import { z } from 'zod';

export const rpcConfigSchema = z.object({
  url: z.string().url(),
  network: z.string().min(1),
  commitment: z.enum(['processed', 'confirmed', 'finalized']),
});

export type RpcConfig = z.infer<typeof rpcConfigSchema>;

export function loadRpcConfig(env: NodeJS.ProcessEnv = process.env): RpcConfig {
  return rpcConfigSchema.parse({
    url: env.SOLANA_RPC_URL,
    network: env.SOLANA_NETWORK ?? 'devnet',
    commitment: 'confirmed',
  });
}
