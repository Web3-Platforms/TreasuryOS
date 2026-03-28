import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../../');

const envSchema = z.object({
  KYC_SERVICE_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
  SUMSUB_APP_TOKEN: z.string().optional(),
  SUMSUB_SECRET_KEY: z.string().optional(),
  JUMIO_API_TOKEN: z.string().optional(),
  JUMIO_API_SECRET: z.string().optional(),
  JUMIO_WORKFLOW_ID: z.string().optional(),
  SOLANA_RPC_URL: z.string().url(),
  PROGRAM_ID_COMPLIANCE_REGISTRY: z.string().min(32),
});

export type KycServiceEnv = z.infer<typeof envSchema>;

function loadDotEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const values: Record<string, string> = {};

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

export function loadKycServiceEnv(env: NodeJS.ProcessEnv = process.env): KycServiceEnv {
  return envSchema.parse({
    ...loadDotEnvFile(path.join(repoRoot, '.env')),
    ...env,
  });
}
