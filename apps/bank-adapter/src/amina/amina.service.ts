import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AminaService {
  private readonly logger = new Logger(AminaService.name);
  private readonly client: AxiosInstance;

  constructor() {
    const baseURL = process.env.AMINA_API_URL ?? 'https://api.aminabank.example/v1';
    this.client = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${process.env.AMINA_API_KEY ?? ''}`,
      },
      timeout: 10_000,
    });
  }

  async verifyCounterparty(walletAddress: string) {
    this.logger.log(`Verifying counterparty ${walletAddress} with AMINA`);

    if (!process.env.AMINA_API_KEY) {
      return {
        walletAddress,
        status: 'unconfigured',
        reason: 'AMINA_API_KEY is missing',
      };
    }

    const response = await this.client.get(`/compliance/counterparty/${walletAddress}`);
    return response.data;
  }
}
