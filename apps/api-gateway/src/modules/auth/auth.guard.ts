import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { ApiRequest } from '../../common/http-request.js';
import { UsersRepository } from './users.repository.js';
import { SessionsRepository } from './sessions.repository.js';
import { AuthTokenService } from './auth-token.service.js';
import { IS_PUBLIC_ROUTE } from './public.decorator.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(AuthTokenService)
    private readonly tokenService: AuthTokenService,
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(SessionsRepository)
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ApiRequest>();
    const token = this.extractBearerToken(request);
    const payload = this.tokenService.verifyToken(token);
    const user = await this.usersRepository.findById(payload.sub);
    const session = await this.sessionsRepository.findById(payload.sid);

    if (!user || !session || session.tokenId !== payload.jti) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    request.authSessionId = session.id;
    request.currentUser = {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };

    return true;
  }

  private extractBearerToken(request: ApiRequest) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Expected Bearer token');
    }

    return token;
  }
}
