var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SumsubProvider_1;
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import crypto from 'crypto';
let SumsubProvider = SumsubProvider_1 = class SumsubProvider {
    logger = new Logger(SumsubProvider_1.name);
    baseUrl = 'https://api.sumsub.com';
    async createApplicant(externalUserId, levelName) {
        if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
            throw new Error('Sumsub credentials are not configured');
        }
        const endpoint = '/resources/applicants?levelName=' + encodeURIComponent(levelName);
        const body = JSON.stringify({ externalUserId });
        const headers = this.generateHeaders('POST', endpoint, body);
        this.logger.log(`Creating Sumsub applicant for ${externalUserId}`);
        const response = await axios.post(`${this.baseUrl}${endpoint}`, body, { headers });
        return response.data;
    }
    generateHeaders(method, endpoint, body) {
        const ts = Math.floor(Date.now() / 1000).toString();
        const signature = crypto
            .createHmac('sha256', process.env.SUMSUB_SECRET_KEY)
            .update(ts + method.toUpperCase() + endpoint + body)
            .digest('hex');
        return {
            'X-App-Token': process.env.SUMSUB_APP_TOKEN,
            'X-App-Access-Sig': signature,
            'X-App-Access-Ts': ts,
            'Content-Type': 'application/json',
        };
    }
};
SumsubProvider = SumsubProvider_1 = __decorate([
    Injectable()
], SumsubProvider);
export { SumsubProvider };
//# sourceMappingURL=sumsub.provider.js.map