import { ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_ROUTE } from '../public.decorator.js';

// List of routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/health',
  '/api/health/live',
  '/api/health/ready',
  '/health',
  '/favicon.ico',
];

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(@Inject(Reflector) private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): any {
    const handler = context.getHandler();
    const classHandler = context.getClass();
    const request = context.switchToHttp().getRequest();
    const route = `${request.method} ${request.url}`;
    const path = request.url.split('?')[0]; // Remove query params

    // First, check if route is in our hardcoded public list
    const isRoutePublic = PUBLIC_ROUTES.some((publicRoute) =>
      path.startsWith(publicRoute),
    );

    if (isRoutePublic) {
      this.logger.log(`[JWT Guard] Skipping auth for public route: ${route}`);
      return true;
    }

    // Second, check for @Public() decorator using Reflector
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      handler,
      classHandler,
    ]);

    if (isPublic) {
      this.logger.log(
        `[JWT Guard] Skipping auth for @Public() decorated route: ${route}`,
      );
      return true;
    }

    this.logger.log(`[JWT Guard] Checking JWT for protected route: ${route}`);

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
