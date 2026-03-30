var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loadApiGatewayEnv } from '../../config/env.js';
function encodeSegment(value) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
}
function decodeSegment(segment) {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
}
let AuthTokenService = class AuthTokenService {
    env = loadApiGatewayEnv();
    signToken(user, sessionId, tokenId, expiresAt) {
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
        });
        const signature = this.sign(`${header}.${payload}`);
        return `${header}.${payload}.${signature}`;
    }
    verifyToken(token) {
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) {
            throw new UnauthorizedException('Invalid token format');
        }
        const expectedSignature = this.sign(`${header}.${payload}`);
        const signatureBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (signatureBuffer.length !== expectedBuffer.length ||
            !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            throw new UnauthorizedException('Invalid token signature');
        }
        const decoded = decodeSegment(payload);
        if (decoded.exp * 1000 <= Date.now()) {
            throw new UnauthorizedException('Token expired');
        }
        return decoded;
    }
    sign(value) {
        return crypto
            .createHmac('sha256', this.env.AUTH_TOKEN_SECRET)
            .update(value)
            .digest('base64url');
    }
};
AuthTokenService = __decorate([
    Injectable()
], AuthTokenService);
export { AuthTokenService };
//# sourceMappingURL=auth-token.service.js.map