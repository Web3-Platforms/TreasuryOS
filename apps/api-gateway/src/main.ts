import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { loadApiGatewayEnv } from './config/env.js';

async function bootstrap() {
  const env = loadApiGatewayEnv();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // ── CORS ─────────────────────────────────────────────────
  // In production, restrict to FRONTEND_URL (the Vercel deployment).
  // In development, allow localhost origins for convenience.
  const allowedOrigins: string[] = [];

  if (env.NODE_ENV === 'production') {
    if (env.FRONTEND_URL) {
      allowedOrigins.push(env.FRONTEND_URL);
    }
  } else {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    if (env.FRONTEND_URL) {
      allowedOrigins.push(env.FRONTEND_URL);
    }
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

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
