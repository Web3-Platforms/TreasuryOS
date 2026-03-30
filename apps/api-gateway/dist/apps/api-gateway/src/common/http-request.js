import { UnauthorizedException } from '@nestjs/common';
export function extractActor(request) {
    if (!request.currentUser) {
        throw new UnauthorizedException('Authenticated user missing from request');
    }
    return request.currentUser;
}
//# sourceMappingURL=http-request.js.map