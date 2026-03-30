import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '../public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    // Support both getAllAndOverride (v10+) and get (older versions)
    let isPublic = false;

    const reflectorAny = this.reflector as any;
    if (reflectorAny.getAllAndOverride) {
      isPublic = reflectorAny.getAllAndOverride(IS_PUBLIC_ROUTE, [
        context.getHandler(),
        context.getClass(),
      ]);
    } else if (reflectorAny.get) {
      isPublic = reflectorAny.get(IS_PUBLIC_ROUTE, context.getHandler());
    }

    if (isPublic) {
      return true;
    }

    // Otherwise, perform JWT validation
    const result = await super.canActivate(context);
    return result as boolean;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing Supabase token');
    }

    const request = context.switchToHttp().getRequest();
    request.currentUser = user;

    return user;
  }
}
