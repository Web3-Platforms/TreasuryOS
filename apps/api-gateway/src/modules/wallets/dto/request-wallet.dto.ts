import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class RequestWalletDto {
  @IsNotEmpty()
  @MinLength(1)
  entityId!: string;

  @IsOptional()
  @MaxLength(120)
  label?: string;

  @IsNotEmpty()
  @MinLength(32)
  @MaxLength(64)
  walletAddress!: string;
}
