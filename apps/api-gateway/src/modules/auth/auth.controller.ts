import { Body, Controller, Get, HttpCode, Inject, Post, Req, UnauthorizedException } from '@nestjs/common';

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

  @Get('me')
  getCurrentSession(@Req() request: ApiRequest) {
    return this.authService.getCurrentSession(this.requireSessionId(request), this.requireActor(request));
  }

  @Get('sessions')
  getSessions(@Req() request: ApiRequest) {
    return this.authService.listUserSessions(this.requireActor(request));
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Req() request: ApiRequest) {
    return this.authService.refresh(
      this.requireSessionId(request),
      this.requireActor(request),
      this.extractContext(request),
    );
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() request: ApiRequest) {
    return this.authService.logout(this.requireSessionId(request), this.requireActor(request));
  }

  private extractContext(request: ApiRequest) {
    return {
      ipAddress: request.ip ?? request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
    };
  }

  private requireActor(request: ApiRequest) {
    if (!request.currentUser) {
      throw new UnauthorizedException('Authenticated user missing from request');
    }

    return request.currentUser;
  }

  private requireSessionId(request: ApiRequest) {
    if (!request.authSessionId) {
      throw new UnauthorizedException('Authenticated session missing from request');
    }

    return request.authSessionId;
  }
}
