import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadApiGatewayEnv } from './config/env.js';
async function bootstrap() {
    const env = loadApiGatewayEnv();
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    await app.listen(env.API_GATEWAY_PORT);
    Logger.log(`API gateway listening on http://localhost:${env.API_GATEWAY_PORT}/api/health`, 'Bootstrap');
}
bootstrap().catch((error) => {
    const logger = new Logger('Bootstrap');
    logger.error('API gateway failed to start', error instanceof Error ? error.stack : String(error));
    process.exit(1);
});
//# sourceMappingURL=main.js.map