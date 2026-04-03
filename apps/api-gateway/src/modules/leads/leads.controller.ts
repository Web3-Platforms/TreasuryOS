import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { Public } from '../auth/public.decorator.js';
import { LeadsService } from './leads.service.js';

class CreateLeadDto {
  full_name!: string;
  email!: string;
  organization!: string;
  message!: string;
}

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

    if (!full_name?.trim() || !email?.trim() || !organization?.trim() || !message?.trim()) {
      return { error: 'All fields are required.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { error: 'Please enter a valid email address.' };
    }

    await this.leadsService.createLead({ full_name, email, organization, message });
    return { success: true };
  }
}
