import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';

import type { ApiRequest } from '../../common/http-request.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { UsersRepository } from './users.repository.js';
import { IS_PUBLIC_ROUTE } from './public.decorator.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
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

    const secret = this.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new UnauthorizedException('SUPABASE_JWT_SECRET is not configured');
    }

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, secret) as jwt.JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersRepository.findByEmail(payload.email as string);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

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
