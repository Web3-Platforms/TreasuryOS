import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import crypto from 'crypto';

@Injectable()
export class SumsubProvider {
  private readonly logger = new Logger(SumsubProvider.name);
  private readonly baseUrl = 'https://api.sumsub.com';

  async createApplicant(externalUserId: string, levelName: string) {
    if (!process.env.SUMSUB_APP_TOKEN || !process.env.SUMSUB_SECRET_KEY) {
      throw new Error('Sumsub credentials are not configured');
    }

    const endpoint = '/resources/applicants?levelName=' + encodeURIComponent(levelName);
    const body = JSON.stringify({ externalUserId });
    const headers = this.generateHeaders('POST', endpoint, body);

    this.logger.log(`Creating Sumsub applicant for ${externalUserId}`);

    const response = await axios.post(`${this.baseUrl}${endpoint}`, body, { headers });
    return response.data;
  }

  private generateHeaders(method: string, endpoint: string, body: string) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac('sha256', process.env.SUMSUB_SECRET_KEY!)
      .update(ts + method.toUpperCase() + endpoint + body)
      .digest('hex');

    return {
      'X-App-Token': process.env.SUMSUB_APP_TOKEN!,
      'X-App-Access-Sig': signature,
      'X-App-Access-Ts': ts,
      'Content-Type': 'application/json',
    };
  }
}
