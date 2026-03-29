import { Body, Controller, HttpCode, Inject, Post, Req } from '@nestjs/common';

import type { ApiRequest } from '../../common/http-request.js';
import { Public } from './public.decorator.js';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto, @Req() request: ApiRequest) {
    return this.authService.login(body, this.extractContext(request));
  }

  private extractContext(request: ApiRequest) {
    return {
      ipAddress: request.ip ?? request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
    };
  }
}
