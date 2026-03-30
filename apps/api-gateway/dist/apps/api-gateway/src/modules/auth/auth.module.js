var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
import { SupabaseStrategy } from './strategies/supabase.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    Module({
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
], AuthModule);
export { AuthModule };
//# sourceMappingURL=auth.module.js.map