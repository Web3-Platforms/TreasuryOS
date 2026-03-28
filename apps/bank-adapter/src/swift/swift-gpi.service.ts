import { Injectable, Logger } from '@nestjs/common';
import crypto from 'crypto';

export interface Iso20022Payment {
  amount: string;
  currency: string;
  beneficiaryIban: string;
  beneficiaryName: string;
}

function createUetr() {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

@Injectable()
export class SwiftGpiService {
  private readonly logger = new Logger(SwiftGpiService.name);

  async initiatePayment(payment: Iso20022Payment) {
    const uetr = createUetr();

    this.logger.log(`Prepared SWIFT gpi payment ${uetr} for ${payment.beneficiaryName}`);

    return {
      uetr,
      payload: payment,
      status: 'prepared',
    };
  }
}
