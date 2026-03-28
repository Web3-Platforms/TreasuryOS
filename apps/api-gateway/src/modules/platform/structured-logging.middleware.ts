import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';

import { createResourceId } from '../../common/ids.js';
import type { ApiRequest } from '../../common/http-request.js';

@Injectable()
export class StructuredLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Http');

  use(request: ApiRequest, response: Response, next: NextFunction) {
    const startedAt = process.hrtime.bigint();
    request.requestId = request.requestId ?? createResourceId('req');
    response.setHeader('x-request-id', request.requestId);

    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      this.logger.log(
        JSON.stringify({
          message: 'request.completed',
          method: request.method,
          path: request.originalUrl ?? request.url,
          statusCode: response.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
          requestId: request.requestId,
          actorId: request.currentUser?.id ?? null,
          actorEmail: request.currentUser?.email ?? null,
          userAgent: request.headers['user-agent'] ?? null,
        }),
      );
    });

    next();
  }
}
