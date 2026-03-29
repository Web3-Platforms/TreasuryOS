import jwt from 'jsonwebtoken';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser, UserRecord } from '@treasuryos/types';
import { UserStatus } from '@treasuryos/types';

import { verifyPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { UsersRepository } from './users.repository.js';
import { LoginDto } from './dto/login.dto.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type RequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(RedisQueueService)
    private readonly queueService: RedisQueueService,
  ) {}

  async login(input: LoginDto, context: RequestContext) {
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
    const accessToken = jwt.sign(
      { sub: authenticatedUser.id, email: authenticatedUser.email },
      env.AUTH_TOKEN_SECRET,
      { algorithm: 'HS256', expiresIn: env.AUTH_TOKEN_TTL_MINUTES * 60 },
    );

    return {
      accessToken,
      user: authenticatedUser,
    };
  }

  private toAuthenticatedUser(user: UserRecord): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
}
