import { IsOptional, MaxLength } from 'class-validator';

export class WalletDecisionDto {
  @IsOptional()
  @MaxLength(4000)
  notes?: string;
}
