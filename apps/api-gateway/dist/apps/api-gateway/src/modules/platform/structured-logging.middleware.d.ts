import { type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { ApiRequest } from '../../common/http-request.js';
export declare class StructuredLoggingMiddleware implements NestMiddleware {
    private readonly logger;
    use(request: ApiRequest, response: Response, next: NextFunction): void;
}
