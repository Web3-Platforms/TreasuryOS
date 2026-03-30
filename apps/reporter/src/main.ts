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
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Railway injects PORT; we check PORT first, then fall back to REPORTER_PORT.
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
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
  // Global error handlers for uncaught exceptions
  process.on('uncaughtException', (err: Error) => {
    const logger = new Logger('UncaughtException');
    logger.error('Fatal error', err.stack);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const logger = new Logger('UnhandledRejection');
    logger.error('Unhandled rejection', reason instanceof Error ? reason.stack : String(reason));
    process.exit(1);
  });

  // In production, env vars are injected by Railway — skip .env file loading
  const fileEnv = process.env.NODE_ENV === 'production' ? {} : loadDotEnvFile(path.join(repoRoot, '.env'));

  const parsed = envSchema.parse({
    ...fileEnv,
    ...process.env,
  });

  // Railway injects PORT; prefer it over REPORTER_PORT
  const listenPort = parsed.PORT ?? parsed.REPORTER_PORT;

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  await app.listen(listenPort);

  Logger.log(`[Bootstrap] Reporter listening on http://localhost:${listenPort}/api/health [${parsed.NODE_ENV}]`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('Reporter failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
