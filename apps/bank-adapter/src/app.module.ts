import { Module } from '@nestjs/common';

import { AminaService } from './amina/amina.service.js';
import { HealthController } from './common/health.controller.js';
import { SwiftGpiService } from './swift/swift-gpi.service.js';

@Module({
  controllers: [HealthController],
  providers: [AminaService, SwiftGpiService],
})
export class AppModule {}
