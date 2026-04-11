import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { UserRole } from '@treasuryos/types';

import { extractActor, type ApiRequest } from '../../common/http-request.js';
import { Roles } from '../auth/roles.decorator.js';
import { ObservabilityService } from './observability.service.js';

@Controller('observability')
export class ObservabilityController {
  constructor(
    private readonly observabilityService: ObservabilityService,
  ) {}

  @Post('smoke')
  @HttpCode(200)
  @Roles(UserRole.Admin)
  sendBackendSmokeTest(@Req() request: ApiRequest) {
    return this.observabilityService.sendBackendSmokeTest({
      actor: extractActor(request),
      requestId: request.requestId,
    });
  }
}
