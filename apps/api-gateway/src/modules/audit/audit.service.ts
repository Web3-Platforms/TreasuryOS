import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser, AuditEventRecord } from '@treasuryos/types';

import { createResourceId } from '../../common/ids.js';
import { AuditRepository } from './audit.repository.js';

type AuditRecordInput = {
  action: string;
  actor?: AuthenticatedUser;
  actorEmail?: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  resourceId: string;
  resourceType: string;
  summary: string;
};

@Injectable()
export class AuditService {
  constructor(@Inject(AuditRepository) private readonly auditRepository: AuditRepository) {}

  async record(input: AuditRecordInput) {
    const event: AuditEventRecord = {
      id: createResourceId('audit'),
      actorId: input.actor?.id ?? input.actorId ?? 'system',
      actorEmail: input.actor?.email ?? input.actorEmail ?? 'system@treasuryos.local',
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      summary: input.summary,
      metadata: input.metadata,
      createdAt: new Date().toISOString(),
    };

    await this.auditRepository.insert(event);
    return event;
  }

  async listRecent(limit = 50) {
    return this.auditRepository.listRecent(Math.max(1, Math.min(limit, 250)));
  }
}
