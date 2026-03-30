import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../');
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Railway injects PORT; we check PORT first, then fall back to KYC_SERVICE_PORT.
    PORT: z.coerce.number().int().min(1).max(65535).optional(),
    KYC_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
    SUMSUB_APP_TOKEN: z.string().optional(),
    SUMSUB_SECRET_KEY: z.string().optional(),
    JUMIO_API_TOKEN: z.string().optional(),
    JUMIO_API_SECRET: z.string().optional(),
    JUMIO_WORKFLOW_ID: z.string().optional(),
    SOLANA_RPC_URL: z.string().url(),
    PROGRAM_ID_COMPLIANCE_REGISTRY: z.string().min(32),
});
function loadDotEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    const values = {};
    for (const rawLine of fs.readFileSync(filePath, 'utf8').split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) {
            continue;
        }
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
        values[key] = value;
    }
    return values;
}
export function loadKycServiceEnv(env = process.env) {
    // In production, env vars are injected by Railway — skip .env file loading
    const fileEnv = env.NODE_ENV === 'production' ? {} : loadDotEnvFile(path.join(repoRoot, '.env'));
    const parsed = envSchema.parse({
        ...fileEnv,
        ...env,
    });
    const { PORT, ...rest } = parsed;
    return {
        ...rest,
        // Railway injects PORT; prefer it over KYC_SERVICE_PORT
        LISTEN_PORT: PORT ?? parsed.KYC_SERVICE_PORT,
    };
}
//# sourceMappingURL=env.js.map