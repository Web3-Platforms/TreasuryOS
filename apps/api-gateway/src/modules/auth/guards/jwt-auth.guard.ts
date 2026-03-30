import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '../public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    // Check if route is marked as public
    const handler = context.getHandler();
    const classHandler = context.getClass();

    // Use reflector to check for @Public() decorator
    // Try multiple methods for compatibility
    const reflectorAny = this.reflector as any;
    let isPublic = false;

    // Method 1: Try getAllAndOverride (NestJS v10+)
    if (typeof reflectorAny.getAllAndOverride === 'function') {
      try {
        isPublic = reflectorAny.getAllAndOverride(IS_PUBLIC_ROUTE, [handler, classHandler]) === true;
      } catch {
        // continue to next method
      }
    }

    // Method 2: Try get on handler
    if (!isPublic && typeof reflectorAny.get === 'function') {
      try {
        isPublic = reflectorAny.get(IS_PUBLIC_ROUTE, handler) === true;
      } catch {
        // continue
      }
    }

    // If marked as public, skip authentication entirely
    if (isPublic) {
      return true;
    }

    // Otherwise, use parent's authentication
    return super.canActivate(context);
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
