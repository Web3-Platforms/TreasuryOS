import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
let cachedApp;
export default async function handler(req, res) {
    if (!cachedApp) {
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
                process.env.FRONTEND_URL,
            ].filter(Boolean),
            credentials: true,
        });
        app.setGlobalPrefix('api');
        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp(req, res);
}
//# sourceMappingURL=vercel.js.map