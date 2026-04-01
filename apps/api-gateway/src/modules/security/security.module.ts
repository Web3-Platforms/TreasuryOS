import { Module, Global } from '@nestjs/common';
import { AuthoritySignerService } from './authority-signer.service.js';

@Global()
@Module({
  providers: [AuthoritySignerService],
  exports: [AuthoritySignerService],
})
export class SecurityModule {}
