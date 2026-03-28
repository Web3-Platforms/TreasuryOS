import { IsOptional, MaxLength } from 'class-validator';

export class EntityDecisionDto {
  @IsOptional()
  @MaxLength(4000)
  notes?: string;
}
