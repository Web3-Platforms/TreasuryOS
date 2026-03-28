import { Module, Global } from '@nestjs/common';
import { KmsService } from './kms.service.js';

@Global()
@Module({
  providers: [KmsService],
  exports: [KmsService],
})
export class SecurityModule {}
