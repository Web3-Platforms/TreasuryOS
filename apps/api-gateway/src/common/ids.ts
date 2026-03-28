import { randomUUID } from 'node:crypto';

export function createResourceId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}
