var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JwtAuthGuard_1;
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard extends AuthGuard('supabase') {
    reflector;
    logger = new Logger(JwtAuthGuard_1.name);
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const handler = context.getHandler();
        const classHandler = context.getClass();
        const request = context.switchToHttp().getRequest();
        const route = `${request.method} ${request.url}`;
        const path = request.url.split('?')[0]; // Remove query params
        // First, check if route is in our hardcoded public list
        const isRoutePublic = PUBLIC_ROUTES.some((publicRoute) => path.startsWith(publicRoute));
        if (isRoutePublic) {
            this.logger.log(`[JWT Guard] Skipping auth for public route: ${route}`);
            return true;
        }
        // Second, check for @Public() decorator using Reflector
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_ROUTE, [
            handler,
            classHandler,
        ]);
        if (isPublic) {
            this.logger.log(`[JWT Guard] Skipping auth for @Public() decorated route: ${route}`);
            return true;
        }
        this.logger.log(`[JWT Guard] Checking JWT for protected route: ${route}`);
        // Otherwise, use parent's authentication
        return super.canActivate(context);
    }
    handleRequest(err, user, info, context) {
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid or missing Supabase token');
        }
        const request = context.switchToHttp().getRequest();
        request.currentUser = user;
        return user;
    }
};
JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    Injectable(),
    __param(0, Inject(Reflector)),
    __metadata("design:paramtypes", [Reflector])
], JwtAuthGuard);
export { JwtAuthGuard };
//# sourceMappingURL=jwt-auth.guard.js.map