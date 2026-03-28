import { Injectable, Logger } from '@nestjs/common';

import { MicaEngine } from '../engines/mica.engine.js';

@Injectable()
export class ReportScheduleService {
  private readonly logger = new Logger(ReportScheduleService.name);

  constructor(private readonly micaEngine: MicaEngine) {}

  async previewMonthlyMicaRun(month: string, institutionId: string) {
    const report = await this.micaEngine.generateMonthlyReport(month, institutionId);
    this.logger.log(`Generated MiCA preview for ${institutionId} for ${month}`);
    return report;
  }
}
