import 'reflect-metadata';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { z } from 'zod';

import { AppModule } from './app.module.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../');

const envSchema = z.object({
  REPORTER_PORT: z.coerce.number().int().min(1).max(65535).default(3004),
});

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

    values[line.slice(0, separatorIndex).trim()] = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }

  return values;
}

async function bootstrap() {
  const env = envSchema.parse({
    ...loadDotEnvFile(path.join(repoRoot, '.env')),
    ...process.env,
  });
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  await app.listen(env.REPORTER_PORT);

  Logger.log(`Reporter listening on http://localhost:${env.REPORTER_PORT}/api/health`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Reporter failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
