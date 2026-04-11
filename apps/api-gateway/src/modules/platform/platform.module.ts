import { Module } from '@nestjs/common';

import { ObservabilityController } from './observability.controller.js';
import { ObservabilityService } from './observability.service.js';
import { RedisQueueService } from './redis-queue.service.js';
import { StructuredLoggingMiddleware } from './structured-logging.middleware.js';

@Module({
  controllers: [ObservabilityController],
  providers: [RedisQueueService, StructuredLoggingMiddleware, ObservabilityService],
  exports: [RedisQueueService, StructuredLoggingMiddleware],
})
export class PlatformModule {}
