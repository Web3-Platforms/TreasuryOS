import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadKycServiceEnv } from './config/env.js';
async function bootstrap() {
    const env = loadKycServiceEnv();
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    await app.listen(env.KYC_SERVICE_PORT);
    Logger.log(`KYC service listening on http://localhost:${env.KYC_SERVICE_PORT}/api/health`, 'Bootstrap');
}
bootstrap().catch((error) => {
    const logger = new Logger('Bootstrap');
    logger.error('KYC service failed to start', error instanceof Error ? error.stack : String(error));
    process.exit(1);
});
//# sourceMappingURL=main.js.map