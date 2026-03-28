import type { AuthenticatedUser } from '@treasuryos/types';
import type { Request } from 'express';

export type ApiRequest = Request & {
  authSessionId?: string;
  currentUser?: AuthenticatedUser;
  requestId?: string;
};
