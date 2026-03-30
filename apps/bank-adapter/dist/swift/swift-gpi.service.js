var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SwiftGpiService_1;
import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';
function createUetr() {
    const bytes = crypto.randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
let SwiftGpiService = SwiftGpiService_1 = class SwiftGpiService {
    logger = new Logger(SwiftGpiService_1.name);
    async initiatePayment(payment) {
        const uetr = createUetr();
        this.logger.log(`Prepared SWIFT gpi payment ${uetr} for ${payment.beneficiaryName}`);
        return {
            uetr,
            payload: payment,
            status: 'prepared',
        };
    }
};
SwiftGpiService = SwiftGpiService_1 = __decorate([
    Injectable()
], SwiftGpiService);
export { SwiftGpiService };
//# sourceMappingURL=swift-gpi.service.js.map