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
import jwt from 'jsonwebtoken';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import { UserStatus } from '@treasuryos/types';
import { verifyPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { UsersRepository } from './users.repository.js';
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
let AuthService = class AuthService {
    usersRepository;
    auditService;
    queueService;
    constructor(usersRepository, auditService, queueService) {
        this.usersRepository = usersRepository;
        this.auditService = auditService;
        this.queueService = queueService;
    }
    async login(input, context) {
        const credentials = loginSchema.parse(input);
        const user = await this.usersRepository.findByEmail(credentials.email);
        if (!user || user.status !== UserStatus.Active) {
            await this.auditService.record({
                action: 'auth.login.failed',
                actorEmail: credentials.email.toLowerCase(),
                resourceType: 'user',
                resourceId: credentials.email.toLowerCase(),
                summary: 'Login rejected for unknown or inactive user',
                metadata: {
                    ipAddress: context.ipAddress ?? null,
                },
            });
            throw new UnauthorizedException('Invalid credentials');
        }
        if (!verifyPassword(credentials.password, user.passwordSalt, user.passwordHash)) {
            await this.auditService.record({
                action: 'auth.login.failed',
                actorId: user.id,
                actorEmail: user.email,
                resourceType: 'user',
                resourceId: user.id,
                summary: 'Login rejected because the password did not match',
                metadata: {
                    ipAddress: context.ipAddress ?? null,
                },
            });
            throw new UnauthorizedException('Invalid credentials');
        }
        const authenticatedUser = this.toAuthenticatedUser(user);
        const loginTimestamp = new Date().toISOString();
        await this.usersRepository.updateLastLoginAt(user.id, loginTimestamp);
        await this.auditService.record({
            action: 'auth.login.succeeded',
            actor: authenticatedUser,
            resourceType: 'user',
            resourceId: user.id,
            summary: 'User authenticated successfully',
            metadata: {
                ipAddress: context.ipAddress ?? null,
                userAgent: context.userAgent ?? null,
            },
        });
        const env = loadApiGatewayEnv();
        const accessToken = jwt.sign({ sub: authenticatedUser.id, email: authenticatedUser.email }, env.AUTH_TOKEN_SECRET, { algorithm: 'HS256', expiresIn: env.AUTH_TOKEN_TTL_MINUTES * 60 });
        return {
            accessToken,
            user: authenticatedUser,
        };
    }
    toAuthenticatedUser(user) {
        return {
            id: user.id,
            email: user.email,
            roles: user.roles,
        };
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, Inject(UsersRepository)),
    __param(1, Inject(AuditService)),
    __param(2, Inject(RedisQueueService)),
    __metadata("design:paramtypes", [UsersRepository,
        AuditService,
        RedisQueueService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map