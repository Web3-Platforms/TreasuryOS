import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string) {
  const actualBuffer = Buffer.from(scryptSync(password, salt, 64).toString('base64url'));
  const expectedBuffer = Buffer.from(expectedHash);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
