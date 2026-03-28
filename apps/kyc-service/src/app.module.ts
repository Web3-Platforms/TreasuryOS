import { Module } from '@nestjs/common';

import { HealthController } from './health.controller.js';
import { JumioProvider } from './providers/jumio.provider.js';
import { SumsubProvider } from './providers/sumsub.provider.js';
import { OnchainSyncService } from './sync/onchain-sync.service.js';

@Module({
  controllers: [HealthController],
  providers: [SumsubProvider, JumioProvider, OnchainSyncService],
})
export class AppModule {}
