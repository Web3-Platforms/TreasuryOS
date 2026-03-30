var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, Logger } from '@nestjs/common';
import { createResourceId } from '../../common/ids.js';
let StructuredLoggingMiddleware = class StructuredLoggingMiddleware {
    logger = new Logger('Http');
    use(request, response, next) {
        const startedAt = process.hrtime.bigint();
        request.requestId = request.requestId ?? createResourceId('req');
        response.setHeader('x-request-id', request.requestId);
        response.on('finish', () => {
            const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
            this.logger.log(JSON.stringify({
                message: 'request.completed',
                method: request.method,
                path: request.originalUrl ?? request.url,
                statusCode: response.statusCode,
                durationMs: Number(durationMs.toFixed(2)),
                requestId: request.requestId,
                actorId: request.currentUser?.id ?? null,
                actorEmail: request.currentUser?.email ?? null,
                userAgent: request.headers['user-agent'] ?? null,
            }));
        });
        next();
    }
};
StructuredLoggingMiddleware = __decorate([
    Injectable()
], StructuredLoggingMiddleware);
export { StructuredLoggingMiddleware };
//# sourceMappingURL=structured-logging.middleware.js.map