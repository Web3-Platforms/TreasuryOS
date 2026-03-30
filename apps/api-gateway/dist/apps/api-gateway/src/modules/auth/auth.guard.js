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
import { Inject, Injectable, UnauthorizedException, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import { loadApiGatewayEnv } from '../../config/env.js';
import { UsersRepository } from './users.repository.js';
import { IS_PUBLIC_ROUTE } from './public.decorator.js';
let AuthenticationGuard = class AuthenticationGuard {
    reflector;
    usersRepository;
    env = loadApiGatewayEnv();
    constructor(reflector, usersRepository) {
        this.reflector = reflector;
        this.usersRepository = usersRepository;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_ROUTE, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractBearerToken(request);
        const secret = this.env.SUPABASE_JWT_SECRET;
        if (!secret) {
            throw new UnauthorizedException('SUPABASE_JWT_SECRET is not configured');
        }
        let payload;
        try {
            payload = jwt.verify(token, secret);
        }
        catch {
            throw new UnauthorizedException('Invalid or expired token');
        }
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid token payload');
        }
        const user = await this.usersRepository.findByEmail(payload.email);
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
    extractBearerToken(request) {
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
};
AuthenticationGuard = __decorate([
    Injectable(),
    __param(0, Inject(Reflector)),
    __param(1, Inject(UsersRepository)),
    __metadata("design:paramtypes", [Reflector,
        UsersRepository])
], AuthenticationGuard);
export { AuthenticationGuard };
//# sourceMappingURL=auth.guard.js.map