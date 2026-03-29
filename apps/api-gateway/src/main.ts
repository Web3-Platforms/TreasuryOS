import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { loadApiGatewayEnv } from './config/env.js';

async function bootstrap() {
  const env = loadApiGatewayEnv();
  // Railway (and other PaaS providers) inject PORT at runtime and expect the
  // server to bind to it.  Fall back to the configured API_GATEWAY_PORT for
  // local development and Docker Compose.
  const port = process.env.PORT ? Number(process.env.PORT) : env.API_GATEWAY_PORT;

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

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  app.enableShutdownHooks();

  await app.listen(port);

  Logger.log(
    `API gateway listening on http://localhost:${port}/api/health`,
    'Bootstrap',
  );
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('Bootstrap');
  logger.error('API gateway failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});
