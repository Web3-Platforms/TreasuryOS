import { Module } from '@nestjs/common';

import { SumsubService } from './sumsub.service.js';

@Module({
  providers: [SumsubService],
  exports: [SumsubService],
})
export class SumsubModule {}
