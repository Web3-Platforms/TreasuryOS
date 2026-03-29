import { UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from '@treasuryos/types';
import type { Request } from 'express';

export type ApiRequest = Request & {
  authSessionId?: string;
  currentUser?: AuthenticatedUser;
  requestId?: string;
};

export function extractActor(request: ApiRequest): AuthenticatedUser {
  if (!request.currentUser) {
    throw new UnauthorizedException('Authenticated user missing from request');
  }

  return request.currentUser;
}
