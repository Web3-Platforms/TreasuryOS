import 'reflect-metadata';

import * as Sentry from '@sentry/nestjs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { loadApiGatewayEnv, resolveApiGatewayCorsOrigins } from './config/env.js';

// Catch all uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// Catch all unhandled rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  process.exit(1);
});

async function bootstrap() {
  console.log('[Bootstrap] Starting...');
  const env = loadApiGatewayEnv();
  console.log('[Bootstrap] Environment loaded, LISTEN_PORT:', env.LISTEN_PORT, 'NODE_ENV:', env.NODE_ENV);

  // ── Sentry ─────────────────────────────────────────────────────────────
  // Initialised before NestFactory so bootstrap errors are also captured.
  if (env.SENTRY_DSN) {
    console.log('[Bootstrap] Initializing Sentry');
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      // Capture 100 % of transactions in production; tune down after baseline
      tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
    });
  }

  console.log('[Bootstrap] Creating NestFactory app');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  console.log('[Bootstrap] Configuring middleware and pipes');
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // ── CORS ─────────────────────────────────────────────────
  // In production, restrict to FRONTEND_URL (the Vercel deployment).
  // In development, allow localhost origins for convenience.
  const allowedOrigins = resolveApiGatewayCorsOrigins(env);

  console.log('[Bootstrap] Enabling CORS for origins:', allowedOrigins);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  console.log('[Bootstrap] Starting app listener on port', env.LISTEN_PORT);
  await app.listen(env.LISTEN_PORT);

  Logger.log(
    `API gateway listening on http://0.0.0.0:${env.LISTEN_PORT}/api/health [${env.NODE_ENV}]`,
    'Bootstrap',
  );
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('API gateway failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
