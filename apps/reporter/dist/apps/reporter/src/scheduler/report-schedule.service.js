var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReportScheduleService_1;
import { Injectable, Logger } from '@nestjs/common';
import { MicaEngine } from '../engines/mica.engine.js';
let ReportScheduleService = ReportScheduleService_1 = class ReportScheduleService {
    micaEngine;
    logger = new Logger(ReportScheduleService_1.name);
    constructor(micaEngine) {
        this.micaEngine = micaEngine;
    }
    async previewMonthlyMicaRun(month, institutionId) {
        const report = await this.micaEngine.generateMonthlyReport(month, institutionId);
        this.logger.log(`Generated MiCA preview for ${institutionId} for ${month}`);
        return report;
    }
};
ReportScheduleService = ReportScheduleService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [MicaEngine])
], ReportScheduleService);
export { ReportScheduleService };
//# sourceMappingURL=report-schedule.service.js.map