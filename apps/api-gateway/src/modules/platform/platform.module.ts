import { Module } from '@nestjs/common';

import { RedisQueueService } from './redis-queue.service.js';
import { StructuredLoggingMiddleware } from './structured-logging.middleware.js';

@Module({
  providers: [RedisQueueService, StructuredLoggingMiddleware],
  exports: [RedisQueueService, StructuredLoggingMiddleware],
})
export class PlatformModule {}
