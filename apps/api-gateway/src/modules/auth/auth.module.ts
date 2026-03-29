import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

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
import { SupabaseStrategy } from './strategies/supabase.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    PlatformModule,
    PassportModule.register({ defaultStrategy: 'supabase' }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    UsersRepository,
    SessionsRepository,
    AuthenticationGuard,
    RolesGuard,
    SupabaseStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
  exports: [AuthService, AuthTokenService, PassportModule, JwtAuthGuard],
})
export class AuthModule {}
