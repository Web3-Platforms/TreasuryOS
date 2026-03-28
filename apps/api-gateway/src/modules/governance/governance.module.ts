import { Module, Global } from '@nestjs/common';
import { SquadsService } from './squads.service.js';

@Global()
@Module({
  providers: [SquadsService],
  exports: [SquadsService],
})
export class GovernanceModule {}
