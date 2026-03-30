var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Inject, Param, Post, Query, Req, } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { WalletsService } from './wallets.service.js';
import { RequestWalletDto } from './dto/request-wallet.dto.js';
import { WalletDecisionDto } from './dto/wallet-decision.dto.js';
let WalletsController = class WalletsController {
    walletsService;
    constructor(walletsService) {
        this.walletsService = walletsService;
    }
    async listWallets(query) {
        return {
            wallets: await this.walletsService.listWallets(query),
        };
    }
    getWallet(walletId) {
        return this.walletsService.getWallet(walletId);
    }
    requestWallet(body, request) {
        return this.walletsService.requestWallet(body, extractActor(request));
    }
    reviewWallet(walletId, body, request) {
        return this.walletsService.markUnderReview(walletId, body, extractActor(request));
    }
    approveWallet(walletId, body, request) {
        return this.walletsService.approveWallet(walletId, body, extractActor(request));
    }
    rejectWallet(walletId, body, request) {
        return this.walletsService.rejectWallet(walletId, body, extractActor(request));
    }
};
__decorate([
    Get(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WalletsController.prototype, "listWallets", null);
__decorate([
    Get(':walletId'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor),
    __param(0, Param('walletId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "getWallet", null);
__decorate([
    Post(),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Body()),
    __param(1, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestWalletDto, Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "requestWallet", null);
__decorate([
    Post(':walletId/review'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('walletId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, WalletDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "reviewWallet", null);
__decorate([
    Post(':walletId/approve'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('walletId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, WalletDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "approveWallet", null);
__decorate([
    Post(':walletId/reject'),
    Roles(UserRole.Admin, UserRole.ComplianceOfficer),
    __param(0, Param('walletId')),
    __param(1, Body()),
    __param(2, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, WalletDecisionDto, Object]),
    __metadata("design:returntype", void 0)
], WalletsController.prototype, "rejectWallet", null);
WalletsController = __decorate([
    Controller('wallets'),
    __param(0, Inject(WalletsService)),
    __metadata("design:paramtypes", [WalletsService])
], WalletsController);
export { WalletsController };
//# sourceMappingURL=wallets.controller.js.map