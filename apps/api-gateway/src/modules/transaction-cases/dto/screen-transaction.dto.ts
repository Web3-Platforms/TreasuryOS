import { Jurisdiction } from '@treasuryos/types';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ScreenTransactionDto {
  @IsNumber()
  @IsPositive()
  @Max(1_000_000_000)
  amount!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(24)
  asset: string = 'USDC';

  @IsString()
  @MinLength(32)
  @MaxLength(64)
  destinationWallet!: string;

  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsEnum(Jurisdiction)
  @IsOptional()
  jurisdiction?: Jurisdiction;

  @IsBoolean()
  @IsOptional()
  manualReviewRequested: boolean = false;

  @IsOptional()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  referenceId?: string;

  @IsString()
  @MinLength(32)
  @MaxLength(64)
  sourceWallet!: string;

  @IsOptional()
  @IsString()
  walletId?: string;
}
