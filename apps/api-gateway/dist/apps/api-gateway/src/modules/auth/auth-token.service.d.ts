import type { AuthenticatedUser, UserRole } from '@treasuryos/types';
type AccessTokenPayload = {
    email: string;
    exp: number;
    iat: number;
    jti: string;
    roles: UserRole[];
    sid: string;
    sub: string;
};
export declare class AuthTokenService {
    private readonly env;
    signToken(user: AuthenticatedUser, sessionId: string, tokenId: string, expiresAt: Date): string;
    verifyToken(token: string): AccessTokenPayload;
    private sign;
}
export {};
