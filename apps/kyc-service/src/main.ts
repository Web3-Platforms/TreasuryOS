import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { z } from 'zod';

import { AppModule } from './app.module.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Railway injects PORT; we check PORT first, then fall back to KYC_PORT.
  PORT: z.coerce.number().int().min(1).max(65535).optional(),
  KYC_PORT: z.coerce.number().int().min(1).max(65535).default(3002),
});

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

  const parsed = envSchema.parse(process.env);

  // Railway injects PORT; prefer it over KYC_PORT
  const listenPort = parsed.PORT ?? parsed.KYC_PORT;

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  await app.listen(listenPort);

  Logger.log(
    `[Bootstrap] KYC service listening on http://localhost:${listenPort}/api/health [${parsed.NODE_ENV}]`,
    'Bootstrap',
  );
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('KYC service failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
