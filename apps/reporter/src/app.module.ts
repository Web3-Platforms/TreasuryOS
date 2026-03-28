import { Module } from '@nestjs/common';

import { HealthController } from './common/health.controller.js';
import { MicaEngine } from './engines/mica.engine.js';
import { ReportScheduleService } from './scheduler/report-schedule.service.js';

@Module({
  controllers: [HealthController],
  providers: [MicaEngine, ReportScheduleService],
})
export class AppModule {}
