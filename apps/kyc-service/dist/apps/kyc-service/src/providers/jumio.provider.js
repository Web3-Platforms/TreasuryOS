var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var JumioProvider_1;
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
let JumioProvider = JumioProvider_1 = class JumioProvider {
    logger = new Logger(JumioProvider_1.name);
    async initiateVerification(userId, userConsent) {
        if (!process.env.JUMIO_API_TOKEN || !process.env.JUMIO_API_SECRET || !process.env.JUMIO_WORKFLOW_ID) {
            throw new Error('Jumio credentials are not configured');
        }
        this.logger.log(`Initiating Jumio verification for ${userId}`);
        const response = await axios.post('https://account.amer-1.jumio.ai/api/v1/accounts', {
            customerInternalReference: userId,
            userReference: userId,
            userConsent: { obtained: userConsent ? 'yes' : 'no' },
            workflowDefinition: { key: process.env.JUMIO_WORKFLOW_ID },
        }, {
            auth: {
                username: process.env.JUMIO_API_TOKEN,
                password: process.env.JUMIO_API_SECRET,
            },
        });
        return response.data;
    }
};
JumioProvider = JumioProvider_1 = __decorate([
    Injectable()
], JumioProvider);
export { JumioProvider };
//# sourceMappingURL=jumio.provider.js.map