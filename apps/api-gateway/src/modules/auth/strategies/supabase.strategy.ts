import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@treasuryos/types';

import { loadApiGatewayEnv } from '../../../config/env.js';
import { UsersRepository } from '../users.repository.js';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
  ) {
    const env = loadApiGatewayEnv();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.SUPABASE_JWT_SECRET || 'missing-supabase-secret',
    });
  }

  async validate(payload: any) {
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
}

