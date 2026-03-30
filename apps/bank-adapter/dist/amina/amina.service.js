var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AminaService_1;
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
let AminaService = AminaService_1 = class AminaService {
    logger = new Logger(AminaService_1.name);
    client;
    constructor() {
        const baseURL = process.env.AMINA_API_URL ?? 'https://api.aminabank.example/v1';
        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: `Bearer ${process.env.AMINA_API_KEY ?? ''}`,
            },
            timeout: 10_000,
        });
    }
    async verifyCounterparty(walletAddress) {
        this.logger.log(`Verifying counterparty ${walletAddress} with AMINA`);
        if (!process.env.AMINA_API_KEY) {
            return {
                walletAddress,
                status: 'unconfigured',
                reason: 'AMINA_API_KEY is missing',
            };
        }
        const response = await this.client.get(`/compliance/counterparty/${walletAddress}`);
        return response.data;
    }
};
AminaService = AminaService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], AminaService);
export { AminaService };
//# sourceMappingURL=amina.service.js.map