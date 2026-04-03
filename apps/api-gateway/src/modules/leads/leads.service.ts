import { Inject, Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service.js';

interface LeadPayload {
  full_name: string;
  email: string;
  organization: string;
  message: string;
}

@Injectable()
export class LeadsService {
  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  async createLead(payload: LeadPayload): Promise<void> {
    const pool = this.databaseService.getPool();
    await pool.query(
      `INSERT INTO lead_contacts (full_name, email, organization, message)
       VALUES ($1, $2, $3, $4)`,
      [payload.full_name, payload.email, payload.organization, payload.message],
    );
  }
}
