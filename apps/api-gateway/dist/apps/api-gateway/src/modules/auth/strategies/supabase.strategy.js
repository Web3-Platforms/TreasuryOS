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
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@treasuryos/types';
import { loadApiGatewayEnv } from '../../../config/env.js';
import { UsersRepository } from '../users.repository.js';
let SupabaseStrategy = class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
    usersRepository;
    constructor(usersRepository) {
        const env = loadApiGatewayEnv();
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: env.AUTH_TOKEN_SECRET,
        });
        this.usersRepository = usersRepository;
    }
    async validate(payload) {
        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException('Invalid Supabase token payload');
        }
        const user = await this.usersRepository.findByEmail(payload.email);
        if (!user || user.status !== UserStatus.Active) {
            throw new UnauthorizedException('User is not registered or is inactive');
        }
        // Return the structure expected by request.currentUser
        return {
            id: user.id,
            email: user.email,
            roles: user.roles,
        };
    }
};
SupabaseStrategy = __decorate([
    Injectable(),
    __param(0, Inject(UsersRepository)),
    __metadata("design:paramtypes", [UsersRepository])
], SupabaseStrategy);
export { SupabaseStrategy };
//# sourceMappingURL=supabase.strategy.js.map