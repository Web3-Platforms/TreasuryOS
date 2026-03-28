import { Jurisdiction, RiskLevel } from '@treasuryos/types';
import { IsEnum, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateEntityDto {
  @IsEnum(Jurisdiction)
  @IsNotEmpty()
  jurisdiction: Jurisdiction = Jurisdiction.EU;

  @MinLength(2)
  @MaxLength(200)
  @IsNotEmpty()
  legalName!: string;

  @IsOptional()
  @MaxLength(4000)
  notes?: string;

  @IsEnum(RiskLevel)
  @IsNotEmpty()
  riskLevel: RiskLevel = RiskLevel.Medium;
}
