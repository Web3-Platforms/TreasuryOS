import { randomUUID } from 'node:crypto';
export function createResourceId(prefix) {
    return `${prefix}_${randomUUID()}`;
}
//# sourceMappingURL=ids.js.map