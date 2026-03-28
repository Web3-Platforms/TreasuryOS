import { TransactionCaseStatus } from '@treasuryos/types';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListCasesQueryDto {
  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(250)
  limit: number = 50;

  @IsOptional()
  @IsEnum(TransactionCaseStatus)
  status?: TransactionCaseStatus;
}
