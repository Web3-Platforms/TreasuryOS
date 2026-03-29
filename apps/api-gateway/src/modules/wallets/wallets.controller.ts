import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import type { ApiRequest } from '../../common/http-request.js';
import { extractActor } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { WalletsService } from './wallets.service.js';
import { RequestWalletDto } from './dto/request-wallet.dto.js';
import { WalletDecisionDto } from './dto/wallet-decision.dto.js';

@Controller('wallets')
export class WalletsController {
  constructor(@Inject(WalletsService) private readonly walletsService: WalletsService) {}

  @Get()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  async listWallets(@Query() query: unknown) {
    return {
      wallets: await this.walletsService.listWallets(query),
    };
  }

  @Get(':walletId')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer, UserRole.Auditor)
  getWallet(@Param('walletId') walletId: string) {
    return this.walletsService.getWallet(walletId);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  requestWallet(@Body() body: RequestWalletDto, @Req() request: ApiRequest) {
    return this.walletsService.requestWallet(body, extractActor(request));
  }

  @Post(':walletId/review')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  reviewWallet(@Param('walletId') walletId: string, @Body() body: WalletDecisionDto, @Req() request: ApiRequest) {
    return this.walletsService.markUnderReview(walletId, body, extractActor(request));
  }

  @Post(':walletId/approve')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  approveWallet(@Param('walletId') walletId: string, @Body() body: WalletDecisionDto, @Req() request: ApiRequest) {
    return this.walletsService.approveWallet(walletId, body, extractActor(request));
  }

  @Post(':walletId/reject')
  @Roles(UserRole.Admin, UserRole.ComplianceOfficer)
  rejectWallet(@Param('walletId') walletId: string, @Body() body: WalletDecisionDto, @Req() request: ApiRequest) {
    return this.walletsService.rejectWallet(walletId, body, extractActor(request));
  }
}
