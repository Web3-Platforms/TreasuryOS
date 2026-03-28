import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import type { AuthenticatedUser, SessionRecord, UserRecord } from '@treasuryos/types';
import { UserStatus } from '@treasuryos/types';

import { createResourceId } from '../../common/ids.js';
import { verifyPassword } from '../../common/passwords.js';
import { loadApiGatewayEnv } from '../../config/env.js';
import { AuditService } from '../audit/audit.service.js';
import { RedisQueueService } from '../platform/redis-queue.service.js';
import { AuthTokenService } from './auth-token.service.js';
import { UsersRepository } from './users.repository.js';
import { SessionsRepository } from './sessions.repository.js';
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
  private readonly env = loadApiGatewayEnv();

  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(SessionsRepository)
    private readonly sessionsRepository: SessionsRepository,
    @Inject(AuditService)
    private readonly auditService: AuditService,
    @Inject(RedisQueueService)
    private readonly queueService: RedisQueueService,
    @Inject(AuthTokenService)
    private readonly tokenService: AuthTokenService,
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
    const session = this.createSession(authenticatedUser, context);

    await this.usersRepository.updateLastLoginAt(user.id, session.createdAt);
    await this.sessionsRepository.save(session);

    const accessToken = this.tokenService.signToken(
      authenticatedUser,
      session.id,
      session.tokenId,
      new Date(session.expiresAt),
    );

    await this.auditService.record({
      action: 'auth.login.succeeded',
      actor: authenticatedUser,
      resourceType: 'session',
      resourceId: session.id,
      summary: 'User logged into the pilot control plane',
      metadata: {
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
    });
    await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
      type: 'auth.session.created',
      sessionId: session.id,
      userId: authenticatedUser.id,
    });

    return {
      accessToken,
      expiresAt: session.expiresAt,
      session: this.serializeSession(session),
      user: authenticatedUser,
    };
  }

  async refresh(currentSessionId: string, actor: AuthenticatedUser, context: RequestContext) {
    const session = await this.requireActiveSession(currentSessionId, actor.id);
    const refreshedAt = new Date();
    const expiresAt = this.computeExpiry(refreshedAt);
    const tokenId = createResourceId('token');

    const updatedSession: SessionRecord = {
      ...session,
      tokenId,
      expiresAt: expiresAt.toISOString(),
      lastSeenAt: refreshedAt.toISOString(),
      ipAddress: context.ipAddress ?? session.ipAddress,
      userAgent: context.userAgent ?? session.userAgent,
    };

    await this.sessionsRepository.save(updatedSession);

    const accessToken = this.tokenService.signToken(actor, updatedSession.id, tokenId, expiresAt);
    await this.auditService.record({
      action: 'auth.token.refreshed',
      actor,
      resourceType: 'session',
      resourceId: updatedSession.id,
      summary: 'Session token was refreshed',
    });
    await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
      type: 'auth.session.refreshed',
      sessionId: updatedSession.id,
      userId: actor.id,
    });

    return {
      accessToken,
      expiresAt: updatedSession.expiresAt,
      session: this.serializeSession(updatedSession),
      user: actor,
    };
  }

  async logout(currentSessionId: string, actor: AuthenticatedUser) {
    const session = await this.requireActiveSession(currentSessionId, actor.id);
    const revokedAt = new Date().toISOString();

    await this.sessionsRepository.save({
      ...session,
      revokedAt,
      lastSeenAt: revokedAt,
    });

    await this.auditService.record({
      action: 'auth.logout',
      actor,
      resourceType: 'session',
      resourceId: currentSessionId,
      summary: 'Session was explicitly logged out',
    });
    await this.queueService.enqueue(this.env.REDIS_QUEUE_NAME, {
      type: 'auth.session.revoked',
      sessionId: currentSessionId,
      userId: actor.id,
    });

    return {
      success: true,
      revokedAt,
    };
  }

  async getCurrentSession(currentSessionId: string, actor: AuthenticatedUser) {
    const session = await this.requireActiveSession(currentSessionId, actor.id);

    return {
      session: this.serializeSession(session),
      user: actor,
    };
  }

  async listUserSessions(actor: AuthenticatedUser) {
    const rawSessions = await this.sessionsRepository.findActiveByUserId(actor.id);
    const sessions = rawSessions.map((session) => this.serializeSession(session));

    return {
      sessions,
      user: actor,
    };
  }

  private createSession(user: AuthenticatedUser, context: RequestContext): SessionRecord {
    const now = new Date();
    return {
      id: createResourceId('session'),
      userId: user.id,
      tokenId: createResourceId('token'),
      createdAt: now.toISOString(),
      expiresAt: this.computeExpiry(now).toISOString(),
      lastSeenAt: now.toISOString(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    };
  }

  private computeExpiry(reference: Date) {
    return new Date(reference.getTime() + this.env.AUTH_TOKEN_TTL_MINUTES * 60_000);
  }

  private async requireActiveSession(sessionId: string, userId: string) {
    const session = await this.sessionsRepository.findById(sessionId);

    if (!session || session.userId !== userId) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.revokedAt) {
      throw new UnauthorizedException('Session revoked');
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    return session;
  }

  private serializeSession(session: SessionRecord) {
    return {
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress ?? null,
      lastSeenAt: session.lastSeenAt,
      revokedAt: session.revokedAt ?? null,
      userAgent: session.userAgent ?? null,
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
