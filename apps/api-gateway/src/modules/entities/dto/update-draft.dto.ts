import { Jurisdiction, RiskLevel } from '@treasuryos/types';
import { IsEnum, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateDraftDto {
  @IsEnum(Jurisdiction)
  @IsOptional()
  jurisdiction?: Jurisdiction;

  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  legalName?: string;

  @IsOptional()
  @MaxLength(4000)
  notes?: string;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;
}
