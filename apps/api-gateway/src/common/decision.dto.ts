import { IsOptional, MaxLength } from 'class-validator';

export class DecisionDto {
  @IsOptional()
  @MaxLength(4000)
  notes?: string;
}
