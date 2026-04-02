import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { WalletsModule } from '../wallets/wallets.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [DatabaseModule, WalletsModule],
  controllers: [HealthController],
})
export class HealthModule {}
