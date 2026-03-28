import crypto from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser, UserRole } from '@treasuryos/types';

import { loadApiGatewayEnv } from '../../config/env.js';

type AccessTokenPayload = {
  email: string;
  exp: number;
  iat: number;
  jti: string;
  roles: UserRole[];
  sid: string;
  sub: string;
};

function encodeSegment(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function decodeSegment<T>(segment: string) {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8')) as T;
}

@Injectable()
export class AuthTokenService {
  private readonly env = loadApiGatewayEnv();

  signToken(user: AuthenticatedUser, sessionId: string, tokenId: string, expiresAt: Date) {
    const header = encodeSegment({
      alg: 'HS256',
      typ: 'TOT',
    });
    const payload = encodeSegment({
      sid: sessionId,
      sub: user.id,
      email: user.email,
      roles: user.roles,
      jti: tokenId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    } satisfies AccessTokenPayload);
    const signature = this.sign(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
  }

  verifyToken(token: string) {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      throw new UnauthorizedException('Invalid token format');
    }

    const expectedSignature = this.sign(`${header}.${payload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const decoded = decodeSegment<AccessTokenPayload>(payload);

    if (decoded.exp * 1000 <= Date.now()) {
      throw new UnauthorizedException('Token expired');
    }

    return decoded;
  }

  private sign(value: string) {
    return crypto
      .createHmac('sha256', this.env.AUTH_TOKEN_SECRET)
      .update(value)
      .digest('base64url');
  }
}
