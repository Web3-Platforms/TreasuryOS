import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class JumioProvider {
  private readonly logger = new Logger(JumioProvider.name);

  async initiateVerification(userId: string, userConsent: boolean) {
    if (!process.env.JUMIO_API_TOKEN || !process.env.JUMIO_API_SECRET || !process.env.JUMIO_WORKFLOW_ID) {
      throw new Error('Jumio credentials are not configured');
    }

    this.logger.log(`Initiating Jumio verification for ${userId}`);

    const response = await axios.post(
      'https://account.amer-1.jumio.ai/api/v1/accounts',
      {
        customerInternalReference: userId,
        userReference: userId,
        userConsent: { obtained: userConsent ? 'yes' : 'no' },
        workflowDefinition: { key: process.env.JUMIO_WORKFLOW_ID },
      },
      {
        auth: {
          username: process.env.JUMIO_API_TOKEN,
          password: process.env.JUMIO_API_SECRET,
        },
      },
    );

    return response.data;
  }
}
