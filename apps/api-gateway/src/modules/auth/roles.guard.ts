import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type UserRole } from '@treasuryos/types';

import type { ApiRequest } from '../../common/http-request.js';
import { ROLES_KEY } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ApiRequest>();
    const currentRoles = request.currentUser?.roles ?? [];
    const allowed = currentRoles.some((role) => requiredRoles.includes(role));

    if (!allowed) {
      throw new ForbiddenException('Insufficient role assignment');
    }

    return allowed;
  }
}
