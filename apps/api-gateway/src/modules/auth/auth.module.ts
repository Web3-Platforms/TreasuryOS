import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuditModule } from '../audit/audit.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { PlatformModule } from '../platform/platform.module.js';
import { AuthController } from './auth.controller.js';
import { AuthenticationGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { AuthTokenService } from './auth-token.service.js';
import { RolesGuard } from './roles.guard.js';
import { UsersRepository } from './users.repository.js';
import { SessionsRepository } from './sessions.repository.js';

@Module({
  imports: [DatabaseModule, AuditModule, PlatformModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    UsersRepository,
    SessionsRepository,
    AuthenticationGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
  exports: [AuthService, AuthTokenService],
})
export class AuthModule {}
