import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../auth/public.decorator.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { LeadsService } from './leads.service.js';

@Controller('leads')
export class LeadsController {
  constructor(
    @Inject(LeadsService)
    private readonly leadsService: LeadsService,
  ) {}

  @Public()
  @Post()
  @HttpCode(201)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  async createLead(@Body() body: CreateLeadDto) {
    const { full_name, email, organization, message } = body;
    await this.leadsService.createLead({ full_name, email, organization, message });
    return { success: true };
  }
}
